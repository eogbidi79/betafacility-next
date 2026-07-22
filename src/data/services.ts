// Vendor service categories for the Property Services marketplace (Phase 4).
export const SERVICE_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Cabinet & Carpentry",
  "Security & CCTV",
  "Access Control",
  "HVAC / Air Conditioning",
  "Painting",
  "Landscaping",
  "Pest Control",
  "Solar & Inverter",
  "General Maintenance",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
