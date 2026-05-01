export const dynamic = "force-dynamic";

export default function AffiliatesPage() {
  return (
    <>
      <header className="dashboard-header">
        <span className="label">The Concierge</span>
        <h1>
          Affiliates · <em>partners</em>
        </h1>
      </header>
      <div className="concierge-list">
        <div className="concierge-empty" style={{ padding: "120px 24px" }}>
          Affiliate-partner ledger and commission tracking coming soon.
          <br />
          <span
            style={{
              display: "block",
              marginTop: 16,
              fontStyle: "normal",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(59,58,54,0.4)",
            }}
          >
            For Eric &amp; See — concierge services, wealth managers, lifestyle advisors
          </span>
        </div>
      </div>
    </>
  );
}
