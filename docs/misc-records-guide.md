# Miscellaneous Records Guide

## What was added

- Miscellaneous expense form
- Records table
- Categories:
  - Fuel
  - Equipment
  - Tendering/CDRS
  - Site expenses

## Ledger behavior

Every miscellaneous record inserts into `transactions` with:

- `transaction_type = 'expense'`
- `direction = 'outflow'`

## SQL to run next

Run these as new queries in Supabase:

1. [0012_misc_records_schema.sql](</C:/PillarPro/supabase/migrations/0012_misc_records_schema.sql>)
2. [0013_misc_records_rls.sql](</C:/PillarPro/supabase/migrations/0013_misc_records_rls.sql>)

## Page

Open:

- [http://localhost:3000/expenses](http://localhost:3000/expenses)
