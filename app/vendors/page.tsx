import { VendorForm } from "@/components/forms/vendor-form";
import { VendorPaymentForm } from "@/components/forms/vendor-payment-form";
import { VendorPurchaseForm } from "@/components/forms/vendor-purchase-form";
import { MobilePage } from "@/components/layout/mobile-page";
import { VendorDataTable } from "@/components/lists/vendor-data-table";
import { getProjects } from "@/features/projects/queries";
import {
  getVendorPayments,
  getVendorPurchases,
  getVendors,
} from "@/features/vendors/queries";

export const dynamic = "force-dynamic";

export default async function VendorsPage() {
  const [projects, vendors, purchases, payments] = await Promise.all([
    getProjects(),
    getVendors(),
    getVendorPurchases(),
    getVendorPayments(),
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
      <VendorDataTable title="Vendors" emptyMessage="No vendors yet." rows={vendors} type="vendors" />
      <VendorDataTable
        title="Purchase entries"
        emptyMessage="No purchases recorded yet."
        rows={purchases}
        type="purchases"
      />
      <VendorDataTable
        title="Payment entries"
        emptyMessage="No payments recorded yet."
        rows={payments}
        type="payments"
      />
    </MobilePage>
  );
}
