import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_ACCESS_COOKIE,
  AUTH_REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return data.user ?? null;
}

export function applySessionCookies(response: NextResponse, session: Session) {
  response.cookies.set(AUTH_ACCESS_COOKIE, session.access_token, buildCookieOptions());
  response.cookies.set(AUTH_REFRESH_COOKIE, session.refresh_token, buildCookieOptions());
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.set(AUTH_ACCESS_COOKIE, "", buildExpiredCookieOptions());
  response.cookies.set(AUTH_REFRESH_COOKIE, "", buildExpiredCookieOptions());
}

export function createRedirectUrl(pathname: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return new URL(pathname, siteUrl).toString();
}

async function getAccessToken() {
  return (await cookies()).get(AUTH_ACCESS_COOKIE)?.value ?? null;
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function buildExpiredCookieOptions() {
  return {
    ...buildCookieOptions(),
    maxAge: 0,
  };
}
