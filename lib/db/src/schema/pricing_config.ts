import { pgTable, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pricingConfigTable = pgTable("pricing_config", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull().unique(),
  bwPerPage: real("bw_per_page").notNull().default(2),
  colorPerPage: real("color_per_page").notNull().default(5),
  minimumOrder: real("minimum_order").notNull().default(10),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPricingConfigSchema = createInsertSchema(pricingConfigTable).omit({ id: true });
export type InsertPricingConfig = z.infer<typeof insertPricingConfigSchema>;
export type PricingConfig = typeof pricingConfigTable.$inferSelect;
