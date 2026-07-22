import Link from "next/link";
import type { Service, ServiceRequest } from "@prisma/client";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { formatNaira } from "@/lib/utils";
import { formatMoney } from "@/lib/currency";
import { ORG_KIND_LABEL, orgLocation } from "@/lib/organizations";

function when(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export async function AgentDashboard({ email, name }: { email: string; name?: string | null }) {
  const [listings, org] = await Promise.all([
    prisma.advertiseSubmission.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findFirst({
      where: { userEmail: { equals: email, mode: "insensitive" } },
    }),
  ]);

  const isVendor = org?.kind === "VENDOR";

  // Vendor orgs manage services + incoming requests rather than property listings.
  const [services, serviceRequests] = isVendor
    ? await Promise.all([
        prisma.service.findMany({ where: { organizationId: org.id }, orderBy: { createdAt: "desc" } }),
        prisma.serviceRequest.findMany({ where: { vendorOrgId: org.id }, orderBy: { createdAt: "desc" }, take: 15 }),
      ])
    : [[] as Service[], [] as ServiceRequest[]];

  const approved = listings.filter((l) => l.status === "APPROVED").length;
  const pending = listings.filter((l) => l.status === "PENDING").length;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {org ? org.name : "Agent Portal"}
          </h1>
          <p className="text-sm text-ink-muted">Welcome{name ? `, ${name}` : ""} · {email}</p>
        </div>
        <SignOutButton />
      </div>

      {org && (
        <section className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{ORG_KIND_LABEL[org.kind] ?? "Partner"} profile</span>
              <Badge tone={org.verified ? "success" : "neutral"}>
                {org.verified ? "✓ Verified" : "Pending verification"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">{orgLocation(org) || "Location not set"}</p>
          </div>
          {org.verified && org.active && (
            <ButtonLink href={`/agencies/${org.slug}`} size="sm" variant="outline" className="ml-auto">
              View public page
            </ButtonLink>
          )}
        </section>
      )}

      {isVendor ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="My services" value={String(services.length)} />
            <Stat label="Active" value={String(services.filter((s) => s.active).length)} />
            <Stat label="Requests" value={String(serviceRequests.length)} />
          </div>

          <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Services are published by Beta Facility once your organization is verified. Contact an admin to add or
            edit your services.
          </p>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">My services</h2>
            {services.length === 0 ? (
              <p className="py-3 text-sm text-ink-muted">No services listed yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {services.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">
                        {s.title} <span className="text-ink-muted">· {s.category}</span>
                      </p>
                      <p className="text-xs text-ink-muted">
                        {[s.city, s.state, s.country].filter(Boolean).join(", ")}
                        {s.priceFrom != null ? ` · from ${formatMoney(s.priceFrom, s.currencyCode)}` : ""}
                      </p>
                    </div>
                    <Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Hidden"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">Recent service requests</h2>
            {serviceRequests.length === 0 ? (
              <p className="py-3 text-sm text-ink-muted">No requests yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {serviceRequests.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">
                        {r.name} <span className="text-ink-muted">· {r.category ?? "General"}</span>
                      </p>
                      <p className="text-xs text-ink-muted tabular">
                        {r.reference} · {r.email} · {r.phone} · {when(r.createdAt)}
                      </p>
                    </div>
                    <Badge tone={r.status === "RESOLVED" || r.status === "CLOSED" ? "success" : "info"}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Total listings" value={String(listings.length)} />
            <Stat label="Approved" value={String(approved)} />
            <Stat label="Pending review" value={String(pending)} />
          </div>

          <div className="mt-6">
            <ButtonLink href="/advertise" size="sm">+ Submit a new property</ButtonLink>
          </div>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">My submitted listings</h2>
            {listings.length === 0 ? (
              <p className="py-3 text-sm text-ink-muted">
                No listings yet. <Link href="/advertise" className="font-medium text-brand-600">Submit one →</Link>
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {listings.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{l.title}</p>
                      <p className="text-xs text-ink-muted tabular">
                        {l.reference} · {l.location} · {formatNaira(l.price)} · {when(l.createdAt)}
                      </p>
                    </div>
                    <Badge tone={l.status === "APPROVED" ? "success" : l.status === "REJECTED" ? "neutral" : "brand"}>
                      {l.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
      <p className="text-3xl font-extrabold text-brand-600">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
