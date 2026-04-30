alter table projects enable row level security;

create policy "projects_select_public"
on projects
for select
to anon, authenticated
using (true);

create policy "projects_insert_public"
on projects
for insert
to anon, authenticated
with check (true);
