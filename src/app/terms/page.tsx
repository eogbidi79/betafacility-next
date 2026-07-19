import { LegalLayout } from "@/components/ui/LegalLayout";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of the BetaFacility Managers website and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 2026">
      <p>
        These terms govern your use of the BetaFacility Managers Limited website and services. By
        using our website, you agree to these terms.
      </p>

      <h2>Use of our services</h2>
      <ul>
        <li>Provide accurate information when booking, listing or requesting maintenance.</li>
        <li>Use the platform lawfully and not to post misleading listings.</li>
        <li>Bookings and listings may be subject to review, approval and availability.</li>
      </ul>

      <h2>Payments &amp; bookings</h2>
      <p>
        Rental fees, service charges and applicable costs are shown before you confirm a booking.
        Payment terms, cancellations and refunds are handled in line with the specific agreement for
        each property.
      </p>

      <h2>Liability</h2>
      <p>
        We aim to keep information accurate and services available, but provide the website on an
        &ldquo;as is&rdquo; basis without warranties. We are not liable for indirect or consequential
        loss arising from use of the site.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${site.emails.info}`} className="font-medium text-brand-600 hover:text-brand-700">
          {site.emails.info}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
