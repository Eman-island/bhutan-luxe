"use client";

import { type ActivityEntry, STAGE_LABEL } from "@/lib/concierge";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderBody(entry: ActivityEntry): React.ReactNode {
  const d = entry.details ?? {};
  switch (entry.action) {
    case "inquiry_received": {
      const tier = (d.tier as string | undefined) ?? null;
      const source = (d.source as string | undefined) ?? "website";
      return (
        <div className="body">
          Inquiry received via <em>{source}</em>
          {tier ? ` · ${tier.replace("-", " ")}` : ""}
        </div>
      );
    }
    case "status_changed": {
      const from = (d.from as string | undefined) ?? "";
      const to = (d.to as string | undefined) ?? "";
      return (
        <div className="body">
          Moved from <em>{STAGE_LABEL[from] ?? from}</em> to{" "}
          <em>{STAGE_LABEL[to] ?? to}</em>
        </div>
      );
    }
    case "note": {
      const text = (d.text as string | undefined) ?? "";
      return <div className="body note-body">{text}</div>;
    }
    case "manual_create":
      return <div className="body">Manually created in The Concierge</div>;
    default:
      return <div className="body">{entry.action}</div>;
  }
}

export function ActivityTimeline({ entries }: { entries: ActivityEntry[] }) {
  if (!entries.length) {
    return (
      <p style={{ color: "rgba(59,58,54,0.5)", fontStyle: "italic" }}>
        No activity yet.
      </p>
    );
  }
  return (
    <div className="timeline">
      {entries.map((e) => (
        <div key={e.id} className={`timeline-entry action-${e.action}`}>
          <div className="when">{formatTimestamp(e.created_at)}</div>
          {e.actor_email ? <div className="who">{e.actor_email}</div> : null}
          {renderBody(e)}
        </div>
      ))}
    </div>
  );
}
