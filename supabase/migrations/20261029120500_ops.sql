-- Operations: ingestion run log and the audit log of staff writes
-- (DATABASE §2.6). Both are readable by editors only.

create table public.ingest_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (btrim(source) <> ''),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  -- Counts per category, inserts/updates/skips, anomalies (slice 4).
  stats jsonb not null default '{}' check (jsonb_typeof(stats) = 'object'),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finished_at >= started_at)
);

create index ingest_runs_source_idx on public.ingest_runs (source, started_at desc);

create trigger set_updated_at before update on public.ingest_runs
  for each row execute function private.set_updated_at();

-- Append-only. actor_id has no foreign key so entries outlive deleted accounts.
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  row_id uuid,
  -- INSERT/DELETE: the whole row. UPDATE: {"column": {"old": …, "new": …}} for changed columns.
  diff jsonb not null,
  at timestamptz not null default now()
);

create index audit_log_row_idx on public.audit_log (table_name, row_id, at desc);
create index audit_log_actor_idx on public.audit_log (actor_id, at desc);

-- Records writes made by signed-in staff (the CMS). Writes without a user
-- (ingestion with the service role, migrations) are skipped: ingest_runs
-- covers those, and logging every nightly upsert would swamp the log.
-- TG_ARGV[0] names the column used as row_id (default 'id').
create function private.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  changes jsonb;
begin
  if actor is null then
    return null;
  end if;

  if tg_op = 'UPDATE' then
    select jsonb_object_agg(n.key, jsonb_build_object('old', o.value, 'new', n.value))
    into changes
    from jsonb_each(new_row) as n (key, value)
    join jsonb_each(old_row) as o (key, value) on o.key = n.key
    where o.value is distinct from n.value and n.key <> 'updated_at';
    if changes is null then
      return null;
    end if;
  else
    changes := coalesce(new_row, old_row);
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, diff)
  values (
    actor,
    tg_op,
    tg_table_name,
    (coalesce(new_row, old_row) ->> coalesce(tg_argv[0], 'id'))::uuid,
    changes
  );
  return null;
end
$$;

create trigger audit after insert or update or delete on public.cities
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.neighbourhoods
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.categories
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.tags
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.places
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.place_categories
  for each row execute function private.audit_row('place_id');
create trigger audit after insert or update or delete on public.place_sources
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.opening_exceptions
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.place_editorial
  for each row execute function private.audit_row('place_id');
create trigger audit after insert or update or delete on public.place_tags
  for each row execute function private.audit_row('place_id');
create trigger audit after insert or update or delete on public.media
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.collections
  for each row execute function private.audit_row();
create trigger audit after insert or update or delete on public.collection_items
  for each row execute function private.audit_row('collection_id');

alter table public.ingest_runs enable row level security;
alter table public.audit_log enable row level security;

create policy "Editors read ingest runs" on public.ingest_runs
  for select to authenticated using ((select private.is_editor()));
create policy "Editors read the audit log" on public.audit_log
  for select to authenticated using ((select private.is_editor()));

revoke all on public.ingest_runs, public.audit_log from anon, authenticated;
grant select on public.ingest_runs, public.audit_log to authenticated;
grant all on public.ingest_runs to service_role;
-- Even the service role can only append to the audit log.
revoke all on public.audit_log from service_role;
grant select, insert on public.audit_log to service_role;
