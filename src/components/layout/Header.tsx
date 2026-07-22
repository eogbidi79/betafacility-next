"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SearchBox } from "@/components/search/SearchBox";
import { mainNav, site, type NavEntry } from "@/data/site";
import { cn } from "@/lib/utils";

function Chevron({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const groupActive = (entry: NavEntry) =>
    entry.href ? isActive(entry.href) : (entry.children ?? []).some((c) => isActive(c.href));

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {mainNav.map((entry) =>
            entry.children ? (
              <div key={entry.label} className="group relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    groupActive(entry)
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-muted hover:bg-gray-100 hover:text-ink",
                  )}
                >
                  {entry.label}
                  <Chevron className="transition-transform group-hover:rotate-180" />
                </button>
                {/* Dropdown: shown on hover or keyboard focus within the group */}
                <div className="invisible absolute right-0 top-full z-50 min-w-[220px] pt-2 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
                    {entry.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={isActive(child.href) ? "page" : undefined}
                        className={cn(
                          "block px-4 py-2 text-sm font-medium transition-colors",
                          isActive(child.href)
                            ? "bg-brand-50 text-brand-700"
                            : "text-ink-soft hover:bg-gray-100 hover:text-ink",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={entry.href}
                href={entry.href!}
                aria-current={isActive(entry.href!) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(entry.href!)
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-gray-100 hover:text-ink",
                )}
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Suspense fallback={null}>
            <SearchBox className="hidden w-48 xl:block" placeholder="Search…" />
          </Suspense>
          <a
            href={site.phoneHref}
            className="hidden text-sm font-semibold text-ink-soft hover:text-brand-600 sm:inline"
          >
            {site.phone}
          </a>
          <ButtonLink href="/login" variant="outline" size="sm" className="hidden sm:inline-flex">
            Login
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 lg:hidden"
          >
            <span className="sr-only">Toggle menu</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <Container className="flex flex-col py-2">
            <div className="px-1 py-2">
              <Suspense fallback={null}>
                <SearchBox />
              </Suspense>
            </div>

            {mainNav.map((entry) =>
              entry.children ? (
                <div key={entry.label}>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => (v === entry.label ? null : entry.label))}
                    aria-expanded={expanded === entry.label}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium",
                      groupActive(entry) ? "text-brand-700" : "text-ink-muted hover:bg-gray-100",
                    )}
                  >
                    {entry.label}
                    <Chevron className={cn("transition-transform", expanded === entry.label && "rotate-180")} />
                  </button>
                  {expanded === entry.label && (
                    <div className="ml-3 flex flex-col border-l border-gray-200 pl-2">
                      {entry.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive(child.href) ? "page" : undefined}
                          className={cn(
                            "rounded-md px-3 py-2 text-sm font-medium",
                            isActive(child.href) ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-gray-100",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={entry.href}
                  href={entry.href!}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(entry.href!) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    isActive(entry.href!) ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:bg-gray-100",
                  )}
                >
                  {entry.label}
                </Link>
              ),
            )}

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-gray-100"
            >
              Login
            </Link>
            <a
              href={site.phoneHref}
              className="rounded-md px-3 py-2.5 text-sm font-semibold text-brand-600"
            >
              {site.phone}
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
