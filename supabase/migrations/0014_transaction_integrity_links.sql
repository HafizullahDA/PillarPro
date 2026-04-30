alter table transactions
  add column if not exists vendor_id uuid references vendors(id) on delete restrict,
  add column if not exists worker_id uuid references workers(id) on delete restrict,
  add column if not exists partner_id uuid references partners(id) on delete restrict;

create index if not exists idx_transactions_vendor_id on transactions(vendor_id);
create index if not exists idx_transactions_worker_id on transactions(worker_id);
create index if not exists idx_transactions_partner_id on transactions(partner_id);

update transactions as t
set vendor_id = vp.vendor_id
from vendor_purchases as vp
where t.vendor_id is null
  and (
    vp.transaction_id = t.id
    or vp.id = t.reference_id
  );

update transactions as t
set vendor_id = vpay.vendor_id
from vendor_payments as vpay
where t.vendor_id is null
  and (
    vpay.transaction_id = t.id
    or vpay.id = t.reference_id
  );

update transactions
set vendor_id = nullif(split_part(notes, ' | linked:', 2), '')::uuid
where vendor_id is null
  and reference_table in ('vendor_purchase', 'vendor_payment')
  and notes like '% | linked:%';

update transactions as t
set worker_id = a.worker_id
from attendance as a
where t.worker_id is null
  and (
    a.transaction_id = t.id
    or a.id = t.reference_id
  );

update transactions
set worker_id = nullif(split_part(notes, ' | linked:', 2), '')::uuid
where worker_id is null
  and reference_table = 'salary_expense'
  and notes like '% | linked:%';

update transactions as t
set partner_id = pt.partner_id
from partner_transactions as pt
where t.partner_id is null
  and (
    pt.transaction_id = t.id
    or pt.id = t.reference_id
  );

update transactions
set partner_id = nullif(split_part(notes, ' | linked:', 2), '')::uuid
where partner_id is null
  and reference_table in ('partner_paid_by_partner', 'partner_received_by_partner')
  and notes like '% | linked:%';

alter table transactions
  drop constraint if exists transactions_vendor_link_required,
  drop constraint if exists transactions_worker_link_required,
  drop constraint if exists transactions_partner_link_required;

alter table transactions
  add constraint transactions_vendor_link_required
  check (
    reference_table not in ('vendor_purchase', 'vendor_payment')
    or vendor_id is not null
  ),
  add constraint transactions_worker_link_required
  check (
    reference_table <> 'salary_expense'
    or worker_id is not null
  ),
  add constraint transactions_partner_link_required
  check (
    reference_table not in ('partner_paid_by_partner', 'partner_received_by_partner')
    or partner_id is not null
  );

do $$
declare
  missing_vendor_count integer;
  missing_worker_count integer;
  missing_partner_count integer;
begin
  select count(*)
    into missing_vendor_count
  from transactions
  where reference_table in ('vendor_purchase', 'vendor_payment')
    and vendor_id is null;

  select count(*)
    into missing_worker_count
  from transactions
  where reference_table = 'salary_expense'
    and worker_id is null;

  select count(*)
    into missing_partner_count
  from transactions
  where reference_table in ('partner_paid_by_partner', 'partner_received_by_partner')
    and partner_id is null;

  if missing_vendor_count > 0 then
    raise exception 'Backfill failed: % vendor ledger rows still have null vendor_id.', missing_vendor_count;
  end if;

  if missing_worker_count > 0 then
    raise exception 'Backfill failed: % salary ledger rows still have null worker_id.', missing_worker_count;
  end if;

  if missing_partner_count > 0 then
    raise exception 'Backfill failed: % partner ledger rows still have null partner_id.', missing_partner_count;
  end if;
end $$;
