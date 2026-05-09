import { getCurrentUserId } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("You must be signed in to save this record.");
  }

  return userId;
}

export async function ensureProjectAccess(projectId: string) {
  const normalizedProjectId = projectId.trim();

  if (!normalizedProjectId) {
    throw new Error("Project is required.");
  }

  await requireCurrentUserId();

  const supabase = await createServerSupabaseClient();
  const { data: claimedProjectId, error: claimError } = await supabase.rpc(
    "claim_project_if_unowned",
    { target_project_id: normalizedProjectId },
  );

  if (claimError) {
    throw new Error(claimError.message);
  }

  if (claimedProjectId) {
    return;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", normalizedProjectId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Project not found or you do not have access to it.");
  }
}
