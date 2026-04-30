import {
  createVendorPayment,
  getVendorPaymentsPage,
} from "@/features/vendors/queries";
import {
  parseVendorPaymentPayload,
  VendorValidationError,
} from "@/features/vendors/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const payments = await getVendorPaymentsPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
    return jsonData(payments);
  } catch (error) {
    return jsonError(error, "Failed to fetch payments.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseVendorPaymentPayload(body);
    const payment = await createVendorPayment(payload);
    return jsonData(payment, 201);
  } catch (error) {
    if (error instanceof VendorValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create payment.");
  }
}
