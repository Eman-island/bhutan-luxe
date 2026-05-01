import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AffiliateForm } from "../_components/affiliate-form";
import { ActiveToggle } from "../_components/active-toggle";
import { CommissionForm } from "../_components/commission-form";
import { PayoutForm } from "../_components/payout-form";
import { StageBadge, TierBadge } from "../../_components/badges";
import {
  type Affiliate,
  type AffiliateCommission,
  type AffiliatePayout,
  type InquiryRow,
  PARTNER_TYPE_LABEL,
  formatUSD,
  formatDate,
} from "@/lib/concierge";

export const dynamic = "force-dynamic";

export default async function AffiliateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !affiliate) notFound();

  const [{ data: inquiries }, { data: commissions }, { data: payouts }] =
    await Promise.all([
      supabase
        .from("inquiries_with_person")
        .select("*")
        .eq("affiliate_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("affiliate_commissions")
        .select("*")
        .eq("affiliate_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("affiliate_payouts")
        .select("*")
        .eq("affiliate_id", id)
        .order("paid_at", { ascending: false }),
    ]);

  const inquiryRows = (inquiries ?? []) as InquiryRow[];
  const commissionRows = (commissions ?? []) as AffiliateCommission[];
  const payoutRows = (payouts ?? []) as AffiliatePayout[];
  const a = affiliate as Affiliate;

  const totals = commissionRows.reduce(
    (acc, c) => {
      const cents = Number(c.commission_cents);
      if (c.status === "pending") acc.pending += cents;
      else if (c.status === "paid") acc.paid += cents;
      return acc;
    },
    { pending: 0, paid: 0 },
  );

  const pendingForPayout = commissionRows.filter((c) => c.status === "pending");

  return (
    <>
      <header className="dashboard-header">
        <Link
          href="/admin/affiliates"
          className="label"
          style={{ color: "var(--gold)", textDecoration: "none", marginBottom: 8, display: "inline-block" }}
        >
          ← Affiliates
        </Link>
        <h1>
          <span style={{ color: "var(--gold)" }}>{a.code}</span> · <em>{a.name}</em>
        </h1>
        <div style={{ display: "flex", gap: 28, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(247,245,240,0.7)", letterSpacing: "0.04em" }}>
            {PARTNER_TYPE_LABEL[a.partner_type] ?? a.partner_type}
            {a.organization ? ` · ${a.organization}` : ""}
          </span>
          <ActiveToggle id={a.id} initial={a.active} />
        </div>

        <div className="summary-grid" style={{ marginTop: 28, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <div className="summary-card is-total">
            <span className="k">Referrals</span>
            <span className="v">{inquiryRows.length}</span>
          </div>
          <div className="summary-card">
            <span className="k">Won</span>
            <span className="v">
              {inquiryRows.filter((i) => i.status === "won").length}
            </span>
          </div>
          <div className="summary-card">
            <span className="k">Pending</span>
            <span className="v" style={{ fontSize: 28 }}>
              {formatUSD(totals.pending)}
            </span>
          </div>
          <div className="summary-card">
            <span className="k">Paid</span>
            <span className="v" style={{ fontSize: 28 }}>
              {formatUSD(totals.paid)}
            </span>
          </div>
        </div>
      </header>

      <div className="concierge-list" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Edit affiliate */}
        <section className="affiliate-section">
          <header className="section-head">
            <span className="label">Affiliate details</span>
          </header>
          <div className="affiliate-form-shell">
            <AffiliateForm mode="edit" initial={a} />
          </div>
        </section>

        {/* Referred inquiries */}
        <section className="affiliate-section">
          <header className="section-head">
            <span className="label">Referred inquiries</span>
            <span className="count-line">
              {inquiryRows.length} total · {inquiryRows.filter((i) => i.status === "won").length} won
            </span>
          </header>
          {inquiryRows.length === 0 ? (
            <p className="muted-line">No inquiries yet from this affiliate.</p>
          ) : (
            <table className="concierge-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Inquirer</th>
                  <th>Tier</th>
                  <th>Window</th>
                  <th>Deal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiryRows.map((i) => (
                  <tr key={i.id} style={{ cursor: "default" }}>
                    <td className="ref">{i.ref_code ?? "—"}</td>
                    <td>
                      <div className="name">{i.person_name ?? "Unknown"}</div>
                      <span className="email">{i.person_email ?? ""}</span>
                    </td>
                    <td>
                      <TierBadge tier={i.tier} />
                    </td>
                    <td className="meta-line">
                      {i.travel_window || (
                        <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                      )}
                    </td>
                    <td>
                      {i.deal_value_cents ? (
                        <span style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest)" }}>
                          {formatUSD(i.deal_value_cents)}
                        </span>
                      ) : (
                        <span style={{ color: "rgba(59,58,54,0.35)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <StageBadge stage={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Commission ledger */}
        <section className="affiliate-section">
          <header className="section-head">
            <span className="label">Commission ledger</span>
            <CommissionForm
              affiliateId={a.id}
              defaultPct={a.default_commission_pct}
              inquiries={inquiryRows.map((i) => ({
                id: i.id,
                ref_code: i.ref_code,
                person_name: i.person_name,
                tier: i.tier,
                status: i.status,
              }))}
            />
          </header>
          {commissionRows.length === 0 ? (
            <p className="muted-line">No commissions recorded yet.</p>
          ) : (
            <table className="concierge-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Inquiry</th>
                  <th>Deal value</th>
                  <th>Rate</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {commissionRows.map((c) => {
                  const inquiry = inquiryRows.find((i) => i.id === c.inquiry_id);
                  return (
                    <tr key={c.id} style={{ cursor: "default" }}>
                      <td className="when">{formatDate(c.created_at)}</td>
                      <td>
                        {inquiry ? (
                          <>
                            <span className="ref">{inquiry.ref_code ?? "—"}</span>
                            <span
                              className="email"
                              style={{ display: "block", fontSize: 11, marginTop: 2 }}
                            >
                              {inquiry.person_name}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                        )}
                      </td>
                      <td style={{ fontFamily: "'Playfair Display', serif" }}>
                        {formatUSD(c.gross_cents)}
                      </td>
                      <td style={{ fontSize: 12, color: "rgba(59,58,54,0.7)" }}>
                        {c.commission_pct}%
                      </td>
                      <td
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color:
                            c.status === "paid"
                              ? "var(--forest)"
                              : c.status === "cancelled"
                                ? "rgba(59,58,54,0.4)"
                                : "var(--saffron)",
                        }}
                      >
                        {formatUSD(c.commission_cents)}
                      </td>
                      <td>
                        <span className={`stage-badge stage-${c.status === "paid" ? "won" : c.status === "cancelled" ? "lost" : "new_lead"}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {/* Payouts */}
        <section className="affiliate-section">
          <header className="section-head">
            <span className="label">Payouts</span>
            <PayoutForm
              affiliateId={a.id}
              pendingCommissions={pendingForPayout}
            />
          </header>
          {payoutRows.length === 0 ? (
            <p className="muted-line">No payouts recorded yet.</p>
          ) : (
            <table className="concierge-table">
              <thead>
                <tr>
                  <th>Paid</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payoutRows.map((p) => (
                  <tr key={p.id} style={{ cursor: "default" }}>
                    <td className="when">{formatDate(p.paid_at)}</td>
                    <td style={{ fontFamily: "'Playfair Display', serif", color: "var(--forest)" }}>
                      {formatUSD(p.amount_cents)}
                    </td>
                    <td style={{ fontSize: 12, color: "rgba(59,58,54,0.7)", textTransform: "capitalize" }}>
                      {p.method ?? "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "rgba(59,58,54,0.6)" }}>
                      {p.reference ?? "—"}
                    </td>
                    <td style={{ fontSize: 12, color: "rgba(59,58,54,0.6)", maxWidth: 320 }}>
                      {p.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
