import { prisma } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { computeNights, PENDING_HOLD_MS } from "@/lib/booking";
import { notifyShortBookingReceived } from "@/lib/notifications";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseJson(req, bookingSchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    const rental = await prisma.rental.findUnique({
      where: { slug: d.rentalSlug },
    });
    if (!rental || !rental.active) {
      return NextResponse.json({ error: "Rental not available" }, { status: 404 });
    }

    // Availability: block overbooking. A unit is occupied for overlapping dates
    // by confirmed bookings (PAID/SIGNED) or a recent PENDING hold.
    const overlapping = await prisma.booking.count({
      where: {
        rentalId: rental.id,
        checkIn: { lt: d.checkOut },
        checkOut: { gt: d.checkIn },
        OR: [
          { status: { in: ["PAID", "SIGNED"] } },
          { status: "PENDING", createdAt: { gte: new Date(Date.now() - PENDING_HOLD_MS) } },
        ],
      },
    });
    if (overlapping >= rental.unitsTotal) {
      return NextResponse.json(
        { error: "No units available for the selected dates. Please try different dates." },
        { status: 409 },
      );
    }

    const nights = computeNights(d.checkIn, d.checkOut);
    const gross = nights * rental.pricePerNight;

    // Optional voucher redemption (from a prior late-cancellation).
    let discount = 0;
    let appliedVoucherCode: string | null = null;
    if (d.voucherCode) {
      const voucher = await prisma.voucher.findUnique({ where: { code: d.voucherCode } });
      if (!voucher || voucher.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "That voucher code is invalid or has already been used." },
          { status: 422 },
        );
      }
      discount = Math.min(voucher.amount, gross);
      appliedVoucherCode = voucher.code;
    }

    const amount = gross - discount;

    const booking = await prisma.booking.create({
      data: {
        reference: makeReference("BKG"),
        rentalId: rental.id,
        guestName: d.guestName,
        guestEmail: d.guestEmail,
        guestPhone: d.guestPhone,
        checkIn: d.checkIn,
        checkOut: d.checkOut,
        nights,
        amount,
        voucherDiscount: discount,
        appliedVoucherCode,
        status: "PENDING",
      },
    });

    // Mark the voucher redeemed against this booking.
    if (appliedVoucherCode) {
      await prisma.voucher.update({
        where: { code: appliedVoucherCode },
        data: { status: "REDEEMED", redeemedForRef: booking.reference, redeemedAt: new Date() },
      });
    }

    await sendEmail({
      to: [notifyTo.payments],
      subject: `New booking (pending) — ${booking.reference}`,
      html: emailLayout("New booking created", [
        ["Reference", booking.reference],
        ["Rental", rental.title],
        ["Guest", d.guestName],
        ["Email", d.guestEmail],
        ["Phone", d.guestPhone],
        ["Nights", String(nights)],
        ...(discount ? ([["Voucher", `${appliedVoucherCode} (−${formatNaira(discount)})`]] as [string, string][]) : []),
        ["Amount due", formatNaira(amount)],
      ]),
    });

    await notifyShortBookingReceived(booking);

    return ok(
      {
        reference: booking.reference,
        nights,
        gross,
        discount,
        amount,
        status: booking.status,
        message: "Booking created (pending payment)",
      },
      201,
    );
  } catch (err) {
    console.error("booking POST failed", err);
    return serverError();
  }
}
