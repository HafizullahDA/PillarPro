# Vendor Management Guide

## What was added

- Vendor creation page and form
- Purchase entry form
- Payment entry form
- Table views for vendors, purchases, and payments
- Shared transaction insert logic so purchases and payments both write to `transactions`

## Required new SQL

Run these next in Supabase:

1. [0004_vendor_management_schema.sql](</C:/PillarPro/supabase/migrations/0004_vendor_management_schema.sql>)
2. [0005_vendor_management_rls.sql](</C:/PillarPro/supabase/migrations/0005_vendor_management_rls.sql>)

## Ledger behavior

- Every purchase inserts into `transactions` with:
  - `transaction_type = 'expense'`
  - `direction = 'outflow'`

- Every payment inserts into `transactions` with:
  - `transaction_type = 'payment'`
  - `direction = 'outflow'`

## Page

Open:

- [http://localhost:3000/vendors](http://localhost:3000/vendors)
