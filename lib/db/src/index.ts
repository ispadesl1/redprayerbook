import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Database = NodePgDatabase<typeof schema>;

let cached: Database | undefined;

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb(): Database {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw Object.assign(new Error("DATABASE_URL must be set. Did you forget to provision a database?"), {
      code: "unconfigured",
    });
  }
  if (!cached) {
    cached = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return cached;
}

export * from "./schema";
