import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

const primaryCtas = [
  { label: "Book Shortlet", href: "/rentals" },
  { label: "Find Long-Term Rental", href: "/rentals" },
];

const secondaryCtas = [
  { label: "Advertise Your Property", href: "/advertise" },
  { label: "Report an Issue", href: "/facility-management" },
  { label: "Book Maintenance", href: "/facility-management" },
];

const pill =
  "inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40";
const orangePill = `${pill} bg-brand-500 px-6 py-3 text-sm text-white shadow-lg shadow-black/20 hover:bg-brand-600`;
const whitePill = `${pill} bg-white px-6 py-3 text-sm text-brand-700 shadow-lg shadow-black/20 hover:bg-brand-50`;
const whitePillSm = `${pill} bg-white px-4 py-2 text-xs text-brand-700 shadow-md shadow-black/10 hover:bg-brand-50`;

export function Hero() {
  return (
    <section className="px-3 pt-3 sm:px-5 sm:pt-5">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[1.75rem] bg-ink sm:rounded-[2.25rem]">
        {/* Property imagery with a neutral scrim (no colour tint) for legibility */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        </div>

        <Container className="relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl animate-fade-up">
            <span className="mb-5 inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur">
              Ogombo, Ajah · Lagos, Nigeria
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {site.legalName}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
              Professional Property Management &amp; Facility Services tailored to protect your
              investment and maximize its value. Search, book, pay online, e-sign and get an instant
              receipt.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {primaryCtas.map((cta) => (
                <Link key={cta.label} href={cta.href} className={orangePill}>
                  {cta.label}
                </Link>
              ))}
              <Link href="/login" className={whitePill}>
                Login to Portal
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {secondaryCtas.map((cta) => (
                <Link key={cta.label} href={cta.href} className={whitePillSm}>
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
