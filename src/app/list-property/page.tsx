import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { AdvertiseForm } from "@/components/forms/AdvertiseForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "List Your Property",
  description:
    "Landlords, agents and property owners — list your residential or commercial property with BetaFacility Managers and reach thousands of renters.",
  path: "/list-property",
});

export default function ListPropertyPage() {
  return (
    <>
      <PageHeader
        eyebrow="For landlords & agents"
        title="Advertise Your Property"
        subtitle="Landlords, agents and property owners — list your residential or commercial property and reach thousands of renters."
      />
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
          <AdvertiseForm />
        </div>
      </Container>
    </>
  );
}
