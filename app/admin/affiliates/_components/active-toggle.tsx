"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAffiliateActive } from "../actions";

export function ActiveToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const res = await toggleAffiliateActive(id, next);
      if (!res.ok) {
        setActive(!next);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`active-pill${active ? " on" : ""}`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}
