import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { SignaturePad } from "@/components/booking/SignaturePad";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SignPage({
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

  // Must be paid before signing; if already signed, go straight to the receipt.
  if (booking.status === "PENDING") redirect(`/bookings/${reference}/pay`);
  if (booking.status === "SIGNED") redirect(`/bookings/${reference}/receipt`);

  return (
    <Container className="py-14 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          Payment confirmed ✓ — one last step: sign your tenancy agreement.
        </div>

        <h1 className="text-2xl font-bold text-ink">Sign your agreement</h1>
        <p className="mt-1 text-ink-muted">
          {booking.rental.title} · {booking.nights} night{booking.nights > 1 ? "s" : ""} ·{" "}
          {formatNaira(booking.amount)}
        </p>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
          <div className="mb-5 max-h-40 overflow-y-auto rounded-lg bg-gray-50 p-4 text-xs leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">Short-Let Tenancy Agreement (summary)</p>
            <p className="mt-2">
              By signing, {booking.guestName} agrees to occupy {booking.rental.title} for the booked
              period, to the house rules of BetaFacility Managers Limited, and confirms payment of{" "}
              {formatNaira(booking.amount)} for {booking.nights} night(s). A full receipt is issued
              on completion.
            </p>
          </div>
          <SignaturePad reference={reference} />
        </div>
      </div>
    </Container>
  );
}
