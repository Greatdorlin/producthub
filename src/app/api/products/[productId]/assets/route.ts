import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { recordAuditEvent } from "@/lib/audit";
import { getSessionUserFromToken } from "@/lib/auth/server";
import { SESSION_COOKIE } from "@/lib/auth/server";
import { createWorkspaceBackupSnapshot } from "@/lib/backups";
import { ASSET_KIND, PRODUCT_VISIBILITY, type ProductAccessRole } from "@/lib/constants";
import { getDb } from "@/lib/db/client";
import { productAssets, products } from "@/lib/db/schema";
import { getAllowedAssetVisibility } from "@/lib/product-access";
import { createId } from "@/lib/utils";

function isValidExternalUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const { productId } = await context.params;
  return NextResponse.redirect(new URL(`/products/${productId}`, request.url));
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> },
) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUserFromToken(token);
  const { productId } = await context.params;

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.permissions.includes("assets:manage")) {
    return NextResponse.redirect(new URL(`/products/${productId}?error=not-allowed`, request.url));
  }

  const db = getDb();
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return NextResponse.redirect(new URL(`/products?error=not-found`, request.url));
  }

  const allowedVisibility = getAllowedAssetVisibility(product.assetAccessRoles as ProductAccessRole[]);

  const formData = await request.formData();
  const label = String(formData.get("label") ?? "").trim();
  const kind = String(formData.get("kind") ?? "image").trim();
  const visibility = String(formData.get("visibility") ?? "team").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim();
  const file = formData.get("file");

  if (
    !label ||
    !ASSET_KIND.includes(kind as (typeof ASSET_KIND)[number]) ||
    !PRODUCT_VISIBILITY.includes(visibility as (typeof PRODUCT_VISIBILITY)[number])
  ) {
    return NextResponse.redirect(new URL(`/products/${productId}?error=asset-label`, request.url));
  }

  if (!isValidExternalUrl(externalUrl)) {
    return NextResponse.redirect(new URL(`/products/${productId}?error=asset-url`, request.url));
  }

  let assetUrl = externalUrl;
  let storagePath: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.redirect(new URL(`/products/${productId}?error=blob-token`, request.url));
    }

    try {
      const blob = await put(
        `product-assets/${productId}/${Date.now()}-${file.name}`,
        file,
        { access: "public" },
      );

      assetUrl = blob.url;
      storagePath = blob.pathname;
    } catch {
      return NextResponse.redirect(new URL(`/products/${productId}?error=upload-failed`, request.url));
    }
  }

  if (!assetUrl) {
    return NextResponse.redirect(new URL(`/products/${productId}?error=asset-url`, request.url));
  }

  if (!allowedVisibility.includes(visibility as (typeof PRODUCT_VISIBILITY)[number])) {
    return NextResponse.redirect(new URL(`/products/${productId}?error=asset-visibility`, request.url));
  }

  const assetId = createId("asset");

  await db.insert(productAssets).values({
    id: assetId,
    productId,
    kind: kind as (typeof ASSET_KIND)[number],
    label,
    url: assetUrl,
    storagePath,
    visibility: visibility as (typeof PRODUCT_VISIBILITY)[number],
    altText,
    createdBy: user.userId,
  });

  await recordAuditEvent({
    actorUserId: user.userId,
    action: "asset.created",
    entityType: "product_asset",
    entityId: assetId,
    details: { productId, label, kind, visibility, storagePath },
  });

  await createWorkspaceBackupSnapshot({
    actorUserId: user.userId,
    reason: "asset-created",
  });

  return NextResponse.redirect(new URL(`/products/${productId}?asset=1`, request.url));
}
