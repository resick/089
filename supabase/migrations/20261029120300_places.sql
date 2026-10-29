-- Places: the base layer built from open data (DATABASE §2.2). These tables
-- may become an ODbL Derivative Database of OSM, so editorial content lives
-- in separate tables (next migration) and never copies values from here.

create table public.places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id),
  neighbourhood_id uuid references public.neighbourhoods (id) on delete set null,
  slug text not null check (private.is_slug(slug)),
  name text not null check (btrim(name) <> ''),
  -- Only for places with translated names (landmarks); most have one name.
  name_i18n jsonb check (private.is_i18n(name_i18n)),
  location extensions.geography(Point, 4326) not null,
  street text,
  house_number text,
  postcode text,
  locality text,
  phone text,
  website text check (website ~* '^https?://'),
  email text,
  -- Raw OSM opening_hours string: the source of truth that ingestion parses
  -- into place_open_windows.
  osm_opening_hours text,
  -- From OSM check_date or editorial verification.
  hours_checked_at date,
  wheelchair text check (wheelchair in ('yes', 'limited', 'no')),
  -- Category-specific, validated against categories.attribute_schema.
  attributes jsonb not null default '{}' check (jsonb_typeof(attributes) = 'object'),
  status text not null default 'pending'
    check (status in ('active', 'temporarily_closed', 'closed', 'pending')),
  tier text not null default 'basic' check (tier in ('basic', 'curated', 'featured')),
  quality_score real check (quality_score between 0 and 1),
  -- Which source each field came from, e.g. {"phone": "osm:n123", "website": "fsq_os:abc"}.
  field_sources jsonb not null default '{}' check (jsonb_typeof(field_sources) = 'object'),
  last_verified_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug)
);

create index places_location_idx on public.places using gist (location)
  where status = 'active' and deleted_at is null;
create index places_city_idx on public.places (city_id, status);
create index places_neighbourhood_idx on public.places (neighbourhood_id);
-- Dedup matching in ingestion (name similarity within a radius).
create index places_name_trgm_idx on public.places
  using gin (private.normalize_name(name) extensions.gin_trgm_ops);

create table public.place_categories (
  place_id uuid not null references public.places (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id, category_id)
);

create unique index place_categories_one_primary_idx on public.place_categories (place_id)
  where is_primary;
create index place_categories_category_idx on public.place_categories (category_id, place_id);

-- Raw records per source, kept for provenance and re-matching. place_id is
-- null for unmatched candidates waiting in the CMS review queue.
create table public.place_sources (
  id uuid primary key default gen_random_uuid(),
  place_id uuid references public.places (id) on delete set null,
  provider text not null
    check (provider in ('osm', 'fsq_os', 'overture', 'wikidata', 'owner', 'editorial')),
  external_id text not null,
  license text not null check (btrim(license) <> ''),
  attribution text not null check (btrim(attribution) <> ''),
  raw jsonb not null,
  content_hash text not null,
  fetched_at timestamptz not null,
  match_confidence real check (match_confidence between 0 and 1),
  match_status text not null default 'pending'
    check (match_status in ('auto', 'confirmed', 'rejected', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_id)
);

create index place_sources_place_idx on public.place_sources (place_id);
create index place_sources_review_idx on public.place_sources (match_status, provider)
  where place_id is null;

-- Opening hours precomputed as time ranges for the next 21 days (DATABASE
-- §1.5), so "open now" is one indexed range check. Rebuilt nightly by
-- deleting and re-inserting, so rows have no updated_at.
create table public.place_open_windows (
  place_id uuid not null references public.places (id) on delete cascade,
  during tstzrange not null
    check (not isempty(during) and not lower_inf(during) and not upper_inf(during)),
  source text not null check (source in ('osm', 'editorial', 'exception')),
  created_at timestamptz not null default now(),
  -- One place's windows never overlap, so "open at t" matches at most one row.
  constraint place_open_windows_no_overlap exclude using gist (place_id with =, during with &&)
);

create index place_open_windows_during_idx on public.place_open_windows using gist (during);

-- Editorial overrides for single days (holidays, closures). Either closed all
-- day, or open with both times; closes < opens means past midnight.
create table public.opening_exceptions (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  on_date date not null,
  closed boolean not null,
  opens time,
  closes time,
  note jsonb check (private.is_i18n(note)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, on_date),
  check (
    (closed and opens is null and closes is null)
    or (not closed and opens is not null and closes is not null)
  )
);

-- Public transport stops from the MVV GTFS feed (slice 4).
create table public.transit_stops (
  id text primary key, -- GTFS stop_id
  city_id uuid not null references public.cities (id),
  name text not null check (btrim(name) <> ''),
  modes text[] not null default '{}'
    check (modes <@ array['ubahn', 'sbahn', 'tram', 'bus', 'regional']),
  location extensions.geography(Point, 4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transit_stops_location_idx on public.transit_stops using gist (location);

create trigger set_updated_at before update on public.places
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.place_categories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.place_sources
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.opening_exceptions
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.transit_stops
  for each row execute function private.set_updated_at();

-- RLS. Child tables check "the place is visible to you" by querying places,
-- which applies the places policy for the same role.

alter table public.places enable row level security;
alter table public.place_categories enable row level security;
alter table public.place_sources enable row level security;
alter table public.place_open_windows enable row level security;
alter table public.opening_exceptions enable row level security;
alter table public.transit_stops enable row level security;

create policy "Active places are public" on public.places
  for select to anon, authenticated
  using ((status = 'active' and deleted_at is null) or (select private.is_editor()));
create policy "Editors manage places" on public.places
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Categories of visible places are public" on public.place_categories
  for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id));
create policy "Editors manage place categories" on public.place_categories
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

-- Raw source records are for staff only; ingestion writes with the service role.
create policy "Editors read place sources" on public.place_sources
  for select to authenticated using ((select private.is_editor()));

create policy "Open windows of visible places are public" on public.place_open_windows
  for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id));
create policy "Editors manage open windows" on public.place_open_windows
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Exceptions of visible places are public" on public.opening_exceptions
  for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id));
create policy "Editors manage opening exceptions" on public.opening_exceptions
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Transit stops are public" on public.transit_stops
  for select to anon, authenticated using (true);
create policy "Admins manage transit stops" on public.transit_stops
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

revoke all on public.places, public.place_categories, public.place_sources,
  public.place_open_windows, public.opening_exceptions, public.transit_stops
  from anon, authenticated;
grant select on public.places, public.place_categories, public.place_open_windows,
  public.opening_exceptions, public.transit_stops
  to anon, authenticated;
grant select on public.place_sources to authenticated;
grant insert, update, delete on public.places, public.place_categories,
  public.place_open_windows, public.opening_exceptions, public.transit_stops
  to authenticated;
grant all on public.places, public.place_categories, public.place_sources,
  public.place_open_windows, public.opening_exceptions, public.transit_stops
  to service_role;
