import { ModuleTable, type ModuleTableColumn } from "@/components/lists/module-table";
import type {
  VendorListItem,
  VendorPaymentListItem,
  VendorPurchaseListItem,
} from "@/features/vendors/types";
import { formatCurrency } from "@/lib/utils/formatters";

type VendorDataTableProps =
  | {
      title: string;
      description: string;
      emptyMessage: string;
      totalCount?: number;
      type: "vendors";
      rows: VendorListItem[];
    }
  | {
      title: string;
      description: string;
      emptyMessage: string;
      totalCount?: number;
      type: "purchases";
      rows: VendorPurchaseListItem[];
    }
  | {
      title: string;
      description: string;
      emptyMessage: string;
      totalCount?: number;
      type: "payments";
      rows: VendorPaymentListItem[];
    };

const vendorColumns: ModuleTableColumn<VendorListItem>[] = [
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "contact_person", header: "Contact", cell: (row) => row.contact_person || "No contact" },
  { key: "phone", header: "Phone", cell: (row) => row.phone || "-" },
];

const purchaseColumns: ModuleTableColumn<VendorPurchaseListItem>[] = [
  { key: "vendor", header: "Vendor", cell: (row) => row.vendor_name },
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "quantity", header: "Qty", cell: (row) => row.quantity },
  { key: "rate", header: "Rate", cell: (row) => formatCurrency(row.rate) },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "date", header: "Date", cell: (row) => row.purchase_date },
];

const paymentColumns: ModuleTableColumn<VendorPaymentListItem>[] = [
  { key: "vendor", header: "Vendor", cell: (row) => row.vendor_name },
  { key: "project", header: "Project", cell: (row) => row.project_name },
  { key: "amount", header: "Amount", cell: (row) => formatCurrency(row.amount) },
  { key: "mode", header: "Mode", cell: (row) => row.payment_mode },
  { key: "reference", header: "Reference", cell: (row) => row.payment_reference || "-" },
  { key: "date", header: "Date", cell: (row) => row.payment_date },
];

export function VendorDataTable(props: VendorDataTableProps) {
  if (props.type === "vendors") {
    return (
      <ModuleTable
        title={props.title}
        description={props.description}
        emptyMessage={props.emptyMessage}
        rows={props.rows}
        totalCount={props.totalCount}
        columns={vendorColumns}
        getRowId={(row) => row.id}
        mobileTitle={(row) => row.name}
        mobileSubtitle={(row) => row.project_name}
        mobileBadge={(row) => row.phone || "No phone"}
      />
    );
  }

  if (props.type === "purchases") {
    return (
      <ModuleTable
        title={props.title}
        description={props.description}
        emptyMessage={props.emptyMessage}
        rows={props.rows}
        totalCount={props.totalCount}
        columns={purchaseColumns}
        getRowId={(row) => row.id}
        mobileTitle={(row) => row.material}
        mobileSubtitle={(row) => `${row.vendor_name} · ${row.project_name}`}
        mobileBadge={(row) => formatCurrency(row.amount)}
      />
    );
  }

  return (
    <ModuleTable
      title={props.title}
      description={props.description}
      emptyMessage={props.emptyMessage}
      rows={props.rows}
      totalCount={props.totalCount}
      columns={paymentColumns}
      getRowId={(row) => row.id}
      mobileTitle={(row) => row.vendor_name}
      mobileSubtitle={(row) => row.project_name}
      mobileBadge={(row) => formatCurrency(row.amount)}
    />
  );
}
