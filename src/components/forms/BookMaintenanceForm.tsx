"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";

const services = [
  "Routine Inspection",
  "Electrical",
  "Plumbing",
  "Generator Servicing",
  "Solar / Inverter",
  "HVAC",
  "CCTV / Access Control",
  "General Cleaning",
  "Other",
];

export function BookMaintenanceForm() {
  const { state, submit, result, errorMessage } = useSubmit("/api/maintenance");

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;
        const preferredAt = fd.date
          ? new Date(`${fd.date}T${fd.time || "09:00"}`).toISOString()
          : "";
        const okDone = await submit({
          kind: "booking",
          fullName: fd.fullName,
          email: fd.email,
          phone: fd.phone,
          unit: fd.location,
          service: fd.service,
          preferredAt,
          description: fd.notes,
        });
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full Name" htmlFor="b-name" required>
          <Input id="b-name" name="fullName" required />
        </Field>
        <Field label="Email" htmlFor="b-email" required>
          <Input id="b-email" name="email" type="email" required />
        </Field>
        <Field label="Phone" htmlFor="b-phone" required>
          <Input id="b-phone" name="phone" type="tel" required />
        </Field>
        <Field label="Service Type" htmlFor="b-service" required>
          <Select id="b-service" name="service" required defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Preferred Date" htmlFor="b-date" required>
          <Input id="b-date" name="date" type="date" required />
        </Field>
        <Field label="Preferred Time" htmlFor="b-time">
          <Input id="b-time" name="time" type="time" />
        </Field>
      </div>

      <Field label="Unit / Location" htmlFor="b-location" required>
        <Input id="b-location" name="location" required placeholder="Street, estate, landmark…" />
      </Field>

      <Field label="Additional Notes" htmlFor="b-notes">
        <Textarea id="b-notes" name="notes" placeholder="Anything our technicians should know…" />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        reference={result?.reference}
        successMessage="Maintenance booked. We'll confirm your appointment shortly."
      />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Booking…" : "Book Maintenance"}
      </Button>
    </form>
  );
}
