import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema/index";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is required but was not provided.");
}
console.log("[DB] Initializing connection...");
const client = createClient({ url: dbUrl });
export const db = drizzle(client, { schema });

export * from "./schema/index";
