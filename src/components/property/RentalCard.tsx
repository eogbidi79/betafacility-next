import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { BookNowButton } from "@/components/booking/BookNowButton";
import type { Rental } from "@/data/rentals";
import { formatNaira } from "@/lib/utils";

export function RentalCard({ rental }: { rental: Rental }) {
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
          <Badge tone="success">Available</Badge>
          <Badge tone="neutral">{rental.unitsAvailable} unit(s)</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">{rental.title}</h3>
        <p className="mt-1 text-sm text-ink-muted">{rental.location}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
          {rental.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {rental.amenities.map((a) => (
            <span
              key={a}
              className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-soft"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-2xl font-bold text-ink">{formatNaira(rental.pricePerNight)}</span>
            <span className="block text-xs text-ink-muted">per night</span>
          </div>
          <BookNowButton
            slug={rental.slug}
            title={rental.title}
            pricePerNight={rental.pricePerNight}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}
