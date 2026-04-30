import type {
  PartnerBalanceRow,
  PartnerInsert,
  PartnerListItem,
  PartnerTransactionInsert,
  PartnerTransactionRow,
} from "@/features/partners/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/utils/supabase-relations";
import { createTransactionRecord } from "@/services/transactions/create-transaction";

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

export async function createPartnerTransaction(payload: PartnerTransactionInsert) {
  const supabase = createServerSupabaseClient();
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .select("name")
    .eq("id", payload.partner_id)
    .single();

  if (partnerError) throw new Error(partnerError.message);

  const direction = payload.entry_type === "paid_by_partner" ? "inflow" : "outflow";
  const transaction = await createTransactionRecord({
    project_id: payload.project_id,
    transaction_date: payload.transaction_date,
    transaction_type: "partner",
    direction,
    amount: payload.amount,
    reference_table: "partner_transactions",
    reference_id: payload.id,
    notes: `Partner transaction for ${partner.name}`,
  });

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
      transaction_id: transaction.id,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.from("transactions").delete().eq("id", transaction.id);
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
