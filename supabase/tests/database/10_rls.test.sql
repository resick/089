-- Row level security as anon, as another signed-in user and as staff
-- (DATABASE §4). Fixtures are obviously fake and rolled back at the end.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(30);

-- Fixtures (as the table owner, which bypasses RLS) ---------------------------
-- c… city · a… active place · b… active place with draft editorial ·
-- p… pending place · d… deleted place

insert into public.cities
  (id, slug, name, country_code, timezone, default_locale, locales, bbox, center, holiday_region)
values (
  'c0000000-0000-4000-8000-000000000001', 'testburg-rls', '{"en": "Testburg RLS"}', 'DE',
  'Europe/Berlin', 'en', '{en}',
  st_makeenvelope(0, 0, 0.1, 0.1, 4326)::geography,
  st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography,
  'DE-BY'
);

insert into public.places (id, city_id, slug, name, location, status, deleted_at) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'test-place-a', 'Test Place A', st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography, 'active', null),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'test-place-b', 'Test Place B', st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography, 'active', null),
  ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'test-place-p', 'Test Place P', st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography, 'pending', null),
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'test-place-d', 'Test Place D', st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography, 'active', now());

insert into public.place_categories (place_id, category_id, is_primary)
select p.id, c.id, true
from public.places p, public.categories c
where p.city_id = 'c0000000-0000-4000-8000-000000000001' and c.slug = 'museums';

insert into public.place_open_windows (place_id, during, source)
select id, tstzrange(now() - interval '1 hour', now() + interval '1 hour'), 'osm'
from public.places where city_id = 'c0000000-0000-4000-8000-000000000001';

insert into public.place_editorial (place_id, summary, status) values
  ('a0000000-0000-4000-8000-000000000001', '{"en": "Test summary A"}', 'published'),
  ('b0000000-0000-4000-8000-000000000001', '{"en": "Test summary B"}', 'draft'),
  ('e0000000-0000-4000-8000-000000000001', '{"en": "Test summary P"}', 'published');

insert into public.place_sources
  (place_id, provider, external_id, license, attribution, raw, content_hash, fetched_at)
values
  ('a0000000-0000-4000-8000-000000000001', 'osm', 'test/n1', 'ODbL-1.0',
   '© OpenStreetMap contributors', '{}', 'test-hash', now());

insert into public.media
  (id, owner_type, owner_id, storage_path, credit, license, moderation_status) values
  ('f0000000-0000-4000-8000-000000000001', 'place', 'a0000000-0000-4000-8000-000000000001',
   'test/approved.webp', 'Test Credit', 'CC-BY-4.0', 'approved'),
  ('f0000000-0000-4000-8000-000000000002', 'place', 'a0000000-0000-4000-8000-000000000001',
   'test/pending.webp', 'Test Credit', 'CC-BY-4.0', 'pending');

insert into public.collections (id, city_id, slug, title, status, visible_from, visible_to) values
  ('10000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'test-live', '{"en": "Test Live"}', 'published', now() - interval '1 day', now() + interval '1 day'),
  ('10000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001',
   'test-future', '{"en": "Test Future"}', 'published', now() + interval '1 day', null),
  ('10000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001',
   'test-draft', '{"en": "Test Draft"}', 'draft', null, null);

insert into public.collection_items (collection_id, item_type, item_id)
select id, 'place', 'a0000000-0000-4000-8000-000000000001'
from public.collections where city_id = 'c0000000-0000-4000-8000-000000000001';

insert into public.ingest_runs (source) values ('test');

-- Anonymous visitor -------------------------------------------------------------

select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select set_eq(
  $$ select slug from public.places where city_id = 'c0000000-0000-4000-8000-000000000001' $$,
  array['test-place-a', 'test-place-b'],
  'anon sees only active, undeleted places'
);
select set_eq(
  $$ select p.slug from public.place_categories pc join public.places p on p.id = pc.place_id
     where p.city_id = 'c0000000-0000-4000-8000-000000000001' $$,
  array['test-place-a', 'test-place-b'],
  'anon sees categories of visible places only'
);
select is(
  (select count(*)::int from public.place_open_windows
   where place_id in ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001')),
  0,
  'anon sees no opening windows of hidden places'
);
select set_eq(
  $$ select summary ->> 'en' from public.place_editorial
     where place_id in (select id from public.places where city_id = 'c0000000-0000-4000-8000-000000000001') $$,
  array['Test summary A'],
  'anon sees published editorial of visible places only'
);
select set_eq(
  $$ select storage_path from public.media where owner_id = 'a0000000-0000-4000-8000-000000000001' $$,
  array['test/approved.webp'],
  'anon sees approved media only'
);
select set_eq(
  $$ select slug from public.collections where city_id = 'c0000000-0000-4000-8000-000000000001' $$,
  array['test-live'],
  'anon sees published collections inside their visibility window only'
);
select is(
  (select count(*)::int from public.collection_items
   where item_id = 'a0000000-0000-4000-8000-000000000001'),
  1,
  'anon sees items of live collections only'
);
select throws_ok(
  $$ select * from public.place_sources $$,
  '42501', null, 'anon cannot read raw source records'
);
select throws_ok(
  $$ select * from public.ingest_runs $$,
  '42501', null, 'anon cannot read ingest runs'
);
select throws_ok(
  $$ insert into public.places (city_id, slug, name, location)
     values ('c0000000-0000-4000-8000-000000000001', 'test-anon', 'Test Anon',
             st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography) $$,
  '42501', null, 'anon cannot create places'
);

reset role;

-- Another signed-in user (no staff role) ---------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-4000-8000-0000000000a1", "role": "authenticated"}',
  true
);
set local role authenticated;

select set_eq(
  $$ select slug from public.places where city_id = 'c0000000-0000-4000-8000-000000000001' $$,
  array['test-place-a', 'test-place-b'],
  'users see only active, undeleted places'
);
select is_empty(
  $$ select id from public.place_sources $$,
  'users cannot read raw source records'
);
select is_empty(
  $$ select id from public.audit_log $$,
  'users cannot read the audit log'
);
select throws_ok(
  $$ insert into public.places (city_id, slug, name, location)
     values ('c0000000-0000-4000-8000-000000000001', 'test-user', 'Test User',
             st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography) $$,
  '42501', null, 'users cannot create places'
);
select throws_ok(
  $$ insert into public.place_editorial (place_id, status)
     values ('d0000000-0000-4000-8000-000000000001', 'published') $$,
  '42501', null, 'users cannot write editorial content'
);

update public.places set name = 'Changed by a user' where id = 'a0000000-0000-4000-8000-000000000001';
reset role;
select is(
  (select name from public.places where id = 'a0000000-0000-4000-8000-000000000001'),
  'Test Place A',
  'users cannot change places'
);

-- Editor ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-4000-8000-0000000000e1", "role": "authenticated", "app_metadata": {"role": "editor"}}',
  true
);
set local role authenticated;

select set_eq(
  $$ select slug from public.places where city_id = 'c0000000-0000-4000-8000-000000000001' $$,
  array['test-place-a', 'test-place-b', 'test-place-p', 'test-place-d'],
  'editors see every place, including pending and deleted'
);
select is(
  (select count(*)::int from public.place_sources where external_id = 'test/n1'),
  1,
  'editors read raw source records'
);
select is(
  (select count(*)::int from public.place_editorial
   where place_id in (select id from public.places where city_id = 'c0000000-0000-4000-8000-000000000001')),
  3,
  'editors see drafts'
);
select is(
  (select count(*)::int from public.collections where city_id = 'c0000000-0000-4000-8000-000000000001'),
  3,
  'editors see every collection'
);
select is(
  (select count(*)::int from public.ingest_runs where source = 'test'),
  1,
  'editors read ingest runs'
);

update public.places set name = 'Test Place A (edited)' where id = 'a0000000-0000-4000-8000-000000000001';

select is(
  (select name from public.places where id = 'a0000000-0000-4000-8000-000000000001'),
  'Test Place A (edited)',
  'editors can change places'
);
select is(
  (select diff -> 'name' from public.audit_log
   where table_name = 'places' and row_id = 'a0000000-0000-4000-8000-000000000001'
     and actor_id = '00000000-0000-4000-8000-0000000000e1' and action = 'UPDATE'),
  '{"old": "Test Place A", "new": "Test Place A (edited)"}'::jsonb,
  'editor changes are audited with the old and new value'
);
select throws_ok(
  $$ insert into public.cities
       (slug, name, country_code, timezone, default_locale, locales, bbox, center, holiday_region)
     values ('test-editor-city', '{"en": "Test"}', 'DE', 'Europe/Berlin', 'en', '{en}',
             st_makeenvelope(0, 0, 0.1, 0.1, 4326)::geography,
             st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography, 'DE-BY') $$,
  '42501', null, 'editors cannot create cities'
);
select throws_ok(
  $$ insert into public.audit_log (action, table_name, diff) values ('INSERT', 'places', '{}') $$,
  '42501', null, 'editors cannot write to the audit log directly'
);

reset role;

-- Admin ------------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"sub": "00000000-0000-4000-8000-0000000000ad", "role": "authenticated", "app_metadata": {"role": "admin"}}',
  true
);
set local role authenticated;

select lives_ok(
  $$ insert into public.tags (slug, tag_group, name) values ('test-admin-tag', 'vibe', '{"en": "Test"}') $$,
  'admins manage reference data'
);

reset role;

-- Writes without a user (ingestion via service role) ------------------------------------

select set_config('request.jwt.claims', '{"role": "service_role"}', true);
update public.places set name = 'Test Place B (ingested)' where id = 'b0000000-0000-4000-8000-000000000001';
select is(
  (select count(*)::int from public.audit_log where row_id = 'b0000000-0000-4000-8000-000000000001'),
  0,
  'writes without a signed-in user are not audited'
);

-- Editorial rules ------------------------------------------------------------------------

insert into public.place_tags (place_id, tag_id)
select 'a0000000-0000-4000-8000-000000000001', id from public.tags where slug in ('outdoor', 'date');
select is(
  (select good_for from public.place_editorial where place_id = 'a0000000-0000-4000-8000-000000000001'),
  array['date', 'outdoor'],
  'good_for follows the place''s tags'
);

delete from public.place_tags
where place_id = 'a0000000-0000-4000-8000-000000000001'
  and tag_id = (select id from public.tags where slug = 'outdoor');
select is(
  (select good_for from public.place_editorial where place_id = 'a0000000-0000-4000-8000-000000000001'),
  array['date'],
  'good_for drops removed tags'
);

select throws_ok(
  $$ insert into public.collections (city_id, slug, title, kind)
     values ('c0000000-0000-4000-8000-000000000001', 'test-sponsored', '{"en": "Test"}', 'sponsored') $$,
  '23514', null, 'sponsored collections must name the sponsor'
);

select * from finish();
rollback;
