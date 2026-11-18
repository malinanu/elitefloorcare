import type { Field, GlobalConfig } from "payload";
import { anyone, iconOptions, loggedIn, revalidateGlobal } from "./shared";

const access = { read: anyone, update: loggedIn };
const hooks = { afterChange: [revalidateGlobal] };
const img = (name: string, label?: string): Field => ({ name, label, type: "upload", relationTo: "media", required: true });
const text = (name: string, label?: string, required = true): Field => ({ name, label, type: "text", required });
const area = (name: string, label?: string, required = true): Field => ({ name, label, type: "textarea", required });
const list = (name: string, label?: string): Field => ({ name, label, type: "array", fields: [text("text")] });
const stats = (name = "stats"): Field => ({ name, type: "array", maxRows: 4, fields: [{ type: "row", fields: [text("value"), text("label")] }] });
const cta = (): Field => ({ name: "cta", label: "Closing call to action", type: "group", fields: [text("title"), area("text")] });

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: { group: "Settings" },
  access,
  hooks,
  fields: [
    { type: "row", fields: [text("name", "Business name"), text("legalName", "Legal name")] },
    { type: "row", fields: [text("phone"), { name: "email", type: "email", required: true }] },
    { type: "row", fields: [text("street"), text("locality", "Suburb")] },
    { type: "row", fields: [text("region", "State"), text("postcode"), text("abn", "ABN")] },
    area("tagline", "Footer tagline"),
    text("footerNote", "Footer bottom line"),
    { name: "sectors", label: "Facility types (chips)", type: "array", fields: [text("label")] },
  ],
};

export const HomePage: GlobalConfig = {
  slug: "home",
  label: "Homepage",
  admin: { group: "Pages" },
  access,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [
            text("heroEyebrow", "Eyebrow"),
            { type: "row", fields: [text("heroTitle", "Title"), text("heroHighlight", "Title (amber part)")] },
            area("heroLead", "Intro"),
            img("heroImage", "Background photo"),
            {
              name: "floats",
              label: "Info cards",
              type: "array",
              maxRows: 2,
              fields: [{ type: "row", fields: [text("title"), text("text"), { name: "icon", type: "select", options: iconOptions, required: true }] }],
            },
            stats(),
          ],
        },
        {
          label: "Why choose us",
          fields: [
            text("whyEyebrow", "Eyebrow"),
            text("whyTitle", "Title"),
            area("whyLead", "Intro"),
            img("whyImage", "Photo"),
            area("whyNote", "Note on the photo (start with 'The maths:')"),
            {
              name: "benefits",
              type: "array",
              fields: [{ type: "row", fields: [text("title"), { name: "icon", type: "select", options: iconOptions, required: true }] }, area("text")],
            },
          ],
        },
        {
          label: "Services & plans",
          fields: [
            text("servicesEyebrow", "Services eyebrow"),
            text("servicesTitle", "Services title"),
            area("servicesIntro", "Services intro"),
            text("plansEyebrow", "Plans eyebrow"),
            text("plansTitle", "Plans title"),
            area("plansLead", "Plans intro"),
            area("plansFine", "Plans small print"),
          ],
        },
        {
          label: "Before & after",
          fields: [
            text("galleryEyebrow", "Eyebrow"),
            text("galleryTitle", "Title"),
            text("galleryButton", "Button label"),
            {
              name: "pairs",
              type: "array",
              fields: [{ type: "row", fields: [img("before"), img("after")] }, text("caption")],
            },
            text("testimonialsEyebrow", "Testimonials eyebrow"),
          ],
        },
        {
          label: "Contact",
          fields: [text("contactEyebrow", "Eyebrow"), text("contactTitle", "Title"), area("contactLead", "Intro"), list("contactTicks", "Tick list")],
        },
        {
          label: "SEO",
          fields: [text("metaTitle", "Page title", false), area("metaDescription", "Meta description", false)],
        },
      ],
    },
  ],
};

export const AboutPage: GlobalConfig = {
  slug: "about",
  label: "About page",
  admin: { group: "Pages" },
  access,
  hooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero",
          fields: [
            { type: "row", fields: [text("heroTitle", "Title"), text("heroHighlight", "Title (amber part)")] },
            area("heroLead", "Intro"),
            img("heroImage", "Background photo"),
            stats(),
          ],
        },
        {
          label: "Story",
          fields: [
            img("storyImage", "Photo"),
            { type: "row", fields: [text("badgeTitle", "Badge title"), text("badgeText", "Badge text")] },
            text("storyEyebrow", "Eyebrow"),
            text("storyTitle", "Title"),
            area("storyLead", "Lead paragraph"),
            text("sawLabel", "'What we kept seeing' label"),
            list("saw", "Problems we kept seeing"),
            area("storyText", "Closing paragraph"),
            text("quoteTitle", "Quote title"),
            area("quoteText", "Quote text"),
          ],
        },
        {
          label: "Why we're different",
          fields: [
            text("whyEyebrow", "Eyebrow"),
            text("whyTitle", "Title"),
            {
              name: "cards",
              type: "array",
              fields: [{ type: "row", fields: [text("title"), { name: "icon", type: "select", options: iconOptions, required: true }] }, area("text")],
            },
          ],
        },
        {
          label: "Accreditations",
          fields: [
            text("accrEyebrow", "Eyebrow"),
            text("accrTitle", "Title"),
            area("accrText", "Intro"),
            { name: "accreditations", type: "array", fields: [{ type: "row", fields: [text("kind"), text("title")] }, text("text")] },
          ],
        },
        {
          label: "Crew & closing",
          fields: [
            text("crewEyebrow", "Eyebrow"),
            text("crewTitle", "Title"),
            { name: "crew", type: "array", fields: [{ type: "row", fields: [img("image"), text("caption")] }] },
            cta(),
            text("metaDescription", "Meta description", false),
          ],
        },
      ],
    },
  ],
};

export const GalleryPage: GlobalConfig = {
  slug: "gallery-page",
  label: "Gallery page",
  admin: { group: "Pages" },
  access,
  hooks,
  fields: [text("title"), area("lead"), cta(), text("metaDescription", "Meta description", false)],
};

export const ServiceAreasPage: GlobalConfig = {
  slug: "service-areas-page",
  label: "Where we work page",
  admin: { group: "Pages" },
  access,
  hooks,
  fields: [
    text("title"),
    area("lead"),
    text("coverageEyebrow"),
    text("coverageTitle"),
    area("coverageText"),
    list("coverageTicks", "Coverage ticks"),
    text("timesEyebrow"),
    text("timesTitle"),
    { name: "times", label: "Response times", type: "array", fields: [{ type: "row", fields: [text("kind"), text("value")] }, area("text")] },
    cta(),
    text("metaDescription", "Meta description", false),
  ],
};
