import { Palette, RotateCcw, Save, ShieldCheck, Sparkles } from "lucide-react";

import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { requirePermission } from "@/lib/auth/server";
import { getIndustryPreset, presets } from "@/lib/config/industries";
import { getWorkspaceSettings } from "@/lib/data";

const errorCopy: Record<string, string> = {
  "invalid-logo": "Use a PNG, JPG, or WebP logo under 2 MB.",
  "blob-token": "Logo storage is not configured.",
};

const colorFields = [
  ["primaryColor", "Primary action"],
  ["accentColor", "Accent"],
  ["pageBackground", "Page background"],
  ["surfaceColor", "Panels and sidebar"],
  ["textColor", "Main text"],
  ["mutedTextColor", "Muted text"],
] as const;

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
    <section className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="ld-solid-panel ld-panel self-start xl:sticky xl:top-6">
        <div className="ld-panel-header">
          <div>
            <p className="ld-kicker">Workspace identity</p>
            <h3 className="ld-panel-title mt-2">Brand system</h3>
            <p className="ld-panel-copy mt-2">
              Set the buyer-facing name, vertical preset, and interface colors used across the workspace.
            </p>
          </div>
          {saved ? <span className="ld-chip text-[var(--ld-color-success)]">Saved</span> : null}
        </div>

        <div
          className="mt-6 overflow-hidden rounded-[14px] border p-4"
          style={{
            borderColor: `${settings.mutedTextColor}33`,
            background: settings.pageBackground,
            color: settings.textColor,
          }}
        >
          <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
            <div
              className="rounded-[12px] p-3"
              style={{
                background: settings.surfaceColor,
                border: `1px solid ${settings.mutedTextColor}22`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="flex size-9 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: `${settings.accentColor}22`, color: settings.accentColor }}
                >
                  {settings.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.logoUrl} alt={`${settings.brandName} logo`} className="h-full w-full object-contain" />
                  ) : (
                    <ShieldCheck className="size-5" />
                  )}
                </div>
                <div className="min-w-0 truncate text-sm font-semibold">{settings.brandName}</div>
              </div>
              <div className="mt-5 grid gap-2">
                {["Products", "Assets", "Settings"].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[10px] px-3 py-2 text-xs font-semibold"
                    style={{
                      background: index === 2 ? `${settings.primaryColor}33` : `${settings.mutedTextColor}12`,
                      color: index === 2 ? settings.textColor : settings.mutedTextColor,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: settings.accentColor }}>
                  <Sparkles className="size-3.5" />
                  {activePreset.label}
                </div>
                <div className="mt-2 text-xl font-semibold">{settings.brandName}</div>
                <p className="mt-1 text-sm" style={{ color: settings.mutedTextColor }}>
                  Products, pricing, assets, and role-based access.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {activePreset.productDefaults.categories.slice(0, 3).map((category) => (
                  <div key={category} className="rounded-[10px] px-3 py-3 text-sm" style={{ background: settings.surfaceColor }}>
                    {category}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-4 text-sm font-semibold text-white"
                style={{ background: settings.primaryColor }}
              >
                <Palette className="size-4" />
                Preview action
              </button>
            </div>
          </div>
        </div>

        {message ? (
          <div className="mt-5 rounded-[12px] border border-[rgba(255,122,114,0.28)] bg-[rgba(255,122,114,0.12)] px-4 py-3 text-sm text-[#fff0ed]">
            {message}
          </div>
        ) : null}
      </div>

      <div className="ld-glass-card ld-panel">
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
                <span className="ld-label">Brand name</span>
                <input className="ld-input" name="brandName" defaultValue={settings.brandName} maxLength={80} />
              </label>

              <label className="grid gap-2">
                <span className="ld-label">Industry preset</span>
                <select name="industryTemplate" className="ld-input ld-select" defaultValue={settings.industryTemplate}>
                  {Object.values(presets).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <span className="ld-note">
                  Presets change role labels, product field labels, route options, categories, and currency defaults.
                </span>
              </label>
            </div>
          </div>

          <div className="ld-form-section">
            <div className="ld-kicker">Theme colors</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {colorFields.map(([name, label]) => (
                <label key={name} className="grid gap-2">
                  <span className="ld-label">{label}</span>
                  <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-black/12 p-2">
                    <input
                      type="color"
                      name={name}
                      defaultValue={settings[name]}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-[10px] border-0 bg-transparent p-0"
                      aria-label={label}
                    />
                    <input
                      name={name}
                      defaultValue={settings[name]}
                      className="ld-input min-h-10"
                      pattern="#[0-9a-fA-F]{6}"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="ld-form-section">
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
