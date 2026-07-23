"use server";

import { RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireManage, pinnedCountry } from "@/lib/authz";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createService(formData: FormData) {
  const actor = await requireManage();
  const organizationId = str(formData, "organizationId");
  const category = str(formData, "category");
  const title = str(formData, "title");
  if (!organizationId || !category || !title) return;
  const country = pinnedCountry(actor, str(formData, "country") || "Nigeria");

  const priceRaw = str(formData, "priceFrom");
  const priceFrom = priceRaw ? Math.max(0, Math.round(Number(priceRaw))) : null;

  const service = await prisma.service.create({
    data: {
      organizationId,
      category,
      title,
      description: str(formData, "description") || null,
      country,
      state: str(formData, "state") || null,
      city: str(formData, "city") || null,
      priceFrom: Number.isFinite(priceFrom as number) ? priceFrom : null,
      currencyCode: str(formData, "currencyCode") || "NGN",
    },
  });
  await logAudit({ actor: actor.email, action: "service.create", entity: "Service", entityId: service.id, summary: `${category}: ${title}` });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

async function loadServiceCountry(id: string): Promise<string | null | undefined> {
  const s = await prisma.service.findUnique({ where: { id }, select: { country: true } });
  return s?.country;
}

export async function setServiceActive(formData: FormData) {
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id) return;
  const country = await loadServiceCountry(id);
  if (country === undefined) return;
  const actor = await requireManage(country);
  await prisma.service.update({ where: { id }, data: { active } });
  await logAudit({ actor: actor.email, action: "service.active", entity: "Service", entityId: id, summary: active ? "shown" : "hidden" });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

export async function deleteService(formData: FormData) {
  const id = str(formData, "id");
  if (!id) return;
  const country = await loadServiceCountry(id);
  if (country === undefined) return;
  const actor = await requireManage(country);
  await prisma.service.delete({ where: { id } });
  await logAudit({ actor: actor.email, action: "service.delete", entity: "Service", entityId: id });
  revalidatePath("/portal/services");
  revalidatePath("/property-services");
}

export async function setServiceRequestStatus(formData: FormData) {
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!id || !(status in RequestStatus)) return;
  // Scope by the requested service's country when known.
  const req = await prisma.serviceRequest.findUnique({ where: { id }, select: { serviceId: true } });
  if (!req) return;
  const country = req.serviceId ? await loadServiceCountry(req.serviceId) : null;
  const actor = await requireManage(country ?? null);
  await prisma.serviceRequest.update({
    where: { id },
    data: { status: status as RequestStatus },
  });
  await logAudit({ actor: actor.email, action: "servicereq.status", entity: "ServiceRequest", entityId: id, summary: `→ ${status}` });
  revalidatePath("/portal/services");
}
