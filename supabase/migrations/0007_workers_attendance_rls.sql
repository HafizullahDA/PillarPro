alter table workers enable row level security;
alter table attendance enable row level security;

create policy "workers_select_public"
on workers
for select
to anon, authenticated
using (true);

create policy "workers_insert_public"
on workers
for insert
to anon, authenticated
with check (true);

create policy "attendance_select_public"
on attendance
for select
to anon, authenticated
using (true);

create policy "attendance_insert_public"
on attendance
for insert
to anon, authenticated
with check (true);
