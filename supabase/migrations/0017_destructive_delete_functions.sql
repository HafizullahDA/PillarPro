create or replace function delete_worker_cascade(target_worker_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_worker_id uuid;
begin
  if target_worker_id is null then
    raise exception 'Worker is required.';
  end if;

  delete from attendance
  where worker_id = target_worker_id;

  delete from transactions
  where worker_id = target_worker_id;

  delete from workers
  where id = target_worker_id
  returning id into deleted_worker_id;

  if deleted_worker_id is null then
    raise exception 'Worker not found.';
  end if;

  return deleted_worker_id;
end;
$$;

create or replace function delete_project_cascade(target_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_project_id uuid;
begin
  if target_project_id is null then
    raise exception 'Project is required.';
  end if;

  delete from attendance
  where project_id = target_project_id;

  delete from vendor_purchases
  where project_id = target_project_id;

  delete from vendor_payments
  where project_id = target_project_id;

  delete from receipts
  where project_id = target_project_id;

  delete from bills
  where project_id = target_project_id;

  delete from partner_transactions
  where project_id = target_project_id;

  delete from misc_expenses
  where project_id = target_project_id;

  delete from transactions
  where project_id = target_project_id;

  delete from partners
  where project_id = target_project_id;

  delete from workers
  where project_id = target_project_id;

  delete from vendors
  where project_id = target_project_id;

  delete from projects
  where id = target_project_id
  returning id into deleted_project_id;

  if deleted_project_id is null then
    raise exception 'Project not found.';
  end if;

  return deleted_project_id;
end;
$$;

grant execute on function delete_worker_cascade(uuid) to anon, authenticated;
grant execute on function delete_project_cascade(uuid) to anon, authenticated;
