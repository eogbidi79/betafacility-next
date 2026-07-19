"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CancelBookingButton({ reference }: { reference: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings/${reference}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not cancel booking.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="print:hidden">
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Cancel booking
        </Button>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-ink-soft">
            Cancelling 48+ hours before check-in is fully refundable. Within 48 hours it&apos;s
            non-refundable but issued as a reusable voucher. Continue?
          </p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
              Keep booking
            </Button>
            <Button size="sm" onClick={confirm} disabled={busy}>
              {busy ? "Cancelling…" : "Confirm cancellation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
