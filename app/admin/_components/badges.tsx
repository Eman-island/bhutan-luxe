import { STAGE_LABEL, TIER_LABEL } from "@/lib/concierge";

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`stage-badge stage-${stage}`}>
      {STAGE_LABEL[stage] ?? stage}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string | null }) {
  if (!tier || !TIER_LABEL[tier]) {
    return <span style={{ color: "rgba(59,58,54,0.35)" }}>—</span>;
  }
  return (
    <span className={`tier-badge tier-${tier}`}>{TIER_LABEL[tier]}</span>
  );
}
