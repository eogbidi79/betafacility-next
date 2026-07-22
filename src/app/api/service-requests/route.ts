import { prisma } from "@/lib/db";
import { serviceRequestSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseJson(req, serviceRequestSchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    // Resolve the service (if one was chosen) to attach the vendor + category.
    const service = d.serviceId
      ? await prisma.service.findUnique({
          where: { id: d.serviceId },
          include: { organization: true },
        })
      : null;

    const request = await prisma.serviceRequest.create({
      data: {
        reference: makeReference("SRV"),
        serviceId: service?.id ?? null,
        vendorOrgId: service?.organizationId ?? null,
        category: service?.category ?? null,
        name: d.name,
        email: d.email,
        phone: d.phone,
        location: d.location || null,
        preferredAt: d.preferredAt ? new Date(d.preferredAt) : null,
        message: d.message,
      },
    });

    const recipients = [notifyTo.maintenance, notifyTo.admin];
    if (service?.organization?.email) recipients.push(service.organization.email);

    await sendEmail({
      to: recipients,
      replyTo: d.email,
      subject: `New service request — ${request.reference}`,
      html: emailLayout("New service request", [
        ["Reference", request.reference],
        ["Service", service?.title ?? "General enquiry"],
        ["Category", service?.category ?? "—"],
        ["Vendor", service?.organization?.name ?? "—"],
        ["From", `${d.name} (${d.email}, ${d.phone})`],
        ["Location", d.location || "—"],
        ["Preferred date", d.preferredAt || "—"],
        ["Message", d.message],
      ]),
    });

    return ok({ reference: request.reference, message: "Request submitted" }, 201);
  } catch (err) {
    console.error("service-request POST failed", err);
    return serverError();
  }
}
