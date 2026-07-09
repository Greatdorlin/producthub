import { RotateCcw, Save } from "lucide-react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { BrandThemePresets } from "@/components/brand-theme-presets";
import { chipClassName } from "@/components/chip";
import { FieldLabel } from "@/components/field-label";
import { requirePermission } from "@/lib/auth/server";
import { getIndustryPreset, presets } from "@/lib/config/industries";
import { getWorkspaceSettings } from "@/lib/data";

const errorCopy: Record<string, string> = {
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

  const message = error ? errorCopy[error] ?? "Brand update failed." : null;
  const activePreset = getIndustryPreset(settings.industryTemplate);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
      <div className="self-start xl:sticky xl:top-6">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Workspace identity</p>
            <h3 className="ld-panel-title mt-2">Brand system</h3>
            <p className="ld-panel-copy mt-2">
              Set the buyer-facing name, vertical preset, and interface colors used across the workspace.
            </p>
          </div>
          {saved ? <span className={chipClassName("success")}>Saved</span> : null}
        </div>

        {message ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {message}
          </div>
        ) : null}
      </div>

      <div className="ld-panel">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Controls</p>
            <h3 className="ld-panel-title mt-2">Customize this workspace</h3>
          </div>
        </div>

        <AsyncRedirectForm
          action="/api/settings/branding"
          method="post"
          encType="multipart/form-data"
          className="ld-form-grid mt-5"
        >
          <div className="ld-form-section">
            <div className="ld-field-group">
              <label className="grid gap-2">
                <FieldLabel label="Brand name" info="Shown in the sidebar, login screen, and browser metadata." />
                <input className="ld-input" name="brandName" defaultValue={settings.brandName} maxLength={80} />
              </label>

              <label className="grid gap-2">
                <FieldLabel label="Industry preset" info="Changes role labels, field labels, default routes, categories, and currency." />
                <select name="industryTemplate" className="ld-input ld-select" defaultValue={settings.industryTemplate}>
                  {Object.values(presets).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <BrandThemePresets
            brandName={settings.brandName}
            industryLabel={activePreset.label}
            categories={activePreset.productDefaults.categories}
            logoUrl={settings.logoUrl}
            initialThemePreset={settings.themePreset}
            initialFontPreset={settings.fontPreset}
          />

          <div className="ld-form-section">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <FieldLabel label="Upload logo" info="Optional PNG, JPG, or WebP. Keep it under 2 MB." />
                <input
                  className="ld-input file:mr-3 file:rounded-full file:border-0 file:bg-[var(--ld-color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  type="file"
                  name="logo"
                  accept="image/png,image/jpeg,image/webp"
                />
              </label>

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
            </div>
          </div>

          <button
            type="submit"
            className="ld-glass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
          >
            <Save className="size-4" />
            Save brand settings
          </button>
        </AsyncRedirectForm>
      </div>
    </section>
  );
}
