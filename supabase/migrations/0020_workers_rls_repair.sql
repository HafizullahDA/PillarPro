drop policy if exists "workers_owner_all" on workers;

create policy "workers_owner_all"
on workers
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = workers.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = workers.project_id
      and (
        projects.owner_user_id = auth.uid()
        or projects.owner_user_id is null
      )
  )
);

create or replace function claim_project_if_unowned(target_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  accessible_project_id uuid;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to save records.';
  end if;

  if target_project_id is null then
    raise exception 'Project is required.';
  end if;

  update projects
  set
    owner_user_id = auth.uid(),
    updated_at = now()
  where id = target_project_id
    and owner_user_id is null
  returning id into accessible_project_id;

  if accessible_project_id is not null then
    return accessible_project_id;
  end if;

  select id
    into accessible_project_id
  from projects
  where id = target_project_id
    and owner_user_id = auth.uid();

  if accessible_project_id is null then
    raise exception 'Project not found or you do not have access to it.';
  end if;

  return accessible_project_id;
end;
$$;

revoke execute on function claim_project_if_unowned(uuid) from anon;
grant execute on function claim_project_if_unowned(uuid) to authenticated;
