import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConciergeDashboard } from "./_components/dashboard";
import type { Affiliate, InquiryRow } from "@/lib/concierge";

export const dynamic = "force-dynamic";

export default async function ConciergePage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: inquiries, error: inquiriesError }, { data: affiliates }] = await Promise.all([
    supabase
      .from("inquiries_with_person")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("affiliates")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  if (inquiriesError) {
    return (
      <div style={{ padding: 56 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>
          Inquiries
        </h1>
        <p style={{ color: "var(--crimson)", marginTop: 12 }}>
          Could not load: {inquiriesError.message}
        </p>
      </div>
    );
  }

  return (
    <ConciergeDashboard
      inquiries={(inquiries ?? []) as InquiryRow[]}
      affiliates={(affiliates ?? []) as Affiliate[]}
    />
  );
}
