"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SignaturePad({ reference }: { reference: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Scale for crisp lines on HiDPI.
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    dirty.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
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

  async function confirm() {
    if (!dirty.current) {
      setError("Please draw your signature first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const signature = canvasRef.current?.toDataURL("image/png") || "";
      const res = await fetch(`/api/bookings/${reference}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not save signature.");
        setBusy(false);
        return;
      }
      router.push(`/bookings/${reference}/receipt`);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-48 w-full touch-none bg-white"
        />
      </div>
      <p className="mt-2 text-xs text-ink-muted">Draw your signature in the box above.</p>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={clear} disabled={busy}>
          Clear
        </Button>
        <Button onClick={confirm} disabled={busy} className="flex-1">
          {busy ? "Saving…" : "Confirm & Sign"}
        </Button>
      </div>
    </div>
  );
}
