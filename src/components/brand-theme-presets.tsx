"use client";

import {
  BriefcaseBusiness,
  Building2,
  Check,
  CircleDot,
  GraduationCap,
  ImageUp,
  LayoutDashboard,
  Palette,
  Plane,
  RotateCcw,
  Type,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CustomFieldBuilder } from "@/components/custom-field-builder";
import { FieldLabel } from "@/components/field-label";
import {
  brandFontPresets,
  brandThemePresets,
  getBrandFontPreset,
  getBrandThemePreset,
} from "@/lib/branding/presets";
import { currencyOptions } from "@/lib/currencies";
import type { ProductCustomFieldDefinition } from "@/lib/custom-fields";
import {
  PRODUCT_FIELD_LABEL_KEYS,
  type ProductFieldLabelKey,
  type ProductFieldLabelOverrides,
} from "@/lib/workspace-customization";

type IndustryChoice = {
  id: string;
  label: string;
  description: string;
  categories: string[];
  routes: string[];
  currency: string;
  fieldLabels: Record<string, string>;
};

type BrandThemePresetsProps = {
  initialBrandName: string;
  industryPresets: IndustryChoice[];
  logoUrl: string | null;
  initialIndustryPreset: string;
  initialDefaultCurrency: string;
  initialCustomFields: ProductCustomFieldDefinition[];
  initialProductCategories: string[];
  initialProductRoutes: string[];
  initialFieldLabelOverrides: ProductFieldLabelOverrides;
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

const fieldLabelControls: Array<{ key: ProductFieldLabelKey; label: string }> = [
  { key: "route", label: "Route or location" },
  { key: "audience", label: "Audience" },
  { key: "pitch", label: "Description" },
  { key: "slotsAvailable", label: "Availability" },
  { key: "expectedSales", label: "Sales target" },
];

function splitOptions(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean),
    ),
  ).slice(0, 24);
}

function IndustryIcon({ id }: { id: string }) {
  if (id === "travel") return <Plane className="size-4" />;
  if (id === "education") return <GraduationCap className="size-4" />;
  if (id === "real-estate") return <Building2 className="size-4" />;
  return <BriefcaseBusiness className="size-4" />;
}

export function BrandThemePresets({
  initialBrandName,
  industryPresets,
  logoUrl,
  initialIndustryPreset,
  initialDefaultCurrency,
  initialCustomFields,
  initialProductCategories,
  initialProductRoutes,
  initialFieldLabelOverrides,
  initialThemePreset,
  initialFontPreset,
}: BrandThemePresetsProps) {
  const initialIndustry =
    industryPresets.find((preset) => preset.id === initialIndustryPreset) ?? industryPresets[0];
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [brandName, setBrandName] = useState(initialBrandName);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [industryPresetId, setIndustryPresetId] = useState(initialIndustry.id);
  const [defaultCurrency, setDefaultCurrency] = useState(initialDefaultCurrency);
  const [categoryText, setCategoryText] = useState(
    (initialProductCategories.length ? initialProductCategories : initialIndustry.categories).join(", "),
  );
  const [routeText, setRouteText] = useState(
    (initialProductRoutes.length ? initialProductRoutes : initialIndustry.routes).join(", "),
  );
  const [fieldLabels, setFieldLabels] = useState<Record<ProductFieldLabelKey, string>>(() =>
    Object.fromEntries(
      PRODUCT_FIELD_LABEL_KEYS.map((key) => [
        key,
        initialFieldLabelOverrides[key] || initialIndustry.fieldLabels[key] || key,
      ]),
    ) as Record<ProductFieldLabelKey, string>,
  );
  const [themePresetId, setThemePresetId] = useState(initialThemePreset);
  const [fontPresetId, setFontPresetId] = useState(initialFontPreset);
  const selectedTheme = getBrandThemePreset(themePresetId);
  const selectedFont = getBrandFontPreset(fontPresetId);
  const selectedIndustry =
    industryPresets.find((preset) => preset.id === industryPresetId) ?? initialIndustry;
  const categories = splitOptions(categoryText);
  const routes = splitOptions(routeText);
  const previewName = brandName.trim() || "Your workspace";
  const previewCategory = categories[0] || "Product";
  const previewRoute = routes[0] || "Online";

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function applyIndustryPreset(preset: IndustryChoice) {
    setIndustryPresetId(preset.id);
    setDefaultCurrency(preset.currency);
    setCategoryText(preset.categories.join(", "));
    setRouteText(preset.routes.join(", "));
    setFieldLabels(
      Object.fromEntries(
        PRODUCT_FIELD_LABEL_KEYS.map((key) => [key, preset.fieldLabels[key] || key]),
      ) as Record<ProductFieldLabelKey, string>,
    );
  }

  function clearLogo() {
    if (logoInputRef.current) logoInputRef.current.value = "";
    setLogoPreview(null);
    setRemoveLogo(Boolean(logoUrl));
  }

  function restoreLogo() {
    setRemoveLogo(false);
    setLogoPreview(logoUrl);
  }

  return (
    <div className="ld-brand-studio">
      <input type="hidden" name="industryTemplate" value={industryPresetId} />
      <input type="hidden" name="themePreset" value={themePresetId} />
      <input type="hidden" name="fontPreset" value={fontPresetId} />
      <input type="hidden" name="removeLogo" value={removeLogo ? "on" : ""} />
      <input type="hidden" name="productCategories" value={JSON.stringify(categories)} />
      <input type="hidden" name="productRoutes" value={JSON.stringify(routes)} />
      <input type="hidden" name="fieldLabelOverrides" value={JSON.stringify(fieldLabels)} />
      {colorKeys.map((key) => (
        <input key={key} type="hidden" name={key} value={selectedTheme[key]} />
      ))}

      <aside className="ld-brand-preview-column">
        <div className="ld-brand-preview-heading">
          <span className="ld-kicker">Live preview</span>
          <span className="ld-brand-live-indicator">
            <CircleDot className="size-3.5" />
            Preview
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
                className="flex size-9 items-center justify-center overflow-hidden rounded-[10px]"
                style={{ background: `${selectedTheme.primaryColor}24`, color: selectedTheme.primaryColor }}
              >
                {logoPreview && !removeLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt={`${previewName} logo`} className="h-full w-full object-contain" />
                ) : (
                  <LayoutDashboard className="size-4" />
                )}
              </div>
              <div className="min-w-0 truncate text-sm font-semibold">{previewName}</div>
            </div>

            <div className="mt-5 grid gap-1.5">
              {[
                ["Overview", true],
                ["Products", false],
                ["Assets", false],
                ["Settings", false],
              ].map(([item, active]) => (
                <div
                  key={String(item)}
                  className="rounded-[8px] px-3 py-2 text-xs font-semibold"
                  style={{
                    background: active ? `${selectedTheme.primaryColor}24` : "transparent",
                    color: active ? selectedTheme.textColor : selectedTheme.mutedTextColor,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="ld-brand-preview-content">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[0.65rem] font-semibold uppercase" style={{ color: selectedTheme.accentColor }}>
                  {selectedIndustry.label}
                </div>
                <div className="mt-1.5 text-xl font-semibold">Overview</div>
              </div>
              <span
                className="inline-flex min-h-8 items-center rounded-full px-3 text-[0.65rem] font-semibold text-white"
                style={{ background: selectedTheme.primaryColor }}
              >
                New product
              </span>
            </div>

            <div className="ld-brand-preview-stats mt-4">
              {[
                ["Products", String(Math.max(categories.length * 4, 12))],
                ["Live", "8"],
                ["Sold out", "2"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="ld-brand-preview-stat"
                  style={{ background: selectedTheme.surfaceColor, borderColor: `${selectedTheme.mutedTextColor}1f` }}
                >
                  <span style={{ color: selectedTheme.mutedTextColor }}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div
              className="ld-brand-preview-product mt-3"
              style={{ background: selectedTheme.surfaceColor, borderColor: `${selectedTheme.mutedTextColor}1f` }}
            >
              <div className="flex min-w-0 items-center justify-between gap-2">
                <span className="truncate text-[0.65rem] font-semibold" style={{ color: selectedTheme.accentColor }}>
                  {previewCategory}
                </span>
                <span
                  className="rounded-full px-2 py-1 text-[0.58rem] font-semibold"
                  style={{ background: `${selectedTheme.primaryColor}22`, color: selectedTheme.primaryColor }}
                >
                  Live
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold">{previewCategory} offer</div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[0.65rem]" style={{ color: selectedTheme.mutedTextColor }}>
                <span>{fieldLabels.route}: {previewRoute}</span>
                <strong style={{ color: selectedTheme.textColor }}>{defaultCurrency} 2,400</strong>
              </div>
            </div>

            <div className="mt-3 text-[0.62rem]" style={{ color: selectedTheme.mutedTextColor }}>
              {selectedFont.name} · {fieldLabels.audience} · {fieldLabels.slotsAvailable}
            </div>
          </div>
        </div>
      </aside>

      <div className="ld-brand-controls">
        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Identity</span>
              <h3 className="ld-panel-title mt-2">Name and logo</h3>
            </div>
          </div>

          <div className="ld-brand-identity-grid mt-5">
            <div className="ld-brand-logo-control">
              <input
                ref={logoInputRef}
                className="sr-only"
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setRemoveLogo(false);
                  setLogoPreview(URL.createObjectURL(file));
                }}
              />
              <button
                type="button"
                className="ld-brand-logo-button"
                onClick={() => logoInputRef.current?.click()}
                aria-label="Choose workspace logo"
                title="Choose workspace logo"
              >
                {logoPreview && !removeLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Workspace logo preview" />
                ) : (
                  <ImageUp className="size-5" />
                )}
              </button>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[var(--ld-color-text)]">Workspace logo</div>
                <div className="mt-1 text-xs text-[var(--ld-color-muted)]">PNG, JPG, or WebP</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="ld-text-button" onClick={() => logoInputRef.current?.click()}>
                    {logoPreview && !removeLogo ? "Change" : "Choose"}
                  </button>
                  {logoPreview && !removeLogo ? (
                    <button type="button" className="ld-text-button is-danger" onClick={clearLogo}>Remove</button>
                  ) : null}
                  {removeLogo && logoUrl ? (
                    <button type="button" className="ld-text-button" onClick={restoreLogo}>
                      <RotateCcw className="size-3.5" /> Restore
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <label className="grid min-w-0 gap-2">
              <FieldLabel label="Brand name" required />
              <input
                className="ld-input"
                name="brandName"
                value={brandName}
                required
                maxLength={80}
                onChange={(event) => setBrandName(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Industry</span>
              <h3 className="ld-panel-title mt-2">Choose a starting point</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {industryPresets.map((preset) => {
              const active = industryPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`ld-industry-preset ${active ? "is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => applyIndustryPreset(preset)}
                >
                  <span className="ld-industry-preset-icon">
                    <IndustryIcon id={preset.id} />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-semibold">{preset.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--ld-color-muted)]">
                      {preset.description}
                    </span>
                  </span>
                  {active ? <Check className="size-4 shrink-0 text-[var(--ld-color-primary-strong)]" /> : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="ld-brand-control-section">
          <div className="ld-brand-section-heading">
            <div>
              <span className="ld-kicker">Catalogue</span>
              <h3 className="ld-panel-title mt-2">Defaults and wording</h3>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <FieldLabel label="Default currency" required info="Applied to new products. Each product can use a different currency." />
              <select
                className="ld-input ld-select"
                name="defaultCurrency"
                value={defaultCurrency}
                required
                onChange={(event) => setDefaultCurrency(event.target.value)}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <FieldLabel label="Categories" required />
              <input
                className="ld-input"
                value={categoryText}
                required
                placeholder="Product, Service, Package"
                onChange={(event) => setCategoryText(event.target.value)}
              />
            </label>

            <label className="grid gap-2 sm:col-span-2">
              <FieldLabel label="Routes, locations, or delivery modes" required />
              <input
                className="ld-input"
                value={routeText}
                required
                placeholder="Online, Onsite, Hybrid"
                onChange={(event) => setRouteText(event.target.value)}
              />
            </label>
          </div>

          <div className="ld-brand-wording-grid mt-5">
            {fieldLabelControls.map((control) => (
              <label key={control.key} className="grid gap-2">
                <FieldLabel label={control.label} required />
                <input
                  className="ld-input"
                  value={fieldLabels[control.key]}
                  required
                  maxLength={80}
                  onChange={(event) =>
                    setFieldLabels((current) => ({ ...current, [control.key]: event.target.value }))
                  }
                />
              </label>
            ))}
          </div>
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
                    <span className="ld-brand-selection-mark"><Check className="size-3.5" /></span>
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
