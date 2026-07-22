"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Select, Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/currency";
import { COUNTRY_NAMES } from "@/data/locations";
import { SERVICE_CATEGORIES } from "@/data/services";

export type ServiceCardData = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  country: string;
  state: string | null;
  city: string | null;
  priceFrom: number | null;
  currencyCode: string;
  vendorName: string;
  vendorVerified: boolean;
};

const ALL = "all";

export function ServicesBrowser({ services }: { services: ServiceCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const [country, setCountry] = useState(ALL);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return services.filter(
      (s) =>
        (category === ALL || s.category === category) &&
        (country === ALL || s.country === country) &&
        (!query ||
          s.title.toLowerCase().includes(query) ||
          s.vendorName.toLowerCase().includes(query) ||
          (s.description ?? "").toLowerCase().includes(query)),
    );
  }, [services, category, country, q]);

  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Service category">
            <option value={ALL}>All services</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
            <option value={ALL}>All countries</option>
            {COUNTRY_NAMES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
          <Input
            placeholder="Search services or vendors"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          {filtered.length} service{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/property-services/${s.id}`}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="brand">{s.category}</Badge>
                {s.vendorVerified && <Badge tone="success">✓ Verified</Badge>}
              </div>
              <h3 className="mt-3 text-lg font-bold text-ink group-hover:text-brand-600">{s.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">
                {[s.city, s.state, s.country].filter(Boolean).join(", ")}
              </p>
              {s.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-soft">{s.description}</p>
              )}
              <div className="mt-auto flex items-end justify-between border-t border-gray-100 pt-4">
                <div>
                  {s.priceFrom != null ? (
                    <>
                      <span className="text-lg font-bold text-ink">
                        {formatMoney(s.priceFrom, s.currencyCode)}
                      </span>
                      <span className="block text-xs text-ink-muted">from</span>
                    </>
                  ) : (
                    <span className="text-sm text-ink-muted">Price on request</span>
                  )}
                </div>
                <span className="text-xs text-ink-muted">by {s.vendorName}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-ink-muted">No services match your filters. Try widening your search.</p>
      )}
    </div>
  );
}
