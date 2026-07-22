"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { slugify, ORG_KINDS, type OrgKind } from "@/lib/organizations";

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session.user.email ?? "system";
}

function isKind(v: string): v is OrgKind {
  return (ORG_KINDS as readonly string[]).includes(v);
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createOrganization(formData: FormData) {
  const actor = await requireAdmin();
  const name = str(formData, "name");
  const kind = str(formData, "kind");
  if (!name || !isKind(kind)) return;

  const org = await prisma.organization.create({
    data: {
      slug: slugify(name),
      kind,
      name,
      email: str(formData, "email").toLowerCase() || null,
      phone: str(formData, "phone") || null,
      country: str(formData, "country") || "Nigeria",
      state: str(formData, "state") || null,
      city: str(formData, "city") || null,
      regNumber: str(formData, "regNumber") || null,
      website: str(formData, "website") || null,
      logoUrl: str(formData, "logoUrl") || null,
      description: str(formData, "description") || null,
      userEmail: str(formData, "userEmail").toLowerCase() || null,
      verified: formData.get("verified") === "on",
    },
  });
  await logAudit({ actor, action: "org.create", entity: "Organization", entityId: org.id, summary: `${kind}: ${name}` });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function setOrgVerified(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  const verified = str(formData, "verified") === "true";
  if (!id) return;
  await prisma.organization.update({ where: { id }, data: { verified } });
  await logAudit({ actor, action: "org.verify", entity: "Organization", entityId: id, summary: verified ? "verified" : "unverified" });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function setOrgActive(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id) return;
  await prisma.organization.update({ where: { id }, data: { active } });
  await logAudit({ actor, action: "org.active", entity: "Organization", entityId: id, summary: active ? "shown" : "hidden" });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function setOrgPlan(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  const plan = str(formData, "plan");
  if (!id || !["Free", "Basic", "Pro"].includes(plan)) return;
  await prisma.organization.update({ where: { id }, data: { subscriptionPlan: plan } });
  await logAudit({ actor, action: "org.plan", entity: "Organization", entityId: id, summary: `→ ${plan}` });
  revalidatePath("/portal/organizations");
}

export async function deleteOrganization(formData: FormData) {
  const actor = await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.organization.delete({ where: { id } });
  await logAudit({ actor, action: "org.delete", entity: "Organization", entityId: id });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}
