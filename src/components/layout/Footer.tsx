import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerLinks, site } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-ink text-white/80">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <span className="text-lg font-extrabold text-white">
              Beta<span className="text-brand-500">Facility</span> Managers
            </span>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{site.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/60 transition-colors hover:text-brand-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact Us</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <a href={`mailto:${site.emails.info}`} className="hover:text-brand-400">
                  {site.emails.info}
                </a>
              </li>
              <li>
                <a href={site.phoneHref} className="hover:text-brand-400">
                  {site.phone}
                </a>
              </li>
              <li>{site.address.full}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Follow Us</h3>
            <div className="mt-4 flex gap-3">
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  {s.label.charAt(0)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/bookings" className="hover:text-brand-400">
              Track a Booking
            </Link>
            <Link href="/privacy" className="hover:text-brand-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
