import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ListingCard } from "@/components/property/ListingCard";
import { orgListings, orgLocation, ORG_KIND_LABEL } from "@/lib/organizations";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) return {};
  return {
    title: `${org.name} — ${orgLocation(org)}`,
    description: org.description ?? `${ORG_KIND_LABEL[org.kind] ?? "Partner"} on BetaFacility Managers.`,
    alternates: { canonical: new URL(`/agencies/${slug}`, site.url).toString() },
  };
}

export default async function AgencyProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org || !org.active || !org.verified) notFound();

  const listings = await orgListings(org);

  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-5 text-sm text-ink-muted">
        <Link href="/agencies" className="hover:text-brand-600">Agencies</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{org.name}</span>
      </nav>

      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-2xl font-extrabold text-brand-600">
            {org.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
            ) : (
              org.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{org.name}</h1>
              <Badge tone="success">✓ Verified {ORG_KIND_LABEL[org.kind] ?? "Partner"}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">{orgLocation(org)}</p>
            {org.regNumber && <p className="mt-1 text-xs text-ink-muted">Reg. No: {org.regNumber}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {org.phone && (
                <ButtonLink href={`tel:${org.phone}`} size="sm" variant="outline">
                  Call {org.phone}
                </ButtonLink>
              )}
              <ButtonLink href="/contact" size="sm">
                Enquire via Beta Facility
              </ButtonLink>
              {org.website && (
                <ButtonLink href={org.website} size="sm" variant="outline">
                  Website
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
        {org.description && (
          <p className="mt-6 max-w-3xl leading-relaxed text-ink-soft">{org.description}</p>
        )}
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">
          Listings by {org.name} ({listings.length})
        </h2>
        {listings.length > 0 ? (
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-ink-muted">
            No published listings from this partner yet.
          </p>
        )}
      </section>
    </Container>
  );
}
