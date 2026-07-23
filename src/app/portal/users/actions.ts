"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requireSuperAdmin } from "@/lib/authz";

function isRole(value: string): value is Role {
  return value in Role;
}

// Country only applies to country admins; cleared for every other role.
function countryFor(role: string, raw: string): string | null {
  return role === "COUNTRY_ADMIN" ? raw.trim() || null : null;
}

export async function createUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !isRole(role) || password.length < 6) return;
  const country = countryFor(role, String(formData.get("country") ?? ""));

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, role, country, passwordHash },
    create: { email, name, role, country, passwordHash },
  });
  await logAudit({
    actor: actor.email,
    action: "user.upsert",
    entity: "User",
    summary: `${email} (${role}${country ? ` · ${country}` : ""})`,
  });
  revalidatePath("/portal/users");
}

export async function setUserRole(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || !isRole(role)) return;
  const country = countryFor(role, String(formData.get("country") ?? ""));
  await prisma.user.update({ where: { id }, data: { role, country } });
  await logAudit({ actor: actor.email, action: "user.role", entity: "User", entityId: id, summary: `→ ${role}${country ? ` · ${country}` : ""}` });
  revalidatePath("/portal/users");
}

export async function resetUserPassword(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 6) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await logAudit({ actor: actor.email, action: "user.password", entity: "User", entityId: id });
  revalidatePath("/portal/users");
}

export async function deleteUser(formData: FormData) {
  const actor = await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  // Don't let an admin delete their own account (avoid lockout).
  if (target.email === actor.email) return;
  // Don't delete the last remaining super admin.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) return;
  }
  await prisma.user.delete({ where: { id } });
  await logAudit({ actor: actor.email, action: "user.delete", entity: "User", entityId: id, summary: target.email });
  revalidatePath("/portal/users");
}
