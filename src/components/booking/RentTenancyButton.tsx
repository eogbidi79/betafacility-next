"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { formatNaira } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  pricePerYear: number;
};

export function RentTenancyButton({ slug, title, pricePerYear }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      const res = await fetch("/api/tenancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertySlug: slug,
          guestName: fd.guestName,
          guestEmail: fd.guestEmail,
          guestPhone: fd.guestPhone,
          tenantAddress: fd.tenantAddress,
          startDate: fd.startDate,
        }),
      });
      const app = await res.json();
      if (!res.ok) {
        setError(app.issues?.[0]?.message || app.error || "Could not start application.");
        setBusy(false);
        return;
      }
      const payRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: app.reference }),
      });
      const pay = await payRes.json();
      if (!payRes.ok || !pay.authorizationUrl) {
        setError(pay.error || "Could not start payment.");
        setBusy(false);
        return;
      }
      window.location.href = pay.authorizationUrl;
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        Rent for 1 Year — {formatNaira(pricePerYear)}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Apply to rent ${title}`}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Rent {title}</h2>
                <p className="text-sm text-ink-muted">
                  1-year tenancy · {formatNaira(pricePerYear)}/year
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-ink-muted hover:text-ink">
                ✕
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <Field label="Full Name" htmlFor="t-name" required>
                <Input id="t-name" name="guestName" required />
              </Field>
              <Field label="Email" htmlFor="t-email" required>
                <Input id="t-email" name="guestEmail" type="email" required />
              </Field>
              <Field label="Phone" htmlFor="t-phone" required>
                <Input id="t-phone" name="guestPhone" type="tel" required />
              </Field>
              <Field label="Your current address" htmlFor="t-addr" required>
                <Input id="t-addr" name="tenantAddress" required placeholder="Street, city" />
              </Field>
              <Field label="Preferred start date" htmlFor="t-start" required>
                <Input id="t-start" name="startDate" type="date" required min={today} />
              </Field>

              <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Annual rent</span>
                  <span className="font-bold text-ink">{formatNaira(pricePerYear)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  After payment you&apos;ll review and e-sign the 1-year tenancy agreement.
                </p>
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" disabled={busy}>
                {busy ? "Processing…" : `Pay & Apply — ${formatNaira(pricePerYear)}`}
              </Button>
              <p className="text-center text-xs text-ink-muted">
                Secure payment via Paystack · e-signed agreement · receipt
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
