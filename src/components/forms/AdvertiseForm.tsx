"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";

const categories = [
  "1-Bedroom Apartment",
  "2-Bedroom Apartment",
  "3-Bedroom Apartment",
  "House",
];

export function AdvertiseForm() {
  const { state, submit, result, errorMessage } = useSubmit("/api/advertise");

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const images = fd.getAll("images").filter((f) => f instanceof File && f.size > 0);
        fd.delete("images");
        const okDone = await submit({
          ...Object.fromEntries(fd),
          imageCount: images.length,
        });
        if (okDone) form.reset();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your Name" htmlFor="name" required>
          <Input id="name" name="name" required />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required />
        </Field>
        <Field label="I am a" htmlFor="role" required>
          <Select id="role" name="role" defaultValue="Landlord">
            <option>Landlord</option>
            <option>Agent</option>
            <option>Owner</option>
          </Select>
        </Field>
        <Field label="Listing purpose" htmlFor="transactionType" required>
          <Select id="transactionType" name="transactionType" defaultValue="RENT">
            <option value="RENT">For Rent</option>
            <option value="SELL">For Sale</option>
            <option value="BUY">Wanted to Buy</option>
          </Select>
        </Field>
        <Field label="Property Class" htmlFor="propertyClass" required>
          <Select id="propertyClass" name="propertyClass" defaultValue="Residential">
            <option>Residential</option>
            <option>Commercial</option>
          </Select>
        </Field>
        <Field label="Listing Type" htmlFor="listingType" required>
          <Select id="listingType" name="listingType" defaultValue="Long-Term Rental">
            <option>Long-Term Rental</option>
            <option>Short-Let</option>
          </Select>
        </Field>
      </div>

      <Field label="Property Title" htmlFor="title" required>
        <Input id="title" name="title" required placeholder="e.g. Spacious 2-bedroom flat in Ajah" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" required>
          <Select id="category" name="category" required defaultValue="">
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Location" htmlFor="location" required>
          <Input id="location" name="location" required placeholder="Area, Lagos" />
        </Field>
      </div>

      <Field label="Price (₦)" htmlFor="price" required>
        <Input id="price" name="price" inputMode="numeric" required placeholder="0" />
      </Field>

      <Field label="Description" htmlFor="description" required>
        <Textarea id="description" name="description" required placeholder="Describe the property…" />
      </Field>

      <Field label="Image URL (shown on your listing)" htmlFor="imageUrl">
        <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…/photo.jpg" />
      </Field>

      <Field label="Property Images (up to 6)" htmlFor="images">
        <Input id="images" name="images" type="file" accept="image/*" multiple className="py-2" />
      </Field>

      <FormStatus
        state={state}
        errorMessage={errorMessage}
        reference={result?.reference}
        successMessage="Submitted for approval. Our team will review your listing and reach out shortly."
      />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit for Approval"}
      </Button>
    </form>
  );
}
