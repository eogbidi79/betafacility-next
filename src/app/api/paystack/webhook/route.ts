import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Paystack signs webhook payloads with HMAC-SHA512 using your secret key.
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Payments not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");

  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event?.event === "charge.success") {
    const reference: string | undefined = event.data?.reference;
    if (reference) {
      await prisma.booking.updateMany({
        where: { reference, status: "PENDING" },
        data: {
          status: "PAID",
          paidAt: event.data?.paid_at ? new Date(event.data.paid_at) : new Date(),
          paymentRef: reference,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
