import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

import { recordAuditEvent } from "@/lib/audit";
import { getSessionUserFromToken } from "@/lib/auth/server";
import { SESSION_COOKIE } from "@/lib/auth/server";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function safeFileName(fileName: string) {
  const cleaned = fileName.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  return cleaned.replace(/-+/g, "-").slice(0, 80) || "profile";
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/settings/profile", request.url));
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const user = await getSessionUserFromToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const removeAvatar = String(formData.get("removeAvatar") ?? "") === "on";
  const file = formData.get("avatar");

  let avatarUrl: string | null = null;
  let avatarStoragePath: string | null = null;
  let changeType: "removed" | "uploaded" = "removed";

  if (!removeAvatar) {
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.redirect(new URL("/settings/profile?error=missing-photo", request.url));
    }

    if (!ALLOWED_AVATAR_TYPES.has(file.type) || file.size > MAX_AVATAR_BYTES) {
      return NextResponse.redirect(new URL("/settings/profile?error=invalid-photo", request.url));
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.redirect(new URL("/settings/profile?error=blob-token", request.url));
    }

    const blob = await put(
      `profile-pictures/${user.userId}/${Date.now()}-${safeFileName(file.name)}`,
      file,
      {
        access: "public",
        contentType: file.type,
      },
    );

    avatarUrl = blob.url;
    avatarStoragePath = blob.pathname;
    changeType = "uploaded";
  }

  const db = getDb();

  await db
    .update(users)
    .set({
      avatarUrl,
      avatarStoragePath,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.userId));

  await recordAuditEvent({
    actorUserId: user.userId,
    action: "profile.avatar.updated",
    entityType: "user",
    entityId: user.userId,
    details: { changeType, avatarStoragePath },
  });

  return NextResponse.redirect(new URL("/settings/profile?saved=1", request.url));
}
