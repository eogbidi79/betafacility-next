"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";

export function ContactForm() {
  const { state, submit, errorMessage } = useSubmit("/api/inquiries");

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const okDone = await submit(Object.fromEntries(new FormData(form)));
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" required placeholder="Your full name" />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required placeholder="you@example.com" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" placeholder="+234 ..." />
        </Field>
        <Field label="Inquiry Type" htmlFor="inquiryType" required>
          <Select id="inquiryType" name="inquiryType" required defaultValue="">
            <option value="" disabled>
              Select inquiry type
            </option>
            <option>Property Management Inquiry</option>
            <option>Facility Maintenance Request</option>
            <option>General Inquiry</option>
          </Select>
        </Field>
      </div>

      <Field label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" required placeholder="How can we help?" />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        successMessage="Thanks — your message has been sent. We'll be in touch shortly."
      />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
