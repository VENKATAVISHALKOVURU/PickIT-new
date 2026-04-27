import { sqliteTable, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const pricingConfigTable = sqliteTable("pricing_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  shopId: integer("shop_id").notNull().unique(),
  bwPerPage: real("bw_per_page").notNull().default(2),
  colorPerPage: real("color_per_page").notNull().default(5),
  minimumOrder: real("minimum_order").notNull().default(10),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const insertPricingConfigSchema = createInsertSchema(pricingConfigTable).omit({ id: true });
export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;
export type PricingConfig = typeof pricingConfigTable.$inferSelect;
