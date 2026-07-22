import { NextResponse } from "next/server";

// Simple in-memory sliding-window limiter. Per-instance (fine for a single
// Render web service); swap the store for Redis/Upstash if you scale out.
type Hit = { count: number; resetAt: number };
const store = new Map<string, Hit>();

// Opportunistic cleanup so the map can't grow unbounded.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Returns a 429 response when the caller has exceeded `limit` requests per
 * `windowMs`, otherwise null (allow). Keyed by IP + bucket name.
 */
export function rateLimit(
  req: Request,
  bucket: string,
  { limit = 8, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): NextResponse | null {
  const now = Date.now();
  sweep(now);
  const key = `${bucket}:${clientIp(req)}`;
  const hit = store.get(key);

  if (!hit || hit.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  hit.count += 1;
  if (hit.count > limit) {
    const retry = Math.ceil((hit.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retry) } },
    );
  }
  return null;
}
