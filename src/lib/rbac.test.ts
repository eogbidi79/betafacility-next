import { describe, it, expect } from "vitest";
import {
  canManage,
  canReadOps,
  isSuperAdmin,
  isCountryAdmin,
  isStaff,
  isGlobalAdmin,
  isOrgMember,
  routeAllowed,
} from "./rbac";

describe("rbac predicates", () => {
  it("super admin can do everything", () => {
    expect(isSuperAdmin("ADMIN")).toBe(true);
    expect(isGlobalAdmin("ADMIN")).toBe(true);
    expect(canManage("ADMIN")).toBe(true);
    expect(canReadOps("ADMIN")).toBe(true);
  });

  it("staff is read-only ops, cannot manage", () => {
    expect(isStaff("STAFF")).toBe(true);
    expect(canReadOps("STAFF")).toBe(true);
    expect(canManage("STAFF")).toBe(false);
    expect(isGlobalAdmin("STAFF")).toBe(false);
  });

  it("country admin can manage and read ops, but is not global", () => {
    expect(isCountryAdmin("COUNTRY_ADMIN")).toBe(true);
    expect(canManage("COUNTRY_ADMIN")).toBe(true);
    expect(canReadOps("COUNTRY_ADMIN")).toBe(true);
    expect(isGlobalAdmin("COUNTRY_ADMIN")).toBe(false);
  });

  it("org members (agency/owner/vendor/agent) cannot manage or read ops", () => {
    for (const r of ["AGENCY", "OWNER", "VENDOR", "AGENT"]) {
      expect(isOrgMember(r)).toBe(true);
      expect(canManage(r)).toBe(false);
      expect(canReadOps(r)).toBe(false);
    }
  });

  it("tenant / unknown has no privileged access", () => {
    for (const r of ["TENANT", "", undefined]) {
      expect(canManage(r)).toBe(false);
      expect(canReadOps(r)).toBe(false);
      expect(isGlobalAdmin(r)).toBe(false);
    }
  });
});

describe("routeAllowed", () => {
  it("gates user management + audit to super admin only", () => {
    for (const p of ["/portal/users", "/portal/audit"]) {
      expect(routeAllowed(p, "ADMIN")).toBe(true);
      expect(routeAllowed(p, "COUNTRY_ADMIN")).toBe(false);
      expect(routeAllowed(p, "STAFF")).toBe(false);
    }
  });

  it("gates management pages to super + country admin", () => {
    for (const p of ["/portal/organizations", "/portal/services", "/portal/rentals"]) {
      expect(routeAllowed(p, "ADMIN")).toBe(true);
      expect(routeAllowed(p, "COUNTRY_ADMIN")).toBe(true);
      expect(routeAllowed(p, "STAFF")).toBe(false);
      expect(routeAllowed(p, "AGENCY")).toBe(false);
    }
  });

  it("gates reports to super + staff + country admin", () => {
    expect(routeAllowed("/portal/report", "STAFF")).toBe(true);
    expect(routeAllowed("/portal/report", "COUNTRY_ADMIN")).toBe(true);
    expect(routeAllowed("/portal/report", "TENANT")).toBe(false);
  });

  it("allows any authenticated user into the portal dashboard, and public routes for all", () => {
    expect(routeAllowed("/portal", "TENANT")).toBe(true);
    expect(routeAllowed("/portal", undefined)).toBe(false);
    expect(routeAllowed("/rentals", undefined)).toBe(true);
  });
});
