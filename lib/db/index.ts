import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

// One pool per server process (and survive dev hot reloads).
const g = globalThis as unknown as { __efcPool?: Pool; __efcDb?: NodePgDatabase<typeof schema> };

export function db() {
  if (!g.__efcDb) {
    g.__efcPool ??= new Pool({ connectionString: env().DATABASE_URL, max: 5, idleTimeoutMillis: 30_000 });
    g.__efcDb = drizzle(g.__efcPool, { schema });
  }
  return g.__efcDb;
}

export { schema };
