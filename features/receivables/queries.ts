import type { ProjectListItem } from "@/features/projects/types";
import type {
  BillInsert,
  BillListItem,
  ProjectReceivableSummary,
  ReceiptInsert,
  ReceiptListItem,
} from "@/features/receivables/types";
import {
  createTransaction,
  deleteTransaction,
} from "@/lib/services/transaction-service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type PaginationOptions,
} from "@/lib/utils/pagination";
import {
  getRelationBillNumber,
  getRelationName,
} from "@/lib/utils/supabase-relations";

export async function getBills(): Promise<BillListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      "id, project_id, bill_number, bill_type, gross_amount, deductions, net_payable, bill_date, projects(name)",
    )
    .order("bill_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    bill_number: row.bill_number,
    bill_type: row.bill_type ?? "",
    gross_amount: Number(row.gross_amount ?? 0),
    deductions: Number(row.deductions ?? 0),
    net_payable: Number(row.net_payable ?? 0),
    bill_date: row.bill_date,
  }));
}

export async function getBillsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<BillListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("bills")
    .select(
      "id, project_id, bill_number, bill_type, gross_amount, deductions, net_payable, bill_date, projects(name)",
      { count: "exact" },
    )
    .order("bill_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      bill_number: row.bill_number,
      bill_type: row.bill_type ?? "",
      gross_amount: Number(row.gross_amount ?? 0),
      deductions: Number(row.deductions ?? 0),
      net_payable: Number(row.net_payable ?? 0),
      bill_date: row.bill_date,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createBill(payload: BillInsert) {
  const supabase = createServerSupabaseClient();
  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "receivable",
    category: "receivable_bill",
    amount: payload.net_payable,
    date: payload.bill_date,
    reference_id: payload.id,
    linked_id: payload.bill_number,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("bills")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      bill_number: payload.bill_number,
      bill_type: payload.bill_type,
      bill_date: payload.bill_date,
      amount: payload.net_payable,
      gross_amount: payload.gross_amount,
      deductions: payload.deductions,
      net_payable: payload.net_payable,
      status: "raised",
      transaction_id: transactionResult.data.id,
    })
    .select("id")
    .single();

  if (error) {
    await deleteTransaction(transactionResult.data.id);
    throw new Error(error.message);
  }

  return data;
}

export async function getReceipts(): Promise<ReceiptListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("receipts")
    .select(
      "id, project_id, bill_id, amount, receipt_date, payment_mode, payment_reference, bills(bill_number), projects(name)",
    )
    .order("receipt_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    bill_number: getRelationBillNumber(
      row.bills as { bill_number?: string } | { bill_number?: string }[] | null,
    ),
    amount: Number(row.amount ?? 0),
    receipt_date: row.receipt_date,
    payment_mode: row.payment_mode ?? "",
    payment_reference: row.payment_reference,
  }));
}

export async function getReceiptsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<ReceiptListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("receipts")
    .select(
      "id, project_id, bill_id, amount, receipt_date, payment_mode, payment_reference, bills(bill_number), projects(name)",
      { count: "exact" },
    )
    .order("receipt_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      bill_number: getRelationBillNumber(
        row.bills as { bill_number?: string } | { bill_number?: string }[] | null,
      ),
      amount: Number(row.amount ?? 0),
      receipt_date: row.receipt_date,
      payment_mode: row.payment_mode ?? "",
      payment_reference: row.payment_reference,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createReceipt(payload: ReceiptInsert) {
  const supabase = createServerSupabaseClient();
  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "receivable",
    category: "receivable_payment",
    amount: payload.amount,
    date: payload.receipt_date,
    reference_id: payload.id,
    linked_id: payload.bill_id,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      bill_id: payload.bill_id,
      receipt_date: payload.receipt_date,
      amount: payload.amount,
      payment_mode: payload.payment_mode,
      payment_reference: payload.payment_reference,
      notes: payload.payment_reference,
      transaction_id: transactionResult.data.id,
    })
    .select("id")
    .single();

  if (error) {
    await deleteTransaction(transactionResult.data.id);
    throw new Error(error.message);
  }

  return data;
}

export async function getProjectReceivableSummaries(): Promise<ProjectReceivableSummary[]> {
  const [projects, bills, receipts] = await Promise.all([
    getProjectBaseRows(),
    getBills(),
    getReceipts(),
  ]);

  return projects.map((project) => {
    const projectBills = bills.filter((bill) => bill.project_id === project.id);
    const projectReceipts = receipts.filter((receipt) => receipt.project_id === project.id);
    const totalBilled = projectBills.reduce((sum, bill) => sum + bill.net_payable, 0);
    const totalReceived = projectReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);

    return {
      project_id: project.id,
      project_name: project.name,
      agency_name: project.agency_name,
      advertised_cost: project.advertised_cost,
      awarded_amount: project.awarded_amount,
      billCount: projectBills.length,
      totalBilled: Number(totalBilled.toFixed(2)),
      totalReceived: Number(totalReceived.toFixed(2)),
      outstanding: Number((totalBilled - totalReceived).toFixed(2)),
    };
  });
}

async function getProjectBaseRows(): Promise<ProjectListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, code, agency_name, advertised_cost, awarded_amount, start_date, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
