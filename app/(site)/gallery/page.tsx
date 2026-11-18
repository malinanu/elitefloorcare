import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { CtaBand, PlainHero } from "@/components/inner";
import { getGalleryPage, getProjects, getSettings, pic } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const g = await getGalleryPage();
  return { title: g.title, description: g.metaDescription || g.lead, alternates: { canonical: "/gallery" } };
}

export default async function GalleryPage() {
  const [g, projects, site] = await Promise.all([getGalleryPage(), getProjects(), getSettings()]);
  return (
    <main className="pg">
      <PlainHero title={g.title} lead={g.lead} crumbs={[{ href: "/", label: "Home" }, { label: g.title }]} />
      <GalleryGrid
        sectors={(site.sectors ?? []).map((s) => s.label)}
        projects={projects.map((p) => ({ id: p.id, title: p.title, sector: p.sector, work: p.work, before: pic(p.before), after: pic(p.after) }))}
      />
      <CtaBand title={g.cta.title} text={g.cta.text} />
    </main>
  );
}
