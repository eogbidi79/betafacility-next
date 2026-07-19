import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { RentTenancyButton } from "@/components/booking/RentTenancyButton";
import { properties } from "@/data/properties";
import { site } from "@/data/site";
import { formatNaira } from "@/lib/utils";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);
  if (!property) return {};
  const title = `${property.title} — ${property.location}`;
  const description = `${property.title} in ${property.address}. ${property.beds} beds, ${property.baths} baths. ${formatNaira(property.pricePerYear)} per year.`;
  const url = new URL(`/properties/${slug}`, site.url).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: property.image }],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = properties.find((p) => p.slug === slug);
  if (!property) notFound();

  const facts = [
    { label: "Bedrooms", value: property.beds },
    { label: "Bathrooms", value: property.baths },
    { label: "Toilets", value: property.toilets },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    address: property.address,
    url: new URL(`/properties/${slug}`, site.url).toString(),
    image: new URL(property.image, site.url).toString(),
  };

  return (
    <Container className="py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6 text-sm text-ink-muted">
        <Link href="/properties" className="hover:text-brand-600">
          Portfolio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{property.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card">
          <Image
            src={property.image}
            alt={property.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          <div className="absolute left-4 top-4">
            <Badge tone="brand">{property.tier}</Badge>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{property.title}</h1>
          <p className="mt-2 text-ink-muted">{property.address}</p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-3xl font-bold text-brand-600">
              {formatNaira(property.pricePerYear)}
            </span>
            <span className="pb-1 text-sm uppercase tracking-wide text-ink-muted">per year</span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-card">
                <dd className="text-2xl font-bold text-ink">{f.value}</dd>
                <dt className="mt-1 text-xs text-ink-muted">{f.label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 space-y-3">
            <RentTenancyButton
              slug={property.slug}
              title={property.title}
              pricePerYear={property.pricePerYear}
            />
            <ButtonLink href="/contact" size="lg" variant="outline" fullWidth>
              Inquire About This Property
            </ButtonLink>
            <ButtonLink href={site.phoneHref} size="lg" variant="ghost" fullWidth>
              Call {site.phone}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Container>
  );
}
