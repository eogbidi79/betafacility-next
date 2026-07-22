import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { toDTO, type ListingDTO } from "@/lib/listings";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { PhotoUploader } from "@/components/portal/PhotoUploader";
import { formatMoney } from "@/lib/currency";
import { COUNTRY_NAMES, PROPERTY_TYPES, BEDROOM_TYPES, RENTAL_CATEGORIES, RENTAL_STATUSES, LISTED_BY, CURRENCIES } from "@/data/locations";
import { createListing, updateListing, deleteListing, setAvailability } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Rentals", robots: { index: false } };

function Fields({ l }: { l?: ListingDTO }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Listing title" htmlFor="title" required className="lg:col-span-3">
        <Input name="title" defaultValue={l?.title ?? ""} required placeholder="e.g. 2 Bedroom Apartment — Long-Term" />
      </Field>
      <Field label="Listed by" htmlFor="listedBy">
        <Select name="listedBy" defaultValue={l?.listedBy ?? "Beta Facility"}>
          {LISTED_BY.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Rental category" htmlFor="rentalCategory">
        <Select name="rentalCategory" defaultValue={l?.rentalCategory ?? "Short-let"}>
          {RENTAL_CATEGORIES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Property type" htmlFor="propertyType">
        <Select name="propertyType" defaultValue={l?.propertyType ?? "Apartment"}>
          {PROPERTY_TYPES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Bedroom type" htmlFor="bedroomType">
        <Select name="bedroomType" defaultValue={l?.bedroomType ?? "Studio"}>
          {BEDROOM_TYPES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Bathrooms" htmlFor="bathrooms">
        <Input name="bathrooms" type="number" min={0} defaultValue={l?.bathrooms ?? ""} />
      </Field>
      <Field label="Total units" htmlFor="totalUnits">
        <Input name="totalUnits" type="number" min={0} defaultValue={l?.totalUnits ?? 1} />
      </Field>
      <Field label="Available units" htmlFor="availableUnits">
        <Input name="availableUnits" type="number" min={0} defaultValue={l?.availableUnits ?? 0} />
      </Field>
      <Field label="Status" htmlFor="status">
        <Select name="status" defaultValue={l?.status ?? "Available"}>
          {RENTAL_STATUSES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Country" htmlFor="country">
        <Select name="country" defaultValue={l?.country ?? "Nigeria"}>
          {COUNTRY_NAMES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="State / Province / Territory" htmlFor="state">
        <Input name="state" defaultValue={l?.state ?? "Lagos"} />
      </Field>
      <Field label="City" htmlFor="city">
        <Input name="city" defaultValue={l?.city ?? "Ajah"} />
      </Field>
      <Field label="Area / neighbourhood" htmlFor="area">
        <Input name="area" defaultValue={l?.area ?? ""} />
      </Field>
      <Field label="Postal code" htmlFor="postalCode">
        <Input name="postalCode" defaultValue={l?.postalCode ?? ""} />
      </Field>
      <Field label="Address (optional)" htmlFor="address" className="lg:col-span-3">
        <Input name="address" defaultValue={l?.address ?? ""} />
      </Field>
      <Field label="Currency" htmlFor="currencyCode">
        <Select name="currencyCode" defaultValue={l?.currencyCode ?? "NGN"}>
          {CURRENCIES.map((x) => <option key={x}>{x}</option>)}
        </Select>
      </Field>
      <Field label="Short-let price / night" htmlFor="price">
        <Input name="price" type="number" min={0} defaultValue={l?.price ?? ""} />
      </Field>
      <Field label="Rent per year" htmlFor="rentPerYear">
        <Input name="rentPerYear" type="number" min={0} defaultValue={l?.rentPerYear ?? ""} />
      </Field>
      <div className="flex flex-wrap items-center gap-4 lg:col-span-3">
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          <input type="checkbox" name="furnished" defaultChecked={l?.furnished} className="h-4 w-4 rounded border-gray-300 text-brand-500" /> Furnished
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          <input type="checkbox" name="parking" defaultChecked={l?.parking} className="h-4 w-4 rounded border-gray-300 text-brand-500" /> Parking
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          <input type="checkbox" name="petFriendly" defaultChecked={l?.petFriendly} className="h-4 w-4 rounded border-gray-300 text-brand-500" /> Pet friendly
        </label>
      </div>
      <Field label="Latitude (optional)" htmlFor="latitude">
        <Input name="latitude" defaultValue={l?.latitude ?? ""} placeholder="6.4698" />
      </Field>
      <Field label="Longitude (optional)" htmlFor="longitude">
        <Input name="longitude" defaultValue={l?.longitude ?? ""} placeholder="3.5852" />
      </Field>
      <Field label="Amenities (comma-separated)" htmlFor="amenities" className="lg:col-span-3">
        <Input name="amenities" defaultValue={(l?.amenities ?? []).join(", ")} placeholder="Security, Water Supply, Compound Cleaning" />
      </Field>
      <Field label="Description" htmlFor="description" className="lg:col-span-3">
        <Textarea name="description" defaultValue={l?.description ?? ""} />
      </Field>

      <div className="lg:col-span-3">
        <p className="mb-1.5 text-sm font-medium text-ink-soft">Photos — upload per room</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <PhotoUploader name="building" label="Building" initial={l?.photos.building} />
          <PhotoUploader name="living" label="Living room" initial={l?.photos.livingRoom} />
          <PhotoUploader name="bedroom" label="Bedroom" initial={l?.photos.bedroom} />
          <PhotoUploader name="toilet" label="Toilet/Bath" initial={l?.photos.toiletBathroom} />
          <PhotoUploader name="kitchen" label="Kitchen" initial={l?.photos.kitchen} />
        </div>
      </div>
    </div>
  );
}

export default async function ManageRentalsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/portal");

  const rows = await prisma.rentalListing.findMany({ orderBy: { createdAt: "asc" } });
  const listings = rows.map(toDTO);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Rentals</h1>
          <p className="text-sm text-ink-muted">Add and edit rental listings — Beta Facility, agency or individual.</p>
        </div>
        <ButtonLink href="/portal" variant="outline" size="sm">← Back to portal</ButtonLink>
      </div>

      {/* Create */}
      <details className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <summary className="cursor-pointer text-lg font-bold text-ink">+ Add a new rental listing</summary>
        <form action={createListing} className="mt-5 space-y-4">
          <Fields />
          <Button type="submit" size="lg">Create listing</Button>
        </form>
      </details>

      {/* Existing */}
      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-bold text-ink">All listings ({listings.length})</h2>
        {listings.map((l) => (
          <div key={l.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{l.title}</p>
                <p className="text-xs text-ink-muted">
                  {l.rentalCategory} · {l.bedroomType} · {l.city}, {l.state}, {l.country} · {l.listedBy}
                  {l.rentPerYear ? ` · ${formatMoney(l.rentPerYear, l.currencyCode)}/yr` : l.price ? ` · ${formatMoney(l.price, l.currencyCode)}/night` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={l.status === "Available" ? "success" : l.status === "Coming Soon" ? "brand" : "neutral"}>
                  {l.status}
                </Badge>
                {/* Quick availability update */}
                <form action={setAvailability} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={l.id} />
                  <input
                    name="availableUnits"
                    type="number"
                    min={0}
                    defaultValue={l.availableUnits}
                    className="w-16 rounded-md border border-gray-300 px-2 py-1 text-xs"
                  />
                  <span className="text-xs text-ink-muted">/ {l.totalUnits}</span>
                  <button className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-ink-soft">
                    Set
                  </button>
                </form>
                <form action={deleteListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-semibold text-brand-600">Edit full details</summary>
              <form action={updateListing} className="mt-4 space-y-4">
                <input type="hidden" name="id" value={l.id} />
                <Fields l={l} />
                <Button type="submit">Save changes</Button>
              </form>
            </details>
          </div>
        ))}
      </section>
    </Container>
  );
}
