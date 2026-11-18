#!/usr/bin/env bash
# Atomic release + PM2 reload + health check + automatic rollback.
# Runs ON THE SERVER as the CloudPanel site user (called by .github/workflows/deploy.yml).
#
#   deploy.sh <path-to-release.tgz> <release-id>
#
# Env: APP_DIR (required: the CloudPanel site folder, e.g. /home/<site-user>/htdocs/<domain>),
#      APP_PORT (default 3000), KEEP_RELEASES (default 5), PM2_NAME (default elite-web),
#      APP_ENV_FILE (optional: KEY=VALUE lines from GitHub, merged into shared/.env then deleted)
# First run on a fresh CloudPanel Node.js site needs nothing else: it installs pm2, creates
# shared/.env, generates PAYLOAD_SECRET / IP_HASH_SALT, and the app seeds the CMS on boot.
#
# Layout under APP_DIR — the SQLite database and uploads live in shared/, so they survive every deploy:
#   releases/<sha>/  current -> releases/<sha>  shared/.env  shared/data/payload.db  shared/media/  logs/
set -Eeuo pipefail

TARBALL=${1:?usage: deploy.sh <release.tgz> <release-id>}
RELEASE_ID=${2:?usage: deploy.sh <release.tgz> <release-id>}
[ -n "${APP_DIR:-}" ] || { echo "[deploy] ERROR: APP_DIR is not set (e.g. /home/<site-user>/htdocs/<domain>)" >&2; exit 1; }
export APP_DIR
export APP_PORT=${APP_PORT:-3000}
export PM2_NAME=${PM2_NAME:-elite-web}
KEEP_RELEASES=${KEEP_RELEASES:-5}

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

# CloudPanel installs Node per site user through nvm; non-interactive SSH doesn't load it.
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null
  nvm use --silent 24 >/dev/null 2>&1 || nvm use --silent default >/dev/null 2>&1 || true
fi
command -v node >/dev/null || die "node not found for $(whoami) — create the site as a CloudPanel Node.js site"
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 22 ] || die "Node $NODE_MAJOR is too old; pick Node 24 LTS in CloudPanel"

# ── first-run bootstrap: everything the server needs, so a deploy from GitHub is all it takes ──
if ! command -v pm2 >/dev/null 2>&1; then
  log "installing pm2 for $(whoami)"
  npm install -g pm2@6 >/dev/null 2>&1 || die "could not install pm2 (npm i -g pm2)"
fi
mkdir -p "$APP_DIR/releases" "$APP_DIR/logs" "$APP_DIR/shared/data" "$APP_DIR/shared/media"
chmod 700 "$APP_DIR/shared"
ENV_FILE="$APP_DIR/shared/.env"
[ -f "$ENV_FILE" ] || { : > "$ENV_FILE"; log "created shared/.env"; }
chmod 600 "$ENV_FILE"

set_env() { # set_env KEY VALUE — replace or append one line, value written verbatim
  local k=$1 v=$2 tmp
  tmp=$(mktemp "$APP_DIR/shared/.env.XXXXXX")
  grep -v "^${k}=" "$ENV_FILE" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  chmod 600 "$tmp" && mv -f "$tmp" "$ENV_FILE"
}
has_env() { grep -q "^$1=..*" "$ENV_FILE"; }
rand() { node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("hex"))'; }

# Settings pushed from the GitHub environment (SMTP, ClickSend, admin…). Only keys that were sent are changed.
if [ -n "${APP_ENV_FILE:-}" ] && [ -f "$APP_ENV_FILE" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^([A-Z][A-Z0-9_]*)=(.*)$ ]] || continue
    set_env "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
  done < "$APP_ENV_FILE"
  rm -f "$APP_ENV_FILE"
  log "applied settings from GitHub"
fi

# Generated once on the server and never rotated (rotating PAYLOAD_SECRET logs every editor out).
has_env PAYLOAD_SECRET || { set_env PAYLOAD_SECRET "$(rand)"; log "generated PAYLOAD_SECRET"; }
has_env IP_HASH_SALT || { set_env IP_HASH_SALT "$(rand)"; log "generated IP_HASH_SALT"; }
# Database and uploads live in shared/, outside the releases.
has_env DATABASE_URI || set_env DATABASE_URI "file:$APP_DIR/shared/data/payload.db"
has_env MEDIA_DIR || set_env MEDIA_DIR "$APP_DIR/shared/media"
has_env SMS_PROVIDER || set_env SMS_PROVIDER none
# First admin: without one, anyone could claim /admin on a fresh install. If GitHub didn't send
# ADMIN_PASSWORD, make one and leave it in a file only the site user can read.
if [ ! -s "$APP_DIR/shared/data/payload.db" ]; then
  has_env ADMIN_EMAIL || die "ADMIN_EMAIL is not set: add it as a secret in the GitHub 'staging' environment"
  if ! has_env ADMIN_PASSWORD; then
    pw=$(rand | cut -c1-24)
    set_env ADMIN_PASSWORD "$pw"
    printf 'Initial admin password for %s:\n%s\nChange it in /admin, then delete this file.\n' "$(grep '^ADMIN_EMAIL=' "$ENV_FILE" | cut -d= -f2-)" "$pw" > "$APP_DIR/shared/INITIAL_ADMIN_PASSWORD.txt"
    chmod 600 "$APP_DIR/shared/INITIAL_ADMIN_PASSWORD.txt"
    log "generated an admin password → $APP_DIR/shared/INITIAL_ADMIN_PASSWORD.txt"
  fi
fi

# Something else on the App Port (an old app, CloudPanel's sample) would make our start fail.
if command -v ss >/dev/null 2>&1 && ss -ltn "sport = :$APP_PORT" | grep -q LISTEN; then
  if ! pm2 jlist 2>/dev/null | node -e '
      let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const a=JSON.parse(d||"[]");
      process.exit(a.some(p=>p.name===process.argv[1]&&p.pm2_env.status==="online")?0:1)})' "$PM2_NAME"; then
    pm2 ls || true
    die "port $APP_PORT is already in use by another process (see pm2 ls above). Stop it with 'pm2 delete <name> && pm2 save', or set APP_PORT to CloudPanel's App Port."
  fi
fi

NEW="$APP_DIR/releases/$RELEASE_ID"
PREV=$(readlink -f "$APP_DIR/current" 2>/dev/null || true)

log "unpacking $RELEASE_ID"
rm -rf "$NEW.tmp" && mkdir -p "$NEW.tmp"
tar -xzf "$TARBALL" -C "$NEW.tmp"
[ -f "$NEW.tmp/server.js" ] || die "release has no server.js"
rm -rf "$NEW" && mv "$NEW.tmp" "$NEW"
touch "$NEW" # tar restores the archive's old mtime; pruning sorts by deploy time

switch_to() { # atomic symlink swap
  ln -sfn "$1" "$APP_DIR/current.tmp"
  mv -Tf "$APP_DIR/current.tmp" "$APP_DIR/current"
}

reload() {
  pm2 startOrReload "$APP_DIR/current/ecosystem.config.cjs" --update-env >/dev/null
  pm2 save >/dev/null
}

healthy() { # sitemap.xml reads from the CMS, so this proves the database driver works too
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 10 "http://127.0.0.1:$APP_PORT/sitemap.xml"; then return 0; fi
    sleep 1
  done
  return 1
}

switch_to "$NEW"
log "starting $PM2_NAME on 127.0.0.1:$APP_PORT"
reload

if healthy; then
  log "healthy: $RELEASE_ID is live"
else
  pm2 logs "$PM2_NAME" --lines 40 --nostream || true
  if [ -n "$PREV" ] && [ -d "$PREV" ] && [ "$PREV" != "$NEW" ]; then
    log "health check failed — rolling back to $(basename "$PREV")"
    switch_to "$PREV"
    reload
    healthy && log "rollback healthy" || log "rollback ALSO unhealthy — check $APP_DIR/logs"
  fi
  die "release $RELEASE_ID failed its health check"
fi

# keep the newest $KEEP_RELEASES, never the live one
LIVE=$(readlink -f "$APP_DIR/current")
find "$APP_DIR/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | awk '{print $2}' |
  tail -n +"$((KEEP_RELEASES + 1))" | while read -r dir; do
    [ "$dir" = "$LIVE" ] || rm -rf "$dir"
  done
rm -f "$TARBALL"
log "done — $(grep -c . "$ENV_FILE") settings in shared/.env"
