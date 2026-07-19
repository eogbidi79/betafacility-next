"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function BookingLookup() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ref = String(fd.get("reference") || "").trim().toUpperCase();
    if (!ref) return;
    setBusy(true);
    router.push(`/bookings/${encodeURIComponent(ref)}/receipt`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Booking reference" htmlFor="reference" required>
        <Input
          id="reference"
          name="reference"
          required
          placeholder="e.g. BKG-7F3K2Q9A"
          autoComplete="off"
          className="tabular uppercase"
        />
      </Field>
      <Button type="submit" size="lg" fullWidth disabled={busy}>
        {busy ? "Looking up…" : "View Booking"}
      </Button>
    </form>
  );
}
