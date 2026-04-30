import { VendorForm } from "@/components/forms/vendor-form";
import { VendorPaymentForm } from "@/components/forms/vendor-payment-form";
import { VendorPurchaseForm } from "@/components/forms/vendor-purchase-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { VendorDataTable } from "@/components/lists/vendor-data-table";
import { getProjects } from "@/features/projects/queries";
import {
  getVendorPaymentsPage,
  getVendorPurchasesPage,
  getVendors,
  getVendorsPage,
} from "@/features/vendors/queries";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const [projects, vendors, vendorsPage, purchases, payments] = await Promise.all([
    getProjects(),
    getVendors(),
    getVendorsPage(),
    getVendorPurchasesPage(),
    getVendorPaymentsPage(),
  ]);

  return (
    <MobilePage
      eyebrow="Vendor Management"
      title="Vendors"
      description="Create vendors, record purchases, and track payments through the unified ledger."
    >
      <VendorForm projects={projects} />
      <VendorPurchaseForm projects={projects} vendors={vendors} />
      <VendorPaymentForm projects={projects} vendors={vendors} />
      <VendorDataTable
        title="Vendors"
        description="Recently added vendor master records."
        emptyMessage="No vendors yet."
        rows={vendorsPage.rows}
        totalCount={vendorsPage.pagination.total}
        type="vendors"
      />
      <VendorDataTable
        title="Purchase entries"
        description="Recent material purchases linked to the ledger."
        emptyMessage="No purchases recorded yet."
        rows={purchases.rows}
        totalCount={purchases.pagination.total}
        type="purchases"
      />
      <VendorDataTable
        title="Payment entries"
        description="Recent vendor payments pushed through the payment ledger."
        emptyMessage="No payments recorded yet."
        rows={payments.rows}
        totalCount={payments.pagination.total}
        type="payments"
      />
    </MobilePage>
  );
}
