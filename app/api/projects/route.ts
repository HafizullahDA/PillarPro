import { createProject, getProjectsPage } from "@/features/projects/queries";
import {
  parseProjectPayload,
  ProjectValidationError,
} from "@/features/projects/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const projects = await getProjectsPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
    return jsonData(projects);
  } catch (error) {
    return jsonError(error, "Failed to fetch projects.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseProjectPayload(body);
    const project = await createProject(payload);

    return jsonData(project, 201);
  } catch (error) {
    if (error instanceof ProjectValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }

    return jsonError(error, "Failed to create project.");
  }
}
