import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { isSuperAdmin } from "@/lib/rbac";
import { r2Configured } from "@/lib/r2";
import { meiliEnabled } from "@/lib/meilisearch";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings", robots: { index: false } };

// Reports whether each integration is configured — never reveals secret values.
export default async function SettingsPage() {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.role)) redirect("/portal");

  const integrations: { name: string; on: boolean; note: string }[] = [
    { name: "Database (Postgres)", on: !!process.env.DATABASE_URL, note: "Neon / Postgres connection" },
    { name: "Auth secret", on: !!process.env.AUTH_SECRET, note: "Session signing" },
    { name: "Payments (Paystack)", on: !!process.env.PAYSTACK_SECRET_KEY, note: "Test/live payments" },
    { name: "Email (Resend)", on: !!process.env.RESEND_API_KEY, note: "Transactional email" },
    { name: "Image storage (Cloudflare R2)", on: r2Configured, note: "Uploads; falls back to inline" },
    { name: "Maps (Mapbox)", on: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN, note: "Falls back to OpenStreetMap" },
    { name: "Search (Meilisearch)", on: meiliEnabled(), note: "Falls back to Postgres search" },
    { name: "Analytics (Google)", on: !!process.env.NEXT_PUBLIC_GA_ID, note: "GA4" },
    { name: "Analytics (PostHog)", on: !!process.env.NEXT_PUBLIC_POSTHOG_KEY, note: "Product analytics" },
    { name: "Error tracking (Sentry)", on: !!process.env.SENTRY_DSN, note: "Server error capture" },
  ];

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink">Settings</h1>
      <p className="text-sm text-ink-muted">
        Integration status for this deployment. Configure keys in your host (Render → Environment).
      </p>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Integrations</h2>
        <ul className="mt-4 divide-y divide-gray-100">
          {integrations.map((i) => (
            <li key={i.name} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-medium text-ink">{i.name}</p>
                <p className="text-xs text-ink-muted">{i.note}</p>
              </div>
              <Badge tone={i.on ? "success" : "neutral"}>{i.on ? "Configured" : "Not set"}</Badge>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink-muted">
          Optional integrations degrade gracefully — the site works without them and lights up when a key is added.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Your account</h2>
        <p className="mt-2 text-sm text-ink-soft">
          {session?.user?.name || "—"} · {session?.user?.email}
        </p>
      </section>
    </Container>
  );
}
