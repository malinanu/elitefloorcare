#!/usr/bin/env bash
# Atomic release + PM2 reload + health check + automatic rollback.
# Runs ON THE SERVER as the CloudPanel site user (called by .github/workflows/deploy.yml).
#
#   deploy.sh <path-to-release.tgz> <release-id>
#
# Env: APP_DIR (required: the CloudPanel site folder, e.g. /home/<site-user>/htdocs/<domain>),
#      APP_PORT (default 3000), KEEP_RELEASES (default 5), PM2_NAME (default elite-web)
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
command -v pm2 >/dev/null || die "pm2 not found — run: npm i -g pm2"
[ -f "$APP_DIR/shared/.env" ] || die "missing $APP_DIR/shared/.env (copy .env.example and fill it in)"

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 22 ] || die "Node $NODE_MAJOR is too old; pick Node 24 LTS in CloudPanel"

mkdir -p "$APP_DIR/releases" "$APP_DIR/logs" "$APP_DIR/shared/data" "$APP_DIR/shared/media"
ENV_FILE="$APP_DIR/shared/.env"
grep -q "^PAYLOAD_SECRET=..*" "$ENV_FILE" || die "PAYLOAD_SECRET missing in shared/.env (openssl rand -hex 32)"
# Database and uploads must live in shared/ (outside releases). Add the defaults once if absent.
grep -q "^DATABASE_URI=" "$ENV_FILE" || { printf '\nDATABASE_URI=file:%s\n' "$APP_DIR/shared/data/payload.db" >> "$ENV_FILE"; log "added DATABASE_URI to shared/.env"; }
grep -q "^MEDIA_DIR=" "$ENV_FILE" || { printf 'MEDIA_DIR=%s\n' "$APP_DIR/shared/media" >> "$ENV_FILE"; log "added MEDIA_DIR to shared/.env"; }
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
log "done"
