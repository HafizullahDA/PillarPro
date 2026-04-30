import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { ProjectReceivableSummary } from "@/features/receivables/types";
import { formatCurrency } from "@/lib/utils/formatters";

type ProjectReceivableDashboardProps = {
  summaries: ProjectReceivableSummary[];
};

const columns: ModuleTableColumn<ProjectReceivableSummary>[] = [
  { key: "agency", header: "Agency", cell: (row) => row.agency_name || "Not set" },
  { key: "advertised", header: "Advertised cost", cell: (row) => formatCurrency(row.advertised_cost) },
  { key: "awarded", header: "Awarded amount", cell: (row) => formatCurrency(row.awarded_amount) },
  { key: "billed", header: "Total billed", cell: (row) => formatCurrency(row.totalBilled) },
  { key: "received", header: "Amount received", cell: (row) => formatCurrency(row.totalReceived) },
  { key: "outstanding", header: "Outstanding", cell: (row) => formatCurrency(row.outstanding) },
];

export function ProjectReceivableDashboard({
  summaries,
}: ProjectReceivableDashboardProps) {
  return (
    <ModuleTable
      title="Project summary dashboard"
      description="Contract value, billed amount, received payment, and outstanding receivables."
      emptyMessage="No projects yet."
      rows={summaries}
      columns={columns}
      getRowId={(row) => row.project_id}
      mobileTitle={(row) => row.project_name}
      mobileSubtitle={(row) => row.agency_name || "Agency not set"}
      mobileBadge={(row) => `${row.billCount} bills`}
    />
  );
}
