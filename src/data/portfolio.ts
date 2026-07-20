// Curated portfolio/operations showcase data for the Portfolio page.
// Edit these figures as the business grows — nothing here touches the database.

export const coverage = [
  { country: "Nigeria", region: "Lagos — Ogombo, Ajah & environs", units: 42, status: "Active" as const },
  { country: "Canada", region: "Expansion underway", units: 0, status: "Coming soon" as const },
];

export const totalUnits = coverage.reduce((sum, c) => sum + c.units, 0);

/** Headline operational stats. */
export const portfolioStats: { label: string; value: string; hint?: string }[] = [
  { label: "Units under management", value: `${totalUnits}`, hint: "Across all locations" },
  { label: "Buildings managed", value: "11" },
  { label: "Occupancy rate", value: "94%", hint: "Trailing 12 months" },
  { label: "Client retention", value: "98.5%" },
  { label: "Maintenance jobs completed", value: "870+", hint: "Lifetime" },
  { label: "Inspections conducted", value: "310", hint: "Routine + move-in/out" },
  { label: "Avg. response to issues", value: "< 2 hrs", hint: "Critical: < 30 min" },
  { label: "Guest satisfaction", value: "4.8 / 5", hint: "Short-stay reviews" },
];

/** Short vs long stay performance. */
export const rentalBreakdown = {
  short: { label: "Short-stay bookings", value: "1,280+", note: "Serviced apartments & studios" },
  long: { label: "Long-stay tenancies", value: "36", note: "1-year managed tenancies" },
  onTimeRent: { label: "On-time rent collection", value: "96%" },
  avgStay: { label: "Avg. short-stay length", value: "3.4 nights" },
};

/** In-house / on-call facility team by trade. */
export const facilityTeam: { role: string; count: number; note?: string }[] = [
  { role: "Electrical", count: 4, note: "24/7 on-call" },
  { role: "Plumbing", count: 3 },
  { role: "Cleaning & housekeeping", count: 8 },
  { role: "Cabinet & carpentry repair", count: 2 },
  { role: "Security & CCTV", count: 6, note: "Monitored 24/7" },
  { role: "Access control", count: 2 },
  { role: "Generator & power", count: 3 },
  { role: "Solar / inverter", count: 2 },
  { role: "HVAC & cooling", count: 2 },
  { role: "Painting & finishing", count: 3 },
  { role: "Landscaping & grounds", count: 3 },
  { role: "Pest control", count: 1 },
];

/** Other assurances worth surfacing. */
export const assurances: { title: string; body: string }[] = [
  { title: "24/7 emergency response", body: "Round-the-clock line for power, water, security and safety emergencies." },
  { title: "Preventive maintenance", body: "Scheduled servicing of generators, solar, HVAC and safety equipment." },
  { title: "Safety & compliance", body: "Smoke detectors, fire safety and estate-rule compliance checks on every unit." },
  { title: "Transparent reporting", body: "Owners receive regular statements covering income, occupancy and upkeep." },
];

export const reviews: { name: string; stay: string; rating: number; quote: string }[] = [
  {
    name: "Chidinma A.",
    stay: "2-Bedroom Serviced Apartment · 3 nights",
    rating: 5,
    quote: "Spotless apartment, 24/7 power, and they fixed a minor AC issue within the hour. Will book again.",
  },
  {
    name: "Tunde O.",
    stay: "Studio Apartment · 2 nights",
    rating: 5,
    quote: "Smooth online booking and check-in. Exactly as advertised and very responsive team.",
  },
  {
    name: "Grace E.",
    stay: "1-Bedroom Serviced Apartment · 5 nights",
    rating: 4,
    quote: "Comfortable and secure. Great value for the location. Quick replies to every question.",
  },
];
