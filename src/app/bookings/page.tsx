import { Container } from "@/components/ui/Container";
import { BookingLookup } from "@/components/booking/BookingLookup";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Track a Booking",
  description:
    "Look up your BetaFacility booking by reference to view its status and receipt.",
  path: "/bookings",
});

export default function BookingsLookupPage() {
  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-ink">Track a booking</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Enter the reference from your booking confirmation to view its status and receipt.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
          <BookingLookup />
        </div>
      </div>
    </Container>
  );
}
