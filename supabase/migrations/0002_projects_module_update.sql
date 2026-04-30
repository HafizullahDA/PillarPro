alter table projects
  add column if not exists agency_name text,
  add column if not exists advertised_cost numeric(12,2),
  add column if not exists awarded_amount numeric(12,2);
