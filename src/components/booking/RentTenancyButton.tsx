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
  const [reference, setReference] = useState<string | null>(null);
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
          guarantorName: fd.guarantorName,
          guarantorPhone: fd.guarantorPhone,
          startDate: fd.startDate,
        }),
      });
      const app = await res.json();
      if (!res.ok) {
        setError(app.issues?.[0]?.message || app.error || "Could not submit application.");
        setBusy(false);
        return;
      }
      setReference(app.reference);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        Apply for 1-Year Tenancy — {formatNaira(pricePerYear)}
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
                <h2 className="text-lg font-bold text-ink">
                  {reference ? "Application submitted" : `Apply for ${title}`}
                </h2>
                <p className="text-sm text-ink-muted">
                  1-year tenancy · {formatNaira(pricePerYear)}/year
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            {reference ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Thank you! Your application (ref <span className="font-bold tabular">{reference}</span>)
                  has been received. We&apos;ll run background &amp; guarantor checks and email you at each
                  step. No payment is due until your application is accepted.
                </div>
                <Button fullWidth onClick={() => setOpen(false)}>
                  Done
                </Button>
              </div>
            ) : (
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
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Guarantor name" htmlFor="t-gname" required>
                    <Input id="t-gname" name="guarantorName" required />
                  </Field>
                  <Field label="Guarantor phone" htmlFor="t-gphone" required>
                    <Input id="t-gphone" name="guarantorPhone" type="tel" required />
                  </Field>
                </div>
                <Field label="Preferred start date" htmlFor="t-start" required>
                  <Input id="t-start" name="startDate" type="date" required min={today} />
                </Field>

                <div className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-ink-muted">
                  We&apos;ll review your application (background &amp; guarantor checks) and email you.
                  Payment of {formatNaira(pricePerYear)} is only requested once you&apos;re accepted —
                  then you&apos;ll e-sign the agreement.
                </div>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <Button type="submit" fullWidth size="lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit Application"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
