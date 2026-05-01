"use client";

import { useMemo, useState } from "react";
import { DetailDrawer } from "./detail-drawer";
import { KanbanBoard } from "./kanban";
import { ManualEntryModal } from "./manual-entry-modal";
import { StageBadge, TierBadge } from "./badges";
import {
  type Affiliate,
  type InquiryRow,
  TIER_OPTIONS,
  formatRelative,
} from "@/lib/concierge";

type View = "list" | "kanban";
type TierFilter = "" | "luxe" | "boutique-luxe" | "ultra-luxe" | "bespoke";

export function ConciergeDashboard({
  inquiries,
  affiliates,
}: {
  inquiries: InquiryRow[];
  affiliates: Affiliate[];
}) {
  const [view, setView] = useState<View>("list");
  const [tierFilter, setTierFilter] = useState<TierFilter>("");
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return tierFilter
      ? inquiries.filter((i) => i.tier === tierFilter)
      : inquiries;
  }, [inquiries, tierFilter]);

  const counts = useMemo(() => {
    const total = inquiries.filter((i) => i.status !== "lost").length;
    const byTier: Record<string, number> = {
      luxe: 0,
      "boutique-luxe": 0,
      "ultra-luxe": 0,
      bespoke: 0,
    };
    for (const i of inquiries) {
      if (i.status === "lost") continue;
      if (i.tier && i.tier in byTier) byTier[i.tier] += 1;
    }
    return { total, byTier };
  }, [inquiries]);

  function openDetail(id: string) {
    setDrawerId(id);
  }

  return (
    <>
      <header className="dashboard-header">
        <span className="label">The Concierge</span>
        <h1>
          Inquiries · <em>active</em>
        </h1>
        <div className="summary-grid">
          <button
            type="button"
            className={`summary-card is-total${tierFilter === "" ? " active" : ""}`}
            onClick={() => setTierFilter("")}
          >
            <span className="k">Active total</span>
            <span className="v">{counts.total}</span>
          </button>
          {TIER_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`summary-card${tierFilter === t.id ? " active" : ""}`}
              onClick={() =>
                setTierFilter(tierFilter === t.id ? "" : (t.id as TierFilter))
              }
            >
              <span className="k">{t.label}</span>
              <span className="v">{counts.byTier[t.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="concierge-toolbar">
        <div className="view-toggle">
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            List
          </button>
          <button
            className={view === "kanban" ? "active" : ""}
            onClick={() => setView("kanban")}
          >
            Kanban
          </button>
        </div>
        <div className="toolbar-actions">
          <span className="filter-label">Tier</span>
          <select
            className="filter-select"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierFilter)}
          >
            <option value="">All tiers</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-saffron"
            onClick={() => setModalOpen(true)}
          >
            + New Inquiry
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="concierge-list">
          <div className="concierge-empty">
            {tierFilter
              ? `No inquiries in ${TIER_OPTIONS.find((t) => t.id === tierFilter)?.label}.`
              : "No inquiries yet. Submissions from the public form will land here."}
          </div>
        </div>
      ) : view === "list" ? (
        <div className="concierge-list">
          <table className="concierge-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Inquirer</th>
                <th>Tier</th>
                <th>Window / Group</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => openDetail(r.id)}
                  className={drawerId === r.id ? "is-selected" : ""}
                >
                  <td className="ref">{r.ref_code ?? "—"}</td>
                  <td>
                    <div className="name">{r.person_name ?? "Unknown"}</div>
                    <span className="email">{r.person_email ?? ""}</span>
                    {r.person_city ? (
                      <span className="city">{r.person_city}</span>
                    ) : null}
                  </td>
                  <td>
                    <TierBadge tier={r.tier} />
                  </td>
                  <td>
                    <span className="meta-line">
                      {r.travel_window || (
                        <span style={{ color: "rgba(59,58,54,0.4)" }}>—</span>
                      )}
                    </span>
                    <span className="meta-faint">
                      {r.group_size
                        ? `${r.group_size} ${r.group_size === 1 ? "guest" : "guests"}`
                        : "Group size not given"}
                    </span>
                  </td>
                  <td className="when">{formatRelative(r.created_at)}</td>
                  <td>
                    <StageBadge stage={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <KanbanBoard inquiries={filtered} onCardClick={openDetail} />
      )}

      <DetailDrawer
        id={drawerId}
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        affiliates={affiliates}
      />
      <ManualEntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
