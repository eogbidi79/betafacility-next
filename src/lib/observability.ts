// Lightweight error capture. Always logs; additionally forwards to Sentry when
// SENTRY_DSN is configured (no heavy SDK — a minimal store-endpoint POST).
// Best-effort and non-blocking: reporting must never break a request.

type Ctx = Record<string, unknown>;

function parseDsn(dsn: string) {
  // https://<publicKey>@<host>/<projectId>
  const m = /^https:\/\/([^@]+)@([^/]+)\/(.+)$/.exec(dsn.trim());
  if (!m) return null;
  const [, publicKey, host, projectId] = m;
  return {
    publicKey,
    url: `https://${host}/api/${projectId}/store/`,
  };
}

export function captureError(err: unknown, context?: Ctx): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  console.error("[error]", message, context ?? "", stack ?? "");

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error",
    environment: process.env.NODE_ENV || "production",
    message,
    extra: { stack, ...context },
  };

  // Fire-and-forget.
  void fetch(parsed.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${parsed.publicKey}, sentry_client=betafacility/1.0`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* swallow */
  });
}
