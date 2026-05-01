import "../globals.css";
import "./admin.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata = {
  title: "Admin · Bhutan-Luxe",
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
    // Login page renders bare (middleware also redirects unauthed away from non-login paths).
    return <div className="admin-body">{children}</div>;
  }

  return (
    <div className="admin-body admin-shell">
      <header className="admin-header">
        <span className="admin-brand">Bhutan-Luxe Admin</span>
        <div className="admin-meta">
          <span className="admin-user">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="admin-signout">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
