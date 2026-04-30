import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingCard } from "@/components/ui/loading-card";

export type ModuleTableColumn<TRow> = {
  key: string;
  header: string;
  cell: (row: TRow) => ReactNode;
  mobileLabel?: string;
};

type ModuleTableProps<TRow> = {
  title: string;
  description: string;
  emptyMessage: string;
  rows: TRow[];
  columns: ModuleTableColumn<TRow>[];
  getRowId: (row: TRow) => string;
  totalCount?: number;
  loading?: boolean;
  mobileTitle: (row: TRow) => ReactNode;
  mobileSubtitle?: (row: TRow) => ReactNode;
  mobileBadge?: (row: TRow) => ReactNode;
};

export function ModuleTable<TRow>({
  title,
  description,
  emptyMessage,
  rows,
  columns,
  getRowId,
  totalCount,
  loading = false,
  mobileTitle,
  mobileSubtitle,
  mobileBadge,
}: ModuleTableProps<TRow>) {
  if (loading) {
    return <LoadingCard title={title} lines={4} />;
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
          {totalCount ?? rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {rows.map((row) => (
              <article
                key={getRowId(row)}
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[color:var(--foreground)]">
                      {mobileTitle(row)}
                    </h3>
                    {mobileSubtitle ? (
                      <div className="mt-1 text-sm text-[color:var(--muted)]">
                        {mobileSubtitle(row)}
                      </div>
                    ) : null}
                  </div>
                  {mobileBadge ? (
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                      {mobileBadge(row)}
                    </div>
                  ) : null}
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  {columns.map((column) => (
                    <div key={column.key}>
                      <dt className="text-[color:var(--muted)]">
                        {column.mobileLabel ?? column.header}
                      </dt>
                      <dd className="mt-1 font-semibold text-[color:var(--foreground)]">
                        {column.cell(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-[color:var(--border)] md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="px-4 py-3 font-medium">
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={getRowId(row)} className="border-t border-[color:var(--border)]">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4 py-3">
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
