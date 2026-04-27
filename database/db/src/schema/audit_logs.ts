import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const auditLogsTable = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"), // Who did it
  action: text("action").notNull(), // e.g., "USER_REGISTERED", "ORDER_STATUS_CHANGED"
  entityId: integer("entity_id"), // ID of the thing changed
  details: text("details"), // JSON string of changes
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});
