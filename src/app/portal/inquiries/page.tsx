import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { isSuperAdmin, isStaff } from "@/lib/rbac";
import { setInquiryHandled } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inquiries", robots: { index: false } };

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function InquiriesPage() {
  const role = (await auth())?.user?.role;
  // Inquiries are global (no country); super admin + staff only.
  if (!isSuperAdmin(role) && !isStaff(role)) redirect("/portal");
  const canEdit = isSuperAdmin(role);

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <Container className="py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-ink">Inquiries</h1>
      <p className="text-sm text-ink-muted">Contact-form messages ({messages.length}).</p>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        {messages.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {messages.map((m) => (
              <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-[240px] max-w-2xl">
                  <p className="font-medium text-ink">
                    {m.name} <span className="text-ink-muted">· {m.inquiryType}</span>
                  </p>
                  <p className="text-xs text-ink-muted">
                    {m.email}
                    {m.phone ? ` · ${m.phone}` : ""} · {since(m.createdAt)}
                  </p>
                  <p className="mt-1 text-ink-soft">{m.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={m.handled ? "success" : "brand"}>{m.handled ? "Handled" : "New"}</Badge>
                  {canEdit && (
                    <form action={setInquiryHandled}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="handled" value={String(!m.handled)} />
                      <button className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-ink">
                        {m.handled ? "Reopen" : "Mark handled"}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
