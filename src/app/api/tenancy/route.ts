import { prisma } from "@/lib/db";
import { tenancySchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { properties } from "@/data/properties";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseJson(req, tenancySchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    const property = properties.find((p) => p.slug === d.propertySlug);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const start = d.startDate;
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);

    const booking = await prisma.booking.create({
      data: {
        reference: makeReference("TEN"),
        term: "long-term",
        propertySlug: property.slug,
        propertyTitle: property.title,
        propertyAddress: property.address,
        landlordName: "Owner (managed by BetaFacility Managers Limited)",
        guestName: d.guestName,
        guestEmail: d.guestEmail,
        guestPhone: d.guestPhone,
        tenantAddress: d.tenantAddress,
        checkIn: start,
        checkOut: end,
        nights: 365,
        amount: property.pricePerYear,
        status: "PENDING",
      },
    });

    await sendEmail({
      to: [notifyTo.payments, notifyTo.admin],
      subject: `New 1-year tenancy application (pending) — ${booking.reference}`,
      html: emailLayout("New tenancy application", [
        ["Reference", booking.reference],
        ["Property", property.title],
        ["Address", property.address],
        ["Applicant", d.guestName],
        ["Email", d.guestEmail],
        ["Phone", d.guestPhone],
        ["Annual rent", formatNaira(property.pricePerYear)],
      ]),
    });

    return ok(
      {
        reference: booking.reference,
        amount: property.pricePerYear,
        term: "long-term",
        message: "Tenancy application created (pending payment)",
      },
      201,
    );
  } catch (err) {
    console.error("tenancy POST failed", err);
    return serverError();
  }
}
