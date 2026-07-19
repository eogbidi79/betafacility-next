import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// The signing step now lives on the term-specific document. Keep this route as a
// stable redirect for any older links.
export default async function SignRedirect({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const booking = await prisma.booking.findUnique({ where: { reference } });
  if (!booking) notFound();
  if (booking.status === "PENDING") redirect(`/bookings/${reference}/pay`);
  redirect(`/bookings/${reference}/${booking.term === "long-term" ? "agreement" : "invoice"}`);
}
