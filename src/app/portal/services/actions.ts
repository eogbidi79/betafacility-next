"use server";

import { RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.email ?? "system";
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createService(formData: FormData) {
  const actor = await requireAdmin();
  const organizationId = str(formData, "organizationId");
  const category = str(formData, "category");
  const title = str(formData, "title");
  if (!organizationId || !category || !title) return;

  const priceRaw = str(formData, "priceFrom");
  const priceFrom = priceRaw ? Math.max(0, Math.round(Number(priceRaw))) : null;

  const service = await prisma.service.create({
    data: {
      organizationId,
      category,
      title,
      description: str(formData, "description") || null,
      country: str(formData, "country") || "Nigeria",
      state: str(formData, "state") || null,
      city: str(formData, "city") || null,
      priceFrom: Number.isFinite(priceFrom as number) ? priceFrom : null,
      currencyCode: str(formData, "currencyCode") || "NGN",
    },
  });
  await logAudit({ actor, action: "service.create", entity: "Service", entityId: service.id, summary: `${category}: ${title}` });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

export async function setServiceActive(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id) return;
  await prisma.service.update({ where: { id }, data: { active } });
  await logAudit({ actor, action: "service.active", entity: "Service", entityId: id, summary: active ? "shown" : "hidden" });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

export async function deleteService(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.service.delete({ where: { id } });
  await logAudit({ actor, action: "service.delete", entity: "Service", entityId: id });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

export async function setServiceRequestStatus(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !(status in RequestStatus)) return;
  await prisma.serviceRequest.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor, action: "servicereq.status", entity: "ServiceRequest", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal/services");
}
