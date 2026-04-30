alter table misc_expenses enable row level security;

create policy "misc_expenses_select_public"
on misc_expenses
for select
to anon, authenticated
using (true);

create policy "misc_expenses_insert_public"
on misc_expenses
for insert
to anon, authenticated
with check (true);
