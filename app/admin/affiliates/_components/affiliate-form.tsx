"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAffiliate, updateAffiliate, type AffiliateInput } from "../actions";
import { PARTNER_TYPE_OPTIONS, type Affiliate } from "@/lib/concierge";

export function AffiliateForm({
  initial,
  mode,
}: {
  initial?: Affiliate;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const input: AffiliateInput = {
      code: String(formData.get("code") ?? ""),
      name: String(formData.get("name") ?? ""),
      partner_type: String(formData.get("partner_type") ?? "concierge"),
      organization: String(formData.get("organization") ?? "") || undefined,
      contact_email: String(formData.get("contact_email") ?? "") || undefined,
      contact_phone: String(formData.get("contact_phone") ?? "") || undefined,
      default_commission_pct: Number(formData.get("default_commission_pct") ?? 10),
      active: formData.get("active") === "on",
      notes: String(formData.get("notes") ?? "") || undefined,
    };
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createAffiliate(input)
          : await updateAffiliate(initial!.id, input);
      if (res.ok) {
        if (mode === "create" && "id" in res && res.id) {
          router.push(`/admin/affiliates/${res.id}`);
        } else {
          router.refresh();
        }
      } else {
        setError(res.error ?? "Could not save");
      }
    });
  }

  return (
    <form action={handleSubmit} className="affiliate-form">
      <div className="grid-2">
        <div className="field">
          <label htmlFor="af-code">Affiliate code</label>
          <input
            id="af-code"
            name="code"
            type="text"
            placeholder="HAMPTON"
            defaultValue={initial?.code ?? ""}
            required
            style={{ textTransform: "uppercase" }}
          />
        </div>
        <div className="field">
          <label htmlFor="af-type">Partner type</label>
          <select
            id="af-type"
            name="partner_type"
            defaultValue={initial?.partner_type ?? "concierge"}
          >
            {PARTNER_TYPE_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="af-name">Display name</label>
          <input
            id="af-name"
            name="name"
            type="text"
            placeholder="Hampton & Sons Concierge"
            defaultValue={initial?.name ?? ""}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="af-org">Organization</label>
          <input
            id="af-org"
            name="organization"
            type="text"
            placeholder="Firm or company"
            defaultValue={initial?.organization ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="af-pct">Default commission %</label>
          <input
            id="af-pct"
            name="default_commission_pct"
            type="number"
            step="0.5"
            min="0"
            max="50"
            defaultValue={initial?.default_commission_pct ?? 10}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="af-email">Contact email</label>
          <input
            id="af-email"
            name="contact_email"
            type="email"
            defaultValue={initial?.contact_email ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="af-phone">Contact phone</label>
          <input
            id="af-phone"
            name="contact_phone"
            type="tel"
            defaultValue={initial?.contact_phone ?? ""}
          />
        </div>
        <div className="field full">
          <label htmlFor="af-notes">Notes</label>
          <textarea
            id="af-notes"
            name="notes"
            placeholder="How they refer, payout cadence, anything internal."
            defaultValue={initial?.notes ?? ""}
          />
        </div>
        <div className="field full" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <input
            id="af-active"
            name="active"
            type="checkbox"
            defaultChecked={initial?.active ?? true}
          />
          <label
            htmlFor="af-active"
            style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "none" }}
          >
            Active — accepts new referrals
          </label>
        </div>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="actions">
        <button
          type="button"
          onClick={() => router.back()}
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
          {pending ? "Saving…" : mode === "create" ? "Create Affiliate" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
