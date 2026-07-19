import { Container } from "./Container";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-gray-200 bg-gray-50">
      <Container className="py-14 sm:py-16">
        {eyebrow && (
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">{subtitle}</p>
        )}
      </Container>
    </section>
  );
}
