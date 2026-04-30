import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectReceivableSummary } from "@/features/receivables/types";
import { formatCurrency } from "@/lib/utils/formatters";

type ProjectReceivableDashboardProps = {
  summaries: ProjectReceivableSummary[];
};

export function ProjectReceivableDashboard({
  summaries,
}: ProjectReceivableDashboardProps) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
          Project summary dashboard
        </h2>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          Contract value, billed amount, received payment, and outstanding receivables.
        </p>
      </div>

      {summaries.length === 0 ? (
        <EmptyState message="No projects yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {summaries.map((summary) => (
            <article
              key={summary.project_id}
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                    {summary.project_name}
                  </h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{summary.agency_name}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                  {summary.billCount} bills
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[color:var(--muted)]">Advertised cost</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(summary.advertised_cost)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Awarded amount</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(summary.awarded_amount)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Total billed</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(summary.totalBilled)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Amount received</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(summary.totalReceived)}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--muted)]">Outstanding</dt>
                  <dd className="mt-1 font-semibold">{formatCurrency(summary.outstanding)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
