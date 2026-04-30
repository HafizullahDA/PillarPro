# Partner Accounts Guide

## What was added

- Partner master records
- Partner transaction form
- Running balance table
- Partner transaction table

## Balance logic

- `paid_by_partner` increases balance
- `received_by_partner` decreases balance
- `running balance = paid by partner - received by partner`

## Ledger behavior

Every partner transaction inserts into `transactions` with:

- `transaction_type = 'partner'`
- `direction = 'inflow'` when paid by partner
- `direction = 'outflow'` when received by partner

## SQL to run next

Run these as new queries in Supabase:

1. [0010_partner_accounts_schema.sql](</C:/PillarPro/supabase/migrations/0010_partner_accounts_schema.sql>)
2. [0011_partner_accounts_rls.sql](</C:/PillarPro/supabase/migrations/0011_partner_accounts_rls.sql>)

## Page

Open:

- [http://localhost:3000/partners](http://localhost:3000/partners)
