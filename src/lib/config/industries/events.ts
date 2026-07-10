import type { ProductRole } from "@/lib/constants";

export const eventsPreset = {
  id: "events",
  label: "Events & Venues",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Operations Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Vendor Manager",
    sales_manager: "Sales Manager",
    viewer: "Viewer",
    affiliate: "Promoter",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Event Package", "Venue Hire", "Sponsorship", "Vendor Service"],
    routes: ["In-person", "Virtual", "Hybrid"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Format",
    audience: "Guest Profile",
    pitch: "Event Brief",
    slotsAvailable: "Capacity",
    expectedSales: "Registration Target",
  },
};
