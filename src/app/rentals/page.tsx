import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { RentalsBrowser } from "@/components/property/RentalsBrowser";
import { getRentalsFirstPage } from "@/lib/property-search";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Short-let & Long-Term Rentals",
  description:
    "Browse short-let and long-term rentals across Nigeria and Canada with BetaFacility Managers — filter by country, state, city, rental type, bedrooms and availability.",
  path: "/rentals",
});

export default async function RentalsPage() {
  // SSR the first page (indexed, paginated, edge-cached); the browser fetches
  // /api/properties as filters or the page change.
  const initial = await getRentalsFirstPage();

  return (
    <>
      <PageHeader
        eyebrow="Beta Facility Rental"
        title="Short-let & Long-Term Rentals"
        subtitle="Browse rentals across Nigeria and Canada — filter by country, state, city, rental type, bedrooms and availability, and find them on the map."
      />
      <Container className="py-12 sm:py-16">
        <RentalsBrowser initial={initial} />
      </Container>
    </>
  );
}
