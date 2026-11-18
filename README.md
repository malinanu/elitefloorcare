# Elite Sports Floor Care — website + CMS

A Next.js 15 site with **Payload CMS 3** built in. Payload stores content in SQLite and uploads on disk.
The client edits every page, photo, service, gallery project, testimonial, plan and contact detail in `/admin`.
Inspection requests from the form are saved in the CMS (Admin → **Leads → Enquiries**), emailed to the client and sent to the owner as an SMS through ClickSend.

| Concern | Choice |
| --- | --- |
| App | Next.js 15.4 (App Router, `output: "standalone"`), React 19, Node 24 |
| CMS | Payload 3 at `/admin` (UI) and `/api` (REST). GraphQL is off |
| Data | SQLite through `@payloadcms/db-sqlite` (libsql). Migrations in `migrations/` run on boot |
| Uploads | Disk (`MEDIA_DIR`), served at `/api/media/file/*`, optimised by `next/image` |
| Cache | Pages read through `lib/cms.ts` (`unstable_cache`, tag `cms`). Every CMS save or delete revalidates, so edits show immediately |
| Form | Server Action → zod, honeypot, Turnstile (optional), rate limit → save enquiry → email + SMS → record status |
| Hosting | CloudPanel **Node.js site** on the Oracle Ampere (ARM64) server, run by PM2 as CloudPanel's guide does |
| CI/CD | GitHub Actions builds on ARM64 and deploys over SSH, with atomic releases, health checks and rollback |

## Layout

```
app/(site)/            public pages: /, /about, /services/[slug], /gallery, /service-areas (+ 404)
app/(payload)/         Payload admin + REST API (generated from the official template)
app/actions/enquiry.ts form pipeline
cms/                   collections, globals, access rules, seed (launch content)
lib/cms.ts             cached CMS reads used by the pages
lib/notify.ts          email (nodemailer) + SMS (ClickSend)
migrations/            SQLite schema migrations (payload migrate:create)
scripts/deploy.sh      server-side release activation (atomic swap, PM2, health check, rollback)
scripts/backup.sh      nightly SQLite snapshot + uploads tarball
```

## What the client can edit (Admin)

- **Content**
  - Services: the hero, the "what it involves" copy and checklist, the optional depth model, the steps, the before/after photos, the homepage card text and the SEO fields.
  - Gallery projects, testimonials, maintenance plans and the media library.
- **Pages:** Homepage, About, Gallery page and Where we work. All copy, stats, photos and lists.
- **Settings:** phone, email, address, ABN, footer text and the facility-type chips.
- **Leads:** enquiries, with a status (new → contacted → … → won or lost), internal notes, and whether the email and SMS were delivered.

Only signed-in admins can change anything. The public API can read published content only. It can't create or read enquiries, and it can't see users.

## Local development

```bash
pnpm install
cp .env.example .env.local      # set PAYLOAD_SECRET, ADMIN_EMAIL/PASSWORD, SMS_PROVIDER=console
pnpm dev                        # first boot creates the admin and loads the launch content
open http://localhost:3000/admin
```

- **Schema change:**
  1. Edit `cms/*.ts`.
  2. Run `pnpm payload migrate:create <name>`.
  3. Run `pnpm generate:types`.
  4. Commit the new file in `migrations/`. Production applies it on the next boot.
- **Reload launch content into a dev database:** run `pnpm seed`. This overwrites the page globals, so don't run it against live data.

## Deploy: CloudPanel + GitHub Actions

On every push to `main`, the `deploy` job runs inside the GitHub **`staging`** environment:
1. Builds on `ubuntu-24.04-arm` (Node 24).
2. Checks that the linux-arm64 sharp and libsql binaries are in the bundle.
3. Uploads the release and runs `scripts/deploy.sh` as the site user.

Pull requests only build, with no secrets and no server access.

```
/home/<site-user>/htdocs/<domain>/      (APP_DIR)
├── releases/<git-sha>/                 last 5 builds
├── current -> releases/<sha>           what PM2 runs
├── shared/.env                         secrets (never in git)
├── shared/data/payload.db              SQLite — survives every deploy
├── shared/media/                       CMS uploads — survive every deploy
└── logs/                               PM2 logs
```

### One-time server setup

1. **In CloudPanel, create the site:** Add Site → Create a Node.js Site. Choose **Node.js 24 LTS** and App Port `3000`. Then issue a Let's Encrypt certificate under **SSL/TLS**.
2. **SSH in as the site user:**
   ```bash
   npm i -g pm2
   mkdir -p ~/htdocs/<domain>/shared ~/.ssh
   cp /dev/null ~/htdocs/<domain>/shared/.env && chmod 600 ~/htdocs/<domain>/shared/.env
   nano ~/htdocs/<domain>/shared/.env           # fill from .env.example (PAYLOAD_SECRET, ADMIN_*, SMTP, ClickSend, IP_HASH_SALT)
   echo '<deploy public key>' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
   ```
3. **Add the cron jobs** under CloudPanel → Sites → *site* → Cron Jobs:
   - `@reboot pm2 resurrect` brings the site back after a server reboot.
   - Run this nightly at 02:30, as `30 2 * * *`:
     ```bash
     APP_DIR=/home/<site-user>/htdocs/<domain> bash /home/<site-user>/htdocs/<domain>/current/scripts/backup.sh
     ```
4. **Add these to GitHub → Settings → Environments → `staging`:**

   | Kind | Name | Value |
   | --- | --- | --- |
   | Secret | `SSH_HOST`, `SSH_PORT`, `SSH_USER` | server, port, the **site user** (not root) |
   | Secret | `SSH_PRIVATE_KEY` | the deploy key (private half) |
   | Secret | `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -p <SSH_PORT> <SSH_HOST>` |
   | Variable or secret | `APP_DIR` | `/home/<site-user>/htdocs/<domain>` |
   | Variable or secret | `NEXT_PUBLIC_SITE_URL` | `https://<domain>` |
   | Variable or secret | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional |
   | Variable | `APP_PORT` | optional, default `3000` |

5. **Merge to `main`.** The first boot applies the migration, creates the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD` and loads the launch content. Then log in at `https://<domain>/admin` and change the password.

### Day to day

- **Logs:** `pm2 logs elite-web`, or `~/htdocs/<domain>/logs/`.
- **Changed `shared/.env`:** `pm2 reload elite-web --update-env`.
- **Manual rollback:**
  ```bash
  ln -sfn ../releases/<older-sha> ~/htdocs/<domain>/current && pm2 reload elite-web
  ```
- **Restore a backup:**
  ```bash
  pm2 stop elite-web
  gunzip -c ~/backups/elite/payload-<stamp>.db.gz > ~/htdocs/<domain>/shared/data/payload.db
  tar -xzf ~/backups/elite/media-<stamp>.tgz -C ~/htdocs/<domain>/shared
  pm2 start elite-web
  ```

### Optional: Docker

`Dockerfile` and `docker-compose.yml` run the same app, with volumes for `/data` (SQLite) and `/media` (uploads).

## Before launch — needs the client

- **Placeholder content:** the gallery projects, testimonials and stats (40+ schools, 18 councils, 1,400+ courts, 1998, 11 staff) look like placeholder copy. Publishing invented testimonials or claims is a misleading-conduct risk under the Australian Consumer Law. All of it is now editable in `/admin`, so the client can confirm or replace it there.
- **Accounts and settings:** an SMTP account, a ClickSend account and the owner's mobile, Turnstile keys, and the final domain.
