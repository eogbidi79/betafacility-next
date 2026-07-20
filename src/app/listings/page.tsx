import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ListingCard } from "@/components/property/ListingCard";
import { cn } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Property Listings — For Rent, Sale & Buy Requests",
  description:
    "Browse properties for rent and for sale, and buy requests, advertised through BetaFacility Managers in Lagos.",
  path: "/listings",
});

const TABS = [
  { key: "ALL", label: "All" },
  { key: "RENT", label: "For Rent" },
  { key: "SELL", label: "For Sale" },
  { key: "BUY", label: "Wanted to Buy" },
] as const;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const active = TABS.some((t) => t.key === type) ? (type as string) : "ALL";

  const listings = await prisma.advertiseSubmission.findMany({
    where: {
      status: "APPROVED",
      ...(active !== "ALL" ? { transactionType: active } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Marketplace"
        title="Property Listings"
        subtitle="Approved properties advertised through BetaFacility Managers — for rent, for sale, and buy requests."
      />
      <Container className="py-10 sm:py-14">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "ALL" ? "/listings" : `/listings?type=${t.key}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active === t.key
                  ? "bg-brand-500 text-white"
                  : "border border-gray-200 bg-white text-ink-soft hover:border-ink",
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {listings.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-ink-muted">No listings here yet. Check back soon.</p>
            <Link href="/advertise" className="mt-2 inline-block font-medium text-brand-600">
              Advertise your property →
            </Link>
          </div>
        )}
      </Container>
    </>
  );
}
