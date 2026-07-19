import { prisma } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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
    // by confirmed bookings (PAID/SIGNED) or a recent PENDING hold (30 min).
    const HOLD_MS = 30 * 60 * 1000;
    const overlapping = await prisma.booking.count({
      where: {
        rentalId: rental.id,
        checkIn: { lt: d.checkOut },
        checkOut: { gt: d.checkIn },
        OR: [
          { status: { in: ["PAID", "SIGNED"] } },
          { status: "PENDING", createdAt: { gte: new Date(Date.now() - HOLD_MS) } },
        ],
      },
    });
    if (overlapping >= rental.unitsTotal) {
      return NextResponse.json(
        { error: "No units available for the selected dates. Please try different dates." },
        { status: 409 },
      );
    }

    const nights = Math.max(
      1,
      Math.round((d.checkOut.getTime() - d.checkIn.getTime()) / MS_PER_DAY),
    );
    const amount = nights * rental.pricePerNight;

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
        status: "PENDING",
      },
    });

    await sendEmail({
      to: [notifyTo.payments, notifyTo.admin],
      subject: `New booking (pending) — ${booking.reference}`,
      html: emailLayout("New booking created", [
        ["Reference", booking.reference],
        ["Rental", rental.title],
        ["Guest", d.guestName],
        ["Email", d.guestEmail],
        ["Phone", d.guestPhone],
        ["Nights", String(nights)],
        ["Amount", formatNaira(amount)],
      ]),
    });

    return ok(
      {
        reference: booking.reference,
        nights,
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
