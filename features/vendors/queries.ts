import type {
  VendorInsert,
  VendorListItem,
  VendorPaymentInsert,
  VendorPaymentListItem,
  VendorPurchaseInsert,
  VendorPurchaseListItem,
} from "@/features/vendors/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createTransaction,
  deleteTransaction,
} from "@/lib/services/transaction-service";
import { getRelationName } from "@/lib/utils/supabase-relations";
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type PaginationOptions,
} from "@/lib/utils/pagination";

export async function getVendors(): Promise<VendorListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("id, project_id, name, contact_person, phone, created_at, projects(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    name: row.name,
    contact_person: row.contact_person,
    phone: row.phone,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    created_at: row.created_at,
  }));
}

export async function getVendorsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<VendorListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("vendors")
    .select("id, project_id, name, contact_person, phone, created_at, projects(name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      name: row.name,
      contact_person: row.contact_person,
      phone: row.phone,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      created_at: row.created_at,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createVendor(payload: VendorInsert) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert(payload)
    .select("id, project_id, name, contact_person, phone, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getVendorPurchases(): Promise<VendorPurchaseListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vendor_purchases")
    .select("id, project_id, material, quantity, rate, amount, purchase_date, vendors(name), projects(name)")
    .order("purchase_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    vendor_name: getRelationName(
      row.vendors as { name?: string } | { name?: string }[] | null,
    ),
    material: row.material ?? "",
    quantity: Number(row.quantity ?? 0),
    rate: Number(row.rate ?? 0),
    amount: Number(row.amount ?? 0),
    purchase_date: row.purchase_date,
  }));
}

export async function getVendorPurchasesPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<VendorPurchaseListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("vendor_purchases")
    .select(
      "id, project_id, material, quantity, rate, amount, purchase_date, vendors(name), projects(name)",
      { count: "exact" },
    )
    .order("purchase_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      vendor_name: getRelationName(
        row.vendors as { name?: string } | { name?: string }[] | null,
      ),
      material: row.material ?? "",
      quantity: Number(row.quantity ?? 0),
      rate: Number(row.rate ?? 0),
      amount: Number(row.amount ?? 0),
      purchase_date: row.purchase_date,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createVendorPurchase(payload: VendorPurchaseInsert) {
  const supabase = createServerSupabaseClient();

  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "expense",
    category: "vendor_purchase",
    amount: payload.amount,
    date: payload.purchase_date,
    reference_id: payload.id,
    linked_id: payload.vendor_id,
    vendor_id: payload.vendor_id,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("vendor_purchases")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      vendor_id: payload.vendor_id,
      material: payload.material,
      quantity: payload.quantity,
      rate: payload.rate,
      amount: payload.amount,
      purchase_date: payload.purchase_date,
      description: payload.material,
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

export async function getVendorPayments(): Promise<VendorPaymentListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vendor_payments")
    .select("id, project_id, amount, payment_mode, payment_reference, payment_date, vendors(name), projects(name)")
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    vendor_name: getRelationName(
      row.vendors as { name?: string } | { name?: string }[] | null,
    ),
    amount: Number(row.amount ?? 0),
    payment_mode: row.payment_mode ?? "",
    payment_reference: row.payment_reference,
    payment_date: row.payment_date,
  }));
}

export async function getVendorPaymentsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<VendorPaymentListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("vendor_payments")
    .select(
      "id, project_id, amount, payment_mode, payment_reference, payment_date, vendors(name), projects(name)",
      { count: "exact" },
    )
    .order("payment_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      vendor_name: getRelationName(
        row.vendors as { name?: string } | { name?: string }[] | null,
      ),
      amount: Number(row.amount ?? 0),
      payment_mode: row.payment_mode ?? "",
      payment_reference: row.payment_reference,
      payment_date: row.payment_date,
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createVendorPayment(payload: VendorPaymentInsert) {
  const supabase = createServerSupabaseClient();

  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "payment",
    category: "vendor_payment",
    amount: payload.amount,
    date: payload.payment_date,
    reference_id: payload.id,
    linked_id: payload.vendor_id,
    vendor_id: payload.vendor_id,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("vendor_payments")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      vendor_id: payload.vendor_id,
      amount: payload.amount,
      payment_mode: payload.payment_mode,
      payment_reference: payload.payment_reference,
      payment_date: payload.payment_date,
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
