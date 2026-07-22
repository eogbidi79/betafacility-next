import { Hero } from "@/components/home/Hero";
import { RentCalculator } from "@/components/home/RentCalculator";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CTABand } from "@/components/home/CTABand";
import { Section, SectionHeading } from "@/components/ui/Section";
import { RentalListingCard } from "@/components/property/RentalListingCard";
import { ListingCard } from "@/components/property/ListingCard";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { toDTO } from "@/lib/listings";

// Rendered per request so newly approved listings appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rentalRows, listings] = await Promise.all([
    prisma.rentalListing.findMany({ where: { active: true }, orderBy: { createdAt: "asc" }, take: 3 }),
    prisma.advertiseSubmission.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);
  const featuredRentals = rentalRows.map(toDTO);

  return (
    <>
      <Hero />

      <Section className="bg-gray-50">
        <SectionHeading
          eyebrow="Transparent pricing"
          title="Calculate Your Rental Costs"
          subtitle="Use our transparent calculator to understand the complete breakdown of fees associated with your new home."
        />
        <div className="mt-10">
          <RentCalculator />
        </div>
      </Section>

      <Section>
        <WhyChooseUs />
      </Section>

      {featuredRentals.length > 0 && (
        <Section className="bg-gray-50">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Rentals"
              title="Short-let & long-term rentals"
              subtitle="Serviced apartments and long-term homes in Ajah, Lagos — and across Nigeria."
            />
            <ButtonLink href="/rentals" variant="outline">
              View all rentals
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRentals.map((l) => (
              <RentalListingCard key={l.id} listing={l} />
            ))}
          </div>
        </Section>
      )}

      {listings.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Marketplace"
              title="Latest property listings"
              subtitle="Newly advertised properties for rent and sale, and buy requests."
            />
            <ButtonLink href="/listings" variant="outline">
              View all listings
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </Section>
      )}

      <CTABand />
    </>
  );
}
