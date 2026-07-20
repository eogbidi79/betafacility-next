import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { PropertiesExplorer } from "@/components/property/PropertiesExplorer";
import {
  coverage,
  totalUnits,
  portfolioStats,
  rentalBreakdown,
  facilityTeam,
  assurances,
  reviews,
} from "@/data/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Managed Properties Portfolio",
  description:
    "Explore the properties and operations BetaFacility Managers oversees — units by location, maintenance and inspections, rental performance, guest reviews and our facility team.",
  path: "/properties",
});

function Stars({ n }: { n: number }) {
  return (
    <span className="text-brand-500" aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span className="text-gray-300">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function PropertiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio & operations"
        title="Managed Properties Portfolio"
        subtitle="A transparent look at what we manage — our footprint, upkeep, rental performance and the team that keeps every property running."
      />

      {/* Coverage / footprint */}
      <Section>
        <SectionHeading
          eyebrow="Our footprint"
          title="Units under management"
          subtitle="Managing across Nigeria, with expansion underway."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-ink p-6 text-white shadow-card">
            <p className="text-sm text-white/70">Total units managed</p>
            <p className="mt-2 text-5xl font-extrabold text-brand-400">{totalUnits}</p>
            <p className="mt-1 text-sm text-white/60">across {coverage.length} locations</p>
          </div>
          {coverage.map((c) => (
            <div key={c.country} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-ink">{c.country}</h3>
                <Badge tone={c.status === "Active" ? "success" : "neutral"}>{c.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-muted">{c.region}</p>
              <p className="mt-4 text-3xl font-extrabold text-brand-600">{c.units}</p>
              <p className="text-xs text-ink-muted">units</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Operational stats */}
      <Section className="bg-gray-50">
        <SectionHeading
          eyebrow="By the numbers"
          title="Operational performance"
          subtitle="Maintenance, inspections and responsiveness across the portfolio."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioStats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
              <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-ink">{s.label}</p>
              {s.hint && <p className="mt-0.5 text-xs text-ink-muted">{s.hint}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* Rental performance */}
      <Section>
        <SectionHeading eyebrow="Rental performance" title="Short-stay & long-stay" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              rentalBreakdown.short,
              rentalBreakdown.long,
              rentalBreakdown.onTimeRent,
              rentalBreakdown.avgStay,
            ] as { label: string; value: string; note?: string }[]
          ).map((r) => (
            <div key={r.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <p className="text-3xl font-extrabold text-ink">{r.value}</p>
              <p className="mt-1 text-sm font-medium text-ink-soft">{r.label}</p>
              {r.note && <p className="mt-1 text-xs text-ink-muted">{r.note}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* Facility team */}
      <Section className="bg-gray-50">
        <SectionHeading
          eyebrow="Our facility team"
          title="Skilled trades on call"
          subtitle="Dedicated professionals keeping every property safe, powered and well-maintained."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facilityTeam.map((t) => (
            <div
              key={t.role}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-card"
            >
              <div>
                <p className="font-semibold text-ink">{t.role}</p>
                {t.note && <p className="text-xs text-ink-muted">{t.note}</p>}
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                {t.count}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Assurances */}
      <Section>
        <SectionHeading eyebrow="What owners & guests can count on" title="Standards & assurances" />
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {assurances.map((a) => (
            <div key={a.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <h3 className="font-bold text-ink">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section className="bg-gray-50">
        <SectionHeading eyebrow="What guests say" title="Short-stay reviews" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
              <Stars n={r.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-ink-soft">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-sm font-semibold text-ink">{r.name}</p>
                <p className="text-xs text-ink-muted">{r.stay}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* Managed properties */}
      <Section>
        <SectionHeading
          eyebrow="The portfolio"
          title="Properties under our management"
          subtitle="Explore our curated collection of residential and commercial properties."
        />
        <div className="mt-8">
          <PropertiesExplorer />
        </div>
      </Section>
    </>
  );
}
