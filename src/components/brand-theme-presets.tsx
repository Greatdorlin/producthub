"use client";

import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CircleDot,
  GraduationCap,
  HeartPulse,
  Hotel,
  LayoutDashboard,
  Palette,
  ShoppingBag,
  Type,
} from "lucide-react";
import { useState } from "react";

import { CustomFieldBuilder } from "@/components/custom-field-builder";
import { FieldLabel } from "@/components/field-label";
import {
  brandFontPresets,
  brandThemePresets,
  getBrandFontPreset,
  getBrandThemePreset,
} from "@/lib/branding/presets";
import { CURRENCY_CODES } from "@/lib/currencies";
import type { ProductCustomFieldDefinition } from "@/lib/custom-fields";

type IndustryChoice = {
  id: string;
  label: string;
  categories: string[];
  routes: string[];
  currency: string;
};

type BrandThemePresetsProps = {
  initialBrandName: string;
  industryPresets: IndustryChoice[];
  logoUrl: string | null;
  initialIndustryPreset: string;
  initialDefaultCurrency: string;
  initialCustomFields: ProductCustomFieldDefinition[];
  initialThemePreset: string;
  initialFontPreset: string;
};

const colorKeys = [
  "primaryColor",
  "accentColor",
  "pageBackground",
  "surfaceColor",
  "textColor",
  "mutedTextColor",
] as const;

function IndustryIcon({ id }: { id: string }) {
  if (id === "education") return <GraduationCap className="size-4" />;
  if (id === "real-estate") return <Building2 className="size-4" />;
  if (id === "events") return <CalendarDays className="size-4" />;
  if (id === "retail") return <ShoppingBag className="size-4" />;
  if (id === "hospitality") return <Hotel className="size-4" />;
  if (id === "healthcare") return <HeartPulse className="size-4" />;
  return <BriefcaseBusiness className="size-4" />;
}

export function BrandThemePresets({
  initialBrandName,
  industryPresets,
  logoUrl,
  initialIndustryPreset,
  initialDefaultCurrency,
  initialCustomFields,
  initialThemePreset,
  initialFontPreset,
}: BrandThemePresetsProps) {
  const [brandName, setBrandName] = useState(initialBrandName);
  const [industryPresetId, setIndustryPresetId] = useState(initialIndustryPreset);
  const [defaultCurrency, setDefaultCurrency] = useState(initialDefaultCurrency);
  const [themePresetId, setThemePresetId] = useState(initialThemePreset);
  const [fontPresetId, setFontPresetId] = useState(initialFontPreset);
  const selectedTheme = getBrandThemePreset(themePresetId);
  const selectedFont = getBrandFontPreset(fontPresetId);
  const selectedIndustry =
    industryPresets.find((preset) => preset.id === industryPresetId) ?? industryPresets[0];
  const previewName = brandName.trim() || "Your workspace";

  return (
    <div className="ld-brand-studio">
      <input type="hidden" name="industryTemplate" value={industryPresetId} />
      <input type="hidden" name="themePreset" value={themePresetId} />
      <input type="hidden" name="fontPreset" value={fontPresetId} />
      {colorKeys.map((key) => (
        <input key={key} type="hidden" name={key} value={selectedTheme[key]} />
      ))}

      <aside className="ld-brand-preview-column">
        <div className="ld-brand-preview-heading">
          <span className="ld-kicker">Live preview</span>
          <span className="ld-brand-live-indicator">
            <CircleDot className="size-3.5" />
            Unsaved
          </span>
        </div>

        <div
          className="ld-brand-preview-shell"
          style={{
            background: selectedTheme.pageBackground,
            borderColor: `${selectedTheme.mutedTextColor}33`,
            color: selectedTheme.textColor,
            fontFamily: selectedFont.stack,
          }}
        >
          <div
            className="ld-brand-preview-nav"
            style={{
              background: selectedTheme.surfaceColor,
              borderColor: `${selectedTheme.mutedTextColor}24`,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-9 items-center justify-center overflow-hidden rounded-full"
                style={{ background: `${selectedTheme.primaryColor}24`, color: selectedTheme.primaryColor }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={`${previewName} logo`} className="h-full w-full object-contain" />
                ) : (
                  <LayoutDashboard className="size-4" />
                )}
              </div>
              <div className="min-w-0 truncate text-sm font-semibold">{previewName}</div>
            </div>

            <div className="mt-5 grid gap-1.5">
              {["Overview", "Products", "Assets", "Settings"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[9px] px-3 py-2 text-xs font-semibold"
                  style={{
                    background: index === 0 ? `${selectedTheme.primaryColor}28` : "transparent",
                    color: index === 0 ? selectedTheme.textColor : selectedTheme.mutedTextColor,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="ld-brand-preview-content">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[0.65rem] font-semibold uppercase" style={{ color: selectedTheme.accentColor }}>
                  {selectedIndustry?.label ?? "Workspace"}
                </div>
                <div className="mt-2 text-xl font-semibold">Overview</div>
              </div>
              <div className="size-8 rounded-full" style={{ background: `${selectedTheme.primaryColor}22` }} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {(selectedIndustry?.categories ?? []).slice(0, 3).map((category, index) => (
                <div
                  key={category}
                  className="min-w-0 rounded-[10px] border px-2.5 py-3"
                  style={{
                    background: selectedTheme.surfaceColor,
                    borderColor: `${selectedTheme.mutedTextColor}1f`,
                  }}
                >
                  <div className="text-[0.62rem]" style={{ color: selectedTheme.mutedTextColor }}>
                    {index === 0 ? "Products" : index === 1 ? "Live" : "Assets"}
                  </div>
                  <div className="mt-2 truncate text-xs font-semibold">{category}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-[0.68rem]" style={{ color: selectedTheme.mutedTextColor }}>
                {defaultCurrency || selectedIndustry?.currency || "USD"} · {selectedFont.name}
              </div>
              <span
                className="inline-flex min-h-9 items-center rounded-full px-3.5 text-xs font-semibold text-white"
                style={{ background: selectedTheme.primaryColor }}
              >
                New product
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="ld-brand-controls">
        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Identity</span>
              <h3 className="ld-panel-title mt-2">Name and industry</h3>
            </div>
          </div>

          <label className="mt-5 grid gap-2">
            <span className="ld-label">Brand name</span>
            <input
              className="ld-input"
              name="brandName"
              value={brandName}
              maxLength={80}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </label>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {industryPresets.map((preset) => {
              const active = industryPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`ld-industry-preset ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => setIndustryPresetId(preset.id)}
                >
                  <span className="ld-industry-preset-icon">
                    <IndustryIcon id={preset.id} />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold">{preset.label}</span>
                    <span className="mt-1 block truncate text-xs text-[var(--ld-color-muted)]">
                      {preset.currency} · {preset.categories[0]}
                    </span>
                  </span>
                  {active ? <Check className="ml-auto size-4 shrink-0 text-[var(--ld-color-primary-strong)]" /> : null}
                </button>
              );
            })}
          </div>

          <label className="mt-5 grid gap-2">
            <FieldLabel label="Default currency" required info="Type any three-letter currency code." />
            <input
              className="ld-input uppercase"
              name="defaultCurrency"
              value={defaultCurrency}
              list="workspace-currency-options"
              required
              minLength={3}
              maxLength={3}
              pattern="[A-Za-z]{3}"
              placeholder="USD"
              onChange={(event) =>
                setDefaultCurrency(event.target.value.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase())
              }
            />
            <datalist id="workspace-currency-options">
              {CURRENCY_CODES.map((currency) => <option key={currency} value={currency} />)}
            </datalist>
          </label>
        </section>

        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Appearance</span>
              <h3 className="ld-panel-title mt-2">Colour system</h3>
            </div>
            <Palette className="size-4 text-[var(--ld-color-primary-strong)]" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {brandThemePresets.map((preset) => {
              const active = themePresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`ld-brand-preset-card ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => setThemePresetId(preset.id)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="ld-brand-palette-wheel" style={{ backgroundColor: preset.pageBackground }}>
                      <span style={{ backgroundColor: preset.primaryColor }} />
                      <span style={{ backgroundColor: preset.accentColor }} />
                      <span style={{ backgroundColor: preset.surfaceColor }} />
                      <i style={{ backgroundColor: preset.textColor }} />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold text-[var(--ld-color-text)]">{preset.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--ld-color-muted)]">{preset.description}</span>
                    </span>
                  </span>
                  {active ? (
                    <span className="ld-brand-selection-mark">
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Typography</span>
              <h3 className="ld-panel-title mt-2">Workspace font</h3>
            </div>
            <Type className="size-4 text-[var(--ld-color-primary-strong)]" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {brandFontPresets.map((font) => {
              const active = fontPresetId === font.id;

              return (
                <button
                  key={font.id}
                  type="button"
                  className={`ld-brand-font-card ${active ? "is-active" : ""}`}
                  style={{ fontFamily: font.stack }}
                  aria-pressed={active}
                  onClick={() => setFontPresetId(font.id)}
                >
                  <span className="text-[2rem] font-semibold leading-none text-[var(--ld-color-text)]">Aa</span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold text-[var(--ld-color-text)]">{font.name}</span>
                    <span className="mt-1 block text-xs text-[var(--ld-color-muted)]">{font.description}</span>
                  </span>
                  {active ? <Check className="ml-auto size-4 shrink-0 text-[var(--ld-color-primary-strong)]" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ld-brand-control-section">
          <CustomFieldBuilder initialDefinitions={initialCustomFields} />
        </section>
      </div>
    </div>
  );
}
