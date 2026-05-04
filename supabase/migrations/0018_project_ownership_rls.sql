alter table projects
  add column if not exists owner_user_id uuid references auth.users(id) on delete restrict;

drop policy if exists "projects_select_public" on projects;
drop policy if exists "projects_insert_public" on projects;
drop policy if exists "vendors_select_public" on vendors;
drop policy if exists "vendors_insert_public" on vendors;
drop policy if exists "vendor_purchases_select_public" on vendor_purchases;
drop policy if exists "vendor_purchases_insert_public" on vendor_purchases;
drop policy if exists "vendor_payments_select_public" on vendor_payments;
drop policy if exists "vendor_payments_insert_public" on vendor_payments;
drop policy if exists "transactions_select_public" on transactions;
drop policy if exists "transactions_insert_public" on transactions;
drop policy if exists "workers_select_public" on workers;
drop policy if exists "workers_insert_public" on workers;
drop policy if exists "attendance_select_public" on attendance;
drop policy if exists "attendance_insert_public" on attendance;
drop policy if exists "workers_update_public" on workers;
drop policy if exists "attendance_update_public" on attendance;
drop policy if exists "bills_select_public" on bills;
drop policy if exists "bills_insert_public" on bills;
drop policy if exists "receipts_select_public" on receipts;
drop policy if exists "receipts_insert_public" on receipts;
drop policy if exists "partners_select_public" on partners;
drop policy if exists "partners_insert_public" on partners;
drop policy if exists "partner_transactions_select_public" on partner_transactions;
drop policy if exists "partner_transactions_insert_public" on partner_transactions;
drop policy if exists "misc_expenses_select_public" on misc_expenses;
drop policy if exists "misc_expenses_insert_public" on misc_expenses;

create policy "projects_select_owner"
on projects
for select
to authenticated
using (owner_user_id = auth.uid());

create policy "projects_insert_owner"
on projects
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "projects_update_owner"
on projects
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "projects_delete_owner"
on projects
for delete
to authenticated
using (owner_user_id = auth.uid());

create policy "vendors_owner_all"
on vendors
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = vendors.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = vendors.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "vendor_purchases_owner_all"
on vendor_purchases
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = vendor_purchases.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = vendor_purchases.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "vendor_payments_owner_all"
on vendor_payments
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = vendor_payments.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = vendor_payments.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "transactions_owner_all"
on transactions
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = transactions.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = transactions.project_id
      and projects.owner_user_id = auth.uid()
  )
);

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
      and projects.owner_user_id = auth.uid()
  )
);

create policy "attendance_owner_all"
on attendance
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = attendance.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = attendance.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "bills_owner_all"
on bills
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = bills.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = bills.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "receipts_owner_all"
on receipts
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = receipts.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = receipts.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "partners_owner_all"
on partners
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = partners.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = partners.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "partner_transactions_owner_all"
on partner_transactions
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = partner_transactions.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = partner_transactions.project_id
      and projects.owner_user_id = auth.uid()
  )
);

create policy "misc_expenses_owner_all"
on misc_expenses
for all
to authenticated
using (
  exists (
    select 1
    from projects
    where projects.id = misc_expenses.project_id
      and projects.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from projects
    where projects.id = misc_expenses.project_id
      and projects.owner_user_id = auth.uid()
  )
);

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

  if not exists (
    select 1
    from workers
    join projects on projects.id = workers.project_id
    where workers.id = target_worker_id
      and projects.owner_user_id = auth.uid()
  ) then
    raise exception 'Worker not found.';
  end if;

  delete from attendance
  where worker_id = target_worker_id;

  delete from transactions
  where worker_id = target_worker_id;

  delete from workers
  where id = target_worker_id
  returning id into deleted_worker_id;

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

  if not exists (
    select 1
    from projects
    where id = target_project_id
      and owner_user_id = auth.uid()
  ) then
    raise exception 'Project not found.';
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

  return deleted_project_id;
end;
$$;

revoke execute on function delete_worker_cascade(uuid) from anon;
revoke execute on function delete_project_cascade(uuid) from anon;
