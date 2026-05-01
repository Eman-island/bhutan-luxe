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

function generateRefCode(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `BL-${year}-${seq}`;
}

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

  const refCode = generateRefCode();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      name: payload.name,
      email: payload.email.toLowerCase(),
      phone: payload.phone || null,
      tier: payload.tier || null,
      travel_window: payload.travelWindow || null,
      group_size: payload.groupSize ? Number(payload.groupSize) : null,
      notes: payload.notes || null,
      ref_code: refCode,
      source: "website",
    })
    .select("id, ref_code")
    .single();

  if (error) {
    console.error("[inquiry-insert-failed]", { error, email: payload.email });
    return {
      ok: false,
      error:
        "We couldn't save your inquiry. Please try again, or email Rare.Bhutan@bhutan-luxe.com directly.",
    };
  }

  console.log("[inquiry-saved]", {
    id: data?.id,
    ref: data?.ref_code,
    tier: payload.tier,
    email: payload.email,
  });

  // TODO(post-MVP): notify Eric via Resend at eric@bhutan-luxe.com with WhatsApp
  // click-to-chat link (https://wa.me/<buyer-phone>) once Resend is wired.

  return { ok: true, refCode: data?.ref_code ?? refCode };
}
