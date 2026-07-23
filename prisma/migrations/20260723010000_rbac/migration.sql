-- RBAC: new roles, country scoping for users, country on marketplace listings

-- New Role enum values (idempotent). ALTER TYPE ... ADD VALUE is allowed inside
-- a transaction on PostgreSQL 12+ as long as the value isn't used in the same tx.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'COUNTRY_ADMIN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'AGENCY';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OWNER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'VENDOR';

-- Country scope for country admins
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;

-- Country on marketplace listings so approval can be country-scoped
ALTER TABLE "AdvertiseSubmission" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'Nigeria';
