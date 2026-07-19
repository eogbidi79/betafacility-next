"use client";

import Image from "next/image";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";

const stats = [
  { value: 2847, label: "Properties Managed", suffix: "" },
  { value: 98.5, label: "Client Retention", suffix: "%" },
];

const slides = [
  { src: "/images/prop-1.jpg", alt: "Modern residential building" },
  { src: "/images/prop-2.jpg", alt: "Serviced apartment exterior" },
  { src: "/images/prop-3.jpg", alt: "Managed property in Ogombo, Ajah" },
];

export function WhyChooseUs() {
  const [index, setIndex] = useState(0);
  const go = (dir: number) => setIndex((i) => (i + dir + slides.length) % slides.length);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-600">Why choose us</p>
        <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Why choose BetaFacility Managers
        </h2>
        <p className="mt-4 text-lg text-ink-muted">
          With years of experience in the Nigerian property market, we provide professional
          management services you can rely on.
        </p>
        <p className="mt-3 text-ink-soft">
          Our team of dedicated professionals ensures every property under our care receives the
          attention it deserves — from tenants and maintenance to compliance and returns.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-3xl font-extrabold text-brand-600">
                {formatNumber(s.value)}
                {s.suffix}
              </dd>
              <p className="mt-1 text-sm text-ink-muted">{s.label}</p>
            </div>
          ))}
        </dl>

        <ButtonLink href="/about" variant="outline" className="mt-8">
          Learn About Us
        </ButtonLink>
      </div>

      <div className="relative overflow-hidden rounded-2xl shadow-card-hover">
        <div className="relative aspect-[4/3]">
          {slides.map((slide, i) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`object-cover transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white"
        >
          ›
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
