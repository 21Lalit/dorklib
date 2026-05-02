import { Router, type IRouter } from "express";
import { eq, sql, desc, gte } from "drizzle-orm";
import { db, dorksTable, categoriesTable, sourcesTable, rawContentTable, extractedDorksTable, ingestionJobsTable, platformsTable, operatorsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/stats", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [dorksCount, catsCount, sourcesCount, recentCount, opsCount, platsCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(eq(dorksTable.status, "PUBLISHED")),
    db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(sourcesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(gte(dorksTable.createdAt, thirtyDaysAgo)),
    db.select({ count: sql<number>`count(*)::int` }).from(operatorsTable),
    db.select({ count: sql<number>`count(*)::int` }).from(platformsTable),
  ]);
  res.json({
    totalDorks: dorksCount[0]?.count ?? 0,
    totalCategories: catsCount[0]?.count ?? 0,
    totalSources: sourcesCount[0]?.count ?? 0,
    recentDiscoveries: recentCount[0]?.count ?? 0,
    totalOperators: opsCount[0]?.count ?? 0,
    totalPlatforms: platsCount[0]?.count ?? 0,
  });
});

router.get("/analytics/category-distribution", async (_req, res): Promise<void> => {
  const rows = await db.select({
    name: categoriesTable.name,
    slug: categoriesTable.slug,
    color: categoriesTable.color,
    count: sql<number>`count(${dorksTable.id})::int`,
  })
    .from(categoriesTable)
    .leftJoin(dorksTable, eq(dorksTable.primaryCategoryId, categoriesTable.id))
    .where(eq(categoriesTable.depthLevel, 0))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.color)
    .orderBy(desc(sql`count(${dorksTable.id})`))
    .limit(12);
  res.json(rows);
});

router.get("/analytics/difficulty-breakdown", async (_req, res): Promise<void> => {
  const rows = await db.select({
    difficulty: dorksTable.difficulty,
    count: sql<number>`count(*)::int`,
  })
    .from(dorksTable)
    .where(eq(dorksTable.status, "PUBLISHED"))
    .groupBy(dorksTable.difficulty)
    .orderBy(desc(sql`count(*)`));
  res.json(rows.filter(r => r.difficulty));
});

router.get("/analytics/ingestion-activity", async (_req, res): Promise<void> => {
  // Generate last 30 days with counts
  const days: { date: string; dorksAdded: number; rawContentFetched: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, dorksAdded: 0, rawContentFetched: 0 });
  }
  res.json(days);
});

router.get("/analytics", async (_req, res): Promise<void> => {
  const [dorksCount, catsCount, sourcesCount, rawCount, extractedCount, pendingCount, jobs, catDist, diffBreak] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(eq(dorksTable.status, "PUBLISHED")),
    db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(sourcesTable),
    db.select({ count: sql<number>`count(*)::int` }).from(rawContentTable),
    db.select({ count: sql<number>`count(*)::int` }).from(extractedDorksTable),
    db.select({ count: sql<number>`count(*)::int` }).from(extractedDorksTable).where(eq(extractedDorksTable.processingStatus, "NEW")),
    db.select().from(ingestionJobsTable).orderBy(desc(ingestionJobsTable.createdAt)).limit(5),
    db.select({
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      color: categoriesTable.color,
      count: sql<number>`count(${dorksTable.id})::int`,
    }).from(categoriesTable).leftJoin(dorksTable, eq(dorksTable.primaryCategoryId, categoriesTable.id))
      .where(eq(categoriesTable.depthLevel, 0))
      .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.color)
      .limit(10),
    db.select({ difficulty: dorksTable.difficulty, count: sql<number>`count(*)::int` })
      .from(dorksTable).where(eq(dorksTable.status, "PUBLISHED")).groupBy(dorksTable.difficulty),
  ]);

  res.json({
    totalDorks: dorksCount[0]?.count ?? 0,
    totalCategories: catsCount[0]?.count ?? 0,
    totalSources: sourcesCount[0]?.count ?? 0,
    totalRawContent: rawCount[0]?.count ?? 0,
    totalExtracted: extractedCount[0]?.count ?? 0,
    pendingReview: pendingCount[0]?.count ?? 0,
    recentIngestions: jobs,
    categoryDistribution: catDist,
    difficultyBreakdown: diffBreak.filter(r => r.difficulty),
    dailyActivity: [],
  });
});

export default router;
