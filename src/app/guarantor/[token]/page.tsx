import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { GuarantorConsent } from "@/components/booking/GuarantorConsent";
import { formatNaira } from "@/lib/utils";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guarantor Confirmation", robots: { index: false } };

export default async function GuarantorPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({ where: { guarantorToken: token } });
  if (!booking) notFound();

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-card">
        <h1 className="text-xl font-bold text-ink">Guarantor confirmation</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {site.legalName} · 1-year tenancy application
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
          <Row label="Applicant (tenant)" value={booking.guestName} />
          <Row label="Guarantor" value={booking.guarantorName ?? "—"} />
          <Row label="Property" value={booking.propertyTitle ?? "—"} />
          <Row label="Annual rent" value={formatNaira(booking.amount)} />
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          As guarantor, you agree to guarantee the tenant&apos;s obligations under the tenancy
          (including rent and any charges) should the tenant default, for the duration of the
          agreement. {site.legalName} will contact you only in connection with this tenancy.
        </p>

        <div className="mt-6">
          {booking.guarantorConsent ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <Badge tone="success">Confirmed</Badge>
              <p className="mt-2">You have already confirmed your consent for this tenancy. Thank you.</p>
            </div>
          ) : (
            <GuarantorConsent token={token} />
          )}
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
