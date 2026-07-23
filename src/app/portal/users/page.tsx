import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { ASSIGNABLE_ROLES, ROLE_LABELS, isSuperAdmin } from "@/lib/rbac";
import { COUNTRY_NAMES } from "@/data/locations";
import { createUser, setUserRole, resetUserPassword, deleteUser } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage Users", robots: { index: false } };

const roleTone = (r: string) =>
  r === "ADMIN"
    ? "brand"
    : r === "COUNTRY_ADMIN"
      ? "brand"
      : r === "STAFF"
        ? "info"
        : r === "TENANT"
          ? "neutral"
          : "success";

function since(d: Date) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(d);
}

export default async function UsersPage() {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.role)) redirect("/portal");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Users</h1>
          <p className="text-sm text-ink-muted">
            Create and manage logins for tenants, agents and staff.
          </p>
        </div>
        <ButtonLink href="/portal" variant="outline" size="sm">
          ← Back to portal
        </ButtonLink>
      </div>

      {/* Create */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">Create a login</h2>
        <form action={createUser} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
          <Field label="Full name" htmlFor="name" className="lg:col-span-1">
            <Input id="name" name="name" placeholder="Jane Doe" />
          </Field>
          <Field label="Email" htmlFor="email" required className="lg:col-span-1">
            <Input id="email" name="email" type="email" required placeholder="jane@betafacility.com" />
          </Field>
          <Field label="Role" htmlFor="role" required>
            <Select id="role" name="role" defaultValue="TENANT">
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Country (Country Admin)" htmlFor="country">
            <Select id="country" name="country" defaultValue="">
              <option value="">— none —</option>
              {COUNTRY_NAMES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Temp password (min 6)" htmlFor="password" required>
            <Input id="password" name="password" type="text" required minLength={6} placeholder="••••••" />
          </Field>
          <button
            type="submit"
            className="h-[42px] rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
          >
            Create / Update
          </button>
        </form>
        <p className="mt-2 text-xs text-ink-muted">
          Country Admins manage only their selected country. Tenants: use the same email they booked with. Agency /
          Owner / Vendor logins pair with an organization (Organizations page).
        </p>
      </section>

      {/* List */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold text-ink">All users ({users.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-ink-muted">
                <th className="py-2">User</th>
                <th className="py-2">Role</th>
                <th className="py-2">Created</th>
                <th className="py-2">Change role / country</th>
                <th className="py-2">Reset password</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 align-middle">
                  <td className="py-3">
                    <p className="font-medium text-ink">{u.name || "—"}</p>
                    <p className="text-xs text-ink-muted">{u.email}</p>
                  </td>
                  <td className="py-3">
                    <Badge tone={roleTone(u.role)}>{ROLE_LABELS[u.role] ?? u.role}</Badge>
                    {u.country && <p className="mt-1 text-xs text-ink-muted">{u.country}</p>}
                  </td>
                  <td className="py-3 text-ink-muted">{since(u.createdAt)}</td>
                  <td className="py-3">
                    <form action={setUserRole} className="flex flex-wrap items-center gap-1.5">
                      <input type="hidden" name="id" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      <select
                        name="country"
                        defaultValue={u.country ?? ""}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
                        title="Country (for Country Admin)"
                      >
                        <option value="">country…</option>
                        {COUNTRY_NAMES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <button className="rounded-md bg-ink px-2.5 py-1 text-xs font-semibold text-white hover:bg-ink-soft">
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={resetUserPassword} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        name="password"
                        type="text"
                        minLength={6}
                        placeholder="new password"
                        className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs"
                      />
                      <button className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-ink-soft hover:border-ink">
                        Reset
                      </button>
                    </form>
                  </td>
                  <td className="py-3 text-right">
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
