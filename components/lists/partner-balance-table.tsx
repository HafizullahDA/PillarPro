import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PartnerBalanceRow } from "@/features/partners/types";
import { formatCurrency } from "@/lib/utils/formatters";

type PartnerBalanceTableProps = {
  rows: PartnerBalanceRow[];
};

export function PartnerBalanceTable({ rows }: PartnerBalanceTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
            Running balance
          </h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Positive means partner has paid in more. Negative means partner has received more.
          </p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No partners yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Partner</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Paid by partner</th>
                  <th className="px-4 py-3 font-medium">Received by partner</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.partner_id} className="border-t border-[color:var(--border)]">
                    <td className="px-4 py-3 font-semibold">{row.partner_name}</td>
                    <td className="px-4 py-3">{row.project_name}</td>
                    <td className="px-4 py-3">{formatCurrency(row.totalPaidByPartner)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.totalReceivedByPartner)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.runningBalance)}</td>
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
