import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section, SectionHeading } from "@/components/ui/Section";
import { CTABand } from "@/components/home/CTABand";
import { formatNumber } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "BetaFacility Managers Limited is a Lagos-based property management and facility services company protecting and growing real estate value in Ogombo, Ajah.",
  path: "/about",
});

const stats = [
  { value: 2847, suffix: "", label: "Properties Managed" },
  { value: 98.5, suffix: "%", label: "Client Retention" },
  { value: 24, suffix: "/7", label: "Facility Support" },
];

const values = [
  {
    title: "Professional management",
    body: "Years of experience in the Nigerian property market, delivering reliable, transparent service to landlords and tenants alike.",
  },
  {
    title: "Fast, accountable maintenance",
    body: "Clear SLA commitments and a dedicated team so every issue is resolved quickly and communicated openly.",
  },
  {
    title: "Value-driven",
    body: "We protect your investment and maximize its value — from tenancy and compliance to upkeep and returns.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Your trusted partner in property & facility management"
        subtitle="Protecting your investment and maximizing operational efficiency across Ogombo, Ajah and greater Lagos."
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="Who we are"
              subtitle="BetaFacility Managers Limited provides professional property management and facility services you can rely on."
            />
            <p className="mt-4 text-ink-soft">
              Our team of dedicated professionals ensures every property under our care receives the
              attention it deserves. From tenant relations and rent collection to maintenance,
              compliance and reporting, we handle the details so owners enjoy the returns.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
                  <dd className="text-2xl font-extrabold text-brand-600">
                    {formatNumber(s.value)}
                    {s.suffix}
                  </dd>
                  <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card-hover">
            <Image
              src="/images/prop-1.jpg"
              alt="Managed residential property in Ogombo, Ajah"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <Section className="bg-gray-50">
        <SectionHeading center eyebrow="What we stand for" title="Our values" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <h3 className="text-lg font-bold text-ink">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTABand />
    </>
  );
}
