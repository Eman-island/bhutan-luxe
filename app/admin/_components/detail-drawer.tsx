"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addInquiryNote,
  getInquiryDetail,
  updateInquiry,
  updateInquiryStatus,
  type InquiryDetail,
} from "../actions";
import { ActivityTimeline } from "./activity-timeline";
import { StageBadge, TierBadge } from "./badges";
import {
  type Affiliate,
  PIPELINE_STAGES,
  TIER_OPTIONS,
  formatDate,
  formatUSD,
} from "@/lib/concierge";

export function DetailDrawer({
  id,
  open,
  onClose,
  affiliates,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
  affiliates: Affiliate[];
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusPending, startStatus] = useTransition();
  const [savePending, startSave] = useTransition();
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notePending, startNote] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Edit-form local state
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pCity, setPCity] = useState("");
  const [iTier, setITier] = useState("");
  const [iWindow, setIWindow] = useState("");
  const [iGroup, setIGroup] = useState("");
  const [iNotes, setINotes] = useState("");
  const [iAffiliate, setIAffiliate] = useState("");
  const [iDealUSD, setIDealUSD] = useState("");

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    setNoteText("");
    setEditing(false);
    getInquiryDetail(id).then((res) => {
      if (res.ok && res.data) {
        setDetail(res.data);
        const inq = res.data.inquiry;
        setPName(inq.person_name ?? "");
        setPPhone(inq.person_phone ?? "");
        setPCity(inq.person_city ?? "");
        setITier(inq.tier ?? "");
        setIWindow(inq.travel_window ?? "");
        setIGroup(inq.group_size ? String(inq.group_size) : "");
        setINotes(inq.notes ?? "");
        setIAffiliate(inq.affiliate_id ?? "");
        setIDealUSD(
          inq.deal_value_cents ? String(inq.deal_value_cents / 100) : "",
        );
      } else {
        setError(res.error ?? "Could not load");
      }
      setLoading(false);
    });
  }, [open, id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !editing) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, editing]);

  const activeAffiliates = useMemo(
    () => affiliates.filter((a) => a.active || a.id === iAffiliate),
    [affiliates, iAffiliate],
  );

  function handleStatus(next: string) {
    if (!id || !detail) return;
    if (detail.inquiry.status === next) return;
    setError(null);
    startStatus(async () => {
      const res = await updateInquiryStatus(id, next);
      if (res.ok) {
        const reload = await getInquiryDetail(id);
        if (reload.ok && reload.data) setDetail(reload.data);
        router.refresh();
      } else {
        setError(res.error ?? "Could not update status");
      }
    });
  }

  function handleSaveEdit() {
    if (!id || !detail) return;
    setError(null);
    startSave(async () => {
      const res = await updateInquiry(id, {
        person_name: pName,
        person_phone: pPhone,
        person_city: pCity,
        tier: iTier,
        travel_window: iWindow,
        group_size: iGroup.trim() ? Number(iGroup) : null,
        notes: iNotes,
        affiliate_id: iAffiliate || null,
        deal_value_cents: iDealUSD.trim() ? Math.round(Number(iDealUSD) * 100) : null,
      });
      if (res.ok) {
        const reload = await getInquiryDetail(id);
        if (reload.ok && reload.data) setDetail(reload.data);
        setEditing(false);
        router.refresh();
      } else {
        setError(res.error ?? "Could not save");
      }
    });
  }

  function handleAddNote() {
    if (!id || !noteText.trim()) return;
    setError(null);
    const text = noteText;
    startNote(async () => {
      const res = await addInquiryNote(id, text);
      if (res.ok) {
        setNoteText("");
        const reload = await getInquiryDetail(id);
        if (reload.ok && reload.data) setDetail(reload.data);
        router.refresh();
      } else {
        setError(res.error ?? "Could not save note");
      }
    });
  }

  return (
    <>
      <div
        className={`detail-backdrop${open ? " on" : ""}`}
        onClick={onClose}
      />
      <aside className={`detail-drawer${open ? " on" : ""}`}>
        {loading ? (
          <div style={{ padding: 56, color: "rgba(59,58,54,0.5)" }}>Loading…</div>
        ) : error && !detail ? (
          <div style={{ padding: 56, color: "var(--crimson)" }}>{error}</div>
        ) : detail ? (
          <>
            <div className="head">
              <div>
                <span className="ref">{detail.inquiry.ref_code ?? "—"}</span>
                <h2>{detail.inquiry.person_name ?? "Unknown"}</h2>
                <span className="email">{detail.inquiry.person_email ?? ""}</span>
              </div>
              <button className="close" onClick={onClose} aria-label="Close">×</button>
            </div>

            <div className="detail-section">
              <span className="label">Pipeline</span>
              <div className="status-row">
                <StageBadge stage={detail.inquiry.status} />
                <div className="stage-buttons">
                  {PIPELINE_STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`stage-btn${
                        detail.inquiry.status === s.id ? " is-current" : ""
                      }`}
                      onClick={() => handleStatus(s.id)}
                      disabled={statusPending}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {error ? (
                <p style={{ color: "var(--crimson)", fontSize: 13, marginTop: 12 }}>
                  {error}
                </p>
              ) : null}
            </div>

            <div className="detail-section">
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 18,
                }}
              >
                <span className="label" style={{ marginBottom: 0 }}>
                  Inquiry & contact
                </span>
                {editing ? (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
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
                    <button
                      type="button"
                      className="btn-saffron"
                      onClick={handleSaveEdit}
                      disabled={savePending}
                    >
                      {savePending ? "Saving…" : "Save"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--gold)",
                      color: "var(--gold)",
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                )}
              </header>

              {editing ? (
                <div className="affiliate-form">
                  <div className="grid-2">
                    <div className="field">
                      <label>Full name</label>
                      <input
                        type="text"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={pPhone}
                        onChange={(e) => setPPhone(e.target.value)}
                      />
                    </div>
                    <div className="field full">
                      <label>City</label>
                      <input
                        type="text"
                        value={pCity}
                        onChange={(e) => setPCity(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Tier</label>
                      <select value={iTier} onChange={(e) => setITier(e.target.value)}>
                        <option value="">— Not selected —</option>
                        {TIER_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label} · {t.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Travel window</label>
                      <input
                        type="text"
                        value={iWindow}
                        onChange={(e) => setIWindow(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Group size</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={iGroup}
                        onChange={(e) => setIGroup(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label>Deal value (USD)</label>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        placeholder="58000"
                        value={iDealUSD}
                        onChange={(e) => setIDealUSD(e.target.value)}
                      />
                    </div>
                    <div className="field full">
                      <label>Affiliate (referral source)</label>
                      <select
                        value={iAffiliate}
                        onChange={(e) => setIAffiliate(e.target.value)}
                      >
                        <option value="">— Direct / website —</option>
                        {activeAffiliates.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.code} · {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field full">
                      <label>Notes</label>
                      <textarea
                        value={iNotes}
                        onChange={(e) => setINotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="meta-grid">
                    <div className="row">
                      <span className="k">Tier</span>
                      <span className="v">
                        {detail.inquiry.tier ? (
                          <TierBadge tier={detail.inquiry.tier} />
                        ) : (
                          <span className="muted">Not specified</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Travel window</span>
                      <span className="v">
                        {detail.inquiry.travel_window || (
                          <span className="muted">Not specified</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Group size</span>
                      <span className="v">
                        {detail.inquiry.group_size ? (
                          `${detail.inquiry.group_size} guest${detail.inquiry.group_size === 1 ? "" : "s"}`
                        ) : (
                          <span className="muted">Not specified</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Deal value</span>
                      <span className="v">
                        {detail.inquiry.deal_value_cents ? (
                          formatUSD(detail.inquiry.deal_value_cents)
                        ) : (
                          <span className="muted">Not set</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Source</span>
                      <span className="v">
                        {detail.inquiry.source || (
                          <span className="muted">Unknown</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Phone</span>
                      <span className="v">
                        {detail.inquiry.person_phone || (
                          <span className="muted">Not given</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">City</span>
                      <span className="v">
                        {detail.inquiry.person_city || (
                          <span className="muted">Not given</span>
                        )}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">Affiliate</span>
                      <span className="v">
                        {detail.inquiry.affiliate_id ? (
                          <Link
                            href={`/admin/affiliates/${detail.inquiry.affiliate_id}`}
                            style={{
                              color: "var(--saffron)",
                              textDecoration: "none",
                              fontFamily: "'Playfair Display', serif",
                            }}
                          >
                            {detail.inquiry.affiliate_code} ·{" "}
                            {detail.inquiry.affiliate_name}
                          </Link>
                        ) : (
                          <span className="muted">Direct / website</span>
                        )}
                      </span>
                    </div>
                    <div className="row" style={{ gridColumn: "1 / -1" }}>
                      <span className="k">Received</span>
                      <span className="v">{formatDate(detail.inquiry.created_at)}</span>
                    </div>
                  </div>
                  {detail.inquiry.notes ? (
                    <div style={{ marginTop: 24 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          letterSpacing: "0.16em",
                          textTransform: "uppercase",
                          color: "rgba(59,58,54,0.55)",
                          marginBottom: 10,
                        }}
                      >
                        Notes from inquirer
                      </span>
                      <div className="notes">{detail.inquiry.notes}</div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="detail-section">
              <span className="label">Activity</span>
              <ActivityTimeline entries={detail.activity} />
              <div
                className="note-form"
                style={{
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid rgba(59,58,54,0.08)",
                }}
              >
                <span className="label">Add a note</span>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Eric called, asked about lodge alternatives in Paro..."
                />
                <div className="actions">
                  <button
                    type="button"
                    className="btn-saffron"
                    onClick={handleAddNote}
                    disabled={notePending || !noteText.trim()}
                  >
                    {notePending ? "Saving…" : "Add Note"}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}
