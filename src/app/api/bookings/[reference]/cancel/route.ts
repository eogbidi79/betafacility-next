import { prisma } from "@/lib/db";
import { cancelSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REFUND_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  const parsed = await parseJson(req, cancelSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const booking = await prisma.booking.findUnique({ where: { reference } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.term !== "short-term") {
      return NextResponse.json(
        { error: "Long-term tenancies can't be cancelled online. Please contact us." },
        { status: 409 },
      );
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json({ error: "This booking is already cancelled" }, { status: 409 });
    }

    // ≥ 48h before check-in → refundable; otherwise non-refundable, issued as a voucher.
    const msToCheckIn = booking.checkIn.getTime() - Date.now();
    const refundable = msToCheckIn >= REFUND_WINDOW_MS;
    const wasPaid = booking.status === "PAID" || booking.status === "SIGNED";

    let refundOutcome: "refundable" | "voucher" | "none";
    let voucherCode: string | null = null;
    if (!wasPaid) {
      refundOutcome = "none";
    } else if (refundable) {
      refundOutcome = "refundable";
    } else {
      refundOutcome = "voucher";
      voucherCode = makeReference("VCHR");
    }

    await prisma.booking.update({
      where: { reference },
      data: { status: "CANCELLED", cancelledAt: new Date(), refundOutcome, voucherCode },
    });

    await sendEmail({
      to: [notifyTo.payments, notifyTo.admin],
      subject: `Booking cancelled — ${reference} (${refundOutcome})`,
      html: emailLayout("Booking cancelled", [
        ["Reference", reference],
        ["Guest", booking.guestName],
        ["Amount", formatNaira(booking.amount)],
        ["Outcome", refundOutcome],
        ...(voucherCode ? ([["Voucher", voucherCode]] as [string, string][]) : []),
      ]),
    });

    const message =
      refundOutcome === "refundable"
        ? "Your booking is cancelled and is eligible for a full refund (cancelled 48+ hours before check-in)."
        : refundOutcome === "voucher"
          ? "Your booking is cancelled. As it's within 48 hours of check-in it's non-refundable, but we've issued a voucher for the full amount."
          : "Your booking is cancelled.";

    return ok({ reference, status: "CANCELLED", refundOutcome, voucherCode, message });
  } catch (err) {
    console.error("cancel failed", err);
    return serverError();
  }
}
