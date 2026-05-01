export const PIPELINE_STAGES = [
  { id: "new_lead", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "discovery_call", label: "Discovery" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
] as const;

export type StageId = (typeof PIPELINE_STAGES)[number]["id"];

export const TIER_OPTIONS = [
  { id: "luxe", label: "Luxe", price: "$8K – $12K" },
  { id: "boutique-luxe", label: "Boutique-Luxe", price: "$12K – $25K" },
  { id: "ultra-luxe", label: "Ultra-Luxe", price: "$25K – $35K+" },
  { id: "bespoke", label: "Bespoke", price: "By design" },
] as const;

export type TierId = (typeof TIER_OPTIONS)[number]["id"];

export interface InquiryRow {
  id: string;
  ref_code: string | null;
  type: string;
  tier: string | null;
  travel_window: string | null;
  group_size: number | null;
  notes: string | null;
  status: StageId;
  source: string | null;
  created_at: string;
  updated_at: string;
  person_id: string | null;
  person_email: string | null;
  person_name: string | null;
  person_phone: string | null;
  person_city: string | null;
}

export interface ActivityEntry {
  id: string;
  inquiry_id: string | null;
  person_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  actor_email: string | null;
  created_at: string;
}

export const TIER_LABEL: Record<string, string> = {
  luxe: "Luxe",
  "boutique-luxe": "Boutique-Luxe",
  "ultra-luxe": "Ultra-Luxe",
  bespoke: "Bespoke",
};

export const STAGE_LABEL: Record<string, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label]),
);

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
