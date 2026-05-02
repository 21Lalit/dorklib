import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ingestionJobsTable = pgTable("ingestion_jobs", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  jobType: text("job_type").notNull().default("FETCH"),
  status: text("status").notNull().default("PENDING"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  itemsFound: integer("items_found").default(0),
  itemsProcessed: integer("items_processed").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rawContentTable = pgTable("raw_content", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  jobId: integer("job_id"),
  title: text("title"),
  rawText: text("raw_text"),
  sourceUrl: text("source_url"),
  contentHash: text("content_hash").notNull().unique(),
  discoveredAt: timestamp("discovered_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const extractedDorksTable = pgTable("extracted_dorks", {
  id: serial("id").primaryKey(),
  rawContentId: integer("raw_content_id"),
  rawQuery: text("raw_query").notNull(),
  normalizedQuery: text("normalized_query"),
  optimizedQuery: text("optimized_query"),
  extractedTitle: text("extracted_title"),
  detectedCategory: text("detected_category"),
  detectedIntent: text("detected_intent"),
  confidenceScore: text("confidence_score"),
  processingStatus: text("processing_status").notNull().default("NEW"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIngestionJobSchema = createInsertSchema(ingestionJobsTable).omit({ id: true, createdAt: true });
export type InsertIngestionJob = z.infer<typeof insertIngestionJobSchema>;
export type IngestionJob = typeof ingestionJobsTable.$inferSelect;

export const insertRawContentSchema = createInsertSchema(rawContentTable).omit({ id: true, createdAt: true });
export type InsertRawContent = z.infer<typeof insertRawContentSchema>;
export type RawContent = typeof rawContentTable.$inferSelect;
