import { Card } from "@/components/ui/card";
import type { DashboardSummary } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardSummaryBlocksProps = {
  summary: DashboardSummary;
};

export function DashboardSummaryBlocks({
  summary,
}: DashboardSummaryBlocksProps) {
  const blocks = [
    { label: "Total expense", value: summary.totalExpense },
    { label: "Total received", value: summary.totalReceived },
    { label: "Outstanding", value: summary.outstanding },
    { label: "Vendor dues", value: summary.vendorDues },
    { label: "Receivables", value: summary.receivables },
  ];

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Summary blocks
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          High-level totals from the unified ledger and connected receivable/vendor flows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
              {block.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
              {formatCurrency(block.value)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
