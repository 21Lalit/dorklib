import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, ingestionJobsTable, rawContentTable, extractedDorksTable, sourcesTable, dorksTable, dorkVersionsTable } from "@workspace/db";
import { RunIngestionJobBody, ListIngestionJobsQueryParams, ListRawContentQueryParams, ListExtractedDorksQueryParams, ExtractDorksBody } from "@workspace/api-zod";
import * as crypto from "crypto";

const router: IRouter = Router();

// Helper: extract dork patterns from text
function extractDorkCandidates(text: string): string[] {
  const patterns = [
    /(?:site|filetype|ext|intitle|allintitle|inurl|allinurl|intext|allintext|cache|related|before|after):[^\s"']+(?:\s+"[^"]*")?/gi,
    /"[^"]*"\s+(?:site|filetype|ext|intitle|inurl|intext):[^\s]+/gi,
  ];
  const found = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const m of matches) found.add(m.trim());
  }
  return Array.from(found).filter(q => q.length > 5 && q.length < 500);
}

// Helper: normalize a dork query
function normalizeDork(raw: string): string {
  let normalized = raw.trim();
  normalized = normalized.replace(/\b(site|filetype|ext|intitle|allintitle|inurl|allinurl|intext|allintext|cache|related|before|after):/gi, m => m.toLowerCase());
  normalized = normalized.replace(/\b(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})\b/gi, '{domain}');
  return normalized;
}

router.post("/ingestion/run", async (req, res): Promise<void> => {
  const parsed = RunIngestionJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [source] = await db.select().from(sourcesTable).where(eq(sourcesTable.id, parsed.data.sourceId)).limit(1);
  if (!source) { res.status(404).json({ error: "Source not found" }); return; }

  const [job] = await db.insert(ingestionJobsTable).values({
    sourceId: parsed.data.sourceId,
    jobType: parsed.data.jobType ?? "FETCH",
    status: "RUNNING",
    startedAt: new Date(),
  }).returning();

  // Simulate async ingestion (mock)
  setTimeout(async () => {
    try {
      const sampleTexts = [
        `Security researchers often look for exposed configuration files using site:{domain} filetype:env`,
        `Find login pages with intitle:"Login" site:{domain}`,
        `Discover backup files: site:{domain} ext:bak OR ext:backup`,
        `API endpoint discovery: site:{domain} inurl:api OR inurl:swagger`,
        `Find exposed admin panels: intitle:"admin panel" site:{domain}`,
      ];
      let processed = 0;
      for (const text of sampleTexts) {
        const hash = crypto.createHash("md5").update(text).digest("hex");
        const existing = await db.select().from(rawContentTable).where(eq(rawContentTable.contentHash, hash)).limit(1);
        if (existing.length > 0) continue;
        const [rc] = await db.insert(rawContentTable).values({
          sourceId: parsed.data.sourceId,
          jobId: job.id,
          title: `Sample content ${processed + 1}`,
          rawText: text,
          sourceUrl: source.baseUrl ?? "https://example.com",
          contentHash: hash,
          discoveredAt: new Date(),
        }).returning();
        const candidates = extractDorkCandidates(text);
        for (const cand of candidates) {
          const normalized = normalizeDork(cand);
          await db.insert(extractedDorksTable).values({
            rawContentId: rc.id,
            rawQuery: cand,
            normalizedQuery: normalized,
            processingStatus: "NEW",
          }).onConflictDoNothing();
        }
        processed++;
      }
      await db.update(ingestionJobsTable).set({
        status: "COMPLETED",
        finishedAt: new Date(),
        itemsFound: sampleTexts.length,
        itemsProcessed: processed,
      }).where(eq(ingestionJobsTable.id, job.id));
      await db.update(sourcesTable).set({ lastFetchedAt: new Date() }).where(eq(sourcesTable.id, parsed.data.sourceId));
    } catch (err: unknown) {
      await db.update(ingestionJobsTable).set({
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : "Unknown error",
      }).where(eq(ingestionJobsTable.id, job.id));
    }
  }, 2000);

  res.status(202).json(job);
});

router.get("/ingestion/jobs", async (req, res): Promise<void> => {
  const parsed = ListIngestionJobsQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const offset = (page - 1) * limit;

  const [totalResult, jobs] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(ingestionJobsTable),
    db.select().from(ingestionJobsTable).orderBy(desc(ingestionJobsTable.createdAt)).limit(limit).offset(offset),
  ]);
  const total = totalResult[0]?.count ?? 0;

  const withSources = await Promise.all(jobs.map(async j => {
    const [src] = await db.select().from(sourcesTable).where(eq(sourcesTable.id, j.sourceId)).limit(1);
    return { ...j, source: src ? { ...src, jobCount: 0 } : null };
  }));

  res.json({ jobs: withSources, total, page, limit, totalPages: Math.ceil(total / limit) });
});

router.get("/raw-content", async (req, res): Promise<void> => {
  const parsed = ListRawContentQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const offset = (page - 1) * limit;

  const [totalResult, items] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(rawContentTable),
    db.select().from(rawContentTable).orderBy(desc(rawContentTable.discoveredAt)).limit(limit).offset(offset),
  ]);
  const total = totalResult[0]?.count ?? 0;
  const itemsWithCounts = await Promise.all(items.map(async item => {
    const [r] = await db.select({ count: sql<number>`count(*)::int` }).from(extractedDorksTable).where(eq(extractedDorksTable.rawContentId, item.id));
    return { ...item, extractedDorkCount: r?.count ?? 0 };
  }));
  res.json({ items: itemsWithCounts, total, page, limit, totalPages: Math.ceil(total / limit) });
});

router.post("/extract", async (req, res): Promise<void> => {
  const parsed = ExtractDorksBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const candidates = extractDorkCandidates(parsed.data.rawText);
  res.json({ candidates, count: candidates.length });
});

router.get("/extracted-dorks", async (req, res): Promise<void> => {
  const parsed = ListExtractedDorksQueryParams.safeParse(req.query);
  const page = parsed.success ? parsed.data.page : 1;
  const limit = parsed.success ? parsed.data.limit : 20;
  const status = parsed.success ? parsed.data.status : undefined;
  const offset = (page - 1) * limit;

  const where = status ? eq(extractedDorksTable.processingStatus, status) : undefined;
  const [totalResult, items] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(extractedDorksTable).where(where),
    db.select().from(extractedDorksTable).where(where).orderBy(desc(extractedDorksTable.createdAt)).limit(limit).offset(offset),
  ]);
  const total = totalResult[0]?.count ?? 0;
  res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

router.post("/extracted-dorks/:id/import", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [extracted] = await db.select().from(extractedDorksTable).where(eq(extractedDorksTable.id, id)).limit(1);
  if (!extracted) { res.status(404).json({ error: "Extracted dork not found" }); return; }
  const [dork] = await db.insert(dorksTable).values({
    title: extracted.extractedTitle ?? extracted.normalizedQuery ?? extracted.rawQuery,
    queryTemplate: extracted.normalizedQuery ?? extracted.rawQuery,
    optimizedQuery: extracted.optimizedQuery,
    intentType: extracted.detectedIntent,
    status: "PUBLISHED",
    sourceType: "IMPORT",
  }).returning();
  await db.insert(dorkVersionsTable).values({
    dorkId: dork.id,
    queryTemplate: dork.queryTemplate,
    versionLabel: "v1.0",
    changeReason: "Imported from extracted dork",
  });
  await db.update(extractedDorksTable).set({ processingStatus: "IMPORTED" }).where(eq(extractedDorksTable.id, id));
  res.status(201).json(dork);
});

router.post("/extracted-dorks/:id/ignore", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.update(extractedDorksTable).set({ processingStatus: "IGNORED" }).where(eq(extractedDorksTable.id, id));
  res.json({ success: true });
});

export default router;
