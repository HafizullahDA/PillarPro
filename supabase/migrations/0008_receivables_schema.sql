alter table bills
  add column if not exists bill_type text,
  add column if not exists gross_amount numeric(12,2),
  add column if not exists deductions numeric(12,2) not null default 0,
  add column if not exists net_payable numeric(12,2);

alter table receipts
  add column if not exists payment_reference text;
