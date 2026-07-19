export type Rental = {
  slug: string;
  title: string;
  location: string;
  description: string;
  beds: number | null;
  pricePerNight: number;
  unitsAvailable: number;
  image: string;
  amenities: string[];
  type: "short-term" | "long-term";
  bedroomClass: "studio" | "1-bed" | "2-bed" | "3-bed";
};

export const rentals: Rental[] = [
  {
    slug: "2-bedroom-serviced-apartment",
    title: "2-Bedroom Serviced Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Fully furnished 2-bedroom serviced apartment ideal for families and business travellers. Spacious living area, modern kitchen and en-suite rooms.",
    beds: 2,
    pricePerNight: 70000,
    unitsAvailable: 2,
    image: "/images/prop-1.jpg",
    amenities: ["2 bed", "24/7 Power", "Water Supply"],
    type: "short-term",
    bedroomClass: "2-bed",
  },
  {
    slug: "1-bedroom-serviced-apartment",
    title: "1-Bedroom Serviced Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Cozy, tastefully furnished 1-bedroom apartment perfect for couples and solo stays. Comfortable and centrally located in Ogombo.",
    beds: 1,
    pricePerNight: 55000,
    unitsAvailable: 2,
    image: "/images/prop-2.jpg",
    amenities: ["1 bed", "24/7 Power", "Water Supply"],
    type: "short-term",
    bedroomClass: "1-bed",
  },
  {
    slug: "studio-apartment",
    title: "Studio Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Smart open-plan studio with kitchenette — the affordable short-stay option for a comfortable night in Ajah.",
    beds: null,
    pricePerNight: 35000,
    unitsAvailable: 1,
    image: "/images/prop-3.jpg",
    amenities: ["24/7 Power", "Water Supply"],
    type: "short-term",
    bedroomClass: "studio",
  },
];
