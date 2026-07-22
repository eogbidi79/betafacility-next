import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit Log", robots: { index: false } };

function when(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function AuditPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Audit Log</h1>
          <p className="text-sm text-ink-muted">Recent admin and staff actions (latest 200).</p>
        </div>
        <ButtonLink href="/portal" variant="outline" size="sm">
          ← Back to portal
        </ButtonLink>
      </div>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        {logs.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">No activity recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-ink-muted">
                  <th className="py-2">When</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Entity</th>
                  <th className="py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-gray-100 align-top">
                    <td className="py-2.5 text-ink-muted whitespace-nowrap">{when(l.createdAt)}</td>
                    <td className="py-2.5 text-ink">{l.actor}</td>
                    <td className="py-2.5">
                      <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-ink-soft">{l.action}</code>
                    </td>
                    <td className="py-2.5 text-ink-soft">
                      {l.entity}
                      {l.entityId ? <span className="text-ink-muted"> · {l.entityId.slice(0, 8)}</span> : null}
                    </td>
                    <td className="py-2.5 text-ink-soft">{l.summary || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Container>
  );
}
