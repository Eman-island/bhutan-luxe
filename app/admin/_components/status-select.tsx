"use client";

import { useState, useTransition } from "react";
import { updateInquiryStatus } from "../actions";

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export function StatusSelect({
  id,
  initial,
}: {
  id: string;
  initial: string;
}) {
  const [status, setStatus] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const res = await updateInquiryStatus(id, next);
      if (!res.ok) {
        setStatus(prev);
        setError(res.error ?? "Update failed");
      }
    });
  }

  return (
    <>
      <select
        className={`status-select status-${status}`}
        value={status}
        onChange={onChange}
        disabled={pending}
        aria-label="Status"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error ? (
        <span style={{ display: "block", color: "#C41E3A", fontSize: 11, marginTop: 4 }}>
          {error}
        </span>
      ) : null}
    </>
  );
}
