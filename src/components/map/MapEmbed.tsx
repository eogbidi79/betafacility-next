"use client";

import dynamic from "next/dynamic";
import type { ListingDTO } from "@/lib/listings";

// Provider switch: use Mapbox (clustering, popups, auto-fit) when a public token
// is configured; otherwise the interim Leaflet/OpenStreetMap map. Both accept
// the same props, so this is swappable with no data-model change.
const useMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

const MapImpl = dynamic(() => (useMapbox ? import("./MapboxListingsMap") : import("./RentalsMap")), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-ink-muted">Loading map…</div>
  ),
});

export function MapEmbed({ listings, world }: { listings: ListingDTO[]; world?: boolean }) {
  return <MapImpl listings={listings} world={world} />;
}
