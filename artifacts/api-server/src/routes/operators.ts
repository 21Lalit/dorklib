import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, operatorsTable } from "@workspace/db";
import { CreateOperatorBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/operators", async (_req, res): Promise<void> => {
  const ops = await db.select({
    id: operatorsTable.id,
    name: operatorsTable.name,
    syntax: operatorsTable.syntax,
    description: operatorsTable.description,
    exampleUsage: operatorsTable.exampleUsage,
    dorkCount: sql<number>`(select count(*)::int from dork_operators where operator_id = ${operatorsTable.id})`,
  }).from(operatorsTable).orderBy(operatorsTable.name);
  res.json(ops);
});

router.post("/operators", async (req, res): Promise<void> => {
  const parsed = CreateOperatorBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [op] = await db.insert(operatorsTable).values(parsed.data).returning();
  res.status(201).json({ ...op, dorkCount: 0 });
});

export default router;
