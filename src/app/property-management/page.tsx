import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { PropertyManagementForm } from "@/components/forms/PropertyManagementForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Property Management for Owners & Investors",
  description:
    "Hand your property to Beta Facility. Tenant sourcing, rent collection, maintenance and reporting across Nigeria and Canada — including full diaspora management.",
  path: "/property-management",
});

const BENEFITS = [
  {
    title: "Tenant sourcing & screening",
    body: "We market your property, vet applicants and handle tenancy agreements end-to-end.",
  },
  {
    title: "Rent collection & reporting",
    body: "Reliable collection, clear statements and on-time remittance — visible in your portal.",
  },
  {
    title: "Maintenance & facilities",
    body: "Vetted vendors for electrical, plumbing, cleaning, security and CCTV, with SLA-backed response.",
  },
  {
    title: "Diaspora & remote owners",
    body: "Own from abroad with confidence — we're your eyes and hands on the ground in Nigeria and Canada.",
  },
  {
    title: "Short-let management",
    body: "Turn idle units into income — listings, guest handling, cleaning and payouts, fully managed.",
  },
  {
    title: "Compliance & inspections",
    body: "Routine inspections and documentation keep your asset protected and its value growing.",
  },
];

const STEPS = [
  { n: "1", title: "Tell us about your property", body: "Share your property and goals using the form below." },
  { n: "2", title: "Get a management proposal", body: "We assess and send tailored terms and pricing." },
  { n: "3", title: "We take it from here", body: "Onboarding, tenants, upkeep and reporting — all handled." },
];

export default function PropertyManagementPage() {
  return (
    <>
      <PageHeader
        eyebrow="For owners & investors"
        title="Professional management for your property"
        subtitle="Maximise returns and protect your asset. We handle tenants, rent, maintenance and reporting — across Nigeria and Canada, including full diaspora management."
      />

      <Section>
        <SectionHeading
          center
          eyebrow="What we handle"
          title="End-to-end property management"
          subtitle="One partner for everything your property needs."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <h3 className="text-lg font-bold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{b.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-gray-50">
        <SectionHeading center eyebrow="How it works" title="Three simple steps" />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-card">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-lg font-extrabold text-white">
                {s.n}
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="lead">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            center
            eyebrow="Get started"
            title="Request a management proposal"
            subtitle="Tell us about your property — we'll get back to you with tailored terms."
          />
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
            <PropertyManagementForm />
          </div>
        </div>
      </Section>
    </>
  );
}
