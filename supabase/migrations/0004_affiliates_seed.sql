-- ============================================================
-- Bhutan-Luxe: Affiliate seed data
-- Migration: 0004_affiliates_seed
-- ============================================================
-- 3 realistic affiliate partners + attribution on existing
-- seed inquiries + a sample commission ledger.
-- ============================================================

delete from public.affiliate_commissions;
delete from public.affiliate_payouts;
delete from public.affiliates;

-- ────────────────────────────────────────────────────────────
-- AFFILIATES
-- ────────────────────────────────────────────────────────────
insert into public.affiliates (id, code, name, partner_type, organization, contact_email, contact_phone, default_commission_pct, active, notes, created_at) values
  ('33333333-0001-0000-0000-000000000001', 'HAMPTON',
   'Hampton & Sons Concierge', 'concierge',
   'Hampton & Sons LLC', 'referrals@hamptonconcierge.com', '+1 214 555 0900',
   10.00, true,
   'Long-time partner — Dallas-based ultra-HNW concierge. Pays out quarterly. Prefers wire.',
   now() - interval '90 days'),

  ('33333333-0001-0000-0000-000000000002', 'VHARDIN',
   'Vance Hardin Wealth', 'wealth_manager',
   'Vance Hardin & Associates', 'referrals@vancehardin.com', '+1 713 555 0432',
   8.00, true,
   'Houston wealth firm. Strong with multi-generational clients. Sent us the Whitfields.',
   now() - interval '120 days'),

  ('33333333-0001-0000-0000-000000000003', 'ASPIRE',
   'Aspire Lifestyle Advisors', 'lifestyle',
   'Aspire Lifestyle Inc.', 'partners@aspirelifestyle.com', '+1 415 555 0188',
   12.00, true,
   'Bay Area lifestyle/travel boutique. Higher commission rate reflects their concierge curation.',
   now() - interval '45 days');

-- ────────────────────────────────────────────────────────────
-- ATTRIBUTION on existing inquiries
-- ────────────────────────────────────────────────────────────

-- Whitfield (won, $58K deal) came through Vance Hardin
update public.inquiries
   set affiliate_id     = '33333333-0001-0000-0000-000000000002',
       deal_value_cents = 5800000,
       source           = 'affiliate'
 where ref_code = 'BL-2026-0143';

-- Castellanos (discovery_call) came through Hampton
update public.inquiries
   set affiliate_id = '33333333-0001-0000-0000-000000000001',
       source       = 'affiliate'
 where ref_code = 'BL-2026-0210';

-- Wong (new_lead, referral) came through Aspire (rerouting from generic "referral")
update public.inquiries
   set affiliate_id = '33333333-0001-0000-0000-000000000003',
       source       = 'affiliate'
 where ref_code = 'BL-2026-0421';

-- Kessler (contacted) came through Hampton
update public.inquiries
   set affiliate_id = '33333333-0001-0000-0000-000000000001',
       source       = 'affiliate'
 where ref_code = 'BL-2026-0467';

-- ────────────────────────────────────────────────────────────
-- COMMISSIONS LEDGER
-- The Whitfield deal closed → 8% of $58,000 = $4,640
-- ────────────────────────────────────────────────────────────
insert into public.affiliate_payouts (id, affiliate_id, amount_cents, method, reference, paid_at, notes, created_at) values
  ('44444444-0001-0000-0000-000000000001',
   '33333333-0001-0000-0000-000000000002',
   464000, 'wire', 'WIRE-2026-Q1-VH-001',
   now() - interval '4 days',
   'Q1 commission for Whitfield trip (BL-2026-0143).',
   now() - interval '4 days');

insert into public.affiliate_commissions (id, affiliate_id, inquiry_id, status, gross_cents, commission_pct, commission_cents, payout_id, notes, created_at) values
  -- Vance Hardin: Whitfield, paid
  ('55555555-0001-0000-0000-000000000001',
   '33333333-0001-0000-0000-000000000002',
   '22222222-0001-0000-0000-000000000001',
   'paid',
   5800000, 8.00, 464000,
   '44444444-0001-0000-0000-000000000001',
   'Whitfield Ultra-Luxe — eastern valleys helicopter trip. Closed.',
   now() - interval '11 days'),

  -- Hampton: Castellanos in proposal — pending estimate
  ('55555555-0001-0000-0000-000000000002',
   '33333333-0001-0000-0000-000000000001',
   '22222222-0001-0000-0000-000000000002',
   'pending',
   2200000, 10.00, 220000,
   null,
   'Castellanos family — Boutique-Luxe estimate at $22K, pending close.',
   now() - interval '4 days');
