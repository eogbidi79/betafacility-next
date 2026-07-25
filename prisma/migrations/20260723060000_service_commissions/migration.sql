-- Business-model hook: service-marketplace commissions
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "commissionRate" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "quotedAmount" INTEGER;
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "currencyCode" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "commissionAmount" INTEGER;
