import { Router, type IRouter } from "express";
import { eq, desc, ilike, sql, and, inArray } from "drizzle-orm";
import {
  db,
  dorksTable,
  categoriesTable,
  tagsTable,
  dorkTagsTable,
  operatorsTable,
  dorkOperatorsTable,
  platformsTable,
  dorkPlatformsTable,
  dorkCategoriesTable,
  dorkVersionsTable,
} from "@workspace/db";
import {
  CreateDorkBody,
  UpdateDorkBody,
  GetDorkParams,
  UpdateDorkParams,
  DeleteDorkParams,
  ListDorksQueryParams,
  GetTrendingDorksQueryParams,
  GetRecentDorksQueryParams,
  GetRelatedDorksParams,
  GetRelatedDorksQueryParams,
  GetDorkVersionsParams,
  RecordDorkCopyParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getDorkWithRelations(id: number) {
  const dork = await db.select().from(dorksTable).where(eq(dorksTable.id, id)).limit(1);
  if (!dork[0]) return null;

  const category = dork[0].primaryCategoryId
    ? await db.select().from(categoriesTable).where(eq(categoriesTable.id, dork[0].primaryCategoryId)).limit(1)
    : [];

  const dorkTags = await db
    .select({ tag: tagsTable })
    .from(dorkTagsTable)
    .innerJoin(tagsTable, eq(dorkTagsTable.tagId, tagsTable.id))
    .where(eq(dorkTagsTable.dorkId, id));

  const dorkOperators = await db
    .select({ operator: operatorsTable })
    .from(dorkOperatorsTable)
    .innerJoin(operatorsTable, eq(dorkOperatorsTable.operatorId, operatorsTable.id))
    .where(eq(dorkOperatorsTable.dorkId, id));

  const dorkPlats = await db
    .select({ platform: platformsTable })
    .from(dorkPlatformsTable)
    .innerJoin(platformsTable, eq(dorkPlatformsTable.platformId, platformsTable.id))
    .where(eq(dorkPlatformsTable.dorkId, id));

  const dorkCats = await db
    .select({ category: categoriesTable })
    .from(dorkCategoriesTable)
    .innerJoin(categoriesTable, eq(dorkCategoriesTable.categoryId, categoriesTable.id))
    .where(eq(dorkCategoriesTable.dorkId, id));

  return {
    ...dork[0],
    primaryCategory: category[0] ?? null,
    tags: dorkTags.map(r => r.tag),
    operators: dorkOperators.map(r => r.operator),
    platforms: dorkPlats.map(r => r.platform),
    categories: dorkCats.map(r => r.category),
  };
}

async function getDorkListWithRelations(dorkRows: typeof dorksTable.$inferSelect[]) {
  if (dorkRows.length === 0) return [];
  const ids = dorkRows.map(d => d.id);

  const [cats, dorkTags, dorkOps, dorkPlats] = await Promise.all([
    db.select().from(categoriesTable).where(
      inArray(categoriesTable.id, dorkRows.map(d => d.primaryCategoryId).filter(Boolean) as number[])
    ),
    db.select({ dorkId: dorkTagsTable.dorkId, tag: tagsTable }).from(dorkTagsTable)
      .innerJoin(tagsTable, eq(dorkTagsTable.tagId, tagsTable.id))
      .where(inArray(dorkTagsTable.dorkId, ids)),
    db.select({ dorkId: dorkOperatorsTable.dorkId, operator: operatorsTable }).from(dorkOperatorsTable)
      .innerJoin(operatorsTable, eq(dorkOperatorsTable.operatorId, operatorsTable.id))
      .where(inArray(dorkOperatorsTable.dorkId, ids)),
    db.select({ dorkId: dorkPlatformsTable.dorkId, platform: platformsTable }).from(dorkPlatformsTable)
      .innerJoin(platformsTable, eq(dorkPlatformsTable.platformId, platformsTable.id))
      .where(inArray(dorkPlatformsTable.dorkId, ids)),
  ]);

  return dorkRows.map(dork => ({
    ...dork,
    primaryCategory: cats.find(c => c.id === dork.primaryCategoryId) ?? null,
    tags: dorkTags.filter(r => r.dorkId === dork.id).map(r => r.tag),
    operators: dorkOps.filter(r => r.dorkId === dork.id).map(r => r.operator),
    platforms: dorkPlats.filter(r => r.dorkId === dork.id).map(r => r.platform),
    categories: [],
  }));
}

router.get("/dorks/trending", async (req, res): Promise<void> => {
  const parsed = GetTrendingDorksQueryParams.safeParse(req.query);
  const limit = parsed.success ? parsed.data.limit : 10;
  const dorks = await db.select().from(dorksTable)
    .where(eq(dorksTable.status, "PUBLISHED"))
    .orderBy(desc(dorksTable.viewsCount))
    .limit(limit);
  const result = await getDorkListWithRelations(dorks);
  res.json(result);
});

router.get("/dorks/recent", async (req, res): Promise<void> => {
  const parsed = GetRecentDorksQueryParams.safeParse(req.query);
  const limit = parsed.success ? parsed.data.limit : 10;
  const dorks = await db.select().from(dorksTable)
    .where(eq(dorksTable.status, "PUBLISHED"))
    .orderBy(desc(dorksTable.createdAt))
    .limit(limit);
  const result = await getDorkListWithRelations(dorks);
  res.json(result);
});

router.get("/dorks", async (req, res): Promise<void> => {
  const parsed = ListDorksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit, category, tag, difficulty, intentType, sourceType, status, sortBy, q } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) {
    conditions.push(eq(dorksTable.status, status));
  } else {
    conditions.push(eq(dorksTable.status, "PUBLISHED"));
  }
  if (difficulty) conditions.push(eq(dorksTable.difficulty, difficulty));
  if (intentType) conditions.push(eq(dorksTable.intentType, intentType));
  if (sourceType) conditions.push(eq(dorksTable.sourceType, sourceType));
  if (q) conditions.push(ilike(dorksTable.title, `%${q}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sortBy) {
    case "popular": orderBy = desc(dorksTable.viewsCount); break;
    case "copied": orderBy = desc(dorksTable.copyCount); break;
    default: orderBy = desc(dorksTable.createdAt);
  }

  const [totalResult, dorks] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(where),
    db.select().from(dorksTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const result = await getDorkListWithRelations(dorks);

  res.json({
    dorks: result,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

router.post("/dorks", async (req, res): Promise<void> => {
  const parsed = CreateDorkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { categoryIds, tagIds, operatorIds, platformIds, ...dorkData } = parsed.data;
  const [dork] = await db.insert(dorksTable).values(dorkData).returning();
  if (categoryIds?.length) {
    await db.insert(dorkCategoriesTable).values(categoryIds.map(cid => ({ dorkId: dork.id, categoryId: cid })));
  }
  if (tagIds?.length) {
    await db.insert(dorkTagsTable).values(tagIds.map(tid => ({ dorkId: dork.id, tagId: tid })));
  }
  if (operatorIds?.length) {
    await db.insert(dorkOperatorsTable).values(operatorIds.map(oid => ({ dorkId: dork.id, operatorId: oid })));
  }
  if (platformIds?.length) {
    await db.insert(dorkPlatformsTable).values(platformIds.map(pid => ({ dorkId: dork.id, platformId: pid })));
  }
  // Create initial version
  await db.insert(dorkVersionsTable).values({
    dorkId: dork.id,
    queryTemplate: dork.queryTemplate,
    optimizedQuery: dork.optimizedQuery,
    description: dork.description,
    versionLabel: "v1.0",
    changeReason: "Initial creation",
  });
  const result = await getDorkWithRelations(dork.id);
  res.status(201).json(result);
});

router.get("/dorks/:id/related", async (req, res): Promise<void> => {
  const paramsP = GetRelatedDorksParams.safeParse(req.params);
  if (!paramsP.success) { res.status(400).json({ error: paramsP.error.message }); return; }
  const queryP = GetRelatedDorksQueryParams.safeParse(req.query);
  const limit = queryP.success ? queryP.data.limit : 5;
  const dork = await db.select().from(dorksTable).where(eq(dorksTable.id, paramsP.data.id)).limit(1);
  if (!dork[0]) { res.status(404).json({ error: "Dork not found" }); return; }
  const related = await db.select().from(dorksTable)
    .where(and(eq(dorksTable.primaryCategoryId, dork[0].primaryCategoryId ?? 0), eq(dorksTable.status, "PUBLISHED")))
    .limit(limit + 1);
  const filtered = related.filter(d => d.id !== paramsP.data.id).slice(0, limit);
  const result = await getDorkListWithRelations(filtered);
  res.json(result);
});

router.get("/dorks/:id/versions", async (req, res): Promise<void> => {
  const params = GetDorkVersionsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const versions = await db.select().from(dorkVersionsTable)
    .where(eq(dorkVersionsTable.dorkId, params.data.id))
    .orderBy(desc(dorkVersionsTable.changedAt));
  res.json(versions);
});

router.post("/dorks/:id/copy", async (req, res): Promise<void> => {
  const params = RecordDorkCopyParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.update(dorksTable).set({ copyCount: sql`${dorksTable.copyCount} + 1` }).where(eq(dorksTable.id, params.data.id));
  res.json({ success: true });
});

router.get("/dorks/:id", async (req, res): Promise<void> => {
  const params = GetDorkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.update(dorksTable).set({ viewsCount: sql`${dorksTable.viewsCount} + 1` }).where(eq(dorksTable.id, params.data.id));
  const dork = await getDorkWithRelations(params.data.id);
  if (!dork) { res.status(404).json({ error: "Dork not found" }); return; }
  const versions = await db.select().from(dorkVersionsTable).where(eq(dorkVersionsTable.dorkId, params.data.id)).orderBy(desc(dorkVersionsTable.changedAt));
  const related = await db.select().from(dorksTable)
    .where(and(eq(dorksTable.primaryCategoryId, dork.primaryCategoryId ?? 0), eq(dorksTable.status, "PUBLISHED")))
    .limit(6);
  const filteredRelated = related.filter(d => d.id !== params.data.id).slice(0, 5);
  const relatedWithRel = await getDorkListWithRelations(filteredRelated);
  res.json({ ...dork, versions, relatedDorks: relatedWithRel });
});

router.put("/dorks/:id", async (req, res): Promise<void> => {
  const params = UpdateDorkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateDorkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { categoryIds, tagIds, operatorIds, platformIds, ...dorkData } = parsed.data;
  const [dork] = await db.update(dorksTable).set({ ...dorkData, updatedAt: new Date() }).where(eq(dorksTable.id, params.data.id)).returning();
  if (!dork) { res.status(404).json({ error: "Dork not found" }); return; }
  res.json(dork);
});

router.delete("/dorks/:id", async (req, res): Promise<void> => {
  const params = DeleteDorkParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(dorksTable).where(eq(dorksTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
