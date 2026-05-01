import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_ACCESS_COOKIE } from "@/lib/auth/constants";

const publicRoutes = new Set(["/", "/sign-in", "/sign-up"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_ACCESS_COOKIE)?.value);
  const isPublicRoute = publicRoutes.has(pathname);
  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isSupabaseCallback = pathname.startsWith("/auth/callback");
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".");

  if (isAuthApiRoute || isSupabaseCallback || isStaticAsset) {
    return NextResponse.next();
  }

  if (!hasSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
