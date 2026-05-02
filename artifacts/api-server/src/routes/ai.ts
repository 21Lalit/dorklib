import { Router, type IRouter } from "express";
import { AiCategorizeDorkBody as AiCategorizeBody, AiOptimizeDorkBody as AiOptimizeBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Detect operators in a query
function detectOperators(query: string): string[] {
  const ops = ["site:", "filetype:", "ext:", "intitle:", "allintitle:", "inurl:", "allinurl:", "intext:", "allintext:", "cache:", "related:", "before:", "after:"];
  return ops.filter(op => query.toLowerCase().includes(op));
}

// Heuristic category detection
function detectCategory(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("site:") && q.includes("filetype:")) return "Web Security";
  if (q.includes("inurl:admin") || q.includes("intitle:admin")) return "Web Security";
  if (q.includes("aws") || q.includes("azure") || q.includes("gcloud") || q.includes("s3")) return "Cloud Security";
  if (q.includes("ai") || q.includes("llm") || q.includes("gpt") || q.includes("jupyter")) return "AI Security";
  if (q.includes("inurl:api") || q.includes("swagger") || q.includes("graphql")) return "Web Security";
  if (q.includes(".env") || q.includes("config") || q.includes("token")) return "DevSecOps";
  if (q.includes("camera") || q.includes("scada") || q.includes("iot")) return "IoT and OT Security";
  return "OSINT";
}

function detectDifficulty(query: string): string {
  const opCount = detectOperators(query).length;
  if (opCount >= 3) return "ADVANCED";
  if (opCount === 2) return "INTERMEDIATE";
  return "BEGINNER";
}

router.post("/ai/categorize", async (req, res): Promise<void> => {
  const parsed = AiCategorizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { query } = parsed.data;
  const operators = detectOperators(query);
  const primaryCategory = detectCategory(query);
  const difficulty = detectDifficulty(query);

  // Try real AI if configured
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (apiKey) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: `Classify this query template into the cybersecurity taxonomy. Return JSON with primaryCategory, subcategories (array), intentType, difficulty, tags (array), platforms (array), operators (array), title, and short description.\n\nQuery: ${query}`
          }],
          response_format: { type: "json_object" },
        }),
      });
      if (response.ok) {
        const data = await response.json() as { choices: { message: { content: string } }[] };
        const result = JSON.parse(data.choices[0].message.content);
        res.json(result);
        return;
      }
    } catch { /* fall through to heuristic */ }
  }

  // Heuristic fallback
  res.json({
    primaryCategory,
    subcategories: [],
    intentType: "RECONNAISSANCE",
    difficulty,
    tags: operators.map(o => o.replace(":", "")),
    platforms: ["Google Search"],
    operators,
    title: `${primaryCategory} Query Pattern`,
    description: `A ${difficulty.toLowerCase()} difficulty query template for ${primaryCategory.toLowerCase()} using ${operators.join(", ") || "basic search"}.`,
  });
});

router.post("/ai/optimize", async (req, res): Promise<void> => {
  const parsed = AiOptimizeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { query } = parsed.data;

  let normalized = query.trim();
  normalized = normalized.replace(/\b(site|filetype|ext|intitle|allintitle|inurl|allinurl|intext|allintext|cache|related|before|after):/gi, m => m.toLowerCase());
  normalized = normalized.replace(/\b(?:https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})\b/gi, "{domain}");

  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  if (apiKey) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{
            role: "user",
            content: `Normalize and improve this query template for readability and search relevance. Keep placeholders like {domain}, {keyword}, {technology}. Do not insert real targets. Return JSON with queryTemplate, optimizedQuery, title, description, tags (array), and relatedVariants (array of strings).\n\nQuery: ${query}`
          }],
          response_format: { type: "json_object" },
        }),
      });
      if (response.ok) {
        const data = await response.json() as { choices: { message: { content: string } }[] };
        const result = JSON.parse(data.choices[0].message.content);
        res.json(result);
        return;
      }
    } catch { /* fall through */ }
  }

  res.json({
    queryTemplate: normalized,
    optimizedQuery: normalized,
    title: "Optimized Query Pattern",
    description: "A normalized cybersecurity search query with placeholder variables for safe, repeatable use.",
    tags: detectOperators(query).map(o => o.replace(":", "")),
    relatedVariants: [
      `${normalized} filetype:pdf`,
      `${normalized} inurl:backup`,
    ],
  });
});

export default router;
