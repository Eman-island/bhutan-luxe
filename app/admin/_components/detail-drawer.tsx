"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addInquiryNote,
  getInquiryDetail,
  updateInquiryStatus,
  type InquiryDetail,
} from "../actions";
import { ActivityTimeline } from "./activity-timeline";
import { StageBadge, TierBadge } from "./badges";
import { PIPELINE_STAGES, formatDate } from "@/lib/concierge";

export function DetailDrawer({
  id,
  open,
  onClose,
}: {
  id: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusPending, startStatus] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [notePending, startNote] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    setLoading(true);
    setError(null);
    setDetail(null);
    setNoteText("");
    getInquiryDetail(id).then((res) => {
      if (res.ok && res.data) setDetail(res.data);
      else setError(res.error ?? "Could not load");
      setLoading(false);
    });
  }, [open, id]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
          <div style={{ padding: 56, color: "rgba(59,58,54,0.5)" }}>
            Loading…
          </div>
        ) : error && !detail ? (
          <div style={{ padding: 56, color: "var(--crimson)" }}>{error}</div>
        ) : detail ? (
          <>
            <div className="head">
              <div>
                <span className="ref">{detail.inquiry.ref_code ?? "—"}</span>
                <h2>{detail.inquiry.person_name ?? "Unknown"}</h2>
                <span className="email">
                  {detail.inquiry.person_email ?? ""}
                </span>
              </div>
              <button className="close" onClick={onClose} aria-label="Close">
                ×
              </button>
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
                <p
                  style={{
                    color: "var(--crimson)",
                    fontSize: 13,
                    marginTop: 12,
                  }}
                >
                  {error}
                </p>
              ) : null}
            </div>

            <div className="detail-section">
              <span className="label">Inquiry Details</span>
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
                <div className="row" style={{ gridColumn: "1 / -1" }}>
                  <span className="k">Received</span>
                  <span className="v">{formatDate(detail.inquiry.created_at)}</span>
                </div>
              </div>
              {detail.inquiry.notes ? (
                <div style={{ marginTop: 24 }}>
                  <span
                    className="k"
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
            </div>

            <div className="detail-section">
              <span className="label">Activity</span>
              <ActivityTimeline entries={detail.activity} />
              <div
                className="note-form"
                style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(59,58,54,0.08)" }}
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
