import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { MiscExpenseListItem } from "@/features/misc-expenses/types";
import { formatCurrency } from "@/lib/utils/formatters";

type MiscExpensesTableProps = {
  rows: MiscExpenseListItem[];
};

export function MiscExpensesTable({ rows }: MiscExpensesTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Records table</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Fuel, equipment, tendering, and site expenses.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No miscellaneous records yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-semibold">{row.project_name}</td>
                    <td className="px-4 py-3">{row.category}</td>
                    <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                    <td className="px-4 py-3">{row.expense_date}</td>
                    <td className="px-4 py-3">{row.description}</td>
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
