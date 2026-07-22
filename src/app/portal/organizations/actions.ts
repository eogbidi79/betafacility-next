"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify, ORG_KINDS, type OrgKind } from "@/lib/organizations";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
}

function isKind(v: string): v is OrgKind {
  return (ORG_KINDS as readonly string[]).includes(v);
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const kind = str(formData, "kind");
  if (!name || !isKind(kind)) return;

  await prisma.organization.create({
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
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function setOrgVerified(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const verified = str(formData, "verified") === "true";
  if (!id) return;
  await prisma.organization.update({ where: { id }, data: { verified } });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function setOrgActive(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const active = str(formData, "active") === "true";
  if (!id) return;
  await prisma.organization.update({ where: { id }, data: { active } });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}

export async function deleteOrganization(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  await prisma.organization.delete({ where: { id } });
  revalidatePath("/portal/organizations");
  revalidatePath("/agencies");
}
