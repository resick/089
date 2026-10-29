-- Foundation for every later migration: extensions, shared helpers and role
-- checks (docs/DATABASE.md §1 principles, §4 roles).
--
-- Helpers live in the `private` schema, which the Data API doesn't expose, so
-- clients can't call them as RPCs. RLS policies and CHECK constraints run as
-- the calling role, so anon/authenticated get USAGE on the schema.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create schema private;
grant usage on schema private to anon, authenticated, service_role;

-- Locales content can be written in. Keep in sync with SUPPORTED_LOCALES in
-- packages/core/src/locale.ts.
create function private.supported_locales()
returns text[]
language sql
immutable
parallel safe
set search_path = ''
as $$
  select array['de', 'en']
$$;

-- Translatable text is jsonb like {"de": "…", "en": "…"} (DATABASE §1.3): an
-- object with at least one supported locale, every value a non-blank string.
-- NULL passes, so nullable columns can use the check directly.
create function private.is_i18n(value jsonb)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select jsonb_typeof(value) = 'object'
    and value <> '{}'::jsonb
    and not exists (
      select 1
      from jsonb_each(value) as entry (locale, text)
      where entry.locale <> all (private.supported_locales())
        or jsonb_typeof(entry.text) <> 'string'
        or btrim(entry.text #>> '{}') = ''
    )
$$;

-- URL-safe identifiers: "beer-gardens", "test-place-1".
create function private.is_slug(value text)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select value ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
$$;

-- Lower-cased, accent-free name for trigram matching (ingestion dedup, typo
-- search). Wrapped because unaccent() itself isn't immutable, so it can't be
-- used in an index expression directly.
create function private.normalize_name(value text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, value))
$$;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- Staff roles come from the JWT's app_metadata, which only the service role
-- can set (users can't edit it themselves).
create function private.app_role()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create function private.is_editor()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.app_role() in ('editor', 'admin')
$$;

create function private.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select private.app_role() = 'admin'
$$;
