"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCommission } from "../actions";
import type { InquiryRow } from "@/lib/concierge";

export function CommissionForm({
  affiliateId,
  defaultPct,
  inquiries,
}: {
  affiliateId: string;
  defaultPct: number;
  inquiries: Pick<InquiryRow, "id" | "ref_code" | "person_name" | "tier" | "status">[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [grossUSD, setGrossUSD] = useState("");
  const [pct, setPct] = useState(String(defaultPct));

  const grossNum = Number(grossUSD) || 0;
  const pctNum = Number(pct) || 0;
  const previewCents = Math.round(grossNum * 100 * (pctNum / 100));

  function handleSubmit(formData: FormData) {
    setError(null);
    const inquiry_id = String(formData.get("inquiry_id") ?? "") || null;
    const gross_cents = Math.round(Number(formData.get("gross_usd") ?? 0) * 100);
    const commission_pct = Number(formData.get("commission_pct") ?? defaultPct);
    const notes = String(formData.get("notes") ?? "");
    if (gross_cents <= 0) {
      setError("Enter a deal value greater than 0");
      return;
    }
    startTransition(async () => {
      const res = await addCommission(affiliateId, {
        inquiry_id,
        gross_cents,
        commission_pct,
        notes,
      });
      if (res.ok) {
        setOpen(false);
        setGrossUSD("");
        setPct(String(defaultPct));
        router.refresh();
      } else {
        setError(res.error ?? "Could not save");
      }
    });
  }

  if (!open) {
    return (
      <button type="button" className="btn-saffron" onClick={() => setOpen(true)}>
        + Add Commission
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="affiliate-form" style={{ marginTop: 12 }}>
      <div className="grid-2">
        <div className="field full">
          <label htmlFor="cf-inquiry">Inquiry (optional)</label>
          <select id="cf-inquiry" name="inquiry_id" defaultValue="">
            <option value="">— No specific inquiry —</option>
            {inquiries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.ref_code} · {i.person_name ?? "Unknown"}
                {i.tier ? ` · ${i.tier}` : ""} · {i.status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cf-gross">Deal value (USD)</label>
          <input
            id="cf-gross"
            name="gross_usd"
            type="number"
            step="100"
            min="0"
            placeholder="58000"
            value={grossUSD}
            onChange={(e) => setGrossUSD(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="cf-pct">Commission %</label>
          <input
            id="cf-pct"
            name="commission_pct"
            type="number"
            step="0.5"
            min="0"
            max="50"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
            required
          />
        </div>
        <div className="field full">
          <label htmlFor="cf-notes">Notes</label>
          <textarea
            id="cf-notes"
            name="notes"
            placeholder="Trip context, why this rate, etc."
          />
        </div>
        <div className="field full">
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              color: "var(--saffron)",
            }}
          >
            ${(previewCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(59,58,54,0.5)",
              marginTop: 2,
            }}
          >
            Commission preview
          </span>
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
          {pending ? "Saving…" : "Save Commission"}
        </button>
      </div>
    </form>
  );
}
