import {
  createWorker,
  deactivateWorker,
  getWorkersPage,
} from "@/features/attendance/queries";
import {
  parseWorkerPayload,
  WorkerAttendanceValidationError,
} from "@/features/attendance/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const workers = await getWorkersPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
    return jsonData(workers);
  } catch (error) {
    return jsonError(error, "Failed to fetch workers.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseWorkerPayload(body);
    const worker = await createWorker(payload);
    return jsonData(worker, 201);
  } catch (error) {
    if (error instanceof WorkerAttendanceValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create worker.");
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get("id") ?? "";
    const worker = await deactivateWorker(workerId);
    return jsonData(worker);
  } catch (error) {
    return jsonError(error, "Failed to remove worker.", 400);
  }
}
