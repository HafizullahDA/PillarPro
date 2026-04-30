# PillarPro RLS Guide

## Why this error happened

The error:

`new row violates row-level security policy for table "projects"`

means:
- your app successfully reached Supabase
- Supabase found the `projects` table
- but Supabase did not allow the insert because there was no policy permitting it

## Fix for the Projects module

Run this SQL in the Supabase SQL Editor:

```sql
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
```

## What these policies do

- `select` policy:
  lets the app read project rows

- `insert` policy:
  lets the app create new project rows

## Beginner note

This is okay for local development and learning.

Later, when we add user login, we should tighten these policies so users only see and edit the correct data.
