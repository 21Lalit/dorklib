import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, sourcesTable, ingestionJobsTable } from "@workspace/db";
import { CreateSourceBody, UpdateSourceBody, UpdateSourceParams, DeleteSourceParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sources", async (_req, res): Promise<void> => {
  const sources = await db.select().from(sourcesTable).orderBy(sourcesTable.name);
  const withCounts = await Promise.all(sources.map(async s => {
    const [r] = await db.select({ count: sql<number>`count(*)::int` }).from(ingestionJobsTable).where(eq(ingestionJobsTable.sourceId, s.id));
    return { ...s, jobCount: r?.count ?? 0 };
  }));
  res.json(withCounts);
});

router.post("/sources", async (req, res): Promise<void> => {
  const parsed = CreateSourceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [source] = await db.insert(sourcesTable).values(parsed.data).returning();
  res.status(201).json({ ...source, jobCount: 0 });
});

router.put("/sources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateSourceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [source] = await db.update(sourcesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(sourcesTable.id, id)).returning();
  if (!source) { res.status(404).json({ error: "Source not found" }); return; }
  res.json({ ...source, jobCount: 0 });
});

router.delete("/sources/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(sourcesTable).where(eq(sourcesTable.id, id));
  res.sendStatus(204);
});

export default router;
