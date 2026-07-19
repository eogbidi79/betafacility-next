// Paystack integration. When PAYSTACK_SECRET_KEY is unset, callers fall back to
// a local dev simulation so the booking → pay → sign → receipt flow still works.

const BASE = "https://api.paystack.co";

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

type InitArgs = {
  reference: string;
  email: string;
  /** Amount in Naira; converted to kobo for Paystack. */
  amountNaira: number;
  metadata?: Record<string, unknown>;
};

export async function initializeTransaction({
  reference,
  email,
  amountNaira,
  metadata,
}: InitArgs): Promise<{ authorizationUrl: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference,
      email,
      amount: Math.round(amountNaira * 100), // kobo
      currency: "NGN",
      callback_url: `${siteUrl()}/api/payments/verify`,
      metadata,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialization failed");
  }
  return { authorizationUrl: json.data.authorization_url as string };
}

export async function verifyTransaction(
  reference: string,
): Promise<{ success: boolean; paidAt: Date | null; raw: unknown }> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const json = await res.json();
  const success = Boolean(json?.status && json?.data?.status === "success");
  const paidAt = json?.data?.paid_at ? new Date(json.data.paid_at) : null;
  return { success, paidAt, raw: json };
}
