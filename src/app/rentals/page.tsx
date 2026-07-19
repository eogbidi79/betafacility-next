import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { RentalsExplorer } from "@/components/property/RentalsExplorer";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Rentals — Shortlet & Long-Term Homes in Ogombo, Ajah",
  description:
    "Search short-let and long-term serviced apartments in Ogombo, Ajah. Book online, pay securely, e-sign and get an instant receipt.",
  path: "/rentals",
});

export default function RentalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Beta Facility Rental"
        title="Short-let & long-term homes in Ogombo, Ajah"
        subtitle="Search, book, pay online, e-sign and get an instant receipt."
      />
      <Container className="py-12 sm:py-16">
        <RentalsExplorer />
      </Container>
    </>
  );
}
