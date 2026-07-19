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
      return ok({ authorizationUrl: `/bookings/${booking.reference}/sign`, alreadyPaid: true });
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
      metadata: { bookingRef: booking.reference, rental: booking.rental.title },
    });
    return ok({ authorizationUrl });
  } catch (err) {
    console.error("payments/init failed", err);
    return serverError("Could not start payment");
  }
}
