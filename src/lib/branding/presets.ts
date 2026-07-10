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
    name: "Obsidian Blue",
    description: "Crisp blue actions with warm amber signals.",
    primaryColor: "#4f7cff",
    accentColor: "#f3b75e",
    pageBackground: "#0e1014",
    surfaceColor: "#191c22",
    textColor: "#f8fafc",
    mutedTextColor: "#a8afba",
  },
  {
    id: "capital-black",
    name: "Carbon Rose",
    description: "Executive charcoal with confident rose accents.",
    primaryColor: "#e05a78",
    accentColor: "#5dc8e8",
    pageBackground: "#111114",
    surfaceColor: "#1d1e24",
    textColor: "#fbfbfd",
    mutedTextColor: "#a9b0bd",
  },
  {
    id: "signal-midnight",
    name: "Deep Teal",
    description: "Calm teal controls with clear coral signals.",
    primaryColor: "#16b8a4",
    accentColor: "#ff7f78",
    pageBackground: "#0e1312",
    surfaceColor: "#182320",
    textColor: "#f6fbfa",
    mutedTextColor: "#a7b8b4",
  },
  {
    id: "founder-ink",
    name: "Studio Olive",
    description: "Grounded olive controls with muted gold detail.",
    primaryColor: "#91ad62",
    accentColor: "#e5b94f",
    pageBackground: "#11130f",
    surfaceColor: "#1d2118",
    textColor: "#fbfbf2",
    mutedTextColor: "#b4b59f",
  },
  {
    id: "atelier-noir",
    name: "Indigo Night",
    description: "Refined indigo actions with a fresh citrus accent.",
    primaryColor: "#7477f2",
    accentColor: "#b5d96c",
    pageBackground: "#101016",
    surfaceColor: "#1c1c27",
    textColor: "#f8f7ff",
    mutedTextColor: "#aaa8b8",
  },
] satisfies BrandThemePreset[];

export const brandFontPresets = [
  {
    id: "system",
    name: "Geist",
    description: "Balanced and precise.",
    stack: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  {
    id: "editorial",
    name: "Manrope",
    description: "Warm and contemporary.",
    stack: 'var(--font-manrope), var(--font-geist-sans), sans-serif',
  },
  {
    id: "operator",
    name: "Roboto Condensed",
    description: "Compact and efficient.",
    stack: 'var(--font-roboto-condensed), var(--font-geist-sans), sans-serif',
  },
  {
    id: "classic",
    name: "Source Sans",
    description: "Open and highly readable.",
    stack: 'var(--font-source-sans), var(--font-geist-sans), sans-serif',
  },
] satisfies BrandFontPreset[];

export function getBrandThemePreset(id: string | null | undefined) {
  return brandThemePresets.find((preset) => preset.id === id) ?? brandThemePresets[0];
}

export function getBrandFontPreset(id: string | null | undefined) {
  return brandFontPresets.find((preset) => preset.id === id) ?? brandFontPresets[0];
}
