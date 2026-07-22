import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ServicesBrowser, type ServiceCardData } from "@/components/services/ServicesBrowser";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Property Services — Trusted Vendors",
  description:
    "Book vetted property service vendors — electrical, plumbing, cleaning, security, CCTV and more — across Nigeria and Canada.",
  path: "/property-services",
});

export default async function PropertyServicesPage() {
  const rows = await prisma.service.findMany({
    where: { active: true, organization: { verified: true, active: true } },
    orderBy: { createdAt: "desc" },
    include: { organization: true },
  });

  const services: ServiceCardData[] = rows.map((s) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    description: s.description,
    country: s.country,
    state: s.state,
    city: s.city,
    priceFrom: s.priceFrom,
    currencyCode: s.currencyCode,
    vendorName: s.organization.name,
    vendorVerified: s.organization.verified,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Marketplace"
        title="Property Services"
        subtitle="Vetted vendors for electrical, plumbing, cleaning, security, CCTV and more — across Nigeria and Canada."
      />
      <Container className="py-10 sm:py-14">
        <ServicesBrowser services={services} />
      </Container>
    </>
  );
}
