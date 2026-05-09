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

  return accessible_project_id;
end;
$$;

revoke execute on function claim_project_if_unowned(uuid) from anon;
grant execute on function claim_project_if_unowned(uuid) to authenticated;
