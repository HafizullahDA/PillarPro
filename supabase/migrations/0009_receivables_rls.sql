alter table bills enable row level security;
alter table receipts enable row level security;

create policy "bills_select_public"
on bills
for select
to anon, authenticated
using (true);

create policy "bills_insert_public"
on bills
for insert
to anon, authenticated
with check (true);

create policy "receipts_select_public"
on receipts
for select
to anon, authenticated
using (true);

create policy "receipts_insert_public"
on receipts
for insert
to anon, authenticated
with check (true);
