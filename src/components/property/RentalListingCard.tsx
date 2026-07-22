import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";
import { galleryPhotos, type ListingDTO } from "@/lib/listings";

function statusTone(status: string): "success" | "brand" | "neutral" {
  if (status === "Available") return "success";
  if (status === "Coming Soon") return "brand";
  return "neutral";
}

export function RentalListingCard({ listing }: { listing: ListingDTO }) {
  const gallery = galleryPhotos(listing.photos);
  const cover = gallery[0];
  const thumbs = gallery.slice(1, 5);
  const priceText =
    listing.rentPerYear != null
      ? `${formatNaira(listing.rentPerYear)}`
      : listing.price != null
        ? `${formatNaira(listing.price)}`
        : "On request";
  const priceUnit = listing.rentPerYear != null ? "per year" : listing.price != null ? "per night" : "";

  return (
    <article
      id={`listing-${listing.id}`}
      className="group flex scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-brand-600/30">
            Beta
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone={statusTone(listing.status)}>{listing.status}</Badge>
          <Badge tone="brand">{listing.rentalCategory}</Badge>
        </div>
      </div>

      {thumbs.length > 0 && (
        <div className="flex gap-1 bg-gray-50 p-1">
          {thumbs.map((src, i) => (
            <div key={i} className="relative h-14 flex-1 overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">{listing.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">
          {[listing.area, listing.city, listing.state].filter(Boolean).join(", ")}
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-soft">
          <span>
            <strong className="font-semibold text-ink">{listing.bedroomType}</strong>
          </span>
          <span>
            <strong className="font-semibold text-ink">{listing.availableUnits}</strong> of{" "}
            {listing.totalUnits} available
          </span>
        </div>

        {listing.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.amenities.slice(0, 4).map((a) => (
              <span key={a} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft">
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-xl font-bold text-ink">{priceText}</span>
            {priceUnit && <span className="block text-xs text-ink-muted">{priceUnit}</span>}
          </div>
          <ButtonLink href={`/contact?ref=${listing.id}`} size="sm">
            Enquire
          </ButtonLink>
        </div>

        <p className="mt-3 text-xs text-ink-muted">Listed by: {listing.listedBy}</p>
      </div>
    </article>
  );
}
