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
    name: "Command Graphite",
    description: "Premium dark operations UI with electric blue and mint accents.",
    primaryColor: "#5b7cfa",
    accentColor: "#22c55e",
    pageBackground: "#111113",
    surfaceColor: "#1b1c20",
    textColor: "#f8fafc",
    mutedTextColor: "#a3a8b3",
  },
  {
    id: "capital-black",
    name: "Capital Black",
    description: "Executive charcoal workspace with refined violet and cyan.",
    primaryColor: "#8b5cf6",
    accentColor: "#06b6d4",
    pageBackground: "#0f1014",
    surfaceColor: "#1d1f27",
    textColor: "#f7f7fb",
    mutedTextColor: "#a6adbb",
  },
  {
    id: "signal-midnight",
    name: "Signal Midnight",
    description: "Deep neutral dashboard with crisp blue and amber signals.",
    primaryColor: "#3b82f6",
    accentColor: "#f59e0b",
    pageBackground: "#111827",
    surfaceColor: "#1f2937",
    textColor: "#f9fafb",
    mutedTextColor: "#b6c0cf",
  },
  {
    id: "founder-ink",
    name: "Founder Ink",
    description: "Sharp product-suite palette with rose and teal detail.",
    primaryColor: "#f43f5e",
    accentColor: "#2dd4bf",
    pageBackground: "#141416",
    surfaceColor: "#202126",
    textColor: "#fafafa",
    mutedTextColor: "#a8a8b3",
  },
] satisfies BrandThemePreset[];

export const brandFontPresets = [
  {
    id: "system",
    name: "System Sans",
    description: "Fast, familiar, and native on every device.",
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    id: "editorial",
    name: "Editorial Sans",
    description: "Softer and more premium for buyer demos.",
    stack: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    id: "operator",
    name: "Operator Sans",
    description: "Compact, focused, and suited to dense dashboards.",
    stack: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  },
] satisfies BrandFontPreset[];

export function getBrandThemePreset(id: string | null | undefined) {
  return brandThemePresets.find((preset) => preset.id === id) ?? brandThemePresets[0];
}

export function getBrandFontPreset(id: string | null | undefined) {
  return brandFontPresets.find((preset) => preset.id === id) ?? brandFontPresets[0];
}
