import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/currency";
import { formatNaira } from "@/lib/utils";

// Lightweight Meilisearch integration over fetch (no SDK dependency, matching
// how email.ts/observability.ts call Resend/Sentry). Enabled only when
// MEILISEARCH_HOST is set; callers fall back to Postgres search otherwise.

type GroupKey = "rentals" | "listings" | "services" | "agencies";

const INDEXES: { key: GroupKey; uid: string; label: string }[] = [
  { key: "rentals", uid: "bf_rentals", label: "Rentals" },
  { key: "listings", uid: "bf_listings", label: "Marketplace listings" },
  { key: "services", uid: "bf_services", label: "Property services" },
  { key: "agencies", uid: "bf_agencies", label: "Agencies" },
];

type MeiliDoc = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  body: string;
};

export function meiliEnabled(): boolean {
  return Boolean(process.env.MEILISEARCH_HOST);
}

function host(): string {
  return (process.env.MEILISEARCH_HOST || "").replace(/\/+$/, "");
}

async function meili<T = unknown>(
  path: string,
  { method = "GET", body }: { method?: string; body?: unknown } = {},
): Promise<T> {
  const key = process.env.MEILISEARCH_API_KEY;
  const res = await fetch(`${host()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // "index_already_exists" on create is expected and harmless.
    if (res.status === 409 || /index_already_exists/.test(text)) {
      return {} as T;
    }
    throw new Error(`Meilisearch ${method} ${path} → ${res.status} ${text}`);
  }
  return (await res.json().catch(() => ({}))) as T;
}

/** Create indexes if missing and set their searchable attributes. */
export async function ensureIndexes(): Promise<void> {
  for (const idx of INDEXES) {
    await meili("/indexes", { method: "POST", body: { uid: idx.uid, primaryKey: "id" } });
    await meili(`/indexes/${idx.uid}/settings`, {
      method: "PATCH",
      body: { searchableAttributes: ["title", "subtitle", "body"] },
    });
  }
}

async function replaceDocs(uid: string, docs: MeiliDoc[]): Promise<void> {
  await meili(`/indexes/${uid}/documents`, { method: "DELETE" });
  if (docs.length) await meili(`/indexes/${uid}/documents`, { method: "POST", body: docs });
}

const clean = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(" ");
const loc = (parts: (string | null | undefined)[]) => parts.filter(Boolean).join(", ");

/** Rebuild all indexes from the database. Returns per-index document counts. */
export async function reindexAll(): Promise<Record<GroupKey, number>> {
  await ensureIndexes();

  const [rentals, listings, services, agencies] = await Promise.all([
    prisma.rentalListing.findMany({ where: { active: true } }),
    prisma.advertiseSubmission.findMany({ where: { status: "APPROVED" } }),
    prisma.service.findMany({
      where: { active: true, organization: { verified: true, active: true } },
      include: { organization: true },
    }),
    prisma.organization.findMany({ where: { kind: "AGENCY", verified: true, active: true } }),
  ]);

  const rentalDocs: MeiliDoc[] = rentals.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: loc([r.city, r.state, r.country]),
    meta:
      r.rentPerYear != null
        ? `${formatMoney(r.rentPerYear, r.currencyCode)}/yr`
        : r.price != null
          ? `${formatMoney(r.price, r.currencyCode)}/night`
          : "",
    href: `/rentals/${r.id}`,
    body: clean([r.title, r.area, r.city, r.state, r.country, r.propertyType, r.bedroomType, r.description]),
  }));

  const listingDocs: MeiliDoc[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    subtitle: l.location,
    meta: formatNaira(l.price),
    href: `/listings`,
    body: clean([l.title, l.location, l.category, l.propertyClass, l.description]),
  }));

  const serviceDocs: MeiliDoc[] = services.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: `${s.category} · ${s.organization.name}`,
    meta: s.priceFrom != null ? `from ${formatMoney(s.priceFrom, s.currencyCode)}` : "",
    href: `/property-services/${s.id}`,
    body: clean([s.title, s.category, s.city, s.state, s.organization.name, s.description]),
  }));

  const agencyDocs: MeiliDoc[] = agencies.map((a) => ({
    id: a.id,
    title: a.name,
    subtitle: loc([a.city, a.state, a.country]),
    meta: "",
    href: `/agencies/${a.slug}`,
    body: clean([a.name, a.city, a.state, a.country, a.description]),
  }));

  await replaceDocs("bf_rentals", rentalDocs);
  await replaceDocs("bf_listings", listingDocs);
  await replaceDocs("bf_services", serviceDocs);
  await replaceDocs("bf_agencies", agencyDocs);

  return {
    rentals: rentalDocs.length,
    listings: listingDocs.length,
    services: serviceDocs.length,
    agencies: agencyDocs.length,
  };
}

type MultiSearchResult = { results: { indexUid: string; hits: MeiliDoc[] }[] };

/** Query all indexes at once and return grouped hits (same shape as DB search). */
export async function meiliSearch(query: string, perGroup: number) {
  const body = {
    queries: INDEXES.map((i) => ({ indexUid: i.uid, q: query, limit: perGroup })),
  };
  const data = await meili<MultiSearchResult>("/multi-search", { method: "POST", body });
  const byUid = new Map(data.results.map((r) => [r.indexUid, r.hits]));

  return INDEXES.map((idx) => ({
    key: idx.key,
    label: idx.label,
    hits: (byUid.get(idx.uid) ?? []).map((h) => ({
      id: h.id,
      title: h.title,
      subtitle: h.subtitle,
      href: h.href,
      meta: h.meta || undefined,
    })),
  })).filter((g) => g.hits.length > 0);
}
