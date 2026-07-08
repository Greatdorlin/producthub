import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";

const protectedPaths = ["/dashboard", "/products", "/library", "/settings", "/people", "/activity"];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const needsAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (needsAuth && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings",
    "/dashboard/:path*",
    "/products/:path*",
    "/library/:path*",
    "/settings/:path*",
    "/people/:path*",
    "/activity/:path*",
  ],
};
