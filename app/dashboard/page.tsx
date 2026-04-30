import { MobilePage } from "@/components/layout/mobile-page";
import { DashboardCategoryTable } from "@/components/lists/dashboard-category-table";
import { DashboardProjectTable } from "@/components/lists/dashboard-project-table";
import { DashboardSummaryBlocks } from "@/components/lists/dashboard-summary-blocks";
import {
  getDashboardOutstandingAlerts,
  getDashboardCategoryGroups,
  getDashboardProjectGroups,
  getDashboardSummary,
} from "@/features/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, alerts, projectGroups, categoryGroups] = await Promise.all([
    getDashboardSummary(),
    getDashboardOutstandingAlerts(),
    getDashboardProjectGroups(),
    getDashboardCategoryGroups(),
  ]);

  return (
    <MobilePage
      eyebrow="Unified Dashboard"
      title="Dashboard"
      description="Finance-engine summary powered by the centralized ledger with project and category breakdowns."
    >
      <DashboardSummaryBlocks summary={summary} alerts={alerts} />
      <DashboardProjectTable rows={projectGroups} />
      <DashboardCategoryTable rows={categoryGroups} />
    </MobilePage>
  );
}
