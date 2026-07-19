import { describe, it, expect } from "vitest";
import { contactSchema, bookingSchema, advertiseSchema } from "./validation";

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    const r = contactSchema.safeParse({
      name: "Ada Obi",
      email: "ada@example.com",
      phone: "+2348010000000",
      inquiryType: "General Inquiry",
      message: "I would like more information.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a bad email and empty inquiry type", () => {
    const r = contactSchema.safeParse({
      name: "Ada",
      email: "nope",
      inquiryType: "",
      message: "hello there",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const paths = r.error.issues.map((i) => i.path.join("."));
      expect(paths).toContain("email");
      expect(paths).toContain("inquiryType");
    }
  });
});

describe("bookingSchema", () => {
  it("accepts valid dates and coerces strings to Date", () => {
    const r = bookingSchema.safeParse({
      rentalSlug: "studio-apartment",
      guestName: "Guest One",
      guestEmail: "g@example.com",
      guestPhone: "08010000000",
      checkIn: "2026-10-01",
      checkOut: "2026-10-04",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.checkIn).toBeInstanceOf(Date);
  });

  it("rejects check-out on or before check-in", () => {
    const r = bookingSchema.safeParse({
      rentalSlug: "studio-apartment",
      guestName: "Guest One",
      guestEmail: "g@example.com",
      guestPhone: "08010000000",
      checkIn: "2026-10-04",
      checkOut: "2026-10-01",
    });
    expect(r.success).toBe(false);
  });
});

describe("advertiseSchema", () => {
  it("coerces price to a number", () => {
    const r = advertiseSchema.safeParse({
      name: "Landlord",
      email: "l@example.com",
      phone: "08010000000",
      role: "Landlord",
      propertyClass: "Residential",
      listingType: "Long-Term Rental",
      title: "Nice flat",
      category: "2-Bedroom Apartment",
      location: "Ajah",
      price: "2500000",
      description: "A lovely apartment in Ajah.",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.price).toBe(2_500_000);
  });
});
