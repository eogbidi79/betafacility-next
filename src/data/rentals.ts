export type Rental = {
  slug: string;
  title: string;
  location: string;
  description: string;
  beds: number; // 0 = studio
  toilets: number; // always beds + 1
  price: number;
  period: "night" | "year";
  available: boolean;
  image: string;
  amenities: string[];
  type: "short-term" | "long-term";
  bedroomClass: "studio" | "1-bed" | "2-bed" | "3-bed";
};

const AMENITIES = ["Security", "Water Supply", "Compound Cleaning"];

function bedClass(beds: number): Rental["bedroomClass"] {
  return beds === 0 ? "studio" : beds === 1 ? "1-bed" : beds === 2 ? "2-bed" : "3-bed";
}

function unit(args: {
  slug: string;
  beds: number;
  kind: "short" | "long";
  price: number; // NOTE: placeholder prices — update with real figures.
  available: boolean;
  image: string;
}): Rental {
  const name = args.beds === 0 ? "Studio Apartment" : `${args.beds} Bedroom Apartment`;
  return {
    slug: args.slug,
    title: name,
    location: "Ajah, Lagos",
    description:
      `Comfortable ${name.toLowerCase()} in Ajah with round-the-clock security, steady water ` +
      `supply and regular compound cleaning.`,
    beds: args.beds,
    toilets: args.beds + 1,
    price: args.price,
    period: args.kind === "long" ? "year" : "night",
    available: args.available,
    image: args.image,
    amenities: AMENITIES,
    type: args.kind === "long" ? "long-term" : "short-term",
    bedroomClass: bedClass(args.beds),
  };
}

const LS_IMAGES = [
  "/images/rentals/ls-2br-1.jpg",
  "/images/rentals/ls-2br-2.jpg",
  "/images/rentals/ls-2br-3.jpg",
  "/images/rentals/ls-living-1.jpg",
  "/images/rentals/ls-living-2.jpg",
  "/images/rentals/ls-building.jpg",
];

// Placeholder prices — replace with real figures.
const LONG_2BED_PER_YEAR = 3_200_000;
const SHORT_PRICE: Record<number, number> = { 0: 35_000, 1: 55_000, 2: 70_000, 3: 90_000 };

export const rentals: Rental[] = [
  // ── Long Stay · 2-Bedroom (Ajah) — 5 unavailable, 5 available ──
  ...Array.from({ length: 5 }, (_, i) =>
    unit({
      slug: `long-2-bed-${i + 1}`,
      beds: 2,
      kind: "long",
      price: LONG_2BED_PER_YEAR,
      available: false,
      image: LS_IMAGES[i % LS_IMAGES.length],
    }),
  ),
  ...Array.from({ length: 5 }, (_, i) =>
    unit({
      slug: `long-2-bed-${i + 6}`,
      beds: 2,
      kind: "long",
      price: LONG_2BED_PER_YEAR,
      available: true,
      image: LS_IMAGES[(i + 5) % LS_IMAGES.length],
    }),
  ),

  // ── Short Stay (Ajah) — unavailable: 1BR, 1BR, 3BR, 2BR ──
  unit({ slug: "short-1-bed-1", beds: 1, kind: "short", price: SHORT_PRICE[1], available: false, image: "/images/rentals/ss-1br.jpg" }),
  unit({ slug: "short-1-bed-2", beds: 1, kind: "short", price: SHORT_PRICE[1], available: false, image: "/images/rentals/ss-1br.jpg" }),
  unit({ slug: "short-3-bed-1", beds: 3, kind: "short", price: SHORT_PRICE[3], available: false, image: "/images/rentals/ss-3br.jpg" }),
  unit({ slug: "short-2-bed-1", beds: 2, kind: "short", price: SHORT_PRICE[2], available: false, image: "/images/rentals/ss-2br.jpg" }),

  // ── Short Stay (Ajah) — available: Studio, 1BR, 1BR ──
  unit({ slug: "short-studio-1", beds: 0, kind: "short", price: SHORT_PRICE[0], available: true, image: "/images/rentals/ss-studio.jpg" }),
  unit({ slug: "short-1-bed-3", beds: 1, kind: "short", price: SHORT_PRICE[1], available: true, image: "/images/rentals/ss-1br.jpg" }),
  unit({ slug: "short-1-bed-4", beds: 1, kind: "short", price: SHORT_PRICE[1], available: true, image: "/images/rentals/ss-1br.jpg" }),
];
