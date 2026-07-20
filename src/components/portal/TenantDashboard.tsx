import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { formatNaira } from "@/lib/utils";

function when(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export async function TenantDashboard({ email, name }: { email: string; name?: string | null }) {
  const [bookings, requests] = await Promise.all([
    prisma.booking.findMany({
      where: { guestEmail: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      include: { rental: true },
    }),
    prisma.maintenanceRequest.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Account</h1>
          <p className="text-sm text-ink-muted">Welcome{name ? `, ${name}` : ""} · {email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/rentals" size="sm">Book a stay</ButtonLink>
        <ButtonLink href="/facility-management" size="sm" variant="outline">Report an issue</ButtonLink>
      </div>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">My bookings &amp; tenancies</h2>
        {bookings.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">
            No bookings yet. <a href="/rentals" className="font-medium text-brand-600">Browse rentals →</a>
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {bookings.map((b) => {
              const isLong = b.term === "long-term";
              const title = isLong ? b.propertyTitle : b.rental?.title;
              const paid = b.status === "PAID" || b.status === "SIGNED";
              return (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">
                      {title ?? "Booking"}{" "}
                      {isLong && <span className="text-xs font-semibold text-brand-600">1-year</span>}
                    </p>
                    <p className="text-xs text-ink-muted tabular">
                      {b.reference} · {when(b.checkIn)} → {when(b.checkOut)} · {formatNaira(b.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={b.status === "PENDING" ? "neutral" : b.status === "CANCELLED" ? "neutral" : "success"}>
                      {b.status}
                    </Badge>
                    <ButtonLink href={`/bookings/${b.reference}/receipt`} size="sm" variant="outline">
                      Receipt
                    </ButtonLink>
                    {paid && isLong && (
                      <ButtonLink href={`/bookings/${b.reference}/agreement`} size="sm" variant="ghost">
                        Agreement
                      </ButtonLink>
                    )}
                    {paid && !isLong && (
                      <ButtonLink href={`/bookings/${b.reference}/invoice`} size="sm" variant="ghost">
                        Invoice
                      </ButtonLink>
                    )}
                    {b.status === "PENDING" && (
                      <ButtonLink href={`/bookings/${b.reference}/pay`} size="sm">
                        Pay
                      </ButtonLink>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">My maintenance requests</h2>
        {requests.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">No requests yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {requests.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{m.category || m.service || m.kind}</p>
                  <p className="text-xs text-ink-muted tabular">{m.reference} · {m.unit} · {when(m.createdAt)}</p>
                </div>
                <Badge tone={m.status === "RESOLVED" || m.status === "CLOSED" ? "success" : "info"}>
                  {m.status.replace("_", " ")}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
