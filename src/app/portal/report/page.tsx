import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PrintButton } from "@/components/booking/PrintButton";
import { Letterhead } from "@/components/booking/Letterhead";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status Report", robots: { index: false } };

export default async function ReportPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "STAFF") redirect("/portal");

  const [byStatus, byTerm, byStage, maint, listings, contacts, revenue] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amount: true } }),
    prisma.booking.groupBy({ by: ["term"], _count: { _all: true } }),
    prisma.booking.groupBy({ by: ["stage"], where: { term: "long-term" }, _count: { _all: true } }),
    prisma.maintenanceRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.advertiseSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.contactMessage.count(),
    prisma.booking.aggregate({ _sum: { amount: true }, where: { status: { in: ["PAID", "SIGNED"] } } }),
  ]);

  const generated = new Intl.DateTimeFormat("en-NG", { dateStyle: "full", timeStyle: "short" }).format(
    new Date(),
  );

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <ButtonLink href="/portal" variant="ghost" size="sm">← Back to portal</ButtonLink>
          <div className="flex gap-2">
            <a
              href="/api/portal/report"
              className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-semibold text-ink hover:border-ink"
            >
              Download CSV
            </a>
            <PrintButton />
          </div>
        </div>

        <article className="doc-a4 rounded-2xl border border-gray-200 bg-white p-8 shadow-card sm:p-10">
          <Letterhead docTitle="Status Report" reference={new Date().toISOString().slice(0, 10)} />
          <p className="mt-4 text-sm text-ink-muted">Generated {generated} · by {session?.user?.email}</p>

          <Section title="Revenue">
            <Row label="Confirmed revenue (paid + signed)" value={formatNaira(revenue._sum.amount ?? 0)} strong />
          </Section>

          <Section title="Bookings by status">
            {byStatus.length === 0 ? <Empty /> : byStatus.map((r) => (
              <Row
                key={r.status}
                label={r.status}
                value={`${r._count._all}  ·  ${formatNaira(r._sum.amount ?? 0)}`}
              />
            ))}
          </Section>

          <Section title="Bookings by type">
            {byTerm.map((r) => (
              <Row key={r.term} label={r.term === "long-term" ? "Long-term (1-year)" : "Short-let"} value={String(r._count._all)} />
            ))}
          </Section>

          <Section title="Tenancy applications by stage">
            {byStage.length === 0 ? <Empty /> : byStage.map((r) => (
              <Row key={r.stage ?? "none"} label={r.stage ?? "APPLIED"} value={String(r._count._all)} />
            ))}
          </Section>

          <Section title="Maintenance requests by status">
            {maint.length === 0 ? <Empty /> : maint.map((r) => (
              <Row key={r.status} label={r.status.replace("_", " ")} value={String(r._count._all)} />
            ))}
          </Section>

          <Section title="Listing submissions by status">
            {listings.length === 0 ? <Empty /> : listings.map((r) => (
              <Row key={r.status} label={r.status} value={String(r._count._all)} />
            ))}
          </Section>

          <Section title="Contact messages">
            <Row label="Total received" value={String(contacts)} />
          </Section>

          <p className="mt-8 text-center text-xs text-ink-muted">
            BetaFacility Managers Limited · confidential operational report
          </p>
        </article>
      </div>
    </Container>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-gray-200 pb-1 text-sm font-bold uppercase tracking-wide text-brand-600">
        {title}
      </h2>
      <dl className="mt-2 space-y-1 text-sm">{children}</dl>
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={strong ? "font-bold text-brand-600 tabular" : "font-medium text-ink tabular"}>{value}</dd>
    </div>
  );
}

function Empty() {
  return <p className="py-1 text-sm text-ink-muted">None.</p>;
}
