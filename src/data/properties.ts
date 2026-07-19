export type ManagedProperty = {
  slug: string;
  tier: string;
  title: string;
  address: string;
  beds: number;
  baths: number;
  toilets: number;
  pricePerYear: number;
  image: string;
  type: "residential" | "commercial";
  listing: "long-term" | "short-let";
  location: string;
};

export const properties: ManagedProperty[] = [
  {
    slug: "2-bedroom-apartment-peaceland",
    tier: "Standard",
    title: "2 Bedroom Apartment",
    address:
      "19 Pastor Iteh, Off Alhaji Ganiyu Adeoye Street, Peaceland Estate, Ogombo, Ajah, Lagos",
    beds: 2,
    baths: 2,
    toilets: 3,
    pricePerYear: 3200000,
    image: "/images/prop-4.jpg",
    type: "residential",
    listing: "long-term",
    location: "Ogombo, Ajah",
  },
  {
    slug: "1-bedroom-apartment-peaceland",
    tier: "Standard",
    title: "1 Bedroom Apartment",
    address:
      "19 Pastor Iteh, Off Alhaji Ganiyu Adeoye Street, Peaceland Estate, Ogombo, Ajah, Lagos",
    beds: 1,
    baths: 1,
    toilets: 1,
    pricePerYear: 1800000,
    image: "/images/prop-5.jpg",
    type: "residential",
    listing: "long-term",
    location: "Ogombo, Ajah",
  },
  {
    slug: "3-bedroom-apartment-peaceland",
    tier: "Standard",
    title: "3 Bedroom Apartment",
    address:
      "19 Pastor Iteh, Off Alhaji Ganiyu Adeoye Street, Peaceland Estate, Ogombo, Ajah, Lagos",
    beds: 3,
    baths: 3,
    toilets: 4,
    pricePerYear: 3500000,
    image: "/images/prop-6.jpg",
    type: "residential",
    listing: "long-term",
    location: "Ogombo, Ajah",
  },
  {
    slug: "self-contain-apartment-peaceland",
    tier: "Standard",
    title: "Self Contain Apartment",
    address:
      "19 Pastor Iteh, Off Alhaji Ganiyu Adeoye Street, Peaceland Estate, Ogombo, Ajah, Lagos",
    beds: 1,
    baths: 1,
    toilets: 1,
    pricePerYear: 1000000,
    image: "/images/prop-7.jpg",
    type: "residential",
    listing: "long-term",
    location: "Ogombo, Ajah",
  },
];
