import { prisma } from "@/lib/db";
import { advertiseSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { formatNaira } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(req, "advertise", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

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
        transactionType: d.transactionType,
        propertyClass: d.propertyClass,
        listingType: d.listingType,
        title: d.title,
        category: d.category,
        location: d.location,
        price: d.price,
        description: d.description,
        imageUrl: d.imageUrl || null,
        imageCount: d.imageCount,
      },
    });
    await sendEmail({
      to: [notifyTo.sales, notifyTo.admin],
      replyTo: d.email,
      subject: `New property listing (pending review) — ${submission.reference}`,
      html: emailLayout("New advertise submission", [
        ["Reference", submission.reference],
        ["From", `${d.name} (${d.role})`],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Title", d.title],
        ["For", d.transactionType],
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
    captureError(err, { route: "advertise" });
    return serverError();
  }
}
