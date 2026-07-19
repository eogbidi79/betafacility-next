"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MaintenanceForm } from "./MaintenanceForm";
import { BookMaintenanceForm } from "./BookMaintenanceForm";

const tabs = [
  { id: "report", label: "Report an Issue" },
  { id: "book", label: "Book Maintenance" },
] as const;

export function FacilityTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("report");

  return (
    <div className="mx-auto max-w-3xl">
      <div
        role="tablist"
        aria-label="Facility management actions"
        className="mb-8 grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1.5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-semibold transition",
              active === tab.id
                ? "bg-white text-brand-600 shadow-card"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card sm:p-8">
        {active === "report" ? <MaintenanceForm /> : <BookMaintenanceForm />}
      </div>
    </div>
  );
}
