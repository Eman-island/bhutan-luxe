import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type AffiliateWithStats,
  PARTNER_TYPE_LABEL,
  formatUSD,
} from "@/lib/concierge";

export const dynamic = "force-dynamic";

export default async function AffiliatesListPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("affiliates_with_stats")
    .select("*")
    .order("commission_total_cents", { ascending: false });

  const rows = (data ?? []) as AffiliateWithStats[];
  const totals = rows.reduce(
    (acc, r) => {
      acc.referrals += Number(r.referrals_total ?? 0);
      acc.pending += Number(r.commission_pending_cents ?? 0);
      acc.paid += Number(r.commission_paid_cents ?? 0);
      return acc;
    },
    { referrals: 0, pending: 0, paid: 0 },
  );

  return (
    <>
      <header className="dashboard-header">
        <span className="label">The Concierge</span>
        <h1>
          Affiliates · <em>partners</em>
        </h1>
        <div className="summary-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="summary-card is-total">
            <span className="k">Active partners</span>
            <span className="v">{rows.filter((r) => r.active).length}</span>
          </div>
          <div className="summary-card">
            <span className="k">Total referrals</span>
            <span className="v">{totals.referrals}</span>
          </div>
          <div className="summary-card">
            <span className="k">Commission pending</span>
            <span className="v" style={{ fontSize: 28 }}>
              {formatUSD(totals.pending)}
            </span>
          </div>
          <div className="summary-card">
            <span className="k">Commission paid</span>
            <span className="v" style={{ fontSize: 28 }}>
              {formatUSD(totals.paid)}
            </span>
          </div>
        </div>
      </header>

      <div className="concierge-toolbar">
        <span style={{ fontSize: 11, color: "rgba(59,58,54,0.5)", letterSpacing: "0.06em" }}>
          {rows.length} {rows.length === 1 ? "affiliate" : "affiliates"} on file
        </span>
        <Link href="/admin/affiliates/new" className="btn-saffron" style={{ textDecoration: "none" }}>
          + New Affiliate
        </Link>
      </div>

      <div className="concierge-list">
        {error ? (
          <p style={{ color: "var(--crimson)" }}>Could not load: {error.message}</p>
        ) : rows.length === 0 ? (
          <div className="concierge-empty">
            No affiliates yet. Add the first concierge or wealth manager who refers clients.
          </div>
        ) : (
          <table className="concierge-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Partner</th>
                <th>Type</th>
                <th>Referrals</th>
                <th>Pending</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ cursor: "default" }}>
                  <td>
                    <Link
                      href={`/admin/affiliates/${r.id}`}
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        color: "var(--crimson)",
                        textDecoration: "none",
                      }}
                    >
                      {r.code}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/affiliates/${r.id}`}
                      style={{ color: "inherit", textDecoration: "none" }}
                    >
                      <div className="name">{r.name}</div>
                      {r.organization ? (
                        <span className="email">{r.organization}</span>
                      ) : null}
                      {r.contact_email ? (
                        <span className="email">{r.contact_email}</span>
                      ) : null}
                    </Link>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: "rgba(59,58,54,0.7)" }}>
                      {PARTNER_TYPE_LABEL[r.partner_type] ?? r.partner_type}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 10,
                        color: "rgba(59,58,54,0.45)",
                        letterSpacing: "0.06em",
                        marginTop: 2,
                      }}
                    >
                      {r.default_commission_pct}% default
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                      {r.referrals_total}
                    </span>
                    {r.referrals_won > 0 ? (
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          color: "var(--forest)",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginTop: 2,
                        }}
                      >
                        {r.referrals_won} won
                      </span>
                    ) : null}
                  </td>
                  <td style={{ fontFamily: "'Playfair Display', serif", color: "var(--saffron)" }}>
                    {formatUSD(r.commission_pending_cents)}
                  </td>
                  <td style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest)" }}>
                    {formatUSD(r.commission_paid_cents)}
                  </td>
                  <td>
                    {r.active ? (
                      <span className="stage-badge stage-won">Active</span>
                    ) : (
                      <span className="stage-badge stage-lost">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
