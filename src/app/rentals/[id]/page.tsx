import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { toDTO, galleryPhotos } from "@/lib/listings";
import { formatMoney } from "@/lib/currency";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Gallery } from "@/components/property/Gallery";
import { MapEmbed } from "@/components/property/MapEmbed";
import { RentalListingCard } from "@/components/property/RentalListingCard";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const l = await prisma.rentalListing.findUnique({ where: { id } });
  if (!l) return {};
  const loc = [l.city, l.state, l.country].filter(Boolean).join(", ");
  const price = l.rentPerYear ?? l.price;
  return {
    title: `${l.title} — ${loc}`,
    description: `${l.rentalCategory} ${l.propertyType} in ${loc}. ${
      price ? formatMoney(price, l.currencyCode) : "Price on request"
    }. Listed by ${l.listedBy}.`,
    alternates: { canonical: new URL(`/rentals/${id}`, site.url).toString() },
  };
}

function statusTone(status: string): "success" | "brand" | "neutral" {
  if (status === "Available") return "success";
  if (status === "Coming Soon") return "brand";
  return "neutral";
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await prisma.rentalListing.findUnique({ where: { id } });
  if (!row || !row.active) notFound();
  const listing = toDTO(row);

  const similarRows = await prisma.rentalListing.findMany({
    where: {
      active: true,
      id: { not: id },
      country: listing.country,
      OR: [{ rentalCategory: listing.rentalCategory }, { bedroomType: listing.bedroomType }],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const similar = similarRows.map(toDTO);

  const priceText =
    listing.rentPerYear != null
      ? `${formatMoney(listing.rentPerYear, listing.currencyCode)} per year`
      : listing.price != null
        ? `${formatMoney(listing.price, listing.currencyCode)} per night`
        : "Price on request";

  const facts: [string, string][] = [
    ["Rental type", listing.rentalCategory],
    ["Property type", listing.propertyType],
    ["Bedrooms", listing.bedroomType],
    ["Bathrooms", listing.bathrooms != null ? String(listing.bathrooms) : "—"],
    ["Available units", `${listing.availableUnits} of ${listing.totalUnits}`],
    ["Furnished", listing.furnished ? "Yes" : "No"],
    ["Parking", listing.parking ? "Yes" : "No"],
    ["Pet friendly", listing.petFriendly ? "Yes" : "No"],
  ];

  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-5 text-sm text-ink-muted">
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{listing.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Gallery photos={galleryPhotos(listing.photos)} title={listing.title} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="flex flex-wrap gap-2">
              <Badge tone={statusTone(listing.status)}>{listing.status}</Badge>
              <Badge tone="brand">{listing.rentalCategory}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-ink">{listing.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {[listing.area, listing.city, listing.state, listing.country].filter(Boolean).join(", ")}
            </p>
            <p className="mt-4 text-2xl font-extrabold text-brand-600">{priceText}</p>

            <div className="mt-5 space-y-2">
              <ButtonLink href={`/contact?ref=${listing.id}`} size="lg" fullWidth>
                Enquire about this property
              </ButtonLink>
              <ButtonLink href={site.phoneHref} size="lg" variant="outline" fullWidth>
                Call {site.phone}
              </ButtonLink>
            </div>
            <p className="mt-3 text-center text-xs text-ink-muted">Listed by: {listing.listedBy}</p>
          </div>
        </aside>
      </div>

      {/* Facts */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Property details</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-gray-200 bg-white p-3">
              <dt className="text-xs text-ink-muted">{k}</dt>
              <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {listing.description && (
        <section className="mt-8 max-w-3xl">
          <h2 className="text-lg font-bold text-ink">Description</h2>
          <p className="mt-2 leading-relaxed text-ink-soft">{listing.description}</p>
        </section>
      )}

      {listing.amenities.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <span key={a} className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-ink-soft">
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Location</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {listing.address ? `${listing.address} · ` : ""}
          {[listing.area, listing.city, listing.state, listing.country].filter(Boolean).join(", ")}
        </p>
        <div className="mt-4 h-72 overflow-hidden rounded-2xl border border-gray-200 shadow-card">
          <MapEmbed listings={[listing]} />
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-ink">Similar properties</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <RentalListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
