import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { FacilityTabs } from "@/components/forms/FacilityTabs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Facility Management",
  description:
    "Report a facility issue or book a maintenance service with BetaFacility Managers. Fast response with clear SLA commitments.",
  path: "/facility-management",
});

export default function FacilityManagementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Facility Management"
        title="Report an issue or book a maintenance service"
        subtitle="Our team responds fast with clear SLA commitments and keeps you updated every step of the way."
      />
      <Container className="py-12 sm:py-16">
        <FacilityTabs />
      </Container>
    </>
  );
}
