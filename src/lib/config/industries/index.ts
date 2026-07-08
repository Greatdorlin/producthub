import { siteConfig } from "@/lib/config/site";
import type { ProductRole } from "@/lib/constants";
import { educationPreset } from "./education";
import { genericPreset } from "./generic";
import { realEstatePreset } from "./real-estate";

export type IndustryPreset = {
  id: string;
  label: string;
  roleLabels: Record<ProductRole, string>;
  productDefaults: {
    categories: string[];
    routes: string[];
    currency: string;
  };
  fieldLabels: Record<string, string>;
};

export const presets: Record<string, IndustryPreset> = {
  [genericPreset.id]: genericPreset,
  [educationPreset.id]: educationPreset,
  [realEstatePreset.id]: realEstatePreset,
};

export function getIndustryPreset(template = siteConfig.industryTemplate) {
  return presets[template] ?? genericPreset;
}

export function getRoleLabel(role: string) {
  const preset = getIndustryPreset();
  return preset.roleLabels[role as ProductRole] ?? role;
}

export function getFieldLabel(columnName: string) {
  const preset = getIndustryPreset();
  return preset.fieldLabels[columnName] ?? columnName;
}

export function getDefaultCurrency() {
  const preset = getIndustryPreset();
  return siteConfig.defaultCurrency || preset.productDefaults.currency || "USD";
}
