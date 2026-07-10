import type { ProductRole } from "@/lib/constants";

export const retailPreset = {
  id: "retail",
  label: "Retail & Commerce",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Store Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Supplier Manager",
    sales_manager: "Sales Manager",
    viewer: "Viewer",
    affiliate: "Affiliate",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Physical Product", "Digital Product", "Subscription", "Bundle"],
    routes: ["Online Store", "Marketplace", "In-store"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Sales Channel",
    audience: "Customer Segment",
    pitch: "Product Description",
    slotsAvailable: "Stock Available",
    expectedSales: "Unit Target",
  },
};
