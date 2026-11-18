/** Runs once when the Next.js server starts: applies pending database migrations. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.RUN_MIGRATIONS === "false" || !process.env.DATABASE_URL) return;

  const path = await import("node:path");
  const mysql = (await import("mysql2/promise")).default;
  const { drizzle } = await import("drizzle-orm/mysql2");
  const { migrate } = await import("drizzle-orm/mysql2/migrator");

  const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL, timezone: "Z" }).catch((err) => {
    console.error("[db] cannot connect for migrations", err);
    return null;
  });
  if (!conn) return;
  try {
    await migrate(drizzle(conn), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.info("[db] migrations up to date");
  } catch (err) {
    // Don't take the whole site down: pages are static. The form will report a save error until the DB is fixed.
    console.error("[db] migration failed", err);
  } finally {
    await conn.end();
  }
}
