import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validation";
import { parseJson, ok, serverError } from "@/lib/api";
import { sendEmail, emailLayout, notifyTo } from "@/lib/email";

export const runtime = "nodejs";

function contactRecipient(inquiryType: string): string {
  if (/property management/i.test(inquiryType)) return notifyTo.sales;
  if (/maintenance/i.test(inquiryType)) return notifyTo.maintenance;
  return notifyTo.contact;
}

export async function POST(req: Request) {
  const parsed = await parseJson(req, contactSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const msg = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        inquiryType: parsed.data.inquiryType,
        message: parsed.data.message,
      },
    });
    await sendEmail({
      to: contactRecipient(parsed.data.inquiryType),
      replyTo: parsed.data.email,
      subject: `New contact: ${parsed.data.inquiryType}`,
      html: emailLayout("New contact message", [
        ["Name", parsed.data.name],
        ["Email", parsed.data.email],
        ["Phone", parsed.data.phone || "—"],
        ["Inquiry", parsed.data.inquiryType],
        ["Message", parsed.data.message],
      ]),
    });
    return ok({ id: msg.id, message: "Message received" }, 201);
  } catch (err) {
    console.error("contact POST failed", err);
    return serverError();
  }
}
