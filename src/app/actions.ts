"use server";

import { del } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { recordAuditEvent } from "@/lib/audit";
import { resolvePermissions, splitPermissionOverrides } from "@/lib/auth/permissions";
import {
  clearLoginRateLimit,
  clearMfaRateLimit,
  getClientIpAddress,
  getLoginRateLimitStatus,
  getMfaRateLimitKeys,
  getMfaRateLimitStatus,
  getRateLimitIdentity,
  registerFailedLogin,
  registerFailedMfaAttempt,
} from "@/lib/auth/rate-limit";
import {
  clearPendingMfaCookie,
  clearSessionCookie,
  createPendingMfaCookie,
  createSessionCookie,
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  normalizeRecoveryCode,
  requireActualPermission,
  requireActualSession,
  requirePermission,
  MFA_RECOVERY_CODES_COOKIE,
  PENDING_MFA_COOKIE,
  PREVIEW_USER_COOKIE,
  verifyPendingMfaToken,
  verifyTotpToken,
} from "@/lib/auth/server";
import { getDefaultCurrency, getIndustryPreset } from "@/lib/config/industries";
import { isCurrencyCode } from "@/lib/currencies";
import { readProductCustomFieldValues } from "@/lib/custom-fields";
import {
  CATEGORY_OPTIONS,
  PERMISSIONS,
  PRODUCT_ACCESS_ROLES,
  PRODUCT_PRIORITY,
  PRODUCT_ROLES,
  PRODUCT_STATUS,
  ROUTE_OPTIONS,
  type Permission,
} from "@/lib/constants";
import { getDb } from "@/lib/db/client";
import { productAssets, products, users } from "@/lib/db/schema";
import { createWorkspaceBackupSnapshot } from "@/lib/backups";
import { getWorkspaceSettings } from "@/lib/data";
import { deriveAssetVisibilityFromRoles } from "@/lib/product-access";
import { createId, slugify } from "@/lib/utils";

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function validatePasswordStrength(password: string) {
  if (password.length < 12) {
    return false;
  }

  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

function getOptionalDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  return new Date(raw);
}

function getOptionalPrice(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const numeric = Number(raw);

  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.round(numeric * 100);
}

function getOptionalCount(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const numeric = Number(raw);

  if (!Number.isInteger(numeric) || numeric < 0) {
    return null;
  }

  return numeric;
}

function getFeeItems(formData: FormData) {
  const labels = formData.getAll("feeLabel").map((value) => String(value ?? "").trim());
  const amounts = formData.getAll("feeAmount").map((value) => String(value ?? "").trim());
  const items: Array<{ label: string; amountInCents: number }> = [];
  let hasInvalid = false;

  for (let index = 0; index < Math.max(labels.length, amounts.length); index += 1) {
    const label = labels[index] ?? "";
    const amountRaw = amounts[index] ?? "";

    if (!label && !amountRaw) {
      continue;
    }

    const amountInCents = getOptionalPrice(amountRaw);

    if (!label || amountInCents === null) {
      hasInvalid = true;
      continue;
    }

    items.push({ label, amountInCents });
  }

  return { items, hasInvalid };
}

function buildSalesPeriodSummary(start: Date | null, end: Date | null) {
  if (!start && !end) {
    return "";
  }

  const startLabel = start ? start.toISOString().slice(0, 10) : "";
  const endLabel = end ? end.toISOString().slice(0, 10) : "";

  if (startLabel && endLabel) {
    return `${startLabel} to ${endLabel}`;
  }

  return startLabel ? `From ${startLabel}` : `Until ${endLabel}`;
}

function getAllowedProductDefaults(
  industryTemplate: string,
  existing?: { category?: string; route?: string },
) {
  const preset = getIndustryPreset(industryTemplate);

  return {
    categories: new Set([
      existing?.category,
      ...CATEGORY_OPTIONS,
      ...preset.productDefaults.categories,
    ].filter(Boolean)),
    routes: new Set([
      existing?.route,
      ...ROUTE_OPTIONS,
      ...preset.productDefaults.routes,
    ].filter(Boolean)),
  };
}

const DUMMY_PASSWORD_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKxGhu6P6QxQ4WjQ4G4A1NVuMcZV8K4D4ew8K";

async function getSafeReturnPath() {
  const headerMap = await headers();
  const referer = headerMap.get("referer");

  if (!referer) {
    return "/dashboard";
  }

  try {
    const refererUrl = new URL(referer);
    return `${refererUrl.pathname}${refererUrl.search}`;
  } catch {
    return "/dashboard";
  }
}

function getSafeRedirectPath(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value ?? "").trim();
  return path.startsWith("/") ? path : fallback;
}

function addQueryParam(path: string, key: string, value: string) {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/dashboard");
  const headerMap = await headers();
  const ipAddress = getClientIpAddress(headerMap);
  const rateLimitKeys = Object.values(getRateLimitIdentity({ email, ipAddress }));

  const rateLimitStatus = await getLoginRateLimitStatus(rateLimitKeys);

  if (rateLimitStatus.blocked) {
    redirect("/login?error=rate-limit");
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.isActive, true)))
    .limit(1);

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    await registerFailedLogin(rateLimitKeys);
    redirect("/login?error=invalid");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    await registerFailedLogin(rateLimitKeys);
    redirect("/login?error=invalid");
  }

  await clearLoginRateLimit(rateLimitKeys);

  if (user.mfaEnabled && user.mfaSecretEncrypted) {
    await createPendingMfaCookie({
      userId: user.id,
      nextPath: nextPath.startsWith("/") ? nextPath : "/dashboard",
    });
    redirect("/login/mfa");
  }

  await createSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: resolvePermissions(user.role, user.customGrants, user.deniedPermissions),
  });

  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await recordAuditEvent({
    actorUserId: user.id,
    action: "login",
    entityType: "session",
    entityId: user.id,
    details: { nextPath },
  });

  redirect(nextPath.startsWith("/") ? nextPath : "/dashboard");
}

export async function verifyLoginMfaAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim();
  const recoveryCode = String(formData.get("recoveryCode") ?? "").trim();
  const store = await cookies();
  const pendingToken = store.get(PENDING_MFA_COOKIE)?.value;

  if (!pendingToken) {
    redirect("/login?error=invalid");
  }

  const pending = await verifyPendingMfaToken(pendingToken);

  if (!pending) {
    await clearPendingMfaCookie();
    redirect("/login?error=invalid");
  }

  const headerMap = await headers();
  const ipAddress = getClientIpAddress(headerMap);
  const mfaRateLimitKeys = getMfaRateLimitKeys({ userId: pending.userId, ipAddress });
  const rateLimitStatus = await getMfaRateLimitStatus(mfaRateLimitKeys);

  if (rateLimitStatus.blocked) {
    redirect("/login/mfa?error=rate-limit");
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, pending.userId), eq(users.isActive, true)))
    .limit(1);

  if (!user || !user.mfaEnabled || !user.mfaSecretEncrypted) {
    await clearPendingMfaCookie();
    redirect("/login?error=invalid");
  }

  let verified = false;
  let nextRecoveryHashes = user.mfaRecoveryCodesHash;
  let usedRecoveryCode = false;

  if (code) {
    verified = await verifyTotpToken(decryptMfaSecret(user.mfaSecretEncrypted), code);
  } else if (recoveryCode) {
    const normalizedRecoveryCode = normalizeRecoveryCode(recoveryCode);

    for (let index = 0; index < user.mfaRecoveryCodesHash.length; index += 1) {
      const matches = await bcrypt.compare(normalizedRecoveryCode, user.mfaRecoveryCodesHash[index]);

      if (matches) {
        verified = true;
        usedRecoveryCode = true;
        nextRecoveryHashes = user.mfaRecoveryCodesHash.filter((_, currentIndex) => currentIndex !== index);
        break;
      }
    }
  }

  if (!verified) {
    await registerFailedMfaAttempt(mfaRateLimitKeys);
    redirect("/login/mfa?error=invalid");
  }

  if (usedRecoveryCode) {
    await db
      .update(users)
      .set({
        mfaRecoveryCodesHash: nextRecoveryHashes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  await clearMfaRateLimit(mfaRateLimitKeys);
  await clearPendingMfaCookie();

  await createSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    permissions: resolvePermissions(user.role, user.customGrants, user.deniedPermissions),
  });

  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await recordAuditEvent({
    actorUserId: user.id,
    action: usedRecoveryCode ? "login.mfa.recovery" : "login.mfa",
    entityType: "session",
    entityId: user.id,
    details: { nextPath: pending.nextPath },
  });

  redirect(pending.nextPath.startsWith("/") ? pending.nextPath : "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  await clearPendingMfaCookie();
  const store = await cookies();
  store.delete(PREVIEW_USER_COOKIE);
  redirect("/login");
}

export async function setPreviewUserAction(formData: FormData) {
  const actor = await requireActualPermission("people:view");
  const nextUserId = String(formData.get("previewUserId") ?? "").trim();
  const db = getDb();
  const store = await cookies();

  if (!nextUserId || nextUserId === actor.userId) {
    store.delete(PREVIEW_USER_COOKIE);
    redirect(await getSafeReturnPath());
  }

  const [targetUser] = await db
    .select({ id: users.id, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, nextUserId))
    .limit(1);

  if (!targetUser?.isActive) {
    store.delete(PREVIEW_USER_COOKIE);
    redirect(await getSafeReturnPath());
  }

  store.set(PREVIEW_USER_COOKIE, targetUser.id, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect(await getSafeReturnPath());
}

export async function clearPreviewUserAction() {
  await requireActualPermission("people:view");
  const store = await cookies();
  store.delete(PREVIEW_USER_COOKIE);
  redirect(await getSafeReturnPath());
}

export async function createWorkspaceBackupAction() {
  const actor = await requirePermission("people:manage");

  const snapshot = await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: "manual-admin-backup",
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "workspace.backup.created",
    entityType: "workspace_backup",
    entityId: snapshot?.pathname ?? "not-configured",
    details: {
      configured: Boolean(snapshot),
      url: snapshot?.url ?? null,
    },
  });

  revalidatePath("/settings/backups");
  redirect(snapshot ? "/settings/backups?saved=1" : "/settings/backups?error=blob-token");
}

export async function createProductAction(formData: FormData) {
  const actor = await requirePermission("products:edit");
  const db = getDb();
  const workspaceSettings = await getWorkspaceSettings();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const route = String(formData.get("route") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const ownerTeam = String(formData.get("ownerTeam") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const priority = String(formData.get("priority") ?? "normal");
  const accessRoles = formData
    .getAll("accessRoles")
    .map((value) => String(value).trim())
    .filter((value): value is (typeof PRODUCT_ACCESS_ROLES)[number] =>
      PRODUCT_ACCESS_ROLES.includes(value as (typeof PRODUCT_ACCESS_ROLES)[number]),
    );
  const assetAccessRoles = formData
    .getAll("assetAccessRoles")
    .map((value) => String(value).trim())
    .filter((value): value is (typeof PRODUCT_ACCESS_ROLES)[number] =>
      PRODUCT_ACCESS_ROLES.includes(value as (typeof PRODUCT_ACCESS_ROLES)[number]),
    );
  const currency = String(
    formData.get("currency") ?? getDefaultCurrency(workspaceSettings.industryTemplate, workspaceSettings.defaultCurrency),
  ).trim().toUpperCase();
  const notes = String(formData.get("notes") ?? "").trim();
  const priceInCents = getOptionalPrice(formData.get("price"));
  const feeItems = getFeeItems(formData);
  const slotsAvailable = getOptionalCount(formData.get("slotsAvailable"));
  const expectedSales = getOptionalCount(formData.get("expectedSales"));
  const salesStartsAt = getOptionalDate(formData.get("salesStartsAt"));
  const salesEndsAt = getOptionalDate(formData.get("salesEndsAt"));
  const expectedSalesPeriod = buildSalesPeriodSummary(salesStartsAt, salesEndsAt);
  const expiresAt = getOptionalDate(formData.get("expiresAt"));
  const visibility = deriveAssetVisibilityFromRoles(assetAccessRoles);
  const customFieldInput = readProductCustomFieldValues(formData, workspaceSettings.productFieldDefinitions);

  const allowedDefaults = getAllowedProductDefaults(workspaceSettings.industryTemplate);

  if (
    !name ||
    !allowedDefaults.categories.has(category) ||
    !allowedDefaults.routes.has(route) ||
    !summary ||
    !pitch ||
    !audience ||
    !ownerTeam ||
    feeItems.hasInvalid ||
    !PRODUCT_PRIORITY.includes(priority as (typeof PRODUCT_PRIORITY)[number]) ||
    accessRoles.length === 0 ||
    assetAccessRoles.length === 0 ||
    !PRODUCT_STATUS.includes(status as (typeof PRODUCT_STATUS)[number]) ||
    !isCurrencyCode(currency)
  ) {
    redirect("/products?error=invalid-product");
  }

  if (!customFieldInput.isValid) {
    redirect("/products?error=invalid-custom-fields");
  }

  if (salesStartsAt && salesEndsAt && salesStartsAt > salesEndsAt) {
    redirect("/products?error=invalid-sales-period");
  }

  if (priceInCents !== null && !actor.permissions.includes("products:price")) {
    redirect("/products?error=price-permission");
  }

  const productId = createId("prod");
  const productSlug = `${slugify(name) || "product"}-${productId.slice(-6)}`;

  await db.insert(products).values({
    id: productId,
    slug: productSlug,
    name,
    category,
    route,
    summary,
    pitch,
    audience,
    ownerTeam,
    status: status as (typeof PRODUCT_STATUS)[number],
    priority: priority as (typeof PRODUCT_PRIORITY)[number],
    visibility,
    accessRoles,
    assetAccessRoles,
    currency,
    priceInCents,
    feeItems: feeItems.items,
    slotsAvailable,
    expectedSales,
    expectedSalesPeriod,
    customFields: customFieldInput.values,
    salesStartsAt,
    salesEndsAt,
    expiresAt,
    notes,
    createdBy: actor.userId,
    updatedBy: actor.userId,
    updatedAt: new Date(),
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "product.created",
    entityType: "product",
    entityId: productId,
    details: { name, status, priority, feeItems: feeItems.items, visibility, accessRoles, assetAccessRoles, route, category },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: "product-created",
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  redirect(`/products/${productId}?created=1`);
}

export async function updateProductAction(formData: FormData) {
  const actor = await requirePermission("products:edit");
  const db = getDb();
  const productId = String(formData.get("productId") ?? "");

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing) {
    redirect("/products?error=not-found");
  }

  const workspaceSettings = await getWorkspaceSettings();

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const route = String(formData.get("route") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();
  const ownerTeam = String(formData.get("ownerTeam") ?? "").trim();
  const status = String(formData.get("status") ?? existing.status);
  const priority = String(formData.get("priority") ?? existing.priority);
  const accessRoles = formData
    .getAll("accessRoles")
    .map((value) => String(value).trim())
    .filter((value): value is (typeof PRODUCT_ACCESS_ROLES)[number] =>
      PRODUCT_ACCESS_ROLES.includes(value as (typeof PRODUCT_ACCESS_ROLES)[number]),
    );
  const assetAccessRoles = formData
    .getAll("assetAccessRoles")
    .map((value) => String(value).trim())
    .filter((value): value is (typeof PRODUCT_ACCESS_ROLES)[number] =>
      PRODUCT_ACCESS_ROLES.includes(value as (typeof PRODUCT_ACCESS_ROLES)[number]),
    );
  const currency = String(formData.get("currency") ?? existing.currency).trim().toUpperCase();
  const notes = String(formData.get("notes") ?? "").trim();
  const priceInCents = getOptionalPrice(formData.get("price"));
  const feeItems = getFeeItems(formData);
  const slotsAvailable = getOptionalCount(formData.get("slotsAvailable"));
  const expectedSales = getOptionalCount(formData.get("expectedSales"));
  const salesStartsAt = getOptionalDate(formData.get("salesStartsAt"));
  const salesEndsAt = getOptionalDate(formData.get("salesEndsAt"));
  const expectedSalesPeriod = buildSalesPeriodSummary(salesStartsAt, salesEndsAt);
  const expiresAt = getOptionalDate(formData.get("expiresAt"));
  const visibility = deriveAssetVisibilityFromRoles(assetAccessRoles);
  const customFieldInput = readProductCustomFieldValues(formData, workspaceSettings.productFieldDefinitions);
  const activeCustomFieldIds = new Set(workspaceSettings.productFieldDefinitions.map((definition) => definition.id));
  const preservedCustomFields = Object.fromEntries(
    Object.entries(existing.customFields).filter(([id]) => !activeCustomFieldIds.has(id)),
  );

  const allowedDefaults = getAllowedProductDefaults(workspaceSettings.industryTemplate, {
    category: existing.category,
    route: existing.route,
  });

  if (
    !name ||
    !allowedDefaults.categories.has(category) ||
    !allowedDefaults.routes.has(route) ||
    !summary ||
    !pitch ||
    !audience ||
    !ownerTeam ||
    feeItems.hasInvalid ||
    !PRODUCT_PRIORITY.includes(priority as (typeof PRODUCT_PRIORITY)[number]) ||
    accessRoles.length === 0 ||
    assetAccessRoles.length === 0 ||
    !PRODUCT_STATUS.includes(status as (typeof PRODUCT_STATUS)[number]) ||
    !isCurrencyCode(currency)
  ) {
    redirect(`/products/${productId}?error=invalid-product`);
  }

  if (!customFieldInput.isValid) {
    redirect(`/products/${productId}?error=invalid-custom-fields`);
  }

  if (salesStartsAt && salesEndsAt && salesStartsAt > salesEndsAt) {
    redirect(`/products/${productId}?error=invalid-sales-period`);
  }

  if (priceInCents !== null && !actor.permissions.includes("products:price")) {
    redirect(`/products/${productId}?error=price-permission`);
  }

  await db
    .update(products)
    .set({
      name,
      category,
      route,
      summary,
      pitch,
      audience,
      ownerTeam,
      status: status as (typeof PRODUCT_STATUS)[number],
      priority: priority as (typeof PRODUCT_PRIORITY)[number],
      visibility,
      accessRoles,
      assetAccessRoles,
      currency,
      priceInCents,
      feeItems: feeItems.items,
      slotsAvailable,
      expectedSales,
      expectedSalesPeriod,
      customFields: { ...preservedCustomFields, ...customFieldInput.values },
      salesStartsAt,
      salesEndsAt,
      expiresAt,
      notes,
      slug: `${slugify(name) || "product"}-${productId.slice(-6)}`,
      updatedBy: actor.userId,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "product.updated",
    entityType: "product",
    entityId: productId,
    details: {
      previousStatus: existing.status,
      nextStatus: status,
      priority,
      feeItems: feeItems.items,
      previousVisibility: existing.visibility,
      nextVisibility: visibility,
      accessRoles,
      assetAccessRoles,
    },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: "product-updated",
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/library");
  redirect(`/products/${productId}?saved=1`);
}

export async function updateProductLifecycleAction(formData: FormData) {
  const actor = await requirePermission("products:publish");
  const db = getDb();
  const productId = String(formData.get("productId") ?? "");
  const nextStatus = String(formData.get("status") ?? "").trim();

  if (!PRODUCT_STATUS.includes(nextStatus as (typeof PRODUCT_STATUS)[number])) {
    redirect("/products?error=invalid-status");
  }

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing) {
    redirect("/products?error=not-found");
  }

  await db
    .update(products)
    .set({
      status: nextStatus as (typeof PRODUCT_STATUS)[number],
      updatedBy: actor.userId,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "product.lifecycle.updated",
    entityType: "product",
    entityId: productId,
    details: {
      name: existing.name,
      previousStatus: existing.status,
      nextStatus,
    },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: `product-${nextStatus}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/library");
  redirect(`/products/${productId}?saved=${nextStatus}`);
}

export async function deleteProductAction(formData: FormData) {
  const actor = await requirePermission("products:delete");
  const db = getDb();
  const productId = String(formData.get("productId") ?? "");

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!existing) {
    redirect("/products?error=not-found");
  }

  await db.delete(products).where(eq(products.id, productId));

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "product.deleted",
    entityType: "product",
    entityId: productId,
    details: {
      name: existing.name,
      status: existing.status,
      route: existing.route,
      category: existing.category,
    },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: "product-deleted",
  });

  revalidatePath("/dashboard");
  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
  revalidatePath("/library");
  redirect("/products?deleted=1");
}

export async function createUserAction(formData: FormData) {
  const actor = await requirePermission("people:manage");
  const db = getDb();

  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "viewer");
  const customGrants = formData
    .getAll("grants")
    .map((grant) => String(grant))
    .filter((grant): grant is Permission => PERMISSIONS.includes(grant as Permission));

  if (!name || !email || !validatePasswordStrength(password) || !PRODUCT_ROLES.includes(role as never)) {
    redirect("/settings/access?error=invalid-user");
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    redirect("/settings/access?error=duplicate-user");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = createId("usr");

  await db.insert(users).values({
    id: userId,
    name,
    email,
    passwordHash,
    role: role as (typeof PRODUCT_ROLES)[number],
    customGrants,
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.created",
    entityType: "user",
    entityId: userId,
    details: { email, role, customGrants },
  });

  revalidatePath("/people");
  revalidatePath("/activity");
  revalidatePath("/settings/access");
  revalidatePath("/settings/activity");
  redirect("/settings/access?created=1");
}

export async function updateUserAccessAction(formData: FormData) {
  const actor = await requirePermission("people:manage");
  const db = getDb();
  const userId = String(formData.get("userId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "viewer").trim();
  const requestedPermissions = formData.getAll("permissions").map((permission) => String(permission));

  if (!userId || !name || !PRODUCT_ROLES.includes(role as never)) {
    redirect("/settings/access?error=invalid-user");
  }

  if (userId === actor.userId) {
    redirect("/settings/access?error=self-manage");
  }

  const [existing] = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      customGrants: users.customGrants,
      deniedPermissions: users.deniedPermissions,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    redirect("/settings/access?error=not-found");
  }

  const { customGrants, deniedPermissions } = splitPermissionOverrides(
    role as (typeof PRODUCT_ROLES)[number],
    requestedPermissions,
  );

  await db
    .update(users)
    .set({
      name,
      role: role as (typeof PRODUCT_ROLES)[number],
      customGrants,
      deniedPermissions,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.access.updated",
    entityType: "user",
    entityId: userId,
    details: {
      previousName: existing.name,
      nextName: name,
      previousRole: existing.role,
      nextRole: role,
      previousCustomGrants: existing.customGrants,
      nextCustomGrants: customGrants,
      previousDeniedPermissions: existing.deniedPermissions,
      nextDeniedPermissions: deniedPermissions,
    },
  });

  revalidatePath("/people");
  revalidatePath("/activity");
  revalidatePath("/settings/access");
  revalidatePath("/settings/activity");
  redirect("/settings/access?saved=1");
}

export async function updateProfileIdentityAction(formData: FormData) {
  const actor = await requireActualSession();
  const db = getDb();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/settings/profile?nameError=invalid");
  }

  await db
    .update(users)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(users.id, actor.userId));

  await createSessionCookie({
    userId: actor.userId,
    name,
    email: actor.email,
    avatarUrl: actor.avatarUrl,
    role: actor.role,
    permissions: actor.permissions,
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.profile.updated",
    entityType: "user",
    entityId: actor.userId,
    details: { name },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings/profile");
  revalidatePath("/settings/access");
  redirect("/settings/profile?nameSaved=1");
}

export async function changePasswordAction(formData: FormData) {
  const actor = await requireActualSession();
  const db = getDb();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const nextPassword = String(formData.get("nextPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !validatePasswordStrength(nextPassword) || nextPassword !== confirmPassword) {
    redirect("/settings/profile?passwordError=invalid");
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!currentMatches) {
    redirect("/settings/profile?passwordError=current");
  }

  const sameAsCurrent = await bcrypt.compare(nextPassword, user.passwordHash);

  if (sameAsCurrent) {
    redirect("/settings/profile?passwordError=reuse");
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12);

  const [updatedUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      customGrants: users.customGrants,
      deniedPermissions: users.deniedPermissions,
    })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!updatedUser) {
    redirect("/login");
  }

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, actor.userId));

  await createSessionCookie({
    userId: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    avatarUrl: updatedUser.avatarUrl,
    role: updatedUser.role,
    permissions: resolvePermissions(
      updatedUser.role,
      updatedUser.customGrants,
      updatedUser.deniedPermissions,
    ),
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.password.changed",
    entityType: "user",
    entityId: actor.userId,
    details: {},
  });

  revalidatePath("/settings/profile");
  redirect("/settings/profile?passwordSaved=1");
}

export async function enableMfaAction(formData: FormData) {
  const actor = await requireActualSession();
  const db = getDb();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const token = String(formData.get("token") ?? "");
  const secretPayload = String(formData.get("secretPayload") ?? "");

  if (!currentPassword || !token || !secretPayload) {
    redirect("/settings/profile?mfaError=setup");
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!user) {
    redirect("/login");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    redirect("/settings/profile?mfaError=password");
  }

  let secret = "";

  try {
    secret = decryptMfaSecret(secretPayload);
  } catch {
    redirect("/settings/profile?mfaError=setup");
  }

  const tokenMatches = await verifyTotpToken(secret, token);

  if (!tokenMatches) {
    redirect("/settings/profile?mfaError=token");
  }

  const recoveryCodes = generateRecoveryCodes();
  const recoveryCodeHashes = await Promise.all(recoveryCodes.map((code) => bcrypt.hash(code, 12)));

  await db
    .update(users)
    .set({
      mfaEnabled: true,
      mfaSecretEncrypted: encryptMfaSecret(secret),
      mfaRecoveryCodesHash: recoveryCodeHashes,
      mfaEnabledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, actor.userId));

  const store = await cookies();
  store.set(MFA_RECOVERY_CODES_COOKIE, JSON.stringify(recoveryCodes), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/settings/profile",
    maxAge: 60 * 10,
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.mfa.enabled",
    entityType: "user",
    entityId: actor.userId,
    details: {},
  });

  revalidatePath("/settings/profile");
  redirect("/settings/profile?mfaSaved=1");
}

export async function disableMfaAction(formData: FormData) {
  const actor = await requireActualSession();
  const db = getDb();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!currentPassword || !token) {
    redirect("/settings/profile?mfaError=disable");
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      mfaSecretEncrypted: users.mfaSecretEncrypted,
      mfaEnabled: users.mfaEnabled,
    })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!user || !user.mfaEnabled || !user.mfaSecretEncrypted) {
    redirect("/settings/profile?mfaError=disable");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    redirect("/settings/profile?mfaError=password");
  }

  const tokenMatches = await verifyTotpToken(decryptMfaSecret(user.mfaSecretEncrypted), token);

  if (!tokenMatches) {
    redirect("/settings/profile?mfaError=token");
  }

  await db
    .update(users)
    .set({
      mfaEnabled: false,
      mfaSecretEncrypted: null,
      mfaRecoveryCodesHash: [],
      mfaEnabledAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, actor.userId));

  const store = await cookies();
  store.delete(MFA_RECOVERY_CODES_COOKIE);

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.mfa.disabled",
    entityType: "user",
    entityId: actor.userId,
    details: {},
  });

  revalidatePath("/settings/profile");
  redirect("/settings/profile?mfaDisabled=1");
}

export async function regenerateRecoveryCodesAction(formData: FormData) {
  const actor = await requireActualSession();
  const db = getDb();
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!currentPassword) {
    redirect("/settings/profile?mfaError=recovery");
  }

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      mfaEnabled: users.mfaEnabled,
    })
    .from(users)
    .where(eq(users.id, actor.userId))
    .limit(1);

  if (!user || !user.mfaEnabled) {
    redirect("/settings/profile?mfaError=recovery");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    redirect("/settings/profile?mfaError=password");
  }

  const recoveryCodes = generateRecoveryCodes();
  const recoveryCodeHashes = await Promise.all(recoveryCodes.map((code) => bcrypt.hash(code, 12)));

  await db
    .update(users)
    .set({
      mfaRecoveryCodesHash: recoveryCodeHashes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, actor.userId));

  const store = await cookies();
  store.set(MFA_RECOVERY_CODES_COOKIE, JSON.stringify(recoveryCodes), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/settings/profile",
    maxAge: 60 * 10,
  });

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "user.mfa.recovery.regenerated",
    entityType: "user",
    entityId: actor.userId,
    details: {},
  });

  revalidatePath("/settings/profile");
  redirect("/settings/profile?mfaRecovery=1");
}

export async function toggleUserStatusAction(formData: FormData) {
  const actor = await requirePermission("people:manage");
  const db = getDb();
  const userId = String(formData.get("userId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  if (userId === actor.userId && !nextValue) {
    redirect("/settings/access?error=self-disable");
  }

  await db
    .update(users)
    .set({ isActive: nextValue, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: nextValue ? "user.enabled" : "user.disabled",
    entityType: "user",
    entityId: userId,
    details: { isActive: nextValue },
  });

  revalidatePath("/people");
  revalidatePath("/activity");
  revalidatePath("/settings/access");
  revalidatePath("/settings/activity");
  redirect("/settings/access");
}

export async function deleteAssetAction(formData: FormData) {
  const actor = await requirePermission("assets:manage");
  const db = getDb();
  const assetId = String(formData.get("assetId") ?? "").trim();
  const returnTo = getSafeRedirectPath(formData.get("returnTo"), "/library");

  if (!assetId) {
    redirect(addQueryParam(returnTo, "error", "asset-invalid"));
  }

  const [asset] = await db
    .select({
      id: productAssets.id,
      productId: productAssets.productId,
      label: productAssets.label,
      kind: productAssets.kind,
      storagePath: productAssets.storagePath,
      url: productAssets.url,
    })
    .from(productAssets)
    .where(eq(productAssets.id, assetId))
    .limit(1);

  if (!asset) {
    redirect(addQueryParam(returnTo, "error", "asset-not-found"));
  }

  await db.delete(productAssets).where(eq(productAssets.id, assetId));

  if (asset.storagePath && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await del(asset.storagePath);
    } catch {
      // Keep the record deleted even if blob cleanup cannot complete.
    }
  }

  await recordAuditEvent({
    actorUserId: actor.userId,
    action: "asset.deleted",
    entityType: "product_asset",
    entityId: assetId,
    details: {
      productId: asset.productId,
      label: asset.label,
      kind: asset.kind,
      storagePath: asset.storagePath,
      url: asset.url,
    },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: actor.userId,
    reason: "asset-deleted",
  });

  revalidatePath("/dashboard");
  revalidatePath("/library");
  revalidatePath(`/products/${asset.productId}`);
  redirect(returnTo);
}
