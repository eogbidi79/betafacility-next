"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";

const units = [
  "Block A",
  "Block B",
  "Block C",
  "Self-Contain Unit",
  "1-Bedroom Unit",
  "2-Bedroom Flat",
  "Common Area / Compound",
  "Other",
];

const categories = [
  "Electrical",
  "Solar",
  "Plumbing",
  "Generator",
  "HVAC",
  "Physical Security",
  "CCTV",
  "Access Control",
  "Smoke Detector",
  "Other",
];

const priorities = [
  { value: "Critical", desc: "Safety risk / total outage", tone: "border-red-300 bg-red-50 text-red-700" },
  { value: "High", desc: "Major disruption", tone: "border-amber-300 bg-amber-50 text-amber-700" },
  { value: "Medium", desc: "Partial / non-urgent", tone: "border-blue-300 bg-blue-50 text-blue-700" },
  { value: "Low", desc: "Minor / cosmetic", tone: "border-green-300 bg-green-50 text-green-700" },
];

export function MaintenanceForm() {
  const { state, submit, result, errorMessage } = useSubmit("/api/maintenance");
  const [priority, setPriority] = useState("Medium");

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const media = fd.getAll("media").filter((f) => f instanceof File && f.size > 0);
        fd.delete("media");
        const okDone = await submit({
          ...Object.fromEntries(fd),
          kind: "report",
          priority,
          mediaCount: media.length,
        });
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" required />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required />
        </Field>
        <Field label="Unit / Location" htmlFor="unit" required>
          <Select id="unit" name="unit" required defaultValue="">
            <option value="" disabled>
              Select unit
            </option>
            {units.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Address details" htmlFor="address">
        <Input id="address" name="address" placeholder="Street, estate, landmark…" />
      </Field>

      <Field label="Issue Category" htmlFor="category" required>
        <Select id="category" name="category" required defaultValue="">
          <option value="" disabled>
            Select category
          </option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>

      <div>
        <p className="mb-1.5 block text-sm font-medium text-ink-soft">Priority Level</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {priorities.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => setPriority(p.value)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                priority === p.value ? p.tone : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <span className="block text-sm font-semibold text-ink">{p.value}</span>
              <span className="mt-0.5 block text-xs text-ink-muted">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <Field label="Describe the Problem" htmlFor="description" required>
        <Textarea id="description" name="description" required placeholder="Tell us what's wrong…" />
      </Field>

      <Field label="Upload Photos / Videos (optional, up to 5)" htmlFor="media">
        <Input id="media" name="media" type="file" accept="image/*,video/*" multiple className="py-2" />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        reference={result?.reference}
        successMessage="Report received. Our team will respond within our SLA and keep you updated."
      />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit Report"}
      </Button>
    </form>
  );
}
