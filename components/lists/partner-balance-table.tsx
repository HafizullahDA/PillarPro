import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { PartnerBalanceRow } from "@/features/partners/types";
import { formatCurrency } from "@/lib/utils/formatters";

type PartnerBalanceTableProps = {
  rows: PartnerBalanceRow[];
  totalCount?: number;
};

const columns: ModuleTableColumn<PartnerBalanceRow>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "paid", header: "Paid by partner", cell: (row) => formatCurrency(row.totalPaidByPartner) },
  { key: "received", header: "Received by partner", cell: (row) => formatCurrency(row.totalReceivedByPartner) },
  { key: "balance", header: "Balance", cell: (row) => formatCurrency(row.runningBalance) },
];

export function PartnerBalanceTable({ rows, totalCount }: PartnerBalanceTableProps) {
  return (
    <ModuleTable
      title="Running balance"
      description="Positive means partner has paid in more. Negative means partner has received more."
      emptyMessage="No partners yet."
      rows={rows}
      totalCount={totalCount}
      columns={columns}
      getRowId={(row) => row.partner_id}
      mobileTitle={(row) => row.partner_name}
      mobileSubtitle={(row) => row.project_name}
      mobileBadge={(row) => formatCurrency(row.runningBalance)}
    />
  );
}
