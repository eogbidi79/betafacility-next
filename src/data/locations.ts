// Reusable multi-country location data. Add a country by adding a block here —
// no code changes elsewhere. Powers the country → region → city filter cascade.

export type CountryDef = { name: string; code: string; currency: string; regionLabel: string };

export const COUNTRIES: CountryDef[] = [
  { name: "Nigeria", code: "NG", currency: "NGN", regionLabel: "State" },
  { name: "Canada", code: "CA", currency: "CAD", regionLabel: "Province / Territory" },
];

// country -> region -> cities
export const LOCATIONS: Record<string, Record<string, string[]>> = {
  Nigeria: {
    Abia: ["Umuahia", "Aba"],
    Adamawa: ["Yola", "Mubi"],
    "Akwa Ibom": ["Uyo", "Eket"],
    Anambra: ["Awka", "Onitsha", "Nnewi"],
    Bauchi: ["Bauchi", "Azare"],
    Bayelsa: ["Yenagoa"],
    Benue: ["Makurdi", "Gboko"],
    Borno: ["Maiduguri"],
    "Cross River": ["Calabar", "Ugep"],
    Delta: ["Asaba", "Warri", "Sapele"],
    Ebonyi: ["Abakaliki"],
    Edo: ["Benin City", "Auchi"],
    Ekiti: ["Ado-Ekiti"],
    Enugu: ["Enugu", "Nsukka"],
    "FCT - Abuja": ["Abuja", "Gwagwalada", "Kubwa"],
    Gombe: ["Gombe"],
    Imo: ["Owerri", "Orlu"],
    Jigawa: ["Dutse", "Hadejia"],
    Kaduna: ["Kaduna", "Zaria"],
    Kano: ["Kano", "Wudil"],
    Katsina: ["Katsina", "Funtua"],
    Kebbi: ["Birnin Kebbi"],
    Kogi: ["Lokoja", "Okene"],
    Kwara: ["Ilorin", "Offa"],
    Lagos: ["Ajah", "Lekki", "Ikeja", "Victoria Island", "Ikoyi", "Yaba", "Surulere", "Ikorodu", "Epe"],
    Nasarawa: ["Lafia", "Keffi"],
    Niger: ["Minna", "Suleja"],
    Ogun: ["Abeokuta", "Ijebu-Ode", "Sagamu"],
    Ondo: ["Akure", "Ondo"],
    Osun: ["Osogbo", "Ile-Ife", "Ilesa"],
    Oyo: ["Ibadan", "Ogbomosho"],
    Plateau: ["Jos", "Bukuru"],
    Rivers: ["Port Harcourt", "Bonny"],
    Sokoto: ["Sokoto"],
    Taraba: ["Jalingo", "Wukari"],
    Yobe: ["Damaturu", "Potiskum"],
    Zamfara: ["Gusau", "Kaura Namoda"],
  },
  Canada: {
    Alberta: ["Calgary", "Edmonton", "Red Deer"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Kelowna", "Burnaby"],
    Manitoba: ["Winnipeg", "Brandon"],
    "New Brunswick": ["Fredericton", "Moncton", "Saint John"],
    "Newfoundland and Labrador": ["St. John's", "Corner Brook"],
    "Nova Scotia": ["Halifax", "Dartmouth", "Sydney"],
    Ontario: ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London", "Brampton", "Markham", "Kitchener"],
    "Prince Edward Island": ["Charlottetown", "Summerside"],
    Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau"],
    Saskatchewan: ["Regina", "Saskatoon"],
    "Northwest Territories": ["Yellowknife"],
    Nunavut: ["Iqaluit"],
    Yukon: ["Whitehorse"],
  },
};

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export function regionsOf(country: string): string[] {
  return Object.keys(LOCATIONS[country] ?? {}).sort();
}
export function citiesOf(country: string, region: string): string[] {
  return LOCATIONS[country]?.[region] ?? [];
}
export function currencyOf(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currency ?? "NGN";
}

export const PROPERTY_TYPES = [
  "Studio",
  "1 Bedroom",
  "2 Bedroom",
  "3 Bedroom",
  "4 Bedroom+",
  "Duplex",
  "Detached House",
  "Semi-Detached House",
  "Townhouse",
  "Condo",
  "Apartment",
  "Commercial Property",
  "Land",
] as const;

export const BEDROOM_TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom+"] as const;
export const RENTAL_CATEGORIES = ["Short-let", "Long-Term", "Sale"] as const;
export const RENTAL_STATUSES = ["Coming Soon", "Available", "Fully Occupied", "Sold", "Archived"] as const;
export const LISTED_BY = ["Beta Facility", "Agency", "Individual"] as const;
export const CURRENCIES = ["NGN", "CAD"] as const;

export const AMENITY_OPTIONS = [
  "Security",
  "Water Supply",
  "Compound Cleaning",
  "24/7 Power",
  "Parking",
  "Air Conditioning",
  "Furnished",
  "CCTV",
  "Estate",
  "POP Ceiling",
  "Heating",
  "Snow Removal",
];

// Approx coordinates for map fallback when a listing has no exact lat/lng.
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Ajah: { lat: 6.4698, lng: 3.5852 },
  Lekki: { lat: 6.4413, lng: 3.5389 },
  Ikeja: { lat: 6.6018, lng: 3.3515 },
  "Victoria Island": { lat: 6.4281, lng: 3.4219 },
  Abuja: { lat: 9.0765, lng: 7.3986 },
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  Ibadan: { lat: 7.3775, lng: 3.947 },
  "Benin City": { lat: 6.335, lng: 5.6037 },
  Kano: { lat: 12.0022, lng: 8.592 },
  Enugu: { lat: 6.5244, lng: 7.5105 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Ottawa: { lat: 45.4215, lng: -75.6972 },
  Vancouver: { lat: 49.2827, lng: -123.1207 },
  Calgary: { lat: 51.0447, lng: -114.0719 },
  Edmonton: { lat: 53.5461, lng: -113.4938 },
  Montreal: { lat: 45.5019, lng: -73.5674 },
  "Quebec City": { lat: 46.8139, lng: -71.208 },
  Halifax: { lat: 44.6488, lng: -63.5752 },
  Winnipeg: { lat: 49.8951, lng: -97.1384 },
  Mississauga: { lat: 43.589, lng: -79.6441 },
};
