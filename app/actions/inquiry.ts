"use server";

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

  // TODO(post-MVP): persist to Supabase `inquiries` table
  // TODO(post-MVP): notify Eric via Resend (eric@bhutan-luxe.com) with WhatsApp click-to-chat link
  console.log("[inquiry]", JSON.stringify({ ts: new Date().toISOString(), ...payload }));

  return { ok: true };
}
