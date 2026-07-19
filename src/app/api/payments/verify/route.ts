import { prisma } from "@/lib/db";
import { verifyTransaction, isPaystackConfigured } from "@/lib/paystack";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
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

  await prisma.booking.update({
    where: { reference },
    data: { status: "PAID", paidAt, paymentRef: reference },
  });

  await sendEmail({
    to: [notifyTo.payments, notifyTo.admin],
    subject: `Payment received — ${reference}`,
    html: emailLayout("Booking payment received", [
      ["Reference", reference],
      ["Guest", booking.guestName],
      ["Email", booking.guestEmail],
      ["Amount", formatNaira(booking.amount)],
      ["Nights", String(booking.nights)],
    ]),
  });

  return NextResponse.redirect(new URL(nextStep(booking), origin));
}
