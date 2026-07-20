import { Hero } from "@/components/home/Hero";
import { RentCalculator } from "@/components/home/RentCalculator";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CTABand } from "@/components/home/CTABand";
import { Section, SectionHeading } from "@/components/ui/Section";
import { RentalCard } from "@/components/property/RentalCard";
import { ListingCard } from "@/components/property/ListingCard";
import { ButtonLink } from "@/components/ui/Button";
import { rentals } from "@/data/rentals";
import { prisma } from "@/lib/db";

// Rendered per request so newly approved listings appear immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await prisma.advertiseSubmission.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

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

      <Section className="bg-gray-50">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Short-let"
            title="Available serviced apartments"
            subtitle="Book a fully furnished home in Ogombo, Ajah — pay online, e-sign and get an instant receipt."
          />
          <ButtonLink href="/rentals" variant="outline">
            View all rentals
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => (
            <RentalCard key={rental.slug} rental={rental} />
          ))}
        </div>
      </Section>

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
