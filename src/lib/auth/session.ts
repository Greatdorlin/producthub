import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import type { Permission, ProductRole } from "@/lib/constants";

export const SESSION_COOKIE = "flyconnect_product_hub_session";
export const PREVIEW_USER_COOKIE = "flyconnect_product_hub_preview_user";
export const PENDING_MFA_COOKIE = "flyconnect_product_hub_pending_mfa";
export const MFA_RECOVERY_CODES_COOKIE = "flyconnect_product_hub_recovery_codes";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: ProductRole;
  permissions: Permission[];
};

export type PendingMfaPayload = {
  userId: string;
  nextPath: string;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function signPendingMfaToken(payload: PendingMfaPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const result = await jwtVerify(token, getSessionSecret());
    return result.payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifyPendingMfaToken(token: string) {
  try {
    const result = await jwtVerify(token, getSessionSecret());
    return result.payload as PendingMfaPayload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await signSessionToken(payload);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function createPendingMfaCookie(payload: PendingMfaPayload) {
  const token = await signPendingMfaToken(payload);
  const store = await cookies();

  store.set(PENDING_MFA_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function clearPendingMfaCookie() {
  const store = await cookies();
  store.delete(PENDING_MFA_COOKIE);
}
