import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { toDTO, type ListingDTO } from "@/lib/listings";

export type PropertyFilters = {
  country?: string;
  region?: string; // state / province
  city?: string;
  category?: string; // rentalCategory
  propertyType?: string;
  bedroom?: string; // bedroomType
  status?: string;
  listedBy?: string;
  minPrice?: number;
  maxPrice?: number;
  furnished?: boolean;
  parking?: boolean;
  pet?: boolean;
};

export type PropertyPage = {
  items: ListingDTO[];
  total: number;
  page: number;
  pageCount: number;
  limit: number;
};

const ALL = "all";
const set = (v?: string) => v && v !== ALL && v.trim() !== "";

/**
 * Build a Prisma `where` from browse filters. Pure and unit-tested. Price
 * matches the effective price (yearly rent when present, else nightly price).
 */
export function buildPropertyWhere(f: PropertyFilters): Prisma.RentalListingWhereInput {
  const and: Prisma.RentalListingWhereInput[] = [{ active: true }];

  if (set(f.country)) and.push({ country: f.country });
  if (set(f.region)) and.push({ state: f.region });
  if (set(f.city)) and.push({ city: f.city });
  if (set(f.category)) and.push({ rentalCategory: f.category });
  if (set(f.propertyType)) and.push({ propertyType: f.propertyType });
  if (set(f.bedroom)) and.push({ bedroomType: f.bedroom });
  if (set(f.status)) and.push({ status: f.status });
  if (set(f.listedBy)) and.push({ listedBy: f.listedBy });
  if (f.furnished) and.push({ furnished: true });
  if (f.parking) and.push({ parking: true });
  if (f.pet) and.push({ petFriendly: true });

  const hasMin = typeof f.minPrice === "number" && !Number.isNaN(f.minPrice);
  const hasMax = typeof f.maxPrice === "number" && !Number.isNaN(f.maxPrice);
  if (hasMin || hasMax) {
    const range: Prisma.IntNullableFilter = {};
    if (hasMin) range.gte = f.minPrice;
    if (hasMax) range.lte = f.maxPrice;
    // Effective price = rentPerYear when set, otherwise nightly price.
    and.push({
      OR: [{ rentPerYear: range }, { AND: [{ rentPerYear: null }, { price: range }] }],
    });
  }

  return { AND: and };
}

/** Server-side, indexed, paginated property search (featured first). */
export async function searchProperties(
  f: PropertyFilters,
  { page = 1, limit = 9 }: { page?: number; limit?: number } = {},
): Promise<PropertyPage> {
  const where = buildPropertyWhere(f);
  const safePage = Math.max(1, page);
  const take = Math.min(50, Math.max(1, limit));

  const [rows, total] = await Promise.all([
    prisma.rentalListing.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * take,
      take,
    }),
    prisma.rentalListing.count({ where }),
  ]);

  return {
    items: rows.map(toDTO),
    total,
    page: safePage,
    pageCount: Math.max(1, Math.ceil(total / take)),
    limit: take,
  };
}
