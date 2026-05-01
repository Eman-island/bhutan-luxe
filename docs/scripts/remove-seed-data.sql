-- ============================================================
-- Bhutan-Luxe: Remove all sample/seed data
-- ============================================================
-- Run this when transitioning from demo to production. It deletes
-- ONLY the rows seeded by:
--   supabase/migrations/0002_seed_data.sql      (people + inquiries
--                                                + activity_log)
--   supabase/migrations/0004_affiliates_seed.sql (affiliates +
--                                                commissions + payouts)
--
-- Targets are matched by their seeded UUID prefixes:
--   11111111-... → seeded people
--   22222222-... → seeded inquiries
--   33333333-... → seeded affiliates
--   44444444-... → seeded payouts
--   55555555-... → seeded commissions
--
-- Any rows with auto-generated UUIDs (real submissions, manual
-- entries, etc.) are PRESERVED. Safe to re-run; idempotent.
--
-- How to run:
--   bash docs/scripts/remove-seed-data.sh
--
-- Or paste this file into the Supabase SQL Editor at
-- https://supabase.com/dashboard/project/rqoxbhabzecuuycxjtca/sql
-- ============================================================

-- Counts before
select 'before' as phase,
  (select count(*) from public.people    where id::text like '11111111-%') as seed_people,
  (select count(*) from public.inquiries where id::text like '22222222-%') as seed_inquiries,
  (select count(*) from public.activity_log where inquiry_id::text like '22222222-%') as seed_activity,
  (select count(*) from public.affiliates where id::text like '33333333-%') as seed_affiliates,
  (select count(*) from public.affiliate_payouts where id::text like '44444444-%') as seed_payouts,
  (select count(*) from public.affiliate_commissions where id::text like '55555555-%') as seed_commissions;

-- Delete in dependency order. Cascades handle the leaf tables, but
-- explicit deletes are clearer and let us count what was removed.
delete from public.affiliate_commissions where id::text like '55555555-%';
delete from public.affiliate_payouts     where id::text like '44444444-%';
delete from public.affiliates            where id::text like '33333333-%';
delete from public.inquiries             where id::text like '22222222-%';   -- cascades activity_log
delete from public.people                where id::text like '11111111-%';

-- Counts after — also report what's left in the tables overall so it's
-- obvious whether real data survived.
select 'after_seeds' as phase,
  (select count(*) from public.people    where id::text like '11111111-%') as seed_people,
  (select count(*) from public.inquiries where id::text like '22222222-%') as seed_inquiries,
  (select count(*) from public.activity_log where inquiry_id::text like '22222222-%') as seed_activity,
  (select count(*) from public.affiliates where id::text like '33333333-%') as seed_affiliates,
  (select count(*) from public.affiliate_payouts where id::text like '44444444-%') as seed_payouts,
  (select count(*) from public.affiliate_commissions where id::text like '55555555-%') as seed_commissions;

select 'after_total' as phase,
  (select count(*) from public.people)               as people,
  (select count(*) from public.inquiries)            as inquiries,
  (select count(*) from public.activity_log)         as activity,
  (select count(*) from public.affiliates)           as affiliates,
  (select count(*) from public.affiliate_payouts)    as payouts,
  (select count(*) from public.affiliate_commissions) as commissions;
