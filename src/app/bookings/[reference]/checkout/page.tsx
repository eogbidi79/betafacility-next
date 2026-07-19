import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/booking/CheckoutButton";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Complete Payment", robots: { index: false } };

const STAGE_COPY: Record<string, string> = {
  APPLIED: "Your application has been received and is awaiting review.",
  UNDER_REVIEW: "Your application is under review (background checks & guarantor validation).",
  REJECTED: "This application was not accepted. Please contact us to discuss other options.",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) notFound();

  // Already paid — go to the next step.
  if (booking.status === "PAID" || booking.status === "SIGNED") {
    redirect(`/bookings/${reference}/${booking.term === "long-term" ? "agreement" : "invoice"}`);
  }

  const isLong = booking.term === "long-term";
  const canPay = !isLong || booking.stage === "ACCEPTED";
  const title = isLong ? booking.propertyTitle ?? "Property" : "Booking";

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <h1 className="text-xl font-bold text-ink">Complete payment</h1>
        <p className="mt-1 text-sm text-ink-muted">{title}</p>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Reference</dt>
            <dd className="font-medium text-ink tabular">{booking.reference}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
            <dt className="font-bold text-ink">{isLong ? "Annual rent" : "Amount due"}</dt>
            <dd className="font-bold text-brand-600">{formatNaira(booking.amount)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          {canPay ? (
            <CheckoutButton
              reference={booking.reference}
              label={`Pay ${formatNaira(booking.amount)}`}
            />
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Badge tone="neutral">{booking.stage ?? "PENDING"}</Badge>
              <p className="mt-2">{STAGE_COPY[booking.stage ?? "APPLIED"] ?? "Awaiting review."}</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <ButtonLink href="/properties" variant="ghost" size="sm">
            Back to properties
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
