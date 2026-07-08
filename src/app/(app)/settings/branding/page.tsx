import { ImageUp, RotateCcw, ShieldCheck } from "lucide-react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { requirePermission } from "@/lib/auth/server";
import { getWorkspaceSettings } from "@/lib/data";

const errorCopy: Record<string, string> = {
  "missing-logo": "Choose a logo file first.",
  "invalid-logo": "Use a PNG, JPG, or WebP logo under 2 MB.",
  "blob-token": "Logo storage is not configured.",
};

export default async function BrandingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requirePermission("people:manage");

  const [{ error, saved }, settings] = await Promise.all([
    searchParams,
    getWorkspaceSettings(),
  ]);

  const message = error ? errorCopy[error] ?? "Logo update failed." : null;

  return (
    <section className="ld-panel ld-glass-panel">
      <div className="ld-panel-header">
        <div>
          <p className="ld-kicker">Branding</p>
          <h3 className="ld-panel-title mt-2">Logo</h3>
          <p className="ld-panel-copy mt-2">
            This appears across the product hub.
          </p>
        </div>
        {saved ? (
          <span className="ld-chip text-[var(--ld-color-success)]">Saved</span>
        ) : null}
      </div>

      {message ? (
        <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
          {message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="ld-brand-preview">
          <div className="ld-brand-preview-card">
            <div className="flex items-center gap-3">
              <div className="ld-brand-logo-preview">
                {settings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.logoUrl}
                    alt={`${settings.brandName} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ShieldCheck className="size-7 text-[var(--ld-color-accent)]" />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{settings.brandName}</div>
                <div className="text-xs text-[var(--ld-color-muted)]">Product Hub</div>
              </div>
            </div>
          </div>
        </div>

        <AsyncRedirectForm
          action="/api/settings/branding"
          method="post"
          encType="multipart/form-data"
          className="ld-form-section"
        >
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="ld-label">Upload logo</span>
              <input
                className="ld-input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--ld-color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
              />
            </label>

            <p className="ld-note">PNG, JPG, or WebP. Keep it under 2 MB.</p>

            {settings.logoUrl ? (
              <label className="ld-check-tile">
                <input type="checkbox" name="removeLogo" />
                <span className="ld-check-tile-card">
                  <span className="ld-check-tile-title flex items-center gap-2">
                    <RotateCcw className="size-4" />
                    Use default mark
                  </span>
                  <span className="ld-check-tile-copy">
                    Removes the custom logo from the app shell.
                  </span>
                </span>
              </label>
            ) : null}

            <button
              type="submit"
              className="ld-glass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
            >
              <ImageUp className="size-4" />
              Save logo
            </button>
          </div>
        </AsyncRedirectForm>
      </div>
    </section>
  );
}
