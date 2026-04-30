import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type { ProjectListItem } from "@/features/projects/types";
import { formatCurrency } from "@/lib/utils/formatters";

type ProjectListProps = {
  projects: ProjectListItem[];
  totalCount?: number;
};

const columns: ModuleTableColumn<ProjectListItem>[] = [
  {
    key: "agency_name",
    header: "Agency",
    cell: (project) => project.agency_name || "Not set",
  },
  {
    key: "advertised_cost",
    header: "Advertised cost",
    cell: (project) => formatCurrency(project.advertised_cost),
  },
  {
    key: "awarded_amount",
    header: "Awarded amount",
    cell: (project) => formatCurrency(project.awarded_amount),
  },
  {
    key: "start_date",
    header: "Start date",
    cell: (project) => project.start_date ?? "Not set",
  },
  {
    key: "code",
    header: "Project code",
    cell: (project) => project.code,
  },
];

export function ProjectList({ projects, totalCount }: ProjectListProps) {
  return (
    <ModuleTable
      title="Project list"
      description="Recent projects loaded from Supabase."
      emptyMessage="No projects yet. Use the form above to create your first project."
      rows={projects}
      totalCount={totalCount}
      columns={columns}
      getRowId={(project) => project.id}
      mobileTitle={(project) => project.name}
      mobileSubtitle={(project) => project.agency_name || "Agency not set"}
      mobileBadge={(project) => project.status}
    />
  );
}
