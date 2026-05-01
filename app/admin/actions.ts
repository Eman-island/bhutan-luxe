"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PIPELINE_STAGES, type ActivityEntry, type InquiryRow } from "@/lib/concierge";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const STAGE_IDS: Set<string> = new Set(PIPELINE_STAGES.map((s) => s.id));

async function getActor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, actor: user?.email ?? null };
}

export async function updateInquiryStatus(id: string, nextStatus: string) {
  if (!STAGE_IDS.has(nextStatus)) {
    return { ok: false, error: "Invalid status" };
  }
  const { supabase, actor } = await getActor();
  const { data: existing, error: readError } = await supabase
    .from("inquiries")
    .select("id, status, person_id")
    .eq("id", id)
    .single();
  if (readError || !existing) {
    return { ok: false, error: "Inquiry not found" };
  }
  if (existing.status === nextStatus) {
    return { ok: true };
  }
  const { error: updateError } = await supabase
    .from("inquiries")
    .update({ status: nextStatus })
    .eq("id", id);
  if (updateError) {
    return { ok: false, error: updateError.message };
  }
  await supabase.from("activity_log").insert({
    inquiry_id: id,
    person_id: existing.person_id,
    action: "status_changed",
    details: { from: existing.status, to: nextStatus },
    actor_email: actor,
  });
  revalidatePath("/admin");
  return { ok: true };
}

export interface UpdateInquiryFields {
  person_name?: string;
  person_phone?: string;
  person_city?: string;
  tier?: string;
  travel_window?: string;
  group_size?: number | null;
  notes?: string;
  affiliate_id?: string | null;
  deal_value_cents?: number | null;
}

export async function updateInquiry(
  id: string,
  fields: UpdateInquiryFields,
) {
  const { supabase, actor } = await getActor();
  const { data: existing, error: readError } = await supabase
    .from("inquiries")
    .select("id, person_id, affiliate_id, tier, travel_window, group_size, notes, deal_value_cents")
    .eq("id", id)
    .single();
  if (readError || !existing) {
    return { ok: false, error: "Inquiry not found" };
  }

  // Person update (name, phone, city) — only if any provided
  const personUpdate: Record<string, unknown> = {};
  if (fields.person_name !== undefined) personUpdate.name = fields.person_name.trim() || null;
  if (fields.person_phone !== undefined) personUpdate.phone = fields.person_phone.trim() || null;
  if (fields.person_city !== undefined) personUpdate.city = fields.person_city.trim() || null;
  if (Object.keys(personUpdate).length && existing.person_id) {
    const { error } = await supabase
      .from("people")
      .update(personUpdate)
      .eq("id", existing.person_id);
    if (error) return { ok: false, error: error.message };
  }

  // Inquiry update
  const inquiryUpdate: Record<string, unknown> = {};
  const tierIsValidOrEmpty =
    fields.tier === undefined ||
    fields.tier === "" ||
    ["luxe", "boutique-luxe", "ultra-luxe", "bespoke"].includes(fields.tier);
  if (!tierIsValidOrEmpty) return { ok: false, error: "Invalid tier" };
  if (fields.tier !== undefined) inquiryUpdate.tier = fields.tier || null;
  if (fields.travel_window !== undefined) inquiryUpdate.travel_window = fields.travel_window.trim() || null;
  if (fields.group_size !== undefined) inquiryUpdate.group_size = fields.group_size;
  if (fields.notes !== undefined) inquiryUpdate.notes = fields.notes.trim() || null;
  if (fields.affiliate_id !== undefined) inquiryUpdate.affiliate_id = fields.affiliate_id;
  if (fields.deal_value_cents !== undefined) inquiryUpdate.deal_value_cents = fields.deal_value_cents;

  if (Object.keys(inquiryUpdate).length) {
    const { error } = await supabase
      .from("inquiries")
      .update(inquiryUpdate)
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    // Activity log: capture diffs
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (fields.tier !== undefined && fields.tier !== existing.tier) {
      changes.tier = { from: existing.tier, to: fields.tier || null };
    }
    if (fields.travel_window !== undefined && fields.travel_window.trim() !== existing.travel_window) {
      changes.travel_window = { from: existing.travel_window, to: fields.travel_window.trim() || null };
    }
    if (fields.group_size !== undefined && fields.group_size !== existing.group_size) {
      changes.group_size = { from: existing.group_size, to: fields.group_size };
    }
    if (fields.affiliate_id !== undefined && fields.affiliate_id !== existing.affiliate_id) {
      changes.affiliate_id = { from: existing.affiliate_id, to: fields.affiliate_id };
    }
    if (fields.deal_value_cents !== undefined && fields.deal_value_cents !== existing.deal_value_cents) {
      changes.deal_value_cents = { from: existing.deal_value_cents, to: fields.deal_value_cents };
    }
    if (Object.keys(changes).length) {
      await supabase.from("activity_log").insert({
        inquiry_id: id,
        person_id: existing.person_id,
        action: "edited",
        details: { changes },
        actor_email: actor,
      });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/affiliates");
  return { ok: true };
}

export async function addInquiryNote(id: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Note cannot be empty" };
  if (trimmed.length > 2000) {
    return { ok: false, error: "Note too long (2000 char max)" };
  }
  const { supabase, actor } = await getActor();
  const { data: existing, error: readError } = await supabase
    .from("inquiries")
    .select("id, person_id")
    .eq("id", id)
    .single();
  if (readError || !existing) {
    return { ok: false, error: "Inquiry not found" };
  }
  const { error: insertError } = await supabase.from("activity_log").insert({
    inquiry_id: id,
    person_id: existing.person_id,
    action: "note",
    details: { text: trimmed },
    actor_email: actor,
  });
  if (insertError) return { ok: false, error: insertError.message };
  revalidatePath("/admin");
  return { ok: true };
}

export interface InquiryDetail {
  inquiry: InquiryRow;
  activity: ActivityEntry[];
}

export async function getInquiryDetail(
  id: string,
): Promise<{ ok: boolean; data?: InquiryDetail; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: inquiry, error: e1 } = await supabase
    .from("inquiries_with_person")
    .select("*")
    .eq("id", id)
    .single();
  if (e1 || !inquiry) {
    return { ok: false, error: e1?.message ?? "Not found" };
  }
  const { data: activity, error: e2 } = await supabase
    .from("activity_log")
    .select("*")
    .eq("inquiry_id", id)
    .order("created_at", { ascending: true });
  if (e2) {
    return { ok: false, error: e2.message };
  }
  return {
    ok: true,
    data: {
      inquiry: inquiry as InquiryRow,
      activity: (activity ?? []) as ActivityEntry[],
    },
  };
}

export interface ManualInquiryInput {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  tier?: string;
  travelWindow?: string;
  groupSize?: number | null;
  notes?: string;
  source?: string;
  status?: string;
}

export async function createManualInquiry(input: ManualInquiryInput) {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  if (!name || !email) return { ok: false, error: "Name and email required" };

  const status = input.status && STAGE_IDS.has(input.status) ? input.status : "new_lead";
  const { supabase, actor } = await getActor();

  // Upsert person
  const { data: personRow, error: personError } = await supabase
    .from("people")
    .upsert(
      {
        email,
        name,
        phone: input.phone || null,
        city: input.city || null,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();
  if (personError || !personRow) {
    return { ok: false, error: personError?.message ?? "Could not save contact" };
  }

  // Generate ref
  const refCode = `BL-${new Date().getFullYear()}-${String(
    Math.floor(1000 + Math.random() * 9000),
  )}`;

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .insert({
      person_id: personRow.id,
      type: "inquiry",
      tier: input.tier || null,
      travel_window: input.travelWindow || null,
      group_size: input.groupSize ?? null,
      notes: input.notes || null,
      source: input.source || "manual",
      ref_code: refCode,
      status,
    })
    .select("id")
    .single();
  if (inquiryError || !inquiry) {
    return { ok: false, error: inquiryError?.message ?? "Could not save inquiry" };
  }

  await supabase.from("activity_log").insert({
    inquiry_id: inquiry.id,
    person_id: personRow.id,
    action: "manual_create",
    details: { source: input.source || "manual" },
    actor_email: actor,
  });

  revalidatePath("/admin");
  return { ok: true, id: inquiry.id, refCode };
}
