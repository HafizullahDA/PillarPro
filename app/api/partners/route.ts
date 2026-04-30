import { createPartner, getPartners } from "@/features/partners/queries";
import {
  parsePartnerPayload,
  PartnerValidationError,
} from "@/features/partners/validators";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function GET() {
  try {
    const partners = await getPartners();
    return jsonData(partners);
  } catch (error) {
    return jsonError(error, "Failed to fetch partners.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parsePartnerPayload(body);
    const partner = await createPartner(payload);
    return jsonData(partner, 201);
  } catch (error) {
    if (error instanceof PartnerValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }
    return jsonError(error, "Failed to create partner.");
  }
}
