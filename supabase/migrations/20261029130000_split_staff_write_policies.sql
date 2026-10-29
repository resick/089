-- The "manage" policies were `for all`, which also covers SELECT. Every read
-- then evaluated two permissive policies (Supabase advisor 0006). Replace each
-- with separate insert/update/delete policies; reads stay with the public
-- policy, which already lets staff see everything.

do $$
declare
  rule record;
begin
  for rule in
    select * from (values
      ('cities', 'Admins manage cities', 'is_admin'),
      ('neighbourhoods', 'Admins manage neighbourhoods', 'is_admin'),
      ('categories', 'Admins manage categories', 'is_admin'),
      ('tags', 'Admins manage tags', 'is_admin'),
      ('transit_stops', 'Admins manage transit stops', 'is_admin'),
      ('places', 'Editors manage places', 'is_editor'),
      ('place_categories', 'Editors manage place categories', 'is_editor'),
      ('place_open_windows', 'Editors manage open windows', 'is_editor'),
      ('opening_exceptions', 'Editors manage opening exceptions', 'is_editor'),
      ('place_editorial', 'Editors manage editorial', 'is_editor'),
      ('place_tags', 'Editors manage place tags', 'is_editor'),
      ('media', 'Editors manage media', 'is_editor'),
      ('collections', 'Editors manage collections', 'is_editor'),
      ('collection_items', 'Editors manage collection items', 'is_editor')
    ) as r (table_name, old_policy, check_fn)
  loop
    execute format('drop policy %I on public.%I', rule.old_policy, rule.table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.%I()))',
      rule.old_policy || ' (insert)', rule.table_name, rule.check_fn
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.%I())) with check ((select private.%I()))',
      rule.old_policy || ' (update)', rule.table_name, rule.check_fn, rule.check_fn
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.%I()))',
      rule.old_policy || ' (delete)', rule.table_name, rule.check_fn
    );
  end loop;
end
$$;
