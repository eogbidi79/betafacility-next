"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { COUNTRY_NAMES } from "@/data/locations";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Mixed-use",
  "Short-let portfolio",
  "Land / Development",
];

const PORTFOLIO_SIZES = ["1", "2–5", "6–20", "21–50", "50+"];

const INTERESTS = [
  "Full property management",
  "Tenant sourcing & screening",
  "Rent collection",
  "Maintenance & facility management",
  "Short-let / Airbnb management",
  "Diaspora / remote management",
];

export function PropertyManagementForm() {
  const { state, submit, errorMessage } = useSubmit("/api/property-management");

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        // Collect the checked interests into a single comma-separated field.
        const services = fd.getAll("interest").map(String).join(", ");
        const payload = { ...Object.fromEntries(fd), services };
        delete (payload as Record<string, unknown>).interest;
        const okDone = await submit(payload);
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required>
          <Input id="name" name="name" required placeholder="Your name" />
        </Field>
        <Field label="Company (optional)" htmlFor="company">
          <Input id="company" name="company" placeholder="Company or self" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required placeholder="+234 ..." />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Country" htmlFor="country" required>
          <Select id="country" name="country" defaultValue="Nigeria">
            {COUNTRY_NAMES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="City" htmlFor="city">
          <Input id="city" name="city" placeholder="Lagos" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Property type" htmlFor="propertyType">
          <Select id="propertyType" name="propertyType" defaultValue="">
            <option value="" disabled>
              Select type
            </option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="How many units?" htmlFor="units">
          <Select id="units" name="units" defaultValue="">
            <option value="" disabled>
              Select portfolio size
            </option>
            {PORTFOLIO_SIZES.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </Select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink-soft">What are you interested in?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTERESTS.map((i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" name="interest" value={i} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              {i}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Anything else?" htmlFor="message">
        <Textarea id="message" name="message" placeholder="Tell us about your property and goals." />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        successMessage="Thanks — your request has been received. Our team will reach out shortly."
      />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : "Request a management proposal"}
      </Button>
    </form>
  );
}
