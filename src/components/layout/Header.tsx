"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SearchBox } from "@/components/search/SearchBox";
import { mainNav, site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-ink-muted hover:bg-gray-100 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
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
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-muted hover:bg-gray-100",
                )}
              >
                {item.label}
              </Link>
            ))}
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
