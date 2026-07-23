"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function CheckoutButton({ reference, label }: { reference: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.authorizationUrl) {
        setError(json.error || "Could not start payment.");
        setBusy(false);
        return;
      }
      window.location.href = json.data.authorizationUrl;
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <Button size="lg" fullWidth onClick={pay} disabled={busy}>
        {busy ? "Starting payment…" : label}
      </Button>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
