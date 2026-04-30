import { MobilePage } from "@/components/layout/mobile-page";
import { DashboardCategoryTable } from "@/components/lists/dashboard-category-table";
import { DashboardProjectTable } from "@/components/lists/dashboard-project-table";
import { DashboardSummaryBlocks } from "@/components/lists/dashboard-summary-blocks";
import {
  getDashboardCategoryGroups,
  getDashboardProjectGroups,
  getDashboardSummary,
} from "@/features/dashboard/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, projectGroups, categoryGroups] = await Promise.all([
    getDashboardSummary(),
    getDashboardProjectGroups(),
    getDashboardCategoryGroups(),
  ]);

  return (
    <MobilePage
      eyebrow="Unified Dashboard"
      title="Dashboard"
      description="Ledger-first summary powered by the transactions table with project and category grouping."
    >
      <DashboardSummaryBlocks summary={summary} />
      <DashboardProjectTable rows={projectGroups} />
      <DashboardCategoryTable rows={categoryGroups} />
    </MobilePage>
  );
}
