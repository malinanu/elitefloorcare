import type { Access, CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

/** Every public page reads CMS data through lib/cms.ts, cached under this tag. */
export const CMS_TAG = "cms";

async function bust() {
  // Imported lazily: next/cache is only available inside the Next.js runtime, not in CLI scripts.
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag(CMS_TAG);
  } catch {
    /* running outside Next (seed script) — nothing cached to clear */
  }
}

export const revalidateCollection: CollectionAfterChangeHook = async ({ doc }) => {
  await bust();
  return doc;
};
export const revalidateCollectionDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await bust();
  return doc;
};
export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc }) => {
  await bust();
  return doc;
};

export const loggedIn: Access = ({ req }) => Boolean(req.user);
export const anyone: Access = () => true;

/** Published-only for the public, everything for signed-in editors. */
export const publishedOrLoggedIn: Access = ({ req }) => (req.user ? true : { published: { equals: true } });

/** Icon keys used for service cards, cross-sell tiles and benefit badges (SVGs live in components/icons.tsx). */
export const iconOptions = [
  { label: "Shield (maintenance)", value: "shield" },
  { label: "Roller (recoating)", value: "roller" },
  { label: "Sparkle (cleaning)", value: "sparkle" },
  { label: "Court (line marking)", value: "court" },
  { label: "Magnifier (inspection)", value: "search" },
  { label: "Plus circle", value: "plus" },
  { label: "Star", value: "star" },
  { label: "Trend down", value: "trend" },
  { label: "Clock", value: "clock" },
  { label: "Calendar", value: "calendar" },
  { label: "Map pin", value: "pin" },
  { label: "House", value: "house" },
  { label: "Bucket (cleaning)", value: "bucket" },
];

export const sectorOptions = ["Schools", "Stadiums", "Gyms", "Recreation Centres", "Community Halls"];
