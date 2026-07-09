import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSessionToken, verifySessionToken } from "@/lib/auth/session";

const protectedPaths = ["/dashboard", "/products", "/library", "/settings", "/people", "/activity"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = Boolean(sessionToken);
  const needsAuth = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (needsAuth && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  if (needsAuth && sessionToken) {
    const payload = await verifySessionToken(sessionToken);

    if (payload) {
      response.cookies.set(SESSION_COOKIE, await signSessionToken({
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        avatarUrl: payload.avatarUrl,
        role: payload.role,
        permissions: payload.permissions,
      }), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }
  }

  return response;
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
