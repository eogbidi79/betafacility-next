import { prisma } from "@/lib/db";
import { advertiseSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseJson(req, advertiseSchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    const submission = await prisma.advertiseSubmission.create({
      data: {
        reference: makeReference("ADV"),
        name: d.name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        propertyClass: d.propertyClass,
        listingType: d.listingType,
        title: d.title,
        category: d.category,
        location: d.location,
        price: d.price,
        description: d.description,
        imageCount: d.imageCount,
      },
    });
    await sendEmail({
      to: [notifyTo.sales],
      replyTo: d.email,
      subject: `New property listing (pending) — ${submission.reference}`,
      html: emailLayout("New advertise submission", [
        ["Reference", submission.reference],
        ["From", `${d.name} (${d.role})`],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Title", d.title],
        ["Class / Listing", `${d.propertyClass} · ${d.listingType}`],
        ["Location", d.location],
        ["Price", formatNaira(d.price)],
      ]),
    });
    return ok(
      { reference: submission.reference, message: "Submitted for approval" },
      201,
    );
  } catch (err) {
    console.error("advertise POST failed", err);
    return serverError();
  }
}
