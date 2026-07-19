import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CTABand() {
  return (
    <section className="bg-brand-500">
      <Container className="py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to optimize your property portfolio?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
          Partner with BetaFacility Managers to ensure your real estate assets are professionally
          maintained and consistently profitable.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" size="lg" variant="white">
            Schedule a Consultation
          </ButtonLink>
          <ButtonLink
            href="/properties"
            size="lg"
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:border-white hover:bg-white/10"
          >
            View Our Portfolio
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
