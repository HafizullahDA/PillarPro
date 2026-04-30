import { BillForm } from "@/components/forms/bill-form";
import { ReceiptForm } from "@/components/forms/receipt-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { BillsTable } from "@/components/lists/bills-table";
import { PaymentsTable } from "@/components/lists/payments-table";
import { ProjectReceivableDashboard } from "@/components/lists/project-receivable-dashboard";
import { getProjects } from "@/features/projects/queries";
import {
  getBills,
  getBillsPage,
  getProjectReceivableSummaries,
  getReceipts,
  getReceiptsPage,
} from "@/features/receivables/queries";

export const dynamic = "force-dynamic";

export default async function ReceivablesPage() {
  const [projects, bills, billsPage, receiptsPage, summaries] = await Promise.all([
    getProjects(),
    getBills(),
    getBillsPage(),
    getReceiptsPage(),
    getProjectReceivableSummaries(),
  ]);

  return (
    <MobilePage
      eyebrow="Receivables"
      title="Receivables"
      description="Track contract bills, received payments, and outstanding balances by project."
    >
      <ProjectReceivableDashboard summaries={summaries} />
      <BillForm projects={projects} />
      <ReceiptForm projects={projects} bills={bills} />
      <BillsTable rows={billsPage.rows} totalCount={billsPage.pagination.total} />
      <PaymentsTable rows={receiptsPage.rows} totalCount={receiptsPage.pagination.total} />
    </MobilePage>
  );
}
