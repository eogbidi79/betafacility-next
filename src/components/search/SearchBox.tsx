"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBox({
  className,
  autoFocus,
  placeholder = "Search rentals, services, agencies…",
}: {
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term.length >= 2) router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
      className={cn("relative", className)}
    >
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search the site"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 placeholder:text-gray-400"
      />
    </form>
  );
}
