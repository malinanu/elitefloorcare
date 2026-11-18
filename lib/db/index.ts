import "server-only";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "@/lib/env";
import * as schema from "./schema";

// One pool per server process (and survive dev hot reloads).
const g = globalThis as unknown as { __efcPool?: mysql.Pool; __efcDb?: MySql2Database<typeof schema> };

export function db() {
  if (!g.__efcDb) {
    g.__efcPool ??= mysql.createPool({ uri: env().DATABASE_URL, connectionLimit: 5, timezone: "Z", enableKeepAlive: true });
    g.__efcDb = drizzle(g.__efcPool, { schema, mode: "default" });
  }
  return g.__efcDb;
}

export { schema };
