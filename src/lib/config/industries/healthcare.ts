import type { ProductRole } from "@/lib/constants";

export const healthcarePreset = {
  id: "healthcare",
  label: "Healthcare & Wellness",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Care Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Provider Relations",
    sales_manager: "Growth Manager",
    viewer: "Viewer",
    affiliate: "Referral Partner",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Consultation", "Procedure", "Care Plan", "Wellness Package"],
    routes: ["Clinic", "Virtual", "Home Visit"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Care Setting",
    audience: "Patient Group",
    pitch: "Service Description",
    slotsAvailable: "Appointment Capacity",
    expectedSales: "Patient Target",
  },
};
