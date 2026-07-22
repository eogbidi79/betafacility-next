-- Phase 1: multi-country + multi-currency + richer property fields on listings.
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'Nigeria';
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "propertyType" TEXT NOT NULL DEFAULT 'Apartment';
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "bathrooms" INTEGER;
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "furnished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "petFriendly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RentalListing" ADD COLUMN IF NOT EXISTS "parking" BOOLEAN NOT NULL DEFAULT false;

-- Helpful indexes for country/region/city/category/status filtering.
CREATE INDEX IF NOT EXISTS "RentalListing_country_state_city_idx" ON "RentalListing" ("country", "state", "city");
CREATE INDEX IF NOT EXISTS "RentalListing_category_status_idx" ON "RentalListing" ("rentalCategory", "status");
