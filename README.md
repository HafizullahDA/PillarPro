# PillarPro

PillarPro is a mobile-first construction ERP built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## What is included now

- Project Management module
- reusable mobile form input components
- Supabase fetch and insert flow for projects
- SQL migration updates for project fields

## How to run this as a beginner

1. Create a Supabase project.
2. Run the SQL from [0001_pillarpro_schema.sql](</C:/PillarPro/supabase/migrations/0001_pillarpro_schema.sql>).
3. Run the SQL from [0002_projects_module_update.sql](</C:/PillarPro/supabase/migrations/0002_projects_module_update.sql>).
4. Copy `.env.example` to `.env.local`.
5. Fill in your Supabase URL and anon key.
6. Run `npm install`.
7. Run `npm run dev`.
8. Open `http://localhost:3000`.

## Current screen

The app opens on `/projects` where you can:
- create a project
- see the saved project list
- verify data is coming from Supabase
