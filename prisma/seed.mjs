import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Keep in sync with src/data/rentals.ts (source of truth for display).
const rentals = [
  {
    slug: "2-bedroom-serviced-apartment",
    title: "2-Bedroom Serviced Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Fully furnished 2-bedroom serviced apartment ideal for families and business travellers.",
    beds: 2,
    pricePerNight: 70000,
    unitsTotal: 2,
    image: "/images/prop-1.jpg",
    amenities: JSON.stringify(["2 bed", "24/7 Power", "Water Supply"]),
    type: "short-term",
    bedroomClass: "2-bed",
  },
  {
    slug: "1-bedroom-serviced-apartment",
    title: "1-Bedroom Serviced Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Cozy, tastefully furnished 1-bedroom apartment perfect for couples and solo stays.",
    beds: 1,
    pricePerNight: 55000,
    unitsTotal: 2,
    image: "/images/prop-2.jpg",
    amenities: JSON.stringify(["1 bed", "24/7 Power", "Water Supply"]),
    type: "short-term",
    bedroomClass: "1-bed",
  },
  {
    slug: "studio-apartment",
    title: "Studio Apartment",
    location: "Ogombo, Ajah, Lagos",
    description:
      "Smart open-plan studio with kitchenette — the affordable short-stay option in Ajah.",
    beds: null,
    pricePerNight: 35000,
    unitsTotal: 1,
    image: "/images/prop-3.jpg",
    amenities: JSON.stringify(["24/7 Power", "Water Supply"]),
    type: "short-term",
    bedroomClass: "studio",
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
