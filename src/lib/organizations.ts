import type { Organization } from "@prisma/client";
import { prisma } from "@/lib/db";

export const ORG_KINDS = ["AGENCY", "OWNER", "VENDOR"] as const;
export type OrgKind = (typeof ORG_KINDS)[number];

export const ORG_KIND_LABEL: Record<string, string> = {
  AGENCY: "Agency",
  OWNER: "Property Owner",
  VENDOR: "Service Vendor",
};

/** URL-safe slug from a name, with a short random suffix to keep it unique. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `org-${suffix}`;
}

export function orgLocation(org: Organization): string {
  return [org.city, org.state, org.country].filter(Boolean).join(", ");
}

/**
 * Approved listings that belong to an organisation. We match by the org's
 * contact email or its linked login email — the same emails a member would
 * use when submitting through the List Property form.
 */
export async function orgListings(org: Organization) {
  const emails = [org.email, org.userEmail]
    .filter((e): e is string => Boolean(e))
    .map((e) => e.toLowerCase());
  if (emails.length === 0) return [];
  return prisma.advertiseSubmission.findMany({
    where: {
      status: "APPROVED",
      email: { in: emails, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
  });
}
