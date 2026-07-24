"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RentalListingCard } from "./RentalListingCard";
import { MapEmbed } from "@/components/map/MapEmbed";
import { Select, Input } from "@/components/ui/Field";
import { track } from "@/lib/analytics";
import type { PropertyPage } from "@/lib/property-search";
import {
  COUNTRY_NAMES,
  regionsOf,
  citiesOf,
  PROPERTY_TYPES,
  BEDROOM_TYPES,
  RENTAL_CATEGORIES,
  RENTAL_STATUSES,
  LISTED_BY,
} from "@/data/locations";

const ALL = "all";

export function RentalsBrowser({ initial }: { initial: PropertyPage }) {
  const [country, setCountry] = useState(ALL);
  const [region, setRegion] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [category, setCategory] = useState(ALL);
  const [propertyType, setPropertyType] = useState(ALL);
  const [bedroom, setBedroom] = useState(ALL);
  const [availability, setAvailability] = useState(ALL);
  const [listedBy, setListedBy] = useState(ALL);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [furnished, setFurnished] = useState(false);
  const [parking, setParking] = useState(false);
  const [pet, setPet] = useState(false);

  const [page, setPage] = useState(initial.page);
  const [data, setData] = useState<PropertyPage>(initial);
  const [loading, setLoading] = useState(false);

  const regions = country !== ALL ? regionsOf(country) : [];
  const cities = country !== ALL && region !== ALL ? citiesOf(country, region) : [];

  // A stable key for the current filter set (page excluded).
  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        country, region, city, category, propertyType, bedroom,
        availability, listedBy, minPrice, maxPrice, furnished, parking, pet,
      }),
    [country, region, city, category, propertyType, bedroom, availability, listedBy, minPrice, maxPrice, furnished, parking, pet],
  );

  const first = useRef(true);

  // Reset to page 1 when the filter set changes (not on first mount).
  useEffect(() => {
    if (first.current) return;
    setPage(1);
  }, [filtersKey]);

  // Fetch server-filtered, paginated results. Skips the first render (SSR gave
  // us page 1); debounced so typing in the price fields doesn't spam the API.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const qs = new URLSearchParams();
      const put = (k: string, v: string) => v && v !== ALL && qs.set(k, v);
      put("country", country);
      put("region", region);
      put("city", city);
      put("category", category);
      put("propertyType", propertyType);
      put("bedroom", bedroom);
      put("status", availability);
      put("listedBy", listedBy);
      if (minPrice) qs.set("minPrice", minPrice);
      if (maxPrice) qs.set("maxPrice", maxPrice);
      if (furnished) qs.set("furnished", "true");
      if (parking) qs.set("parking", "true");
      if (pet) qs.set("pet", "true");
      qs.set("page", String(page));
      qs.set("limit", String(initial.limit));

      // A search is a filter change (page resets to 1), not pagination.
      if (page === 1) {
        track("property_search", {
          country: country !== ALL ? country : undefined,
          region: region !== ALL ? region : undefined,
          city: city !== ALL ? city : undefined,
          category: category !== ALL ? category : undefined,
          propertyType: propertyType !== ALL ? propertyType : undefined,
          bedroom: bedroom !== ALL ? bedroom : undefined,
          status: availability !== ALL ? availability : undefined,
        });
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/properties?${qs.toString()}`, { signal: controller.signal });
        const json = await res.json();
        if (json.data) setData(json.data as PropertyPage);
      } catch {
        /* aborted or network error — keep last results */
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filtersKey, page, initial.limit]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setCountry(ALL);
    setRegion(ALL);
    setCity(ALL);
    setCategory(ALL);
    setPropertyType(ALL);
    setBedroom(ALL);
    setAvailability(ALL);
    setListedBy(ALL);
    setMinPrice("");
    setMaxPrice("");
    setFurnished(false);
    setParking(false);
    setPet(false);
  };

  const items = data.items;
  const totalPages = data.pageCount;
  const current = data.page;
  const noLocation = country === ALL && region === ALL && city === ALL;

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setRegion(ALL);
              setCity(ALL);
            }}
            aria-label="Country"
          >
            <option value={ALL}>All countries</option>
            {COUNTRY_NAMES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>

          <Select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setCity(ALL);
            }}
            aria-label="State / Province"
            disabled={country === ALL}
          >
            <option value={ALL}>{country === ALL ? "Select a country" : "All states / provinces"}</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>

          <Select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" disabled={region === ALL}>
            <option value={ALL}>{region === ALL ? "All cities" : "All cities"}</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>

          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Rental type">
            <option value={ALL}>Any rental type</option>
            {RENTAL_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>

          <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} aria-label="Property type">
            <option value={ALL}>Any property type</option>
            {PROPERTY_TYPES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>

          <Select value={bedroom} onChange={(e) => setBedroom(e.target.value)} aria-label="Bedrooms">
            <option value={ALL}>Any bedrooms</option>
            {BEDROOM_TYPES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>

          <Select value={availability} onChange={(e) => setAvailability(e.target.value)} aria-label="Status">
            <option value={ALL}>Any status</option>
            {RENTAL_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>

          <Select value={listedBy} onChange={(e) => setListedBy(e.target.value)} aria-label="Listed by">
            <option value={ALL}>Anyone (Beta Facility, Agency, Individual)</option>
            {LISTED_BY.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>

          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input type="checkbox" checked={furnished} onChange={(e) => setFurnished(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
            Furnished
          </label>
          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input type="checkbox" checked={parking} onChange={(e) => setParking(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
            Parking
          </label>
          <label className="flex items-center gap-1.5 text-sm text-ink-soft">
            <input type="checkbox" checked={pet} onChange={(e) => setPet(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
            Pet friendly
          </label>
          <span className="ml-auto text-sm text-ink-muted">
            {loading ? "Searching…" : `${data.total} listing${data.total === 1 ? "" : "s"}`}
          </span>
          <button onClick={reset} className="text-sm font-medium text-brand-600 hover:text-brand-700">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-6 h-80 overflow-hidden rounded-2xl border border-gray-200 shadow-card sm:h-96">
        {/* Mapbox when configured (clusters, auto-fit); else Leaflet coverage view. */}
        <MapEmbed listings={items} world={noLocation} />
      </div>

      {items.length > 0 ? (
        <>
          <div className={`mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`}>
            {items.map((l) => (
              <RentalListingCard key={l.id} listing={l} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current <= 1}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                    n === current ? "bg-brand-500 text-white" : "border border-gray-300 text-ink hover:border-ink"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current >= totalPages}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-ink disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="mt-12 text-center text-ink-muted">
          {loading ? "Searching…" : "No rentals match your filters. Try widening your search."}
        </p>
      )}
    </div>
  );
}
