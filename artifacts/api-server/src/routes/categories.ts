import { Router, type IRouter } from "express";
import { eq, desc, sql, isNull } from "drizzle-orm";
import { db, categoriesTable, dorksTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  GetCategoryBySlugParams,
  UpdateCategoryParams,
  DeleteCategoryParams,
  ListCategoriesQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function buildCategoryTree(categories: typeof categoriesTable.$inferSelect[], dorkCounts: Map<number, number>) {
  const roots = categories.filter(c => !c.parentCategoryId);
  const children = categories.filter(c => c.parentCategoryId);
  return roots.map(root => ({
    ...root,
    dorkCount: dorkCounts.get(root.id) ?? 0,
    subcategories: children
      .filter(c => c.parentCategoryId === root.id)
      .map(child => ({
        ...child,
        dorkCount: dorkCounts.get(child.id) ?? 0,
        subcategories: children
          .filter(c => c.parentCategoryId === child.id)
          .map(sub => ({ ...sub, dorkCount: dorkCounts.get(sub.id) ?? 0, subcategories: [] })),
      })),
  }));
}

router.get("/categories", async (req, res): Promise<void> => {
  const parsed = ListCategoriesQueryParams.safeParse(req.query);
  const flat = parsed.success ? parsed.data.flat : false;

  const [categories, dorkCountRows] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.isActive, true)).orderBy(categoriesTable.displayOrder),
    db.select({ categoryId: dorksTable.primaryCategoryId, count: sql<number>`count(*)::int` })
      .from(dorksTable)
      .where(eq(dorksTable.status, "PUBLISHED"))
      .groupBy(dorksTable.primaryCategoryId),
  ]);

  const dorkCounts = new Map(dorkCountRows.map(r => [r.categoryId!, r.count]));

  if (flat) {
    res.json(categories.map(c => ({ ...c, dorkCount: dorkCounts.get(c.id) ?? 0, subcategories: [] })));
    return;
  }

  const tree = await buildCategoryTree(categories, dorkCounts);
  res.json(tree);
});

router.post("/categories", async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const depthLevel = parsed.data.parentCategoryId ? 1 : 0;
  const [cat] = await db.insert(categoriesTable).values({ ...parsed.data, depthLevel }).returning();
  res.status(201).json({ ...cat, dorkCount: 0, subcategories: [] });
});

router.get("/categories/:slug", async (req, res): Promise<void> => {
  const params = GetCategoryBySlugParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, params.data.slug)).limit(1);
  if (!cat[0]) { res.status(404).json({ error: "Category not found" }); return; }

  const [subcategories, dorkCount, recentDorks] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.parentCategoryId, cat[0].id)),
    db.select({ count: sql<number>`count(*)::int` }).from(dorksTable).where(eq(dorksTable.primaryCategoryId, cat[0].id)),
    db.select().from(dorksTable).where(eq(dorksTable.primaryCategoryId, cat[0].id)).orderBy(desc(dorksTable.createdAt)).limit(5),
  ]);

  res.json({
    ...cat[0],
    dorkCount: dorkCount[0]?.count ?? 0,
    subcategories: subcategories.map(s => ({ ...s, dorkCount: 0, subcategories: [] })),
    recentDorks,
  });
});

router.put("/categories/:id", async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [cat] = await db.update(categoriesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json({ ...cat, dorkCount: 0, subcategories: [] });
});

router.delete("/categories/:id", async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
