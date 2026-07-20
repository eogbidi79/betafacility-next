-- Advertise submissions gain a transaction type + optional image.
-- They remain PENDING until an admin approves (then shown publicly).
ALTER TABLE "AdvertiseSubmission" ADD COLUMN IF NOT EXISTS "transactionType" TEXT NOT NULL DEFAULT 'RENT';
ALTER TABLE "AdvertiseSubmission" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
