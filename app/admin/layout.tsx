import "../globals.css";
import "./concierge.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sidebar } from "./_components/sidebar";

export const metadata = {
  title: "The Concierge · Bhutan-Luxe",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Login page — bare frame, no sidebar.
    return <div className="concierge-body">{children}</div>;
  }

  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .neq("status", "lost");

  return (
    <div className="concierge-body concierge-shell">
      <Sidebar userEmail={user.email ?? ""} inquiryCount={count ?? 0} />
      <main className="concierge-main">{children}</main>
    </div>
  );
}
