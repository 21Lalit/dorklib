import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const collectionsTable = pgTable("collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  description: text("description"),
  visibility: text("visibility").notNull().default("PUBLIC"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const collectionItemsTable = pgTable("collection_items", {
  collectionId: integer("collection_id").notNull(),
  dorkId: integer("dork_id").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  notes: text("notes"),
});

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  dorkId: integer("dork_id").notNull(),
  folderName: text("folder_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dorkVersionsTable = pgTable("dork_versions", {
  id: serial("id").primaryKey(),
  dorkId: integer("dork_id").notNull(),
  queryTemplate: text("query_template"),
  optimizedQuery: text("optimized_query"),
  description: text("description"),
  versionLabel: text("version_label"),
  changeReason: text("change_reason"),
  changedById: integer("changed_by_id"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collectionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collectionsTable.$inferSelect;

export const insertBookmarkSchema = createInsertSchema(bookmarksTable).omit({ id: true, createdAt: true });
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarksTable.$inferSelect;
