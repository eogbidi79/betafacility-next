import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";
import { isPaystackConfigured } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export default async function SimPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { reference } = await params;
  const { status } = await searchParams;
  const booking = await prisma.booking.findUnique({
    where: { reference },
    include: { rental: true },
  });
  if (!booking) notFound();

  const failed = status === "failed";

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {isPaystackConfigured()
            ? "Test payment page."
            : "Simulation mode — no Paystack key set. This mimics a successful test payment so you can preview the full flow."}
        </div>

        <h1 className="text-xl font-bold text-ink">Confirm payment</h1>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Rental</dt>
            <dd className="font-medium text-ink">
              {booking.rental?.title ?? booking.propertyTitle ?? "Booking"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Reference</dt>
            <dd className="font-medium text-ink tabular">{booking.reference}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Nights</dt>
            <dd className="font-medium text-ink">{booking.nights}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base">
            <dt className="font-bold text-ink">Total</dt>
            <dd className="font-bold text-brand-600">{formatNaira(booking.amount)}</dd>
          </div>
        </dl>

        {failed && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Payment was not completed. You can try again.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {/* GET /api/payments/verify marks the booking paid and forwards to signing. */}
          <ButtonLink href={`/api/payments/verify?reference=${booking.reference}`} size="lg" fullWidth>
            Simulate Successful Payment
          </ButtonLink>
          <ButtonLink href="/rentals" size="lg" variant="outline" fullWidth>
            Cancel
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
