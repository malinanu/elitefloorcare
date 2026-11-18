import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Enquiries, Media, Plans, Projects, Services, Testimonials, Users } from "./cms/collections";
import { AboutPage, GalleryPage, HomePage, ServiceAreasPage, SiteSettings } from "./cms/globals";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const smtp = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress: (process.env.MAIL_FROM?.match(/<(.+)>/)?.[1] ?? process.env.MAIL_FROM ?? "no-reply@localhost").trim(),
      defaultFromName: process.env.MAIL_FROM?.replace(/\s*<.+>/, "").replace(/"/g, "").trim() || "Elite Sports Floor Care",
      transportOptions: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      },
    })
  : undefined;

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
  secret: process.env.PAYLOAD_SECRET || "",
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " — Elite Sports Floor Care" },
    avatar: "default", // no Gravatar lookups from the admin
  },
  collections: [Services, Projects, Testimonials, Plans, Media, Enquiries, Users],
  globals: [SiteSettings, HomePage, AboutPage, GalleryPage, ServiceAreasPage],
  editor: lexicalEditor(),
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || "file:./data/payload.db" },
    // Production applies these on boot (no Payload CLI needed on the server). Dev uses schema push.
    prodMigrations: migrations,
  }),
  email: smtp,
  sharp,
  upload: { limits: { fileSize: 15 * 1024 * 1024 } },
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  telemetry: false,
  async onInit(payload) {
    // 1. First admin from env, so nobody can claim /admin/create-first-user on a fresh install.
    const { totalDocs: users } = await payload.count({ collection: "users" });
    if (users === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await payload.create({ collection: "users", data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: "Admin" } });
      payload.logger.info(`[init] created admin ${process.env.ADMIN_EMAIL}`);
    }
    // 2. Empty database → load the site's launch content (idempotent; never runs again once services exist).
    if (process.env.SEED_ON_EMPTY !== "false") {
      const { totalDocs: services } = await payload.count({ collection: "services" });
      if (services === 0) {
        const { seed } = await import("./cms/seed");
        await seed(payload);
      }
    }
  },
});
