# PillarPro Schema Guide

## What this file does

The SQL schema lives in [0001_pillarpro_schema.sql](</C:/PillarPro/supabase/migrations/0001_pillarpro_schema.sql>).  
This file tells PostgreSQL which tables PillarPro needs and how they connect to each other.

## SQL create table statements

```sql
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
```

## Relationships explained

### 1. `projects` is the parent table
Every major record belongs to one project.

That means:
- one project can have many vendors
- one project can have many workers
- one project can have many attendance records
- one project can have many bills, expenses, receipts, and partner transactions
- one project can have many ledger entries in `transactions`

### 2. `vendors` belongs to `projects`
`vendors.project_id` points to `projects.id`.

This means each vendor record is attached to one project.

### 3. `workers` belongs to `projects`
`workers.project_id` points to `projects.id`.

This means each worker is saved under one project.

### 4. `attendance` belongs to both `projects` and `workers`
- `attendance.project_id` points to `projects.id`
- `attendance.worker_id` points to `workers.id`

This means an attendance row is for one worker inside one project.

### 5. `transactions` is the central financial ledger
This is the most important table in the app.

All money movement should be recorded here first or alongside the module record:
- money coming in uses `direction = 'inflow'`
- money going out uses `direction = 'outflow'`

`reference_table` and `reference_id` tell us which module created the ledger entry.

Example:
- a vendor payment row can create a transaction row
- that transaction row stores `reference_table = 'vendor_payments'`
- `reference_id` stores the matching `vendor_payments.id`

### 6. Financial tables link back to `transactions`
These tables all contain `transaction_id`:
- `vendor_purchases`
- `vendor_payments`
- `bills`
- `receipts`
- `partner_transactions`
- `misc_expenses`

This is how we enforce your accounting rule that all financial activity is visible in the master ledger.

### 7. `bills` and `receipts`
- `bills` stores money you expect to receive
- `receipts` stores money you actually received
- `receipts.bill_id` can point to the bill it is paying against

This helps track government contract collections clearly.

## Beginner notes

### Why use UUIDs?
UUIDs are long unique IDs like `550e8400-e29b-41d4-a716-446655440000`.

They are useful because:
- they are globally unique
- they are safer for distributed systems
- they work very well with Supabase

### Why use foreign keys?
Foreign keys protect your data.

They stop mistakes like:
- creating a vendor for a project that does not exist
- creating attendance for a worker that does not exist
- creating an expense linked to a ledger transaction that does not exist

### Why keep both module tables and `transactions`?
Because they solve different problems:
- module tables store business details
- `transactions` stores accounting truth

Example:
- `misc_expenses` stores category, vendor, and note
- `transactions` stores the actual money movement used for summaries and reports

## Small recommendation before the next feature

One thing to be aware of: `partner_transactions.partner_name` is simple for now, but later we may want a separate `partners` table if you need reusable partner master records.

For this prompt, I stayed within your requested table list and did not add extra tables.
