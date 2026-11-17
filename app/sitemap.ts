import type { MetadataRoute } from "next";
import { services, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  });
  return [
    page("/", 1),
    ...services.map((s) => page(`/services/${s.slug}`, 0.8)),
    page("/gallery", 0.6),
    page("/about", 0.6),
    page("/service-areas", 0.6),
  ];
}
