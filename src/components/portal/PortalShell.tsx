"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { SignOutButton } from "@/components/portal/SignOutButton";
import { SearchBox } from "@/components/search/SearchBox";
import { portalNav, showCountrySelector, type PortalSection } from "@/lib/portal-nav";
import { ROLE_LABELS } from "@/lib/rbac";
import { COUNTRY_NAMES } from "@/data/locations";
import { cn } from "@/lib/utils";

function CountrySelect({ current }: { current: string }) {
  const router = useRouter();
  return (
    <select
      aria-label="Country"
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v === "all" ? "/portal" : `/portal?country=${encodeURIComponent(v)}`);
      }}
      className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-ink"
    >
      <option value="all">All countries</option>
      {COUNTRY_NAMES.map((c) => (
        <option key={c}>{c}</option>
      ))}
    </select>
  );
}

function isActive(section: PortalSection, pathname: string, kind: string | null): boolean {
  const [base, query] = section.href.split("?");
  if (base === "/portal") return pathname === "/portal";
  if (!pathname.startsWith(base)) return false;
  if (query) {
    const wantKind = new URLSearchParams(query).get("kind");
    return wantKind ? kind === wantKind : true;
  }
  return true;
}

export function PortalShell({
  role,
  country,
  email,
  name,
  children,
}: {
  role?: string;
  country?: string | null;
  email?: string | null;
  name?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const kind = params.get("kind");
  const [open, setOpen] = useState(false);
  const sections = portalNav(role);

  const Sidebar = (
    <nav className="flex flex-col gap-0.5" aria-label="Portal sections">
      {sections.map((s) => (
        <Link
          key={s.key}
          href={s.href}
          onClick={() => setOpen(false)}
          aria-current={isActive(s, pathname, kind) ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(s, pathname, kind)
              ? "bg-brand-50 text-brand-700"
              : "text-ink-muted hover:bg-gray-100 hover:text-ink",
          )}
        >
          <span aria-hidden className="w-4 text-center text-[13px]">{s.icon}</span>
          {s.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="sticky top-16 z-30 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 py-2.5 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle sections"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <p className="font-bold text-ink">
          Beta Facility <span className="text-ink-muted">Portal</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          {showCountrySelector(role) && <CountrySelect current={params.get("country") ?? "all"} />}
          <Suspense fallback={null}>
            <SearchBox className="hidden w-44 md:block" placeholder="Search…" />
          </Suspense>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-ink">{name || email}</p>
            <p className="text-[11px] text-ink-muted">
              {role ? ROLE_LABELS[role] ?? role : ""}
              {country ? ` · ${country}` : ""}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 flex-shrink-0 border-r border-gray-200 p-3 lg:block">
          <div className="sticky top-28">{Sidebar}</div>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {open && (
          <div className="border-b border-gray-200 bg-white p-3 lg:hidden">{Sidebar}</div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
