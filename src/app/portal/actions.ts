"use server";

import { ListingStatus, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import {
  notifyTenancyUnderReview,
  notifyTenancyAccepted,
  notifyTenancyRejected,
} from "@/lib/notifications";

async function requireAuth(): Promise<string> {
  const session = await auth();
  // Only admins can change records; staff are read-only.
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.email ?? "system";
}

const TENANCY_STAGES = ["UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const;

export async function setTenancyStage(formData: FormData) {
  const actor = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  if (!id || !TENANCY_STAGES.includes(stage as (typeof TENANCY_STAGES)[number])) return;

  const booking = await prisma.booking.update({
    where: { id },
    data: { stage },
  });

  // Notify the applicant of the outcome of this stage.
  if (stage === "UNDER_REVIEW") await notifyTenancyUnderReview(booking);
  else if (stage === "ACCEPTED") await notifyTenancyAccepted(booking);
  else if (stage === "REJECTED") await notifyTenancyRejected(booking);

  await logAudit({ actor, action: "tenancy.stage", entity: "Booking", entityId: id, summary: `→ ${stage}` });
  revalidatePath("/portal");
}

export async function setListingStatus(formData: FormData) {
  const actor = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in ListingStatus)) return;
  await prisma.advertiseSubmission.update({
    where: { id },
    data: { status: status as ListingStatus },
  });
  await logAudit({ actor, action: "listing.status", entity: "AdvertiseSubmission", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
  revalidatePath("/listings");
}

export async function setListingFeatured(formData: FormData) {
  const actor = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const featured = String(formData.get("featured") ?? "") === "true";
  if (!id) return;
  await prisma.advertiseSubmission.update({ where: { id }, data: { featured } });
  await logAudit({
    actor,
    action: "listing.featured",
    entity: "AdvertiseSubmission",
    entityId: id,
    summary: featured ? "featured" : "unfeatured",
  });
  revalidatePath("/portal");
  revalidatePath("/listings");
}

export async function setLeadStatus(formData: FormData) {
  const actor = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in RequestStatus)) return;
  await prisma.propertyManagementLead.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor, action: "lead.status", entity: "PropertyManagementLead", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
}

export async function setMaintenanceStatus(formData: FormData) {
  const actor = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in RequestStatus)) return;
  await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor, action: "maintenance.status", entity: "MaintenanceRequest", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
}
