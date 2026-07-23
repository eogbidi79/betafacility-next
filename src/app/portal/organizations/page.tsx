import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { COUNTRY_NAMES } from "@/data/locations";
import { canManage, isCountryAdmin } from "@/lib/rbac";
import { ORG_KINDS, ORG_KIND_LABEL, orgLocation } from "@/lib/organizations";
import {
  createOrganization,
  setOrgVerified,
  setOrgActive,
  setOrgPlan,
  deleteOrganization,
} from "./actions";

const PLANS = ["Free", "Basic", "Pro"] as const;

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Organizations", robots: { index: false } };

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export default async function OrganizationsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManage(role)) redirect("/portal");

  // Country admins only see (and manage) organisations in their country.
  const scope = isCountryAdmin(role) && session?.user?.country ? { country: session.user.country } : {};
  const orgs = await prisma.organization.findMany({ where: scope, orderBy: { createdAt: "desc" } });

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Organizations</h1>
          <p className="text-sm text-ink-muted">
            Agencies, property owners and service vendors. Verified agencies appear in the public directory.
          </p>
        </div>
        <ButtonLink href="/portal" variant="outline" size="sm">
          ← Back to portal
        </ButtonLink>
      </div>

      {/* Create */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Add an organization</h2>
        <form action={createOrganization} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required placeholder="Prime Realty Ltd" />
          </Field>
          <Field label="Type" htmlFor="kind" required>
            <Select id="kind" name="kind" defaultValue="AGENCY">
              {ORG_KINDS.map((k) => (
                <option key={k} value={k}>
                  {ORG_KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Country" htmlFor="country">
            <Select id="country" name="country" defaultValue="Nigeria">
              {COUNTRY_NAMES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="State / Province" htmlFor="state">
            <Input id="state" name="state" placeholder="Lagos" />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" placeholder="Ajah" />
          </Field>
          <Field label="Reg. number (CAC / business no.)" htmlFor="regNumber">
            <Input id="regNumber" name="regNumber" placeholder="RC 1234567" />
          </Field>
          <Field label="Contact email" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="hello@agency.com" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" placeholder="+234 801 234 5678" />
          </Field>
          <Field label="Login email (portal access)" htmlFor="userEmail">
            <Input id="userEmail" name="userEmail" type="email" placeholder="agent@agency.com" />
          </Field>
          <Field label="Website" htmlFor="website">
            <Input id="website" name="website" placeholder="https://agency.com" />
          </Field>
          <Field label="Logo URL" htmlFor="logoUrl">
            <Input id="logoUrl" name="logoUrl" placeholder="https://…/logo.png" />
          </Field>
          <Field label="Description" htmlFor="description" className="sm:col-span-2 lg:col-span-3">
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Short profile shown on the public page."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input type="checkbox" name="verified" className="h-4 w-4 rounded border-gray-300 text-brand-500" />
            Verified (publish to directory now)
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="h-[42px] rounded-lg bg-brand-500 px-6 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Create organization
            </button>
          </div>
        </form>
        <p className="mt-2 text-xs text-ink-muted">
          Tip: set the Login email to the same email the partner uses to submit listings, then create a matching
          AGENT login in Manage Users so they can sign in and track their submissions.
        </p>
      </section>

      {/* List */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">All organizations ({orgs.length})</h2>
        {orgs.length === 0 ? (
          <p className="py-3 text-sm text-ink-muted">Nothing yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-ink-muted">
                  <th className="py-2">Organization</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 align-middle">
                    <td className="py-3">
                      <p className="font-medium text-ink">{o.name}</p>
                      <p className="text-xs text-ink-muted">{o.email || o.userEmail || "—"}</p>
                    </td>
                    <td className="py-3">{ORG_KIND_LABEL[o.kind] ?? o.kind}</td>
                    <td className="py-3 text-ink-soft">{orgLocation(o) || "—"}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge tone={o.verified ? "success" : "neutral"}>
                          {o.verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge tone={o.active ? "info" : "neutral"}>{o.active ? "Active" : "Hidden"}</Badge>
                        <form action={setOrgPlan} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={o.id} />
                          <select
                            name="plan"
                            defaultValue={o.subscriptionPlan}
                            className="rounded-md border border-gray-300 bg-white px-1.5 py-0.5 text-xs text-ink"
                          >
                            {PLANS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <button className="rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-white hover:bg-ink-soft">
                            Set
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="py-3 text-ink-muted">{since(o.createdAt)}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <form action={setOrgVerified}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="verified" value={String(!o.verified)} />
                          <button className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700">
                            {o.verified ? "Unverify" : "Verify"}
                          </button>
                        </form>
                        <form action={setOrgActive}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="active" value={String(!o.active)} />
                          <button className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-ink">
                            {o.active ? "Hide" : "Show"}
                          </button>
                        </form>
                        <form action={deleteOrganization}>
                          <input type="hidden" name="id" value={o.id} />
                          <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Container>
  );
}
