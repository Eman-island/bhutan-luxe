"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PARTNER_TYPE_OPTIONS } from "@/lib/concierge";

const PARTNER_TYPES: Set<string> = new Set(PARTNER_TYPE_OPTIONS.map((p) => p.id));

async function getActor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, actor: user?.email ?? null };
}

export interface AffiliateInput {
  code: string;
  name: string;
  partner_type: string;
  organization?: string;
  contact_email?: string;
  contact_phone?: string;
  default_commission_pct?: number;
  active?: boolean;
  notes?: string;
}

function validate(input: AffiliateInput): string | null {
  if (!input.code?.trim()) return "Code is required";
  if (!input.name?.trim()) return "Name is required";
  if (!PARTNER_TYPES.has(input.partner_type)) return "Invalid partner type";
  const pct = input.default_commission_pct ?? 10;
  if (pct < 0 || pct > 50) return "Commission must be between 0 and 50%";
  return null;
}

export async function createAffiliate(input: AffiliateInput) {
  const error = validate(input);
  if (error) return { ok: false, error };
  const { supabase } = await getActor();
  const { data, error: dbError } = await supabase
    .from("affiliates")
    .insert({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      partner_type: input.partner_type,
      organization: input.organization?.trim() || null,
      contact_email: input.contact_email?.trim().toLowerCase() || null,
      contact_phone: input.contact_phone?.trim() || null,
      default_commission_pct: input.default_commission_pct ?? 10,
      active: input.active ?? true,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (dbError || !data) {
    return { ok: false, error: dbError?.message ?? "Could not save affiliate" };
  }
  revalidatePath("/admin/affiliates");
  return { ok: true, id: data.id };
}

export async function updateAffiliate(id: string, input: AffiliateInput) {
  const error = validate(input);
  if (error) return { ok: false, error };
  const { supabase } = await getActor();
  const { error: dbError } = await supabase
    .from("affiliates")
    .update({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      partner_type: input.partner_type,
      organization: input.organization?.trim() || null,
      contact_email: input.contact_email?.trim().toLowerCase() || null,
      contact_phone: input.contact_phone?.trim() || null,
      default_commission_pct: input.default_commission_pct ?? 10,
      active: input.active ?? true,
      notes: input.notes?.trim() || null,
    })
    .eq("id", id);
  if (dbError) return { ok: false, error: dbError.message };
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${id}`);
  return { ok: true };
}

export async function toggleAffiliateActive(id: string, active: boolean) {
  const { supabase } = await getActor();
  const { error } = await supabase
    .from("affiliates")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/affiliates");
  revalidatePath(`/admin/affiliates/${id}`);
  return { ok: true };
}

export async function deleteAffiliate(id: string) {
  const { supabase } = await getActor();
  const { error } = await supabase.from("affiliates").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/affiliates");
  redirect("/admin/affiliates");
}

export interface CommissionInput {
  inquiry_id?: string | null;
  gross_cents: number;
  commission_pct: number;
  notes?: string;
}

export async function addCommission(affiliateId: string, input: CommissionInput) {
  if (input.gross_cents <= 0) return { ok: false, error: "Gross must be positive" };
  if (input.commission_pct < 0 || input.commission_pct > 50) {
    return { ok: false, error: "Commission must be between 0 and 50%" };
  }
  const commissionCents = Math.round(
    (input.gross_cents * input.commission_pct) / 100,
  );
  const { supabase } = await getActor();
  const { error } = await supabase.from("affiliate_commissions").insert({
    affiliate_id: affiliateId,
    inquiry_id: input.inquiry_id || null,
    status: "pending",
    gross_cents: input.gross_cents,
    commission_pct: input.commission_pct,
    commission_cents: commissionCents,
    notes: input.notes?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/affiliates/${affiliateId}`);
  revalidatePath("/admin/affiliates");
  return { ok: true };
}

export async function cancelCommission(commissionId: string, affiliateId: string) {
  const { supabase } = await getActor();
  const { error } = await supabase
    .from("affiliate_commissions")
    .update({ status: "cancelled" })
    .eq("id", commissionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/affiliates/${affiliateId}`);
  revalidatePath("/admin/affiliates");
  return { ok: true };
}

export interface PayoutInput {
  amount_cents: number;
  method?: string;
  reference?: string;
  paid_at?: string;
  notes?: string;
  commission_ids?: string[];
}

export async function recordPayout(affiliateId: string, input: PayoutInput) {
  if (input.amount_cents <= 0) {
    return { ok: false, error: "Amount must be positive" };
  }
  const { supabase } = await getActor();
  const paidAt = input.paid_at ? new Date(input.paid_at).toISOString() : new Date().toISOString();

  const { data: payout, error: payoutError } = await supabase
    .from("affiliate_payouts")
    .insert({
      affiliate_id: affiliateId,
      amount_cents: input.amount_cents,
      method: input.method?.trim() || null,
      reference: input.reference?.trim() || null,
      paid_at: paidAt,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  if (payoutError || !payout) {
    return { ok: false, error: payoutError?.message ?? "Could not save payout" };
  }

  // Mark selected commissions as paid
  if (input.commission_ids?.length) {
    const { error: updateError } = await supabase
      .from("affiliate_commissions")
      .update({ status: "paid", payout_id: payout.id })
      .in("id", input.commission_ids);
    if (updateError) {
      return { ok: false, error: updateError.message };
    }
  }

  revalidatePath(`/admin/affiliates/${affiliateId}`);
  revalidatePath("/admin/affiliates");
  return { ok: true, payoutId: payout.id };
}
