import { db } from "./index.js";
import {
  categoriesTable, operatorsTable, platformsTable, tagsTable,
  sourcesTable, dorksTable, dorkTagsTable, dorkOperatorsTable,
  dorkPlatformsTable, dorkVersionsTable,
} from "./schema/index.js";

async function seed() {
  console.log("Seeding database...");

  const cats = await db.insert(categoriesTable).values([
    { name: "Web Security", slug: "web-security", description: "Web application security dork patterns for finding exposed admin panels, login pages, and vulnerable endpoints.", icon: "🌐", color: "#00ffc8", depthLevel: 0, displayOrder: 1 },
    { name: "Cloud Security", slug: "cloud-security", description: "Cloud infrastructure exposure patterns for AWS, Azure, GCP, and other cloud platforms.", icon: "☁️", color: "#3b82f6", depthLevel: 0, displayOrder: 2 },
    { name: "DevSecOps", slug: "devsecops", description: "CI/CD, configuration files, secrets, and developer infrastructure exposure patterns.", icon: "⚙️", color: "#f59e0b", depthLevel: 0, displayOrder: 3 },
    { name: "OSINT", slug: "osint", description: "Open source intelligence gathering patterns for people, organizations, and infrastructure.", icon: "🔍", color: "#8b5cf6", depthLevel: 0, displayOrder: 4 },
    { name: "IoT and OT Security", slug: "iot-ot-security", description: "Internet of Things, SCADA, and industrial control system exposure patterns.", icon: "📡", color: "#ef4444", depthLevel: 0, displayOrder: 5 },
    { name: "AI Security", slug: "ai-security", description: "AI model endpoints, Jupyter notebooks, and ML infrastructure exposure patterns.", icon: "🤖", color: "#ec4899", depthLevel: 0, displayOrder: 6 },
    { name: "Network Security", slug: "network-security", description: "Network device, VPN, and infrastructure exposure patterns.", icon: "🔒", color: "#10b981", depthLevel: 0, displayOrder: 7 },
    { name: "Data Exposure", slug: "data-exposure", description: "Database interfaces, data files, and sensitive information exposure patterns.", icon: "💾", color: "#f97316", depthLevel: 0, displayOrder: 8 },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${cats.length} categories`);

  const ops = await db.insert(operatorsTable).values([
    { name: "Site Operator", syntax: "site:", description: "Restrict results to a specific domain or subdomain", exampleUsage: "site:{domain} login" },
    { name: "Filetype Operator", syntax: "filetype:", description: "Find files of a specific type", exampleUsage: "filetype:pdf confidential" },
    { name: "Extension Operator", syntax: "ext:", description: "Search for files with a specific extension", exampleUsage: "ext:env password" },
    { name: "In Title Operator", syntax: "intitle:", description: "Search for pages with a specific word in the title", exampleUsage: 'intitle:"admin panel"' },
    { name: "All In Title Operator", syntax: "allintitle:", description: "All search terms must appear in the page title", exampleUsage: "allintitle:admin login panel" },
    { name: "In URL Operator", syntax: "inurl:", description: "Search for URLs containing a specific string", exampleUsage: "inurl:api/v1/users" },
    { name: "All In URL Operator", syntax: "allinurl:", description: "All terms must appear in the URL", exampleUsage: "allinurl:admin login" },
    { name: "In Text Operator", syntax: "intext:", description: "Search for pages containing specific text", exampleUsage: 'intext:"password" filetype:log' },
    { name: "Cache Operator", syntax: "cache:", description: "Show the cached version of a page", exampleUsage: "cache:{domain}" },
    { name: "Related Operator", syntax: "related:", description: "Find sites similar to the specified URL", exampleUsage: "related:{domain}" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${ops.length} operators`);

  const plats = await db.insert(platformsTable).values([
    { name: "Google Search", slug: "google-search", platformType: "SEARCH_ENGINE", description: "The primary search engine for most dork patterns" },
    { name: "Bing", slug: "bing", platformType: "SEARCH_ENGINE", description: "Microsoft search engine" },
    { name: "Shodan", slug: "shodan", platformType: "SECURITY_TOOL", description: "Search engine for internet-connected devices" },
    { name: "Censys", slug: "censys", platformType: "SECURITY_TOOL", description: "Internet-wide scanning and search platform" },
    { name: "GitHub", slug: "github", platformType: "GENERAL", description: "Code repository platform" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${plats.length} platforms`);

  const tags = await db.insert(tagsTable).values([
    { name: "admin", slug: "admin", tagType: "TECHNIQUE" },
    { name: "login", slug: "login", tagType: "TECHNIQUE" },
    { name: "exposed", slug: "exposed", tagType: "STATUS" },
    { name: "credentials", slug: "credentials", tagType: "CATEGORY" },
    { name: "backup", slug: "backup", tagType: "TECHNIQUE" },
    { name: "api", slug: "api", tagType: "TECHNIQUE" },
    { name: "aws", slug: "aws", tagType: "PLATFORM" },
    { name: "azure", slug: "azure", tagType: "PLATFORM" },
    { name: "kubernetes", slug: "kubernetes", tagType: "PLATFORM" },
    { name: "docker", slug: "docker", tagType: "PLATFORM" },
    { name: "database", slug: "database", tagType: "CATEGORY" },
    { name: "configuration", slug: "configuration", tagType: "TECHNIQUE" },
    { name: "log-files", slug: "log-files", tagType: "TECHNIQUE" },
    { name: "environment", slug: "environment", tagType: "TECHNIQUE" },
    { name: "swagger", slug: "swagger", tagType: "TECHNIQUE" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${tags.length} tags`);

  await db.insert(sourcesTable).values([
    { name: "Security GitHub Repos", sourceType: "GITHUB", baseUrl: "https://github.com/topics/google-dorks", isActive: true },
    { name: "Security Research Blog Feed", sourceType: "RSS", baseUrl: "https://example.com/feed", isActive: true },
    { name: "Manual Submissions", sourceType: "MANUAL", isActive: true },
  ]).onConflictDoNothing();

  const allCats = await db.select().from(categoriesTable);
  const allOps = await db.select().from(operatorsTable);
  const allPlats = await db.select().from(platformsTable);
  const allTags = await db.select().from(tagsTable);

  const catMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));
  const opMap = Object.fromEntries(allOps.map(o => [o.syntax, o.id]));
  const platMap = Object.fromEntries(allPlats.map(p => [p.slug, p.id]));
  const tagMap = Object.fromEntries(allTags.map(t => [t.slug, t.id]));

  const dorkData = [
    {
      title: "Exposed Admin Panel Discovery",
      queryTemplate: 'intitle:"admin panel" site:{domain}',
      optimizedQuery: 'intitle:"admin panel" | intitle:"administration" site:{domain} -demo -test',
      description: "Discovers exposed administration interfaces on target domains. Use only on authorized systems.",
      usageContext: "Initial reconnaissance to identify admin surfaces during authorized assessments.",
      intentType: "ADMIN_ACCESS", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "web-security", operators: ["intitle:", "site:"], platforms: ["google-search"], tags: ["admin", "login"],
    },
    {
      title: "Environment File Exposure",
      queryTemplate: 'site:{domain} ext:env "DB_PASSWORD" OR "SECRET_KEY"',
      optimizedQuery: 'site:{domain} (ext:env | ext:cfg | ext:conf) ("DB_PASSWORD" | "SECRET_KEY" | "API_KEY" | "TOKEN")',
      description: "Finds accidentally exposed .env configuration files containing sensitive credentials.",
      usageContext: "DevSecOps audit to find exposed configuration files in web-accessible directories.",
      intentType: "CREDENTIAL_HARVESTING", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "devsecops", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["credentials", "environment", "exposed", "configuration"],
    },
    {
      title: "AWS S3 Bucket Discovery",
      queryTemplate: "site:{domain} \"s3.amazonaws.com\" | site:s3.amazonaws.com {organization}",
      optimizedQuery: 'site:s3.amazonaws.com "{organization}" | (site:{domain} inurl:s3.amazonaws.com)',
      description: "Locates publicly accessible S3 buckets associated with a target organization.",
      usageContext: "Cloud security assessment to discover exposed object storage resources.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "cloud-security", operators: ["site:"], platforms: ["google-search"], tags: ["aws", "exposed", "api"],
    },
    {
      title: "Swagger API Documentation Exposure",
      queryTemplate: "site:{domain} inurl:swagger OR inurl:api-docs",
      optimizedQuery: "site:{domain} (inurl:swagger | inurl:api-docs | inurl:swagger-ui | inurl:openapi) -github",
      description: "Finds exposed Swagger/OpenAPI documentation which may reveal undocumented API endpoints.",
      usageContext: "API security assessment to map exposed endpoint documentation.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "web-security", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["api", "swagger"],
    },
    {
      title: "Database Interface Exposure",
      queryTemplate: "intitle:\"phpMyAdmin\" site:{domain} | inurl:phpmyadmin site:{domain}",
      optimizedQuery: 'site:{domain} (intitle:"phpMyAdmin" | inurl:phpmyadmin | intitle:"Adminer" | intitle:"MongoDB")',
      description: "Detects exposed web-based database management interfaces.",
      usageContext: "Vulnerability discovery during authorized database security assessments.",
      intentType: "VULNERABILITY_DISCOVERY", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "data-exposure", operators: ["intitle:", "site:", "inurl:"], platforms: ["google-search"], tags: ["database", "admin", "exposed"],
    },
    {
      title: "Log File Exposure",
      queryTemplate: 'site:{domain} ext:log ("error" | "exception" | "fatal")',
      optimizedQuery: 'site:{domain} (ext:log | ext:logs) ("error" | "exception" | "fatal" | "stack trace" | "SQL") -help',
      description: "Finds exposed application log files that may contain sensitive debugging information.",
      usageContext: "Security audit for accidentally exposed log files with sensitive application data.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "web-security", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["log-files", "exposed"],
    },
    {
      title: "Backup File Discovery",
      queryTemplate: "site:{domain} ext:bak OR ext:backup OR ext:old",
      optimizedQuery: "site:{domain} (ext:bak | ext:backup | ext:old | ext:orig | ext:save | ext:tmp) -robots",
      description: "Locates backup files left in publicly accessible web directories.",
      usageContext: "Web application security testing to find forgotten backup files.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "web-security", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["backup", "exposed"],
    },
    {
      title: "Kubernetes Dashboard Exposure",
      queryTemplate: 'intitle:"Kubernetes Dashboard" inurl:{domain}',
      optimizedQuery: 'intitle:"Kubernetes Dashboard" | (inurl:8001 intitle:"Kubernetes") site:{domain}',
      description: "Discovers exposed Kubernetes management dashboards that could provide cluster access.",
      usageContext: "Cloud security assessment for unauthorized Kubernetes management interface exposure.",
      intentType: "ADMIN_ACCESS", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "cloud-security", operators: ["intitle:", "inurl:"], platforms: ["google-search"], tags: ["kubernetes", "admin", "exposed"],
    },
    {
      title: "Jupyter Notebook Exposure",
      queryTemplate: 'intitle:"Jupyter Notebook" inurl:{domain} -github',
      optimizedQuery: 'intitle:"Jupyter Notebook" site:{domain} -github.com -stackoverflow.com',
      description: "Finds publicly accessible Jupyter notebook servers that may contain ML models and data.",
      usageContext: "AI security reconnaissance for exposed data science infrastructure.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "ai-security", operators: ["intitle:", "inurl:"], platforms: ["google-search"], tags: ["api", "exposed"],
    },
    {
      title: "Git Repository Exposure",
      queryTemplate: 'site:{domain} inurl:"/.git" intitle:"Index of"',
      optimizedQuery: 'site:{domain} (inurl:"/.git/" | inurl:".git/config") (intitle:"Index of" | intitle:"Directory listing")',
      description: "Detects accidentally exposed Git repositories revealing source code and commit history.",
      usageContext: "Source code exposure assessment for unauthorized repository access.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "devsecops", operators: ["site:", "inurl:", "intitle:"], platforms: ["google-search"], tags: ["exposed", "credentials"],
    },
    {
      title: "SCADA HMI Interface Discovery",
      queryTemplate: 'intitle:"SCADA" | intitle:"HMI" intext:"control" site:{domain}',
      optimizedQuery: 'intitle:("SCADA" | "HMI" | "DCS" | "PLC") (intext:"control panel" | intext:"process control") site:{domain}',
      description: "Locates exposed SCADA and industrial control system interfaces on the internet.",
      usageContext: "ICS/OT security assessment for exposed industrial control systems.",
      intentType: "RECONNAISSANCE", difficulty: "EXPERT", sourceType: "MANUAL",
      categorySlug: "iot-ot-security", operators: ["intitle:", "intext:", "site:"], platforms: ["google-search"], tags: ["exposed", "admin"],
    },
    {
      title: "Docker Registry Exposure",
      queryTemplate: 'inurl:5000 intitle:"Docker Registry" site:{domain}',
      optimizedQuery: 'site:{domain} (inurl:5000 intitle:"Docker Registry" | inurl:"/v2/_catalog" | intitle:"Docker Registry UI")',
      description: "Finds exposed Docker container registries that may contain proprietary images.",
      usageContext: "Container security audit for unauthorized Docker registry access.",
      intentType: "RECONNAISSANCE", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "devsecops", operators: ["inurl:", "intitle:", "site:"], platforms: ["google-search"], tags: ["docker", "exposed"],
    },
    {
      title: "VPN Login Portal Discovery",
      queryTemplate: 'intitle:"VPN" inurl:login site:{domain}',
      optimizedQuery: 'site:{domain} (intitle:"VPN Login" | intitle:"Cisco AnyConnect" | intitle:"Pulse Secure" | intitle:"GlobalProtect")',
      description: "Identifies publicly accessible VPN login portals.",
      usageContext: "Network perimeter assessment for exposed remote access systems.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "network-security", operators: ["intitle:", "inurl:", "site:"], platforms: ["google-search"], tags: ["login", "exposed"],
    },
    {
      title: "Azure Storage Account Exposure",
      queryTemplate: 'site:{organization}.blob.core.windows.net | inurl:"blob.core.windows.net"',
      optimizedQuery: '(site:{organization}.blob.core.windows.net | site:{organization}.file.core.windows.net) -"<Error>"',
      description: "Discovers publicly accessible Azure Blob Storage containers.",
      usageContext: "Cloud security assessment for Azure storage exposure.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "cloud-security", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["azure", "exposed"],
    },
    {
      title: "CI/CD Pipeline Exposure",
      queryTemplate: 'intitle:"Jenkins" | intitle:"GitLab CI" site:{domain} inurl:login',
      optimizedQuery: 'site:{domain} (intitle:"Jenkins" | intitle:"GitLab" | intitle:"CircleCI" | intitle:"TeamCity") (inurl:login | inurl:dashboard)',
      description: "Finds exposed CI/CD pipeline dashboards that may contain build secrets and deployment credentials.",
      usageContext: "DevSecOps audit for unauthorized CI/CD infrastructure access.",
      intentType: "ADMIN_ACCESS", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "devsecops", operators: ["intitle:", "site:", "inurl:"], platforms: ["google-search"], tags: ["admin", "credentials", "configuration"],
    },
  ];

  let inserted = 0;
  for (const d of dorkData) {
    const catId = catMap[d.categorySlug];
    try {
      const [dork] = await db.insert(dorksTable).values({
        title: d.title, queryTemplate: d.queryTemplate, optimizedQuery: d.optimizedQuery,
        description: d.description, usageContext: d.usageContext,
        intentType: d.intentType, difficulty: d.difficulty, sourceType: d.sourceType,
        primaryCategoryId: catId, status: "PUBLISHED",
        viewsCount: Math.floor(Math.random() * 500),
        copyCount: Math.floor(Math.random() * 200),
      }).returning();

      await db.insert(dorkVersionsTable).values({
        dorkId: dork.id, queryTemplate: dork.queryTemplate,
        optimizedQuery: dork.optimizedQuery, description: dork.description,
        versionLabel: "v1.0", changeReason: "Initial creation",
      });

      for (const opSyntax of d.operators) {
        const opId = opMap[opSyntax];
        if (opId) await db.insert(dorkOperatorsTable).values({ dorkId: dork.id, operatorId: opId }).onConflictDoNothing();
      }
      for (const platSlug of d.platforms) {
        const platId = platMap[platSlug];
        if (platId) await db.insert(dorkPlatformsTable).values({ dorkId: dork.id, platformId: platId }).onConflictDoNothing();
      }
      for (const tagSlug of d.tags) {
        const tagId = tagMap[tagSlug];
        if (tagId) await db.insert(dorkTagsTable).values({ dorkId: dork.id, tagId }).onConflictDoNothing();
      }
      inserted++;
    } catch (e) {
      console.error("Error inserting:", d.title, e);
    }
  }
  console.log(`Inserted ${inserted} dorks`);
  console.log("Done!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
