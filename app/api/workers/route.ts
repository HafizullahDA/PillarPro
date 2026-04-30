import { createWorker, getWorkers } from "@/features/attendance/queries";
import {
  parseWorkerPayload,
  WorkerAttendanceValidationError,
} from "@/features/attendance/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const workers = await getWorkers();
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
