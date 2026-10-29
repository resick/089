-- Data rules the database enforces on its own, whoever writes.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

insert into public.cities
  (id, slug, name, country_code, timezone, default_locale, locales, bbox, center, holiday_region)
values (
  'c0000000-0000-4000-8000-000000000002', 'testburg-rules', '{"en": "Testburg Rules"}', 'DE',
  'Europe/Berlin', 'en', '{en}',
  st_makeenvelope(0, 0, 0.1, 0.1, 4326)::geography,
  st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography,
  'DE-BY'
);

insert into public.places (id, city_id, slug, name, location) values
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002',
   'test-place-1', 'Test Place 1', st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography);

insert into public.place_open_windows (place_id, during, source) values
  ('a0000000-0000-4000-8000-000000000002', '[2026-11-02 10:00+01, 2026-11-02 18:00+01)', 'osm');

select throws_ok(
  $$ insert into public.place_open_windows (place_id, during, source) values
     ('a0000000-0000-4000-8000-000000000002', '[2026-11-02 17:00+01, 2026-11-02 20:00+01)', 'osm') $$,
  '23P01', null, 'a place''s opening windows cannot overlap'
);

select lives_ok(
  $$ insert into public.place_open_windows (place_id, during, source) values
     ('a0000000-0000-4000-8000-000000000002', '[2026-11-02 18:00+01, 2026-11-02 22:00+01)', 'osm') $$,
  'back-to-back opening windows are fine'
);

select throws_ok(
  $$ insert into public.opening_exceptions (place_id, on_date, closed, opens) values
     ('a0000000-0000-4000-8000-000000000002', '2026-12-24', true, '10:00') $$,
  '23514', null, 'a closed day has no opening times'
);

select throws_ok(
  $$ insert into public.media (owner_type, owner_id, storage_path, credit, license) values
     ('place', 'a0000000-0000-4000-8000-000000000002', 'test/no-credit.webp', ' ', 'CC-BY-4.0') $$,
  '23514', null, 'media needs a credit'
);

select throws_ok(
  $$ insert into public.places (city_id, slug, name, location) values
     ('c0000000-0000-4000-8000-000000000002', 'Test Place!', 'Test Place 2',
      st_setsrid(st_makepoint(0.05, 0.05), 4326)::geography) $$,
  '23514', null, 'slugs must be URL-safe'
);

select throws_ok(
  $$ insert into public.place_categories (place_id, category_id, is_primary)
     select 'a0000000-0000-4000-8000-000000000002', id, true
     from public.categories where slug in ('museums', 'galleries') $$,
  '23505', null, 'a place has at most one primary category'
);

select throws_ok(
  $$ insert into public.place_editorial (place_id, summary) values
     ('a0000000-0000-4000-8000-000000000002', '{"fr": "Résumé de test"}') $$,
  '23514', null, 'editorial text only uses supported locales'
);

select * from finish();
rollback;
