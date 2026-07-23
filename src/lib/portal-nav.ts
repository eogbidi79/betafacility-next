// Role-aware portal navigation. One shell, sections shown/hidden by role.
import {
  isSuperAdmin,
  isStaff,
  isCountryAdmin,
  isOrgMember,
} from "@/lib/rbac";

export type PortalSection = { key: string; label: string; href: string; icon: string };

const ADMIN_SECTIONS: PortalSection[] = [
  { key: "overview", label: "Overview", href: "/portal", icon: "▦" },
  { key: "properties", label: "Properties", href: "/portal/rentals", icon: "🏠" },
  { key: "agencies", label: "Agencies", href: "/portal/organizations?kind=AGENCY", icon: "🏢" },
  { key: "owners", label: "Owners", href: "/portal/organizations?kind=OWNER", icon: "👤" },
  { key: "vendors", label: "Vendors", href: "/portal/organizations?kind=VENDOR", icon: "🔧" },
  { key: "services", label: "Services", href: "/portal/services", icon: "🛠" },
  { key: "inquiries", label: "Inquiries", href: "/portal/inquiries", icon: "✉" },
  { key: "bookings", label: "Bookings", href: "/portal/bookings", icon: "📅" },
  { key: "users", label: "Users", href: "/portal/users", icon: "👥" },
  { key: "locations", label: "Locations", href: "/portal/locations", icon: "🌍" },
  { key: "reports", label: "Reports", href: "/portal/report", icon: "📊" },
  { key: "audit", label: "Audit Log", href: "/portal/audit", icon: "🧾" },
  { key: "settings", label: "Settings", href: "/portal/settings", icon: "⚙" },
];

/** Returns the sidebar sections a role may see. */
export function portalNav(role?: string): PortalSection[] {
  if (isSuperAdmin(role)) return ADMIN_SECTIONS;

  if (isCountryAdmin(role)) {
    // Country-scoped management; no global-only sections (users, reports, audit,
    // settings) and no country-less ops (inquiries, bookings).
    const allow = new Set(["overview", "properties", "agencies", "owners", "vendors", "services", "locations"]);
    return ADMIN_SECTIONS.filter((s) => allow.has(s.key));
  }

  if (isStaff(role)) {
    // Read-only: overview + the read views + reports/CSV.
    const allow = new Set(["overview", "properties", "inquiries", "bookings", "reports"]);
    return ADMIN_SECTIONS.filter((s) => allow.has(s.key));
  }

  if (isOrgMember(role)) {
    return [
      { key: "overview", label: "Overview", href: "/portal", icon: "▦" },
      { key: "list", label: "List a property", href: "/list-property", icon: "＋" },
    ];
  }

  // Tenant
  return [{ key: "overview", label: "My bookings", href: "/portal", icon: "📅" }];
}

/** Whether the top-bar country selector applies (super admin only). */
export function showCountrySelector(role?: string): boolean {
  return isSuperAdmin(role);
}
