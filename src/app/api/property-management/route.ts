import { prisma } from "@/lib/db";
import { propertyManagementSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseJson(req, propertyManagementSchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    const lead = await prisma.propertyManagementLead.create({
      data: {
        reference: makeReference("PM"),
        name: d.name,
        email: d.email,
        phone: d.phone,
        company: d.company || null,
        country: d.country || "Nigeria",
        city: d.city || null,
        propertyType: d.propertyType || null,
        units: d.units || null,
        services: d.services || null,
        message: d.message || null,
      },
    });

    await sendEmail({
      to: [notifyTo.sales, notifyTo.admin],
      replyTo: d.email,
      subject: `New property management lead — ${lead.reference}`,
      html: emailLayout("New property management lead", [
        ["Reference", lead.reference],
        ["Name", d.name],
        ["Company", d.company || "—"],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Location", [d.city, d.country].filter(Boolean).join(", ") || "—"],
        ["Property type", d.propertyType || "—"],
        ["Portfolio size", d.units || "—"],
        ["Interested in", d.services || "—"],
        ["Message", d.message || "—"],
      ]),
    });

    return ok({ reference: lead.reference, message: "Lead submitted" }, 201);
  } catch (err) {
    console.error("property-management POST failed", err);
    return serverError();
  }
}
