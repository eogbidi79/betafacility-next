-- Phase 5: Property Management leads
CREATE TABLE IF NOT EXISTS "PropertyManagementLead" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "city" TEXT,
    "propertyType" TEXT,
    "units" TEXT,
    "services" TEXT,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyManagementLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PropertyManagementLead_reference_key" ON "PropertyManagementLead"("reference");
