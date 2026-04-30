# Receivables Guide

## What was added

- Project summary dashboard
- Bills table
- Payment table
- Bill creation form
- Payment receipt form
- Outstanding calculation: `billed - received`

## Ledger behavior

- Bill entry inserts into `transactions` with:
  - `transaction_type = 'receivable'`
  - `direction = 'inflow'`

- Payment entry inserts into `transactions` with:
  - `transaction_type = 'receivable'`
  - `direction = 'inflow'`

## SQL to run next

Run these as new queries in Supabase:

1. [0008_receivables_schema.sql](</C:/PillarPro/supabase/migrations/0008_receivables_schema.sql>)
2. [0009_receivables_rls.sql](</C:/PillarPro/supabase/migrations/0009_receivables_rls.sql>)

## Page

Open:

- [http://localhost:3000/receivables](http://localhost:3000/receivables)
