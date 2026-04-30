import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { BillListItem } from "@/features/receivables/types";
import { formatCurrency } from "@/lib/utils/formatters";

type BillsTableProps = {
  rows: BillListItem[];
  totalCount?: number;
};

const columns: ModuleTableColumn<BillListItem>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "type", header: "Bill type", cell: (row) => row.bill_type },
  { key: "gross", header: "Gross", cell: (row) => formatCurrency(row.gross_amount) },
  { key: "deductions", header: "Deductions", cell: (row) => formatCurrency(row.deductions) },
  { key: "net", header: "Net payable", cell: (row) => formatCurrency(row.net_payable) },
  { key: "date", header: "Date", cell: (row) => row.bill_date },
];

export function BillsTable({ rows, totalCount }: BillsTableProps) {
  return (
    <ModuleTable
      title="Bills table"
      description="Recent billed receivables."
      emptyMessage="No bills yet."
      rows={rows}
      totalCount={totalCount}
      columns={columns}
      getRowId={(row) => row.id}
      mobileTitle={(row) => row.bill_number}
      mobileSubtitle={(row) => row.project_name}
      mobileBadge={(row) => formatCurrency(row.net_payable)}
    />
  );
}
