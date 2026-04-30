# PillarPro Architecture Plan

## Folder Structure

```text
pillarpro/
  app/
    (dashboard)/
      layout.tsx
      page.tsx
      projects/
        page.tsx
        [projectId]/
          page.tsx
      vendors/
        page.tsx
      attendance/
        page.tsx
      payroll/
        page.tsx
      receivables/
        page.tsx
      partners/
        page.tsx
      expenses/
        page.tsx
      ledger/
        page.tsx
    api/
      projects/route.ts
      vendors/route.ts
      workers/route.ts
      attendance/route.ts
      payroll/route.ts
      receivables/route.ts
      partners/route.ts
      expenses/route.ts
      transactions/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
      app-shell.tsx
      bottom-nav.tsx
      mobile-header.tsx
    ui/
      button.tsx
      card.tsx
      form-field.tsx
      empty-state.tsx
      amount.tsx
      status-badge.tsx
    forms/
      project-form.tsx
      vendor-form.tsx
      attendance-form.tsx
      payroll-form.tsx
      receivable-form.tsx
      partner-entry-form.tsx
      expense-form.tsx
      transaction-form.tsx
    lists/
      project-list.tsx
      vendor-list.tsx
      worker-list.tsx
      receivable-list.tsx
      transaction-list.tsx
    ledger/
      transaction-feed.tsx
      transaction-summary.tsx
  features/
    projects/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    vendors/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    workers/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    attendance/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    payroll/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    receivables/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    partners/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    expenses/
      components/
      queries.ts
      mutations.ts
      validators.ts
      types.ts
    ledger/
      queries.ts
      service.ts
      validators.ts
      types.ts
  lib/
    supabase/
      browser.ts
      server.ts
      middleware.ts
    db/
      generated.types.ts
      constants.ts
    utils/
      currency.ts
      dates.ts
      numbers.ts
      guards.ts
    auth/
      session.ts
  services/
    transactions/
      create-transaction.ts
      transaction-links.ts
      transaction-balance.ts
    payroll/
      payroll-calculator.ts
    receivables/
      receivable-status.ts
    partners/
      partner-balance.ts
  supabase/
    migrations/
      0001_core_tables.sql
      0002_financial_tables.sql
      0003_indexes_and_policies.sql
    seed.sql
  types/
    database.ts
    domain.ts
  docs/
    architecture-plan.md
```

## DB Schema Plan

### Core rule
- Every business record belongs to a `project_id`.
- Every financial event inserts into `transactions`.
- Module-specific tables hold descriptive details while `transactions` stays the single financial ledger.

### Core tables

#### `projects`
- `id`
- `name`
- `code`
- `client_name`
- `location`
- `start_date`
- `end_date`
- `status`
- `created_at`

#### `vendors`
- `id`
- `project_id`
- `name`
- `contact_person`
- `phone`
- `category`
- `created_at`

#### `workers`
- `id`
- `project_id`
- `name`
- `role`
- `phone`
- `daily_rate`
- `join_date`
- `active`
- `created_at`

#### `attendance`
- `id`
- `project_id`
- `worker_id`
- `attendance_date`
- `status`
- `units_worked`
- `overtime_units`
- `created_at`

#### `payroll_runs`
- `id`
- `project_id`
- `period_start`
- `period_end`
- `status`
- `processed_at`
- `created_at`

#### `payroll_entries`
- `id`
- `project_id`
- `payroll_run_id`
- `worker_id`
- `days_present`
- `overtime_units`
- `gross_amount`
- `deduction_amount`
- `net_amount`
- `transaction_id`
- `created_at`

#### `receivables`
- `id`
- `project_id`
- `invoice_number`
- `contract_reference`
- `bill_date`
- `due_date`
- `amount`
- `status`
- `transaction_id`
- `created_at`

#### `partners`
- `id`
- `project_id`
- `name`
- `share_percent`
- `phone`
- `created_at`

#### `partner_accounts`
- `id`
- `project_id`
- `partner_id`
- `entry_date`
- `entry_type`
- `amount`
- `notes`
- `transaction_id`
- `created_at`

#### `expenses`
- `id`
- `project_id`
- `expense_date`
- `category`
- `vendor_id`
- `amount`
- `notes`
- `transaction_id`
- `created_at`

### Central ledger table

#### `transactions`
- `id`
- `project_id`
- `transaction_date`
- `transaction_type`
- `reference_table`
- `reference_id`
- `direction`
- `amount`
- `notes`
- `created_at`

### Recommended transaction types
- `expense`
- `payment`
- `receivable`
- `partner`
- `payroll`

### Relationship rules
- `vendors.project_id -> projects.id`
- `workers.project_id -> projects.id`
- `attendance.project_id -> projects.id`
- `attendance.worker_id -> workers.id`
- `payroll_runs.project_id -> projects.id`
- `payroll_entries.project_id -> projects.id`
- `payroll_entries.payroll_run_id -> payroll_runs.id`
- `payroll_entries.worker_id -> workers.id`
- `payroll_entries.transaction_id -> transactions.id`
- `receivables.project_id -> projects.id`
- `receivables.transaction_id -> transactions.id`
- `partners.project_id -> projects.id`
- `partner_accounts.project_id -> projects.id`
- `partner_accounts.partner_id -> partners.id`
- `partner_accounts.transaction_id -> transactions.id`
- `expenses.project_id -> projects.id`
- `expenses.vendor_id -> vendors.id`
- `expenses.transaction_id -> transactions.id`
- `transactions.project_id -> projects.id`

### Indexing strategy
- Index every `project_id`
- Composite index on `transactions (project_id, transaction_date desc)`
- Composite index on `attendance (project_id, attendance_date desc)`
- Composite index on `receivables (project_id, status)`
- Composite index on `expenses (project_id, category)`

## Module Breakdown

### 1. Projects
- Root module for project onboarding and filtering
- Owns project summary, project switcher, and project-scoped dashboards

### 2. Vendor Management
- Vendor master records per project
- Links vendors to misc expenses and payments

### 3. Worker Attendance and Payroll
- Daily attendance capture
- Payroll run generation from attendance
- Payroll entry writes one financial record into `transactions`

### 4. Receivables
- Government contract bill entries
- Status tracking from raised to collected
- Each receivable creates a `transactions` ledger record

### 5. Partner Accounts
- Capital introduced, withdrawals, and settlements
- Each partner account entry creates a `transactions` record

### 6. Misc Expenses
- Fuel, equipment, tendering, and other project expenses
- Each expense creates a `transactions` record

### 7. Unified Ledger System
- Single source of truth for inflow and outflow
- Shared reporting surface across modules
- Balances and summaries always derived from `transactions`

## Execution Order

1. Create Supabase project and environment variables.
2. Build SQL migrations for `projects` and `transactions`.
3. Add module tables with foreign keys to `projects` and `transactions`.
4. Generate TypeScript database types from Supabase schema.
5. Set up `lib/supabase` clients and shared server helpers.
6. Build transaction creation service so every financial module uses one path.
7. Build Projects module because all records depend on `project_id`.
8. Build Vendor Management because expenses depend on vendors.
9. Build Workers, Attendance, and Payroll flow.
10. Build Receivables flow.
11. Build Partner Accounts flow.
12. Build Misc Expenses flow.
13. Build unified ledger views and summaries from `transactions`.
14. Add responsive mobile-first dashboard and reusable forms/lists.
15. Validate end-to-end data flow for each module and confirm each financial action writes to `transactions`.
