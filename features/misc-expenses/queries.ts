import type {
  MiscExpenseInsert,
  MiscExpenseListItem,
} from "@/features/misc-expenses/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/utils/supabase-relations";
import { createTransactionRecord } from "@/services/transactions/create-transaction";

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

export async function createMiscExpense(payload: MiscExpenseInsert) {
  const supabase = createServerSupabaseClient();
  const transaction = await createTransactionRecord({
    project_id: payload.project_id,
    transaction_date: payload.expense_date,
    transaction_type: "expense",
    direction: "outflow",
    amount: payload.amount,
    reference_table: "misc_expenses",
    reference_id: payload.id,
    notes: `Misc expense: ${payload.category}`,
  });

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
