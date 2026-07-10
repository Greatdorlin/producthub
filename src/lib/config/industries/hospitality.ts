import type { ProductRole } from "@/lib/constants";

export const hospitalityPreset = {
  id: "hospitality",
  label: "Hospitality & Experiences",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Operations Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Guest Relations Manager",
    sales_manager: "Reservations Manager",
    viewer: "Viewer",
    affiliate: "Booking Partner",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Room", "Dining", "Experience", "Event Package"],
    routes: ["On-property", "Online", "Partner Channel"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Booking Channel",
    audience: "Guest Type",
    pitch: "Experience Description",
    slotsAvailable: "Availability",
    expectedSales: "Booking Target",
  },
};
