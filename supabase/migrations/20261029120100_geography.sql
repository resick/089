-- Cities and their neighbourhoods (DATABASE §2.1). Public reference data:
-- everyone reads, only admins write.

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (private.is_slug(slug)),
  name jsonb not null check (private.is_i18n(name)),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  -- IANA zone; all "now", "today" and opening-hours logic runs in it.
  timezone text not null,
  default_locale text not null,
  locales text[] not null,
  bbox extensions.geography(Polygon, 4326) not null,
  center extensions.geography(Point, 4326) not null,
  -- ISO 3166-2 region for public holidays in opening hours, e.g. 'DE-BY'.
  holiday_region text not null check (holiday_region ~ '^[A-Z]{2}-[A-Z0-9]{1,3}$'),
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (locales <@ private.supported_locales()),
  check (default_locale = any (locales))
);

create table public.neighbourhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id),
  slug text not null check (private.is_slug(slug)),
  name jsonb not null check (private.is_i18n(name)),
  boundary extensions.geography(MultiPolygon, 4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

create index neighbourhoods_boundary_idx on public.neighbourhoods using gist (boundary);

create trigger set_updated_at before update on public.cities
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.neighbourhoods
  for each row execute function private.set_updated_at();

alter table public.cities enable row level security;
alter table public.neighbourhoods enable row level security;

create policy "Cities are public" on public.cities
  for select to anon, authenticated using (true);
create policy "Admins manage cities" on public.cities
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Neighbourhoods are public" on public.neighbourhoods
  for select to anon, authenticated using (true);
create policy "Admins manage neighbourhoods" on public.neighbourhoods
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Explicit grants instead of relying on Supabase's default privileges; RLS
-- then decides which rows each role sees.
revoke all on public.cities, public.neighbourhoods from anon, authenticated;
grant select on public.cities, public.neighbourhoods to anon, authenticated;
grant insert, update, delete on public.cities, public.neighbourhoods to authenticated;
grant all on public.cities, public.neighbourhoods to service_role;
