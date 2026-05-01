-- ============================================================
-- Bhutan-Luxe: Seed data for the CRM
-- Migration: 0002_seed_data
-- ============================================================
-- Realistic sample inquiries across all pipeline stages, tiers,
-- and US-luxury-traveler personas. Activity log shows progression
-- on the older deals so the timeline component has content.
-- ============================================================

-- Wipe any prior seed runs (idempotent if you re-run this)
delete from public.activity_log;
delete from public.inquiries;
delete from public.people;

-- ────────────────────────────────────────────────────────────
-- People
-- ────────────────────────────────────────────────────────────
insert into public.people (id, email, name, phone, city, created_at) values
  ('11111111-0001-0000-0000-000000000001', 'margaret.whitfield@gmail.com',  'Margaret & James Whitfield', '+1 214 555 0143', 'Dallas, TX',     now() - interval '38 days'),
  ('11111111-0001-0000-0000-000000000002', 'rcastellanos@castellaw.com',     'Robert Castellanos',         '+1 713 555 0211', 'Houston, TX',    now() - interval '24 days'),
  ('11111111-0001-0000-0000-000000000003', 'sarah.chen@hey.com',             'Sarah Chen',                 '+1 512 555 0099', 'Austin, TX',     now() - interval '11 days'),
  ('11111111-0001-0000-0000-000000000004', 'b.martinez@martinezfamily.org',  'Beatrice Martinez',          '+1 210 555 0177', 'San Antonio, TX', now() - interval '17 days'),
  ('11111111-0001-0000-0000-000000000005', 'th.alves@cypressholdings.com',   'Thomas Alves',               '+1 832 555 0066', 'Houston, TX',    now() - interval '6 days'),
  ('11111111-0001-0000-0000-000000000006', 'eleanor.park@parkfamily.us',     'Eleanor Park',               '+1 469 555 0233', 'Plano, TX',      now() - interval '48 days'),
  ('11111111-0001-0000-0000-000000000007', 'jcwong@wongventures.com',        'J.C. Wong',                  '+1 415 555 0188', 'Atherton, CA',   now() - interval '3 days'),
  ('11111111-0001-0000-0000-000000000008', 'priya.shah@shahfamily.io',       'Priya Shah',                 '+1 646 555 0044', 'New York, NY',   now() - interval '2 days'),
  ('11111111-0001-0000-0000-000000000009', 'd.kessler@kessleradvisors.com',  'Daniel Kessler',             '+1 305 555 0301', 'Miami Beach, FL', now() - interval '1 days'),
  ('11111111-0001-0000-0000-000000000010', 'lwhitman@whitmanrealty.tx',      'Lillian Whitman',            null,              'Fort Worth, TX', now() - interval '14 hours');

-- ────────────────────────────────────────────────────────────
-- Inquiries
-- ────────────────────────────────────────────────────────────
insert into public.inquiries (id, person_id, type, tier, travel_window, group_size, notes, status, source, ref_code, created_at) values
  -- 1. Won deal — the Whitfields, Ultra-Luxe with full helicopter
  ('22222222-0001-0000-0000-000000000001',
   '11111111-0001-0000-0000-000000000001',
   'inquiry', 'ultra-luxe',
   'October 2026, fixed dates flexible by ±1 week', 2,
   'Anniversary trip. James has a back issue, helicopter access preferred over treks. Margaret is a serious photographer — would love the eastern valleys.',
   'won', 'website', 'BL-2026-0143',
   now() - interval '38 days'),

  -- 2. Discovery call scheduled — Castellanos, Boutique-Luxe
  ('22222222-0001-0000-0000-000000000002',
   '11111111-0001-0000-0000-000000000002',
   'inquiry', 'boutique-luxe',
   'Spring 2027', 4,
   'Family of four with two kids (ages 14 and 16). Looking at the Boutique tier with optional helicopter for the parents while kids stay at lodge.',
   'discovery_call', 'website', 'BL-2026-0210',
   now() - interval '24 days'),

  -- 3. Recently contacted — Sarah Chen, Luxe (entry tier)
  ('22222222-0001-0000-0000-000000000003',
   '11111111-0001-0000-0000-000000000003',
   'inquiry', 'luxe',
   'Late 2026 or early 2027', 1,
   'Solo trip, 7-day window. First time considering Bhutan. Mostly cultural interests — monasteries, food, less interested in trekking.',
   'contacted', 'website', 'BL-2026-0311',
   now() - interval '11 days'),

  -- 4. Proposal sent — Martinez, Bespoke
  ('22222222-0001-0000-0000-000000000004',
   '11111111-0001-0000-0000-000000000004',
   'bespoke', 'bespoke',
   '14 nights in November 2026', 6,
   'Multi-generational trip — three couples. Wants full bespoke itinerary including a private day with a textile master in Bumthang. Budget is open.',
   'proposal', 'website', 'BL-2026-0244',
   now() - interval '17 days'),

  -- 5. New, just submitted — Alves, Ultra-Luxe
  ('22222222-0001-0000-0000-000000000005',
   '11111111-0001-0000-0000-000000000005',
   'inquiry', 'ultra-luxe',
   'Open — flexible', 2,
   'Has done Africa and Antarctica. Looking for "the next thing." Mentioned a friend at the Houston Astros referred them.',
   'new_lead', 'website', 'BL-2026-0388',
   now() - interval '6 days'),

  -- 6. Lost — Park, Luxe (price was wrong tier for them)
  ('22222222-0001-0000-0000-000000000006',
   '11111111-0001-0000-0000-000000000006',
   'inquiry', 'luxe',
   'Summer 2026', 3,
   'Reached out for the entry tier but ultimately decided Bhutan was outside their travel window for this year. Wants to be remembered for 2027.',
   'lost', 'website', 'BL-2026-0091',
   now() - interval '48 days'),

  -- 7. New, just submitted — Wong, Ultra-Luxe (referral from Whitfield!)
  ('22222222-0001-0000-0000-000000000007',
   '11111111-0001-0000-0000-000000000007',
   'inquiry', 'ultra-luxe',
   'September 2026', 2,
   'Referral from the Whitfields (BL-2026-0143). Wife is a published photographer. Wants to be in touch immediately.',
   'new_lead', 'referral', 'BL-2026-0421',
   now() - interval '3 days'),

  -- 8. New — Shah, Boutique-Luxe
  ('22222222-0001-0000-0000-000000000008',
   '11111111-0001-0000-0000-000000000008',
   'inquiry', 'boutique-luxe',
   'Late spring 2027', 2,
   'Honeymoon. They explicitly asked us not to contact during business hours — both work in finance and prefer evening calls.',
   'new_lead', 'website', 'BL-2026-0455',
   now() - interval '2 days'),

  -- 9. Contacted — Kessler, Bespoke
  ('22222222-0001-0000-0000-000000000009',
   '11111111-0001-0000-0000-000000000009',
   'bespoke', 'bespoke',
   'Open', 8,
   'A group of college friends — eight men, all turning 60 the same year. Wants a "milestone trip." Heli access important. Some are not avid hikers.',
   'contacted', 'website', 'BL-2026-0467',
   now() - interval '1 days'),

  -- 10. Just-arrived new lead — Whitman, no tier yet
  ('22222222-0001-0000-0000-000000000010',
   '11111111-0001-0000-0000-000000000010',
   'inquiry', '',
   '', null,
   'Submitted form with minimal info. No phone given. Listed Bhutan-Luxe as "saw at private event."',
   'new_lead', 'website', 'BL-2026-0481',
   now() - interval '14 hours');

-- ────────────────────────────────────────────────────────────
-- Activity log
-- Realistic CRM trail for the older deals
-- ────────────────────────────────────────────────────────────

-- Whitfield (won): full sales cycle
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'inquiry_received', '{"source":"website","tier":"ultra-luxe"}'::jsonb, null,
   now() - interval '38 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '37 days 18 hours'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'note', '{"text":"Called Margaret, very engaged. James was on the line. Booked a discovery call for next Tuesday."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '37 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'status_changed', '{"from":"contacted","to":"discovery_call"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '32 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'note', '{"text":"Discovery went well. James asked about helicopter safety record — sent the operator brief from MyBhutan. Margaret wants to know which valleys we have access to."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '31 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'status_changed', '{"from":"discovery_call","to":"proposal"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '24 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'note', '{"text":"Sent full proposal with three Lhuentse landing options. Quote at $58K for the pair."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '23 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'status_changed', '{"from":"proposal","to":"won"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '11 days'),
  ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001',
   'note', '{"text":"Deposit received. Margaret already asking about the photographer she can connect with in Thimphu — referring her to Karma."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '10 days');

-- Castellanos (discovery_call)
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000002',
   'inquiry_received', '{"source":"website","tier":"boutique-luxe"}'::jsonb, null,
   now() - interval '24 days'),
  ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000002',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '23 days 14 hours'),
  ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000002',
   'note', '{"text":"Robert is the decision-maker. Confirmed both kids will travel — they want the safest version of the Boutique itinerary."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '22 days'),
  ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000002',
   'status_changed', '{"from":"contacted","to":"discovery_call"}'::jsonb, 'see@bhutan-luxe.com',
   now() - interval '5 days'),
  ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000002',
   'note', '{"text":"Discovery call scheduled for next Thursday at 7pm CST. Sending him the welcome packet ahead of time."}'::jsonb, 'see@bhutan-luxe.com',
   now() - interval '5 days');

-- Sarah Chen (contacted)
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000003', '11111111-0001-0000-0000-000000000003',
   'inquiry_received', '{"source":"website","tier":"luxe"}'::jsonb, null,
   now() - interval '11 days'),
  ('22222222-0001-0000-0000-000000000003', '11111111-0001-0000-0000-000000000003',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '10 days 22 hours'),
  ('22222222-0001-0000-0000-000000000003', '11111111-0001-0000-0000-000000000003',
   'note', '{"text":"Sent intro email + 7-day itinerary sample. She replied within an hour with thoughtful questions about food and pace. Promising lead."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '10 days');

-- Martinez (proposal)
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'inquiry_received', '{"source":"website","tier":"bespoke"}'::jsonb, null,
   now() - interval '17 days'),
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '16 days'),
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'note', '{"text":"Multi-generational, three couples. Beatrice is the matriarch and the buyer. She wants a private textile experience. Tashi can probably arrange this."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '16 days'),
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'status_changed', '{"from":"contacted","to":"discovery_call"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '12 days'),
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'status_changed', '{"from":"discovery_call","to":"proposal"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '4 days'),
  ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000004',
   'note', '{"text":"Sent fully bespoke 14-night proposal. Pricing came in at $172K for six. Awaiting feedback."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '4 days');

-- Park (lost)
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000006', '11111111-0001-0000-0000-000000000006',
   'inquiry_received', '{"source":"website","tier":"luxe"}'::jsonb, null,
   now() - interval '48 days'),
  ('22222222-0001-0000-0000-000000000006', '11111111-0001-0000-0000-000000000006',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '47 days'),
  ('22222222-0001-0000-0000-000000000006', '11111111-0001-0000-0000-000000000006',
   'note', '{"text":"Eleanor is interested but their summer is fully booked already. Asked to be remembered for 2027 — added a calendar reminder for January."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '46 days'),
  ('22222222-0001-0000-0000-000000000006', '11111111-0001-0000-0000-000000000006',
   'status_changed', '{"from":"contacted","to":"lost"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '46 days');

-- Kessler (contacted)
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000009', '11111111-0001-0000-0000-000000000009',
   'inquiry_received', '{"source":"website","tier":"bespoke"}'::jsonb, null,
   now() - interval '1 days'),
  ('22222222-0001-0000-0000-000000000009', '11111111-0001-0000-0000-000000000009',
   'note', '{"text":"Very high-fit. 8-person 60th-birthday trip — typically a $25–35K/head deal. Need to call him today."}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '20 hours'),
  ('22222222-0001-0000-0000-000000000009', '11111111-0001-0000-0000-000000000009',
   'status_changed', '{"from":"new_lead","to":"contacted"}'::jsonb, 'eric@bhutan-luxe.com',
   now() - interval '18 hours');

-- New leads have just the receipt entry
insert into public.activity_log (inquiry_id, person_id, action, details, actor_email, created_at) values
  ('22222222-0001-0000-0000-000000000005', '11111111-0001-0000-0000-000000000005',
   'inquiry_received', '{"source":"website","tier":"ultra-luxe"}'::jsonb, null,
   now() - interval '6 days'),
  ('22222222-0001-0000-0000-000000000007', '11111111-0001-0000-0000-000000000007',
   'inquiry_received', '{"source":"referral","tier":"ultra-luxe"}'::jsonb, null,
   now() - interval '3 days'),
  ('22222222-0001-0000-0000-000000000008', '11111111-0001-0000-0000-000000000008',
   'inquiry_received', '{"source":"website","tier":"boutique-luxe"}'::jsonb, null,
   now() - interval '2 days'),
  ('22222222-0001-0000-0000-000000000010', '11111111-0001-0000-0000-000000000010',
   'inquiry_received', '{"source":"website"}'::jsonb, null,
   now() - interval '14 hours');
