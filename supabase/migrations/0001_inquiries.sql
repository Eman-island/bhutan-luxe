-- ============================================================
-- Bhutan-Luxe: Inquiries CRM schema
-- Migration: 0001_inquiries
-- ============================================================
-- Single-table inquiry log. Submitted by the public form via
-- Server Action (service-role insert). Read by /admin (Supabase
-- Auth-gated). Status workflow: new → contacted → won/lost.
-- ============================================================

create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text not null,
  phone           text,
  tier            text check (tier in ('luxe', 'boutique-luxe', 'ultra-luxe', 'bespoke', '')),
  travel_window   text,
  group_size      int check (group_size is null or (group_size >= 1 and group_size <= 8)),
  notes           text,
  status          text not null default 'new'
                    check (status in ('new', 'contacted', 'won', 'lost')),
  source          text default 'website',
  ref_code        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_inquiries_status     on public.inquiries (status);
create index if not exists idx_inquiries_email      on public.inquiries (email);
create index if not exists idx_inquiries_created_at on public.inquiries (created_at desc);

-- Auto-update updated_at on any change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- Anon (the website's public client) can ONLY insert.
-- Authenticated users (admin) can SELECT and UPDATE all rows.
-- Nothing can DELETE except service_role (which bypasses RLS).
-- ============================================================

alter table public.inquiries enable row level security;

drop policy if exists "anon_can_insert" on public.inquiries;
create policy "anon_can_insert"
  on public.inquiries for insert
  to anon
  with check (true);

drop policy if exists "authenticated_can_select" on public.inquiries;
create policy "authenticated_can_select"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "authenticated_can_update" on public.inquiries;
create policy "authenticated_can_update"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);
