import { list, put } from "@vercel/blob";

import { getDb } from "@/lib/db/client";
import { productAssets, products, users, workspaceSettings } from "@/lib/db/schema";
import { siteConfig } from "@/lib/config/site";

const defaultWorkspaceSettings = {
  id: "default",
  brandName: siteConfig.brandName,
  logoUrl: null as string | null,
  logoStoragePath: null as string | null,
};

function buildBackupPath(reason: string) {
  const safeReason = reason.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 48);
  return `workspace-backups/${new Date().toISOString().replace(/[:.]/g, "-")}-${safeReason || "snapshot"}.json`;
}

export async function createWorkspaceBackupSnapshot(input: {
  actorUserId: string;
  reason: string;
}) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const db = getDb();
  const [allProducts, allAssets, allPeople, workspace] = await Promise.all([
    db.select().from(products),
    db.select().from(productAssets),
    db
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
        updatedAt: users.updatedAt,
      })
      .from(users),
    db.select().from(workspaceSettings).limit(1),
  ]);

  const snapshot = {
    exportedAt: new Date().toISOString(),
    actorUserId: input.actorUserId,
    reason: input.reason,
    workspace: workspace[0] ?? defaultWorkspaceSettings,
    counts: {
      products: allProducts.length,
      assets: allAssets.length,
      users: allPeople.length,
    },
    products: allProducts,
    productAssets: allAssets,
    users: allPeople,
  };

  return put(buildBackupPath(input.reason), JSON.stringify(snapshot, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export async function getWorkspaceBackupSnapshots() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { configured: false, backups: [] as Array<{ url: string; pathname: string; uploadedAt: Date | null; size: number | null }> };
  }

  const result = await list({ prefix: "workspace-backups/" });
  const backups = result.blobs
    .map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      uploadedAt: blob.uploadedAt ? new Date(blob.uploadedAt) : null,
      size: typeof blob.size === "number" ? blob.size : null,
    }))
    .sort((left, right) => (right.uploadedAt?.getTime() ?? 0) - (left.uploadedAt?.getTime() ?? 0));

  return { configured: true, backups };
}
