import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

import { recordAuditEvent } from "@/lib/audit";
import { getSessionUserFromToken } from "@/lib/auth/server";
import { SESSION_COOKIE } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { workspaceSettings } from "@/lib/db/schema";
import { DEFAULT_WORKSPACE_SETTINGS } from "@/lib/data";

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function safeFileName(fileName: string) {
  const cleaned = fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return cleaned.replace(/-+/g, "-").slice(0, 80) || "logo";
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/settings/branding", request.url));
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUserFromToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.permissions.includes("people:manage")) {
    return NextResponse.redirect(new URL("/settings?error=not-allowed", request.url));
  }

  const formData = await request.formData();
  const removeLogo = String(formData.get("removeLogo") ?? "") === "on";
  const file = formData.get("logo");

  let logoUrl: string | null = null;
  let logoStoragePath: string | null = null;
  let changeType: "removed" | "uploaded" = "removed";

  if (!removeLogo) {
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.redirect(new URL("/settings/branding?error=missing-logo", request.url));
    }

    if (!ALLOWED_LOGO_TYPES.has(file.type) || file.size > MAX_LOGO_BYTES) {
      return NextResponse.redirect(new URL("/settings/branding?error=invalid-logo", request.url));
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.redirect(new URL("/settings/branding?error=blob-token", request.url));
    }

    const blob = await put(
      `workspace-branding/${Date.now()}-${safeFileName(file.name)}`,
      file,
      {
        access: "public",
        contentType: file.type,
      },
    );

    logoUrl = blob.url;
    logoStoragePath = blob.pathname;
    changeType = "uploaded";
  }

  const db = getDb();
  const now = new Date();

  await db
    .insert(workspaceSettings)
    .values({
      id: DEFAULT_WORKSPACE_SETTINGS.id,
      brandName: DEFAULT_WORKSPACE_SETTINGS.brandName,
      logoUrl,
      logoStoragePath,
      updatedBy: user.userId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: workspaceSettings.id,
      set: {
        logoUrl,
        logoStoragePath,
        updatedBy: user.userId,
        updatedAt: now,
      },
    });

  await recordAuditEvent({
    actorUserId: user.userId,
    action: "workspace.branding.updated",
    entityType: "workspace_settings",
    entityId: DEFAULT_WORKSPACE_SETTINGS.id,
    details: { changeType, logoStoragePath },
  });

  return NextResponse.redirect(new URL("/settings/branding?saved=1", request.url));
}
