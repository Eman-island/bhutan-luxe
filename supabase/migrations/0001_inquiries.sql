-- ============================================================
-- Bhutan-Luxe: Inquiries CRM schema
-- Migration: 0001_inquiries (modeled on aio-website pattern)
-- ============================================================
-- people  → unique contacts (deduped by email)
-- inquiries → form submissions referencing a person, with all
--             Bhutan-specific fields (tier, travel window, etc.)
-- activity_log → every CRM action (status change, note, reply)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PEOPLE
-- One row per unique email address.
-- ────────────────────────────────────────────────────────────
create table if not exists public.people (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  name            text,
  phone           text,
  city            text,
  source_site     text default 'bhutan-luxe.com',
  ok_to_contact   boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- INQUIRIES
-- All form submissions. Bhutan-specific fields (tier, window,
-- group_size, notes) live here directly.
-- ────────────────────────────────────────────────────────────
create table if not exists public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  person_id       uuid not null references public.people(id) on delete cascade,
  type            text not null default 'inquiry'
                    check (type in ('inquiry', 'bespoke', 'press', 'partner')),
  tier            text check (tier in ('luxe', 'boutique-luxe', 'ultra-luxe', 'bespoke', '')),
  travel_window   text,
  group_size      int check (group_size is null or (group_size >= 1 and group_size <= 8)),
  notes           text,
  status          text not null default 'new_lead'
                    check (status in ('new_lead', 'contacted', 'discovery_call', 'proposal', 'won', 'lost')),
  source          text default 'website',
  ref_code        text unique,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_inquiries_person     on public.inquiries (person_id);
create index if not exists idx_inquiries_status     on public.inquiries (status);
create index if not exists idx_inquiries_tier       on public.inquiries (tier);
create index if not exists idx_inquiries_created    on public.inquiries (created_at desc);

-- ────────────────────────────────────────────────────────────
-- ACTIVITY LOG
-- Every CRM action: status change, note, reply, manual edit.
-- ────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id              uuid primary key default gen_random_uuid(),
  inquiry_id      uuid references public.inquiries(id) on delete cascade,
  person_id       uuid references public.people(id) on delete cascade,
  action          text not null,
  details         jsonb default '{}'::jsonb,
  actor_email     text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_activity_inquiry on public.activity_log (inquiry_id, created_at desc);
create index if not exists idx_activity_person  on public.activity_log (person_id, created_at desc);

-- ────────────────────────────────────────────────────────────
-- TRIGGERS
-- Auto-update updated_at columns
-- ────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_people_updated_at on public.people;
create trigger trg_people_updated_at
  before update on public.people
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inquiries_updated_at on public.inquiries;
create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
alter table public.people       enable row level security;
alter table public.inquiries    enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "anon_can_insert_people" on public.people;
create policy "anon_can_insert_people"
  on public.people for insert
  to anon
  with check (true);

drop policy if exists "anon_can_insert_inquiries" on public.inquiries;
create policy "anon_can_insert_inquiries"
  on public.inquiries for insert
  to anon
  with check (true);

drop policy if exists "authed_can_select_people" on public.people;
create policy "authed_can_select_people"
  on public.people for select
  to authenticated
  using (true);

drop policy if exists "authed_can_update_people" on public.people;
create policy "authed_can_update_people"
  on public.people for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authed_can_select_inquiries" on public.inquiries;
create policy "authed_can_select_inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "authed_can_update_inquiries" on public.inquiries;
create policy "authed_can_update_inquiries"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authed_can_insert_inquiries" on public.inquiries;
create policy "authed_can_insert_inquiries"
  on public.inquiries for insert
  to authenticated
  with check (true);

drop policy if exists "authed_can_select_activity" on public.activity_log;
create policy "authed_can_select_activity"
  on public.activity_log for select
  to authenticated
  using (true);

drop policy if exists "authed_can_insert_activity" on public.activity_log;
create policy "authed_can_insert_activity"
  on public.activity_log for insert
  to authenticated
  with check (true);

-- ────────────────────────────────────────────────────────────
-- RPC: submit_inquiry
-- Public-form submission entry point. Upserts person, inserts
-- inquiry, logs activity. Runs as security definer so anon can
-- call it safely.
-- ────────────────────────────────────────────────────────────
create or replace function public.submit_inquiry(
  p_name           text,
  p_email          text,
  p_phone          text default null,
  p_tier           text default null,
  p_travel_window  text default null,
  p_group_size     int  default null,
  p_notes          text default null,
  p_type           text default 'inquiry',
  p_source         text default 'website',
  p_ref_code       text default null
)
returns table (inquiry_id uuid, ref_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id  uuid;
  v_inquiry_id uuid;
  v_ref        text;
begin
  -- Generate ref code if not provided: BL-YYYY-XXXX
  v_ref := coalesce(
    p_ref_code,
    'BL-' || to_char(current_date, 'YYYY') || '-' ||
      lpad((floor(random() * 9000) + 1000)::text, 4, '0')
  );

  -- Upsert person on email conflict
  insert into public.people (email, name, phone)
  values (lower(trim(p_email)), trim(p_name), p_phone)
  on conflict (email) do update set
    name  = coalesce(nullif(trim(excluded.name), ''), public.people.name),
    phone = coalesce(excluded.phone, public.people.phone),
    updated_at = now()
  returning id into v_person_id;

  -- Insert inquiry
  insert into public.inquiries (
    person_id, type, tier, travel_window, group_size, notes, source, ref_code
  )
  values (
    v_person_id, p_type, nullif(p_tier, ''), p_travel_window, p_group_size,
    p_notes, p_source, v_ref
  )
  returning id into v_inquiry_id;

  -- Log the receipt
  insert into public.activity_log (inquiry_id, person_id, action, details)
  values (
    v_inquiry_id, v_person_id, 'inquiry_received',
    jsonb_build_object('source', p_source, 'tier', p_tier)
  );

  return query select v_inquiry_id, v_ref;
end;
$$;

grant execute on function public.submit_inquiry to anon;
grant execute on function public.submit_inquiry to authenticated;

-- ────────────────────────────────────────────────────────────
-- VIEW: inquiries_with_person
-- Joined view used by the admin list. Avoids client-side joins.
-- ────────────────────────────────────────────────────────────
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
  i.created_at,
  i.updated_at,
  p.id    as person_id,
  p.email as person_email,
  p.name  as person_name,
  p.phone as person_phone,
  p.city  as person_city
from public.inquiries i
left join public.people p on p.id = i.person_id;
