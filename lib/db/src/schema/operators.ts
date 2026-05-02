import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const operatorsTable = pgTable("operators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  syntax: text("syntax").notNull().unique(),
  description: text("description"),
  exampleUsage: text("example_usage"),
});

export const dorkOperatorsTable = pgTable("dork_operators", {
  dorkId: integer("dork_id").notNull(),
  operatorId: integer("operator_id").notNull(),
});

export const insertOperatorSchema = createInsertSchema(operatorsTable).omit({ id: true });
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operatorsTable.$inferSelect;
