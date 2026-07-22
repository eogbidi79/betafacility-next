"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { RentalListingCard } from "./RentalListingCard";
import { Select } from "@/components/ui/Field";
import type { ListingDTO } from "@/lib/listings";
import { NIGERIA, NIGERIAN_STATES } from "@/data/nigeria";

const RentalsMap = dynamic(() => import("./RentalsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-ink-muted">
      Loading map…
    </div>
  ),
});

const ALL = "all";

export function RentalsBrowser({ listings }: { listings: ListingDTO[] }) {
  const [state, setState] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [bedroom, setBedroom] = useState(ALL);
  const [availability, setAvailability] = useState(ALL);

  const cities = state !== ALL ? (NIGERIA[state] ?? []) : [];

  const filtered = useMemo(
    () =>
      listings.filter(
        (l) =>
          (state === ALL || l.state === state) &&
          (city === ALL || l.city === city) &&
          (category === ALL || l.rentalCategory === category) &&
          (bedroom === ALL || l.bedroomType === bedroom) &&
          (availability === ALL || l.status === availability),
      ),
    [listings, state, city, category, bedroom, availability],
  );

  const reset = () => {
    setState(ALL);
    setCity(ALL);
    setCategory(ALL);
    setBedroom(ALL);
    setAvailability(ALL);
  };

  return (
    <div>
      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setCity(ALL);
            }}
            aria-label="State"
          >
            <option value={ALL}>All states</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>

          <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" disabled={state === ALL}>
            <option value={ALL}>{state === ALL ? "Select a state first" : "All cities"}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Rental type">
            <option value={ALL}>Short-let &amp; Long-Term</option>
            <option value="Short-let">Short-let</option>
            <option value="Long-Term">Long-Term</option>
          </Select>

          <Select value={bedroom} onChange={(e) => setBedroom(e.target.value)} aria-label="Bedroom type">
            <option value={ALL}>All bedrooms</option>
            <option value="Studio">Studio</option>
            <option value="1 Bedroom">1 Bedroom</option>
            <option value="2 Bedroom">2 Bedroom</option>
            <option value="3 Bedroom">3 Bedroom</option>
          </Select>

          <Select value={availability} onChange={(e) => setAvailability(e.target.value)} aria-label="Availability">
            <option value={ALL}>Any status</option>
            <option value="Available">Available</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Fully Occupied">Fully Occupied</option>
          </Select>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {filtered.length} listing{filtered.length === 1 ? "" : "s"}
          </p>
          <button onClick={reset} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Reset filters
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-gray-200 shadow-card sm:h-96">
        <RentalsMap listings={filtered} />
      </div>

      {/* Listings */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <RentalListingCard key={l.id} listing={l} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-ink-muted">No rentals match your filters. Try widening your search.</p>
      )}
    </div>
  );
}
