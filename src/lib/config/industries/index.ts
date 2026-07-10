import { siteConfig } from "@/lib/config/site";
import type { ProductRole } from "@/lib/constants";
import { educationPreset } from "./education";
import { eventsPreset } from "./events";
import { genericPreset } from "./generic";
import { healthcarePreset } from "./healthcare";
import { hospitalityPreset } from "./hospitality";
import { professionalServicesPreset } from "./professional-services";
import { realEstatePreset } from "./real-estate";
import { retailPreset } from "./retail";

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
  [eventsPreset.id]: eventsPreset,
  [professionalServicesPreset.id]: professionalServicesPreset,
  [retailPreset.id]: retailPreset,
  [hospitalityPreset.id]: hospitalityPreset,
  [healthcarePreset.id]: healthcarePreset,
};

export function getIndustryPreset(template = siteConfig.industryTemplate) {
  return presets[template] ?? genericPreset;
}

export function getRoleLabel(role: string, template = siteConfig.industryTemplate) {
  const preset = getIndustryPreset(template);
  return preset.roleLabels[role as ProductRole] ?? role;
}

export function getFieldLabel(columnName: string, template = siteConfig.industryTemplate) {
  const preset = getIndustryPreset(template);
  return preset.fieldLabels[columnName] ?? columnName;
}

export function getDefaultCurrency(template = siteConfig.industryTemplate, workspaceCurrency?: string) {
  const preset = getIndustryPreset(template);
  return workspaceCurrency || siteConfig.defaultCurrency || preset.productDefaults.currency || "USD";
}
