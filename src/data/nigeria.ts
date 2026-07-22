// All 36 Nigerian states + FCT, with major cities for the rental location filter.

export const NIGERIA: Record<string, string[]> = {
  Abia: ["Umuahia", "Aba", "Ohafia"],
  Adamawa: ["Yola", "Mubi", "Numan"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene"],
  Anambra: ["Awka", "Onitsha", "Nnewi"],
  Bauchi: ["Bauchi", "Azare", "Misau"],
  Bayelsa: ["Yenagoa", "Brass", "Sagbama"],
  Benue: ["Makurdi", "Gboko", "Otukpo"],
  Borno: ["Maiduguri", "Biu", "Bama"],
  "Cross River": ["Calabar", "Ugep", "Ogoja"],
  Delta: ["Asaba", "Warri", "Sapele", "Ughelli"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke"],
  Edo: ["Benin City", "Auchi", "Ekpoma"],
  Ekiti: ["Ado-Ekiti", "Ikere", "Ijero"],
  Enugu: ["Enugu", "Nsukka", "Oji River"],
  "FCT - Abuja": ["Abuja", "Gwagwalada", "Kubwa", "Nyanya"],
  Gombe: ["Gombe", "Kumo", "Billiri"],
  Imo: ["Owerri", "Orlu", "Okigwe"],
  Jigawa: ["Dutse", "Hadejia", "Gumel"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan"],
  Kano: ["Kano", "Wudil", "Rano"],
  Katsina: ["Katsina", "Funtua", "Daura"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri"],
  Kogi: ["Lokoja", "Okene", "Idah"],
  Kwara: ["Ilorin", "Offa", "Jebba"],
  Lagos: ["Ajah", "Lekki", "Ikeja", "Victoria Island", "Ikoyi", "Yaba", "Surulere", "Ikorodu", "Epe", "Badagry"],
  Nasarawa: ["Lafia", "Keffi", "Akwanga"],
  Niger: ["Minna", "Suleja", "Bida"],
  Ogun: ["Abeokuta", "Ijebu-Ode", "Sagamu"],
  Ondo: ["Akure", "Ondo", "Owo"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa"],
  Oyo: ["Ibadan", "Ogbomosho", "Oyo"],
  Plateau: ["Jos", "Bukuru", "Pankshin"],
  Rivers: ["Port Harcourt", "Bonny", "Bori"],
  Sokoto: ["Sokoto", "Tambuwal", "Wurno"],
  Taraba: ["Jalingo", "Wukari", "Bali"],
  Yobe: ["Damaturu", "Potiskum", "Gashua"],
  Zamfara: ["Gusau", "Kaura Namoda", "Anka"],
};

export const NIGERIAN_STATES = Object.keys(NIGERIA).sort();

export const BEDROOM_TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom"] as const;
export const RENTAL_CATEGORIES = ["Short-let", "Long-Term"] as const;
export const RENTAL_STATUSES = ["Coming Soon", "Available", "Fully Occupied"] as const;
export const LISTED_BY = ["Beta Facility", "Agency", "Individual"] as const;
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
];

// Approx city centre coordinates for map fallback when a listing has none.
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
};
