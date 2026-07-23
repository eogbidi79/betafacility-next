import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatMoney } from "@/lib/currency";
import { COUNTRY_NAMES, CURRENCIES } from "@/data/locations";
import { canManage, isCountryAdmin } from "@/lib/rbac";
import { SERVICE_CATEGORIES } from "@/data/services";
import {
  createService,
  setServiceActive,
  deleteService,
  setServiceRequestStatus,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Services", robots: { index: false } };

const REQ_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function ServicesAdminPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManage(role)) redirect("/portal");

  const countryScope = isCountryAdmin(role) && session?.user?.country ? session.user.country : null;

  const [vendors, services] = await Promise.all([
    prisma.organization.findMany({
      where: { kind: "VENDOR", ...(countryScope ? { country: countryScope } : {}) },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: countryScope ? { country: countryScope } : {},
      orderBy: { createdAt: "desc" },
      include: { organization: true },
    }),
  ]);

  // Requests scoped to this country's services (ServiceRequest has no relation).
  const requests = await prisma.serviceRequest.findMany({
    where: countryScope ? { serviceId: { in: services.map((s) => s.id) } } : {},
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Services</h1>
          <p className="text-sm text-ink-muted">
            Vendor services shown in the Property Services marketplace, and incoming requests.
          </p>
        </div>
        <ButtonLink href="/portal" variant="outline" size="sm">
          ← Back to portal
        </ButtonLink>
      </div>

      {vendors.length === 0 && (
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No vendor organizations yet. Create one under{" "}
          <a href="/portal/organizations" className="font-semibold underline">
            Organizations
          </a>{" "}
          (type “Service Vendor”) before adding services.
        </p>
      )}

      {/* Create service */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Add a service</h2>
        <form action={createService} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Vendor" htmlFor="organizationId" required>
            <Select id="organizationId" name="organizationId" required defaultValue="" disabled={vendors.length === 0}>
              <option value="" disabled>
                Select a vendor
              </option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.verified ? "" : " (unverified)"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" htmlFor="category" required>
            <Select id="category" name="category" defaultValue={SERVICE_CATEGORIES[0]}>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Title" htmlFor="title" required>
            <Input id="title" name="title" required placeholder="Emergency electrical repairs" />
          </Field>
          <Field label="Country" htmlFor="country">
            <Select id="country" name="country" defaultValue="Nigeria">
              {COUNTRY_NAMES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="State / Province" htmlFor="state">
            <Input id="state" name="state" placeholder="Lagos" />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" placeholder="Ajah" />
          </Field>
          <Field label="Price from" htmlFor="priceFrom">
            <Input id="priceFrom" name="priceFrom" type="number" inputMode="numeric" placeholder="Optional" />
          </Field>
          <Field label="Currency" htmlFor="currencyCode">
            <Select id="currencyCode" name="currencyCode" defaultValue="NGN">
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2 lg:col-span-3">
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="What the service covers."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={vendors.length === 0}
              className="h-[42px] rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-40"
            >
              Add service
            </button>
          </div>
        </form>
      </section>

      {/* Services list */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Services ({services.length})</h2>
        {services.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">Nothing yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {services.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-[220px]">
                  <p className="font-medium text-ink">
                    {s.title} <span className="text-ink-muted">· {s.category}</span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {s.organization.name} ·{" "}
                    {[s.city, s.state, s.country].filter(Boolean).join(", ")}
                    {s.priceFrom != null ? ` · from ${formatMoney(s.priceFrom, s.currencyCode)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Hidden"}</Badge>
                  <form action={setServiceActive}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={String(!s.active)} />
                    <button className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-ink">
                      {s.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Requests */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Service requests ({requests.length})</h2>
        {requests.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">Nothing yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-[220px]">
                  <p className="font-medium text-ink">
                    {r.name} <span className="text-ink-muted">· {r.category ?? "General"}</span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {r.reference} · {r.email} · {r.phone}
                    {r.location ? ` · ${r.location}` : ""} · {since(r.createdAt)}
                  </p>
                  {r.message && <p className="mt-1 line-clamp-2 text-ink-soft">{r.message}</p>}
                </div>
                <form action={setServiceRequestStatus} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-ink"
                  >
                    {REQ_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-ink-soft">
                    Save
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
