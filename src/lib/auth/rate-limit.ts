import { eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { authRateLimits } from "@/lib/db/schema";

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_MINUTES = 15;
const BLOCK_WINDOW_MS = BLOCK_WINDOW_MINUTES * 60 * 1000;

function buildRateLimitKey(prefix: "email" | "ip", value: string) {
  return `${prefix}:${value}`;
}

function buildScopedRateLimitKey(scope: string, value: string) {
  return `${scope}:${value}`;
}

export function getRateLimitIdentity(input: { email: string; ipAddress: string }) {
  return {
    emailKey: buildRateLimitKey("email", input.email),
    ipKey: buildRateLimitKey("ip", input.ipAddress || "unknown"),
  };
}

export async function getLoginRateLimitStatus(keys: string[]) {
  const db = getDb();
  const now = new Date();
  const rows = await db
    .select()
    .from(authRateLimits)
    .where(inArray(authRateLimits.key, keys));

  const activeBlock = rows.find((row) => row.blockedUntil && row.blockedUntil > now);

  return {
    blocked: Boolean(activeBlock),
    blockedUntil: activeBlock?.blockedUntil ?? null,
  };
}

export async function registerFailedLogin(keys: string[]) {
  const db = getDb();
  const now = new Date();
  const blockUntil = new Date(now.getTime() + BLOCK_WINDOW_MS);

  for (const key of keys) {
    const [existing] = await db
      .select()
      .from(authRateLimits)
      .where(eq(authRateLimits.key, key))
      .limit(1);

    const lastAttemptAt = existing?.lastAttemptAt ? new Date(existing.lastAttemptAt) : null;
    const windowExpired =
      !existing ||
      !lastAttemptAt ||
      now.getTime() - lastAttemptAt.getTime() >= BLOCK_WINDOW_MS ||
      Boolean(existing.blockedUntil && existing.blockedUntil <= now);

    const nextAttemptCount = windowExpired ? 1 : (existing.attemptCount ?? 0) + 1;
    const nextBlockedUntil = nextAttemptCount >= MAX_LOGIN_ATTEMPTS ? blockUntil : null;

    if (existing) {
      await db
        .update(authRateLimits)
        .set({
          attemptCount: nextAttemptCount,
          blockedUntil: nextBlockedUntil,
          lastAttemptAt: now,
          updatedAt: now,
        })
        .where(eq(authRateLimits.key, key));
    } else {
      await db.insert(authRateLimits).values({
        key,
        attemptCount: 1,
        blockedUntil: null,
        lastAttemptAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function clearLoginRateLimit(keys: string[]) {
  const db = getDb();

  await db
    .delete(authRateLimits)
    .where(inArray(authRateLimits.key, keys));
}

export function getMfaRateLimitKeys(input: { userId: string; ipAddress: string }) {
  return [
    buildScopedRateLimitKey("mfa-user", input.userId),
    buildScopedRateLimitKey("mfa-ip", input.ipAddress || "unknown"),
  ];
}

export const getMfaRateLimitStatus = getLoginRateLimitStatus;
export const registerFailedMfaAttempt = registerFailedLogin;
export const clearMfaRateLimit = clearLoginRateLimit;

export function getClientIpAddress(headerMap: Headers) {
  const forwarded = headerMap.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerMap.get("x-real-ip")?.trim();
  const candidate = forwarded || realIp || "unknown";

  return candidate.slice(0, 120);
}

export function getLoginRateLimitMessage() {
  return `Too many sign-in attempts. Wait ${BLOCK_WINDOW_MINUTES} minutes and try again.`;
}
