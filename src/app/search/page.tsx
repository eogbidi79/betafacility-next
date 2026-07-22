import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { SearchBox } from "@/components/search/SearchBox";
import { searchAll, totalHits } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Search",
  description: "Search rentals, marketplace listings, property services and agencies on BetaFacility Managers.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const groups = query.length >= 2 ? await searchAll(query) : [];
  const count = totalHits(groups);

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search"}
        subtitle="Find rentals, listings, property services and agencies in one place."
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl">
          <Suspense fallback={null}>
            <SearchBox autoFocus />
          </Suspense>
        </div>

        {query.length < 2 ? (
          <p className="mt-10 text-center text-ink-muted">Type at least 2 characters to search.</p>
        ) : count === 0 ? (
          <p className="mt-10 text-center text-ink-muted">
            No matches for “{query}”. Try a place, property type, or service.
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            <p className="text-sm text-ink-muted">
              {count} result{count === 1 ? "" : "s"}
            </p>
            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="text-lg font-bold text-ink">{g.label}</h2>
                <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white shadow-card">
                  {g.hits.map((h) => (
                    <li key={`${g.key}-${h.id}`}>
                      <Link
                        href={h.href}
                        className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-gray-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{h.title}</p>
                          {h.subtitle && <p className="truncate text-sm text-ink-muted">{h.subtitle}</p>}
                        </div>
                        {h.meta && (
                          <span className="flex-shrink-0 text-sm font-semibold text-brand-600">{h.meta}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
