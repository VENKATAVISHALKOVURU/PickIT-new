import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  shopId: integer("shop_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  pages: integer("pages").notNull(),
  colorMode: text("color_mode", { enum: ["bw", "color"] }).notNull(),
  copies: integer("copies").notNull(),
  status: text("status", { enum: ["pending", "printing", "ready", "done"] }).notNull().default("pending"),
  price: real("price").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, status: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
