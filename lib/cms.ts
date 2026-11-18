import "server-only";
import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import { CMS_TAG } from "@/cms/shared";
import type { About, GalleryPage, Home, Media, Plan, Project, Service, ServiceAreasPage, SiteSetting, Testimonial } from "@/payload-types";

export const cms = () => getPayload({ config });

/** Cached read; every CMS change calls revalidateTag(CMS_TAG) (cms/shared.ts), so edits show at once. */
const cached = <A extends unknown[], R>(key: string, fn: (...a: A) => Promise<R>) => unstable_cache(fn, [key], { tags: [CMS_TAG] });

export const getSettings = cached("settings", async () => (await cms()).findGlobal({ slug: "site-settings", depth: 0 }) as Promise<SiteSetting>);
export const getHome = cached("home", async () => (await cms()).findGlobal({ slug: "home", depth: 1 }) as Promise<Home>);
export const getAbout = cached("about", async () => (await cms()).findGlobal({ slug: "about", depth: 1 }) as Promise<About>);
export const getGalleryPage = cached("gallery-page", async () => (await cms()).findGlobal({ slug: "gallery-page", depth: 0 }) as Promise<GalleryPage>);
export const getServiceAreasPage = cached(
  "service-areas-page",
  async () => (await cms()).findGlobal({ slug: "service-areas-page", depth: 0 }) as Promise<ServiceAreasPage>,
);

/** Light list for nav, footer, cards and cross-sell tiles. */
export const getServiceList = cached("service-list", async () => {
  const r = await (await cms()).find({
    collection: "services",
    sort: "order",
    limit: 50,
    depth: 0,
    select: { slug: true, title: true, navLabel: true, footerLabel: true, icon: true, summary: true, crossSellTagline: true },
  });
  return r.docs as Pick<Service, "id" | "slug" | "title" | "navLabel" | "footerLabel" | "icon" | "summary" | "crossSellTagline">[];
});

export const getService = cached("service", async (slug: string) => {
  const r = await (await cms()).find({ collection: "services", where: { slug: { equals: slug } }, limit: 1, depth: 1 });
  return (r.docs[0] as Service | undefined) ?? null;
});

const published = { published: { equals: true } } as const;
export const getProjects = cached("projects", async () => {
  const r = await (await cms()).find({ collection: "projects", where: published, sort: "order", limit: 200, depth: 1 });
  return r.docs as Project[];
});
export const getTestimonials = cached("testimonials", async () => {
  const r = await (await cms()).find({ collection: "testimonials", where: published, sort: "order", limit: 12, depth: 0 });
  return r.docs as Testimonial[];
});
export const getPlans = cached("plans", async () => {
  const r = await (await cms()).find({ collection: "plans", where: published, sort: "order", limit: 12, depth: 0 });
  return r.docs as Plan[];
});

/** A populated upload field → what next/image needs. */
export type Pic = { src: string; alt: string; width?: number; height?: number };
export function pic(m: number | Media | null | undefined): Pic {
  if (!m || typeof m === "number") return { src: "/images/Empty_indoor_basketball_court_20260910165522.jpg", alt: "" };
  // Payload prefixes serverURL; keep it relative so next/image treats it as a local (same-origin) file.
  const src = (m.url ?? "").replace(/^https?:\/\/[^/]+/, "");
  return { src, alt: m.alt ?? "", width: m.width ?? undefined, height: m.height ?? undefined };
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
