import { cn } from "@/lib/utils";

type Tone = "success" | "brand" | "neutral" | "info";

const tones: Record<Tone, string> = {
  success: "bg-green-50 text-green-700",
  brand: "bg-brand-50 text-brand-700",
  neutral: "bg-gray-100 text-ink-soft",
  info: "bg-blue-50 text-blue-700",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
