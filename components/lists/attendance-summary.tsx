import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatters";

type AttendanceSummaryProps = {
  monthLabel: string;
  totalDaysWorked: number;
  totalOtHours: number;
  totalAmount: number;
};

export function AttendanceSummary({
  monthLabel,
  totalDaysWorked,
  totalOtHours,
  totalAmount,
}: AttendanceSummaryProps) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Monthly summary</h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{monthLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Total days worked
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            {totalDaysWorked.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Total OT hours
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            {totalOtHours.toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--muted)]">
            Salary expense
          </p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>
    </Card>
  );
}
