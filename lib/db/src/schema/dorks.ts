import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dorksTable = pgTable("dorks", {
  id: serial("id").primaryKey(),
  primaryCategoryId: integer("primary_category_id"),
  createdById: integer("created_by_id"),
  title: text("title").notNull(),
  queryTemplate: text("query_template").notNull(),
  optimizedQuery: text("optimized_query"),
  description: text("description"),
  usageContext: text("usage_context"),
  intentType: text("intent_type"),
  difficulty: text("difficulty"),
  sourceType: text("source_type"),
  status: text("status").notNull().default("PUBLISHED"),
  viewsCount: integer("views_count").notNull().default(0),
  copyCount: integer("copy_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dorkCategoriesTable = pgTable("dork_categories", {
  dorkId: integer("dork_id").notNull(),
  categoryId: integer("category_id").notNull(),
});

export const insertDorkSchema = createInsertSchema(dorksTable).omit({ id: true, createdAt: true, updatedAt: true, viewsCount: true, copyCount: true });
export type InsertDork = z.infer<typeof insertDorkSchema>;
export type Dork = typeof dorksTable.$inferSelect;
