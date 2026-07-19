import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseJson, ok, serverError } from "@/lib/api";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = z.object({
  signature: z.string().min(20, "Signature required").max(500_000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const parsed = await parseJson(req, schema);
  if (!parsed.ok) return parsed.response;

  try {
    const booking = await prisma.booking.findUnique({ where: { reference } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status === "PENDING") {
      return NextResponse.json({ error: "Payment required before signing" }, { status: 409 });
    }

    await prisma.booking.update({
      where: { reference },
      data: { status: "SIGNED", signatureRef: parsed.data.signature, signedAt: new Date() },
    });

    await sendEmail({
      to: booking.guestEmail,
      replyTo: notifyTo.contact,
      subject: `Your BetaFacility booking receipt — ${reference}`,
      html: emailLayout(
        "Booking confirmed",
        [
          ["Reference", reference],
          ["Amount paid", formatNaira(booking.amount)],
          ["Nights", String(booking.nights)],
        ],
        "Thank you — your agreement is signed and your booking is confirmed. Your receipt is attached to your account.",
      ),
    });

    return ok({ reference, status: "SIGNED", receiptUrl: `/bookings/${reference}/receipt` });
  } catch (err) {
    console.error("sign failed", err);
    return serverError();
  }
}
