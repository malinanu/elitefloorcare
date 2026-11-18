// PM2 process file — shipped inside every release and run by scripts/deploy.sh.
// Layout on the server (APP_DIR defaults to ~/apps/elite):
//   APP_DIR/releases/<sha>/   one unpacked build per deploy
//   APP_DIR/current           symlink to the live release
//   APP_DIR/shared/.env       secrets (DATABASE_URL, SMTP, ClickSend…) — never in git
const path = require("node:path");

const APP_DIR = process.env.APP_DIR || path.resolve(__dirname, "..", "..");

module.exports = {
  apps: [
    {
      name: process.env.PM2_NAME || "elite-web",
      cwd: path.join(APP_DIR, "current"),
      script: path.join(APP_DIR, "current", "server.js"),
      // Node 20.6+ loads the env file natively; values already in the environment win.
      node_args: `--env-file=${path.join(APP_DIR, "shared", ".env")}`,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      kill_timeout: 8000,
      env: {
        NODE_ENV: "production",
        PORT: process.env.APP_PORT || "3000", // CloudPanel → Site → Settings → App Port
        HOSTNAME: "127.0.0.1", // only nginx (CloudPanel's vhost) talks to the app
        NEXT_TELEMETRY_DISABLED: "1",
      },
      out_file: path.join(APP_DIR, "logs", "out.log"),
      error_file: path.join(APP_DIR, "logs", "error.log"),
      time: true,
    },
  ],
};
