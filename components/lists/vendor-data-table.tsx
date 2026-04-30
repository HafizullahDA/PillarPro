import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  VendorListItem,
  VendorPaymentListItem,
  VendorPurchaseListItem,
} from "@/features/vendors/types";
import { formatCurrency } from "@/lib/utils/formatters";

type VendorDataTableProps =
  | {
      title: string;
      emptyMessage: string;
      type: "vendors";
      rows: VendorListItem[];
    }
  | {
      title: string;
      emptyMessage: string;
      type: "purchases";
      rows: VendorPurchaseListItem[];
    }
  | {
      title: string;
      emptyMessage: string;
      type: "payments";
      rows: VendorPaymentListItem[];
    };

export function VendorDataTable(props: VendorDataTableProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">{props.title}</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{props.emptyMessage}</p>
        </div>
        <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground)]">
          {props.rows.length}
        </span>
      </div>

      {props.rows.length === 0 ? (
        <EmptyState message={props.emptyMessage} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)]">
          <div className="overflow-x-auto">
            {props.type === "vendors" ? (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {props.rows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold">{row.name}</td>
                      <td className="px-4 py-3">{row.project_name}</td>
                      <td className="px-4 py-3">
                        {row.contact_person || "No contact"}
                        <div className="text-xs text-[color:var(--muted)]">{row.phone || "-"}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {props.type === "purchases" ? (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Material</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {props.rows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold">
                        {row.vendor_name}
                        <div className="text-xs text-[color:var(--muted)]">{row.project_name}</div>
                      </td>
                      <td className="px-4 py-3">{row.material}</td>
                      <td className="px-4 py-3">{row.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(row.rate)}</td>
                      <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">{row.purchase_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {props.type === "payments" ? (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[color:var(--surface-muted)] text-[color:var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Vendor</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Mode</th>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {props.rows.map((row) => (
                    <tr key={row.id} className="border-t border-[color:var(--border)]">
                      <td className="px-4 py-3 font-semibold">
                        {row.vendor_name}
                        <div className="text-xs text-[color:var(--muted)]">{row.project_name}</div>
                      </td>
                      <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">{row.payment_mode}</td>
                      <td className="px-4 py-3">{row.payment_reference || "-"}</td>
                      <td className="px-4 py-3">{row.payment_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
