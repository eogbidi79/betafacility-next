"use server";

import { ListingStatus, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
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
