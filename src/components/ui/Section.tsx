import { cn } from "@/lib/utils";
import { Container } from "./Container";

export function Section({
  className,
  containerClassName,
  children,
  id,
}: {
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="mb-2 text-sm font-bold uppercase tracking-wider text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-ink-muted">{subtitle}</p>}
    </div>
  );
}
