import { prisma } from "@/lib/db";
import { maintenanceSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { makeReference } from "@/lib/reference";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = rateLimit(req, "maintenance", { limit: 6, windowMs: 60_000 });
  if (limited) return limited;

  const parsed = await parseJson(req, maintenanceSchema);
  if (!parsed.ok) return parsed.response;

  const d = parsed.data;
  try {
    const request = await prisma.maintenanceRequest.create({
      data: {
        reference: makeReference("FM"),
        kind: d.kind,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        unit: d.unit,
        address: d.address || null,
        category: d.category || null,
        priority: d.priority || null,
        service: d.service || null,
        preferredAt: d.preferredAt ? new Date(d.preferredAt) : null,
        description: d.description || null,
        mediaCount: d.mediaCount,
      },
    });
    await sendEmail({
      to: [notifyTo.maintenance, notifyTo.admin],
      replyTo: d.email,
      subject: `New ${d.kind === "booking" ? "maintenance booking" : "issue report"} — ${request.reference}`,
      html: emailLayout("Facility request", [
        ["Reference", request.reference],
        ["Type", d.kind],
        ["Name", d.fullName],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Unit", d.unit],
        ["Category", d.category || d.service || "—"],
        ["Priority", d.priority || "—"],
        ["Details", d.description || "—"],
      ]),
    });
    return ok(
      { reference: request.reference, message: "Request received" },
      201,
    );
  } catch (err) {
    captureError(err, { route: "maintenance" });
    return serverError();
  }
}
