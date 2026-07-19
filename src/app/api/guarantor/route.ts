import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseJson, ok, serverError } from "@/lib/api";
import { notifyGuarantorConfirmed } from "@/lib/notifications";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = z.object({ token: z.string().trim().min(8) });

export async function POST(req: Request) {
  const parsed = await parseJson(req, schema);
  if (!parsed.ok) return parsed.response;

  try {
    const booking = await prisma.booking.findUnique({
      where: { guarantorToken: parsed.data.token },
    });
    if (!booking) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }
    if (booking.guarantorConsent) {
      return ok({ alreadyConfirmed: true, message: "Already confirmed" });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { guarantorConsent: true, guarantorConsentAt: new Date() },
    });

    await notifyGuarantorConfirmed(updated);

    return ok({ confirmed: true, message: "Thank you — your consent has been recorded." });
  } catch (err) {
    console.error("guarantor confirm failed", err);
    return serverError();
  }
}
