export const site = {
  name: "Elite Sports Floor Care",
  legalName: "Elite Sports Floor Care Pty Ltd",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitesportsfloorcare.com.au",
  phone: "1300 353 667",
  phoneHref: "tel:1300353667",
  email: "hello@elitesportsfloorcare.com.au",
  address: {
    street: "Unit 7, 42 Kirkham Road",
    locality: "Dandenong South",
    region: "VIC",
    postcode: "3175",
    country: "AU",
  },
  abn: "41 682 903 517",
  tagline: "Specialist timber sports floor tradespeople, looking after Victoria's sports floors since 1998.",
} as const;

export const services = [
  { slug: "preventative-maintenance", nav: "Preventative Maintenance", footer: "Preventative maintenance" },
  { slug: "recoating", nav: "Recoating", footer: "Sports floor recoating" },
  { slug: "deep-cleaning", nav: "Deep Cleaning", footer: "Deep cleaning" },
  { slug: "court-line-marking", nav: "Line Marking", footer: "Court line marking" },
  { slug: "floor-inspections", nav: "Inspections", footer: "Floor inspections" },
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];

export const sectors = ["Schools", "Stadiums", "Gyms", "Recreation Centres", "Community Halls"] as const;

/** Cross-sell tile per service (icon path data + tagline), shown on the other service pages. */
export const crossSell: Record<ServiceSlug, { title: string; tagline: string; icon: string }> = {
  "preventative-maintenance": {
    title: "Preventative Maintenance",
    tagline: "Stay ahead of the wear",
    icon: '<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>',
  },
  recoating: {
    title: "Sports Floor Recoating",
    tagline: "Playing on it next morning",
    icon: '<path d="M4 18h16M4 14h16M7 10l3-6 3 6"/><path d="M14 10h6V4h-6z"/>',
  },
  "deep-cleaning": {
    title: "Deep Cleaning",
    tagline: "Lift what mopping leaves",
    icon: '<path d="M7 3v8h10V3M9 11v10M15 11v10M5 21h14"/>',
  },
  "court-line-marking": {
    title: "Court Line Marking",
    tagline: "Set out to code",
    icon: '<rect height="14" width="18" x="3" y="5"/><path d="M3 12h18M12 5v14"/>',
  },
  "floor-inspections": {
    title: "Floor Inspections",
    tagline: "Free written report",
    icon: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
  },
};
