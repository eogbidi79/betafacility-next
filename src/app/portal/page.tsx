import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { formatNaira } from "@/lib/utils";
import { setListingStatus, setMaintenanceStatus } from "./actions";

const MAINT_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const dynamic = "force-dynamic";
export const metadata = { title: "Portal", robots: { index: false } };

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function PortalPage() {
  const session = await auth();

  const [bookings, contacts, maintenance, adverts, counts] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { rental: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.maintenanceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.advertiseSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    Promise.all([
      prisma.booking.count(),
      prisma.contactMessage.count(),
      prisma.maintenanceRequest.count(),
      prisma.advertiseSubmission.count(),
    ]),
  ]);

  const [bookingCount, contactCount, maintCount, advertCount] = counts;
  const revenue = bookings.reduce((s, b) => (b.status !== "PENDING" ? s + b.amount : s), 0);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admin Portal</h1>
          <p className="text-sm text-ink-muted">
            Signed in as {session?.user?.email}
            {session?.user?.role ? ` · ${session.user.role}` : ""}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Bookings" value={String(bookingCount)} />
        <Stat label="Contact messages" value={String(contactCount)} />
        <Stat label="Maintenance requests" value={String(maintCount)} />
        <Stat label="Listing submissions" value={String(advertCount)} />
      </div>

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
                    <Badge tone={a.status === "APPROVED" ? "success" : a.status === "REJECTED" ? "neutral" : "brand"}>
                      {a.status}
                    </Badge>
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
                    </div>
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
