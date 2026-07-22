import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/currency";
import { ServiceRequestForm } from "@/components/services/ServiceRequestForm";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const s = await prisma.service.findUnique({ where: { id }, include: { organization: true } });
  if (!s) return {};
  return {
    title: `${s.title} — ${s.category}`,
    description: s.description ?? `${s.category} service by ${s.organization.name}.`,
    alternates: { canonical: new URL(`/property-services/${id}`, site.url).toString() },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await prisma.service.findUnique({ where: { id }, include: { organization: true } });
  if (!s || !s.active || !s.organization.verified || !s.organization.active) notFound();

  const loc = [s.city, s.state, s.country].filter(Boolean).join(", ");

  return (
    <Container className="py-8 sm:py-12">
      <nav className="mb-5 text-sm text-ink-muted">
        <Link href="/property-services" className="hover:text-brand-600">Property Services</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{s.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{s.category}</Badge>
            {s.organization.verified && <Badge tone="success">✓ Verified vendor</Badge>}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{s.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            by{" "}
            {s.organization.verified && s.organization.active ? (
              <Link href={`/agencies/${s.organization.slug}`} className="font-medium text-brand-600">
                {s.organization.name}
              </Link>
            ) : (
              s.organization.name
            )}
            {loc ? ` · ${loc}` : ""}
          </p>
          <p className="mt-4 text-xl font-extrabold text-brand-600">
            {s.priceFrom != null ? `From ${formatMoney(s.priceFrom, s.currencyCode)}` : "Price on request"}
          </p>

          {s.description && (
            <section className="mt-6 max-w-2xl">
              <h2 className="text-lg font-bold text-ink">About this service</h2>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.description}</p>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">Request this service</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Send your details — the vendor and Beta Facility will respond.
            </p>
            <div className="mt-4">
              <ServiceRequestForm serviceId={s.id} />
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
