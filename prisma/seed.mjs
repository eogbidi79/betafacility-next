import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Bookable short-stay units (slugs must match the AVAILABLE short-term entries in
// src/data/rentals.ts so the booking flow can look them up).
const AMEN = JSON.stringify(["Security", "Water Supply", "Compound Cleaning"]);
const rentals = [
  {
    slug: "short-studio-1",
    title: "Studio Apartment",
    location: "Ajah, Lagos",
    description: "Comfortable studio apartment in Ajah with security, steady water and compound cleaning.",
    beds: 0,
    pricePerNight: 35000,
    unitsTotal: 1,
    image: "/images/rentals/ss-studio.jpg",
    amenities: AMEN,
    type: "short-term",
    bedroomClass: "studio",
  },
  {
    slug: "short-1-bed-3",
    title: "1 Bedroom Apartment",
    location: "Ajah, Lagos",
    description: "Comfortable 1 bedroom apartment in Ajah with security, steady water and compound cleaning.",
    beds: 1,
    pricePerNight: 55000,
    unitsTotal: 1,
    image: "/images/rentals/ss-1br.jpg",
    amenities: AMEN,
    type: "short-term",
    bedroomClass: "1-bed",
  },
  {
    slug: "short-1-bed-4",
    title: "1 Bedroom Apartment",
    location: "Ajah, Lagos",
    description: "Comfortable 1 bedroom apartment in Ajah with security, steady water and compound cleaning.",
    beds: 1,
    pricePerNight: 55000,
    unitsTotal: 1,
    image: "/images/rentals/ss-1br.jpg",
    amenities: AMEN,
    type: "short-term",
    bedroomClass: "1-bed",
  },
];

const LAMEN = ["Security", "Water Supply", "Compound Cleaning", "24/7 Power"];
const img = (name) => `/images/rentals/${name}`;
const ph = (p) =>
  JSON.stringify({
    livingRoom: p.living ?? [],
    bedroom: p.bedroom ?? [],
    toiletBathroom: p.toilet ?? [],
    kitchen: p.kitchen ?? [],
    building: p.building ?? [],
  });

// Grouped Beta Facility rental listings (one card per rental+bedroom type).
const rentalListings = [
  {
    id: "bf-short-studio",
    title: "Studio Apartment — Short-let",
    rentalCategory: "Short-let",
    bedroomType: "Studio",
    totalUnits: 1,
    availableUnits: 1,
    state: "Lagos",
    city: "Ajah",
    area: "Ogombo",
    price: 35000,
    rentPerYear: null,
    status: "Coming Soon",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("living-1.jpg")], bedroom: [img("ss-studio.jpg")], toilet: [img("toilet-1.jpg")], kitchen: [img("kitchen-2.jpg")], building: [img("building-1.jpg")] }),
    description: "Smart open-plan studio in Ajah — coming soon.",
    listedBy: "Beta Facility",
    latitude: 6.4698,
    longitude: 3.5852,
  },
  {
    id: "bf-short-1bed",
    title: "1 Bedroom Apartment — Short-let",
    rentalCategory: "Short-let",
    bedroomType: "1 Bedroom",
    totalUnits: 1,
    availableUnits: 1,
    state: "Lagos",
    city: "Ajah",
    area: "Ogombo",
    price: 55000,
    rentPerYear: null,
    status: "Coming Soon",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("living-2.jpg")], bedroom: [img("ss-1br.jpg")], toilet: [img("toilet-2.jpg")], kitchen: [img("kitchen-1.jpg")], building: [img("building-2.jpg")] }),
    description: "Comfortable 1-bedroom short-let in Ajah — coming soon.",
    listedBy: "Beta Facility",
    latitude: 6.4705,
    longitude: 3.586,
  },
  {
    id: "bf-short-2bed",
    title: "2 Bedroom Apartment — Short-let",
    rentalCategory: "Short-let",
    bedroomType: "2 Bedroom",
    totalUnits: 2,
    availableUnits: 2,
    state: "Lagos",
    city: "Ajah",
    area: "Ogombo",
    price: 70000,
    rentPerYear: null,
    status: "Coming Soon",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("ls-living-1.jpg")], bedroom: [img("bedroom-1.jpg"), img("ss-2br.jpg")], toilet: [img("toilet-1.jpg")], kitchen: [img("kitchen-1.jpg")], building: [img("ls-building.jpg")] }),
    description: "Spacious 2-bedroom serviced apartment in Ajah — coming soon.",
    listedBy: "Beta Facility",
    latitude: 6.4692,
    longitude: 3.5845,
  },
  {
    id: "bf-long-3bed",
    title: "3 Bedroom Apartment — Long-Term",
    rentalCategory: "Long-Term",
    bedroomType: "3 Bedroom",
    totalUnits: 2,
    availableUnits: 1,
    state: "Lagos",
    city: "Ajah",
    area: "Peaceland Estate, Ogombo",
    price: null,
    rentPerYear: 3500000,
    status: "Available",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("ls-living-2.jpg")], bedroom: [img("bedroom-2.jpg"), img("bedroom-1.jpg")], toilet: [img("toilet-2.jpg"), img("toilet-1.jpg")], kitchen: [img("kitchen-2.jpg")], building: [img("building-2.jpg")] }),
    description: "Well-finished 3-bedroom apartment for long-term rent in Ajah.",
    listedBy: "Beta Facility",
    latitude: 6.471,
    longitude: 3.5838,
  },
  {
    id: "bf-long-2bed",
    title: "2 Bedroom Apartment — Long-Term",
    rentalCategory: "Long-Term",
    bedroomType: "2 Bedroom",
    totalUnits: 9,
    availableUnits: 6,
    state: "Lagos",
    city: "Ajah",
    area: "Peaceland Estate, Ogombo",
    price: null,
    rentPerYear: 3200000,
    status: "Available",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("living-1.jpg")], bedroom: [img("bedroom-1.jpg"), img("ls-2br-2.jpg")], toilet: [img("toilet-1.jpg")], kitchen: [img("kitchen-1.jpg")], building: [img("ls-building.jpg")] }),
    description: "Popular 2-bedroom apartments for long-term rent in Ajah.",
    listedBy: "Beta Facility",
    latitude: 6.4687,
    longitude: 3.5867,
  },
  {
    id: "bf-long-1bed",
    title: "1 Bedroom Apartment — Long-Term",
    rentalCategory: "Long-Term",
    bedroomType: "1 Bedroom",
    totalUnits: 3,
    availableUnits: 3,
    state: "Lagos",
    city: "Ajah",
    area: "Peaceland Estate, Ogombo",
    price: null,
    rentPerYear: 1800000,
    status: "Available",
    amenities: JSON.stringify(LAMEN),
    photos: ph({ living: [img("living-2.jpg")], bedroom: [img("ss-1br.jpg")], toilet: [img("toilet-2.jpg")], kitchen: [img("kitchen-2.jpg")], building: [img("building-1.jpg")] }),
    description: "Cozy 1-bedroom apartments for long-term rent in Ajah.",
    listedBy: "Beta Facility",
    latitude: 6.4715,
    longitude: 3.5851,
  },
];

async function main() {
  for (const r of rentals) {
    await prisma.rental.upsert({
      where: { slug: r.slug },
      update: r,
      create: r,
    });
  }
  console.log(`Seeded ${rentals.length} rentals.`);

  for (const l of rentalListings) {
    await prisma.rentalListing.upsert({ where: { id: l.id }, update: l, create: l });
  }
  console.log(`Seeded ${rentalListings.length} rental listings.`);

  // Admin accounts. Passwords are re-synced from env on every seed run.
  const admins = [
    {
      email: (process.env.SEED_ADMIN_EMAIL || "admin@betafacility.com").toLowerCase(),
      name: "Administrator",
      password: process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026",
    },
    {
      email: (process.env.SEED_ADMIN2_EMAIL || "emmanuel.ogbidi@betafacility.com").toLowerCase(),
      name: "Emmanuel Ogbidi",
      // Falls back to the primary admin password if no dedicated one is set.
      password: process.env.SEED_ADMIN2_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026",
    },
  ];

  for (const a of admins) {
    if (!a.email || !a.password) continue;
    const passwordHash = await bcrypt.hash(a.password, 10);
    await prisma.user.upsert({
      where: { email: a.email },
      update: { passwordHash, role: "ADMIN" },
      create: { email: a.email, name: a.name, role: "ADMIN", passwordHash },
    });
    console.log(`Seeded admin user: ${a.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
