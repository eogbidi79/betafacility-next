import type { Metadata } from "next";
import { site } from "@/data/site";

type PageSeo = {
  title: string;
  description: string;
  path?: string;
};

/**
 * Builds per-page Metadata that inherits the site defaults (Open Graph,
 * Twitter, canonical) while overriding title/description/canonical path.
 */
export function pageMetadata({ title, description, path = "/" }: PageSeo): Metadata {
  const url = new URL(path, site.url).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.legalName,
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
