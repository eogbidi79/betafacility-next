"use client";

import { useMemo, useState } from "react";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatNaira } from "@/lib/utils";

// Transparent fee model applied to the annual rent.
const FEES = [
  { key: "agency", label: "Agency Fee", rate: 0.1 },
  { key: "legal", label: "Legal Fee", rate: 0.1 },
  { key: "caution", label: "Caution / Security Deposit", rate: 0.1 },
  { key: "service", label: "Service Charge", rate: 0.05 },
] as const;

export function RentCalculator() {
  const [raw, setRaw] = useState("");

  const rent = Number(raw.replace(/[^0-9]/g, "")) || 0;

  const breakdown = useMemo(() => {
    const items = FEES.map((f) => ({ ...f, amount: Math.round(rent * f.rate) }));
    const feesTotal = items.reduce((sum, i) => sum + i.amount, 0);
    return { items, feesTotal, total: rent + feesTotal };
  }, [rent]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h3 className="text-xl font-bold text-ink">Enter Rental Amount</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Input the annual rental amount to instantly see the complete breakdown of all associated
          fees and totals.
        </p>

        <Field label="Annual Rent (₦)" htmlFor="rent" className="mt-5">
          <Input
            id="rent"
            inputMode="numeric"
            placeholder="0"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </Field>

        <Button variant="outline" className="mt-4" onClick={() => setRaw("")}>
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
