import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { BillListItem } from "@/features/receivables/types";
import { formatCurrency } from "@/lib/utils/formatters";

type BillsTableProps = {
  rows: BillListItem[];
};

export function BillsTable({ rows }: BillsTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Bills table</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">All billed receivables.</p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No bills yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Bill</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Deductions</th>
                  <th className="px-4 py-3 font-medium">Net payable</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-semibold">{row.project_name}</td>
                    <td className="px-4 py-3">
                      {row.bill_number}
                      <div className="text-xs text-[color:var(--muted)]">{row.bill_type}</div>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(row.gross_amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.deductions)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.net_payable)}</td>
                    <td className="px-4 py-3">{row.bill_date}</td>
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
