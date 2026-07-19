import { prisma } from "@/lib/db";
import { verifyTransaction, isPaystackConfigured } from "@/lib/paystack";
import { notifyPaymentReceived, notifyShortPaymentAccepted, notifyStaff } from "@/lib/notifications";
import { notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
  const origin = url.origin;

  if (!reference) {
    return NextResponse.redirect(new URL("/rentals?payment=missing-ref", origin));
  }

  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) {
    return NextResponse.redirect(new URL("/rentals?payment=not-found", origin));
  }

  const nextStep = (b: { term: string }) =>
    b.term === "long-term" ? `/bookings/${reference}/agreement` : `/bookings/${reference}/invoice`;

  if (booking.status === "PAID" || booking.status === "SIGNED") {
    return NextResponse.redirect(new URL(nextStep(booking), origin));
  }

  let paid = false;
  let paidAt: Date | null = new Date();

  if (isPaystackConfigured()) {
    const result = await verifyTransaction(reference);
    paid = result.success;
    paidAt = result.paidAt ?? new Date();
  } else {
    // Dev simulation — treat the callback as a successful test payment.
    paid = true;
  }

  if (!paid) {
    return NextResponse.redirect(new URL(`/bookings/${reference}/pay?status=failed`, origin));
  }

  const updated = await prisma.booking.update({
    where: { reference },
    data: { status: "PAID", paidAt, paymentRef: reference },
  });

  // Prospect-facing confirmation (long-term → e-sign next; short-term → invoice + T&C).
  if (updated.term === "long-term") {
    await notifyPaymentReceived(updated);
  } else {
    await notifyShortPaymentAccepted(updated);
  }
  await notifyStaff(
    `Payment received — ${reference}`,
    [
      ["Reference", reference],
      ["Guest", booking.guestName],
      ["Amount", formatNaira(booking.amount)],
      ["Term", booking.term],
    ],
    [notifyTo.payments, notifyTo.admin],
  );

  return NextResponse.redirect(new URL(nextStep(booking), origin));
}
