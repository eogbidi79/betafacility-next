"use server";

import { ListingStatus, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  notifyTenancyUnderReview,
  notifyTenancyAccepted,
  notifyTenancyRejected,
} from "@/lib/notifications";

async function requireAuth() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "STAFF") throw new Error("Forbidden");
}

const TENANCY_STAGES = ["UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const;

export async function setTenancyStage(formData: FormData) {
  await requireAuth();
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

  revalidatePath("/portal");
}

export async function setListingStatus(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in ListingStatus)) return;
  await prisma.advertiseSubmission.update({
    where: { id },
    data: { status: status as ListingStatus },
  });
  revalidatePath("/portal");
}

export async function setMaintenanceStatus(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !(status in RequestStatus)) return;
  await prisma.maintenanceRequest.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  revalidatePath("/portal");
}
