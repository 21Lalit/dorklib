import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, platformsTable } from "@workspace/db";
import { CreatePlatformBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/platforms", async (_req, res): Promise<void> => {
  const plats = await db.select({
    id: platformsTable.id,
    name: platformsTable.name,
    slug: platformsTable.slug,
    platformType: platformsTable.platformType,
    description: platformsTable.description,
    dorkCount: sql<number>`(select count(*)::int from dork_platforms where platform_id = ${platformsTable.id})`,
  }).from(platformsTable).orderBy(platformsTable.name);
  res.json(plats);
});

router.post("/platforms", async (req, res): Promise<void> => {
  const parsed = CreatePlatformBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [plat] = await db.insert(platformsTable).values(parsed.data).returning();
  res.status(201).json({ ...plat, dorkCount: 0 });
});

export default router;
