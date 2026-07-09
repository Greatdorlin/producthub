"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

export type BrandTheme = {
  primaryColor: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
};

type ThemePreset = BrandTheme & {
  id: string;
  name: string;
  description: string;
};

export const brandThemePresets = [
  {
    id: "executive-charcoal",
    name: "Executive Charcoal",
    description: "Dark, neutral, and premium for B2B dashboards.",
    primaryColor: "#4f46e5",
    accentColor: "#14b8a6",
    pageBackground: "#151515",
    surfaceColor: "#1f1f23",
    textColor: "#f8fafc",
    mutedTextColor: "#a1a1aa",
  },
  {
    id: "clean-slate",
    name: "Clean Slate",
    description: "Light SaaS workspace with calm blue and green accents.",
    primaryColor: "#2563eb",
    accentColor: "#16a34a",
    pageBackground: "#f6f7fb",
    surfaceColor: "#ffffff",
    textColor: "#111827",
    mutedTextColor: "#64748b",
  },
  {
    id: "studio-graphite",
    name: "Studio Graphite",
    description: "Modern dark UI with coral highlights for creative teams.",
    primaryColor: "#e11d48",
    accentColor: "#f97316",
    pageBackground: "#18181b",
    surfaceColor: "#27272a",
    textColor: "#fafafa",
    mutedTextColor: "#a1a1aa",
  },
  {
    id: "operator-green",
    name: "Operator Green",
    description: "Trustworthy operations palette for sales and service teams.",
    primaryColor: "#047857",
    accentColor: "#0ea5e9",
    pageBackground: "#f1f5f3",
    surfaceColor: "#ffffff",
    textColor: "#102018",
    mutedTextColor: "#607068",
  },
  {
    id: "property-ivory",
    name: "Property Ivory",
    description: "Warm, polished palette for real estate and advisory teams.",
    primaryColor: "#7c3aed",
    accentColor: "#b45309",
    pageBackground: "#faf7f2",
    surfaceColor: "#ffffff",
    textColor: "#1f1b16",
    mutedTextColor: "#6f665d",
  },
  {
    id: "academy-blue",
    name: "Academy Blue",
    description: "Clear education palette with confident blue and amber.",
    primaryColor: "#1d4ed8",
    accentColor: "#d97706",
    pageBackground: "#f8fafc",
    surfaceColor: "#ffffff",
    textColor: "#0f172a",
    mutedTextColor: "#64748b",
  },
] satisfies ThemePreset[];

const colorFields = [
  ["primaryColor", "Primary action"],
  ["accentColor", "Accent"],
  ["pageBackground", "Page background"],
  ["surfaceColor", "Panels and sidebar"],
  ["textColor", "Main text"],
  ["mutedTextColor", "Muted text"],
] as const;

type BrandThemePresetsProps = {
  initialTheme: BrandTheme;
};

function sameTheme(a: BrandTheme, b: BrandTheme) {
  return colorFields.every(([key]) => a[key].toLowerCase() === b[key].toLowerCase());
}

export function BrandThemePresets({ initialTheme }: BrandThemePresetsProps) {
  const [theme, setTheme] = useState(initialTheme);
  const activePresetId = useMemo(
    () => brandThemePresets.find((preset) => sameTheme(theme, preset))?.id,
    [theme],
  );

  function applyTheme(nextTheme: BrandTheme) {
    setTheme(nextTheme);
  }

  function updateColor(key: keyof BrandTheme, value: string) {
    setTheme((currentTheme) => ({
      ...currentTheme,
      [key]: value,
    }));
  }

  return (
    <div className="ld-form-section">
      <div className="ld-kicker">Theme presets</div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {brandThemePresets.map((preset) => {
          const active = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              className={`group grid gap-3 rounded-[12px] border p-3 text-left transition ${
                active
                  ? "border-[var(--ld-color-primary)] bg-white/[0.09]"
                  : "border-white/10 bg-black/12 hover:border-white/20"
              }`}
              onClick={() => applyTheme(preset)}
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

              <span className="flex gap-1.5">
                {colorFields.map(([key]) => (
                  <span
                    key={key}
                    className="h-7 flex-1 rounded-[8px] border border-white/10"
                    style={{ backgroundColor: preset[key] }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {colorFields.map(([name, label]) => (
          <label key={name} className="grid gap-2">
            <span className="ld-label">{label}</span>
            <div className="flex items-center gap-3 rounded-[12px] border border-white/10 bg-black/12 p-2">
              <input
                type="color"
                value={theme[name]}
                onChange={(event) => updateColor(name, event.target.value)}
                className="h-10 w-12 shrink-0 cursor-pointer rounded-[10px] border-0 bg-transparent p-0"
                aria-label={label}
              />
              <input
                name={name}
                value={theme[name]}
                onChange={(event) => updateColor(name, event.target.value)}
                className="ld-input min-h-10"
                pattern="#[0-9a-fA-F]{6}"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
