# Worker Attendance Guide

## What was added

- Worker creation
- Daily attendance entry
- Auto amount calculation
- Monthly attendance summary
- Salary expense insertion into `transactions`

## OT calculation assumption

For now, overtime uses this rule:

- hourly OT rate = `rate/day / 8`
- overtime amount = `rate/day + (hourly OT rate * OT hours)`

This matches your prompt:
- present = full rate
- half-day = 0.5 rate
- overtime = rate + OT

## SQL to run next

Run these as new queries in Supabase:

1. [0006_workers_attendance_schema.sql](</C:/PillarPro/supabase/migrations/0006_workers_attendance_schema.sql>)
2. [0007_workers_attendance_rls.sql](</C:/PillarPro/supabase/migrations/0007_workers_attendance_rls.sql>)

## Page

Open:

- [http://localhost:3000/attendance](http://localhost:3000/attendance)
