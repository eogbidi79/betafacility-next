// Client-side event tracking + error reporting. No-ops until PostHog/GA are
// configured (their scripts only load when keys are set — see Analytics.tsx),
// so calling these without keys is safe.

type Props = Record<string, unknown>;

/** Fire a semantic product event to PostHog and Google Analytics (if present). */
export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    posthog?: { capture?: (e: string, p?: Props) => void };
    gtag?: (...args: unknown[]) => void;
  };
  try {
    w.posthog?.capture?.(event, props);
  } catch {
    /* ignore */
  }
  try {
    w.gtag?.("event", event, props);
  } catch {
    /* ignore */
  }
}

/**
 * Report a client-side error. Captures it in PostHog and forwards it to Sentry
 * via a server route (the Sentry DSN is server-only). No-op without keys.
 */
export function reportClientError(message: string, context?: Props): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { posthog?: { capture?: (e: string, p?: Props) => void } };
  try {
    w.posthog?.capture?.("client_error", { message, ...context });
  } catch {
    /* ignore */
  }
  try {
    const body = JSON.stringify({ message, context });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/client-error", body);
    } else {
      void fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* ignore */
  }
}
