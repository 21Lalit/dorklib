import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, tagsTable, dorkTagsTable } from "@workspace/db";
import { CreateTagBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tags", async (_req, res): Promise<void> => {
  const tags = await db.select({
    id: tagsTable.id,
    name: tagsTable.name,
    slug: tagsTable.slug,
    tagType: tagsTable.tagType,
    description: tagsTable.description,
    dorkCount: sql<number>`(select count(*)::int from dork_tags where tag_id = ${tagsTable.id})`,
  }).from(tagsTable).orderBy(tagsTable.name);
  res.json(tags);
});

router.post("/tags", async (req, res): Promise<void> => {
  const parsed = CreateTagBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [tag] = await db.insert(tagsTable).values(parsed.data).returning();
  res.status(201).json({ ...tag, dorkCount: 0 });
});

export default router;
