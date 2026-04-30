import type {
  MiscExpenseInsert,
  MiscExpenseListItem,
} from "@/features/misc-expenses/types";
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

export async function getMiscExpenses(): Promise<MiscExpenseListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("misc_expenses")
    .select("id, project_id, category, amount, expense_date, description, notes, projects(name)")
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    project_name: getRelationName(
      row.projects as { name?: string } | { name?: string }[] | null,
    ),
    category: row.category,
    amount: Number(row.amount ?? 0),
    expense_date: row.expense_date,
    description: row.description ?? row.notes ?? "",
  }));
}

export async function getMiscExpensesPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<MiscExpenseListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("misc_expenses")
    .select(
      "id, project_id, category, amount, expense_date, description, notes, projects(name)",
      { count: "exact" },
    )
    .order("expense_date", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  return {
    rows: (data ?? []).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      project_name: getRelationName(
        row.projects as { name?: string } | { name?: string }[] | null,
      ),
      category: row.category,
      amount: Number(row.amount ?? 0),
      expense_date: row.expense_date,
      description: row.description ?? row.notes ?? "",
    })),
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
}

export async function createMiscExpense(payload: MiscExpenseInsert) {
  const supabase = createServerSupabaseClient();
  const transactionResult = await createTransaction({
    project_id: payload.project_id,
    type: "expense",
    category: payload.category,
    amount: payload.amount,
    date: payload.expense_date,
    reference_id: payload.id,
  });

  if (!transactionResult.success) {
    throw new Error(transactionResult.error);
  }

  const { data, error } = await supabase
    .from("misc_expenses")
    .insert({
      id: payload.id,
      project_id: payload.project_id,
      category: payload.category,
      amount: payload.amount,
      expense_date: payload.expense_date,
      description: payload.description,
      notes: payload.description,
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
