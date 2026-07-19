"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { properties } from "@/data/properties";
import { formatNaira } from "@/lib/utils";

const MAX_PRICE = 10_000_000;

export function PropertiesExplorer() {
  const [location, setLocation] = useState("all");
  const [type, setType] = useState("all");
  const [listing, setListing] = useState("all");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  const locations = useMemo(
    () => Array.from(new Set(properties.map((p) => p.location))),
    [],
  );

  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          (location === "all" || p.location === location) &&
          (type === "all" || p.type === type) &&
          (listing === "all" || p.listing === listing) &&
          p.pricePerYear <= maxPrice,
      ),
    [location, type, listing, maxPrice],
  );

  const reset = () => {
    setLocation("all");
    setType("all");
    setListing("all");
    setMaxPrice(MAX_PRICE);
  };

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Location" htmlFor="f-location">
            <Select id="f-location" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="all">Select location</option>
              {locations.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Property Type" htmlFor="f-type">
            <Select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">Select type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </Select>
          </Field>
          <Field label="Listing Type" htmlFor="f-listing">
            <Select id="f-listing" value={listing} onChange={(e) => setListing(e.target.value)}>
              <option value="all">Select listing</option>
              <option value="long-term">Long-Term</option>
              <option value="short-let">Short-Let</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <label htmlFor="f-price" className="mb-1.5 block text-sm font-medium text-ink-soft">
            Price Range: {formatNaira(0)} – {formatNaira(maxPrice)}
          </label>
          <input
            id="f-price"
            type="range"
            min={0}
            max={MAX_PRICE}
            step={100_000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <Button variant="outline" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-ink-muted">
          No properties match your filters. Try widening your search.
        </p>
      )}
    </div>
  );
}
