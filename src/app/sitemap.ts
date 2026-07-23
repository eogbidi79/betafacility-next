import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/rentals", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/listings", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/properties", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/facility-management", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/list-property", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
  ];

  const now = new Date();

  return routes.map((r) => ({
    url: new URL(r.path, site.url).toString(),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
