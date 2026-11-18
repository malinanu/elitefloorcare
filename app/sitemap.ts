import type { MetadataRoute } from "next";
import { getServiceList } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitesportsfloorcare.com.au";
  const services = await getServiceList();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${base}${path}`, changeFrequency: "monthly", priority });
  return [page("/", 1), ...services.map((s) => page(`/services/${s.slug}`, 0.8)), page("/gallery", 0.6), page("/about", 0.6), page("/service-areas", 0.6)];
}
