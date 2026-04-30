create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete restrict,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table partner_transactions
  add column if not exists partner_id uuid references partners(id) on delete restrict,
  add column if not exists payment_mode text;

create index if not exists idx_partners_project_id on partners(project_id);
