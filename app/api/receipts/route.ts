import { createReceipt, getReceiptsPage } from "@/features/receivables/queries";
import {
  parseReceiptPayload,
  ReceivableValidationError,
} from "@/features/receivables/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const receipts = await getReceiptsPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
    return jsonData(receipts);
  } catch (error) {
    return jsonError(error, "Failed to fetch payments.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseReceiptPayload(body);
    const receipt = await createReceipt(payload);
    return jsonData(receipt, 201);
  } catch (error) {
    if (error instanceof ReceivableValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create payment.");
  }
}
