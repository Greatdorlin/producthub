import type { ProductRole } from "@/lib/constants";

export const educationPreset = {
  id: "education",
  label: "Education & Travel",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Admissions Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Partnership Manager",
    sales_manager: "Sales Manager",
    viewer: "Viewer",
    affiliate: "Affiliate",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["University Admission", "Visa Processing", "Language Test Prep", "Travel Package"],
    routes: ["UK", "USA", "Canada", "Australia", "Europe"],
    currency: "NGN",
  },
  fieldLabels: {
    route: "Route",
    audience: "Target Market",
    pitch: "Pitch",
    slotsAvailable: "Slots Available",
    expectedSales: "Expected Sales",
  },
};
