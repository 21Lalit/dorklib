import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const platformsTable = pgTable("platforms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  platformType: text("platform_type"),
  description: text("description"),
});

export const dorkPlatformsTable = pgTable("dork_platforms", {
  dorkId: integer("dork_id").notNull(),
  platformId: integer("platform_id").notNull(),
});

export const insertPlatformSchema = createInsertSchema(platformsTable).omit({ id: true });
export type InsertPlatform = z.infer<typeof insertPlatformSchema>;
export type Platform = typeof platformsTable.$inferSelect;
