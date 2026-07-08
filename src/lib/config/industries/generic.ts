import type { ProductRole } from "@/lib/constants";

export const genericPreset = {
  id: "generic",
  label: "Generic Products",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Partner Manager",
    sales_manager: "Sales Manager",
    viewer: "Viewer",
    affiliate: "Affiliate",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Service", "Package", "Product"],
    routes: ["Online", "Onsite", "Hybrid"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Offering Type",
    audience: "Audience",
    pitch: "Description",
    slotsAvailable: "Capacity",
    expectedSales: "Sales Target",
  },
};
