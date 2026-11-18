# Elite Sports Floor Care — website

Next.js 15 (App Router, TypeScript) rebuild of the approved static redesign. Enquiries are stored in MySQL (CloudPanel-managed), emailed to the client over SMTP, and sent to the owner as an SMS alert through ClickSend.

## Stack

| Concern | Choice |
| --- | --- |
| App | Next.js 15, React 19, `output: "standalone"`, run by PM2 on a CloudPanel Node.js site |
| CI/CD | GitHub Actions: build on ARM64, deploy over SSH with atomic releases + rollback |
| Styling | Design tokens in `app/globals.css` (Tailwind v4 `@theme`) + plain CSS in `styles/` |
| Images | `next/image` (AVIF/WebP); sources in `public/` are pre-resized to ≤2400px |
| Form | Server Action `app/actions/enquiry.ts`, zod validation |
| DB | MySQL 8 / MariaDB + Drizzle ORM (`mysql2`); migrations in `drizzle/` run automatically on server start (`instrumentation.ts`) |
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
cp .env.example .env.local     # point DATABASE_URL at a local MySQL/MariaDB; SMS_PROVIDER=console
docker compose --profile dev up -d db mailpit   # optional: MySQL + Mailpit (http://localhost:8025)
pnpm dev
```

`pnpm build` type-checks and lints. `npx drizzle-kit generate --name <change>` after editing `lib/db/schema.ts`.

## Deploy: CloudPanel + GitHub Actions

Every push to `main` builds on GitHub (ARM64, to match the Oracle Ampere server) inside the `staging` environment and deploys over SSH.
Pull requests only build, as a check, with no access to secrets or the server. Workflow: `.github/workflows/deploy.yml`.

```
~/apps/elite/                  (APP_DIR, in the site user's home)
├── releases/<git-sha>/        last 5 builds
├── current -> releases/<sha>  what PM2 runs
├── shared/.env                secrets — only on the server
└── logs/                      PM2 out/error logs
```

`scripts/deploy.sh` unpacks the release, swaps `current` atomically, and reloads PM2. It then health-checks
`127.0.0.1:$APP_PORT`. If that fails it **rolls back to the previous release** and fails the job.

### One-time server setup

1. **CloudPanel → Add Site → Create a Node.js Site.**
   - Enter the domain and pick **Node.js 22**.
   - Set **App Port** to `3000`, or any free port you put in the `APP_PORT` variable.
   - Note the **site user** it creates.
   - CloudPanel's nginx vhost already proxies the domain to that port.
2. **CloudPanel → Databases → Add Database.**
   - Create database `efc` and a user.
   - That gives you `DATABASE_URL=mysql://user:pass@127.0.0.1:3306/efc`.
3. **SSL/TLS → New Let's Encrypt Certificate.**
4. SSH in **as the site user** (`ssh <site-user>@<server>`):
   ```bash
   npm i -g pm2                                   # Node comes from CloudPanel (nvm)
   mkdir -p ~/apps/elite/shared ~/.ssh
   nano ~/apps/elite/shared/.env                  # fill from .env.example; chmod 600 it
   chmod 600 ~/apps/elite/shared/.env
   echo '<deploy public key>' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
   (crontab -l 2>/dev/null; echo '@reboot bash -lc "pm2 resurrect"') | crontab -   # survive reboots
   ```
5. Create a deploy key on your machine. Add its public half to the site user's `authorized_keys`, as in step 4:
   ```bash
   ssh-keygen -t ed25519 -N '' -C elite-deploy -f elite_deploy
   ```
6. **GitHub → Settings → Environments → `staging`.** The deploy job runs in this environment, and its secrets are only visible there:

   | Kind | Name | Value |
   | --- | --- | --- |
   | Secret | `SSH_HOST` | server IP or hostname |
   | Secret | `SSH_PORT` | usually `22` |
   | Secret | `SSH_USER` | the CloudPanel **site user**, not root, so PM2 runs as the site |
   | Secret | `SSH_PRIVATE_KEY` | contents of `elite_deploy` (the private key) |
   | Secret | `SSH_KNOWN_HOSTS` | output of `ssh-keyscan -p <SSH_PORT> <SSH_HOST>`; pins the server's host key |
   | Variable or secret | `NEXT_PUBLIC_SITE_URL` | `https://<domain>` |
   | Variable or secret | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (optional) |
   | Variable | `APP_PORT` | CloudPanel App Port (optional, default `3000`) |
   | Variable | `APP_DIR` | optional; defaults to `~/apps/elite` |

   `NEXT_PUBLIC_*` values end up in the public JavaScript, so a variable is the better home for them. A secret also works.
   Optional: under **Deployment protection rules → Required reviewers**, require approval for each deploy.
   To add production later, create a `production` environment with its own values and copy the `deploy` job with `environment: production`.
7. Push to `main`, or use **Actions → Build & deploy → Run workflow**.

### Day to day

- **Logs:** `pm2 logs elite-web`, or `~/apps/elite/logs/`.
- **Manual rollback:**
  ```bash
  ln -sfn ~/apps/elite/releases/<older-sha> ~/apps/elite/current && pm2 reload elite-web
  ```
- **Changing `shared/.env`:** run `pm2 reload elite-web --update-env`.
- **Changing `NEXT_PUBLIC_*`:** update the GitHub variable and re-run the workflow, because those values are baked in at build time.
- **Leads:** browse `enquiries` in CloudPanel's phpMyAdmin. Database backups use CloudPanel → Backups.

### Optional: Docker instead

`Dockerfile` and `docker-compose.yml` (web + MySQL 8.4) remain for running it in containers behind a CloudPanel reverse-proxy site.

## Before launch — needs the client

- Gallery projects, testimonials and stats (40+ schools, 18 councils, 1,400+ courts, 1998, 11 staff) look like placeholder copy. Publishing invented testimonials or claims is a misleading-conduct risk under the Australian Consumer Law — confirm or replace.
- SMTP account, ClickSend account + owner's mobile, Turnstile keys, final domain.
