import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { DashboardCategoryGroup } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardCategoryTableProps = {
  rows: DashboardCategoryGroup[];
};

const columns: ModuleTableColumn<DashboardCategoryGroup>[] = [
  { key: "direction", header: "Direction", cell: (row) => row.direction },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
];

export function DashboardCategoryTable({ rows }: DashboardCategoryTableProps) {
  return (
    <ModuleTable
      title="By category"
      description="Totals grouped by ledger category and module source."
      emptyMessage="No category data yet."
      rows={rows}
      columns={columns}
      getRowId={(row) => `${row.category}-${row.direction}`}
      mobileTitle={(row) => row.category}
      mobileBadge={(row) => formatCurrency(row.amount)}
    />
  );
}
