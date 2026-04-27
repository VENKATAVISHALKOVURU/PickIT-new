import { pgTable, text, integer, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Who did it
  action: text("action").notNull(), // e.g., "USER_REGISTERED", "ORDER_STATUS_CHANGED"
  entityId: integer("entity_id"), // ID of the thing changed
  details: jsonb("details"), // Native PG JSONB is elite
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
