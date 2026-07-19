import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with BetaFacility Managers for property management inquiries, facility maintenance requests, or general assistance.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="We're here to help"
        title="Contact Us"
        subtitle="Get in touch with our professional team for any property management inquiries or assistance."
      />

      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <InfoCard title="Email">
              <a href={`mailto:${site.emails.info}`} className="block hover:text-brand-600">
                {site.emails.info}
              </a>
              <a href={`mailto:${site.emails.support}`} className="block hover:text-brand-600">
                {site.emails.support}
              </a>
            </InfoCard>

            <InfoCard title="Phone">
              <a href={site.phoneHref} className="hover:text-brand-600">
                {site.phone}
              </a>
            </InfoCard>

            <InfoCard title="Address">
              <p>{site.address.street}</p>
              <p>
                {site.address.city}, {site.address.country}
              </p>
            </InfoCard>

            <InfoCard title="Office Hours">
              <dl className="space-y-1">
                {site.hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-6">
                    <dt>{h.day}</dt>
                    <dd className="font-medium text-ink">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </InfoCard>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-xl font-bold text-ink">Send us a message</h2>
            <p className="mt-1 text-sm text-ink-muted">
              We typically respond within one business day.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
      <h3 className="text-sm font-bold uppercase tracking-wider text-brand-600">{title}</h3>
      <div className="mt-2 space-y-1 text-ink-soft">{children}</div>
    </div>
  );
}
