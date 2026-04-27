import { db, usersTable } from "@workspace/db";

async function test() {
  console.log("[TEST] Attempting to connect to Supabase...");
  try {
    const result = await db.select().from(usersTable).limit(1);
    console.log("[TEST] Success! Connection established.");
    console.log("[TEST] Result:", result);
    process.exit(0);
  } catch (err) {
    console.error("[TEST] Failed to connect:", err);
    process.exit(1);
  }
}

test();
