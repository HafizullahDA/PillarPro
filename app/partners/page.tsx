import { PartnerForm } from "@/components/forms/partner-form";
import { PartnerTransactionForm } from "@/components/forms/partner-transaction-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { PartnerBalanceTable } from "@/components/lists/partner-balance-table";
import { PartnerTransactionTable } from "@/components/lists/partner-transaction-table";
import { getProjects } from "@/features/projects/queries";
import {
  getPartnerBalances,
  getPartnerTransactionsPage,
  getPartners,
  getPartnersPage,
} from "@/features/partners/queries";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const [projects, partners, partnersPage, balances, transactions] = await Promise.all([
    getProjects(),
    getPartners(),
    getPartnersPage(),
    getPartnerBalances(),
    getPartnerTransactionsPage(),
  ]);

  return (
    <MobilePage
      eyebrow="Partner Accounts"
      title="Partners"
      description="Create partners, record paid and received entries, and maintain a running balance."
    >
      <PartnerForm projects={projects} />
      <PartnerTransactionForm projects={projects} partners={partners} />
      <PartnerBalanceTable rows={balances} totalCount={partnersPage.pagination.total} />
      <PartnerTransactionTable
        rows={transactions.rows}
        totalCount={transactions.pagination.total}
      />
    </MobilePage>
  );
}
