import { createVendor, getVendorsPage } from "@/features/vendors/queries";
import {
  parseVendorPayload,
  VendorValidationError,
} from "@/features/vendors/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";
import { parsePaginationParams } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  try {
    const vendors = await getVendorsPage(
      parsePaginationParams(new URL(request.url).searchParams),
    );
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
