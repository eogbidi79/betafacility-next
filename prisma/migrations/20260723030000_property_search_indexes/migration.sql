-- Phase 1 search: indexes backing property browse filters + pagination.
-- (country/state/city and rentalCategory/status already exist from 20260721030000.)
CREATE INDEX IF NOT EXISTS "RentalListing_propertyType_idx" ON "RentalListing" ("propertyType");
CREATE INDEX IF NOT EXISTS "RentalListing_status_idx" ON "RentalListing" ("status");
CREATE INDEX IF NOT EXISTS "RentalListing_price_idx" ON "RentalListing" ("price");
CREATE INDEX IF NOT EXISTS "RentalListing_rentPerYear_idx" ON "RentalListing" ("rentPerYear");
CREATE INDEX IF NOT EXISTS "RentalListing_active_featured_createdAt_idx" ON "RentalListing" ("active", "featured", "createdAt");
