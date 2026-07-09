"use client";

import { Check, Palette, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { chipClassName } from "@/components/chip";
import {
  brandFontPresets,
  brandThemePresets,
  getBrandFontPreset,
  getBrandThemePreset,
} from "@/lib/branding/presets";

type BrandThemePresetsProps = {
  brandName: string;
  industryLabel: string;
  categories: string[];
  logoUrl: string | null;
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

export function BrandThemePresets({
  brandName,
  industryLabel,
  categories,
  logoUrl,
  initialThemePreset,
  initialFontPreset,
}: BrandThemePresetsProps) {
  const [themePresetId, setThemePresetId] = useState(initialThemePreset);
  const [fontPresetId, setFontPresetId] = useState(initialFontPreset);
  const selectedTheme = useMemo(() => getBrandThemePreset(themePresetId), [themePresetId]);
  const selectedFont = useMemo(() => getBrandFontPreset(fontPresetId), [fontPresetId]);

  return (
    <>
      <div
        className="ld-brand-preview-shell p-3"
        style={{
          background: selectedTheme.pageBackground,
          borderColor: `${selectedTheme.mutedTextColor}33`,
          color: selectedTheme.textColor,
          fontFamily: selectedFont.stack,
        }}
      >
        <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
          <div
            className="ld-brand-preview-nav p-3"
            style={{
              background: selectedTheme.surfaceColor,
              border: `1px solid ${selectedTheme.mutedTextColor}22`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex size-9 items-center justify-center overflow-hidden rounded-full"
                style={{ background: `${selectedTheme.accentColor}22`, color: selectedTheme.accentColor }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={`${brandName} logo`} className="h-full w-full object-contain" />
                ) : (
                  <Sparkles className="size-5" />
                )}
              </div>
              <div className="min-w-0 truncate text-sm font-semibold">{brandName}</div>
            </div>

            <div className="mt-4 grid gap-2">
              {["Products", "Assets", "Settings"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[10px] px-3 py-2 text-xs font-semibold"
                  style={{
                    background: index === 2 ? `${selectedTheme.primaryColor}34` : `${selectedTheme.mutedTextColor}14`,
                    color: index === 2 ? selectedTheme.textColor : selectedTheme.mutedTextColor,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="ld-brand-preview-content grid content-between gap-3 rounded-[14px] p-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase" style={{ color: selectedTheme.accentColor }}>
                <Sparkles className="size-3.5" />
                {industryLabel}
              </div>
              <div className="mt-2 text-xl font-semibold">{brandName}</div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {categories.slice(0, 3).map((category) => (
                <div key={category} className="rounded-[10px] px-3 py-3 text-sm" style={{ background: selectedTheme.surfaceColor }}>
                  {category}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full px-4 text-sm font-semibold text-white"
              style={{ background: selectedTheme.primaryColor }}
            >
              <Palette className="size-4" />
              Preview action
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <input type="hidden" name="themePreset" value={themePresetId} />
        <input type="hidden" name="fontPreset" value={fontPresetId} />
        {colorKeys.map((key) => (
          <input key={key} type="hidden" name={key} value={selectedTheme[key]} />
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="ld-kicker">Look and feel</div>
          </div>
          <span className={chipClassName("accent")}>
            <Sparkles className="size-3.5" />
            Instant preview
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {brandThemePresets.map((preset) => {
            const active = themePresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                className={`ld-brand-preset-card group grid gap-3 border p-3 text-left transition ${
                  active
                    ? "is-active border-[var(--ld-color-primary)] bg-white/[0.09]"
                    : "border-white/10 bg-white/[0.035] hover:border-white/22 hover:bg-white/[0.06]"
                }`}
                onClick={() => setThemePresetId(preset.id)}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold text-white">{preset.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--ld-color-muted)]">
                      {preset.description}
                    </span>
                  </span>
                  {active ? (
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--ld-color-primary)] text-white">
                      <Check className="size-3.5" />
                    </span>
                  ) : null}
                </span>

                <span
                  className="grid gap-3 rounded-[14px] border p-3"
                  style={{
                    backgroundColor: preset.pageBackground,
                    borderColor: `${preset.mutedTextColor}33`,
                    color: preset.textColor,
                  }}
                >
                  <span className="ld-brand-swatch-row">
                    <span className="ld-brand-swatch ld-brand-swatch-main" style={{ backgroundColor: preset.surfaceColor }} />
                    <span className="ld-brand-swatch" style={{ backgroundColor: preset.primaryColor }} />
                    <span className="ld-brand-swatch" style={{ backgroundColor: preset.accentColor }} />
                  </span>
                  <span className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span style={{ color: preset.textColor }}>Dashboard ready</span>
                    <span style={{ color: preset.mutedTextColor }}>Cards, forms, nav</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="ld-kicker">Font style</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {brandFontPresets.map((font) => {
              const active = fontPresetId === font.id;

              return (
                <button
                  key={font.id}
                  type="button"
                  className={`ld-brand-font-card border p-3 text-left transition ${
                    active
                      ? "border-[var(--ld-color-primary)] bg-white/[0.09]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/22 hover:bg-white/[0.06]"
                  }`}
                  style={{ fontFamily: font.stack }}
                  onClick={() => setFontPresetId(font.id)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{font.name}</span>
                    {active ? <Check className="size-4 text-[var(--ld-color-primary-strong)]" /> : null}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-[var(--ld-color-muted)]">
                    {font.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
