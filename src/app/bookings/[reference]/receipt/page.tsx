import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PrintButton } from "@/components/booking/PrintButton";
import { Badge } from "@/components/ui/Badge";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { rental: true },
  });
  if (!booking) notFound();

  const paid = booking.status === "PAID" || booking.status === "SIGNED";

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <ButtonLink href="/rentals" variant="ghost" size="sm">
            ← Back to rentals
          </ButtonLink>
          <PrintButton />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50 px-6 py-5">
            <div>
              <p className="text-lg font-extrabold text-ink">
                Beta<span className="text-brand-500">Facility</span> Managers
              </p>
              <p className="text-xs text-ink-muted">{site.address.full}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">Receipt</p>
              <p className="text-xs text-ink-muted tabular">{booking.reference}</p>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center gap-2">
              <Badge tone={paid ? "success" : "neutral"}>
                {booking.status === "SIGNED" ? "Confirmed & Signed" : booking.status}
              </Badge>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="Guest" value={booking.guestName} />
              <Row label="Email" value={booking.guestEmail} />
              <Row label="Rental" value={booking.rental.title} />
              <Row label="Location" value={booking.rental.location} />
              <Row label="Check-in" value={fmtDate(booking.checkIn)} />
              <Row label="Check-out" value={fmtDate(booking.checkOut)} />
              <Row label="Nights" value={String(booking.nights)} />
              <Row label="Rate / night" value={formatNaira(booking.rental.pricePerNight)} />
              <Row label="Paid on" value={fmtDate(booking.paidAt)} />
              <Row label="Signed on" value={fmtDate(booking.signedAt)} />
            </dl>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-base font-bold text-ink">{paid ? "Total paid" : "Amount due"}</span>
              <span className="text-2xl font-extrabold text-brand-600">
                {formatNaira(booking.amount)}
              </span>
            </div>

            {!paid && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 print:hidden">
                This booking is awaiting payment.{" "}
                <a href={`/bookings/${booking.reference}/pay`} className="font-semibold underline">
                  Complete payment
                </a>
              </p>
            )}

            {booking.signatureRef && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Tenant signature
                </p>
                <div className="mt-2 inline-block rounded-lg border border-gray-200 bg-white p-2">
                  {/* Stored as a data URL; render at a fixed size. */}
                  <Image
                    src={booking.signatureRef}
                    alt="Signature"
                    width={240}
                    height={90}
                    unoptimized
                    className="h-auto w-60"
                  />
                </div>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-ink-muted">
              Thank you for booking with BetaFacility Managers Limited. Questions?{" "}
              {site.emails.info}
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
