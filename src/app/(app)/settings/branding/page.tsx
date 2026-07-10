import { RotateCcw, Save } from "lucide-react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { BrandThemePresets } from "@/components/brand-theme-presets";
import { chipClassName } from "@/components/chip";
import { FieldLabel } from "@/components/field-label";
import { requirePermission } from "@/lib/auth/server";
import { presets } from "@/lib/config/industries";
import { getWorkspaceSettings } from "@/lib/data";

const errorCopy: Record<string, string> = {
  "invalid-logo": "Use a PNG, JPG, or WebP logo under 2 MB.",
  "blob-token": "Logo storage is not configured.",
  "invalid-currency": "Enter a valid three-letter currency code.",
  "invalid-custom-fields": "Check custom field labels and add at least two choices for dropdown or radio fields.",
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
  const industryPresets = Object.values(presets).map((preset) => ({
    id: preset.id,
    label: preset.label,
    categories: preset.productDefaults.categories,
    routes: preset.productDefaults.routes,
    currency: preset.productDefaults.currency,
  }));

  return (
    <section className="min-w-0">
      <div className="ld-branding-page-header">
        <div>
          <p className="ld-kicker">Brand studio</p>
          <h3 className="ld-panel-title mt-2">Make the workspace yours</h3>
        </div>
        {saved ? <span className={chipClassName("success")}>Changes saved</span> : null}
      </div>

      {message ? (
        <div className="mt-4 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
          {message}
        </div>
      ) : null}

      <AsyncRedirectForm
        action="/api/settings/branding"
        method="post"
        encType="multipart/form-data"
        className="mt-5"
      >
        <BrandThemePresets
          initialBrandName={settings.brandName}
          industryPresets={industryPresets}
          logoUrl={settings.logoUrl}
          initialIndustryPreset={settings.industryTemplate}
          initialDefaultCurrency={settings.defaultCurrency}
          initialCustomFields={settings.productFieldDefinitions}
          initialThemePreset={settings.themePreset}
          initialFontPreset={settings.fontPreset}
        />

        <div className="ld-brand-assets-section">
          <div>
            <p className="ld-kicker">Logo</p>
            <h3 className="ld-panel-title mt-2">Workspace mark</h3>
          </div>
          <div className="grid min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <label className="grid gap-2">
              <FieldLabel label="Upload logo" info="PNG, JPG, or WebP up to 2 MB." />
              <input
                className="ld-input ld-file-input file:mr-3 file:rounded-[9px] file:border-0 file:bg-[var(--ld-color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
              />
            </label>

            {settings.logoUrl ? (
              <label className="ld-check-tile md:min-w-[220px]">
                <input type="checkbox" name="removeLogo" />
                <span className="ld-check-tile-card">
                  <span className="ld-check-tile-title flex items-center gap-2">
                    <RotateCcw className="size-4" />
                    Use default mark
                  </span>
                </span>
              </label>
            ) : null}
          </div>
        </div>

        <div className="ld-brand-savebar">
          <span className="hidden text-sm text-[var(--ld-color-muted)] sm:block">Preview first, then publish your changes.</span>
          <button
            type="submit"
            className="ld-glass-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:brightness-110"
          >
            <Save className="size-4" />
            Save branding
          </button>
        </div>
      </AsyncRedirectForm>
    </section>
  );
}
