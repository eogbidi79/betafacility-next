import { prisma } from "@/lib/db";
import { signSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";
import { notifyAgreementSigned } from "@/lib/notifications";
import { site } from "@/data/site";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const limited = rateLimit(req, "sign", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

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

    const signed = await prisma.booking.findUnique({ where: { reference } });
    if (signed) await notifyAgreementSigned(signed);

    return ok({ reference, status: "SIGNED", receiptUrl: `/bookings/${reference}/receipt`, docUrl });
  } catch (err) {
    captureError(err, { route: "booking.sign" });
    return serverError();
  }
}
