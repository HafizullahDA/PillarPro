alter table workers
  add column if not exists designation text;

alter table attendance
  add column if not exists ot_hours numeric(10,2) not null default 0,
  add column if not exists amount numeric(12,2) not null default 0,
  add column if not exists transaction_id uuid unique references transactions(id) on delete restrict;
