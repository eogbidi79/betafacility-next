import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PrintButton } from "@/components/booking/PrintButton";
import { Letterhead } from "@/components/booking/Letterhead";
import { AgreementSigning } from "@/components/booking/AgreementSigning";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";
import {
  TENANCY_CLAUSES,
  TENANCY_DOS,
  TENANCY_DONTS,
  INFLATION_CLAUSE,
} from "@/data/legal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tenancy Agreement", robots: { index: false } };

function fmt(d: Date | null) {
  return d ? new Intl.DateTimeFormat("en-NG", { dateStyle: "long" }).format(d) : "—";
}

export default async function AgreementPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) notFound();
  if (booking.term !== "long-term") redirect(`/bookings/${reference}/invoice`);
  if (booking.status === "PENDING") redirect(`/bookings/${reference}/pay`);

  const signed = booking.status === "SIGNED";

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <ButtonLink href={`/bookings/${reference}/receipt`} variant="ghost" size="sm">
            ← Receipt
          </ButtonLink>
          {signed && <PrintButton />}
        </div>

        {signed && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 print:hidden">
            Agreement executed by all parties ✓ — you can print or save a copy.
          </div>
        )}

        <article className="doc-a4 rounded-2xl border border-gray-200 bg-white p-8 shadow-card sm:p-10">
          <Letterhead docTitle="Tenancy Agreement" reference={booking.reference} />

          <h1 className="mt-6 text-center text-xl font-bold text-ink">
            ONE (1) YEAR TENANCY AGREEMENT
          </h1>
          <p className="mt-2 text-center text-sm text-ink-muted">
            Made on {fmt(booking.signedAt ?? booking.paidAt ?? booking.createdAt)}
          </p>

          {/* Parties */}
          <section className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <Party title="Landlord">
              {booking.landlordName || "Property Owner"}
              <br />
              c/o {site.legalName}
            </Party>
            <Party title="Managing Agent">
              {site.legalName}
              <br />
              {site.address.full}
            </Party>
            <Party title="Tenant">
              {booking.guestName}
              <br />
              {booking.guestEmail}
              <br />
              {booking.guestPhone}
              {booking.tenantAddress ? (
                <>
                  <br />
                  {booking.tenantAddress}
                </>
              ) : null}
            </Party>
          </section>

          {/* Property & terms */}
          <section className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
            <Line label="Property" value={booking.propertyTitle || "—"} />
            <Line label="Address" value={booking.propertyAddress || "—"} />
            <Line label="Term" value={`12 months: ${fmt(booking.checkIn)} to ${fmt(booking.checkOut)}`} />
            <Line label="Annual Rent" value={formatNaira(booking.amount)} />
            <Line
              label="Payment status"
              value={signed ? "Paid & executed" : "Paid — awaiting signature"}
            />
          </section>

          {/* Clauses */}
          <section className="mt-6 space-y-3 text-sm leading-relaxed text-ink-soft">
            {TENANCY_CLAUSES.map((c) => (
              <div key={c.title}>
                <h2 className="font-bold text-ink">{c.title}</h2>
                <p>{c.body}</p>
              </div>
            ))}

            <div>
              <h2 className="font-bold text-ink">8. {INFLATION_CLAUSE.heading}</h2>
              <p>{INFLATION_CLAUSE.body}</p>
            </div>
          </section>

          {/* Dos & Don'ts */}
          <section className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="font-bold text-green-800">Tenant shall (Do)</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-green-900">
                {TENANCY_DOS.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="font-bold text-red-800">Tenant shall not (Don&apos;t)</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-red-900">
                {TENANCY_DONTS.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Consent note */}
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {signed
              ? `The Tenant expressly accepted the rent-review (inflation) clause on ${fmt(
                  booking.inflationConsentAt,
                )}.`
              : "By signing below, the Tenant confirms acceptance of all clauses above, including the rent-review (inflation) clause."}
          </p>

          {/* Sign-off */}
          <section className="doc-page-break mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Execution</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <SignBlock title="Tenant" name={booking.guestName} date={fmt(booking.signedAt)}>
                {signed && booking.signatureRef ? (
                  <Image
                    src={booking.signatureRef}
                    alt="Tenant signature"
                    width={180}
                    height={64}
                    unoptimized
                    className="h-14 w-auto"
                  />
                ) : null}
              </SignBlock>
              <SignBlock
                title="For the Managing Agent"
                name={booking.repName || site.representative.name}
                subtitle={site.representative.title}
                date={fmt(booking.repSignedAt)}
              >
                {signed ? <p className="font-signature text-lg italic text-ink">{site.representative.name}</p> : null}
              </SignBlock>
              <SignBlock
                title="Landlord / Owner"
                name={booking.landlordName || "Property Owner"}
                date={fmt(booking.landlordSignedAt)}
              >
                {signed ? <p className="text-lg italic text-ink">Signed on record</p> : null}
              </SignBlock>
            </div>
          </section>

          {!signed && (
            <section className="mt-8">
              <AgreementSigning reference={booking.reference} />
            </section>
          )}
        </article>
      </div>
    </Container>
  );
}

function Party({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{title}</p>
      <p className="mt-1 text-ink">{children}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}

function SignBlock({
  title,
  name,
  subtitle,
  date,
  children,
}: {
  title: string;
  name: string;
  subtitle?: string;
  date: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{title}</p>
      <div className="mt-2 flex h-16 items-end border-b border-ink/40">{children}</div>
      <p className="mt-1 text-sm font-semibold text-ink">{name}</p>
      {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
      <p className="text-xs text-ink-muted">Date: {date}</p>
    </div>
  );
}
