alter table vendors enable row level security;
alter table vendor_purchases enable row level security;
alter table vendor_payments enable row level security;
alter table transactions enable row level security;

create policy "vendors_select_public"
on vendors
for select
to anon, authenticated
using (true);

create policy "vendors_insert_public"
on vendors
for insert
to anon, authenticated
with check (true);

create policy "vendor_purchases_select_public"
on vendor_purchases
for select
to anon, authenticated
using (true);

create policy "vendor_purchases_insert_public"
on vendor_purchases
for insert
to anon, authenticated
with check (true);

create policy "vendor_payments_select_public"
on vendor_payments
for select
to anon, authenticated
using (true);

create policy "vendor_payments_insert_public"
on vendor_payments
for insert
to anon, authenticated
with check (true);

create policy "transactions_select_public"
on transactions
for select
to anon, authenticated
using (true);

create policy "transactions_insert_public"
on transactions
for insert
to anon, authenticated
with check (true);
