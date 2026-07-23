"use client";

import dynamic from "next/dynamic";
import type { ListingDTO } from "@/lib/listings";

const RentalsMap = dynamic(() => import("./RentalsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-ink-muted">Loading map…</div>
  ),
});

export function MapEmbed({ listings }: { listings: ListingDTO[] }) {
  return <RentalsMap listings={listings} />;
}
