import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } });

  const header = [
    "Reference",
    "Term",
    "Guest",
    "Email",
    "Phone",
    "Property/Unit",
    "CheckIn",
    "CheckOut",
    "Nights",
    "Amount",
    "Status",
    "Stage",
    "PaidAt",
    "SignedAt",
    "CreatedAt",
  ];

  const rows = bookings.map((b) =>
    [
      b.reference,
      b.term,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
      b.propertyTitle ?? "",
      b.checkIn.toISOString().slice(0, 10),
      b.checkOut.toISOString().slice(0, 10),
      b.nights,
      b.amount,
      b.status,
      b.stage ?? "",
      b.paidAt ? b.paidAt.toISOString() : "",
      b.signedAt ? b.signedAt.toISOString() : "",
      b.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="betafacility-bookings-${date}.csv"`,
    },
  });
}
