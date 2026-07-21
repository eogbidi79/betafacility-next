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

async function main() {
  for (const r of rentals) {
    await prisma.rental.upsert({
      where: { slug: r.slug },
      update: r,
      create: r,
    });
  }
  console.log(`Seeded ${rentals.length} rentals.`);

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
