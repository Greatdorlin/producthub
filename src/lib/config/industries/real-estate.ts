import type { ProductRole } from "@/lib/constants";

export const realEstatePreset = {
  id: "real-estate",
  label: "Real Estate & Property",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Broker Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Agency Partner",
    sales_manager: "Sales Agent",
    viewer: "Viewer",
    affiliate: "Affiliate",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Residential", "Commercial", "Land", "Short-Let"],
    routes: ["Lagos", "Abuja", "Port Harcourt"],
    currency: "NGN",
  },
  fieldLabels: {
    route: "Location",
    audience: "Buyer Profile",
    pitch: "Property Description",
    slotsAvailable: "Available Units",
    expectedSales: "Sales Target",
  },
};
