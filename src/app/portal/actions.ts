"use server";

import { ListingStatus, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireManage, requireSuperAdmin } from "@/lib/authz";
import { meiliEnabled, reindexAll } from "@/lib/meilisearch";
import { captureError } from "@/lib/observability";
import {
  notifyTenancyUnderReview,
  notifyTenancyAccepted,
  notifyTenancyRejected,
} from "@/lib/notifications";

const TENANCY_STAGES = ["UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const;

export async function setTenancyStage(formData: FormData) {
  // Bookings carry no country; tenancy decisions are a super-admin action.
  const actor = await requireSuperAdmin();
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

  await logAudit({ actor: actor.email, action: "tenancy.stage", entity: "Booking", entityId: id, summary: `→ ${stage}` });
  revalidatePath("/portal");
}

export async function setListingStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in ListingStatus)) return;
  const sub = await prisma.advertiseSubmission.findUnique({ where: { id }, select: { country: true } });
  if (!sub) return;
  const actor = await requireManage(sub.country);
  await prisma.advertiseSubmission.update({
    where: { id },
    data: { status: status as ListingStatus },
  });
  await logAudit({ actor: actor.email, action: "listing.status", entity: "AdvertiseSubmission", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
  revalidatePath("/listings");
}

export async function setListingFeatured(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const featured = String(formData.get("featured") ?? "") === "true";
  if (!id) return;
  const sub = await prisma.advertiseSubmission.findUnique({ where: { id }, select: { country: true } });
  if (!sub) return;
  const actor = await requireManage(sub.country);
  await prisma.advertiseSubmission.update({ where: { id }, data: { featured } });
  await logAudit({
    actor: actor.email,
    action: "listing.featured",
    entity: "AdvertiseSubmission",
    entityId: id,
    summary: featured ? "featured" : "unfeatured",
  });
  revalidatePath("/portal");
  revalidatePath("/listings");
}

export async function setLeadStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in RequestStatus)) return;
  const lead = await prisma.propertyManagementLead.findUnique({ where: { id }, select: { country: true } });
  if (!lead) return;
  const actor = await requireManage(lead.country);
  await prisma.propertyManagementLead.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor: actor.email, action: "lead.status", entity: "PropertyManagementLead", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
}

export async function reindexSearch() {
  const actor = await requireSuperAdmin();
  if (!meiliEnabled()) return;
  try {
    const counts = await reindexAll();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    await logAudit({ actor: actor.email, action: "search.reindex", entity: "Meilisearch", summary: `${total} documents` });
  } catch (err) {
    captureError(err, { where: "reindexSearch" });
  }
  revalidatePath("/portal");
}

export async function setInquiryHandled(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = String(formData.get("handled") ?? "") === "true";
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { handled } });
  await logAudit({ actor: actor.email, action: "inquiry.handled", entity: "ContactMessage", entityId: id, summary: handled ? "handled" : "reopened" });
  revalidatePath("/portal/inquiries");
}

export async function setMaintenanceStatus(formData: FormData) {
  // Maintenance requests carry no country; keep as a super-admin action.
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in RequestStatus)) return;
  await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor: actor.email, action: "maintenance.status", entity: "MaintenanceRequest", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal");
}
