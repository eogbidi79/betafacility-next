import { prisma } from "@/lib/db";
import { signSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const parsed = await parseJson(req, signSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const booking = await prisma.booking.findUnique({ where: { reference } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.status === "PENDING") {
      return NextResponse.json({ error: "Payment required before signing" }, { status: 409 });
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "This booking was cancelled" }, { status: 409 });
    }

    const isLongTerm = booking.term === "long-term";
    if (isLongTerm && !parsed.data.inflationConsent) {
      return NextResponse.json(
        { error: "You must accept the rent-review (inflation) clause before signing." },
        { status: 422 },
      );
    }

    const now = new Date();
    await prisma.booking.update({
      where: { reference },
      data: {
        status: "SIGNED",
        signatureRef: parsed.data.signature,
        signedAt: now,
        ...(isLongTerm
          ? {
              inflationConsent: true,
              inflationConsentAt: now,
              // Managing agent counter-signs on record; landlord sign-off logged.
              repName: site.representative.name,
              repSignedAt: now,
              landlordSignedAt: now,
            }
          : {}),
      },
    });

    const docUrl = isLongTerm
      ? `/bookings/${reference}/agreement`
      : `/bookings/${reference}/invoice`;

    await sendEmail({
      to: booking.guestEmail,
      replyTo: notifyTo.contact,
      subject: isLongTerm
        ? `Your signed tenancy agreement — ${reference}`
        : `Your BetaFacility booking receipt — ${reference}`,
      html: emailLayout(
        isLongTerm ? "Tenancy agreement signed" : "Booking confirmed",
        [
          ["Reference", reference],
          [isLongTerm ? "Annual rent" : "Amount paid", formatNaira(booking.amount)],
        ],
        isLongTerm
          ? "Your 1-year tenancy agreement is signed by all parties. A copy is available in your account."
          : "Thank you — your booking is confirmed. Your receipt and invoice are available in your account.",
      ),
    });

    return ok({ reference, status: "SIGNED", receiptUrl: `/bookings/${reference}/receipt`, docUrl });
  } catch (err) {
    console.error("sign failed", err);
    return serverError();
  }
}
