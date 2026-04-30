import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardProjectGroup } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardProjectTableProps = {
  rows: DashboardProjectGroup[];
};

export function DashboardProjectTable({ rows }: DashboardProjectTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            By project
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Expense, received, receivable, and net movement grouped by project.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No transaction data yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <article
              key={row.project_id}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
            >
              <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                {row.project_name}
              </h3>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[color:var(--muted)]">Expense</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(row.totalExpense)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Received</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(row.totalReceived)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Receivables</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(row.totalReceivable)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Net movement</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(row.netMovement)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
