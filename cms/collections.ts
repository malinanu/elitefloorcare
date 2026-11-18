import path from "node:path";
import type { CollectionConfig, Field } from "payload";
import { anyone, iconOptions, loggedIn, publishedOrLoggedIn, revalidateCollection, revalidateCollectionDelete, sectorOptions } from "./shared";

const hooks = { afterChange: [revalidateCollection], afterDelete: [revalidateCollectionDelete] };
const order: Field = { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar", description: "Lower numbers show first" } };
const published: Field = { name: "published", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } };
const img = (name: string, label?: string, required = true): Field => ({ name, label, type: "upload", relationTo: "media", required });

export const Users: CollectionConfig = {
  slug: "users",
  admin: { useAsTitle: "email", group: "Admin" },
  auth: { maxLoginAttempts: 5, lockTime: 15 * 60 * 1000 },
  access: { read: loggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  fields: [{ name: "name", type: "text" }],
};

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content", useAsTitle: "alt" },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  hooks,
  upload: {
    // Lives outside the release folders on the server so uploads survive deploys.
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    adminThumbnail: "thumbnail",
    imageSizes: [{ name: "thumbnail", width: 480, height: 320, position: "centre" }],
    focalPoint: true,
  },
  fields: [{ name: "alt", label: "Alt text (describe the photo)", type: "text", required: true }],
};

/** One before/after pair, used on service pages, the homepage and gallery projects. */
const pairFields: Field[] = [
  { type: "row", fields: [img("before", "Before photo"), img("after", "After photo")] },
  {
    type: "row",
    fields: [
      { name: "beforeLabel", type: "text", defaultValue: "Before" },
      { name: "afterLabel", type: "text", defaultValue: "After" },
    ],
  },
  { name: "caption", type: "text" },
];

export const Services: CollectionConfig = {
  slug: "services",
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "slug", "order"] },
  access: { read: anyone, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: "order",
  hooks,
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar", description: "URL: /services/<slug>" },
      validate: (v: unknown) => (typeof v === "string" && /^[a-z0-9-]+$/.test(v)) || "lowercase letters, numbers and dashes only",
    },
    order,
    { name: "navLabel", label: "Menu label", type: "text", required: true, admin: { position: "sidebar" } },
    { name: "footerLabel", label: "Footer label", type: "text", required: true, admin: { position: "sidebar" } },
    { name: "icon", type: "select", options: iconOptions, required: true, admin: { position: "sidebar" } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero & listing",
          fields: [
            img("heroImage", "Hero photo"),
            { name: "lead", type: "textarea", required: true },
            { name: "crumb", label: "Breadcrumb label", type: "text", required: true },
            { name: "summary", label: "Homepage card text", type: "textarea", required: true },
            { name: "crossSellTagline", label: "Cross-sell tagline (on other service pages)", type: "text", required: true },
          ],
        },
        {
          label: "What it involves",
          fields: [
            {
              name: "involves",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                { name: "title", type: "text", required: true },
                { name: "body", type: "richText", required: true },
                { name: "cardTitle", type: "text", required: true },
                { name: "items", type: "array", fields: [{ name: "text", type: "text", required: true }] },
                { name: "note", type: "richText" },
              ],
            },
          ],
        },
        {
          label: "Depth model",
          description: "Optional interactive recoat-vs-sand model (used on Recoating).",
          fields: [
            {
              name: "depth",
              type: "group",
              fields: [
                { name: "enabled", type: "checkbox", defaultValue: false },
                { name: "figLabel", type: "text" },
                { name: "eyebrow", type: "text" },
                { name: "title", type: "text" },
                { name: "body", type: "textarea" },
                img("fallbackImage", "Photo shown on phones", false),
                { name: "legend", type: "array", maxRows: 3, fields: [{ name: "text", type: "text", required: true }] },
              ],
            },
          ],
        },
        {
          label: "Steps",
          fields: [
            {
              name: "steps",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                { name: "title", type: "text", required: true },
                {
                  name: "items",
                  type: "array",
                  fields: [
                    { name: "title", type: "text", required: true },
                    { name: "text", type: "textarea", required: true },
                    { name: "accent", label: "Highlight (amber)", type: "checkbox" },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Audience & before/after",
          fields: [
            { name: "audienceTitle", type: "text", required: true },
            {
              name: "beforeAfter",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                { name: "title", type: "text", required: true },
                { name: "buttonLabel", type: "text", defaultValue: "Full gallery" },
                { name: "pairs", type: "array", fields: pairFields },
              ],
            },
          ],
        },
        {
          label: "Closing & SEO",
          fields: [
            { name: "crossSellEyebrow", type: "text", defaultValue: "Also from us" },
            { name: "ctaTitle", type: "text", defaultValue: "Ready to protect your floor?" },
            { name: "ctaText", type: "textarea", defaultValue: "Free inspection, written report, costed recommendation. No obligation and no sales pitch." },
            { name: "metaTitle", type: "text" },
            { name: "metaDescription", type: "textarea" },
          ],
        },
      ],
    },
  ],
};

export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Gallery project", plural: "Gallery projects" },
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "sector", "work", "published", "order"] },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: "order",
  hooks,
  fields: [
    { name: "title", type: "text", required: true },
    { type: "row", fields: [{ name: "sector", type: "select", options: sectorOptions, required: true }, { name: "work", label: "Work done", type: "text", required: true }] },
    { type: "row", fields: [img("before", "Before photo"), img("after", "After photo")] },
    order,
    published,
  ],
};

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  admin: { group: "Content", useAsTitle: "person", defaultColumns: ["person", "organisation", "published", "order"] },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: "order",
  hooks,
  fields: [
    { name: "quote", type: "textarea", required: true },
    { name: "person", label: "Name and role", type: "text", required: true },
    { name: "organisation", type: "text", required: true },
    order,
    published,
  ],
};

export const Plans: CollectionConfig = {
  slug: "plans",
  labels: { singular: "Maintenance plan", plural: "Maintenance plans" },
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["name", "price", "featured", "order"] },
  access: { read: publishedOrLoggedIn, create: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: "order",
  hooks,
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "price", type: "text", required: true, admin: { description: "e.g. $13,800" } }] },
    { type: "row", fields: [{ name: "term", type: "text", required: true, admin: { description: "e.g. 3-year" } }, { name: "colour", type: "select", options: ["steel", "blue", "amber"], defaultValue: "blue" }] },
    { name: "description", type: "textarea", required: true },
    { name: "items", label: "What's included", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "featured", label: "Featured (navy card + ribbon)", type: "checkbox", admin: { position: "sidebar" } },
    { name: "ribbon", type: "text", defaultValue: "Best value", admin: { position: "sidebar", condition: (d) => Boolean(d?.featured) } },
    order,
    published,
  ],
};

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    group: "Leads",
    useAsTitle: "business",
    defaultColumns: ["createdAt", "name", "business", "location", "phone", "emailStatus", "smsStatus"],
    description: "Free-inspection requests from the website form.",
  },
  // Created only by the server (local API). Never through the public REST/GraphQL API.
  access: { create: () => false, read: loggedIn, update: loggedIn, delete: loggedIn },
  defaultSort: "-createdAt",
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "business", type: "text", required: true }] },
    { type: "row", fields: [{ name: "phone", type: "text", required: true }, { name: "email", type: "email", required: true }] },
    { type: "row", fields: [{ name: "location", type: "text", required: true }, { name: "facilityType", type: "text", required: true }] },
    { name: "message", type: "textarea" },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: ["new", "contacted", "inspection booked", "quoted", "won", "lost"],
      admin: { position: "sidebar" },
    },
    { name: "notes", label: "Internal notes", type: "textarea", admin: { position: "sidebar" } },
    { name: "emailStatus", type: "text", defaultValue: "pending", admin: { readOnly: true, position: "sidebar" } },
    { name: "emailError", type: "text", admin: { readOnly: true, position: "sidebar", condition: (d) => Boolean(d?.emailError) } },
    { name: "smsStatus", type: "text", defaultValue: "pending", admin: { readOnly: true, position: "sidebar" } },
    { name: "smsError", type: "text", admin: { readOnly: true, position: "sidebar", condition: (d) => Boolean(d?.smsError) } },
    { name: "ipHash", type: "text", index: true, admin: { hidden: true } },
    { name: "userAgent", type: "text", admin: { hidden: true } },
  ],
};
