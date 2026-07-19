import { LegalLayout } from "@/components/ui/LegalLayout";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How BetaFacility Managers Limited collects, uses and protects your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <p>
        BetaFacility Managers Limited (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This
        policy explains what information we collect when you use our website and services, and how we
        use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Contact details you provide (name, email, phone) when submitting a form.</li>
        <li>Property, booking and maintenance-request details you share with us.</li>
        <li>Basic technical data such as browser type and pages visited.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To respond to inquiries and process bookings or maintenance requests.</li>
        <li>To manage properties and communicate service updates.</li>
        <li>To improve our website and services.</li>
      </ul>

      <h2>Data protection</h2>
      <p>
        We apply reasonable measures to protect your data and do not sell it to third parties. We
        retain information only as long as necessary to provide our services or as required by law.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy question, email us at{" "}
        <a href={`mailto:${site.emails.info}`} className="font-medium text-brand-600 hover:text-brand-700">
          {site.emails.info}
        </a>
        .
      </p>
    </LegalLayout>
  );
}
