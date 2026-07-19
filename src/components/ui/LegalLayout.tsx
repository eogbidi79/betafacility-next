import { Container } from "./Container";

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 text-ink-soft [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </Container>
  );
}
