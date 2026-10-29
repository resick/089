# 089 — Database

_Postgres 15+ on Supabase (Frankfurt). Extensions: `postgis`, `pg_trgm`, `unaccent`, `btree_gist`, `pgcrypto`. Refines spec Part 6._

## 1. Design principles

1. **Two layers, kept apart (ODbL).** The _base layer_ (`places`, `place_sources`, `opening_*`) comes from open data and may become a Derivative Database of OSM. The _editorial layer_ (`place_editorial`, `media`, `collections`, editorial tags) is our own independent data. It references places by id and **never copies OSM-derived values**. See ANALYSIS §4.9.
2. **Provenance on every imported fact:** `place_sources` stores raw source records; `places.field_sources` records which source each field's value came from.
3. **Translatable text = `jsonb` `{ "de": "...", "en": "..." }`**, validated by a `CHECK (is_i18n(col))` function (keys must be in the supported-locale list, values strings). Simpler than translation tables at 2–5 locales. Generated `tsvector` columns per language.
4. **UUID v4 primary keys** (`gen_random_uuid()`); human-readable `slug`s for URLs; every table has `created_at`/`updated_at timestamptz` (trigger-maintained). Soft delete (`deleted_at`) only where users or editors may need to undo: places, events, lists, media.
5. **Time-varying facts are precomputed into ranges.** Opening hours and event occurrences become `tstzrange` rows covering the next 21 days, so "open now" and "this weekend" are a single indexed range check, with holidays, midnight crossings and DST already handled.
6. **RLS on every table, no exceptions.** Default deny. Reads of public content go through `anon`-readable policies or `SECURITY DEFINER` RPCs that only return published rows.

## 2. Schema

Types are abbreviated: `i18n` = `jsonb` with i18n check; `ts` = `timestamptz`; all tables also have `created_at`, `updated_at`.

### 2.1 Geography & taxonomy

```sql
cities (
  id uuid pk, slug text unique, name i18n, country_code char(2), timezone text,   -- 'Europe/Berlin'
  default_locale text, locales text[], bbox geography(Polygon), center geography(Point),
  holiday_region text,            -- 'DE-BY' for opening_hours PH evaluation
  is_live bool default false
)
neighbourhoods (id uuid pk, city_id fk, slug text, name i18n, boundary geography(MultiPolygon), unique(city_id, slug))
categories (
  id uuid pk, parent_id uuid fk null, slug text unique, name i18n, icon text,      -- lucide icon name
  color_token text,                -- 'cat.food' → DESIGN_SYSTEM.md
  attribute_schema jsonb,          -- JSON Schema subset; validated in app/CMS with zod generated from it
  osm_mappings jsonb, fsq_category_ids text[],  -- source → category mapping, edited in CMS
  sort int, is_active bool
)
tags (id uuid pk, slug text unique, name i18n, tag_group text check in ('occasion','feature','diet','access','vibe','price'))
```

### 2.2 Places — base layer (open data)

```sql
places (
  id uuid pk, city_id fk, neighbourhood_id fk null, slug text, unique(city_id, slug),
  name text, name_i18n i18n null,                 -- most venues have one name; landmarks may be translated
  location geography(Point,4326) not null,
  street text, house_number text, postcode text, locality text,
  phone text, website text, email text,
  osm_opening_hours text null,                    -- raw OSM string, source of truth for parsing
  hours_checked_at date null,                     -- from OSM check_date / editorial verification
  wheelchair text check in ('yes','limited','no') null,
  attributes jsonb default '{}',                  -- category-specific, validated against category schema
  status text check in ('active','temporarily_closed','closed','pending') default 'pending',
  tier text check in ('basic','curated','featured') default 'basic',
  quality_score real,                             -- computed by ingest/quality
  field_sources jsonb,                            -- {"phone":"osm:n123","website":"fsq:abc"}
  last_verified_at ts null, deleted_at ts null
)
place_categories (place_id fk, category_id fk, is_primary bool, pk(place_id, category_id))
  -- partial unique index: one primary per place
place_sources (
  id uuid pk, place_id fk null,                   -- null = unmatched candidate in review queue
  provider text check in ('osm','fsq_os','overture','wikidata','owner','editorial'),
  external_id text, license text, attribution text,
  raw jsonb, content_hash text, fetched_at ts,
  match_confidence real, match_status text check in ('auto','confirmed','rejected','pending'),
  unique(provider, external_id)
)
place_open_windows (place_id fk, during tstzrange, source text check in ('osm','editorial','exception'))
  -- rebuilt nightly for now() .. now()+21d
opening_exceptions (id uuid pk, place_id fk, on_date date, closed bool, opens time null, closes time null, note i18n null)
transit_stops (id text pk /*gtfs stop_id*/, city_id fk, name text, modes text[], location geography(Point))
```

### 2.3 Editorial layer (our independent database)

```sql
place_editorial (
  place_id uuid pk fk,
  summary i18n,            -- one-liner (curated tier)
  description i18n,        -- long form (featured tier)
  price_level smallint check between 1 and 4 null,
  good_for text[],         -- denormalised tag slugs for fast filtering, kept in sync from place_tags
  editor_pick bool default false,
  verified_by uuid fk profiles null, verified_at ts null,
  status text check in ('draft','in_review','published') default 'draft'
)
place_tags (place_id fk, tag_id fk, source text check in ('editorial','derived','owner'), pk(place_id, tag_id))
media (
  id uuid pk, owner_type text check in ('place','event','collection','profile'), owner_id uuid,
  storage_path text, renditions jsonb,            -- {"400":"…webp","800":"…","1600":"…"}
  width int, height int, blurhash text, alt i18n,
  credit text not null, license text not null, source_url text null,
  uploaded_by uuid fk, moderation_status text check in ('pending','approved','rejected') default 'pending',
  sort int, deleted_at ts null
)
collections (                                     -- editorial lists: "Rainy day", "Beer gardens"
  id uuid pk, city_id fk, slug text, title i18n, subtitle i18n, cover_media_id fk null,
  kind text check in ('editorial','seasonal','sponsored'),
  sponsor_name text null,                         -- required if kind='sponsored' (CHECK) → "Anzeige" label
  visible_from ts null, visible_to ts null, status text, sort int
)
collection_items (collection_id fk, item_type text check in ('place','event'), item_id uuid, note i18n null, sort int)
```

### 2.4 Events

```sql
organizers (id uuid pk, name text, website text, user_id uuid null, verified bool default false)
events (
  id uuid pk, city_id fk, place_id fk null, organizer_id fk null, slug text,
  title i18n, description i18n,
  venue_name text null, location geography(Point) null,       -- for events without a place record
  price_min numeric null, price_max numeric null, currency char(3) default 'EUR', is_free bool null,
  ticket_url text null, age_min smallint null,
  status text check in ('draft','scheduled','cancelled','postponed','published') ,
  source_provider text, source_id text, source_url text, attribution text,
  dedupe_key text,                 -- normalised(title)+date+place, used to merge across sources
  unique(source_provider, source_id), deleted_at ts null
)
event_occurrences (id uuid pk, event_id fk, during tstzrange not null, is_all_day bool default false)
event_categories (event_id fk, category_id fk, pk(event_id, category_id))
```

### 2.5 Users (MVP subset)

```sql
profiles (
  id uuid pk references auth.users, display_name text null, avatar_media_id fk null,
  locale text, home_city_id fk null, birth_year smallint null,   -- only if/when needed for age gating
  is_anonymous bool,                                              -- mirrors auth anon status
  deleted_at ts null
)
consents (id uuid pk, user_id fk null, device_id text, purpose text check in ('analytics','crash_reports','marketing_push'),
          granted bool, policy_version text, at ts)        -- append-only log
user_settings (user_id pk fk, push_digest bool default false, push_event_reminders bool default false,
               location_mode text check in ('off','while_using') default 'off')
lists (
  id uuid pk, owner_id fk, title text, emoji text null,
  kind text check in ('list','plan') default 'list',
  plan_starts_at ts null,                                   -- for plans
  share_id text unique null,                                -- 10-char random; null = private
  share_role text check in ('view') default 'view',         -- collaborative editing = Phase 2
  deleted_at ts null
)
list_items (id uuid pk, list_id fk, item_type text check in ('place','event'), item_id uuid,
            note text null, planned_at ts null, sort int, added_at ts)
```

### 2.6 Trust, ops, later phases

```sql
reports (id uuid pk, reporter_id fk null, target_type text, target_id uuid,
         reason text check in ('wrong_hours','closed','wrong_location','wrong_info','inappropriate','illegal','other'),
         body text null, status text check in ('open','in_progress','resolved','rejected'),
         resolution text null, resolved_by fk null, resolved_at ts null)
ingest_runs (id uuid pk, source text, started_at ts, finished_at ts, stats jsonb, error text null)
weather_snapshots (city_id fk, observed_at ts, current jsonb, hourly jsonb, pk(city_id, observed_at))
audit_log (id bigserial pk, actor_id uuid null, action text, table_name text, row_id uuid, diff jsonb, at ts)
search_documents (                       -- one row per searchable entity, maintained by triggers
  entity_type text, entity_id uuid, city_id fk, title text, subtitle text,
  location geography(Point) null, rank_boost real,   -- tier + editor_pick + saves
  tsv_de tsvector, tsv_en tsvector, name_norm text,  -- lower(unaccent(name))
  pk(entity_type, entity_id)
)
-- Phase 2+ (designed, not migrated in MVP):
-- follows, blocks, mutes, posts, comments, likes, reviews, review_votes, check_ins,
-- event_attendance, plan_members, place_claims, business_accounts, sponsored_placements,
-- activity_aggregates (k ≥ 5, delayed), moderation_actions
```

## 3. Indexes for the key queries

| Query                               | Index                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Places near a point / in a bbox     | `GIST(places.location)` partial `WHERE status='active' AND deleted_at IS NULL`                                     |
| …by category                        | `place_categories(category_id, place_id)`                                                                          |
| Open now                            | `GIST(place_open_windows.during)` + `btree(place_id)`; `btree_gist` composite `(place_id, during)`                 |
| Events in a date range near a point | `GIST(event_occurrences.during)`, `GIST(events.location)`, `btree(events.place_id)`                                |
| Text search                         | `GIN(search_documents.tsv_de)`, `GIN(tsv_en)`, `GIN(name_norm gin_trgm_ops)`                                       |
| Explore sections by tag             | `GIN(place_editorial.good_for)`                                                                                    |
| Dedup matching in ingestion         | `GIST(places.location)` + `GIN(lower(unaccent(name)) gin_trgm_ops)`; `place_sources(provider, external_id)` unique |
| Share link resolve                  | `unique(lists.share_id)`                                                                                           |
| Collections live now                | `btree(collections.city_id, status, visible_from, visible_to)`                                                     |

**Search:** custom configs `de_unaccent` (unaccent → german_stem) and `en_unaccent`. Query: `websearch_to_tsquery` on the user's language config, OR trigram similarity on `name_norm` (typo tolerance: "hofbrauhaus", "Hofbräuhaus", "hofbreuhaus"). Ranked by `ts_rank` × `rank_boost` × distance decay. Umlaut folding also maps `ae→ä`-style spellings via a small synonym dictionary (`muenchen`, `strasse/straße`).

## 4. RLS policy summary

Roles: `anon` (includes Supabase anonymous-auth users before upgrade), `authenticated`, **`editor`** and **`admin`** (`auth.jwt()->'app_metadata'->>'role'`), `service_role` (ingestion, never on the client).

| Table group                                                      | Read                                                                                                                                           | Write                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| cities, neighbourhoods, categories, tags, transit_stops          | everyone                                                                                                                                       | admin                                                                       |
| places, place_categories, place_open_windows, opening_exceptions | everyone where `status='active' AND deleted_at IS NULL`; editors see all                                                                       | editor (CMS), service_role (ingest)                                         |
| place_sources, ingest_runs, audit_log                            | editor/admin only                                                                                                                              | service_role; audit via trigger                                             |
| place_editorial, place_tags, collections(+items), media          | everyone where published/approved (+visible window); editors see drafts                                                                        | editor                                                                      |
| events, event_occurrences, event_categories, organizers          | everyone where `status='published'`                                                                                                            | editor, service_role                                                        |
| profiles                                                         | owner only (MVP has no public profiles)                                                                                                        | owner (limited columns via column grants)                                   |
| lists, list_items                                                | owner; **non-owners only through `get_shared_list(share_id)` SECURITY DEFINER RPC** (no table-level public read, so lists can't be enumerated) | owner                                                                       |
| consents                                                         | owner (by user_id or device_id via RPC)                                                                                                        | insert-only by owner; no update/delete                                      |
| user_settings                                                    | owner                                                                                                                                          | owner                                                                       |
| reports                                                          | reporter sees own; editors all                                                                                                                 | insert: anyone (rate-limited by RPC: 10/day/user or device); update: editor |
| weather_snapshots                                                | everyone                                                                                                                                       | service_role                                                                |

Every policy has a pgTAP test that checks access as anon, as another user and as the owner.

## 5. Migration strategy

- **Supabase CLI migrations, hand-written SQL**, one concern per file: `supabase/migrations/20261101120000_create_places.sql`. Never edit a migration after it reaches staging; write a new one.
- **Never `db push` to production from a laptop.** CI applies migrations to staging on merge to `main`, and to production on a release tag after a manual approval.
- **Expand → migrate → contract** for breaking changes (add column → backfill → switch readers → drop old), so older app versions keep working. Mobile apps stay installed for months, so RPC signatures are versioned (`explore_sections_v1`).
- `supabase gen types typescript` runs in CI, and the output is committed to `packages/db`. CI fails if the generated types differ from the committed ones.
- **Reference data and fixtures (ADR-031):** real reference data every environment needs (Munich, the category taxonomy, tags) is a data migration (`…_reference_data.sql`). `supabase/seed.sql` holds only fake local fixtures ("Test Place 1"… in the made-up city Testburg) and is never pushed to a hosted project.
- **Helpers** (`is_i18n`, `is_slug`, `is_editor`, `is_admin`, triggers) live in the `private` schema, which the Data API doesn't expose. Grants are explicit per table.
- **Tests:** pgTAP files in `supabase/tests/database/`, each one transaction that rolls back. CI runs them on a fresh Docker database.
- **Backups:** Supabase Pro daily backups. Add PITR when the editorial layer becomes valuable (before public launch). Weekly `pg_dump` of the editorial tables to private R2 storage as a provider-exit copy.
- **Account deletion:** an `on delete cascade` from `auth.users` covers user-owned rows. A `delete_my_account()` RPC also removes media and anonymises reports. Required by GDPR Art. 17 and App Store 5.1.1(v).
