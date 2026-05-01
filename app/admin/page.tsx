import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatusSelect } from "./_components/status-select";

export const dynamic = "force-dynamic";

interface InquiryRow {
  id: string;
  ref_code: string | null;
  name: string;
  email: string;
  phone: string | null;
  tier: string | null;
  travel_window: string | null;
  group_size: number | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const TIER_LABEL: Record<string, string> = {
  luxe: "Luxe",
  "boutique-luxe": "Boutique-Luxe",
  "ultra-luxe": "Ultra-Luxe",
  bespoke: "Bespoke",
};

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AdminInquiriesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, ref_code, name, email, phone, tier, travel_window, group_size, notes, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1>Inquiries</h1>
        <p style={{ color: "#C41E3A" }}>Could not load inquiries: {error.message}</p>
      </div>
    );
  }

  const rows = (data ?? []) as InquiryRow[];

  return (
    <div>
      <div className="inquiry-toolbar">
        <h1>Inquiries</h1>
        <span className="count">
          {rows.length} {rows.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="inquiry-empty">
          No inquiries yet. The form on the public site will populate this list.
        </div>
      ) : (
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Inquirer</th>
              <th>Tier</th>
              <th>Window / Group</th>
              <th>Notes</th>
              <th>Received</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="ref">{r.ref_code ?? "—"}</td>
                <td>
                  <span className="name">{r.name}</span>
                  <span className="email">{r.email}</span>
                  {r.phone ? <span className="email">{r.phone}</span> : null}
                </td>
                <td>
                  {r.tier && TIER_LABEL[r.tier] ? (
                    <span className="tier-pill">{TIER_LABEL[r.tier]}</span>
                  ) : (
                    <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                  )}
                </td>
                <td>
                  {r.travel_window || (
                    <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                  )}
                  <span className="meta-line">
                    {r.group_size
                      ? `${r.group_size} ${r.group_size === 1 ? "guest" : "guests"}`
                      : "Group size not specified"}
                  </span>
                </td>
                <td className="notes">
                  {r.notes || (
                    <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                  )}
                </td>
                <td className="when">{formatWhen(r.created_at)}</td>
                <td>
                  <StatusSelect id={r.id} initial={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
