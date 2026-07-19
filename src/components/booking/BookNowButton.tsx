"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { formatNaira } from "@/lib/utils";

type Props = {
  slug: string;
  title: string;
  pricePerNight: number;
  size?: "sm" | "md" | "lg";
};

const MS_PER_DAY = 86_400_000;

export function BookNowButton({ slug, title, pricePerNight, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((+new Date(checkOut) - +new Date(checkIn)) / MS_PER_DAY))
      : 0;
  const total = nights * pricePerNight;
  const today = new Date().toISOString().slice(0, 10);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalSlug: slug,
          guestName: fd.guestName,
          guestEmail: fd.guestEmail,
          guestPhone: fd.guestPhone,
          checkIn: fd.checkIn,
          checkOut: fd.checkOut,
          voucherCode: fd.voucherCode || "",
        }),
      });
      const booking = await bookingRes.json();
      if (!bookingRes.ok) {
        setError(booking.issues?.[0]?.message || booking.error || "Could not create booking.");
        setBusy(false);
        return;
      }

      const payRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: booking.reference }),
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
      <Button size={size} onClick={() => setOpen(true)}>
        Book Now
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Book ${title}`}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Book {title}</h2>
                <p className="text-sm text-ink-muted">{formatNaira(pricePerNight)} / night</p>
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

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in" htmlFor="checkIn" required>
                  <Input
                    id="checkIn"
                    name="checkIn"
                    type="date"
                    required
                    min={today}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </Field>
                <Field label="Check-out" htmlFor="checkOut" required>
                  <Input
                    id="checkOut"
                    name="checkOut"
                    type="date"
                    required
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Full Name" htmlFor="guestName" required>
                <Input id="guestName" name="guestName" required />
              </Field>
              <Field label="Email" htmlFor="guestEmail" required>
                <Input id="guestEmail" name="guestEmail" type="email" required />
              </Field>
              <Field label="Phone" htmlFor="guestPhone" required>
                <Input id="guestPhone" name="guestPhone" type="tel" required />
              </Field>

              <Field label="Voucher code (optional)" htmlFor="voucherCode">
                <Input
                  id="voucherCode"
                  name="voucherCode"
                  placeholder="VCHR-XXXXXXXX"
                  autoComplete="off"
                  className="tabular uppercase"
                />
              </Field>

              {nights > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                  <span className="text-ink-muted">
                    {nights} night{nights > 1 ? "s" : ""} × {formatNaira(pricePerNight)}
                  </span>
                  <span className="font-bold text-ink">{formatNaira(total)}</span>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth size="lg" disabled={busy || nights < 1}>
                {busy ? "Processing…" : `Pay & Book${total ? ` — ${formatNaira(total)}` : ""}`}
              </Button>
              <p className="text-center text-xs text-ink-muted">
                Secure payment via Paystack · e-sign · instant receipt
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
