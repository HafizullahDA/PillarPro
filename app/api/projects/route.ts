import { createProject, getProjects } from "@/features/projects/queries";
import {
  parseProjectPayload,
  ProjectValidationError,
} from "@/features/projects/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const projects = await getProjects();
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
