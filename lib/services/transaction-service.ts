import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  isPartnerTransactionCategory,
  isVendorTransactionCategory,
  isWorkerTransactionCategory,
} from "@/lib/services/transaction-rules";
import {
  dataResult,
  errorResult,
  type ApiResult,
} from "@/lib/utils/api-response";
import { getRelationName } from "@/lib/utils/supabase-relations";

export type TransactionInput = {
  project_id: string;
  type: "expense" | "payment" | "receivable" | "partner";
  category: string;
  amount: number;
  date: string;
  reference_id?: string;
  linked_id?: string;
  vendor_id?: string;
  worker_id?: string;
  partner_id?: string;
};

export type TransactionRow = {
  id: string;
  project_id: string;
  transaction_type: string;
  direction: "inflow" | "outflow";
  amount: number;
  reference_table: string;
  reference_id: string;
  category: string;
  linked_id: string | null;
  vendor_id: string | null;
  worker_id: string | null;
  partner_id: string | null;
  transaction_date: string;
  project_name: string;
};

export async function createTransaction(
  input: TransactionInput,
): Promise<ApiResult<{ id: string }>> {
  const fieldErrors: Record<string, string> = {};
  const category = input.category.trim();
  const vendorId = input.vendor_id?.trim() || "";
  const workerId = input.worker_id?.trim() || "";
  const partnerId = input.partner_id?.trim() || "";

  if (!input.project_id.trim()) fieldErrors.project_id = "Project is required.";
  if (!category) fieldErrors.category = "Category is required.";
  if (!input.date.trim()) fieldErrors.date = "Date is required.";
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    fieldErrors.amount = "Amount must be greater than zero.";
  }
  if (isVendorTransactionCategory(category) && !vendorId) {
    fieldErrors.vendor_id = "Vendor is required for vendor ledger entries.";
  }
  if (isWorkerTransactionCategory(category) && !workerId) {
    fieldErrors.worker_id = "Worker is required for salary ledger entries.";
  }
  if (isPartnerTransactionCategory(category) && !partnerId) {
    fieldErrors.partner_id = "Partner is required for partner ledger entries.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return errorResult(
      new Error("Please fix the highlighted transaction fields."),
      "Please fix the highlighted transaction fields.",
      fieldErrors,
    );
  }

  const supabase = createServerSupabaseClient();
  const linkedId =
    input.linked_id?.trim() || vendorId || workerId || partnerId || undefined;
  const referenceId =
    input.reference_id?.trim() || linkedId || crypto.randomUUID();

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      project_id: input.project_id,
      transaction_date: input.date,
      transaction_type: input.type,
      direction: inferDirection(input.type, input.category),
      amount: input.amount,
      reference_table: buildReferenceTable(input.category, input.type),
      reference_id: referenceId,
      vendor_id: vendorId || null,
      worker_id: workerId || null,
      partner_id: partnerId || null,
      notes: buildNotes(input.category, linkedId),
    })
    .select("id")
    .single();

  if (error) {
    return errorResult(error, "Failed to create transaction.");
  }

  return dataResult(data);
}

export async function deleteTransaction(transactionId: string) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("transactions").delete().eq("id", transactionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTransactions(): Promise<TransactionRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, project_id, transaction_type, direction, amount, reference_table, reference_id, vendor_id, worker_id, partner_id, transaction_date, notes, projects(name)",
    )
    .order("transaction_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    transaction_type: row.transaction_type,
    direction: row.direction,
    amount: Number(row.amount ?? 0),
    reference_table: row.reference_table,
    reference_id: row.reference_id,
    category: extractCategory(row.notes),
    linked_id: extractLinkedId(row.notes),
    vendor_id: row.vendor_id,
    worker_id: row.worker_id,
    partner_id: row.partner_id,
    transaction_date: row.transaction_date,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
  }));
}

function inferDirection(type: TransactionInput["type"], category: string) {
  if (type === "receivable") {
    return "inflow" as const;
  }

  if (type === "partner") {
    return category.includes("received") ? ("outflow" as const) : ("inflow" as const);
  }

  return "outflow" as const;
}

function buildReferenceTable(category: string, type: TransactionInput["type"]) {
  const normalizedCategory = category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalizedCategory || type;
}

function buildNotes(category: string, linkedId?: string) {
  if (!linkedId?.trim()) {
    return category.trim();
  }

  return `${category.trim()} | linked:${linkedId.trim()}`;
}

function extractCategory(notes: string | null) {
  if (!notes) {
    return "Uncategorized";
  }

  return notes.split(" | linked:")[0] ?? "Uncategorized";
}

function extractLinkedId(notes: string | null) {
  if (!notes || !notes.includes(" | linked:")) {
    return null;
  }

  return notes.split(" | linked:")[1] ?? null;
}
