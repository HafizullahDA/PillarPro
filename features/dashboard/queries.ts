import type {
  DashboardCategoryGroup,
  DashboardProjectGroup,
  DashboardSummary,
} from "@/features/dashboard/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/utils/supabase-relations";

type TransactionRow = {
  id: string;
  project_id: string;
  transaction_type: string;
  direction: "inflow" | "outflow";
  amount: number;
  reference_table: string;
  reference_id: string;
  project_name: string;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [transactions, bills, receipts, vendorPurchases, vendorPayments] = await Promise.all([
    getTransactionRows(),
    getBillAmounts(),
    getReceiptAmounts(),
    getVendorPurchaseAmounts(),
    getVendorPaymentAmounts(),
  ]);

  const totalExpense = sumAmounts(
    transactions.filter(
      (row) =>
        row.direction === "outflow" &&
        (row.transaction_type === "expense" ||
          row.transaction_type === "payment" ||
          row.transaction_type === "salary_expense"),
    ),
  );

  const totalReceived = sumAmounts(
    transactions.filter(
      (row) =>
        row.direction === "inflow" &&
        row.reference_table === "receipts",
    ),
  );

  const receivables = sumAmounts(
    transactions.filter(
      (row) =>
        row.direction === "inflow" &&
        row.transaction_type === "receivable" &&
        row.reference_table === "bills",
    ),
  );

  const outstanding = Number((sumAmounts(bills) - sumAmounts(receipts)).toFixed(2));
  const vendorDues = Number(
    (sumAmounts(vendorPurchases) - sumAmounts(vendorPayments)).toFixed(2),
  );

  return {
    totalExpense,
    totalReceived,
    outstanding,
    vendorDues,
    receivables,
  };
}

export async function getDashboardProjectGroups(): Promise<DashboardProjectGroup[]> {
  const transactions = await getTransactionRows();
  const grouped = new Map<string, DashboardProjectGroup>();

  for (const row of transactions) {
    const current = grouped.get(row.project_id) ?? {
      project_id: row.project_id,
      project_name: row.project_name,
      totalExpense: 0,
      totalReceived: 0,
      totalReceivable: 0,
      netMovement: 0,
    };

    if (row.direction === "outflow") {
      current.totalExpense += row.amount;
      current.netMovement -= row.amount;
    } else {
      current.netMovement += row.amount;
      if (row.reference_table === "receipts") {
        current.totalReceived += row.amount;
      }
      if (row.reference_table === "bills") {
        current.totalReceivable += row.amount;
      }
    }

    grouped.set(row.project_id, current);
  }

  return [...grouped.values()]
    .map((row) => ({
      ...row,
      totalExpense: roundMoney(row.totalExpense),
      totalReceived: roundMoney(row.totalReceived),
      totalReceivable: roundMoney(row.totalReceivable),
      netMovement: roundMoney(row.netMovement),
    }))
    .sort((a, b) => a.project_name.localeCompare(b.project_name));
}

export async function getDashboardCategoryGroups(): Promise<DashboardCategoryGroup[]> {
  const [transactions, miscCategories] = await Promise.all([
    getTransactionRows(),
    getMiscExpenseCategoryMap(),
  ]);
  const grouped = new Map<string, DashboardCategoryGroup>();

  for (const row of transactions) {
    const category = resolveCategory(row, miscCategories);
    const key = `${category}::${row.direction}`;
    const current = grouped.get(key) ?? {
      category,
      direction: row.direction,
      amount: 0,
    };

    current.amount += row.amount;
    grouped.set(key, current);
  }

  return [...grouped.values()]
    .map((row) => ({ ...row, amount: roundMoney(row.amount) }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

async function getTransactionRows(): Promise<TransactionRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id, project_id, transaction_type, direction, amount, reference_table, reference_id, projects(name)")
    .order("transaction_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    transaction_type: row.transaction_type,
    direction: row.direction,
    amount: Number(row.amount ?? 0),
    reference_table: row.reference_table,
    reference_id: row.reference_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
  }));
}

async function getBillAmounts() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("bills").select("net_payable");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ amount: Number(row.net_payable ?? 0) }));
}

async function getReceiptAmounts() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("receipts").select("amount");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ amount: Number(row.amount ?? 0) }));
}

async function getVendorPurchaseAmounts() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("vendor_purchases").select("amount");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ amount: Number(row.amount ?? 0) }));
}

async function getVendorPaymentAmounts() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("vendor_payments").select("amount");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ amount: Number(row.amount ?? 0) }));
}

async function getMiscExpenseCategoryMap() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("misc_expenses")
    .select("id, category");

  if (error) throw new Error(error.message);

  return new Map((data ?? []).map((row) => [row.id, row.category ?? "Misc expense"]));
}

function resolveCategory(
  row: TransactionRow,
  miscCategories: Map<string, string>,
) {
  if (row.reference_table === "misc_expenses") {
    return miscCategories.get(row.reference_id) ?? "Misc expense";
  }

  if (row.reference_table === "vendor_purchases") {
    return "Vendor purchase";
  }

  if (row.reference_table === "vendor_payments") {
    return "Vendor payment";
  }

  if (row.reference_table === "attendance") {
    return "Salary expense";
  }

  if (row.reference_table === "partner_transactions") {
    return "Partner";
  }

  if (row.reference_table === "bills") {
    return "Receivable bill";
  }

  if (row.reference_table === "receipts") {
    return "Receivable payment";
  }

  return row.transaction_type;
}

function sumAmounts(rows: Array<{ amount: number }>) {
  return roundMoney(rows.reduce((sum, row) => sum + row.amount, 0));
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}
