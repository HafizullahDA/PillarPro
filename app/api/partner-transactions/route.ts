import {
  createPartnerTransaction,
  getPartnerTransactions,
} from "@/features/partners/queries";
import {
  parsePartnerTransactionPayload,
  PartnerValidationError,
} from "@/features/partners/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const rows = await getPartnerTransactions();
    return jsonData(rows);
  } catch (error) {
    return jsonError(error, "Failed to fetch partner transactions.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parsePartnerTransactionPayload(body);
    const row = await createPartnerTransaction(payload);
    return jsonData(row, 201);
  } catch (error) {
    if (error instanceof PartnerValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create partner transaction.");
  }
}
