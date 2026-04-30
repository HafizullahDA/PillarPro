# PillarPro

PillarPro is a mobile-first construction ERP built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## What is included now

- mobile-first ERP modules for projects, vendors, attendance, receivables, partners, expenses, and dashboard
- Supabase-backed auth with email/password sign-up, sign-in, and email verification
- reusable form and table components
- centralized ledger and finance services

## How to run this as a beginner

1. Create a Supabase project.
2. Run the SQL from [0001_pillarpro_schema.sql](</C:/PillarPro/supabase/migrations/0001_pillarpro_schema.sql>).
3. Run the SQL from [0002_projects_module_update.sql](</C:/PillarPro/supabase/migrations/0002_projects_module_update.sql>).
4. Copy `.env.example` to `.env.local`.
5. Fill in your Supabase URL, anon key, and site URL.
6. Run `npm install`.
7. Run `npm run dev`.
8. Open `http://localhost:3000`.

## Supabase auth setup

1. In Supabase, open `Authentication` -> `Providers` and keep `Email` enabled.
2. In `Authentication` -> `URL Configuration`, set:
   - `Site URL` = `http://localhost:3000`
   - add redirect URL `http://localhost:3000/auth/callback`
3. Keep email confirmation enabled so new users must verify before they access the app.

## Current flow

- New users go to `/sign-up`
- Supabase sends a confirmation email
- Email link returns to `/auth/callback`
- Verified users can sign in at `/sign-in`
- Protected app routes open after sign-in
