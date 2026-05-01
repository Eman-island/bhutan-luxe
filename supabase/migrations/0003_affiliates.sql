-- ============================================================
-- Bhutan-Luxe: Affiliate ledger
-- Migration: 0003_affiliates
-- ============================================================
-- Adapted from aio-website's affiliate model. Removes the Stripe
-- coupon path (Bhutan-Luxe doesn't sell tickets at retail) and
-- keeps just the commission-share path. Commissions are entered
-- manually by Eric/See when a deal is won.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- AFFILIATES
-- One row per referral partner (concierge, wealth manager,
-- lifestyle advisor, hotel, personal referrer).
-- ────────────────────────────────────────────────────────────
create table if not exists public.affiliates (
  id                       uuid primary key default gen_random_uuid(),
  code                     text not null unique,                  -- e.g. "HAMPTON"
  name                     text not null,                          -- partner display name
  partner_type             text not null
                             check (partner_type in
                               ('concierge','wealth_manager','lifestyle','travel_co','hotel','personal','other')),
  organization             text,                                   -- firm / company
  contact_email            text,
  contact_phone            text,
  default_commission_pct   numeric(5,2) not null default 10.00
                             check (default_commission_pct >= 0 and default_commission_pct <= 50),
  active                   boolean not null default true,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create unique index if not exists idx_affiliates_code_lower on public.affiliates (lower(code));
create index if not exists idx_affiliates_active           on public.affiliates (active);
create index if not exists idx_affiliates_partner_type     on public.affiliates (partner_type);

drop trigger if exists trg_affiliates_updated_at on public.affiliates;
create trigger trg_affiliates_updated_at
  before update on public.affiliates
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- AFFILIATE PAYOUTS
-- Money sent to a partner. Created BEFORE commissions because
-- commissions reference payouts (when paid).
-- ────────────────────────────────────────────────────────────
create table if not exists public.affiliate_payouts (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid not null references public.affiliates(id) on delete cascade,
  amount_cents  bigint not null check (amount_cents > 0),
  method        text,                                  -- 'wire', 'paypal', 'check', etc.
  reference     text,                                  -- transaction ref / memo
  paid_at       timestamptz not null,
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_payouts_affiliate
  on public.affiliate_payouts (affiliate_id, paid_at desc);

-- ────────────────────────────────────────────────────────────
-- AFFILIATE COMMISSIONS
-- Append-only ledger. payout_id is null until paid.
-- ────────────────────────────────────────────────────────────
create table if not exists public.affiliate_commissions (
  id                uuid primary key default gen_random_uuid(),
  affiliate_id      uuid not null references public.affiliates(id) on delete cascade,
  inquiry_id        uuid references public.inquiries(id) on delete set null,
  status            text not null default 'pending'
                      check (status in ('pending','paid','cancelled')),
  gross_cents       bigint not null check (gross_cents > 0),
  commission_pct    numeric(5,2) not null check (commission_pct >= 0 and commission_pct <= 50),
  commission_cents  bigint not null check (commission_cents >= 0),
  payout_id         uuid references public.affiliate_payouts(id) on delete set null,
  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_commissions_affiliate
  on public.affiliate_commissions (affiliate_id, created_at desc);

create index if not exists idx_commissions_inquiry
  on public.affiliate_commissions (inquiry_id);

create index if not exists idx_commissions_unpaid
  on public.affiliate_commissions (affiliate_id)
  where status = 'pending';

create index if not exists idx_commissions_payout
  on public.affiliate_commissions (payout_id)
  where payout_id is not null;

-- ────────────────────────────────────────────────────────────
-- ATTRIBUTION COLUMNS on inquiries
-- ────────────────────────────────────────────────────────────
alter table public.inquiries
  add column if not exists affiliate_id uuid references public.affiliates(id) on delete set null;

alter table public.inquiries
  add column if not exists deal_value_cents bigint;   -- the trip price when won

create index if not exists idx_inquiries_affiliate
  on public.inquiries (affiliate_id)
  where affiliate_id is not null;

-- ────────────────────────────────────────────────────────────
-- VIEW: extend inquiries_with_person to include affiliate
-- ────────────────────────────────────────────────────────────
drop view if exists public.inquiries_with_person;
create or replace view public.inquiries_with_person as
select
  i.id,
  i.type,
  i.tier,
  i.travel_window,
  i.group_size,
  i.notes,
  i.status,
  i.source,
  i.ref_code,
  i.affiliate_id,
  i.deal_value_cents,
  i.created_at,
  i.updated_at,
  p.id    as person_id,
  p.email as person_email,
  p.name  as person_name,
  p.phone as person_phone,
  p.city  as person_city,
  a.code  as affiliate_code,
  a.name  as affiliate_name
from public.inquiries i
left join public.people p     on p.id = i.person_id
left join public.affiliates a on a.id = i.affiliate_id;

-- ────────────────────────────────────────────────────────────
-- VIEW: affiliate roll-up
-- Counts of referrals + earnings per affiliate, used by the list page.
-- ────────────────────────────────────────────────────────────
create or replace view public.affiliates_with_stats as
select
  a.*,
  coalesce(referral_counts.total, 0)            as referrals_total,
  coalesce(referral_counts.won,   0)            as referrals_won,
  coalesce(commission_sums.pending_cents, 0)    as commission_pending_cents,
  coalesce(commission_sums.paid_cents,    0)    as commission_paid_cents,
  coalesce(commission_sums.total_cents,   0)    as commission_total_cents
from public.affiliates a
left join (
  select
    affiliate_id,
    count(*)                                            as total,
    count(*) filter (where status = 'won')              as won
  from public.inquiries
  where affiliate_id is not null
  group by affiliate_id
) referral_counts on referral_counts.affiliate_id = a.id
left join (
  select
    affiliate_id,
    sum(case when status = 'pending' then commission_cents else 0 end) as pending_cents,
    sum(case when status = 'paid'    then commission_cents else 0 end) as paid_cents,
    sum(case when status in ('pending','paid') then commission_cents else 0 end) as total_cents
  from public.affiliate_commissions
  group by affiliate_id
) commission_sums on commission_sums.affiliate_id = a.id;

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- All affiliate data is admin-only. No anon access.
-- ────────────────────────────────────────────────────────────
alter table public.affiliates           enable row level security;
alter table public.affiliate_payouts    enable row level security;
alter table public.affiliate_commissions enable row level security;

drop policy if exists "authed_can_read_affiliates" on public.affiliates;
create policy "authed_can_read_affiliates"
  on public.affiliates for select
  to authenticated using (true);

drop policy if exists "authed_can_write_affiliates" on public.affiliates;
create policy "authed_can_write_affiliates"
  on public.affiliates for all
  to authenticated using (true) with check (true);

drop policy if exists "authed_can_read_payouts" on public.affiliate_payouts;
create policy "authed_can_read_payouts"
  on public.affiliate_payouts for select
  to authenticated using (true);

drop policy if exists "authed_can_write_payouts" on public.affiliate_payouts;
create policy "authed_can_write_payouts"
  on public.affiliate_payouts for all
  to authenticated using (true) with check (true);

drop policy if exists "authed_can_read_commissions" on public.affiliate_commissions;
create policy "authed_can_read_commissions"
  on public.affiliate_commissions for select
  to authenticated using (true);

drop policy if exists "authed_can_write_commissions" on public.affiliate_commissions;
create policy "authed_can_write_commissions"
  on public.affiliate_commissions for all
  to authenticated using (true) with check (true);
