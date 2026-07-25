-- Normalised property media (url + category + sortOrder). Backfill from the
-- legacy JSON `photos` column runs in the idempotent seed after deploy.
CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'building',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyImage_listingId_sortOrder_idx" ON "PropertyImage" ("listingId", "sortOrder");

DO $$ BEGIN
    ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_listingId_fkey"
        FOREIGN KEY ("listingId") REFERENCES "RentalListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
