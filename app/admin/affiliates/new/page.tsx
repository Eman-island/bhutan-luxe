import Link from "next/link";
import { AffiliateForm } from "../_components/affiliate-form";

export default function NewAffiliatePage() {
  return (
    <>
      <header className="dashboard-header">
        <Link
          href="/admin/affiliates"
          className="label"
          style={{
            display: "inline-block",
            color: "var(--gold)",
            textDecoration: "none",
            marginBottom: 8,
          }}
        >
          ← Affiliates
        </Link>
        <h1>
          New <em>affiliate</em>
        </h1>
      </header>
      <div className="concierge-list">
        <div className="affiliate-form-shell">
          <AffiliateForm mode="create" />
        </div>
      </div>
    </>
  );
}
