"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v: FormDataEntryValue | null): number | null => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number(s.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

function collect(fd: FormData) {
  return {
    title: String(fd.get("title") ?? "").trim(),
    rentalCategory: String(fd.get("rentalCategory") ?? "Short-let"),
    propertyType: String(fd.get("propertyType") ?? "Apartment"),
    bedroomType: String(fd.get("bedroomType") ?? "Studio"),
    bathrooms: num(fd.get("bathrooms")),
    totalUnits: num(fd.get("totalUnits")) ?? 1,
    availableUnits: num(fd.get("availableUnits")) ?? 0,
    country: String(fd.get("country") ?? "Nigeria").trim() || "Nigeria",
    state: String(fd.get("state") ?? "").trim() || "Lagos",
    city: String(fd.get("city") ?? "").trim() || "Ajah",
    area: String(fd.get("area") ?? "").trim() || null,
    address: String(fd.get("address") ?? "").trim() || null,
    postalCode: String(fd.get("postalCode") ?? "").trim() || null,
    price: num(fd.get("price")),
    rentPerYear: num(fd.get("rentPerYear")),
    currencyCode: String(fd.get("currencyCode") ?? "NGN"),
    status: String(fd.get("status") ?? "Available"),
    furnished: Boolean(fd.get("furnished")),
    petFriendly: Boolean(fd.get("petFriendly")),
    parking: Boolean(fd.get("parking")),
    amenities: JSON.stringify(
      String(fd.get("amenities") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
    photos: JSON.stringify({
      livingRoom: lines(fd.get("living")),
      bedroom: lines(fd.get("bedroom")),
      toiletBathroom: lines(fd.get("toilet")),
      kitchen: lines(fd.get("kitchen")),
      building: lines(fd.get("building")),
    }),
    description: String(fd.get("description") ?? "").trim() || null,
    listedBy: String(fd.get("listedBy") ?? "Beta Facility"),
    latitude: num(fd.get("latitude")),
    longitude: num(fd.get("longitude")),
  };
}

function revalidate() {
  revalidatePath("/portal/rentals");
  revalidatePath("/rentals");
  revalidatePath("/");
}

export async function createListing(fd: FormData) {
  await requireAdmin();
  const data = collect(fd);
  if (!data.title) return;
  await prisma.rentalListing.create({ data });
  revalidate();
}

export async function updateListing(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.rentalListing.update({ where: { id }, data: collect(fd) });
  revalidate();
}

export async function setAvailability(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const availableUnits = num(fd.get("availableUnits")) ?? 0;
  if (!id) return;
  await prisma.rentalListing.update({ where: { id }, data: { availableUnits } });
  revalidate();
}

export async function deleteListing(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.rentalListing.delete({ where: { id } });
  revalidate();
}
