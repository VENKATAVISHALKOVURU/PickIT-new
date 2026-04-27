import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbUrl = "file:" + path.resolve(__dirname, "../../database/db/local.db");
console.log("Connecting to:", dbUrl);

const client = createClient({ url: dbUrl });

try {
  const rs = await client.execute("SELECT 1");
  console.log("Success:", rs);
} catch (err) {
  console.error("Failure:", err);
}
