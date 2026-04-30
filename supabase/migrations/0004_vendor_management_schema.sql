alter table vendors
  add column if not exists agency_name text;

alter table vendor_purchases
  add column if not exists material text,
  add column if not exists quantity numeric(12,2),
  add column if not exists rate numeric(12,2);

alter table vendor_payments
  add column if not exists payment_reference text;
