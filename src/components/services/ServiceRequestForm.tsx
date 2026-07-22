"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useSubmit } from "@/components/forms/useSubmit";
import { FormStatus } from "@/components/forms/FormStatus";

export function ServiceRequestForm({ serviceId }: { serviceId: string }) {
  const { state, submit, errorMessage } = useSubmit("/api/service-requests");

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const okDone = await submit({ ...Object.fromEntries(new FormData(form)), serviceId });
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required>
          <Input id="name" name="name" required placeholder="Full name" />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required placeholder="+234 ..." />
        </Field>
        <Field label="Preferred date" htmlFor="preferredAt">
          <Input id="preferredAt" name="preferredAt" type="date" />
        </Field>
      </div>
      <Field label="Property location" htmlFor="location">
        <Input id="location" name="location" placeholder="Area, city" />
      </Field>
      <Field label="What do you need?" htmlFor="message" required>
        <Textarea id="message" name="message" required placeholder="Describe the job or service you need." />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        successMessage="Thanks — your request has been sent. The vendor and our team will be in touch."
      />

      <Button type="submit" size="lg" fullWidth disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : "Request this service"}
      </Button>
    </form>
  );
}
