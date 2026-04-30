import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { MiscExpenseListItem } from "@/features/misc-expenses/types";
import { formatCurrency } from "@/lib/utils/formatters";

type MiscExpensesTableProps = {
  rows: MiscExpenseListItem[];
  totalCount?: number;
};

const columns: ModuleTableColumn<MiscExpenseListItem>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "category", header: "Category", cell: (row) => row.category },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "date", header: "Date", cell: (row) => row.expense_date },
  { key: "description", header: "Description", cell: (row) => row.description },
];

export function MiscExpensesTable({ rows, totalCount }: MiscExpensesTableProps) {
  return (
    <ModuleTable
      title="Records table"
      description="Fuel, equipment, tendering, and site expenses."
      emptyMessage="No miscellaneous records yet."
      rows={rows}
      totalCount={totalCount}
      columns={columns}
      getRowId={(row) => row.id}
      mobileTitle={(row) => row.category}
      mobileSubtitle={(row) => row.project_name}
      mobileBadge={(row) => formatCurrency(row.amount)}
    />
  );
}
