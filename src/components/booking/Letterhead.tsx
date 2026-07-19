import Image from "next/image";
import { site } from "@/data/site";

export function Letterhead({ docTitle, reference }: { docTitle: string; reference: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b-2 border-brand-500 pb-5">
      <div className="flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 object-contain"
        />
        <div>
          <p className="text-xl font-extrabold leading-none text-ink">
            Beta<span className="text-brand-500">Facility</span> Managers Limited
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {site.tagline} · {site.rcNumber}
          </p>
          <p className="text-xs text-ink-muted">
            {site.address.full} · {site.phone} · {site.emails.info}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-600">{docTitle}</p>
        <p className="text-xs text-ink-muted tabular">Ref: {reference}</p>
      </div>
    </div>
  );
}
