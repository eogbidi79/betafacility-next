import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { TenantDashboard } from "@/components/portal/TenantDashboard";
import { AgentDashboard } from "@/components/portal/AgentDashboard";
import { formatNaira } from "@/lib/utils";
import { meiliEnabled } from "@/lib/meilisearch";
import { canManage, isSuperAdmin, isStaff, isCountryAdmin, isOrgMember, ROLE_LABELS } from "@/lib/rbac";
import { setListingStatus, setListingFeatured, setMaintenanceStatus, setTenancyStage, setLeadStatus, reindexSearch } from "./actions";

const MAINT_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

function stageTone(stage: string | null, status: string): "success" | "brand" | "neutral" | "info" {
  if (status === "SIGNED" || status === "PAID") return "success";
  if (stage === "ACCEPTED") return "info";
  if (stage === "REJECTED") return "neutral";
  return "brand";
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal", robots: { index: false } };

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function PortalPage() {
  const session = await auth();
  const role = session?.user?.role;
  const email = session?.user?.email ?? "";
  const name = session?.user?.name;

  // Role-specific portals.
  if (role === "TENANT") return <TenantDashboard email={email} name={name} />;
  if (isOrgMember(role)) return <AgentDashboard email={email} name={name} />;

  const superAdmin = isSuperAdmin(role);
  const canMgr = canManage(role); // super admin or country admin (can change records)
  const staffReadOnly = isStaff(role);
  const cc = isCountryAdmin(role) && session?.user?.country ? session.user.country : null;

  // Country-bearing entities are scoped to a country admin's country.
  const advertWhere = cc ? { country: cc } : {};
  const leadWhere = cc ? { country: cc } : {};
  // Bookings / contacts / maintenance carry no country — only global roles see them.
  const showGlobalOps = !cc;

  const [tenancyApps, bookings, contacts, maintenance, adverts, pmLeads, counts] = await Promise.all([
    showGlobalOps
      ? prisma.booking.findMany({ where: { term: "long-term" }, orderBy: { createdAt: "desc" }, take: 10 })
      : [],
    showGlobalOps
      ? prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { rental: true } })
      : [],
    showGlobalOps ? prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : [],
    showGlobalOps ? prisma.maintenanceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 8 }) : [],
    prisma.advertiseSubmission.findMany({ where: advertWhere, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.propertyManagementLead.findMany({ where: leadWhere, orderBy: { createdAt: "desc" }, take: 8 }),
    Promise.all([
      showGlobalOps ? prisma.booking.count() : Promise.resolve(0),
      showGlobalOps ? prisma.contactMessage.count() : Promise.resolve(0),
      showGlobalOps ? prisma.maintenanceRequest.count() : Promise.resolve(0),
      prisma.advertiseSubmission.count({ where: advertWhere }),
      prisma.organization.count({ where: cc ? { country: cc } : {} }),
      prisma.serviceRequest.count(),
      prisma.propertyManagementLead.count({ where: leadWhere }),
    ]),
  ]);

  const [bookingCount, contactCount, maintCount, advertCount, orgCount, serviceReqCount, pmLeadCount] = counts;
  const revenue = bookings.reduce((s, b) => (b.status !== "PENDING" ? s + b.amount : s), 0);

  const heading = superAdmin ? "Admin Portal" : cc ? "Country Admin Portal" : "Staff Portal";

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{heading}</h1>
          <p className="text-sm text-ink-muted">
            Signed in as {session?.user?.email}
            {role ? ` · ${ROLE_LABELS[role] ?? role}` : ""}
            {cc ? ` · ${cc}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ButtonLink href="/portal/report" size="sm" variant="outline">
            Status Report
          </ButtonLink>
          {canMgr && (
            <ButtonLink href="/portal/rentals" size="sm" variant="outline">
              Manage Rentals
            </ButtonLink>
          )}
          {canMgr && (
            <ButtonLink href="/portal/organizations" size="sm" variant="outline">
              Organizations
            </ButtonLink>
          )}
          {canMgr && (
            <ButtonLink href="/portal/services" size="sm" variant="outline">
              Services
            </ButtonLink>
          )}
          {superAdmin && (
            <ButtonLink href="/portal/users" size="sm" variant="outline">
              Manage Users
            </ButtonLink>
          )}
          {superAdmin && (
            <ButtonLink href="/portal/audit" size="sm" variant="outline">
              Audit Log
            </ButtonLink>
          )}
          {superAdmin && meiliEnabled() && (
            <form action={reindexSearch}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink hover:border-ink"
              >
                Reindex Search
              </button>
            </form>
          )}
          <SignOutButton />
        </div>
        {staffReadOnly && (
          <p className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            Read-only access — you can view records and generate reports. Contact an admin to make changes.
          </p>
        )}
        {cc && (
          <p className="w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-700">
            Country Admin — you manage listings, agencies, vendors and leads for {cc} only.
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Bookings" value={String(bookingCount)} />
        <Stat label="Contact messages" value={String(contactCount)} />
        <Stat label="Maintenance requests" value={String(maintCount)} />
        <Stat label="Listing submissions" value={String(advertCount)} />
        <Stat label="Organizations" value={String(orgCount)} />
        <Stat label="Service requests" value={String(serviceReqCount)} />
        <Stat label="Management leads" value={String(pmLeadCount)} />
      </div>

      <Panel title="Tenancy applications (1-year)">
        {tenancyApps.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-gray-100">
            {tenancyApps.map((t) => {
              const decided = t.status === "PAID" || t.status === "SIGNED" || t.stage === "REJECTED";
              return (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-[220px]">
                    <p className="font-medium text-ink">
                      {t.propertyTitle} <span className="text-ink-muted">· {t.guestName}</span>
                    </p>
                    <p className="text-xs text-ink-muted tabular">
                      {t.reference} · Guarantor: {t.guarantorName ?? "—"} · {formatNaira(t.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={t.guarantorConsent ? "success" : "neutral"}>
                      {t.guarantorConsent ? "Guarantor ✓" : "Guarantor pending"}
                    </Badge>
                    <Badge tone={stageTone(t.stage, t.status)}>
                      {t.status === "SIGNED"
                        ? "SIGNED"
                        : t.status === "PAID"
                          ? "PAID"
                          : t.stage ?? "APPLIED"}
                    </Badge>
                    {superAdmin && !decided && (
                      <div className="flex gap-1">
                        {t.stage !== "UNDER_REVIEW" && (
                          <StageBtn id={t.id} stage="UNDER_REVIEW" label="Start review" className="bg-ink text-white hover:bg-ink-soft" />
                        )}
                        <StageBtn id={t.id} stage="ACCEPTED" label="Accept" className="bg-green-600 text-white hover:bg-green-700" />
                        <StageBtn id={t.id} stage="REJECTED" label="Reject" className="border border-gray-300 text-ink-soft hover:border-ink" />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title="Property management leads">
        {pmLeads.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-gray-100">
            {pmLeads.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-[220px]">
                  <p className="font-medium text-ink">
                    {l.name}
                    {l.company ? <span className="text-ink-muted"> · {l.company}</span> : null}
                  </p>
                  <p className="text-xs text-ink-muted tabular">
                    {l.reference} · {l.email} · {l.phone} ·{" "}
                    {[l.city, l.country].filter(Boolean).join(", ")} · {since(l.createdAt)}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {[l.propertyType, l.units ? `${l.units} unit(s)` : null, l.services]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {canMgr ? (
                  <form action={setLeadStatus} className="flex items-center gap-1.5">
                    <input type="hidden" name="id" value={l.id} />
                    <select
                      name="status"
                      defaultValue={l.status}
                      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-ink"
                    >
                      {MAINT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-ink-soft">
                      Save
                    </button>
                  </form>
                ) : (
                  <Badge tone={l.status === "RESOLVED" || l.status === "CLOSED" ? "success" : "info"}>
                    {l.status.replace("_", " ")}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent bookings" hint={`Confirmed revenue (shown): ${formatNaira(revenue)}`}>
        {bookings.length === 0 ? (
          <Empty />
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">
                    {b.rental?.title ?? b.propertyTitle ?? "Booking"}{" "}
                    <span className="text-ink-muted">· {b.guestName}</span>
                    {b.term === "long-term" && (
                      <span className="ml-1 text-xs font-semibold text-brand-600">1-yr</span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted tabular">
                    {b.reference} · {since(b.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-ink">{formatNaira(b.amount)}</span>
                  <Badge tone={b.status === "PENDING" ? "neutral" : "success"}>{b.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Contact messages">
          {contacts.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-gray-100">
              {contacts.map((c) => (
                <li key={c.id} className="py-3 text-sm">
                  <p className="font-medium text-ink">{c.name} · <span className="text-ink-muted">{c.inquiryType}</span></p>
                  <p className="text-xs text-ink-muted">{c.email} · {since(c.createdAt)}</p>
                  <p className="mt-1 line-clamp-2 text-ink-soft">{c.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Maintenance requests">
          {maintenance.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-gray-100">
              {maintenance.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">
                      {m.fullName} <span className="text-ink-muted">· {m.category || m.service || m.kind}</span>
                    </p>
                    <p className="text-xs text-ink-muted tabular">{m.reference} · {m.unit} · {since(m.createdAt)}</p>
                  </div>
                  {superAdmin ? (
                    <form action={setMaintenanceStatus} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={m.id} />
                      <select
                        name="status"
                        defaultValue={m.status}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-ink"
                      >
                        {MAINT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-ink-soft"
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <Badge tone={m.status === "RESOLVED" || m.status === "CLOSED" ? "success" : "info"}>
                      {m.status.replace("_", " ")}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Listing submissions">
          {adverts.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-gray-100">
              {adverts.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{a.title}</p>
                    <p className="text-xs text-ink-muted tabular">{a.reference} · {a.location} · {since(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink">{formatNaira(a.price)}</span>
                    {a.featured && <Badge tone="success">★ Featured</Badge>}
                    <Badge tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "neutral" : "brand"}>
                      {a.status}
                    </Badge>
                    {canMgr && (
                      <div className="flex gap-1">
                        <form action={setListingStatus}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="APPROVED" />
                          <button
                            type="submit"
                            disabled={a.status === "APPROVED"}
                            className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={setListingStatus}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button
                            type="submit"
                            disabled={a.status === "REJECTED"}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-ink disabled:opacity-40"
                          >
                            Reject
                          </button>
                        </form>
                        <form action={setListingFeatured}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="featured" value={String(!a.featured)} />
                          <button
                            type="submit"
                            className="rounded-md border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            {a.featured ? "Unfeature" : "Feature"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
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

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {hint && <span className="text-xs text-ink-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="py-3 text-sm text-ink-muted">Nothing yet.</p>;
}

function StageBtn({
  id,
  stage,
  label,
  className,
}: {
  id: string;
  stage: string;
  label: string;
  className: string;
}) {
  return (
    <form action={setTenancyStage}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="stage" value={stage} />
      <button type="submit" className={`rounded-md px-2 py-1 text-xs font-semibold ${className}`}>
        {label}
      </button>
    </form>
  );
}
