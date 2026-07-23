import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

const primaryCtas = [
  { label: "Book Shortlet", href: "/rentals" },
  { label: "Find Long-Term Rental", href: "/rentals" },
];

const secondaryCtas = [
  { label: "List Your Property", href: "/list-property" },
  { label: "Report an Issue", href: "/facility-management" },
  { label: "Book Maintenance", href: "/facility-management" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-brand-900/70" />
      </div>

      <Container className="relative py-20 sm:py-28">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-brand-200">
            Ogombo, Ajah · Lagos, Nigeria
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {site.legalName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Professional Property Management &amp; Facility Services tailored to protect your
            investment and maximize its value. Search, book, pay online, e-sign and get an instant
            receipt.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCtas.map((cta) => (
              <ButtonLink key={cta.label} href={cta.href} size="lg">
                {cta.label}
              </ButtonLink>
            ))}
            <ButtonLink href="/login" size="lg" variant="white">
              Login to Portal
            </ButtonLink>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {secondaryCtas.map((cta) => (
              <ButtonLink
                key={cta.label}
                href={cta.href}
                size="sm"
                variant="white"
                className="font-semibold shadow-sm"
              >
                {cta.label}
              </ButtonLink>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
