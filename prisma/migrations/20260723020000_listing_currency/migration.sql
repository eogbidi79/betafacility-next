-- Multi-currency for marketplace listings (follows country)
ALTER TABLE "AdvertiseSubmission" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'NGN';
