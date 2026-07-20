// Email notifications. Uses Resend's REST API when RESEND_API_KEY is set;
// otherwise logs to the server console so the flow works in local dev.

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

const FROM = process.env.EMAIL_FROM || "BetaFacility Managers <info@betafacility.com>";

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  // Normalize recipients: accept arrays and comma-separated values, dedupe.
  const recipients = [...new Set(
    (Array.isArray(to) ? to : [to])
      .flatMap((t) => String(t).split(","))
      .map((t) => t.trim())
      .filter(Boolean),
  )];

  if (!key) {
    console.info(`[email:dev] → ${recipients.join(", ")} | ${subject}`);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: recipients,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend error", res.status, await res.text());
    }
  } catch (err) {
    // Never let a notification failure break the request.
    console.error("[email] send failed", err);
  }
}

export const notifyTo = {
  contact: process.env.NOTIFY_CONTACT_TO || "info@betafacility.com",
  sales: process.env.NOTIFY_SALES_TO || "sales@betafacility.com",
  maintenance: process.env.NOTIFY_MAINTENANCE_TO || "info@betafacility.com",
  payments: process.env.NOTIFY_PAYMENTS_TO || "payments@betafacility.com",
  admin: process.env.NOTIFY_ADMIN_TO || "admin@betafacility.com",
};

/** Minimal HTML wrapper for notification bodies. */
export function emailLayout(title: string, rows: [string, string][], note?: string): string {
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#545454;font-weight:600">${k}</td><td style="padding:6px 12px;color:#1a1a1a">${v}</td></tr>`,
    )
    .join("");
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
    <h2 style="color:#ff751f">${title}</h2>
    <table style="border-collapse:collapse;width:100%">${body}</table>
    ${note ? `<p style="color:#545454;margin-top:16px">${note}</p>` : ""}
    <p style="color:#98a2b3;font-size:12px;margin-top:24px">BetaFacility Managers Limited · Ogombo, Ajah, Lagos</p>
  </div>`;
}
