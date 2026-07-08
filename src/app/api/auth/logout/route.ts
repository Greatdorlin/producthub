import { type NextRequest, NextResponse } from "next/server";

import { clearPendingMfaCookie, clearSessionCookie, PREVIEW_USER_COOKIE } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  await clearSessionCookie();
  await clearPendingMfaCookie();

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(PREVIEW_USER_COOKIE);
  return response;
}
