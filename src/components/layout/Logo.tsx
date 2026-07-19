import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`${site.name} home`}
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 object-contain"
        priority
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            variant === "light" ? "text-white" : "text-ink",
          )}
        >
          Beta<span className="text-brand-500">Facility</span>
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.12em]",
            variant === "light" ? "text-white/70" : "text-ink-muted",
          )}
        >
          Managers
        </span>
      </span>
    </Link>
  );
}
