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
