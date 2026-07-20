import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { RentalsExplorer } from "@/components/property/RentalsExplorer";
import { ListingCard } from "@/components/property/ListingCard";
import { SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Rentals — Shortlet & Long-Term Homes in Ogombo, Ajah",
  description:
    "Search short-let and long-term serviced apartments in Ogombo, Ajah. Book online, pay securely, e-sign and get an instant receipt.",
  path: "/rentals",
});

export default async function RentalsPage() {
  const rentalListings = await prisma.advertiseSubmission.findMany({
    where: { status: "APPROVED", transactionType: "RENT" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <>
      <PageHeader
        eyebrow="Beta Facility Rental"
        title="Short-let & long-term homes in Ogombo, Ajah"
        subtitle="Search, book, pay online, e-sign and get an instant receipt."
      />
      <Container className="py-12 sm:py-16">
        <RentalsExplorer />

        {rentalListings.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Advertised by agents & landlords"
                title="More rentals available"
                subtitle="Properties advertised for rent through BetaFacility Managers."
              />
              <ButtonLink href="/listings?type=RENT" variant="outline">
                View all rental listings
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rentalListings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  );
}
