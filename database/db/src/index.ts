import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is required but was not provided.");
}

console.log("[DB] Initializing PostgreSQL connection...");
const queryClient = postgres(dbUrl);
export const db = drizzle(queryClient, { schema });

export * from "./schema/index";
