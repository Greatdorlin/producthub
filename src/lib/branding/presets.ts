export type BrandTheme = {
  primaryColor: string;
  accentColor: string;
  pageBackground: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
};

export type BrandThemePreset = BrandTheme & {
  id: string;
  name: string;
  description: string;
};

export type BrandFontPreset = {
  id: string;
  name: string;
  description: string;
  stack: string;
};

export const brandThemePresets = [
  {
    id: "command-graphite",
    name: "Graphite Ledger",
    description: "Neutral command center with blue actions and amber detail.",
    primaryColor: "#2f6df6",
    accentColor: "#f4b23f",
    pageBackground: "#101114",
    surfaceColor: "#1a1c21",
    textColor: "#f8fafc",
    mutedTextColor: "#a8afba",
  },
  {
    id: "capital-black",
    name: "Capital Ink",
    description: "Executive charcoal with restrained rose and clear cyan cues.",
    primaryColor: "#e04f6f",
    accentColor: "#38bdf8",
    pageBackground: "#111113",
    surfaceColor: "#1e1f24",
    textColor: "#fbfbfd",
    mutedTextColor: "#a9b0bd",
  },
  {
    id: "signal-midnight",
    name: "Civic Teal",
    description: "Calm operations palette with teal actions and coral markers.",
    primaryColor: "#14b8a6",
    accentColor: "#fb7185",
    pageBackground: "#101413",
    surfaceColor: "#1a2422",
    textColor: "#f6fbfa",
    mutedTextColor: "#a7b8b4",
  },
  {
    id: "founder-ink",
    name: "Boardroom Olive",
    description: "Grounded premium interface with olive action and gold detail.",
    primaryColor: "#84a65a",
    accentColor: "#eab308",
    pageBackground: "#12130f",
    surfaceColor: "#202218",
    textColor: "#fbfbf2",
    mutedTextColor: "#b4b59f",
  },
  {
    id: "atelier-noir",
    name: "Atelier Noir",
    description: "Sharp catalogue styling with violet-blue action and lime detail.",
    primaryColor: "#6366f1",
    accentColor: "#a3e635",
    pageBackground: "#111116",
    surfaceColor: "#1c1c25",
    textColor: "#f8f7ff",
    mutedTextColor: "#aaa8b8",
  },
] satisfies BrandThemePreset[];

export const brandFontPresets = [
  {
    id: "system",
    name: "Native",
    description: "Clean system typography for fast operational screens.",
    stack: 'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    id: "editorial",
    name: "Presentation",
    description: "Slightly broader spacing for polished sales demos.",
    stack: '"SF Pro Display", "Aptos Display", var(--font-geist-sans), system-ui, sans-serif',
  },
  {
    id: "operator",
    name: "Compact",
    description: "Tighter rhythm for dashboards with dense product data.",
    stack: '"Aptos", "Segoe UI Variable", var(--font-geist-sans), system-ui, sans-serif',
  },
  {
    id: "classic",
    name: "Classic",
    description: "Balanced corporate typography with a familiar feel.",
    stack: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
] satisfies BrandFontPreset[];

export function getBrandThemePreset(id: string | null | undefined) {
  return brandThemePresets.find((preset) => preset.id === id) ?? brandThemePresets[0];
}

export function getBrandFontPreset(id: string | null | undefined) {
  return brandFontPresets.find((preset) => preset.id === id) ?? brandFontPresets[0];
}
