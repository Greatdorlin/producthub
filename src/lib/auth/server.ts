import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { Permission, ProductRole } from "@/lib/constants";
import { hasPermission, resolvePermissions } from "@/lib/auth/permissions";
import { PREVIEW_USER_COOKIE, SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import type { AuthAdapter, AuthUser } from "@/lib/auth/types";

export type AuthenticatedUser = AuthUser & SessionPayload & {
  actualUserId: string;
  actualName: string;
  actualEmail: string;
  actualAvatarUrl?: string | null;
  actualRole: ProductRole;
  actualPermissions: Permission[];
  isPreviewing: boolean;
};

async function getActiveUserById(userId: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isActive, true)))
    .limit(1);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    permissions: resolvePermissions(user.role, user.customGrants, user.deniedPermissions),
  } satisfies AuthUser & SessionPayload;
}

export async function getSessionUserFromToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);

  if (!payload) {
    return null;
  }

  return getActiveUserById(payload.userId);
}

export async function getActualSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return getSessionUserFromToken(token);
}

export async function getSessionUser() {
  const [store, actualUser] = await Promise.all([cookies(), getActualSessionUser()]);

  if (!actualUser) {
    return null;
  }

  const canPreviewUsers =
    actualUser.permissions.includes("people:view") || actualUser.permissions.includes("people:manage");
  const previewUserId = store.get(PREVIEW_USER_COOKIE)?.value;

  if (!canPreviewUsers || !previewUserId || previewUserId === actualUser.userId) {
    return {
      ...actualUser,
      actualUserId: actualUser.userId,
      actualName: actualUser.name,
      actualEmail: actualUser.email,
      actualAvatarUrl: actualUser.avatarUrl,
      actualRole: actualUser.role,
      actualPermissions: actualUser.permissions,
      isPreviewing: false,
    } satisfies AuthenticatedUser;
  }

  const previewUser = await getActiveUserById(previewUserId);

  if (!previewUser) {
    return {
      ...actualUser,
      actualUserId: actualUser.userId,
      actualName: actualUser.name,
      actualEmail: actualUser.email,
      actualAvatarUrl: actualUser.avatarUrl,
      actualRole: actualUser.role,
      actualPermissions: actualUser.permissions,
      isPreviewing: false,
    } satisfies AuthenticatedUser;
  }

  return {
    ...previewUser,
    actualUserId: actualUser.userId,
    actualName: actualUser.name,
    actualEmail: actualUser.email,
    actualAvatarUrl: actualUser.avatarUrl,
    actualRole: actualUser.role,
    actualPermissions: actualUser.permissions,
    isPreviewing: true,
  } satisfies AuthenticatedUser;
}

export async function requireActualSession() {
  const user = await getActualSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireSession() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireSession();

  if (!hasPermission(user.permissions, permission)) {
    redirect("/dashboard?denied=1");
  }

  return user;
}

export async function requireActualPermission(permission: Permission) {
  const user = await requireActualSession();

  if (!hasPermission(user.permissions, permission)) {
    redirect("/dashboard?denied=1");
  }

  return user;
}

export const authAdapter: AuthAdapter = {
  getSession: getSessionUser,
  requireSession,
  requirePermission,
};

export { authAdapter as auth };

export {
  clearPendingMfaCookie,
  clearSessionCookie,
  createPendingMfaCookie,
  createSessionCookie,
  MFA_RECOVERY_CODES_COOKIE,
  PENDING_MFA_COOKIE,
  PREVIEW_USER_COOKIE,
  SESSION_COOKIE,
  verifyPendingMfaToken,
} from "@/lib/auth/session";

export {
  buildTotpOtpAuthUrl,
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  normalizeRecoveryCode,
  verifyTotpToken,
} from "@/lib/auth/mfa";
