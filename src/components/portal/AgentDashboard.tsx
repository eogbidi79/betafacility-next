import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { formatNaira } from "@/lib/utils";

function when(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export async function AgentDashboard({ email, name }: { email: string; name?: string | null }) {
  const listings = await prisma.advertiseSubmission.findMany({
    where: { email: { equals: email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
  });

  const approved = listings.filter((l) => l.status === "APPROVED").length;
  const pending = listings.filter((l) => l.status === "PENDING").length;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Agent Portal</h1>
          <p className="text-sm text-ink-muted">Welcome{name ? `, ${name}` : ""} · {email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total listings" value={String(listings.length)} />
        <Stat label="Approved" value={String(approved)} />
        <Stat label="Pending review" value={String(pending)} />
      </div>

      <div className="mt-6">
        <ButtonLink href="/advertise" size="sm">+ Submit a new property</ButtonLink>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">My submitted listings</h2>
        {listings.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">
            No listings yet. <Link href="/advertise" className="font-medium text-brand-600">Submit one →</Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-gray-100">
            {listings.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{l.title}</p>
                  <p className="text-xs text-ink-muted tabular">
                    {l.reference} · {l.location} · {formatNaira(l.price)} · {when(l.createdAt)}
                  </p>
                </div>
                <Badge tone={l.status === "APPROVED" ? "success" : l.status === "REJECTED" ? "neutral" : "brand"}>
                  {l.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
      <p className="text-3xl font-extrabold text-brand-600">{value}</p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
