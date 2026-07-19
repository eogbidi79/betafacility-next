import { z } from "zod";

const name = z.string().trim().min(2, "Please enter your name").max(120);
const email = z.email("Enter a valid email address");
const phone = z.string().trim().min(7, "Enter a valid phone number").max(30);
const message = z.string().trim().min(5, "Please add a few details").max(5000);

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal("")),
  inquiryType: z.string().trim().min(1, "Select an inquiry type"),
  message,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const maintenanceSchema = z.object({
  kind: z.enum(["report", "booking"]).default("report"),
  fullName: name,
  email,
  phone,
  unit: z.string().trim().min(1, "Select a unit / location"),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  category: z.string().trim().optional().or(z.literal("")),
  priority: z.string().trim().optional().or(z.literal("")),
  service: z.string().trim().optional().or(z.literal("")),
  preferredAt: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  mediaCount: z.coerce.number().int().min(0).max(20).default(0),
});
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;

export const advertiseSchema = z.object({
  name,
  email,
  phone,
  role: z.string().trim().min(1),
  propertyClass: z.string().trim().min(1),
  listingType: z.string().trim().min(1),
  title: z.string().trim().min(3, "Add a property title").max(200),
  category: z.string().trim().min(1, "Select a category"),
  location: z.string().trim().min(2, "Add a location"),
  price: z.coerce.number().int().min(0, "Enter a valid price"),
  description: message,
  imageCount: z.coerce.number().int().min(0).max(6).default(0),
});
export type AdvertiseInput = z.infer<typeof advertiseSchema>;

export const bookingSchema = z
  .object({
    rentalSlug: z.string().trim().min(1, "Select a rental"),
    guestName: name,
    guestEmail: email,
    guestPhone: phone,
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });
export type BookingInput = z.infer<typeof bookingSchema>;
