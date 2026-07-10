import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "@/lib/db/schema";

let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function normalizeDatabaseUrl(databaseUrl: string) {
  try {
    const parsedUrl = new URL(databaseUrl);
    const sslMode = parsedUrl.searchParams.get("sslmode");

    // pg currently verifies certificates for these aliases. Make that behavior
    // explicit so a future driver upgrade cannot silently weaken TLS checks.
    if (sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
      parsedUrl.searchParams.set("sslmode", "verify-full");
    }

    return parsedUrl.toString();
  } catch {
    return databaseUrl;
  }
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!poolInstance) {
    // DATABASE_URL can point to Neon, Supabase Postgres, Railway, Render,
    // local Docker, AWS RDS, or any standard Postgres-compatible host.
    // DATABASE_PROVIDER is only a documentation/logging hint; connection
    // behavior is driven entirely by DATABASE_URL.
    poolInstance = new Pool({ connectionString: normalizeDatabaseUrl(databaseUrl) });
  }

  if (!dbInstance) {
    dbInstance = drizzle(poolInstance, { schema });
  }

  return dbInstance;
}
