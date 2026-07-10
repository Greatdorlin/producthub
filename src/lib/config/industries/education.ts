import type { ProductRole } from "@/lib/constants";

export const educationPreset = {
  id: "education",
  label: "Education",
  description: "Admissions, programmes, test preparation, and student support.",
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
    categories: ["University Admission", "Foundation Programme", "Language Test Prep", "Student Visa Support"],
    routes: ["UK", "USA", "Canada", "Australia", "Europe"],
    currency: "NGN",
  },
  fieldLabels: {
    route: "Study Destination",
    audience: "Student Profile",
    pitch: "Programme Overview",
    slotsAvailable: "Available Places",
    expectedSales: "Enrolment Target",
  },
};
