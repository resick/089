-- Categories (two levels, data-driven, per-category attribute schemas) and
-- cross-cutting tags (DATABASE §2.1, spec 3.1).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id),
  slug text not null unique check (private.is_slug(slug)),
  name jsonb not null check (private.is_i18n(name)),
  -- Lucide icon name, e.g. 'utensils-crossed'. Subcategories inherit it.
  icon text check (private.is_slug(icon)),
  -- Key of categoryColors in packages/tokens, e.g. 'food'. Subcategories inherit it.
  color_token text check (color_token ~ '^[a-z]+$'),
  -- JSON Schema subset for places.attributes; the app and CMS validate
  -- attributes with zod built from it.
  attribute_schema jsonb not null default '{"type": "object", "properties": {}}'
    check (jsonb_typeof(attribute_schema) = 'object'),
  -- Source → category mapping used by ingestion (slice 4), edited in the CMS.
  osm_mappings jsonb not null default '[]' check (jsonb_typeof(osm_mappings) = 'array'),
  fsq_category_ids text[] not null default '{}',
  sort integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is not null or (icon is not null and color_token is not null)),
  check (parent_id is null or color_token is null),
  check (parent_id <> id)
);

create index categories_parent_idx on public.categories (parent_id, sort);

-- Two levels only: a parent must itself be top-level. This also rules out cycles.
create function private.check_category_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if exists (select 1 from public.categories where id = new.parent_id and parent_id is not null) then
    raise exception 'category "%": parent must be a top-level category', new.slug
      using errcode = 'check_violation';
  end if;
  if exists (select 1 from public.categories where parent_id = new.id) then
    raise exception 'category "%" has subcategories, so it must stay top-level', new.slug
      using errcode = 'check_violation';
  end if;
  return new;
end
$$;

create trigger check_parent before insert or update of parent_id on public.categories
  for each row execute function private.check_category_parent();

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (private.is_slug(slug)),
  name jsonb not null check (private.is_i18n(name)),
  tag_group text not null check (tag_group in ('occasion', 'feature', 'diet', 'access', 'vibe', 'price')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.categories
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.tags
  for each row execute function private.set_updated_at();

alter table public.categories enable row level security;
alter table public.tags enable row level security;

create policy "Active categories are public" on public.categories
  for select to anon, authenticated using (is_active or (select private.is_editor()));
create policy "Admins manage categories" on public.categories
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Tags are public" on public.tags
  for select to anon, authenticated using (true);
create policy "Admins manage tags" on public.tags
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

revoke all on public.categories, public.tags from anon, authenticated;
grant select on public.categories, public.tags to anon, authenticated;
grant insert, update, delete on public.categories, public.tags to authenticated;
grant all on public.categories, public.tags to service_role;
