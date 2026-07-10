import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";

import { recordAuditEvent } from "@/lib/audit";
import { getSessionUserFromToken } from "@/lib/auth/server";
import { SESSION_COOKIE } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { workspaceSettings } from "@/lib/db/schema";
import { DEFAULT_WORKSPACE_SETTINGS } from "@/lib/data";
import { presets } from "@/lib/config/industries";
import { getBrandFontPreset, getBrandThemePreset } from "@/lib/branding/presets";
import { isCurrencyCode } from "@/lib/currencies";
import { parseProductFieldDefinitionsInput } from "@/lib/custom-fields";
import { eq } from "drizzle-orm";

const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function safeFileName(fileName: string) {
  const cleaned = fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return cleaned.replace(/-+/g, "-").slice(0, 80) || "logo";
}

function getString(formData: FormData, key: string, fallback: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || fallback;
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
  const db = getDb();
  const [existingSettings] = await db
    .select()
    .from(workspaceSettings)
    .where(eq(workspaceSettings.id, DEFAULT_WORKSPACE_SETTINGS.id))
    .limit(1);
  const currentSettings = existingSettings ?? DEFAULT_WORKSPACE_SETTINGS;
  const brandName = getString(formData, "brandName", currentSettings.brandName);
  const requestedTemplate = getString(formData, "industryTemplate", currentSettings.industryTemplate);
  const industryTemplate = presets[requestedTemplate] ? requestedTemplate : "generic";
  const defaultCurrency = getString(formData, "defaultCurrency", currentSettings.defaultCurrency).toUpperCase();
  const productFieldDefinitions = parseProductFieldDefinitionsInput(formData.get("productFieldDefinitions"));

  if (!isCurrencyCode(defaultCurrency)) {
    return NextResponse.redirect(new URL("/settings/branding?error=invalid-currency", request.url));
  }

  if (!productFieldDefinitions) {
    return NextResponse.redirect(new URL("/settings/branding?error=invalid-custom-fields", request.url));
  }

  const themePreset = getBrandThemePreset(getString(formData, "themePreset", currentSettings.themePreset));
  const fontPreset = getBrandFontPreset(getString(formData, "fontPreset", currentSettings.fontPreset));
  const primaryColor = themePreset.primaryColor;
  const accentColor = themePreset.accentColor;
  const pageBackground = themePreset.pageBackground;
  const surfaceColor = themePreset.surfaceColor;
  const textColor = themePreset.textColor;
  const mutedTextColor = themePreset.mutedTextColor;

  let logoUrl = currentSettings.logoUrl;
  let logoStoragePath = currentSettings.logoStoragePath;
  let changeType: "removed" | "uploaded" | "unchanged" = "unchanged";

  if (removeLogo) {
    logoUrl = null;
    logoStoragePath = null;
    changeType = "removed";
  } else if (file instanceof File && file.size > 0) {

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

  const now = new Date();

  await db
    .insert(workspaceSettings)
    .values({
      id: DEFAULT_WORKSPACE_SETTINGS.id,
      brandName,
      logoUrl,
      logoStoragePath,
      industryTemplate,
      defaultCurrency,
      productFieldDefinitions,
      themePreset: themePreset.id,
      fontPreset: fontPreset.id,
      primaryColor,
      accentColor,
      pageBackground,
      surfaceColor,
      textColor,
      mutedTextColor,
      updatedBy: user.userId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: workspaceSettings.id,
      set: {
        brandName,
        logoUrl,
        logoStoragePath,
        industryTemplate,
        defaultCurrency,
        productFieldDefinitions,
        themePreset: themePreset.id,
        fontPreset: fontPreset.id,
        primaryColor,
        accentColor,
        pageBackground,
        surfaceColor,
        textColor,
        mutedTextColor,
        updatedBy: user.userId,
        updatedAt: now,
      },
    });

  await recordAuditEvent({
    actorUserId: user.userId,
    action: "workspace.branding.updated",
    entityType: "workspace_settings",
    entityId: DEFAULT_WORKSPACE_SETTINGS.id,
    details: {
      changeType,
      brandName,
      industryTemplate,
      defaultCurrency,
      productFieldDefinitions,
      themePreset: themePreset.id,
      fontPreset: fontPreset.id,
      logoStoragePath,
      theme: { primaryColor, accentColor, pageBackground, surfaceColor, textColor, mutedTextColor },
    },
  });

  return NextResponse.redirect(new URL("/settings/branding?saved=1", request.url));
}
