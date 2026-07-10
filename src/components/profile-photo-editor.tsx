"use client";

import { Camera, RotateCcw, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";

export function ProfilePhotoEditor({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <AsyncRedirectForm
      action="/api/settings/profile"
      method="post"
      encType="multipart/form-data"
      className="ld-profile-photo-editor"
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        name="avatar"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setFileName(file.name);
          setPreviewUrl(URL.createObjectURL(file));
        }}
      />

      <button
        type="button"
        className="ld-profile-avatar-button"
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile picture"
        title="Change profile picture"
      >
        <span className="ld-profile-photo-preview">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={`${name} profile picture`} className="h-full w-full object-cover" />
          ) : (
            <UserRound className="size-9 text-[var(--ld-color-primary-strong)]" />
          )}
        </span>
        <span className="ld-profile-avatar-action" aria-hidden>
          <Camera className="size-4" />
        </span>
      </button>

      <div className="min-w-0 text-center">
        <div className="text-sm font-semibold text-[var(--ld-color-text)]">Click the photo to change it</div>
        <div className="mt-1 truncate text-xs text-[var(--ld-color-muted)]">
          {fileName || "PNG, JPG, or WebP · 2 MB max"}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="submit"
          className="ld-glass-button inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!fileName}
        >
          <Camera className="size-4" />
          Save photo
        </button>
        {avatarUrl ? (
          <button
            type="submit"
            name="removeAvatar"
            value="on"
            className="ld-secondary-button inline-flex min-h-10 items-center gap-2 px-4 text-sm font-semibold"
          >
            <RotateCcw className="size-4" />
            Remove
          </button>
        ) : null}
      </div>
    </AsyncRedirectForm>
  );
}
