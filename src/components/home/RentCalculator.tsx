"use client";

import { useMemo, useState } from "react";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";

// Percentage fees applied to the annual rent.
const FEES = [
  { key: "agency", label: "Agency Fee", rate: 0.1 },
  { key: "legal", label: "Legal Fee", rate: 0.1 },
] as const;

const APARTMENT_TYPES = ["Studio Apartment", "1 Bedroom", "2 Bedroom", "3 Bedroom"] as const;

// Suggested annual service charge by apartment type (fixed, not a %).
const SERVICE_CHARGE: Record<string, number> = {
  "Studio Apartment": 500_000,
  "1 Bedroom": 650_000,
  "2 Bedroom": 800_000,
  "3 Bedroom": 950_000,
};

// Caution / security deposit by apartment type (fixed, not a %).
const CAUTION: Record<string, number> = {
  "Studio Apartment": 150_000,
  "1 Bedroom": 200_000,
  "2 Bedroom": 250_000,
  "3 Bedroom": 300_000,
};

export function RentCalculator() {
  const [raw, setRaw] = useState("");
  const [apartment, setApartment] = useState<string>(APARTMENT_TYPES[0]);

  const rent = Number(raw.replace(/[^0-9]/g, "")) || 0;

  const breakdown = useMemo(() => {
    const items = FEES.map((f) => ({ ...f, amount: Math.round(rent * f.rate) }));
    const serviceCharge = SERVICE_CHARGE[apartment] ?? 0;
    const caution = CAUTION[apartment] ?? 0;
    const feesTotal = items.reduce((sum, i) => sum + i.amount, 0) + serviceCharge + caution;
    return { items, serviceCharge, caution, feesTotal, total: rent + feesTotal };
  }, [rent, apartment]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h3 className="text-xl font-bold text-ink">Enter Rental Amount</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Input the annual rental amount and apartment type to instantly see the complete breakdown
          of all associated fees and totals.
        </p>

        <Field label="Apartment Type" htmlFor="apartment" className="mt-5">
          <Select id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)}>
            {APARTMENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>

        <Field label="Annual Rent (₦)" htmlFor="rent" className="mt-4">
          <Input
            id="rent"
            inputMode="numeric"
            placeholder="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </Field>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setRaw("");
            setApartment(APARTMENT_TYPES[0]);
          }}
        >
          Reset
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-card">
        <h3 className="text-xl font-bold text-ink">Cost Breakdown</h3>

        {rent > 0 ? (
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Annual Rent</dt>
              <dd className="font-semibold text-ink">{formatNaira(rent)}</dd>
            </div>
            {breakdown.items.map((item) => (
              <div key={item.key} className="flex justify-between">
                <dt className="text-ink-muted">
                  {item.label} ({Math.round(item.rate * 100)}%)
                </dt>
                <dd className="font-medium text-ink-soft">{formatNaira(item.amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between">
              <dt className="text-ink-muted">Caution / Security Deposit ({apartment})</dt>
              <dd className="font-medium text-ink-soft">{formatNaira(breakdown.caution)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Service Charge ({apartment}, annual)</dt>
              <dd className="font-medium text-ink-soft">{formatNaira(breakdown.serviceCharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base">
              <dt className="font-bold text-ink">Total Payable</dt>
              <dd className="font-bold text-brand-600">{formatNaira(breakdown.total)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 text-sm text-ink-muted">Enter a rental amount to see the breakdown.</p>
        )}
      </div>
    </div>
  );
}
