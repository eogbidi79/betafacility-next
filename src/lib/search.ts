import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { formatNaira } from "@/lib/utils";
import { meiliEnabled, meiliSearch } from "@/lib/meilisearch";
import { captureError } from "@/lib/observability";

export type SearchHit = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
};

export type SearchGroup = {
  key: "rentals" | "listings" | "services" | "agencies";
  label: string;
  hits: SearchHit[];
};

export const GROUP_LABELS: Record<SearchGroup["key"], string> = {
  rentals: "Rentals",
  listings: "Marketplace listings",
  services: "Property services",
  agencies: "Agencies",
};

const PER_GROUP = 6;

/**
 * Unified site search across rentals, marketplace listings, services and
 * agencies. Uses Meilisearch when configured (typo-tolerant, ranked) and
 * transparently falls back to Postgres `contains` queries otherwise — or if a
 * Meilisearch call fails — so search always works.
 */
export async function searchAll(query: string): Promise<SearchGroup[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (meiliEnabled()) {
    try {
      return await meiliSearch(q, PER_GROUP);
    } catch (err) {
      captureError(err, { where: "meiliSearch", query: q });
      // fall through to DB search
    }
  }
  return dbSearch(q);
}

async function dbSearch(q: string): Promise<SearchGroup[]> {
  const like = { contains: q, mode: "insensitive" as const };

  const [rentals, listings, services, agencies] = await Promise.all([
    prisma.rentalListing.findMany({
      where: {
        active: true,
        OR: [
          { title: like },
          { city: like },
          { state: like },
          { area: like },
          { country: like },
          { description: like },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: PER_GROUP,
    }),
    prisma.advertiseSubmission.findMany({
      where: {
        status: "APPROVED",
        OR: [{ title: like }, { location: like }, { category: like }, { description: like }],
      },
      orderBy: { createdAt: "desc" },
      take: PER_GROUP,
    }),
    prisma.service.findMany({
      where: {
        active: true,
        organization: { verified: true, active: true },
        OR: [{ title: like }, { category: like }, { description: like }, { city: like }, { state: like }],
      },
      include: { organization: true },
      orderBy: { createdAt: "desc" },
      take: PER_GROUP,
    }),
    prisma.organization.findMany({
      where: {
        kind: "AGENCY",
        verified: true,
        active: true,
        OR: [{ name: like }, { city: like }, { state: like }, { description: like }],
      },
      orderBy: { name: "asc" },
      take: PER_GROUP,
    }),
  ]);

  const groups: SearchGroup[] = [
    {
      key: "rentals",
      label: "Rentals",
      hits: rentals.map((r) => ({
        id: r.id,
        title: r.title,
        subtitle: [r.city, r.state, r.country].filter(Boolean).join(", "),
        href: `/rentals/${r.id}`,
        meta:
          r.rentPerYear != null
            ? `${formatMoney(r.rentPerYear, r.currencyCode)}/yr`
            : r.price != null
              ? `${formatMoney(r.price, r.currencyCode)}/night`
              : undefined,
      })),
    },
    {
      key: "listings",
      label: "Marketplace listings",
      hits: listings.map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.location,
        href: `/listings`,
        meta: formatNaira(l.price),
      })),
    },
    {
      key: "services",
      label: "Property services",
      hits: services.map((s) => ({
        id: s.id,
        title: s.title,
        subtitle: `${s.category} · ${s.organization.name}`,
        href: `/property-services/${s.id}`,
        meta: s.priceFrom != null ? `from ${formatMoney(s.priceFrom, s.currencyCode)}` : undefined,
      })),
    },
    {
      key: "agencies",
      label: "Agencies",
      hits: agencies.map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: [a.city, a.state, a.country].filter(Boolean).join(", "),
        href: `/agencies/${a.slug}`,
      })),
    },
  ];

  return groups.filter((g) => g.hits.length > 0);
}

export function totalHits(groups: SearchGroup[]): number {
  return groups.reduce((n, g) => n + g.hits.length, 0);
}
