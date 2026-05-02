import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, collectionsTable, collectionItemsTable, bookmarksTable, dorksTable } from "@workspace/db";
import { CreateCollectionBody, CreateBookmarkBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/collections", async (_req, res): Promise<void> => {
  const cols = await db.select().from(collectionsTable).orderBy(desc(collectionsTable.createdAt));
  const withCounts = await Promise.all(cols.map(async c => {
    const [r] = await db.select({ count: sql<number>`count(*)::int` }).from(collectionItemsTable).where(eq(collectionItemsTable.collectionId, c.id));
    return { ...c, itemCount: r?.count ?? 0 };
  }));
  res.json(withCounts);
});

router.post("/collections", async (req, res): Promise<void> => {
  const parsed = CreateCollectionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [col] = await db.insert(collectionsTable).values(parsed.data).returning();
  res.status(201).json({ ...col, itemCount: 0 });
});

router.get("/collections/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [col] = await db.select().from(collectionsTable).where(eq(collectionsTable.id, id)).limit(1);
  if (!col) { res.status(404).json({ error: "Collection not found" }); return; }
  const items = await db.select({ collectionId: collectionItemsTable.collectionId, dorkId: collectionItemsTable.dorkId, displayOrder: collectionItemsTable.displayOrder, notes: collectionItemsTable.notes, dork: dorksTable })
    .from(collectionItemsTable)
    .innerJoin(dorksTable, eq(collectionItemsTable.dorkId, dorksTable.id))
    .where(eq(collectionItemsTable.collectionId, id));
  res.json({ ...col, itemCount: items.length, items: items.map(i => ({ ...i, dork: { ...i.dork, primaryCategory: null, tags: [], operators: [], platforms: [], categories: [] } })) });
});

router.delete("/collections/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(collectionItemsTable).where(eq(collectionItemsTable.collectionId, id));
  await db.delete(collectionsTable).where(eq(collectionsTable.id, id));
  res.sendStatus(204);
});

router.get("/bookmarks", async (_req, res): Promise<void> => {
  const bookmarks = await db.select({ id: bookmarksTable.id, userId: bookmarksTable.userId, dorkId: bookmarksTable.dorkId, folderName: bookmarksTable.folderName, createdAt: bookmarksTable.createdAt, dork: dorksTable })
    .from(bookmarksTable)
    .innerJoin(dorksTable, eq(bookmarksTable.dorkId, dorksTable.id))
    .orderBy(desc(bookmarksTable.createdAt));
  res.json(bookmarks.map(b => ({ ...b, dork: { ...b.dork, primaryCategory: null, tags: [], operators: [], platforms: [], categories: [] } })));
});

router.post("/bookmarks", async (req, res): Promise<void> => {
  const parsed = CreateBookmarkBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [bm] = await db.insert(bookmarksTable).values(parsed.data).returning();
  res.status(201).json({ ...bm, dork: null });
});

router.delete("/bookmarks/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, id));
  res.sendStatus(204);
});

export default router;
