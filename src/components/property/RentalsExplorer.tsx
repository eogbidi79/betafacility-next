"use client";

import { useMemo, useState } from "react";
import { RentalCard } from "./RentalCard";
import { Select } from "@/components/ui/Field";
import { rentals } from "@/data/rentals";

export function RentalsExplorer() {
  const [type, setType] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");

  const filtered = useMemo(() => {
    return rentals.filter((r) => {
      const typeOk = type === "all" || r.type === type;
      const bedOk = bedrooms === "all" || r.bedroomClass === bedrooms;
      return typeOk && bedOk;
    });
  }, [type, bedrooms]);

  return (
    <div>
      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-card sm:grid-cols-3">
        <Select value={type} onChange={(e) => setType(e.target.value)} aria-label="Rental term">
          <option value="all">All rental terms</option>
          <option value="short-term">Short-Term Rental</option>
          <option value="long-term">Long-Term Rental</option>
        </Select>
        <Select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} aria-label="Bedrooms">
          <option value="all">All Bedrooms</option>
          <option value="studio">Studio</option>
          <option value="1-bed">1 Bedroom</option>
          <option value="2-bed">2 Bedrooms</option>
          <option value="3-bed">3 Bedrooms</option>
        </Select>
        <Select defaultValue="all" aria-label="Property class">
          <option value="all">Residential &amp; Commercial</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rental) => (
            <RentalCard key={rental.slug} rental={rental} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-ink-muted">
          No rentals match your filters right now. Try adjusting them.
        </p>
      )}
    </div>
  );
}
