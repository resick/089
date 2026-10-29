-- Local development fixtures. Applied by `supabase db reset` / `supabase start`
-- only, never pushed to a hosted project. Obviously fake on purpose
-- (CLAUDE.md rule 3): a made-up city with numbered test places, nowhere near
-- Munich, so it can never be mistaken for real data.

insert into public.cities
  (id, slug, name, country_code, timezone, default_locale, locales, bbox, center, holiday_region)
values (
  '00000000-0000-4000-8000-000000000001',
  'testburg',
  '{"de": "Testburg", "en": "Testburg"}',
  'DE',
  'Europe/Berlin',
  'de',
  '{de,en}',
  extensions.st_makeenvelope(0.0, 0.0, 0.1, 0.1, 4326)::extensions.geography,
  extensions.st_setsrid(extensions.st_makepoint(0.05, 0.05), 4326)::extensions.geography,
  'DE-BY'
);

insert into public.places (id, city_id, slug, name, location, status, tier) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001',
   'test-place-1', 'Test Place 1',
   extensions.st_setsrid(extensions.st_makepoint(0.051, 0.051), 4326)::extensions.geography,
   'active', 'featured'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000001',
   'test-place-2', 'Test Place 2',
   extensions.st_setsrid(extensions.st_makepoint(0.052, 0.049), 4326)::extensions.geography,
   'active', 'basic'),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000001',
   'test-place-3', 'Test Place 3 (pending)',
   extensions.st_setsrid(extensions.st_makepoint(0.048, 0.053), 4326)::extensions.geography,
   'pending', 'basic');

insert into public.place_categories (place_id, category_id, is_primary)
select p.id, c.id, true
from (values
  ('00000000-0000-4000-8000-000000000101'::uuid, 'beer-gardens'),
  ('00000000-0000-4000-8000-000000000102'::uuid, 'museums'),
  ('00000000-0000-4000-8000-000000000103'::uuid, 'cafes')
) as p (id, slug)
join public.categories c on c.slug = p.slug;

insert into public.place_editorial (place_id, summary, price_level, status) values
  ('00000000-0000-4000-8000-000000000101',
   '{"de": "Testzusammenfassung 1", "en": "Test summary 1"}', 2, 'published');

insert into public.place_tags (place_id, tag_id)
select '00000000-0000-4000-8000-000000000101', id from public.tags where slug in ('outdoor', 'groups');
