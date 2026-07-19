-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "term" TEXT NOT NULL DEFAULT 'short-term',
    "rentalId" TEXT,
    "propertySlug" TEXT,
    "propertyTitle" TEXT,
    "propertyAddress" TEXT,
    "landlordName" TEXT,
    "stage" TEXT,
    "guarantorName" TEXT,
    "guarantorPhone" TEXT,
    "guarantorEmail" TEXT,
    "guarantorToken" TEXT,
    "guarantorConsent" BOOLEAN NOT NULL DEFAULT false,
    "guarantorConsentAt" DATETIME,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "tenantAddress" TEXT,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "nights" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentRef" TEXT,
    "paidAt" DATETIME,
    "signatureRef" TEXT,
    "signedAt" DATETIME,
    "inflationConsent" BOOLEAN NOT NULL DEFAULT false,
    "inflationConsentAt" DATETIME,
    "repName" TEXT,
    "repSignedAt" DATETIME,
    "landlordSignedAt" DATETIME,
    "cancelledAt" DATETIME,
    "refundOutcome" TEXT,
    "voucherCode" TEXT,
    "appliedVoucherCode" TEXT,
    "voucherDiscount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("amount", "appliedVoucherCode", "cancelledAt", "checkIn", "checkOut", "createdAt", "guarantorName", "guarantorPhone", "guestEmail", "guestName", "guestPhone", "id", "inflationConsent", "inflationConsentAt", "landlordName", "landlordSignedAt", "nights", "paidAt", "paymentRef", "propertyAddress", "propertySlug", "propertyTitle", "reference", "refundOutcome", "rentalId", "repName", "repSignedAt", "signatureRef", "signedAt", "stage", "status", "tenantAddress", "term", "userId", "voucherCode", "voucherDiscount") SELECT "amount", "appliedVoucherCode", "cancelledAt", "checkIn", "checkOut", "createdAt", "guarantorName", "guarantorPhone", "guestEmail", "guestName", "guestPhone", "id", "inflationConsent", "inflationConsentAt", "landlordName", "landlordSignedAt", "nights", "paidAt", "paymentRef", "propertyAddress", "propertySlug", "propertyTitle", "reference", "refundOutcome", "rentalId", "repName", "repSignedAt", "signatureRef", "signedAt", "stage", "status", "tenantAddress", "term", "userId", "voucherCode", "voucherDiscount" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");
CREATE UNIQUE INDEX "Booking_guarantorToken_key" ON "Booking"("guarantorToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
