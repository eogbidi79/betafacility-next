import type { AdvertiseSubmission } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/currency";

export const TXN_LABEL: Record<string, string> = {
  RENT: "For Rent",
  SELL: "For Sale",
  BUY: "Wanted to Buy",
};

export function ListingCard({ listing }: { listing: AdvertiseSubmission }) {
  const label = TXN_LABEL[listing.transactionType] ?? "Listing";
  const priceSuffix =
    listing.transactionType === "RENT"
      ? "per year"
      : listing.transactionType === "BUY"
        ? "budget"
        : "";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 to-gray-100">
        {listing.imageUrl ? (
          // Agent-supplied external URL — plain img (no next/image remote config needed).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-600/40">
            <span className="text-4xl font-extrabold">Beta</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="brand">{label}</Badge>
          {listing.featured && <Badge tone="success">★ Featured</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">{listing.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-ink-muted">
          {[listing.location, listing.country].filter(Boolean).join(", ")}
        </p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{listing.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft">
            {listing.category}
          </span>
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft">
            {listing.propertyClass}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-2xl font-bold text-ink">
              {formatMoney(listing.price, listing.currencyCode)}
            </span>
            {priceSuffix && <span className="block text-xs text-ink-muted">{priceSuffix}</span>}
          </div>
          <ButtonLink href={`/contact?ref=${listing.reference}`} size="sm" variant="outline">
            Enquire
          </ButtonLink>
        </div>

        <p className="mt-3 text-xs text-ink-muted">Listed by: {listing.role}</p>
      </div>
    </article>
  );
}
