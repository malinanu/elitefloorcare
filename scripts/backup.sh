#!/usr/bin/env bash
# Nightly backup of the CMS: a consistent SQLite snapshot + the uploads folder.
# Run as the CloudPanel site user. CloudPanel → Sites → <site> → Cron Jobs:
#   30 2 * * *   APP_DIR=/home/<site-user>/htdocs/<domain> bash /home/<site-user>/htdocs/<domain>/current/scripts/backup.sh
#
# Env: APP_DIR (required), BACKUP_DIR (default ~/backups/elite), KEEP_DAYS (default 14)
set -Eeuo pipefail

: "${APP_DIR:?set APP_DIR to the site folder, e.g. /home/<site-user>/htdocs/<domain>}"
BACKUP_DIR=${BACKUP_DIR:-$HOME/backups/elite}
KEEP_DAYS=${KEEP_DAYS:-14}
DB="$APP_DIR/shared/data/payload.db"
MEDIA="$APP_DIR/shared/media"
STAMP=$(date +%F-%H%M)

mkdir -p "$BACKUP_DIR"
[ -f "$DB" ] || { echo "[backup] no database at $DB" >&2; exit 1; }

# .backup takes a consistent copy even while the site is writing (unlike cp).
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB" ".backup '$BACKUP_DIR/payload-$STAMP.db'"
else
  # no sqlite3 CLI: use the driver that ships with the app
  ( cd "$APP_DIR/current" && node -e '
      const fs = require("fs"), path = require("path");
      const store = path.join(process.cwd(), "node_modules/.pnpm");
      const pkg = fs.readdirSync(store).find((d) => /^libsql@/.test(d));
      if (!pkg) throw new Error("libsql driver not found in " + store);
      const Database = require(path.join(store, pkg, "node_modules/libsql"));
      const db = new Database(process.argv[1]);
      db.exec("VACUUM INTO \x27" + process.argv[2].replace(/\x27/g, "\x27\x27") + "\x27");
      db.close();
    ' "$DB" "$BACKUP_DIR/payload-$STAMP.db" )
fi
gzip -f "$BACKUP_DIR/payload-$STAMP.db"
tar -czf "$BACKUP_DIR/media-$STAMP.tgz" -C "$(dirname "$MEDIA")" "$(basename "$MEDIA")"

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'payload-*.db.gz' -o -name 'media-*.tgz' \) -mtime +"$KEEP_DAYS" -delete
echo "[backup] $(du -sh "$BACKUP_DIR" | cut -f1) in $BACKUP_DIR — latest: payload-$STAMP.db.gz, media-$STAMP.tgz"
