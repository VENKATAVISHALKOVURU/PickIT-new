import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const ordersTable = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  studentId: integer("student_id").notNull(),
  shopId: integer("shop_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  pages: integer("pages").notNull(),
  colorMode: text("color_mode").notNull(),
  copies: integer("copies").notNull(),
  status: text("status").notNull().default("pending"),
  price: real("price").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, status: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
