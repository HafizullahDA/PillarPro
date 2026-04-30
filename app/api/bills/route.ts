import { createBill, getBills } from "@/features/receivables/queries";
import {
  parseBillPayload,
  ReceivableValidationError,
} from "@/features/receivables/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const bills = await getBills();
    return jsonData(bills);
  } catch (error) {
    return jsonError(error, "Failed to fetch bills.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseBillPayload(body);
    const bill = await createBill(payload);
    return jsonData(bill, 201);
  } catch (error) {
    if (error instanceof ReceivableValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create bill.");
  }
}
