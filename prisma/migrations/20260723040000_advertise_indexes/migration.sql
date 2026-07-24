-- Indexes for the marketplace/approved listings (public browse + admin scoping)
CREATE INDEX IF NOT EXISTS "AdvertiseSubmission_status_transactionType_idx" ON "AdvertiseSubmission" ("status", "transactionType");
CREATE INDEX IF NOT EXISTS "AdvertiseSubmission_status_featured_createdAt_idx" ON "AdvertiseSubmission" ("status", "featured", "createdAt");
CREATE INDEX IF NOT EXISTS "AdvertiseSubmission_country_status_idx" ON "AdvertiseSubmission" ("country", "status");
CREATE INDEX IF NOT EXISTS "AdvertiseSubmission_email_idx" ON "AdvertiseSubmission" ("email");
