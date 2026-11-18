#!/usr/bin/env bash
# Shared by the release (ARM build) and deploy (SSH) jobs: validates the staging settings and
# writes SITE_URL / APP_DIR to $GITHUB_ENV. Job outputs can't carry secret-derived values, so each
# job runs this itself.
# Env in: SITE_URL APP_DIR_SET APP_PORT SSH_USER SSH_PRIVATE_KEY SSH_HOST ADMIN_EMAIL
set -uo pipefail
ok=1
for v in SITE_URL SSH_PRIVATE_KEY SSH_HOST SSH_USER; do
  [ -n "${!v}" ] || { echo "::error::'${v/SITE_URL/NEXT_PUBLIC_SITE_URL}' is not set in the staging environment"; ok=0; }
done
[ "$ok" = 1 ] || exit 1
# Accept the CloudPanel site folder (/home/<user>/htdocs/<domain>) in place of the URL:
# it gives both the folder and the domain.
trimmed=$(printf '%s' "$SITE_URL" | tr -d '"\r' | xargs)
if [[ "$trimmed" =~ ^/home/[^/]+/htdocs/([A-Za-z0-9.-]+\.[A-Za-z]{2,})/?$ ]]; then
  [ -n "$APP_DIR_SET" ] || APP_DIR_SET=${trimmed%/}
  SITE_URL="https://${BASH_REMATCH[1]}"
  echo "::notice::NEXT_PUBLIC_SITE_URL holds the site folder; using it as APP_DIR and $SITE_URL as the site address."
fi
# Normalise the site URL: trim spaces/quotes, add https:// if missing, keep only the origin.
if ! url=$(node -e '
    let v = process.argv[1].trim().replace(/^["\x27]+|["\x27]+$/g, "").trim();
    if (!/^https?:\/\//i.test(v)) v = "https://" + v.replace(/^\/+/, "");
    const u = new URL(v);
    if (!u.hostname.includes(".")) throw new Error("no domain");
    process.stdout.write(u.origin);
  ' "$SITE_URL" 2>/dev/null); then
  starts=$(printf '%s' "$SITE_URL" | head -c 8 | sed -E 's/[^a-z:/]/?/g')
  echo "::error::NEXT_PUBLIC_SITE_URL in the staging environment is not a valid site address (it has ${#SITE_URL} characters and starts with '${starts}'). Set it to the full address, e.g. https://elitefloorcare.3logiq.com"
  exit 1
fi
echo "SITE_URL=$url" >> "$GITHUB_ENV"
echo "Site: $url"
# CloudPanel puts every site at /home/<site-user>/htdocs/<domain>; derive it unless APP_DIR is set.
domain=$(node -e 'process.stdout.write(new URL(process.argv[1]).hostname)' "$url")
app_dir=${APP_DIR_SET:-/home/$SSH_USER/htdocs/$domain}
echo "APP_DIR=$app_dir" >> "$GITHUB_ENV"
echo "Deploying to $SSH_USER@<host>:$app_dir (app port: ${APP_PORT:-from CloudPanel})"
[ -n "$ADMIN_EMAIL" ] || echo "::notice::ADMIN_EMAIL is not set — the first deploy creates admin@$domain with a generated password (saved on the server in shared/INITIAL_ADMIN_PASSWORD.txt)."
