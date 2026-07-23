import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";
import { isSuperAdmin, isStaff } from "@/lib/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings", robots: { index: false } };

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export default async function BookingsPage() {
  const role = (await auth())?.user?.role;
  if (!isSuperAdmin(role) && !isStaff(role)) redirect("/portal");

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { rental: true },
  });
  const revenue = bookings.reduce((s, b) => (b.status !== "PENDING" ? s + b.amount : s), 0);

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink">Bookings</h1>
      <p className="text-sm text-ink-muted">
        {bookings.length} recent · confirmed revenue {formatNaira(revenue)}
      </p>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-ink-muted">
                <th className="py-2">Reference</th>
                <th className="py-2">Guest</th>
                <th className="py-2">Property</th>
                <th className="py-2">Term</th>
                <th className="py-2">Dates</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 align-middle">
                  <td className="py-2.5 tabular text-ink-muted">{b.reference}</td>
                  <td className="py-2.5">
                    <p className="font-medium text-ink">{b.guestName}</p>
                    <p className="text-xs text-ink-muted">{b.guestEmail}</p>
                  </td>
                  <td className="py-2.5 text-ink-soft">{b.rental?.title ?? b.propertyTitle ?? "—"}</td>
                  <td className="py-2.5 text-ink-soft">{b.term === "long-term" ? "1-year" : "Short-let"}</td>
                  <td className="py-2.5 text-ink-muted">
                    {since(b.checkIn)} → {since(b.checkOut)}
                  </td>
                  <td className="py-2.5 font-semibold text-ink">{formatNaira(b.amount)}</td>
                  <td className="py-2.5">
                    <Badge tone={b.status === "PENDING" ? "neutral" : b.status === "CANCELLED" ? "neutral" : "success"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    <ButtonLink href={`/bookings/${b.reference}/receipt`} size="sm" variant="ghost">
                      Receipt
                    </ButtonLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
