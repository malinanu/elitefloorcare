# Elite Sports Floor Care — website

Next.js 15 (App Router, TypeScript) rebuild of the approved static redesign. Enquiries are stored in PostgreSQL, emailed to the client over SMTP, and sent to the owner as an SMS alert through ClickSend.

## Stack

| Concern | Choice |
| --- | --- |
| App | Next.js 15, React 19, `output: "standalone"` |
| Styling | Design tokens in `app/globals.css` (Tailwind v4 `@theme`) + plain CSS in `styles/` |
| Images | `next/image` (AVIF/WebP); sources in `public/` are pre-resized to ≤2400px |
| Form | Server Action `app/actions/enquiry.ts`, zod validation |
| DB | PostgreSQL + Drizzle ORM; migrations in `drizzle/` run automatically on server start (`instrumentation.ts`) |
| Email | nodemailer over SMTP (any provider) |
| SMS | ClickSend (AU) behind `SMS_PROVIDER` switch: `clicksend` / `console` / `none` |
| Spam | Honeypot field, Cloudflare Turnstile (optional), per-IP rate limit (salted IP hash, no raw IPs stored) |

## Layout

```
app/                      routes: /, /about, /services/[slug], /gallery, /service-areas, sitemap, robots
app/actions/enquiry.ts    form pipeline
components/               Header, Footer, Reveal (scroll-in motion), EnquiryForm, GalleryGrid, RecoatDepth (three.js), inner-page blocks
content/                  site details, service-page copy (services.json), gallery projects
lib/                      env (zod-validated), db, notify (email + SMS), guard (IP hash, rate limit, Turnstile)
styles/                   home / inner / about / form CSS ported from the static design
drizzle/                  SQL migrations
```

Content edits: phone/email/address in `content/site.ts`; service pages in `content/services.json`; gallery in `content/gallery.ts`.

## Enquiry pipeline

1. Honeypot filled → pretend success, store nothing.
2. zod validation → field-level errors, values kept.
3. Turnstile check (skipped if `TURNSTILE_SECRET_KEY` unset) and rate limit (`RATE_LIMIT_PER_HOUR`, default 5).
4. **Insert into `enquiries` first** so a lead is never lost.
5. Email + SMS in parallel; each result is written back to the row (`email_status`, `sms_status`, `*_error`).
6. Visitor sees success once the row is saved, even if email/SMS failed (failures are logged).

Find leads whose notifications failed:

```sql
select created_at, name, business, phone, email, email_status, email_error, sms_status, sms_error
from enquiries where email_status <> 'sent' or sms_status not in ('sent','skipped') order by created_at desc;
```

## Local development

```bash
pnpm install
cp .env.example .env.local     # point DATABASE_URL at a local Postgres; SMS_PROVIDER=console
docker compose --profile dev up -d db mailpit   # optional: Postgres + Mailpit (http://localhost:8025)
pnpm dev
```

`pnpm build` type-checks and lints. `npx drizzle-kit generate --name <change>` after editing `lib/db/schema.ts`.

## Deploy (Oracle Cloud · Portainer · CloudPanel)

1. Create `.env` from `.env.example` on the server (or as stack env vars in Portainer). Generate secrets:
   `openssl rand -hex 32` for `IP_HASH_SALT`, a strong `POSTGRES_PASSWORD`.
2. `docker compose --env-file .env up -d --build` (or deploy `docker-compose.yml` as a Portainer stack).
   The app listens on `127.0.0.1:3000` only.
3. In CloudPanel, add a **Reverse Proxy** site for the domain → `http://127.0.0.1:3000`, issue the Let's Encrypt cert.
   If the domain is proxied through Cloudflare, the app reads `CF-Connecting-IP` for rate limiting.
4. `NEXT_PUBLIC_*` values are baked in at build time — rebuild the image after changing them.
5. Old `.html` URLs 308-redirect to the new routes (`next.config.ts`), so existing links and rankings carry over.

Backups: `docker compose exec db pg_dump -U efc efc | gzip > efc-$(date +%F).sql.gz` (schedule it, ship to R2).

## Before launch — needs the client

- Gallery projects, testimonials and stats (40+ schools, 18 councils, 1,400+ courts, 1998, 11 staff) look like placeholder copy. Publishing invented testimonials or claims is a misleading-conduct risk under the Australian Consumer Law — confirm or replace.
- SMTP account, ClickSend account + owner's mobile, Turnstile keys, final domain.
