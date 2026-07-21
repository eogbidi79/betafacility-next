import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { BookNowButton } from "@/components/booking/BookNowButton";
import type { Rental } from "@/data/rentals";
import { formatNaira } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1 text-sm text-ink-soft">
      <strong className="font-semibold text-ink">{value}</strong> {label}
    </span>
  );
}

export function RentalCard({ rental }: { rental: Rental }) {
  const perLabel = rental.period === "year" ? "per year" : "per night";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={rental.image}
          alt={rental.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {rental.available ? (
            <Badge tone="success">Available</Badge>
          ) : (
            <Badge tone="neutral">Unavailable</Badge>
          )}
          <Badge tone="brand">{rental.type === "long-term" ? "Long stay" : "Short stay"}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">{rental.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{rental.location}</p>

        <div className="mt-3 flex flex-wrap gap-4">
          <Stat label={rental.beds === 1 ? "Bed" : "Beds"} value={rental.beds === 0 ? "Studio" : String(rental.beds)} />
          <Stat label={rental.toilets === 1 ? "Toilet" : "Toilets"} value={String(rental.toilets)} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {rental.amenities.map((a) => (
            <span key={a} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft">
              {a}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-2xl font-bold text-ink">{formatNaira(rental.price)}</span>
            <span className="block text-xs text-ink-muted">{perLabel}</span>
          </div>

          {!rental.available ? (
            <span className="rounded-lg bg-gray-100 px-3.5 py-2 text-sm font-semibold text-ink-muted">
              Unavailable
            </span>
          ) : rental.type === "long-term" ? (
            <ButtonLink href={`/contact?ref=${rental.slug}`} size="sm">
              Enquire
            </ButtonLink>
          ) : (
            <BookNowButton
              slug={rental.slug}
              title={rental.title}
              pricePerNight={rental.price}
              size="sm"
            />
          )}
        </div>
      </div>
    </article>
  );
}
