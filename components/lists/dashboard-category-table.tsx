import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardCategoryGroup } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardCategoryTableProps = {
  rows: DashboardCategoryGroup[];
};

export function DashboardCategoryTable({ rows }: DashboardCategoryTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            By category
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Totals grouped by ledger category and module source.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No category data yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Direction</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.category}-${row.direction}`} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-semibold">{row.category}</td>
                    <td className="px-4 py-3">{row.direction}</td>
                    <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
