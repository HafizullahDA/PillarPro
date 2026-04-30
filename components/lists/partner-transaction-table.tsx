import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { PartnerTransactionRow } from "@/features/partners/types";
import { formatCurrency } from "@/lib/utils/formatters";

type PartnerTransactionTableProps = {
  rows: PartnerTransactionRow[];
  totalCount?: number;
};

const columns: ModuleTableColumn<PartnerTransactionRow>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "type", header: "Type", cell: (row) => row.entry_type },
  { key: "mode", header: "Mode", cell: (row) => row.payment_mode },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "date", header: "Date", cell: (row) => row.transaction_date },
];

export function PartnerTransactionTable({ rows, totalCount }: PartnerTransactionTableProps) {
  return (
    <ModuleTable
      title="Partner transactions"
      description="Recent partner account entries pushed into the ledger."
      emptyMessage="No partner transactions yet."
      rows={rows}
      totalCount={totalCount}
      columns={columns}
      getRowId={(row) => row.id}
      mobileTitle={(row) => row.partner_name}
      mobileSubtitle={(row) => row.project_name}
      mobileBadge={(row) => formatCurrency(row.amount)}
    />
  );
}
