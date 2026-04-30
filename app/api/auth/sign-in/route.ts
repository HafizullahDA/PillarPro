import { NextResponse } from "next/server";
import {
  applySessionCookies,
  clearSessionCookies,
} from "@/lib/auth/session";
import {
  AuthValidationError,
  parseSignInPayload,
} from "@/features/auth/validators";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { jsonData, jsonError } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseSignInPayload(body);
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error || !data.session) {
      return jsonError(
        error ?? new Error("Your account is not ready for sign in."),
        "Invalid email or password.",
        400,
      );
    }

    const response = NextResponse.json({
      data: {
        userId: data.user.id,
      },
    });

    applySessionCookies(response, data.session);
    return response;
  } catch (error) {
    if (error instanceof AuthValidationError) {
      return jsonError(error, "Please fix the highlighted fields.", 400, error.fieldErrors);
    }

    const response = jsonError(error, "Failed to sign in.");
    clearSessionCookies(response);
    return response;
  }
}
