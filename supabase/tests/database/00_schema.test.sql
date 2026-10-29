-- Schema-wide guarantees and reference data. Runs in a transaction that is
-- rolled back, so it is safe against a hosted project too.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(19);

-- RLS everywhere (DATABASE §1.6) -------------------------------------------

select is(
  array(
    select c.relname::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
    order by 1
  ),
  '{}'::text[],
  'every public table has row level security enabled'
);

select is(
  array(
    select c.relname::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and not exists (select 1 from pg_policy p where p.polrelid = c.oid)
    order by 1
  ),
  '{}'::text[],
  'every public table has at least one policy'
);

select is(
  array(
    select c.relname::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and has_table_privilege('anon', c.oid, 'INSERT, UPDATE, DELETE, TRUNCATE')
    order by 1
  ),
  '{}'::text[],
  'anon cannot write to any table'
);

select is(
  array(
    select c.relname::text from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and not exists (
        select 1 from pg_trigger t
        where t.tgrelid = c.oid and t.tgname = 'set_updated_at'
      )
      and exists (
        select 1 from pg_attribute a
        where a.attrelid = c.oid and a.attname = 'updated_at' and not a.attisdropped
      )
    order by 1
  ),
  '{}'::text[],
  'every table with updated_at maintains it with a trigger'
);

-- Translatable text ---------------------------------------------------------

select ok(private.is_i18n('{"de": "Hallo", "en": "Hello"}'), 'is_i18n accepts de + en');
select ok(private.is_i18n('{"en": "Hello"}'), 'is_i18n accepts a single locale');
select ok(not private.is_i18n('{}'), 'is_i18n rejects an empty object');
select ok(not private.is_i18n('{"fr": "Bonjour"}'), 'is_i18n rejects unsupported locales');
select ok(not private.is_i18n('{"de": 1}'), 'is_i18n rejects non-string values');
select ok(not private.is_i18n('{"de": "  "}'), 'is_i18n rejects blank text');
select ok(not private.is_i18n('"Hallo"'), 'is_i18n rejects a plain string');

-- Reference data --------------------------------------------------------------

select set_eq(
  $$ select slug from public.categories where parent_id is null $$,
  array['food', 'nightlife', 'entertainment', 'culture', 'tourism',
        'activities', 'outdoors', 'shopping', 'wellness', 'events'],
  'top-level categories match the app''s category tokens'
);

select is(
  (select count(*)::int from public.categories c
   where c.parent_id is null
     and not exists (select 1 from public.categories s where s.parent_id = c.id)),
  0,
  'every top-level category has subcategories'
);

select ok(
  (select bool_and(private.is_i18n(name) and name ? 'de' and name ? 'en') from public.categories),
  'every category is named in German and English'
);

select ok(
  (select bool_and(name ? 'de' and name ? 'en') from public.tags),
  'every tag is named in German and English'
);

select is(
  (select timezone || ' ' || holiday_region from public.cities where slug = 'muenchen'),
  'Europe/Berlin DE-BY',
  'Munich uses Berlin time and Bavarian holidays'
);

select ok(
  (select extensions.st_covers(bbox, center) from public.cities where slug = 'muenchen'),
  'Munich''s center lies inside its bounding box'
);

-- Taxonomy rules ---------------------------------------------------------------

select throws_ok(
  $$ insert into public.categories (parent_id, slug, name)
     select id, 'test-grandchild', '{"en": "Test"}' from public.categories where slug = 'restaurants' $$,
  '23514',
  null,
  'categories are at most two levels deep'
);

select throws_ok(
  $$ insert into public.categories (slug, name) values ('test-top', '{"en": "Test"}') $$,
  '23514',
  null,
  'top-level categories need an icon and a colour token'
);

select * from finish();
rollback;
