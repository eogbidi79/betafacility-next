import { auth } from "@/auth";
import { canManage, canReadOps, isCountryAdmin, isSuperAdmin } from "@/lib/rbac";

// Server-side authorization guards for server actions and API routes.
// "Never trust the client": every mutation calls one of these, and country
// admins are scoped to their own country on country-bearing entities.

export type Actor = { email: string; role: string; country: string | null };

export async function getActor(): Promise<Actor | null> {
  const s = await auth();
  if (!s?.user?.email) return null;
  return {
    email: s.user.email,
    role: s.user.role ?? "",
    country: s.user.country ?? null,
  };
}

class ForbiddenError extends Error {
  constructor(msg = "Forbidden") {
    super(msg);
    this.name = "ForbiddenError";
  }
}

/** Super Admin only (user management, audit, platform settings, cross-country ops). */
export async function requireSuperAdmin(): Promise<Actor> {
  const a = await getActor();
  if (!a || !isSuperAdmin(a.role)) throw new ForbiddenError();
  return a;
}

/**
 * Super Admin (any country) or Country Admin (their country only). When
 * `entityCountry` is supplied, a country admin acting outside their country is
 * rejected. Omit `entityCountry` only for entities that carry no country.
 */
export async function requireManage(entityCountry?: string | null): Promise<Actor> {
  const a = await getActor();
  if (!a || !canManage(a.role)) throw new ForbiddenError();
  if (isCountryAdmin(a.role) && entityCountry != null && entityCountry !== a.country) {
    throw new ForbiddenError("Out of country scope");
  }
  return a;
}

/** Read operations / reports: super admin, staff, or country admin. */
export async function requireReadOps(): Promise<Actor> {
  const a = await getActor();
  if (!a || !canReadOps(a.role)) throw new ForbiddenError();
  return a;
}

/**
 * Country a mutation should be pinned to. Country admins are forced to their own
 * country regardless of submitted value; super admins keep the requested value.
 */
export function pinnedCountry(actor: Actor, requested: string): string {
  return isCountryAdmin(actor.role) && actor.country ? actor.country : requested;
}

/** Prisma `where` fragment that limits a country admin to their own country. */
export function countryWhere(actor: Actor): { country?: string } {
  return isCountryAdmin(actor.role) && actor.country ? { country: actor.country } : {};
}
