import { Save } from "lucide-react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { BrandThemePresets } from "@/components/brand-theme-presets";
import { chipClassName } from "@/components/chip";
import { requirePermission } from "@/lib/auth/server";
import { presets } from "@/lib/config/industries";
import { getWorkspaceSettings } from "@/lib/data";

const errorCopy: Record<string, string> = {
  "invalid-logo": "Use a PNG, JPG, or WebP logo under 2 MB.",
  "blob-token": "Logo storage is not configured.",
  "invalid-currency": "Enter a valid three-letter currency code.",
  "invalid-custom-fields": "Check custom field labels and add at least two choices for dropdown or radio fields.",
  "invalid-catalogue": "Add at least one category and one route, location, or delivery mode.",
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
    description: preset.description,
    categories: preset.productDefaults.categories,
    routes: preset.productDefaults.routes,
    currency: preset.productDefaults.currency,
    fieldLabels: preset.fieldLabels,
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
          initialProductCategories={settings.productCategories}
          initialProductRoutes={settings.productRoutes}
          initialFieldLabelOverrides={settings.fieldLabelOverrides}
          initialThemePreset={settings.themePreset}
          initialFontPreset={settings.fontPreset}
        />

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
