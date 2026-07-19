import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { PropertiesExplorer } from "@/components/property/PropertiesExplorer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Managed Properties Portfolio",
  description:
    "Explore our curated collection of premium residential and commercial properties currently under BetaFacility Managers' professional management.",
  path: "/properties",
});

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Managed Properties Portfolio"
        subtitle="Explore our curated collection of premium residential and commercial properties currently under our professional management."
      />
      <Container className="py-12 sm:py-16">
        <PropertiesExplorer />
      </Container>
    </>
  );
}
