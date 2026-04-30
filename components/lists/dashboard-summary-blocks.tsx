import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DashboardOutstandingAlert } from "@/features/dashboard/types";
import type { DashboardSummary } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardSummaryBlocksProps = {
  summary: DashboardSummary;
  alerts: DashboardOutstandingAlert[];
};

export function DashboardSummaryBlocks({
  summary,
  alerts,
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

      <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
              Outstanding alerts
            </h3>
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Projects with receivables still pending collection.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {alerts.length}
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="mt-4">
            <EmptyState message="No outstanding alerts right now." />
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.project_id}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-[color:var(--foreground)]">
                  {alert.project_name}
                </p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">
                  Outstanding receivable
                </p>
                <p className="mt-2 text-base font-semibold text-amber-900">
                  {formatCurrency(alert.outstanding)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
