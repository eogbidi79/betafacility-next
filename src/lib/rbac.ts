// Role-based access control — single source of truth for the platform's roles
// and permission predicates. Pure functions only (no auth/prisma imports) so
// this is safe to use from the edge middleware as well as server code.
//
// Roles & permissions:
//   ADMIN         (Super Admin)         — global: everything, all countries, settings, audit
//   STAFF         (Beta Facility Staff) — global read-only: view ops, reports
//   COUNTRY_ADMIN (Country Admin)       — one country: approve/manage listings, agencies,
//                                         vendors in THEIR country only (scoped by User.country)
//   AGENCY        (Agency)              — own agency: manage own listings, view own leads
//   OWNER         (Property Owner)      — own properties: manage own listings, availability, leads
//   VENDOR        (Service Vendor)      — own services: manage services, view booking/requests
//   AGENT         (legacy org member)   — treated as an organisation member (kind from Organization)
//   TENANT        (Tenant)              — own bookings

export type Role =
  | "ADMIN"
  | "STAFF"
  | "COUNTRY_ADMIN"
  | "AGENCY"
  | "OWNER"
  | "VENDOR"
  | "AGENT"
  | "TENANT";

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Super Admin",
  STAFF: "Beta Facility Staff",
  COUNTRY_ADMIN: "Country Admin",
  AGENCY: "Agency",
  OWNER: "Property Owner",
  VENDOR: "Service Vendor",
  AGENT: "Agency / Owner / Vendor",
  TENANT: "Tenant",
};

/** Roles assignable through the admin UI, in display order. */
export const ASSIGNABLE_ROLES: Role[] = [
  "ADMIN",
  "STAFF",
  "COUNTRY_ADMIN",
  "AGENCY",
  "OWNER",
  "VENDOR",
  "TENANT",
];

export const isSuperAdmin = (role?: string): boolean => role === "ADMIN";
export const isCountryAdmin = (role?: string): boolean => role === "COUNTRY_ADMIN";
export const isStaff = (role?: string): boolean => role === "STAFF";

/** Can change records (super admin globally, country admin within their country). */
export const canManage = (role?: string): boolean => role === "ADMIN" || role === "COUNTRY_ADMIN";

/** Can view the operations dashboard (super admin, staff, country admin). */
export const canReadOps = (role?: string): boolean =>
  role === "ADMIN" || role === "STAFF" || role === "COUNTRY_ADMIN";

/**
 * Can view/generate the global status report. Reports are not country-scoped, so
 * they're limited to global roles (super admin + staff), never country admins.
 */
export const canViewReports = (role?: string): boolean => role === "ADMIN" || role === "STAFF";

/** Global-only capabilities: user management, audit log, platform settings. */
export const isGlobalAdmin = (role?: string): boolean => role === "ADMIN";

/** Organisation member (specific capability derives from their Organization.kind). */
export const isOrgMember = (role?: string): boolean =>
  role === "AGENCY" || role === "OWNER" || role === "VENDOR" || role === "AGENT";

/**
 * Route gating used by the edge middleware. Returns whether `role` may access
 * `path`. Server pages/actions re-check independently — never trust this alone.
 */
export function routeAllowed(path: string, role?: string): boolean {
  // Global-only areas
  if (path.startsWith("/portal/users") || path.startsWith("/portal/audit")) {
    return isGlobalAdmin(role);
  }
  // Management areas (super admin + country admin)
  if (
    path.startsWith("/portal/organizations") ||
    path.startsWith("/portal/services") ||
    path.startsWith("/portal/rentals")
  ) {
    return canManage(role);
  }
  // Reports (super admin + staff only — report data is global, not scoped)
  if (path.startsWith("/portal/report")) {
    return canViewReports(role);
  }
  // Portal dashboard: any authenticated user (role-specific view rendered inside)
  if (path.startsWith("/portal")) {
    return Boolean(role);
  }
  return true;
}
