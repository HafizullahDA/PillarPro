create index if not exists idx_projects_created_at on projects(created_at desc);

create index if not exists idx_vendors_project_created_at
  on vendors(project_id, created_at desc);

create index if not exists idx_workers_project_created_at
  on workers(project_id, created_at desc);

create index if not exists idx_attendance_project_date_desc
  on attendance(project_id, attendance_date desc);

create index if not exists idx_attendance_worker_date_desc
  on attendance(worker_id, attendance_date desc);

create index if not exists idx_vendor_purchases_project_date_desc
  on vendor_purchases(project_id, purchase_date desc);

create index if not exists idx_vendor_purchases_vendor_date_desc
  on vendor_purchases(vendor_id, purchase_date desc);

create index if not exists idx_vendor_payments_project_date_desc
  on vendor_payments(project_id, payment_date desc);

create index if not exists idx_vendor_payments_vendor_date_desc
  on vendor_payments(vendor_id, payment_date desc);

create index if not exists idx_bills_project_date_desc
  on bills(project_id, bill_date desc);

create index if not exists idx_receipts_project_date_desc
  on receipts(project_id, receipt_date desc);

create index if not exists idx_partner_transactions_project_date_desc
  on partner_transactions(project_id, transaction_date desc);

create index if not exists idx_partner_transactions_partner_date_desc
  on partner_transactions(partner_id, transaction_date desc);

create index if not exists idx_misc_expenses_project_date_desc
  on misc_expenses(project_id, expense_date desc);

create index if not exists idx_transactions_project_type_date_desc
  on transactions(project_id, transaction_type, transaction_date desc);

create index if not exists idx_transactions_vendor_date_desc
  on transactions(vendor_id, transaction_date desc)
  where vendor_id is not null;

create index if not exists idx_transactions_worker_date_desc
  on transactions(worker_id, transaction_date desc)
  where worker_id is not null;

create index if not exists idx_transactions_partner_date_desc
  on transactions(partner_id, transaction_date desc)
  where partner_id is not null;

create index if not exists idx_transactions_type_date_desc
  on transactions(transaction_type, transaction_date desc);
