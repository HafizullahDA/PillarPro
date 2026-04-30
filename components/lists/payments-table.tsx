import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { ReceiptListItem } from "@/features/receivables/types";
import { formatCurrency } from "@/lib/utils/formatters";

type PaymentsTableProps = {
  rows: ReceiptListItem[];
  totalCount?: number;
};

const columns: ModuleTableColumn<ReceiptListItem>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "bill", header: "Bill", cell: (row) => row.bill_number || "-" },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "mode", header: "Mode", cell: (row) => row.payment_mode },
  { key: "reference", header: "Reference", cell: (row) => row.payment_reference || "-" },
  { key: "date", header: "Date", cell: (row) => row.receipt_date },
];

export function PaymentsTable({ rows, totalCount }: PaymentsTableProps) {
  return (
    <ModuleTable
      title="Payment table"
      description="Recent received payments."
      emptyMessage="No payments yet."
      rows={rows}
      totalCount={totalCount}
      columns={columns}
      getRowId={(row) => row.id}
      mobileTitle={(row) => row.project_name}
      mobileSubtitle={(row) => row.bill_number || "No bill linked"}
      mobileBadge={(row) => formatCurrency(row.amount)}
    />
  );
}
