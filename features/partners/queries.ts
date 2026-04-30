import type {
  PartnerBalanceRow,
  PartnerInsert,
  PartnerListItem,
  PartnerTransactionInsert,
  PartnerTransactionRow,
} from "@/features/partners/types";
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
import { getRelationName } from "@/lib/utils/supabase-relations";

export async function getPartners(): Promise<PartnerListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, project_id, name, created_at, projects(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    name: row.name,
    created_at: row.created_at,
  }));
}

export async function getPartnersPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<PartnerListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("partners")
    .select("id, project_id, name, created_at, projects(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      name: row.name,
      created_at: row.created_at,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createPartner(payload: PartnerInsert) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("partners")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getPartnerTransactions(): Promise<PartnerTransactionRow[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("partner_transactions")
    .select("id, partner_id, entry_type, payment_mode, amount, transaction_date, partners(name), projects(name)")
    .order("transaction_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    partner_id: row.partner_id ?? "",
    partner_name: getRelationName(
      row.partners as { name?: string } | { name?: string }[] | null,
    ),
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    entry_type: row.entry_type,
    payment_mode: row.payment_mode ?? "",
    amount: Number(row.amount ?? 0),
    transaction_date: row.transaction_date,
  }));
}

export async function getPartnerTransactionsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<PartnerTransactionRow>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("partner_transactions")
    .select(
      "id, partner_id, entry_type, payment_mode, amount, transaction_date, partners(name), projects(name)",
      { count: "exact" },
    )
    .order("transaction_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      partner_id: row.partner_id ?? "",
      partner_name: getRelationName(
        row.partners as { name?: string } | { name?: string }[] | null,
      ),
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      entry_type: row.entry_type,
      payment_mode: row.payment_mode ?? "",
      amount: Number(row.amount ?? 0),
      transaction_date: row.transaction_date,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createPartnerTransaction(payload: PartnerTransactionInsert) {
  const supabase = createServerSupabaseClient();
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("name")
    .eq("id", payload.partner_id)
    .single();

  if (partnerError) throw new Error(partnerError.message);

  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "partner",
    category: `partner_${payload.entry_type}`,
    amount: payload.amount,
    date: payload.transaction_date,
    reference_id: payload.id,
    linked_id: payload.partner_id,
    partner_id: payload.partner_id,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("partner_transactions")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      partner_id: payload.partner_id,
      partner_name: partner.name,
      transaction_date: payload.transaction_date,
      entry_type: payload.entry_type,
      amount: payload.amount,
      payment_mode: payload.payment_mode,
      notes: payload.payment_mode,
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

export async function getPartnerBalances(): Promise<PartnerBalanceRow[]> {
  const [partners, transactions] = await Promise.all([
    getPartners(),
    getPartnerTransactions(),
  ]);

  return partners.map((partner) => {
    const rows = transactions.filter((row) => row.partner_id === partner.id);
    const totalPaidByPartner = rows
      .filter((row) => row.entry_type === "paid_by_partner")
      .reduce((sum, row) => sum + row.amount, 0);
    const totalReceivedByPartner = rows
      .filter((row) => row.entry_type === "received_by_partner")
      .reduce((sum, row) => sum + row.amount, 0);

    return {
      partner_id: partner.id,
      partner_name: partner.name,
      project_name: partner.project_name,
      totalPaidByPartner: Number(totalPaidByPartner.toFixed(2)),
      totalReceivedByPartner: Number(totalReceivedByPartner.toFixed(2)),
      runningBalance: Number((totalPaidByPartner - totalReceivedByPartner).toFixed(2)),
    };
  });
}
