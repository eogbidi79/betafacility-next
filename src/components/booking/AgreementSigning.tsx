"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { INFLATION_CLAUSE } from "@/data/legal";

export function AgreementSigning({ reference }: { reference: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    dirty.current = true;
    const { x, y } = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function end() {
    drawing.current = false;
  }
  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
  }

  async function submit() {
    if (!consent) {
      setError("Please accept the rent-review (inflation) clause to continue.");
      return;
    }
    if (!dirty.current) {
      setError("Please draw your signature.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const signature = canvasRef.current?.toDataURL("image/png") || "";
      const res = await fetch(`/api/bookings/${reference}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature, inflationConsent: consent }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not sign the agreement.");
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
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-bold text-amber-800">{INFLATION_CLAUSE.heading}</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900">{INFLATION_CLAUSE.body}</p>
        <label className="mt-3 flex items-start gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500"
          />
          I have read and accept the rent-review (inflation) clause above.
        </label>
      </div>

      <p className="mt-6 text-sm font-semibold text-ink">Tenant signature</p>
      <div className="mt-2 overflow-hidden rounded-xl border-2 border-dashed border-gray-300">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-40 w-full touch-none bg-white"
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={clear} disabled={busy}>
          Clear
        </Button>
        <Button onClick={submit} disabled={busy || !consent} className="flex-1">
          {busy ? "Signing…" : "Accept & Sign Agreement"}
        </Button>
      </div>
    </div>
  );
}
