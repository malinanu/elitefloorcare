/** Runs once when the Next.js server starts: applies pending database migrations. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.RUN_MIGRATIONS === "false" || !process.env.DATABASE_URL) return;

  const path = await import("node:path");
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");
  const { migrate } = await import("drizzle-orm/node-postgres/migrator");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.info("[db] migrations up to date");
  } catch (err) {
    // Don't take the whole site down: pages are static. The form will report a save error until the DB is fixed.
    console.error("[db] migration failed", err);
  } finally {
    await pool.end();
  }
}
