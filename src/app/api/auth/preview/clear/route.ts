import { type NextRequest, NextResponse } from "next/server";

import { getSessionUserFromToken } from "@/lib/auth/server";
import { PREVIEW_USER_COOKIE, SESSION_COOKIE } from "@/lib/auth/server";

function getSafeReturnUrl(request: NextRequest) {
  const referer = request.headers.get("referer");

  if (!referer) {
    return new URL("/dashboard", request.url);
  }

  try {
    const refererUrl = new URL(referer);
    return new URL(`${refererUrl.pathname}${refererUrl.search}`, request.url);
  } catch {
    return new URL("/dashboard", request.url);
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUserFromToken(token);

  if (!user || (!user.permissions.includes("people:view") && !user.permissions.includes("people:manage"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.redirect(getSafeReturnUrl(request));
  response.cookies.delete(PREVIEW_USER_COOKIE);
  return response;
}
