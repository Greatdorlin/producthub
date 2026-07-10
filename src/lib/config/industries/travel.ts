import type { ProductRole } from "@/lib/constants";

export const travelPreset = {
  id: "travel",
  label: "Travel",
  description: "Trips, visa support, flights, stays, tours, and experiences.",
  roleLabels: {
    admin: "Admin",
    admissions_manager: "Operations Manager",
    marketing_manager: "Marketing Manager",
    partnership_manager: "Travel Partner",
    sales_manager: "Travel Consultant",
    viewer: "Viewer",
    affiliate: "Travel Affiliate",
  } satisfies Record<ProductRole, string>,
  productDefaults: {
    categories: ["Travel Package", "Visa Support", "Flight Service", "Accommodation", "Tour & Experience"],
    routes: ["Domestic", "Africa", "Europe", "North America", "Middle East", "Asia-Pacific"],
    currency: "USD",
  },
  fieldLabels: {
    route: "Destination",
    audience: "Traveller Profile",
    pitch: "Trip Overview",
    slotsAvailable: "Availability",
    expectedSales: "Booking Target",
  },
};
