import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateTransactionInput = {
  project_id: string;
  transaction_date: string;
  transaction_type: string;
  direction: "inflow" | "outflow";
  amount: number;
  reference_table: string;
  reference_id: string;
  notes: string;
};

export async function createTransactionRecord(input: CreateTransactionInput) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("transactions")
    .insert(input)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
