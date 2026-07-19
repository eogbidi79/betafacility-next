"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function GuarantorConsent({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/guarantor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not record your consent.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        Thank you — your consent to act as guarantor has been recorded.
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-ink-soft">
        <input type="checkbox" id="ack" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500" />
        I confirm I have read the above and consent to act as guarantor for this tenancy.
      </label>
      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button
        className="mt-4"
        size="lg"
        fullWidth
        disabled={state === "busy"}
        onClick={(e) => {
          const ack = (e.currentTarget.closest("div")?.querySelector("#ack") as HTMLInputElement)?.checked;
          if (!ack) {
            setError("Please tick the box to confirm.");
            return;
          }
          confirm();
        }}
      >
        {state === "busy" ? "Confirming…" : "Confirm Guarantor Consent"}
      </Button>
    </div>
  );
}
