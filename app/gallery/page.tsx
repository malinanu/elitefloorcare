import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { CtaBand, PlainHero } from "@/components/inner";

export const metadata: Metadata = {
  title: "Before & After Gallery",
  description:
    "Browse the full before-and-after portfolio of timber sports floor recoats, deep cleans and line marking re-sets across Victorian schools, stadiums, gyms and halls.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <main className="pg">
      <PlainHero
        title="Before & After Gallery"
        lead="School halls, stadium show courts, council rec centres and hundred-year-old community halls — every one of these is the same floor, photographed either side of one visit."
        crumbs={[{ href: "/", label: "Home" }, { label: "Before & After Gallery" }]}
      />
      <GalleryGrid />
      <CtaBand title="See what we can do for your floor" text="Free inspection, written report, costed recommendation. Anywhere in Victoria." />
    </main>
  );
}
