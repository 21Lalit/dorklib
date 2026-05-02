import { Router, type IRouter } from "express";
import { ilike, or, and, eq, desc, sql } from "drizzle-orm";
import { db, dorksTable, categoriesTable, tagsTable, dorkTagsTable } from "@workspace/db";
import { SearchDorksQueryParams, GetSearchSuggestionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchDorksQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { q, category, difficulty, intentType, page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [
    eq(dorksTable.status, "PUBLISHED"),
    or(
      ilike(dorksTable.title, `%${q}%`),
      ilike(dorksTable.queryTemplate, `%${q}%`),
      ilike(dorksTable.description, `%${q}%`)
    )!,
  ];
  if (difficulty) conditions.push(eq(dorksTable.difficulty, difficulty));
  if (intentType) conditions.push(eq(dorksTable.intentType, intentType));

  const where = and(...conditions);

  const [totalResult, results] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(where),
    db.select().from(dorksTable).where(where).orderBy(desc(dorksTable.viewsCount)).limit(limit).offset(offset),
  ]);

  const total = totalResult[0]?.count ?? 0;
  res.json({ results, total, page, limit, totalPages: Math.ceil(total / limit), query: q });
});

router.get("/search/suggestions", async (req, res): Promise<void> => {
  const parsed = GetSearchSuggestionsQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { q, limit } = parsed.data;
  const dorks = await db.select({ title: dorksTable.title }).from(dorksTable)
    .where(and(eq(dorksTable.status, "PUBLISHED"), ilike(dorksTable.title, `%${q}%`)))
    .limit(limit);
  res.json(dorks.map(d => d.title));
});

export default router;
