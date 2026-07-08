import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { getSessionUserFromToken } from "@/lib/auth/server";
import { resolvePermissions } from "@/lib/auth/permissions";
import { PREVIEW_USER_COOKIE, SESSION_COOKIE } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

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

  const formData = await request.formData();
  const nextUserId = String(formData.get("previewUserId") ?? "").trim();
  const redirectUrl = getSafeReturnUrl(request);
  const response = NextResponse.redirect(redirectUrl);

  if (!nextUserId || nextUserId === user.userId) {
    response.cookies.delete(PREVIEW_USER_COOKIE);
    return response;
  }

  const db = getDb();
  const [targetUser] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
      role: users.role,
      customGrants: users.customGrants,
      deniedPermissions: users.deniedPermissions,
    })
    .from(users)
    .where(eq(users.id, nextUserId))
    .limit(1);

  if (!targetUser?.isActive) {
    response.cookies.delete(PREVIEW_USER_COOKIE);
    return response;
  }

  const targetPermissions = resolvePermissions(
    targetUser.role,
    targetUser.customGrants,
    targetUser.deniedPermissions,
  );

  if (!targetPermissions.every((permission) => user.permissions.includes(permission))) {
    response.cookies.delete(PREVIEW_USER_COOKIE);
    return response;
  }

  response.cookies.set(PREVIEW_USER_COOKIE, targetUser.id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
