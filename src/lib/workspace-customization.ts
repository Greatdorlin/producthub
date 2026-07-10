export const PRODUCT_FIELD_LABEL_KEYS = [
  "route",
  "audience",
  "pitch",
  "slotsAvailable",
  "expectedSales",
] as const;

export type ProductFieldLabelKey = (typeof PRODUCT_FIELD_LABEL_KEYS)[number];
export type ProductFieldLabelOverrides = Partial<Record<ProductFieldLabelKey, string>>;

const MAX_OPTIONS = 24;

export function normalizeWorkspaceOptions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_OPTIONS);
}

export function parseWorkspaceOptionsInput(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string" || item.length > 80)) {
      return null;
    }
    return normalizeWorkspaceOptions(parsed);
  } catch {
    return null;
  }
}

export function normalizeFieldLabelOverrides(value: unknown): ProductFieldLabelOverrides {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    PRODUCT_FIELD_LABEL_KEYS.flatMap((key) => {
      const label = (value as Record<string, unknown>)[key];
      if (typeof label !== "string" || !label.trim()) return [];
      return [[key, label.trim().slice(0, 80)]];
    }),
  );
}

export function parseFieldLabelOverridesInput(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "{}"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return normalizeFieldLabelOverrides(parsed);
  } catch {
    return null;
  }
}
