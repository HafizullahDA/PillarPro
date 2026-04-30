import {
  createAttendanceRecord,
  getAttendanceRecordsPage,
} from "@/features/attendance/queries";
import {
  parseAttendancePayload,
  WorkerAttendanceValidationError,
} from "@/features/attendance/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const rows = await getAttendanceRecordsPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
    return jsonData(rows);
  } catch (error) {
    return jsonError(error, "Failed to fetch attendance.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseAttendancePayload(body);
    const row = await createAttendanceRecord(payload);
    return jsonData(row, 201);
  } catch (error) {
    if (error instanceof WorkerAttendanceValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to save attendance.");
  }
}
