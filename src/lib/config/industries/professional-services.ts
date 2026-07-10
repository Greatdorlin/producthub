import type { ProductRole } from "@/lib/constants";

export const professionalServicesPreset = {
  id: "professional-services",
  label: "Professional Services",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Delivery Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Client Partner",
    sales_manager: "Business Development",
    viewer: "Viewer",
    affiliate: "Referral Partner",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Consulting", "Retainer", "Audit", "Training"],
    routes: ["Remote", "Onsite", "Hybrid"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Delivery Mode",
    audience: "Ideal Client",
    pitch: "Scope Summary",
    slotsAvailable: "Client Capacity",
    expectedSales: "Revenue Target",
  },
};
