import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { canManage } from "@/lib/rbac";
import { COUNTRIES, regionsOf, citiesOf } from "@/data/locations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Locations", robots: { index: false } };

export default async function LocationsPage() {
  const role = (await auth())?.user?.role;
  if (!canManage(role)) redirect("/portal");

  const summary = COUNTRIES.map((c) => {
    const regions = regionsOf(c.name);
    const cities = regions.reduce((n, r) => n + citiesOf(c.name, r).length, 0);
    return { ...c, regionCount: regions.length, cityCount: cities, regions };
  });

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink">Locations</h1>
      <p className="text-sm text-ink-muted">
        Countries, regions and cities available across the platform (reference data).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {summary.map((c) => (
          <section key={c.code} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">{c.name}</h2>
                <p className="text-xs text-ink-muted">
                  {c.code} · {c.currency} · {c.regionLabel}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-ink">{c.regionCount} regions</p>
                <p className="text-ink-muted">{c.cityCount} cities</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {c.regions.map((r) => (
                <Badge key={r} tone="neutral">
                  {r} · {citiesOf(c.name, r).length}
                </Badge>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        Locations are defined in <code className="rounded bg-gray-100 px-1.5 py-0.5">src/data/locations.ts</code>.
        Editing them in-app is planned; for now they are managed in code.
      </p>
    </Container>
  );
}
