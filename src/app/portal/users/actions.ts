"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}

function isRole(value: string): value is Role {
  return value in Role;
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim() || null;
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !isRole(role) || password.length < 6) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash },
  });
  revalidatePath("/portal/users");
}

export async function setUserRole(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!id || !isRole(role)) return;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/portal/users");
}

export async function resetUserPassword(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 6) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/portal/users");
}

export async function deleteUser(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  // Don't let an admin delete their own account (avoid lockout).
  if (target.email === session.user?.email) return;
  // Don't delete the last remaining admin.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) return;
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/portal/users");
}
