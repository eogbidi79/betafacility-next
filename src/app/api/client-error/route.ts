import { ok } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

// Receives client-side errors (e.g. map load failures) and forwards them to
// Sentry via the server-only DSN. Always 204s so the beacon never blocks.
export async function POST(req: Request) {
  const limited = rateLimit(req, "client-error", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;
  try {
    const { message, context } = (await req.json().catch(() => ({}))) as {
      message?: string;
      context?: Record<string, unknown>;
    };
    if (typeof message === "string" && message.length > 0) {
      // Cap length so a hostile client can't flood Sentry with huge payloads.
      captureError(new Error(`[client] ${message.slice(0, 500)}`), { source: "client", ...context });
    }
  } catch {
    /* ignore malformed beacons */
  }
  return ok({ received: true }, 202);
}
