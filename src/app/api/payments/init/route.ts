import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseJson, ok, serverError } from "@/lib/api";
import { initializeTransaction, isPaystackConfigured } from "@/lib/paystack";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = z.object({ reference: z.string().trim().min(1) });

export async function POST(req: Request) {
  const parsed = await parseJson(req, schema);
  if (!parsed.ok) return parsed.response;

  try {
    const booking = await prisma.booking.findUnique({
      where: { reference: parsed.data.reference },
      include: { rental: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status === "PAID" || booking.status === "SIGNED") {
      const step =
        booking.term === "long-term"
          ? `/bookings/${booking.reference}/agreement`
          : `/bookings/${booking.reference}/invoice`;
      return ok({ authorizationUrl: step, alreadyPaid: true });
    }

    // Long-term tenancies can only be paid once the application is accepted.
    if (booking.term === "long-term" && booking.stage !== "ACCEPTED") {
      return NextResponse.json(
        {
          error:
            booking.stage === "REJECTED"
              ? "This application was not accepted."
              : "Your application is still under review. Payment opens once it's accepted.",
        },
        { status: 409 },
      );
    }

    // Fully covered by a voucher — nothing to charge; confirm immediately.
    if (booking.amount <= 0) {
      await prisma.booking.update({
        where: { reference: booking.reference },
        data: { status: "PAID", paidAt: new Date() },
      });
      const step =
        booking.term === "long-term"
          ? `/bookings/${booking.reference}/agreement`
          : `/bookings/${booking.reference}/invoice`;
      return ok({ authorizationUrl: step, covered: true });
    }

    if (!isPaystackConfigured()) {
      // Dev simulation: route to a local page that confirms a mock payment.
      return ok({
        authorizationUrl: `/bookings/${booking.reference}/pay`,
        simulated: true,
      });
    }

    const { authorizationUrl } = await initializeTransaction({
      reference: booking.reference,
      email: booking.guestEmail,
      amountNaira: booking.amount,
      metadata: {
        bookingRef: booking.reference,
        item: booking.rental?.title ?? booking.propertyTitle ?? booking.term,
      },
    });
    return ok({ authorizationUrl });
  } catch (err) {
    console.error("payments/init failed", err);
    return serverError("Could not start payment");
  }
}
