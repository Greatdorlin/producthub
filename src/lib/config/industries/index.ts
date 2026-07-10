import { siteConfig } from "@/lib/config/site";
import type { ProductRole } from "@/lib/constants";
import { educationPreset } from "./education";
import { genericPreset } from "./generic";
import { professionalServicesPreset } from "./professional-services";
import { realEstatePreset } from "./real-estate";
import { travelPreset } from "./travel";

export type IndustryPreset = {
  id: string;
  label: string;
  description: string;
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
  [travelPreset.id]: travelPreset,
  [educationPreset.id]: educationPreset,
  [realEstatePreset.id]: realEstatePreset,
  [professionalServicesPreset.id]: professionalServicesPreset,
};

export function getIndustryPreset(template = siteConfig.industryTemplate) {
  return presets[template] ?? genericPreset;
}

export function getRoleLabel(role: string, template = siteConfig.industryTemplate) {
  const preset = getIndustryPreset(template);
  return preset.roleLabels[role as ProductRole] ?? role;
}

export function getFieldLabel(
  columnName: string,
  template = siteConfig.industryTemplate,
  overrides?: Record<string, string>,
) {
  const preset = getIndustryPreset(template);
  return overrides?.[columnName]?.trim() || preset.fieldLabels[columnName] || columnName;
}

export function getDefaultCurrency(template = siteConfig.industryTemplate, workspaceCurrency?: string) {
  const preset = getIndustryPreset(template);
  return workspaceCurrency || siteConfig.defaultCurrency || preset.productDefaults.currency || "USD";
}

export function getProductOptions(
  template = siteConfig.industryTemplate,
  workspaceCategories: string[] = [],
  workspaceRoutes: string[] = [],
) {
  const preset = getIndustryPreset(template);
  return {
    categories: workspaceCategories.length ? workspaceCategories : preset.productDefaults.categories,
    routes: workspaceRoutes.length ? workspaceRoutes : preset.productDefaults.routes,
  };
}
