import { NextResponse } from "next/server";
import { applySessionCookies } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?message=Verification link is invalid.", url));
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(
      new URL("/sign-in?message=Email verification failed. Please try again.", url),
    );
  }

  const response = NextResponse.redirect(new URL("/dashboard", url));
  applySessionCookies(response, data.session);
  return response;
}
