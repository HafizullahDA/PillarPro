import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { DashboardProjectGroup } from "@/features/dashboard/types";
import { formatCurrency } from "@/lib/utils/formatters";

type DashboardProjectTableProps = {
  rows: DashboardProjectGroup[];
};

const columns: ModuleTableColumn<DashboardProjectGroup>[] = [
  { key: "expense", header: "Expense", cell: (row) => formatCurrency(row.totalExpense) },
  { key: "received", header: "Received", cell: (row) => formatCurrency(row.totalReceived) },
  { key: "receivable", header: "Receivables", cell: (row) => formatCurrency(row.totalReceivable) },
  { key: "movement", header: "Net movement", cell: (row) => formatCurrency(row.netMovement) },
];

export function DashboardProjectTable({ rows }: DashboardProjectTableProps) {
  return (
    <ModuleTable
      title="By project"
      description="Expense, received, receivable, and net movement grouped by project."
      emptyMessage="No transaction data yet."
      rows={rows}
      columns={columns}
      getRowId={(row) => row.project_id}
      mobileTitle={(row) => row.project_name}
    />
  );
}
