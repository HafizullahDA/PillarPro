import { NextResponse } from "next/server";
import {
  AuthValidationError,
  parseSignUpPayload,
} from "@/features/auth/validators";
import { createRedirectUrl } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseSignUpPayload(body);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
        },
        emailRedirectTo: createRedirectUrl("/auth/callback"),
      },
    });

    if (error) {
      return jsonError(error, "Failed to create account.", 400);
    }

    return jsonData(
      {
        userId: data.user?.id ?? null,
        emailConfirmationRequired: true,
      },
      201,
    );
  } catch (error) {
    if (error instanceof AuthValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }

    return jsonError(error, "Failed to create account.");
  }
}
