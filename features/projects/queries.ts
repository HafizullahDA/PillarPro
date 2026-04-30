import type { ProjectInsert, ProjectListItem } from "@/features/projects/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getProjects(): Promise<ProjectListItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, code, agency_name, advertised_cost, awarded_amount, start_date, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createProject(payload: ProjectInsert) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id, name, code, agency_name, advertised_cost, awarded_amount, start_date, status, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
