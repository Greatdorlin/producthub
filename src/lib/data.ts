import { desc, eq, sql } from "drizzle-orm";

import type { AuthenticatedUser } from "@/lib/auth/server";
import { resolvePermissions } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db/client";
import { auditLogs, productAssets, products, users, workspaceSettings } from "@/lib/db/schema";
import type { ProductAccessRole } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site";
import { getBrandFontPreset, getBrandThemePreset } from "@/lib/branding/presets";
import { canUserAccessProductAssets } from "@/lib/product-access";
import { getDaysToExpiry } from "@/lib/utils";
export { getWorkspaceBackupSnapshots } from "@/lib/backups";

type ProductRecord = typeof products.$inferSelect;
type ProductAssetRecord = typeof productAssets.$inferSelect;

export const DEFAULT_WORKSPACE_SETTINGS = {
  id: "default",
  brandName: siteConfig.brandName,
  logoUrl: null as string | null,
  logoStoragePath: null as string | null,
  industryTemplate: siteConfig.industryTemplate,
  themePreset: "command-graphite",
  fontPreset: "system",
  primaryColor: getBrandThemePreset("command-graphite").primaryColor,
  accentColor: getBrandThemePreset("command-graphite").accentColor,
  pageBackground: getBrandThemePreset("command-graphite").pageBackground,
  surfaceColor: getBrandThemePreset("command-graphite").surfaceColor,
  textColor: getBrandThemePreset("command-graphite").textColor,
  mutedTextColor: getBrandThemePreset("command-graphite").mutedTextColor,
  fontFamily: getBrandFontPreset("system").stack,
};

type ProductAccessShape = Pick<ProductRecord, "status" | "accessRoles">;
type ProductAssetAccessShape = Pick<ProductAssetRecord, "visibility">;
type ProductAssetProductAccessShape = Pick<ProductRecord, "assetAccessRoles" | "status">;

function canAccessProduct(product: ProductAccessShape, viewer: AuthenticatedUser) {
  if (viewer.role === "admin") {
    return true;
  }

  if (!product.accessRoles.includes(viewer.role)) {
    return false;
  }

  if (viewer.role === "affiliate") {
    return product.status === "active";
  }

  return true;
}

function canAccessAsset(asset: ProductAssetAccessShape, viewer: AuthenticatedUser) {
  if (viewer.role === "admin") {
    return true;
  }

  if (viewer.role === "affiliate") {
    return asset.visibility === "affiliate";
  }

  if (viewer.role === "viewer") {
    return asset.visibility !== "internal";
  }

  return true;
}

function canAccessAssetGroup(product: ProductAssetProductAccessShape, viewer: AuthenticatedUser) {
  if (viewer.role === "admin") {
    return true;
  }

  if (!canUserAccessProductAssets(product.assetAccessRoles as ProductAccessRole[], viewer.role)) {
    return false;
  }

  if (viewer.role === "affiliate") {
    return product.status === "active";
  }

  return true;
}

export async function getDashboardData(viewer: AuthenticatedUser) {
  const db = getDb();
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(
      sql`CASE ${products.status}
        WHEN 'active' THEN 0
        WHEN 'draft' THEN 1
        ELSE 2
      END`,
      sql`CASE ${products.priority}
        WHEN 'urgent' THEN 0
        WHEN 'high' THEN 1
        WHEN 'normal' THEN 2
        ELSE 3
      END`,
      products.expiresAt,
      desc(products.updatedAt),
    );
  const visibleProducts = allProducts.filter((product) => canAccessProduct(product, viewer));

  const allAssets = await db.select().from(productAssets).orderBy(desc(productAssets.createdAt));
  const productMap = new Map(visibleProducts.map((product) => [product.id, product]));
  const visibleAssets = allAssets.filter((asset) => {
    const product = productMap.get(asset.productId);
    return product ? canAccessAssetGroup(product, viewer) && canAccessAsset(asset, viewer) : false;
  });

  const expiringSoon = visibleProducts.filter((product) => {
    const days = getDaysToExpiry(product.expiresAt);
    return days !== null && days >= 0 && days <= 45;
  });

  const expired = visibleProducts.filter((product) => {
    const days = getDaysToExpiry(product.expiresAt);
    return days !== null && days < 0;
  });

  const published = visibleProducts.filter((product) => product.status === "active");
  const draft = visibleProducts.filter((product) => product.status === "draft");
  const archived = visibleProducts.filter((product) => product.status === "archived");

  return {
    stats: {
      products: visibleProducts.length,
      published: published.length,
      draft: draft.length,
      archived: archived.length,
      expiringSoon: expiringSoon.length,
      assets: visibleAssets.length,
      expired: expired.length,
    },
    products: visibleProducts.slice(0, 6),
    expiringSoon: expiringSoon.slice(0, 5),
  };
}

export async function getWorkspaceSettings() {
  const db = getDb();
  const [settings] = await db
    .select({
      id: workspaceSettings.id,
      brandName: workspaceSettings.brandName,
      logoUrl: workspaceSettings.logoUrl,
      logoStoragePath: workspaceSettings.logoStoragePath,
      industryTemplate: workspaceSettings.industryTemplate,
      themePreset: workspaceSettings.themePreset,
      fontPreset: workspaceSettings.fontPreset,
      primaryColor: workspaceSettings.primaryColor,
      accentColor: workspaceSettings.accentColor,
      pageBackground: workspaceSettings.pageBackground,
      surfaceColor: workspaceSettings.surfaceColor,
      textColor: workspaceSettings.textColor,
      mutedTextColor: workspaceSettings.mutedTextColor,
    })
    .from(workspaceSettings)
    .where(eq(workspaceSettings.id, DEFAULT_WORKSPACE_SETTINGS.id))
    .limit(1);

  if (!settings) {
    return DEFAULT_WORKSPACE_SETTINGS;
  }

  return {
    ...settings,
    fontFamily: getBrandFontPreset(settings.fontPreset).stack,
  };
}

export async function getVisibleProducts(viewer: AuthenticatedUser) {
  const db = getDb();

  const allProducts = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      category: products.category,
      route: products.route,
      summary: products.summary,
      pitch: products.pitch,
      audience: products.audience,
      ownerTeam: products.ownerTeam,
      status: products.status,
      priority: products.priority,
      visibility: products.visibility,
      accessRoles: products.accessRoles,
      assetAccessRoles: products.assetAccessRoles,
      currency: products.currency,
      priceInCents: products.priceInCents,
      feeItems: products.feeItems,
      slotsAvailable: products.slotsAvailable,
      expectedSales: products.expectedSales,
      expectedSalesPeriod: products.expectedSalesPeriod,
      salesStartsAt: products.salesStartsAt,
      salesEndsAt: products.salesEndsAt,
      expiresAt: products.expiresAt,
      notes: products.notes,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .orderBy(
      sql`CASE ${products.status}
        WHEN 'active' THEN 0
        WHEN 'draft' THEN 1
        ELSE 2
      END`,
      sql`CASE ${products.priority}
        WHEN 'urgent' THEN 0
        WHEN 'high' THEN 1
        WHEN 'normal' THEN 2
        ELSE 3
      END`,
      products.expiresAt,
      desc(products.updatedAt),
    );

  return allProducts.filter((product) => canAccessProduct(product, viewer));
}

export async function getProductDetail(productId: string, viewer: AuthenticatedUser) {
  const db = getDb();
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);

  if (!product || !canAccessProduct(product, viewer)) {
    return null;
  }

  const allAssets = await db
    .select({
      id: productAssets.id,
      productId: productAssets.productId,
      kind: productAssets.kind,
      label: productAssets.label,
      url: productAssets.url,
      storagePath: productAssets.storagePath,
      visibility: productAssets.visibility,
      altText: productAssets.altText,
      createdAt: productAssets.createdAt,
      createdBy: users.name,
    })
    .from(productAssets)
    .leftJoin(users, eq(productAssets.createdBy, users.id))
    .where(eq(productAssets.productId, productId))
    .orderBy(desc(productAssets.createdAt));

  const assets = allAssets.filter((asset) => canAccessAsset(asset, viewer));
  const visibleAssets = canAccessAssetGroup(product, viewer) ? assets : [];

  return { product, assets: visibleAssets };
}

export async function getLibraryAssets(viewer: AuthenticatedUser) {
  const db = getDb();

  const allAssets = await db
    .select({
      id: productAssets.id,
      label: productAssets.label,
      url: productAssets.url,
      kind: productAssets.kind,
      visibility: productAssets.visibility,
      createdAt: productAssets.createdAt,
      altText: productAssets.altText,
      productId: products.id,
      productName: products.name,
      productStatus: products.status,
      productAccessRoles: products.accessRoles,
      productAssetAccessRoles: products.assetAccessRoles,
    })
    .from(productAssets)
    .innerJoin(products, eq(productAssets.productId, products.id))
    .orderBy(desc(productAssets.createdAt));

  return allAssets.filter(
    (asset) =>
      canAccessProduct(
        { status: asset.productStatus, accessRoles: asset.productAccessRoles },
        viewer,
      ) &&
      canAccessAssetGroup(
        { status: asset.productStatus, assetAccessRoles: asset.productAssetAccessRoles },
        viewer,
      ) &&
      canAccessAsset({ visibility: asset.visibility }, viewer),
  );
}

export async function getPeopleData() {
  const db = getDb();

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: users.role,
      customGrants: users.customGrants,
      deniedPermissions: users.deniedPermissions,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name)
    .then((rows) =>
      rows.map((row) => ({
        ...row,
        effectivePermissions: resolvePermissions(row.role, row.customGrants, row.deniedPermissions),
      })),
    );
}

export async function getActivityFeed() {
  const db = getDb();

  return db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      actorName: users.name,
      actorEmail: users.email,
      details: auditLogs.details,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorUserId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(40);
}
