-- Editorial layer: our own independent database (DATABASE §2.3). It refers
-- to places by id and never stores values copied from OSM (ANALYSIS §4.9).
-- Staff references point at auth.users; profiles (slice 11) share those ids.

create table public.place_editorial (
  place_id uuid primary key references public.places (id) on delete cascade,
  summary jsonb check (private.is_i18n(summary)),
  description jsonb check (private.is_i18n(description)),
  price_level smallint check (price_level between 1 and 4),
  -- Tag slugs of the place, maintained from place_tags by triggers below, so
  -- Explore can filter with one GIN index.
  good_for text[] not null default '{}',
  editor_pick boolean not null default false,
  verified_by uuid references auth.users (id) on delete set null,
  verified_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index place_editorial_good_for_idx on public.place_editorial using gin (good_for);

create table public.place_tags (
  place_id uuid not null references public.places (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  source text not null default 'editorial' check (source in ('editorial', 'derived', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id, tag_id)
);

create index place_tags_tag_idx on public.place_tags (tag_id, place_id);

-- Photos and other media. Credit and licence are mandatory: nothing can be
-- stored, let alone published, without them (ROADMAP slice 5).
create table public.media (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('place', 'event', 'collection', 'profile')),
  owner_id uuid not null,
  storage_path text not null unique,
  -- Width → path, e.g. {"400": "…webp", "800": "…", "1600": "…"}.
  renditions jsonb not null default '{}' check (jsonb_typeof(renditions) = 'object'),
  width integer check (width > 0),
  height integer check (height > 0),
  blurhash text,
  alt jsonb check (private.is_i18n(alt)),
  credit text not null check (btrim(credit) <> ''),
  license text not null check (btrim(license) <> ''),
  source_url text check (source_url ~* '^https?://'),
  uploaded_by uuid references auth.users (id) on delete set null,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  sort integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_owner_idx on public.media (owner_type, owner_id, sort)
  where deleted_at is null;

-- Editorial lists ("Rainy day", "Beer gardens"). Sponsored collections must
-- name the sponsor, which the app shows with an "Anzeige" label.
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id),
  slug text not null check (private.is_slug(slug)),
  title jsonb not null check (private.is_i18n(title)),
  subtitle jsonb check (private.is_i18n(subtitle)),
  cover_media_id uuid references public.media (id) on delete set null,
  kind text not null default 'editorial' check (kind in ('editorial', 'seasonal', 'sponsored')),
  sponsor_name text,
  visible_from timestamptz,
  visible_to timestamptz,
  status text not null default 'draft' check (status in ('draft', 'in_review', 'published')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, slug),
  check ((kind = 'sponsored') = coalesce(btrim(sponsor_name) <> '', false)),
  check (visible_to > visible_from)
);

create index collections_live_idx on public.collections
  (city_id, status, visible_from, visible_to);

-- item_id points at places or (from slice 10) events; readers join through
-- RPCs, so dangling items simply don't show.
create table public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  item_type text not null check (item_type in ('place', 'event')),
  item_id uuid not null,
  note jsonb check (private.is_i18n(note)),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection_id, item_type, item_id)
);

create index collection_items_sort_idx on public.collection_items (collection_id, sort);

create trigger set_updated_at before update on public.place_editorial
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.place_tags
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.media
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.collections
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.collection_items
  for each row execute function private.set_updated_at();

-- good_for = the place's tag slugs. Computed on every editorial write, and
-- refreshed whenever the place's tags change.
create function private.place_tag_slugs(target uuid)
returns text[]
language sql
stable
set search_path = ''
as $$
  select coalesce(array_agg(t.slug order by t.slug), '{}')
  from public.place_tags pt
  join public.tags t on t.id = pt.tag_id
  where pt.place_id = target
$$;

create function private.fill_good_for()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.good_for := private.place_tag_slugs(new.place_id);
  return new;
end
$$;

create trigger fill_good_for before insert or update on public.place_editorial
  for each row execute function private.fill_good_for();

create function private.refresh_good_for()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    update public.place_editorial
    set good_for = private.place_tag_slugs(old.place_id)
    where place_id = old.place_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update public.place_editorial
    set good_for = private.place_tag_slugs(new.place_id)
    where place_id = new.place_id;
  end if;
  return null;
end
$$;

create trigger refresh_good_for after insert or update or delete on public.place_tags
  for each row execute function private.refresh_good_for();

-- RLS: the public sees published, approved and currently visible content of
-- visible places; editors see and write everything.

alter table public.place_editorial enable row level security;
alter table public.place_tags enable row level security;
alter table public.media enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;

create policy "Published editorial of visible places is public" on public.place_editorial
  for select to anon, authenticated
  using (
    (status = 'published' and exists (select 1 from public.places p where p.id = place_id))
    or (select private.is_editor())
  );
create policy "Editors manage editorial" on public.place_editorial
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Tags of visible places are public" on public.place_tags
  for select to anon, authenticated
  using (exists (select 1 from public.places p where p.id = place_id));
create policy "Editors manage place tags" on public.place_tags
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Approved media is public" on public.media
  for select to anon, authenticated
  using ((moderation_status = 'approved' and deleted_at is null) or (select private.is_editor()));
create policy "Editors manage media" on public.media
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Live collections are public" on public.collections
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and (visible_from is null or visible_from <= now())
      and (visible_to is null or visible_to > now())
    )
    or (select private.is_editor())
  );
create policy "Editors manage collections" on public.collections
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "Items of live collections are public" on public.collection_items
  for select to anon, authenticated
  using (exists (select 1 from public.collections c where c.id = collection_id));
create policy "Editors manage collection items" on public.collection_items
  for all to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

revoke all on public.place_editorial, public.place_tags, public.media,
  public.collections, public.collection_items
  from anon, authenticated;
grant select on public.place_editorial, public.place_tags, public.media,
  public.collections, public.collection_items
  to anon, authenticated;
grant insert, update, delete on public.place_editorial, public.place_tags, public.media,
  public.collections, public.collection_items
  to authenticated;
grant all on public.place_editorial, public.place_tags, public.media,
  public.collections, public.collection_items
  to service_role;
