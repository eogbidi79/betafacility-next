import { prisma } from "@/lib/db";
import { tenancySchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { randomUUID } from "node:crypto";
import { makeReference } from "@/lib/reference";
import { formatNaira } from "@/lib/utils";
import { notifyTenancyApplied, notifyGuarantorRequest, notifyStaff } from "@/lib/notifications";
import { notifyTo } from "@/lib/email";
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

    // Application-first: no payment until the application is reviewed and accepted.
    const booking = await prisma.booking.create({
      data: {
        reference: makeReference("TEN"),
        term: "long-term",
        stage: "APPLIED",
        propertySlug: property.slug,
        propertyTitle: property.title,
        propertyAddress: property.address,
        landlordName: "Owner (managed by BetaFacility Managers Limited)",
        guestName: d.guestName,
        guestEmail: d.guestEmail,
        guestPhone: d.guestPhone,
        tenantAddress: d.tenantAddress,
        guarantorName: d.guarantorName,
        guarantorPhone: d.guarantorPhone,
        guarantorEmail: d.guarantorEmail,
        guarantorToken: randomUUID(),
        checkIn: start,
        checkOut: end,
        nights: 365,
        amount: property.pricePerYear,
        status: "PENDING",
      },
    });

    await notifyTenancyApplied(booking);
    await notifyGuarantorRequest(booking);
    await notifyStaff(
      `New 1-year tenancy application — ${booking.reference}`,
      [
        ["Reference", booking.reference],
        ["Property", property.title],
        ["Applicant", `${d.guestName} · ${d.guestEmail} · ${d.guestPhone}`],
        ["Guarantor", `${d.guarantorName} · ${d.guarantorPhone}`],
        ["Annual rent", formatNaira(property.pricePerYear)],
      ],
      [notifyTo.payments, notifyTo.admin],
    );

    return ok(
      {
        reference: booking.reference,
        stage: "APPLIED",
        term: "long-term",
        message: "Application received — we'll review and email you.",
      },
      201,
    );
  } catch (err) {
    console.error("tenancy POST failed", err);
    return serverError();
  }
}
