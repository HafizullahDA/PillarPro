import { createVendor, getVendors } from "@/features/vendors/queries";
import {
  parseVendorPayload,
  VendorValidationError,
} from "@/features/vendors/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const vendors = await getVendors();
    return jsonData(vendors);
  } catch (error) {
    return jsonError(error, "Failed to fetch vendors.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseVendorPayload(body);
    const vendor = await createVendor(payload);
    return jsonData(vendor, 201);
  } catch (error) {
    if (error instanceof VendorValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create vendor.");
  }
}
