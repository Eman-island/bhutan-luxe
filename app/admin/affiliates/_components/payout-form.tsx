"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPayout } from "../actions";
import { formatUSD, type AffiliateCommission } from "@/lib/concierge";

export function PayoutForm({
  affiliateId,
  pendingCommissions,
}: {
  affiliateId: string;
  pendingCommissions: AffiliateCommission[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedTotalCents = useMemo(() => {
    return pendingCommissions
      .filter((c) => selectedIds.has(c.id))
      .reduce((sum, c) => sum + Number(c.commission_cents), 0);
  }, [pendingCommissions, selectedIds]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const amount_cents = Math.round(
      Number(formData.get("amount_usd") ?? selectedTotalCents / 100) * 100,
    );
    if (amount_cents <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    startTransition(async () => {
      const res = await recordPayout(affiliateId, {
        amount_cents,
        method: String(formData.get("method") ?? ""),
        reference: String(formData.get("reference") ?? ""),
        paid_at: String(formData.get("paid_at") ?? ""),
        notes: String(formData.get("notes") ?? ""),
        commission_ids: Array.from(selectedIds),
      });
      if (res.ok) {
        setOpen(false);
        setSelectedIds(new Set());
        router.refresh();
      } else {
        setError(res.error ?? "Could not save");
      }
    });
  }

  if (!open) {
    return (
      <button type="button" className="btn-ghost-dark" onClick={() => setOpen(true)}>
        Record Payout
      </button>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form action={handleSubmit} className="affiliate-form" style={{ marginTop: 12 }}>
      {pendingCommissions.length > 0 ? (
        <div className="field full" style={{ marginBottom: 16 }}>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(59,58,54,0.55)",
              marginBottom: 10,
              display: "block",
            }}
          >
            Apply to pending commissions ({pendingCommissions.length})
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pendingCommissions.map((c) => (
              <label
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 12px",
                  border: "1px solid rgba(59,58,54,0.12)",
                  cursor: "pointer",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 13,
                  color: "var(--stone)",
                  background: selectedIds.has(c.id) ? "rgba(255,140,0,0.06)" : "white",
                  borderColor: selectedIds.has(c.id) ? "var(--saffron)" : "rgba(59,58,54,0.12)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                />
                <span style={{ fontFamily: "'Playfair Display', serif", flex: 1 }}>
                  {formatUSD(c.commission_cents)} · {c.commission_pct}% of {formatUSD(c.gross_cents)}
                </span>
                <span style={{ fontSize: 11, color: "rgba(59,58,54,0.5)" }}>
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </label>
            ))}
          </div>
          {selectedIds.size > 0 ? (
            <p
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "var(--saffron)",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Selected total: {formatUSD(selectedTotalCents)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid-2">
        <div className="field">
          <label htmlFor="pf-amount">Amount (USD)</label>
          <input
            id="pf-amount"
            name="amount_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              selectedTotalCents > 0 ? (selectedTotalCents / 100).toFixed(2) : ""
            }
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pf-paid">Paid date</label>
          <input id="pf-paid" name="paid_at" type="date" defaultValue={todayIso} required />
        </div>
        <div className="field">
          <label htmlFor="pf-method">Method</label>
          <select id="pf-method" name="method" defaultValue="wire">
            <option value="wire">Wire</option>
            <option value="paypal">PayPal</option>
            <option value="check">Check</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="pf-ref">Reference</label>
          <input
            id="pf-ref"
            name="reference"
            type="text"
            placeholder="Transaction id / memo"
          />
        </div>
        <div className="field full">
          <label htmlFor="pf-notes">Notes</label>
          <textarea id="pf-notes" name="notes" />
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="actions">
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(59,58,54,0.6)",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button type="submit" className="btn-saffron" disabled={pending}>
          {pending ? "Saving…" : "Record Payout"}
        </button>
      </div>
    </form>
  );
}
