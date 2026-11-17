import type { ServiceSlug } from "./site";
import data from "./services.json";

/**
 * Copy for the five service pages, extracted from the approved static redesign.
 * Strings marked `html` contain trusted inline markup (<strong>, internal <a>) and are rendered as HTML.
 */
export type ServiceContent = {
  slug: ServiceSlug;
  metaTitle: string;
  metaDescription: string;
  hero: { image: string; alt: string; title: string; /** html */ lead: string; crumb: string };
  involves: {
    eyebrow: string;
    title: string;
    /** html */ paragraphs: string[];
    card: { title: string; items: string[]; /** html */ note: string | null };
  };
  depth?: {
    figLabel: string;
    iframeTitle: string;
    staticImage: string;
    staticAlt: string;
    eyebrow: string;
    title: string;
    /** html */ body: string;
    legend: string[];
  };
  steps: { eyebrow: string; title: string; items: { n: string; title: string; /** html */ text: string; accent: boolean }[] };
  audience: { title: string; chips: string[] };
  beforeAfter: {
    eyebrow: string;
    title: string;
    button: string;
    pairs: { before: { src: string; alt: string }; after: { src: string; alt: string }; caption: string | null; labels: string[] }[];
  };
  crossSell: { eyebrow: string };
  cta: { title: string; text: string };
};

export const serviceContent = data as Record<ServiceSlug, ServiceContent>;
