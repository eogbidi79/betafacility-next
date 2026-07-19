import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PrintButton } from "@/components/booking/PrintButton";
import { Letterhead } from "@/components/booking/Letterhead";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";
import { SHORTLET_TERMS, CANCELLATION_POLICY } from "@/data/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice", robots: { index: false } };

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(d) : "—";
}

export default async function InvoicePage({
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
  if (booking.term === "long-term") redirect(`/bookings/${reference}/agreement`);
  if (booking.status === "PENDING") redirect(`/bookings/${reference}/pay`);

  const gross = booking.amount + booking.voucherDiscount;
  const rate = booking.rental ? booking.rental.pricePerNight : Math.round(gross / booking.nights);
  const unitName = booking.rental?.title ?? "Serviced apartment";
  const cancelled = booking.status === "CANCELLED";
  const upcoming = booking.checkIn.getTime() > Date.now();

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <ButtonLink href={`/bookings/${reference}/receipt`} variant="ghost" size="sm">
            ← Receipt
          </ButtonLink>
          <PrintButton />
        </div>

        {cancelled && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 print:hidden">
            This booking was cancelled ({booking.refundOutcome}).
            {booking.voucherCode ? (
              <>
                {" "}
                Voucher: <span className="font-bold tabular">{booking.voucherCode}</span>
              </>
            ) : null}
          </div>
        )}

        <article className="doc-a4 rounded-2xl border border-gray-200 bg-white p-8 shadow-card sm:p-10">
          <Letterhead docTitle="Invoice" reference={booking.reference} />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Billed to</p>
              <p className="mt-1 text-sm text-ink">
                {booking.guestName}
                <br />
                {booking.guestEmail}
                <br />
                {booking.guestPhone}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-ink-muted">Issued: {fmt(booking.paidAt ?? booking.createdAt)}</p>
              <Badge tone={cancelled ? "neutral" : "success"}>
                {cancelled ? "Cancelled" : "Paid"}
              </Badge>
            </div>
          </div>

          {/* Line items */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-ink-muted">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Nights</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3">
                  {unitName}
                  <br />
                  <span className="text-xs text-ink-muted">
                    {fmt(booking.checkIn)} → {fmt(booking.checkOut)}
                  </span>
                </td>
                <td className="py-3 text-center tabular">{booking.nights}</td>
                <td className="py-3 text-right tabular">{formatNaira(rate)}</td>
                <td className="py-3 text-right font-medium tabular">{formatNaira(gross)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Subtotal</span>
                <span className="tabular">{formatNaira(gross)}</span>
              </div>
              {booking.voucherDiscount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Voucher{booking.appliedVoucherCode ? ` (${booking.appliedVoucherCode})` : ""}</span>
                  <span className="tabular">−{formatNaira(booking.voucherDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-bold">
                <span>Total {cancelled ? "" : "paid"}</span>
                <span className="text-brand-600 tabular">{formatNaira(booking.amount)}</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <section className="mt-8 space-y-3 text-sm leading-relaxed text-ink-soft">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Terms &amp; Conditions</h2>
            {SHORTLET_TERMS.map((t) => (
              <div key={t.title}>
                <h3 className="font-semibold text-ink">{t.title}</h3>
                <p>{t.body}</p>
              </div>
            ))}
          </section>

          {/* Cancellation policy */}
          <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
            <h3 className="font-bold text-ink">{CANCELLATION_POLICY.heading}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
              {CANCELLATION_POLICY.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <p className="mt-6 text-center text-xs text-ink-muted">
            Thank you for choosing BetaFacility Managers Limited · {site.emails.info} · {site.phone}
          </p>
        </article>

        {!cancelled && upcoming && (
          <div className="mt-6 print:hidden">
            <CancelBookingButton reference={booking.reference} />
          </div>
        )}
      </div>
    </Container>
  );
}
