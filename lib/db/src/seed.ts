import { db } from "./index.js";
import {
  categoriesTable, operatorsTable, platformsTable, tagsTable,
  sourcesTable, dorksTable, dorkTagsTable, dorkOperatorsTable,
  dorkPlatformsTable, dorkVersionsTable,
} from "./schema/index.js";

async function seed() {
  console.log("Seeding database...");

  // ── CATEGORIES ──────────────────────────────────────────────────────────────
  const topLevelCats = await db.insert(categoriesTable).values([
    { name: "Red Team", slug: "red-team", description: "Offensive security patterns for authorized penetration testing and attack surface mapping.", icon: "🔴", color: "#ef4444", depthLevel: 0, displayOrder: 1 },
    { name: "Blue Team", slug: "blue-team", description: "Defensive monitoring, threat hunting, and incident response dork patterns.", icon: "🔵", color: "#3b82f6", depthLevel: 0, displayOrder: 2 },
    { name: "Web Security", slug: "web-security", description: "Web application security dork patterns for finding exposed panels, login pages, and vulnerable endpoints.", icon: "🌐", color: "#00ffc8", depthLevel: 0, displayOrder: 3 },
    { name: "Network Security", slug: "network-security", description: "Network device, VPN, and infrastructure exposure patterns.", icon: "🔒", color: "#10b981", depthLevel: 0, displayOrder: 4 },
    { name: "Cloud Security", slug: "cloud-security", description: "Cloud infrastructure exposure patterns for AWS, Azure, GCP, and other cloud platforms.", icon: "☁️", color: "#6366f1", depthLevel: 0, displayOrder: 5 },
    { name: "AI Security", slug: "ai-security", description: "AI model endpoints, Jupyter notebooks, LLM apps, and ML infrastructure exposure patterns.", icon: "🤖", color: "#ec4899", depthLevel: 0, displayOrder: 6 },
    { name: "OSINT", slug: "osint", description: "Open source intelligence gathering patterns for people, organizations, and infrastructure.", icon: "🔍", color: "#8b5cf6", depthLevel: 0, displayOrder: 7 },
    { name: "Threat Intelligence", slug: "threat-intelligence", description: "IOC discovery, phishing research, malware infrastructure, and campaign tracking patterns.", icon: "🕵️", color: "#f97316", depthLevel: 0, displayOrder: 8 },
    { name: "Vulnerability Research", slug: "vulnerability-research", description: "CVE research, technology fingerprinting, version disclosure, and patch status patterns.", icon: "🔬", color: "#facc15", depthLevel: 0, displayOrder: 9 },
    { name: "Compliance and Audit", slug: "compliance-audit", description: "Data exposure, PII references, regulatory mapping, and evidence management patterns.", icon: "📋", color: "#a78bfa", depthLevel: 0, displayOrder: 10 },
    { name: "Digital Forensics", slug: "digital-forensics", description: "Leak investigation, compromise assessment, and evidence discovery patterns.", icon: "🔎", color: "#fb7185", depthLevel: 0, displayOrder: 11 },
    { name: "DevSecOps", slug: "devsecops", description: "CI/CD, configuration files, secrets, and developer infrastructure exposure patterns.", icon: "⚙️", color: "#f59e0b", depthLevel: 0, displayOrder: 12 },
    { name: "Identity and Access", slug: "identity-access", description: "Authentication surfaces, SSO portals, directory exposure, and cloud identity patterns.", icon: "🪪", color: "#34d399", depthLevel: 0, displayOrder: 13 },
    { name: "Mobile Security", slug: "mobile-security", description: "Mobile app discovery, APK references, Firebase, and mobile backend exposure patterns.", icon: "📱", color: "#60a5fa", depthLevel: 0, displayOrder: 14 },
    { name: "IoT and OT Security", slug: "iot-ot-security", description: "Internet of Things, SCADA, and industrial control system exposure patterns.", icon: "📡", color: "#f43f5e", depthLevel: 0, displayOrder: 15 },
    { name: "Data Exposure", slug: "data-exposure", description: "Database interfaces, data files, and sensitive information exposure patterns.", icon: "💾", color: "#fb923c", depthLevel: 0, displayOrder: 16 },
    { name: "Learning and Labs", slug: "learning-labs", description: "Beginner-friendly patterns, safe practice examples, CTF references, and defensive labs.", icon: "🎓", color: "#4ade80", depthLevel: 0, displayOrder: 17 },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${topLevelCats.length} top-level categories`);

  // Re-fetch all categories to get IDs for sub-category parent linking
  const allTopCats = await db.select().from(categoriesTable);
  const topMap = Object.fromEntries(allTopCats.map(c => [c.slug, c.id]));

  const subCats = await db.insert(categoriesTable).values([
    // Red Team subcategories
    { name: "Reconnaissance", slug: "recon", description: "Initial information gathering and footprinting patterns.", icon: "👁️", color: "#ef4444", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["red-team"] },
    { name: "Exposed Login Panels", slug: "exposed-login-panels", description: "Discovering externally accessible login and authentication interfaces.", icon: "🚪", color: "#ef4444", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["red-team"] },
    { name: "Public Documents", slug: "public-documents", description: "Finding inadvertently published internal documents and reports.", icon: "📄", color: "#ef4444", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["red-team"] },
    { name: "Attack Surface Mapping", slug: "attack-surface", description: "Comprehensively enumerating externally accessible assets and services.", icon: "🗺️", color: "#ef4444", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["red-team"] },
    { name: "Technology Fingerprinting", slug: "tech-fingerprinting", description: "Identifying software versions, frameworks, and underlying technologies.", icon: "🧬", color: "#ef4444", depthLevel: 1, displayOrder: 5, parentCategoryId: topMap["red-team"] },
    // Blue Team subcategories
    { name: "Exposure Monitoring", slug: "exposure-monitoring", description: "Continuously monitoring for newly exposed sensitive assets.", icon: "👀", color: "#3b82f6", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["blue-team"] },
    { name: "Threat Hunting", slug: "threat-hunting", description: "Proactively searching for threat indicators and attacker infrastructure.", icon: "🎯", color: "#3b82f6", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["blue-team"] },
    { name: "Brand Protection", slug: "brand-protection", description: "Detecting impersonation, typosquatting, and brand abuse.", icon: "🛡️", color: "#3b82f6", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["blue-team"] },
    { name: "Incident Response", slug: "incident-response", description: "Dork patterns for active incident investigation and scoping.", icon: "🚨", color: "#3b82f6", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["blue-team"] },
    // Web Security subcategories
    { name: "Admin Panels", slug: "admin-panels", description: "Discovering exposed web administration interfaces.", icon: "🖥️", color: "#00ffc8", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["web-security"] },
    { name: "API Endpoints", slug: "api-endpoints", description: "Finding exposed REST, GraphQL, and OpenAPI endpoints.", icon: "🔌", color: "#00ffc8", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["web-security"] },
    { name: "File Exposure", slug: "file-exposure", description: "Locating backup, config, and log files in web directories.", icon: "📁", color: "#00ffc8", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["web-security"] },
    { name: "Framework Specific", slug: "framework-specific", description: "Technology-specific dork patterns for WordPress, Laravel, Django, etc.", icon: "🧱", color: "#00ffc8", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["web-security"] },
    { name: "Dev Environments", slug: "dev-environments", description: "Staging, development, and test environments left publicly accessible.", icon: "🧪", color: "#00ffc8", depthLevel: 1, displayOrder: 5, parentCategoryId: topMap["web-security"] },
    // Cloud Security subcategories
    { name: "AWS", slug: "aws", description: "Amazon Web Services asset and configuration exposure patterns.", icon: "🟠", color: "#6366f1", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["cloud-security"] },
    { name: "Azure", slug: "azure", description: "Microsoft Azure storage, AD, and service exposure patterns.", icon: "🔷", color: "#6366f1", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["cloud-security"] },
    { name: "Google Cloud", slug: "gcp", description: "Google Cloud Storage, Firebase, and Cloud Run exposure patterns.", icon: "🔴", color: "#6366f1", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["cloud-security"] },
    { name: "Kubernetes", slug: "kubernetes", description: "Kubernetes dashboard, kubeconfig, and cluster exposure patterns.", icon: "☸️", color: "#6366f1", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["cloud-security"] },
    { name: "SaaS Security", slug: "saas-security", description: "Public Notion, Trello, Jira, and other SaaS exposure patterns.", icon: "🧩", color: "#6366f1", depthLevel: 1, displayOrder: 5, parentCategoryId: topMap["cloud-security"] },
    // AI Security subcategories
    { name: "AI Asset Discovery", slug: "ai-asset-discovery", description: "Public AI applications, chatbot interfaces, and API gateways.", icon: "🔮", color: "#ec4899", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["ai-security"] },
    { name: "LLM Application Security", slug: "llm-security", description: "Prompt injection research, system prompt exposure, and plugin surfaces.", icon: "💬", color: "#ec4899", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["ai-security"] },
    { name: "Model and Dataset Exposure", slug: "model-dataset-exposure", description: "Public model files, dataset references, and training data leakage indicators.", icon: "📊", color: "#ec4899", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["ai-security"] },
    { name: "AI Infrastructure", slug: "ai-infrastructure", description: "Jupyter notebooks, MLflow, TensorBoard, and GPU monitoring panels.", icon: "🖥️", color: "#ec4899", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["ai-security"] },
    // OSINT subcategories
    { name: "Organization Research", slug: "org-research", description: "Domains, subsidiaries, acquisitions, and public contacts.", icon: "🏢", color: "#8b5cf6", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["osint"] },
    { name: "People Research", slug: "people-research", description: "Employee profiles, public resumes, and conference talks.", icon: "👤", color: "#8b5cf6", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["osint"] },
    { name: "Document Intelligence", slug: "document-intelligence", description: "PDFs, spreadsheets, presentations, and their metadata.", icon: "📑", color: "#8b5cf6", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["osint"] },
    { name: "Code Intelligence", slug: "code-intelligence", description: "Public repositories, package metadata, and commit references.", icon: "💻", color: "#8b5cf6", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["osint"] },
    // DevSecOps subcategories
    { name: "Source Code Exposure", slug: "source-code-exposure", description: "Public repositories, commit history, and configuration files.", icon: "📦", color: "#f59e0b", depthLevel: 1, displayOrder: 1, parentCategoryId: topMap["devsecops"] },
    { name: "CI/CD Security", slug: "cicd-security", description: "Build logs, pipeline configs, runner references, and deployment artifacts.", icon: "🔧", color: "#f59e0b", depthLevel: 1, displayOrder: 2, parentCategoryId: topMap["devsecops"] },
    { name: "Secrets Management", slug: "secrets-management", description: "Token indicators, environment variable references, and key file exposure.", icon: "🔑", color: "#f59e0b", depthLevel: 1, displayOrder: 3, parentCategoryId: topMap["devsecops"] },
    { name: "Container Security", slug: "container-security", description: "Dockerfiles, container registries, and Kubernetes manifests.", icon: "📦", color: "#f59e0b", depthLevel: 1, displayOrder: 4, parentCategoryId: topMap["devsecops"] },
    { name: "Infrastructure as Code", slug: "iac-security", description: "Terraform, CloudFormation, Ansible, and Helm chart exposure.", icon: "🏗️", color: "#f59e0b", depthLevel: 1, displayOrder: 5, parentCategoryId: topMap["devsecops"] },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${subCats.length} sub-categories`);

  // ── OPERATORS ────────────────────────────────────────────────────────────────
  const ops = await db.insert(operatorsTable).values([
    { name: "Site Operator", syntax: "site:", description: "Restrict results to a specific domain or subdomain", exampleUsage: "site:{domain} login" },
    { name: "Filetype Operator", syntax: "filetype:", description: "Find files of a specific type", exampleUsage: "filetype:pdf confidential" },
    { name: "Extension Operator", syntax: "ext:", description: "Search for files with a specific extension", exampleUsage: "ext:env password" },
    { name: "In Title Operator", syntax: "intitle:", description: "Search for pages with a specific word in the title", exampleUsage: 'intitle:"admin panel"' },
    { name: "All In Title Operator", syntax: "allintitle:", description: "All search terms must appear in the page title", exampleUsage: "allintitle:admin login panel" },
    { name: "In URL Operator", syntax: "inurl:", description: "Search for URLs containing a specific string", exampleUsage: "inurl:api/v1/users" },
    { name: "All In URL Operator", syntax: "allinurl:", description: "All terms must appear in the URL", exampleUsage: "allinurl:admin login" },
    { name: "In Text Operator", syntax: "intext:", description: "Search for pages containing specific text", exampleUsage: 'intext:"password" filetype:log' },
    { name: "All In Text Operator", syntax: "allintext:", description: "All terms must appear in the page body", exampleUsage: 'allintext:username password email' },
    { name: "Cache Operator", syntax: "cache:", description: "Show the cached version of a page", exampleUsage: "cache:{domain}" },
    { name: "Related Operator", syntax: "related:", description: "Find sites similar to the specified URL", exampleUsage: "related:{domain}" },
    { name: "Before Operator", syntax: "before:", description: "Limit results to pages indexed before a date", exampleUsage: "before:2023-01-01 site:{domain}" },
    { name: "After Operator", syntax: "after:", description: "Limit results to pages indexed after a date", exampleUsage: "after:2024-01-01 site:{domain}" },
    { name: "Info Operator", syntax: "info:", description: "Show information Google has about a URL", exampleUsage: "info:{domain}" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${ops.length} operators`);

  // ── PLATFORMS ────────────────────────────────────────────────────────────────
  const plats = await db.insert(platformsTable).values([
    { name: "Google Search", slug: "google-search", platformType: "SEARCH_ENGINE", description: "The primary search engine for most dork patterns" },
    { name: "Bing", slug: "bing", platformType: "SEARCH_ENGINE", description: "Microsoft search engine supporting similar operators" },
    { name: "Shodan", slug: "shodan", platformType: "SECURITY_TOOL", description: "Search engine for internet-connected devices and banners" },
    { name: "Censys", slug: "censys", platformType: "SECURITY_TOOL", description: "Internet-wide scanning and certificate search platform" },
    { name: "GitHub", slug: "github", platformType: "GENERAL", description: "Code repository and collaboration platform" },
    { name: "AWS", slug: "aws", platformType: "CLOUD", description: "Amazon Web Services cloud infrastructure" },
    { name: "Azure", slug: "azure", platformType: "CLOUD", description: "Microsoft Azure cloud platform" },
    { name: "Google Cloud", slug: "gcp", platformType: "CLOUD", description: "Google Cloud Platform services" },
    { name: "Kubernetes", slug: "kubernetes", platformType: "INFRASTRUCTURE", description: "Container orchestration platform" },
    { name: "WordPress", slug: "wordpress", platformType: "CMS", description: "Most widely used content management system" },
    { name: "Jira", slug: "jira", platformType: "SAAS", description: "Atlassian project tracking platform" },
    { name: "Notion", slug: "notion", platformType: "SAAS", description: "Collaborative workspace and note-taking platform" },
    { name: "Firebase", slug: "firebase", platformType: "CLOUD", description: "Google Firebase backend-as-a-service platform" },
    { name: "Hugging Face", slug: "huggingface", platformType: "AI_PLATFORM", description: "AI model and dataset hosting platform" },
    { name: "Jupyter", slug: "jupyter", platformType: "AI_PLATFORM", description: "Interactive notebook environment for data science" },
    { name: "MLflow", slug: "mlflow", platformType: "AI_PLATFORM", description: "ML experiment tracking and model registry platform" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${plats.length} platforms`);

  // ── TAGS ─────────────────────────────────────────────────────────────────────
  const tags = await db.insert(tagsTable).values([
    { name: "admin", slug: "admin", tagType: "TECHNIQUE" },
    { name: "login", slug: "login", tagType: "TECHNIQUE" },
    { name: "exposed", slug: "exposed", tagType: "STATUS" },
    { name: "credentials", slug: "credentials", tagType: "CATEGORY" },
    { name: "backup", slug: "backup", tagType: "TECHNIQUE" },
    { name: "api", slug: "api", tagType: "TECHNIQUE" },
    { name: "aws", slug: "aws", tagType: "PLATFORM" },
    { name: "azure", slug: "azure", tagType: "PLATFORM" },
    { name: "gcp", slug: "gcp", tagType: "PLATFORM" },
    { name: "kubernetes", slug: "kubernetes", tagType: "PLATFORM" },
    { name: "docker", slug: "docker", tagType: "PLATFORM" },
    { name: "database", slug: "database", tagType: "CATEGORY" },
    { name: "configuration", slug: "configuration", tagType: "TECHNIQUE" },
    { name: "log-files", slug: "log-files", tagType: "TECHNIQUE" },
    { name: "environment", slug: "environment", tagType: "TECHNIQUE" },
    { name: "swagger", slug: "swagger", tagType: "TECHNIQUE" },
    { name: "graphql", slug: "graphql", tagType: "TECHNIQUE" },
    { name: "wordpress", slug: "wordpress", tagType: "PLATFORM" },
    { name: "firebase", slug: "firebase", tagType: "PLATFORM" },
    { name: "jupyter", slug: "jupyter", tagType: "PLATFORM" },
    { name: "llm", slug: "llm", tagType: "TECHNIQUE" },
    { name: "osint", slug: "osint", tagType: "CATEGORY" },
    { name: "phishing", slug: "phishing", tagType: "THREAT" },
    { name: "iot", slug: "iot", tagType: "CATEGORY" },
    { name: "scada", slug: "scada", tagType: "CATEGORY" },
    { name: "vpn", slug: "vpn", tagType: "TECHNIQUE" },
    { name: "git", slug: "git", tagType: "TECHNIQUE" },
    { name: "cicd", slug: "cicd", tagType: "TECHNIQUE" },
    { name: "terraform", slug: "terraform", tagType: "TECHNIQUE" },
    { name: "pii", slug: "pii", tagType: "CATEGORY" },
    { name: "reconnaissance", slug: "reconnaissance", tagType: "TECHNIQUE" },
    { name: "subdomain", slug: "subdomain", tagType: "TECHNIQUE" },
    { name: "mobile", slug: "mobile", tagType: "CATEGORY" },
    { name: "sso", slug: "sso", tagType: "TECHNIQUE" },
    { name: "s3", slug: "s3", tagType: "PLATFORM" },
    { name: "blob-storage", slug: "blob-storage", tagType: "PLATFORM" },
    { name: "mlflow", slug: "mlflow", tagType: "PLATFORM" },
    { name: "huggingface", slug: "huggingface", tagType: "PLATFORM" },
    { name: "beginner", slug: "beginner", tagType: "DIFFICULTY" },
    { name: "advanced", slug: "advanced", tagType: "DIFFICULTY" },
    { name: "pdf", slug: "pdf", tagType: "TECHNIQUE" },
    { name: "spreadsheet", slug: "spreadsheet", tagType: "TECHNIQUE" },
    { name: "email", slug: "email", tagType: "TECHNIQUE" },
    { name: "network", slug: "network", tagType: "CATEGORY" },
    { name: "staging", slug: "staging", tagType: "TECHNIQUE" },
    { name: "token", slug: "token", tagType: "TECHNIQUE" },
  ]).returning().onConflictDoNothing();
  console.log(`Inserted ${tags.length} tags`);

  // ── SOURCES ──────────────────────────────────────────────────────────────────
  await db.insert(sourcesTable).values([
    { name: "Google Programmable Search", sourceType: "MANUAL", baseUrl: "https://www.googleapis.com/customsearch/v1", isActive: true },
    { name: "GitHub Public Search", sourceType: "GITHUB", baseUrl: "https://api.github.com/search/code", isActive: true },
    { name: "Medium RSS", sourceType: "RSS", baseUrl: "https://medium.com/feed/tag/cybersecurity", isActive: true },
    { name: "Security Blog RSS", sourceType: "RSS", baseUrl: "https://feeds.feedburner.com/KitPloit", isActive: true },
    { name: "Manual Submission", sourceType: "MANUAL", isActive: true },
  ]).onConflictDoNothing();

  // ── DORKS ────────────────────────────────────────────────────────────────────
  const allCats = await db.select().from(categoriesTable);
  const allOps = await db.select().from(operatorsTable);
  const allPlats = await db.select().from(platformsTable);
  const allTags = await db.select().from(tagsTable);

  const catMap = Object.fromEntries(allCats.map(c => [c.slug, c.id]));
  const opMap = Object.fromEntries(allOps.map(o => [o.syntax, o.id]));
  const platMap = Object.fromEntries(allPlats.map(p => [p.slug, p.id]));
  const tagMap = Object.fromEntries(allTags.map(t => [t.slug, t.id]));

  const dorkData = [
    // ── WEB SECURITY ─────────────────────────────────────────────────────────
    {
      title: "Exposed Admin Panel Discovery",
      queryTemplate: 'intitle:"admin panel" site:{domain}',
      optimizedQuery: 'intitle:"admin panel" | intitle:"administration" site:{domain} -demo -test',
      description: "Discovers exposed administration interfaces on target domains. Use only on authorized systems.",
      usageContext: "Initial reconnaissance to identify admin surfaces during authorized assessments.",
      intentType: "ADMIN_ACCESS", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "web-security", operators: ["intitle:", "site:"], platforms: ["google-search"], tags: ["admin", "login", "beginner"],
    },
    {
      title: "Swagger API Documentation Exposure",
      queryTemplate: "site:{domain} inurl:swagger OR inurl:api-docs",
      optimizedQuery: "site:{domain} (inurl:swagger | inurl:api-docs | inurl:swagger-ui | inurl:openapi) -github",
      description: "Finds exposed Swagger/OpenAPI documentation which may reveal undocumented API endpoints.",
      usageContext: "API security assessment to map exposed endpoint documentation.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "api-endpoints", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["api", "swagger", "beginner"],
    },
    {
      title: "Log File Exposure",
      queryTemplate: 'site:{domain} ext:log ("error" | "exception" | "fatal")',
      optimizedQuery: 'site:{domain} (ext:log | ext:logs) ("error" | "exception" | "fatal" | "stack trace" | "SQL") -help',
      description: "Finds exposed application log files that may contain sensitive debugging information.",
      usageContext: "Security audit for accidentally exposed log files with sensitive application data.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "file-exposure", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["log-files", "exposed"],
    },
    {
      title: "Backup File Discovery",
      queryTemplate: "site:{domain} ext:bak OR ext:backup OR ext:old",
      optimizedQuery: "site:{domain} (ext:bak | ext:backup | ext:old | ext:orig | ext:save | ext:tmp) -robots",
      description: "Locates backup files left in publicly accessible web directories.",
      usageContext: "Web application security testing to find forgotten backup files.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "file-exposure", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["backup", "exposed", "beginner"],
    },
    {
      title: "WordPress Login Page Discovery",
      queryTemplate: 'site:{domain} inurl:wp-login.php',
      optimizedQuery: 'site:{domain} (inurl:wp-login.php | inurl:wp-admin) -demo',
      description: "Finds WordPress login and admin interfaces which are common attack targets.",
      usageContext: "CMS security audit for exposed WordPress installations.",
      intentType: "ADMIN_ACCESS", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "framework-specific", operators: ["site:", "inurl:"], platforms: ["google-search", "wordpress"], tags: ["wordpress", "login", "admin"],
    },
    {
      title: "GraphQL Endpoint Discovery",
      queryTemplate: 'site:{domain} inurl:graphql | inurl:graphiql',
      optimizedQuery: 'site:{domain} (inurl:graphql | inurl:graphiql | inurl:/api/graphql) -github -docs',
      description: "Locates exposed GraphQL endpoints and interactive GraphiQL explorers.",
      usageContext: "API security assessment for introspection-enabled GraphQL services.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "api-endpoints", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["graphql", "api", "exposed"],
    },
    {
      title: "Staging and Dev Environment Discovery",
      queryTemplate: 'site:{domain} (inurl:staging | inurl:dev | inurl:test | inurl:uat)',
      optimizedQuery: 'site:{domain} (inurl:staging | inurl:dev | inurl:test | inurl:uat | inurl:sandbox) -github',
      description: "Identifies development, staging, and UAT environments that may have weaker security controls.",
      usageContext: "Pre-engagement recon to identify non-production systems on the attack surface.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "dev-environments", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["staging", "exposed", "reconnaissance"],
    },
    {
      title: "Directory Listing Discovery",
      queryTemplate: 'intitle:"Index of" site:{domain}',
      optimizedQuery: 'site:{domain} intitle:"Index of" (inurl:backup | inurl:upload | inurl:files | inurl:data)',
      description: "Finds web servers with directory listing enabled, potentially exposing file trees.",
      usageContext: "Web server configuration review to identify directory browsing vulnerabilities.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "file-exposure", operators: ["intitle:", "site:", "inurl:"], platforms: ["google-search"], tags: ["exposed", "backup", "beginner"],
    },
    // ── CLOUD SECURITY ───────────────────────────────────────────────────────
    {
      title: "AWS S3 Bucket Discovery",
      queryTemplate: 'site:s3.amazonaws.com "{organization}"',
      optimizedQuery: 'site:s3.amazonaws.com "{organization}" | (site:{domain} inurl:s3.amazonaws.com)',
      description: "Locates publicly accessible S3 buckets associated with a target organization.",
      usageContext: "Cloud security assessment to discover exposed object storage resources.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "aws", operators: ["site:"], platforms: ["google-search", "aws"], tags: ["aws", "s3", "exposed"],
    },
    {
      title: "Azure Blob Storage Exposure",
      queryTemplate: 'site:{organization}.blob.core.windows.net',
      optimizedQuery: '(site:{organization}.blob.core.windows.net | site:{organization}.file.core.windows.net) -"<Error>"',
      description: "Discovers publicly accessible Azure Blob Storage containers.",
      usageContext: "Cloud security assessment for Azure storage exposure.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "azure", operators: ["site:"], platforms: ["google-search", "azure"], tags: ["azure", "blob-storage", "exposed"],
    },
    {
      title: "Kubernetes Dashboard Exposure",
      queryTemplate: 'intitle:"Kubernetes Dashboard" inurl:{domain}',
      optimizedQuery: 'intitle:"Kubernetes Dashboard" | (inurl:8001 intitle:"Kubernetes") site:{domain}',
      description: "Discovers exposed Kubernetes management dashboards that could provide cluster access.",
      usageContext: "Cloud security assessment for unauthorized Kubernetes management interface exposure.",
      intentType: "ADMIN_ACCESS", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "kubernetes", operators: ["intitle:", "inurl:"], platforms: ["google-search", "kubernetes"], tags: ["kubernetes", "admin", "exposed", "advanced"],
    },
    {
      title: "Firebase Database Exposure",
      queryTemplate: 'site:{organization}.firebaseio.com',
      optimizedQuery: 'site:{organization}.firebaseio.com -"Permission denied" -"null"',
      description: "Finds publicly accessible Firebase real-time databases that may expose application data.",
      usageContext: "Mobile and web app security assessment for misconfigured Firebase databases.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "gcp", operators: ["site:"], platforms: ["google-search", "firebase"], tags: ["firebase", "exposed", "database"],
    },
    {
      title: "Public Notion Pages Discovery",
      queryTemplate: 'site:notion.so "{company}" (confidential | internal | private)',
      optimizedQuery: 'site:notion.so "{company}" (confidential | internal | "do not share" | "internal only")',
      description: "Finds public Notion pages from organizations that may contain sensitive internal information.",
      usageContext: "SaaS security review to discover accidentally shared internal documentation.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "saas-security", operators: ["site:"], platforms: ["google-search", "notion"], tags: ["exposed", "osint", "pii"],
    },
    {
      title: "Google Cloud Storage Bucket Discovery",
      queryTemplate: 'site:storage.googleapis.com "{organization}"',
      optimizedQuery: 'site:storage.googleapis.com "{organization}" | (site:{domain} inurl:storage.googleapis.com)',
      description: "Discovers publicly accessible Google Cloud Storage buckets for a target organization.",
      usageContext: "GCP cloud security assessment for exposed storage resources.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "gcp", operators: ["site:"], platforms: ["google-search", "gcp"], tags: ["gcp", "exposed", "s3"],
    },
    // ── DEVSECOPS ────────────────────────────────────────────────────────────
    {
      title: "Environment File Exposure",
      queryTemplate: 'site:{domain} ext:env "DB_PASSWORD" OR "SECRET_KEY"',
      optimizedQuery: 'site:{domain} (ext:env | ext:cfg | ext:conf) ("DB_PASSWORD" | "SECRET_KEY" | "API_KEY" | "TOKEN")',
      description: "Finds accidentally exposed .env configuration files containing sensitive credentials.",
      usageContext: "DevSecOps audit to find exposed configuration files in web-accessible directories.",
      intentType: "CREDENTIAL_HARVESTING", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "secrets-management", operators: ["site:", "ext:"], platforms: ["google-search"], tags: ["credentials", "environment", "exposed", "configuration"],
    },
    {
      title: "Git Repository Exposure",
      queryTemplate: 'site:{domain} inurl:"/.git" intitle:"Index of"',
      optimizedQuery: 'site:{domain} (inurl:"/.git/" | inurl:".git/config") (intitle:"Index of" | intitle:"Directory listing")',
      description: "Detects accidentally exposed Git repositories revealing source code and commit history.",
      usageContext: "Source code exposure assessment for unauthorized repository access.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "source-code-exposure", operators: ["site:", "inurl:", "intitle:"], platforms: ["google-search", "github"], tags: ["git", "exposed", "credentials"],
    },
    {
      title: "CI/CD Pipeline Exposure",
      queryTemplate: 'intitle:"Jenkins" | intitle:"GitLab CI" site:{domain} inurl:login',
      optimizedQuery: 'site:{domain} (intitle:"Jenkins" | intitle:"GitLab" | intitle:"CircleCI" | intitle:"TeamCity") (inurl:login | inurl:dashboard)',
      description: "Finds exposed CI/CD pipeline dashboards that may contain build secrets and deployment credentials.",
      usageContext: "DevSecOps audit for unauthorized CI/CD infrastructure access.",
      intentType: "ADMIN_ACCESS", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "cicd-security", operators: ["intitle:", "site:", "inurl:"], platforms: ["google-search", "github"], tags: ["admin", "credentials", "configuration", "cicd", "advanced"],
    },
    {
      title: "Docker Registry Exposure",
      queryTemplate: 'inurl:5000 intitle:"Docker Registry" site:{domain}',
      optimizedQuery: 'site:{domain} (inurl:5000 intitle:"Docker Registry" | inurl:"/v2/_catalog" | intitle:"Docker Registry UI")',
      description: "Finds exposed Docker container registries that may contain proprietary images.",
      usageContext: "Container security audit for unauthorized Docker registry access.",
      intentType: "RECONNAISSANCE", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "container-security", operators: ["inurl:", "intitle:", "site:"], platforms: ["google-search"], tags: ["docker", "exposed", "advanced"],
    },
    {
      title: "Terraform State File Exposure",
      queryTemplate: 'site:{domain} inurl:"terraform.tfstate"',
      optimizedQuery: 'site:{domain} (inurl:terraform.tfstate | inurl:".tfstate") (intitle:"Index of" | intext:"aws_access_key")',
      description: "Locates accidentally exposed Terraform state files which may contain infrastructure secrets.",
      usageContext: "IaC security review for exposed infrastructure configuration and credentials.",
      intentType: "CREDENTIAL_HARVESTING", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "iac-security", operators: ["site:", "inurl:", "intext:"], platforms: ["google-search", "aws"], tags: ["terraform", "credentials", "configuration", "advanced"],
    },
    // ── AI SECURITY ──────────────────────────────────────────────────────────
    {
      title: "Jupyter Notebook Exposure",
      queryTemplate: 'intitle:"Jupyter Notebook" inurl:{domain} -github',
      optimizedQuery: 'intitle:"Jupyter Notebook" site:{domain} -github.com -stackoverflow.com',
      description: "Finds publicly accessible Jupyter notebook servers that may contain ML models and sensitive data.",
      usageContext: "AI security reconnaissance for exposed data science infrastructure.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "ai-infrastructure", operators: ["intitle:", "inurl:"], platforms: ["google-search", "jupyter"], tags: ["jupyter", "exposed", "api"],
    },
    {
      title: "MLflow Dashboard Exposure",
      queryTemplate: 'intitle:"MLflow" inurl:{domain} intext:"Experiments"',
      optimizedQuery: 'site:{domain} intitle:"MLflow" (intext:"Experiments" | intext:"Models" | intext:"Runs")',
      description: "Discovers exposed MLflow experiment tracking dashboards containing model metadata and metrics.",
      usageContext: "AI security assessment for accessible ML experiment tracking platforms.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "ai-infrastructure", operators: ["intitle:", "inurl:", "intext:"], platforms: ["google-search", "mlflow"], tags: ["mlflow", "exposed", "api"],
    },
    {
      title: "Public Hugging Face Model Discovery",
      queryTemplate: 'site:huggingface.co "{organization}" (model | dataset)',
      optimizedQuery: 'site:huggingface.co "{organization}" (model | dataset | "fine-tuned" | "private")',
      description: "Finds public Hugging Face models and datasets associated with a target organization.",
      usageContext: "AI supply chain and model exposure assessment.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "model-dataset-exposure", operators: ["site:"], platforms: ["google-search", "huggingface"], tags: ["huggingface", "llm", "osint"],
    },
    {
      title: "OpenAI-Compatible API Gateway Discovery",
      queryTemplate: 'site:{domain} inurl:"/v1/chat/completions" | inurl:"/v1/completions"',
      optimizedQuery: 'site:{domain} (inurl:"/v1/chat/completions" | inurl:"/v1/completions" | inurl:"/v1/models") -openai.com',
      description: "Finds exposed OpenAI-compatible API gateways and proxy endpoints for LLM services.",
      usageContext: "AI security audit for publicly accessible LLM API endpoints.",
      intentType: "RECONNAISSANCE", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "ai-asset-discovery", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["llm", "api", "exposed", "advanced"],
    },
    {
      title: "TensorBoard Dashboard Exposure",
      queryTemplate: 'intitle:"TensorBoard" site:{domain}',
      optimizedQuery: 'site:{domain} intitle:"TensorBoard" (intext:"scalars" | intext:"graphs" | intext:"distributions")',
      description: "Finds exposed TensorBoard visualization dashboards with model training metrics.",
      usageContext: "AI infrastructure security audit for exposed ML training dashboards.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "ai-infrastructure", operators: ["intitle:", "site:"], platforms: ["google-search"], tags: ["exposed", "api", "mlflow"],
    },
    // ── NETWORK SECURITY ─────────────────────────────────────────────────────
    {
      title: "VPN Login Portal Discovery",
      queryTemplate: 'intitle:"VPN" inurl:login site:{domain}',
      optimizedQuery: 'site:{domain} (intitle:"VPN Login" | intitle:"Cisco AnyConnect" | intitle:"Pulse Secure" | intitle:"GlobalProtect")',
      description: "Identifies publicly accessible VPN login portals.",
      usageContext: "Network perimeter assessment for exposed remote access systems.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "network-security", operators: ["intitle:", "inurl:", "site:"], platforms: ["google-search"], tags: ["vpn", "login", "exposed", "beginner"],
    },
    {
      title: "RDP and Remote Access Portal Discovery",
      queryTemplate: 'intitle:"Remote Desktop Web Access" site:{domain}',
      optimizedQuery: 'site:{domain} (intitle:"Remote Desktop Web Access" | intitle:"Terminal Services" | intitle:"Guacamole")',
      description: "Finds exposed Remote Desktop Protocol web portals and remote access gateways.",
      usageContext: "Perimeter security assessment for externally accessible RDP services.",
      intentType: "ADMIN_ACCESS", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "network-security", operators: ["intitle:", "site:"], platforms: ["google-search"], tags: ["exposed", "login", "network"],
    },
    {
      title: "Router and Firewall Admin Interface",
      queryTemplate: 'intitle:"router" | intitle:"firewall" inurl:login site:{domain}',
      optimizedQuery: 'site:{domain} (intitle:"pfSense" | intitle:"Fortinet" | intitle:"Cisco ASA" | intitle:"SonicWall") (inurl:login | inurl:admin)',
      description: "Discovers publicly accessible network device management interfaces.",
      usageContext: "Network security audit for exposed firewall and router administration panels.",
      intentType: "ADMIN_ACCESS", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "network-security", operators: ["intitle:", "inurl:", "site:"], platforms: ["google-search"], tags: ["admin", "network", "login"],
    },
    // ── DATA EXPOSURE ────────────────────────────────────────────────────────
    {
      title: "Database Interface Exposure",
      queryTemplate: 'intitle:"phpMyAdmin" site:{domain} | inurl:phpmyadmin site:{domain}',
      optimizedQuery: 'site:{domain} (intitle:"phpMyAdmin" | inurl:phpmyadmin | intitle:"Adminer" | intitle:"MongoDB")',
      description: "Detects exposed web-based database management interfaces.",
      usageContext: "Vulnerability discovery during authorized database security assessments.",
      intentType: "VULNERABILITY_DISCOVERY", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "data-exposure", operators: ["intitle:", "site:", "inurl:"], platforms: ["google-search"], tags: ["database", "admin", "exposed"],
    },
    {
      title: "Exposed Excel and CSV Data Files",
      queryTemplate: 'site:{domain} filetype:xlsx | filetype:csv "email" | "password" | "confidential"',
      optimizedQuery: 'site:{domain} (filetype:xlsx | filetype:xls | filetype:csv) ("email" | "password" | "phone" | "confidential" | "internal")',
      description: "Finds publicly accessible spreadsheet files that may contain sensitive data.",
      usageContext: "Data exposure assessment to locate inadvertently shared spreadsheets.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "data-exposure", operators: ["site:", "filetype:"], platforms: ["google-search"], tags: ["spreadsheet", "pii", "exposed", "beginner"],
    },
    {
      title: "Elasticsearch Instance Discovery",
      queryTemplate: 'inurl:9200 intitle:"Elasticsearch" site:{domain}',
      optimizedQuery: 'site:{domain} (inurl:9200 | inurl:9243) intitle:"Elasticsearch" (intext:"_cat" | intext:"_cluster")',
      description: "Discovers exposed Elasticsearch instances that may be accessible without authentication.",
      usageContext: "Database security audit for unauthenticated search engine access.",
      intentType: "DATA_EXPOSURE", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "data-exposure", operators: ["inurl:", "intitle:", "site:"], platforms: ["google-search"], tags: ["database", "exposed", "api", "advanced"],
    },
    // ── OSINT ────────────────────────────────────────────────────────────────
    {
      title: "Organization PDF Document Discovery",
      queryTemplate: 'site:{domain} filetype:pdf "confidential" | "internal use only"',
      optimizedQuery: 'site:{domain} filetype:pdf ("confidential" | "internal use only" | "do not distribute" | "proprietary")',
      description: "Finds PDF documents marked confidential that are publicly indexed by search engines.",
      usageContext: "OSINT investigation to discover inadvertently published sensitive documents.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "document-intelligence", operators: ["site:", "filetype:"], platforms: ["google-search"], tags: ["pdf", "osint", "pii", "beginner"],
    },
    {
      title: "Employee LinkedIn Profile OSINT",
      queryTemplate: 'site:linkedin.com/in "{company}" ("{job_title}" | "{department}")',
      optimizedQuery: 'site:linkedin.com/in "{company}" ("{job_title}" | "engineer" | "developer" | "security")',
      description: "Finds employee LinkedIn profiles associated with a target organization for footprinting.",
      usageContext: "Authorized red team OSINT to map organizational structure and staff.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "people-research", operators: ["site:"], platforms: ["google-search"], tags: ["osint", "reconnaissance", "email", "beginner"],
    },
    {
      title: "GitHub Organization Repository Discovery",
      queryTemplate: 'site:github.com "{organization}" (password | secret | token | key)',
      optimizedQuery: 'site:github.com "{organization}" (intext:password | intext:secret | intext:token | intext:api_key) -test -demo',
      description: "Searches GitHub for public repositories belonging to an organization that may expose secrets.",
      usageContext: "Code security review for accidentally committed credentials in public repositories.",
      intentType: "CREDENTIAL_HARVESTING", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "code-intelligence", operators: ["site:", "intext:"], platforms: ["google-search", "github"], tags: ["git", "credentials", "token", "osint"],
    },
    {
      title: "Public Jira Ticket Exposure",
      queryTemplate: 'site:{organization}.atlassian.net | site:jira.{domain}',
      optimizedQuery: 'site:{organization}.atlassian.net (intext:"internal" | intext:"confidential" | intext:"password") -resolved',
      description: "Finds publicly accessible Jira tickets that may contain sensitive project details.",
      usageContext: "SaaS security review for exposed project management data.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "org-research", operators: ["site:", "intext:"], platforms: ["google-search", "jira"], tags: ["osint", "exposed", "credentials"],
    },
    // ── THREAT INTELLIGENCE ──────────────────────────────────────────────────
    {
      title: "Phishing Login Page Discovery",
      queryTemplate: 'intitle:"Microsoft Login" | intitle:"Google Login" inurl:{suspicious_domain}',
      optimizedQuery: '(intitle:"Microsoft Sign In" | intitle:"Google Account") inurl:{suspicious_domain} -microsoft.com -google.com',
      description: "Identifies suspicious pages impersonating Microsoft or Google login portals for phishing detection.",
      usageContext: "Threat intelligence for detecting active phishing campaigns targeting corporate credentials.",
      intentType: "THREAT_DETECTION", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "threat-intelligence", operators: ["intitle:", "inurl:"], platforms: ["google-search"], tags: ["phishing", "login", "reconnaissance"],
    },
    {
      title: "Malware C2 Infrastructure Discovery",
      queryTemplate: 'intext:"{malware_family}" inurl:panel | inurl:c2 | intitle:"CPanel"',
      optimizedQuery: 'intext:"{malware_family}" (inurl:panel | inurl:c2 | inurl:gate | intitle:"Command and Control") -research -analysis',
      description: "Helps identify publicly indexed attacker infrastructure and command-and-control panels.",
      usageContext: "Threat intelligence research for tracking malware infrastructure.",
      intentType: "THREAT_DETECTION", difficulty: "EXPERT", sourceType: "MANUAL",
      categorySlug: "threat-intelligence", operators: ["intext:", "inurl:", "intitle:"], platforms: ["google-search"], tags: ["reconnaissance", "advanced", "network"],
    },
    // ── VULNERABILITY RESEARCH ───────────────────────────────────────────────
    {
      title: "Version Disclosure via Server Banners",
      queryTemplate: 'intext:"Apache/{version}" | intext:"nginx/{version}" site:{domain}',
      optimizedQuery: 'site:{domain} (intext:"Apache/2." | intext:"nginx/1." | intext:"Microsoft-IIS/") (intext:"Server at" | filetype:txt)',
      description: "Finds pages disclosing web server version information that may indicate outdated software.",
      usageContext: "Vulnerability assessment to identify disclosed server versions for CVE matching.",
      intentType: "VULNERABILITY_DISCOVERY", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "vulnerability-research", operators: ["intext:", "site:"], platforms: ["google-search"], tags: ["reconnaissance", "exposed", "beginner"],
    },
    {
      title: "WordPress Plugin Version Fingerprinting",
      queryTemplate: 'site:{domain} inurl:wp-content/plugins/{plugin_name}',
      optimizedQuery: 'site:{domain} inurl:wp-content/plugins/ (inurl:readme.txt | inurl:CHANGELOG.md | inurl:readme.html)',
      description: "Identifies installed WordPress plugin versions which can be matched against known CVEs.",
      usageContext: "WordPress vulnerability assessment for plugin version enumeration.",
      intentType: "VULNERABILITY_DISCOVERY", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "vulnerability-research", operators: ["site:", "inurl:"], platforms: ["google-search", "wordpress"], tags: ["wordpress", "reconnaissance", "beginner"],
    },
    // ── IoT / OT SECURITY ────────────────────────────────────────────────────
    {
      title: "SCADA HMI Interface Discovery",
      queryTemplate: 'intitle:"SCADA" | intitle:"HMI" intext:"control" site:{domain}',
      optimizedQuery: 'intitle:("SCADA" | "HMI" | "DCS" | "PLC") (intext:"control panel" | intext:"process control") site:{domain}',
      description: "Locates exposed SCADA and industrial control system interfaces on the internet.",
      usageContext: "ICS/OT security assessment for exposed industrial control systems.",
      intentType: "RECONNAISSANCE", difficulty: "EXPERT", sourceType: "MANUAL",
      categorySlug: "iot-ot-security", operators: ["intitle:", "intext:", "site:"], platforms: ["google-search"], tags: ["scada", "iot", "exposed", "advanced"],
    },
    {
      title: "IP Camera Stream Discovery",
      queryTemplate: 'intitle:"webcamXP" | intitle:"IP Camera" inurl:"/view/index.shtml"',
      optimizedQuery: '(intitle:"webcamXP" | intitle:"IP Camera" | intitle:"Network Camera") (inurl:"/view/index.shtml" | inurl:"/mjpg/video.mjpg")',
      description: "Discovers publicly accessible IP camera feeds indexed by search engines.",
      usageContext: "IoT security audit for inadvertently exposed surveillance cameras.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "iot-ot-security", operators: ["intitle:", "inurl:"], platforms: ["google-search"], tags: ["iot", "exposed", "beginner"],
    },
    {
      title: "Smart Building Management System Discovery",
      queryTemplate: 'intitle:"BACnet" | intitle:"Building Management" inurl:login',
      optimizedQuery: '(intitle:"BACnet" | intitle:"Building Management System" | intitle:"HVAC Control") inurl:login',
      description: "Finds exposed building automation and management system control panels.",
      usageContext: "OT security assessment for physical infrastructure control system exposure.",
      intentType: "ADMIN_ACCESS", difficulty: "ADVANCED", sourceType: "MANUAL",
      categorySlug: "iot-ot-security", operators: ["intitle:", "inurl:"], platforms: ["google-search"], tags: ["scada", "iot", "admin", "advanced"],
    },
    // ── IDENTITY AND ACCESS ──────────────────────────────────────────────────
    {
      title: "SSO and Identity Provider Discovery",
      queryTemplate: 'site:{domain} (inurl:sso | inurl:saml | inurl:oauth | intitle:"Single Sign-On")',
      optimizedQuery: 'site:{domain} (inurl:sso | inurl:saml | inurl:oauth2 | inurl:oidc | intitle:"Single Sign-On") -docs -help',
      description: "Identifies single sign-on portals and identity provider endpoints.",
      usageContext: "Identity security assessment to map authentication entry points.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "identity-access", operators: ["site:", "inurl:", "intitle:"], platforms: ["google-search"], tags: ["sso", "login", "reconnaissance"],
    },
    {
      title: "Public Employee Directory Discovery",
      queryTemplate: 'site:{domain} (inurl:directory | inurl:staff | intitle:"Employee Directory")',
      optimizedQuery: 'site:{domain} (inurl:directory | inurl:staff | intitle:"Employee Directory" | intitle:"People") -help -support',
      description: "Finds publicly accessible staff directories that may expose employee contact information.",
      usageContext: "OSINT and social engineering risk assessment for exposed organizational data.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "identity-access", operators: ["site:", "inurl:", "intitle:"], platforms: ["google-search"], tags: ["osint", "pii", "email", "beginner"],
    },
    // ── MOBILE SECURITY ──────────────────────────────────────────────────────
    {
      title: "APK File Direct Download Discovery",
      queryTemplate: 'site:{domain} filetype:apk "{app_name}"',
      optimizedQuery: 'site:{domain} (filetype:apk | inurl:.apk) "{app_name}" -play.google.com',
      description: "Finds directly downloadable APK files hosted on organizational domains.",
      usageContext: "Mobile security assessment for unauthorized APK distribution channels.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "mobile-security", operators: ["site:", "filetype:"], platforms: ["google-search"], tags: ["mobile", "exposed"],
    },
    {
      title: "Mobile API Backend Discovery",
      queryTemplate: 'site:{domain} (inurl:api/v1 | inurl:api/v2 | inurl:mobile/api)',
      optimizedQuery: 'site:{domain} (inurl:/api/v1/ | inurl:/api/v2/ | inurl:/mobile/ | inurl:/app/api/) -docs -swagger',
      description: "Discovers mobile application backend API endpoints that may be publicly accessible.",
      usageContext: "Mobile app security assessment to identify backend API surfaces.",
      intentType: "RECONNAISSANCE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "mobile-security", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["mobile", "api", "reconnaissance"],
    },
    // ── RED TEAM ─────────────────────────────────────────────────────────────
    {
      title: "Subdomain Discovery via Google",
      queryTemplate: 'site:{domain} -www',
      optimizedQuery: 'site:{domain} -www -www2 -blog -shop',
      description: "Enumerates subdomains of a target domain indexed by Google search.",
      usageContext: "Initial asset discovery phase to enumerate attack surface breadth.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "recon", operators: ["site:"], platforms: ["google-search"], tags: ["subdomain", "reconnaissance", "beginner"],
    },
    {
      title: "Password Reset Page Discovery",
      queryTemplate: 'site:{domain} inurl:password-reset | inurl:forgot-password',
      optimizedQuery: 'site:{domain} (inurl:password-reset | inurl:forgot-password | inurl:reset-password | intitle:"Reset Password")',
      description: "Finds password reset flows which are common targets for account takeover attacks.",
      usageContext: "Authorized red team assessment for authentication bypass and account takeover surfaces.",
      intentType: "ADMIN_ACCESS", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "exposed-login-panels", operators: ["site:", "inurl:"], platforms: ["google-search"], tags: ["login", "reconnaissance", "beginner"],
    },
    {
      title: "Public Internal Reports and Presentations",
      queryTemplate: 'site:{domain} filetype:pptx | filetype:docx "internal" | "confidential"',
      optimizedQuery: 'site:{domain} (filetype:pptx | filetype:docx | filetype:pdf) ("internal" | "confidential" | "Q{quarter}" | "roadmap")',
      description: "Finds strategic documents, roadmaps, and presentations published accidentally on public web servers.",
      usageContext: "Red team OSINT for gathering intelligence on target organizations.",
      intentType: "DATA_EXPOSURE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "public-documents", operators: ["site:", "filetype:"], platforms: ["google-search"], tags: ["pdf", "osint", "pii", "beginner"],
    },
    // ── BLUE TEAM ────────────────────────────────────────────────────────────
    {
      title: "Brand Impersonation Detection",
      queryTemplate: '"{brand_name}" (inurl:login | intitle:"sign in") -site:{official_domain}',
      optimizedQuery: '"{brand_name}" (inurl:login | intitle:"Sign In" | intitle:"Log In") -site:{official_domain} after:{date}',
      description: "Detects phishing pages and impersonation sites targeting your brand's login flows.",
      usageContext: "Brand protection monitoring to detect active credential phishing targeting users.",
      intentType: "THREAT_DETECTION", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "brand-protection", operators: ["site:", "intitle:", "inurl:", "after:"], platforms: ["google-search"], tags: ["phishing", "reconnaissance", "exposed"],
    },
    {
      title: "Leaked Credentials Monitoring",
      queryTemplate: 'intext:"{company_email_domain}" filetype:txt | filetype:csv "password"',
      optimizedQuery: 'intext:"{company_email_domain}" (filetype:txt | filetype:csv) ("password" | "passwd" | "pwd") -help -howto',
      description: "Monitors for indexed files containing corporate email addresses alongside credential data.",
      usageContext: "Blue team continuous monitoring for leaked corporate credential files.",
      intentType: "THREAT_DETECTION", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "exposure-monitoring", operators: ["intext:", "filetype:"], platforms: ["google-search"], tags: ["credentials", "pii", "email", "exposed"],
    },
    {
      title: "Exposed Cloud Dashboard Monitoring",
      queryTemplate: 'site:{domain} intitle:"Grafana" | intitle:"Kibana" | intitle:"Prometheus"',
      optimizedQuery: 'site:{domain} (intitle:"Grafana" | intitle:"Kibana" | intitle:"Prometheus" | intitle:"Datadog") -demo -docs',
      description: "Detects publicly accessible monitoring dashboards that may expose infrastructure metrics.",
      usageContext: "Blue team monitoring for inadvertently exposed observability platforms.",
      intentType: "DATA_EXPOSURE", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "threat-hunting", operators: ["site:", "intitle:"], platforms: ["google-search"], tags: ["exposed", "admin", "api"],
    },
    // ── COMPLIANCE AND AUDIT ─────────────────────────────────────────────────
    {
      title: "Exposed PII in Public Documents",
      queryTemplate: 'site:{domain} filetype:pdf intext:"Social Security" | intext:"Date of Birth" | intext:"SSN"',
      optimizedQuery: 'site:{domain} filetype:pdf (intext:"Social Security" | intext:"SSN" | intext:"Date of Birth" | intext:"National ID")',
      description: "Finds publicly accessible documents potentially containing personally identifiable information.",
      usageContext: "Compliance audit (GDPR/HIPAA) for PII exposure in public documents.",
      intentType: "COMPLIANCE_CHECK", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "compliance-audit", operators: ["site:", "filetype:", "intext:"], platforms: ["google-search"], tags: ["pii", "pdf", "exposed"],
    },
    {
      title: "GDPR Privacy Policy Discovery",
      queryTemplate: 'site:{domain} (inurl:privacy-policy | inurl:gdpr | intitle:"Privacy Policy")',
      optimizedQuery: 'site:{domain} (inurl:privacy-policy | inurl:privacy | inurl:gdpr | intitle:"Privacy Policy") (intext:"data retention" | intext:"data subjects")',
      description: "Finds privacy policy and GDPR compliance documentation for audit evidence gathering.",
      usageContext: "Compliance audit to verify GDPR documentation is in place and accessible.",
      intentType: "COMPLIANCE_CHECK", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "compliance-audit", operators: ["site:", "inurl:", "intitle:", "intext:"], platforms: ["google-search"], tags: ["pii", "beginner"],
    },
    // ── DIGITAL FORENSICS ────────────────────────────────────────────────────
    {
      title: "Exposed Web Application Error Pages",
      queryTemplate: 'site:{domain} intitle:"Error" | intitle:"Exception" intext:"stack trace"',
      optimizedQuery: 'site:{domain} (intitle:"500 Internal Server Error" | intitle:"Application Error" | intitle:"Exception") (intext:"stack trace" | intext:"at line" | intext:"traceback")',
      description: "Finds pages displaying stack traces and application errors that reveal internal code paths.",
      usageContext: "Digital forensics and defensive security to detect information-leaking error pages.",
      intentType: "VULNERABILITY_DISCOVERY", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "digital-forensics", operators: ["site:", "intitle:", "intext:"], platforms: ["google-search"], tags: ["log-files", "exposed", "beginner"],
    },
    {
      title: "Cached Historical Page Investigation",
      queryTemplate: 'cache:{domain}/{path}',
      optimizedQuery: 'cache:{domain} intext:"{keyword}" | cache:{domain}/{specific_path}',
      description: "Retrieves Google's cached version of pages for historical investigation and forensics.",
      usageContext: "Digital forensics investigation to review previously published content.",
      intentType: "RECONNAISSANCE", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "digital-forensics", operators: ["cache:"], platforms: ["google-search"], tags: ["reconnaissance", "osint", "beginner"],
    },
    // ── LEARNING AND LABS ────────────────────────────────────────────────────
    {
      title: "Basic Site Search Operator Practice",
      queryTemplate: 'site:{domain} {keyword}',
      optimizedQuery: 'site:example.com cybersecurity',
      description: "Introductory use of the site: operator to limit search results to a specific domain.",
      usageContext: "Learning the foundational site: operator in a safe, beginner-friendly context.",
      intentType: "EDUCATIONAL", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "learning-labs", operators: ["site:"], platforms: ["google-search"], tags: ["beginner", "reconnaissance"],
    },
    {
      title: "Filetype Search for Learning",
      queryTemplate: 'site:{domain} filetype:{extension}',
      optimizedQuery: 'site:example.com filetype:pdf',
      description: "Demonstrates the filetype: operator to find specific file types on a domain.",
      usageContext: "Beginner tutorial for understanding filetype-based dork patterns safely.",
      intentType: "EDUCATIONAL", difficulty: "BEGINNER", sourceType: "MANUAL",
      categorySlug: "learning-labs", operators: ["site:", "filetype:"], platforms: ["google-search"], tags: ["beginner", "pdf"],
    },
    {
      title: "Combined Operator Practice Query",
      queryTemplate: 'site:{domain} intitle:"{keyword}" filetype:{extension}',
      optimizedQuery: 'site:example.com intitle:"report" filetype:pdf',
      description: "Practice combining multiple search operators to build more targeted queries.",
      usageContext: "Intermediate learning exercise for combining operators in controlled environments.",
      intentType: "EDUCATIONAL", difficulty: "INTERMEDIATE", sourceType: "MANUAL",
      categorySlug: "learning-labs", operators: ["site:", "intitle:", "filetype:"], platforms: ["google-search"], tags: ["beginner", "reconnaissance", "pdf"],
    },
  ];

  let inserted = 0;
  for (const d of dorkData) {
    const catId = catMap[d.categorySlug];
    if (!catId) { console.warn(`Category not found: ${d.categorySlug}`); continue; }
    try {
      const [dork] = await db.insert(dorksTable).values({
        title: d.title, queryTemplate: d.queryTemplate, optimizedQuery: d.optimizedQuery,
        description: d.description, usageContext: d.usageContext,
        intentType: d.intentType, difficulty: d.difficulty, sourceType: d.sourceType,
        primaryCategoryId: catId, status: "PUBLISHED",
        viewsCount: Math.floor(Math.random() * 800),
        copyCount: Math.floor(Math.random() * 300),
      }).returning();

      await db.insert(dorkVersionsTable).values({
        dorkId: dork.id, queryTemplate: dork.queryTemplate,
        optimizedQuery: dork.optimizedQuery, description: dork.description,
        versionLabel: "v1.0", changeReason: "Initial seed",
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Error inserting:", d.title, msg);
    }
  }
  console.log(`Inserted ${inserted} dorks`);
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
