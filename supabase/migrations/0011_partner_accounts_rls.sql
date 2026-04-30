alter table partners enable row level security;
alter table partner_transactions enable row level security;

create policy "partners_select_public"
on partners
for select
to anon, authenticated
using (true);

create policy "partners_insert_public"
on partners
for insert
to anon, authenticated
with check (true);

create policy "partner_transactions_select_public"
on partner_transactions
for select
to anon, authenticated
using (true);

create policy "partner_transactions_insert_public"
on partner_transactions
for insert
to anon, authenticated
with check (true);
