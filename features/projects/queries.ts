import type { ProjectInsert, ProjectListItem } from "@/features/projects/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type PaginationOptions,
} from "@/lib/utils/pagination";

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

export async function getProjectsPage(
  options?: PaginationOptions,
): Promise<PaginatedResult<ProjectListItem>> {
  const supabase = createServerSupabaseClient();
  const { page, pageSize, from, to } = normalizePagination(options);
  const { data, error, count } = await supabase
    .from("projects")
    .select(
      "id, name, code, agency_name, advertised_cost, awarded_amount, start_date, status, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: data ?? [],
    pagination: buildPaginationMeta(count ?? 0, page, pageSize),
  };
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
