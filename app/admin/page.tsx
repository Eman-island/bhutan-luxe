import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConciergeDashboard } from "./_components/dashboard";
import type { InquiryRow } from "@/lib/concierge";

export const dynamic = "force-dynamic";

export default async function ConciergePage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries_with_person")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: 56 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>
          Inquiries
        </h1>
        <p style={{ color: "var(--crimson)", marginTop: 12 }}>
          Could not load: {error.message}
        </p>
      </div>
    );
  }

  return <ConciergeDashboard inquiries={(data ?? []) as InquiryRow[]} />;
}
