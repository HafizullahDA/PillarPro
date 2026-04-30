import { assertLedgerIntegrity } from "@/lib/guards/data-integrity";
import {
  isPartnerTransactionCategory,
  isVendorTransactionCategory,
} from "@/lib/services/transaction-rules";
import {
  getTransactions,
  type TransactionRow,
} from "@/lib/services/transaction-service";

export type FinancialBreakdownItem = {
  category: string;
  amount: number;
  direction: "inflow" | "outflow";
};

export type ProjectFinancials = {
  project_id: string;
  total_expense: number;
  total_received: number;
  total_outstanding: number;
  breakdown: FinancialBreakdownItem[];
};

export type VendorOutstanding = {
  vendor_id: string;
  total_purchase: number;
  total_paid: number;
  outstanding: number;
};

export type ReceivableFinancials = {
  project_id: string;
  total_billed: number;
  total_received: number;
  outstanding: number;
};

export type PartnerFinancials = {
  partner_id: string;
  total_paid: number;
  total_received: number;
  net_balance: number;
};

export async function getProjectFinancials(
  projectId: string,
): Promise<ProjectFinancials> {
  const rows = await getProjectTransactions(projectId);
  assertLedgerIntegrity(rows);

  const total_expense = sumAmounts(rows, (row) => row.direction === "outflow");
  const total_received = sumAmounts(
    rows,
    (row) => row.direction === "inflow" && row.category === "receivable_payment",
  );
  const total_billed = sumAmounts(
    rows,
    (row) => row.direction === "inflow" && row.category === "receivable_bill",
  );

  return {
    project_id: projectId,
    total_expense,
    total_received,
    total_outstanding: roundMoney(total_billed - total_received),
    breakdown: buildBreakdown(rows),
  };
}

export async function getVendorOutstanding(
  vendorId: string,
): Promise<VendorOutstanding> {
  const rows = await getTransactions();
  const vendorRows = rows.filter((row) => isVendorTransactionCategory(row.category));
  assertLedgerIntegrity(vendorRows);
  const matchedRows = vendorRows.filter((row) => row.vendor_id === vendorId);

  const total_purchase = sumAmounts(
    matchedRows,
    (row) => row.category === "vendor_purchase",
  );
  const total_paid = sumAmounts(
    matchedRows,
    (row) => row.category === "vendor_payment",
  );

  return {
    vendor_id: vendorId,
    total_purchase,
    total_paid,
    outstanding: roundMoney(total_purchase - total_paid),
  };
}

export async function getReceivables(
  projectId: string,
): Promise<ReceivableFinancials> {
  const rows = await getProjectTransactions(projectId);
  assertLedgerIntegrity(rows);

  const total_billed = sumAmounts(
    rows,
    (row) => row.category === "receivable_bill",
  );
  const total_received = sumAmounts(
    rows,
    (row) => row.category === "receivable_payment",
  );

  return {
    project_id: projectId,
    total_billed,
    total_received,
    outstanding: roundMoney(total_billed - total_received),
  };
}

export async function getPartnerBalance(
  partnerId: string,
): Promise<PartnerFinancials> {
  const rows = await getTransactions();
  const partnerRows = rows.filter((row) => isPartnerTransactionCategory(row.category));
  assertLedgerIntegrity(partnerRows);
  const matchedRows = partnerRows.filter((row) => row.partner_id === partnerId);

  const total_paid = sumAmounts(
    matchedRows,
    (row) => row.category === "partner_paid_by_partner",
  );
  const total_received = sumAmounts(
    matchedRows,
    (row) => row.category === "partner_received_by_partner",
  );

  return {
    partner_id: partnerId,
    total_paid,
    total_received,
    net_balance: roundMoney(total_paid - total_received),
  };
}

async function getProjectTransactions(projectId: string) {
  const rows = await getTransactions();
  return rows.filter((row) => row.project_id === projectId);
}

function buildBreakdown(rows: TransactionRow[]): FinancialBreakdownItem[] {
  const grouped = new Map<string, FinancialBreakdownItem>();

  for (const row of rows) {
    const key = `${row.category}::${row.direction}`;
    const current = grouped.get(key) ?? {
      category: row.category,
      amount: 0,
      direction: row.direction,
    };

    current.amount += row.amount;
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      amount: roundMoney(item.amount),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

function sumAmounts(
  rows: TransactionRow[],
  predicate: (row: TransactionRow) => boolean,
) {
  return roundMoney(
    rows.filter(predicate).reduce((sum, row) => sum + row.amount, 0),
  );
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}
