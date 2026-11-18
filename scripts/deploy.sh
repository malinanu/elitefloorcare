#!/usr/bin/env bash
# Atomic release + PM2 reload + health check + automatic rollback.
# Runs ON THE SERVER as the CloudPanel site user (called by .github/workflows/deploy.yml).
#
#   deploy.sh <path-to-release.tgz> <release-id>
#
# Env: APP_DIR (default ~/apps/elite), APP_PORT (default 3000), KEEP_RELEASES (default 5), PM2_NAME (default elite-web)
set -Eeuo pipefail

TARBALL=${1:?usage: deploy.sh <release.tgz> <release-id>}
RELEASE_ID=${2:?usage: deploy.sh <release.tgz> <release-id>}
export APP_DIR=${APP_DIR:-$HOME/apps/elite}
export APP_PORT=${APP_PORT:-3000}
export PM2_NAME=${PM2_NAME:-elite-web}
KEEP_RELEASES=${KEEP_RELEASES:-5}

log() { printf '[deploy] %s\n' "$*"; }
die() { printf '[deploy] ERROR: %s\n' "$*" >&2; exit 1; }

# CloudPanel installs Node per site user through nvm; non-interactive SSH doesn't load it.
if ! command -v node >/dev/null 2>&1 && [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$HOME/.nvm/nvm.sh" >/dev/null
fi
command -v node >/dev/null || die "node not found for $(whoami) — create the site as a CloudPanel Node.js site"
command -v pm2 >/dev/null || die "pm2 not found — run: npm i -g pm2"
[ -f "$APP_DIR/shared/.env" ] || die "missing $APP_DIR/shared/.env (copy .env.example and fill it in)"

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] || die "Node $NODE_MAJOR is too old; pick Node 22 in CloudPanel"

mkdir -p "$APP_DIR/releases" "$APP_DIR/logs"
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

healthy() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 3 "http://127.0.0.1:$APP_PORT/robots.txt"; then return 0; fi
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
