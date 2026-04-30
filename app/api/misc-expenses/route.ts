import {
  createMiscExpense,
  getMiscExpenses,
} from "@/features/misc-expenses/queries";
import {
  MiscExpenseValidationError,
  parseMiscExpensePayload,
} from "@/features/misc-expenses/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const expenses = await getMiscExpenses();
    return jsonData(expenses);
  } catch (error) {
    return jsonError(error, "Failed to fetch miscellaneous records.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseMiscExpensePayload(body);
    const row = await createMiscExpense(payload);
    return jsonData(row, 201);
  } catch (error) {
    if (error instanceof MiscExpenseValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to save miscellaneous record.");
  }
}
