# AGENTS.md

## Project: PillarPro (Construction ERP)

## Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres)
- Vercel deployment

## Core Architecture
- Ledger-first system
- Every financial event must be stored in `transactions`
- No duplicate calculations across modules
- Project is root entity

## Rules
- Never invent fields not defined in spec
- Always create DB schema before UI
- Always connect UI to Supabase
- Always create reusable components
- Mobile-first UI only

## Workflow
1. Read spec
2. Create DB schema
3. Build API/data layer
4. Build UI
5. Validate data flow
6. Ensure responsiveness

## Financial Rule
All modules must insert into `transactions` table:
- expense
- payment
- receivable
- partner

No exception.
