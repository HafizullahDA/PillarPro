create policy "workers_update_public"
on workers
for update
to anon, authenticated
using (true)
with check (true);

create policy "attendance_update_public"
on attendance
for update
to anon, authenticated
using (true)
with check (true);
