"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createManualInquiry } from "../actions";
import { TIER_OPTIONS, PIPELINE_STAGES } from "@/lib/concierge";

export function ManualEntryModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createManualInquiry({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? "") || undefined,
        city: String(formData.get("city") ?? "") || undefined,
        tier: String(formData.get("tier") ?? "") || undefined,
        travelWindow: String(formData.get("window") ?? "") || undefined,
        groupSize:
          formData.get("group") && String(formData.get("group")).trim()
            ? Number(formData.get("group"))
            : null,
        notes: String(formData.get("notes") ?? "") || undefined,
        source: String(formData.get("source") ?? "") || "manual",
        status: String(formData.get("status") ?? "") || "new_lead",
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(res.error ?? "Could not save");
      }
    });
  }

  return (
    <div
      className={`manual-backdrop${open ? " on" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="manual-modal">
        <div className="head">
          <h2>
            New <em>inquiry</em>
          </h2>
          <button className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form action={handleSubmit}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="m-name">Full name</label>
              <input id="m-name" name="name" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="m-email">Email</label>
              <input id="m-email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="m-phone">Phone</label>
              <input id="m-phone" name="phone" type="tel" />
            </div>
            <div className="field">
              <label htmlFor="m-city">City / Origin</label>
              <input id="m-city" name="city" type="text" placeholder="Dallas, TX" />
            </div>
            <div className="field">
              <label htmlFor="m-tier">Tier</label>
              <select id="m-tier" name="tier" defaultValue="">
                <option value="">— Not selected —</option>
                {TIER_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} · {t.price}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="m-status">Pipeline stage</label>
              <select id="m-status" name="status" defaultValue="new_lead">
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="m-window">Travel window</label>
              <input
                id="m-window"
                name="window"
                type="text"
                placeholder="Spring 2026"
              />
            </div>
            <div className="field">
              <label htmlFor="m-group">Group size</label>
              <input id="m-group" name="group" type="number" min={1} max={8} />
            </div>
            <div className="field full">
              <label htmlFor="m-source">Source</label>
              <input
                id="m-source"
                name="source"
                type="text"
                placeholder="referral, phone call, event, etc."
                defaultValue="manual"
              />
            </div>
            <div className="field full">
              <label htmlFor="m-notes">Notes</label>
              <textarea
                id="m-notes"
                name="notes"
                placeholder="Anything Eric or See should know."
              />
            </div>
          </div>
          {error ? <p className="error">{error}</p> : null}
          <div className="actions">
            <button
              type="button"
              onClick={onClose}
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
              {pending ? "Saving…" : "Save Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
