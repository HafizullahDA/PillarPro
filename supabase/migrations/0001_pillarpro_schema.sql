create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  client_name text,
  location text,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  name text not null,
  contact_person text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  name text not null,
  role text,
  phone text,
  daily_rate numeric(12,2),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  transaction_date date not null,
  transaction_type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  direction text not null check (direction in ('inflow', 'outflow')),
  reference_table text not null,
  reference_id uuid not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  worker_id uuid not null references workers(id) on delete restrict,
  attendance_date date not null,
  status text not null,
  units_worked numeric(10,2) not null default 1,
  overtime_units numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (worker_id, attendance_date)
);

create table if not exists vendor_purchases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  vendor_id uuid not null references vendors(id) on delete restrict,
  purchase_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vendor_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  vendor_id uuid not null references vendors(id) on delete restrict,
  payment_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  payment_mode text,
  notes text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  bill_number text not null,
  bill_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'raised',
  notes text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, bill_number)
);

create table if not exists receipts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  bill_id uuid references bills(id) on delete restrict,
  receipt_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  payment_mode text,
  notes text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists partner_transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  partner_name text not null,
  transaction_date date not null,
  entry_type text not null,
  amount numeric(12,2) not null check (amount >= 0),
  notes text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists misc_expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  expense_date date not null,
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  vendor_id uuid references vendors(id) on delete restrict,
  notes text,
  transaction_id uuid not null unique references transactions(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendors_project_id on vendors(project_id);
create index if not exists idx_workers_project_id on workers(project_id);
create index if not exists idx_transactions_project_date on transactions(project_id, transaction_date desc);
create index if not exists idx_attendance_project_date on attendance(project_id, attendance_date desc);
create index if not exists idx_vendor_purchases_project_id on vendor_purchases(project_id);
create index if not exists idx_vendor_payments_project_id on vendor_payments(project_id);
create index if not exists idx_bills_project_id on bills(project_id);
create index if not exists idx_receipts_project_id on receipts(project_id);
create index if not exists idx_partner_transactions_project_id on partner_transactions(project_id);
create index if not exists idx_misc_expenses_project_id on misc_expenses(project_id);
