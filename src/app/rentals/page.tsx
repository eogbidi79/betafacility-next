import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { RentalsBrowser } from "@/components/property/RentalsBrowser";
import { prisma } from "@/lib/db";
import { toDTO } from "@/lib/listings";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Short-let & Long-Term Rentals",
  description:
    "Browse short-let and long-term rentals across Nigeria with BetaFacility Managers — filter by state, city, rental type, bedrooms and availability.",
  path: "/rentals",
});

export default async function RentalsPage() {
  const rows = await prisma.rentalListing.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { rentalCategory: "asc" }, { createdAt: "asc" }],
  });
  const listings = rows.map(toDTO);

  return (
    <>
      <PageHeader
        eyebrow="Beta Facility Rental"
        title="Short-let & Long-Term Rentals"
        subtitle="Browse rentals across Nigeria — filter by state, city, rental type, bedrooms and availability, and find them on the map."
      />
      <Container className="py-12 sm:py-16">
        <RentalsBrowser listings={listings} />
      </Container>
    </>
  );
}
