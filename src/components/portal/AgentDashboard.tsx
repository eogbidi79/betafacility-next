import Link from "next/link";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { formatNaira } from "@/lib/utils";
import { ORG_KIND_LABEL, orgLocation } from "@/lib/organizations";

function when(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export async function AgentDashboard({ email, name }: { email: string; name?: string | null }) {
  const [listings, org] = await Promise.all([
    prisma.advertiseSubmission.findMany({
      where: { email: { equals: email, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findFirst({
      where: { userEmail: { equals: email, mode: "insensitive" } },
    }),
  ]);

  const approved = listings.filter((l) => l.status === "APPROVED").length;
  const pending = listings.filter((l) => l.status === "PENDING").length;

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {org ? org.name : "Agent Portal"}
          </h1>
          <p className="text-sm text-ink-muted">Welcome{name ? `, ${name}` : ""} · {email}</p>
        </div>
        <SignOutButton />
      </div>

      {org && (
        <section className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{ORG_KIND_LABEL[org.kind] ?? "Partner"} profile</span>
              <Badge tone={org.verified ? "success" : "neutral"}>
                {org.verified ? "✓ Verified" : "Pending verification"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-ink-muted">{orgLocation(org) || "Location not set"}</p>
          </div>
          {org.verified && org.active && (
            <ButtonLink href={`/agencies/${org.slug}`} size="sm" variant="outline" className="ml-auto">
              View public page
            </ButtonLink>
          )}
        </section>
      )}

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
