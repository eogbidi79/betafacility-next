import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { orgLocation, ORG_KIND_LABEL } from "@/lib/organizations";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Agencies & Property Partners",
  description:
    "Verified real estate agencies and property partners on BetaFacility Managers across Nigeria and Canada.",
  path: "/agencies",
});

export default async function AgenciesPage() {
  const [orgs, approved] = await Promise.all([
    prisma.organization.findMany({
      where: { kind: "AGENCY", verified: true, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.advertiseSubmission.findMany({
      where: { status: "APPROVED" },
      select: { email: true },
    }),
  ]);

  // Count approved listings per contact email.
  const counts = new Map<string, number>();
  for (const a of approved) {
    const key = a.email.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const listingCount = (org: (typeof orgs)[number]) =>
    [org.email, org.userEmail]
      .filter(Boolean)
      .reduce((n, e) => n + (counts.get(String(e).toLowerCase()) ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Our partners"
        title="Agencies & Property Partners"
        subtitle="Verified real estate agencies working with BetaFacility Managers across Nigeria and Canada."
      />
      <Container className="py-10 sm:py-14">
        {orgs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Link
                key={org.id}
                href={`/agencies/${org.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-lg font-extrabold text-brand-600">
                    {org.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={org.logoUrl} alt={org.name} className="h-full w-full object-cover" />
                    ) : (
                      org.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-ink group-hover:text-brand-600">{org.name}</h3>
                    <p className="truncate text-sm text-ink-muted">{orgLocation(org)}</p>
                  </div>
                </div>
                {org.description && (
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-ink-soft">{org.description}</p>
                )}
                <div className="mt-4 flex items-center gap-2 pt-1">
                  <Badge tone="success">✓ Verified {ORG_KIND_LABEL[org.kind] ?? "Partner"}</Badge>
                  <span className="ml-auto text-sm font-medium text-ink-muted">
                    {listingCount(org)} listing{listingCount(org) === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-ink-muted">No agencies listed yet. Check back soon.</p>
            <Link href="/advertise" className="mt-2 inline-block font-medium text-brand-600">
              Partner with us →
            </Link>
          </div>
        )}
      </Container>
    </>
  );
}
