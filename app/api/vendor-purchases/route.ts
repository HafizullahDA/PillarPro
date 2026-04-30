import {
  createVendorPurchase,
  getVendorPurchases,
} from "@/features/vendors/queries";
import {
  parseVendorPurchasePayload,
  VendorValidationError,
} from "@/features/vendors/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const purchases = await getVendorPurchases();
    return jsonData(purchases);
  } catch (error) {
    return jsonError(error, "Failed to fetch purchases.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseVendorPurchasePayload(body);
    const purchase = await createVendorPurchase(payload);
    return jsonData(purchase, 201);
  } catch (error) {
    if (error instanceof VendorValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create purchase.");
  }
}
