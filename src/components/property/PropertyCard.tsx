import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import type { ManagedProperty } from "@/data/properties";
import { formatNaira } from "@/lib/utils";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-center gap-1 text-sm text-ink-soft">
      <strong className="font-semibold text-ink">{value}</strong> {label}
    </span>
  );
}

export function PropertyCard({ property }: { property: ManagedProperty }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge tone="brand">{property.tier}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-ink">{property.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{property.address}</p>

        <div className="mt-4 flex flex-wrap gap-4">
          <Stat label="Beds" value={property.beds} />
          <Stat label="Baths" value={property.baths} />
          <Stat label="Toilets" value={property.toilets} />
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-gray-100 pt-4">
          <div>
            <span className="text-2xl font-bold text-ink">{formatNaira(property.pricePerYear)}</span>
            <span className="block text-xs uppercase tracking-wide text-ink-muted">per year</span>
          </div>
          <ButtonLink href={`/properties/${property.slug}`} size="sm" variant="outline">
            View Details
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
