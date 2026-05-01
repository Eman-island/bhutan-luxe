"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface InquiryPayload {
  name: string;
  email: string;
  phone: string;
  tier: string;
  travelWindow: string;
  groupSize: string;
  notes: string;
}

export interface InquiryResult {
  ok: boolean;
  error?: string;
  refCode?: string;
}

const ALLOWED_TIERS = new Set([
  "luxe",
  "boutique-luxe",
  "ultra-luxe",
  "bespoke",
  "",
]);

export async function submitInquiry(
  formData: FormData,
): Promise<InquiryResult> {
  const payload: InquiryPayload = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    tier: String(formData.get("tier") ?? "").trim(),
    travelWindow: String(formData.get("window") ?? "").trim(),
    groupSize: String(formData.get("group") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };

  if (!payload.name || !payload.email) {
    return { ok: false, error: "Name and email are required." };
  }
  if (!ALLOWED_TIERS.has(payload.tier)) {
    return { ok: false, error: "Please choose a tier." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("submit_inquiry", {
    p_name: payload.name,
    p_email: payload.email.toLowerCase(),
    p_phone: payload.phone || null,
    p_tier: payload.tier || null,
    p_travel_window: payload.travelWindow || null,
    p_group_size: payload.groupSize ? Number(payload.groupSize) : null,
    p_notes: payload.notes || null,
    p_type: "inquiry",
    p_source: "website",
    p_ref_code: null,
  });

  if (error) {
    console.error("[inquiry-rpc-failed]", { error, email: payload.email });
    return {
      ok: false,
      error:
        "We couldn't save your inquiry. Please try again, or email concierge@bhutan-luxe.com directly.",
    };
  }

  // RPC returns table; supabase-js returns array. Pick first row.
  const row = Array.isArray(data) ? data[0] : data;
  const refCode: string | undefined = row?.ref_code;

  console.log("[inquiry-saved]", {
    inquiry_id: row?.inquiry_id,
    ref: refCode,
    tier: payload.tier,
    email: payload.email,
  });

  // TODO(post-MVP): notify Eric via Resend at concierge@bhutan-luxe.com
  // (forwards to eric@bhutan-luxe.com) with a wa.me/<buyer-phone> click-to-chat
  // link in the body.

  return { ok: true, refCode };
}
