import type { ProjectInsert, ProjectListItem } from "@/features/projects/types";
import { getCurrentUserId } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  buildPaginationMeta,
  normalizePagination,
  type PaginatedResult,
  type PaginationOptions,
} from "@/lib/utils/pagination";

export async function getProjects(): Promise<ProjectListItem[]> {
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
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
  const supabase = await createServerSupabaseClient();
  const ownerUserId = await getCurrentUserId();

  if (!ownerUserId) {
    throw new Error("You must be signed in to create a project.");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...payload,
      owner_user_id: ownerUserId,
    })
    .select("id, name, code, agency_name, advertised_cost, awarded_amount, start_date, status, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProject(projectId: string) {
  const supabase = await createServerSupabaseClient();
  const normalizedProjectId = projectId.trim();

  if (!normalizedProjectId) {
    throw new Error("Project is required.");
  }

  const { data, error } = await supabase.rpc("delete_project_cascade", {
    target_project_id: normalizedProjectId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { id: data };
}
