# DorkLib — Cybersecurity Intelligence Library

> A curated, auto-updating collection of Google-style search dork patterns for cybersecurity professionals, penetration testers, and OSINT researchers.

**Live site →** [https://21lalit.github.io/dorklib/](https://21lalit.github.io/dorklib/)

---

## What is DorkLib?

DorkLib is an open-source library of **19,500+ Google dork patterns** across 17 security categories. Each dork is a crafted search query using operators like `site:`, `inurl:`, `filetype:`, and `intitle:` to surface information that standard searches miss.

Use cases:
- **Penetration testing** — discover exposed admin panels, login pages, and sensitive files
- **OSINT research** — find publicly accessible data about targets
- **Bug bounty hunting** — locate misconfigured cloud storage, leaked credentials, and API keys
- **Security auditing** — identify your own attack surface before adversaries do

---

## Categories

| Category | Dorks | Focus |
|---|---|---|
| OSINT | 8,200+ | Person search, email, social media |
| Web Security | 4,100+ | Admin panels, login pages, exposed configs |
| Identity and Access | 1,900+ | SSO, OAuth, credential exposure |
| Vulnerability Research | 1,700+ | CVEs, PoCs, exploits |
| IoT and OT Security | 780+ | Cameras, SCADA, embedded devices |
| AI Security | 630+ | AI/ML model leaks, API keys |
| Cloud Security | 570+ | AWS, Azure, GCP misconfigurations |
| Threat Intelligence | 320+ | Malware, C2 infrastructure |
| Miscellaneous Dorks | 230+ | General-purpose patterns |
| Network Security | 220+ | Routers, firewalls, network devices |
| DevSecOps | 220+ | CI/CD secrets, pipeline configs |
| Compliance and Audit | 175+ | GDPR, HIPAA, ISO documents |
| Learning and Labs | 125+ | CTF, security training resources |
| Digital Forensics & IR | 90+ | Incident response, forensic artifacts |
| Blue Team | 40+ | Defensive research queries |
| Red Team | 35+ | Offensive security patterns |
| Mobile Security | 20+ | APKs, mobile API endpoints |

---

## How It Works

DorkLib is fully automated — no manual updates needed.

```
Every 12 hours (GitHub Actions)
  ├── fetch-github-dorks.js      — pulls dorks from curated security GitHub repos
  ├── fetch-rss-dorks.js         — reads security RSS/Atom feeds
  ├── fetch-google-cse-dorks.js  — discovers patterns via Google Custom Search
  ├── fetch-exploitdb-dorks.js   — harvests entries from Exploit-DB GHDB (no key needed)
  ├── fetch-webcrawl-dorks.js    — crawls public dork-listing pages
  └── build-pages.js             — rebuilds index.html from data/dorks.json
                                    → auto-commits to GitHub Pages
```

All data lives in [`data/dorks.json`](data/dorks.json). The site rebuilds itself every 12 hours.

---

## Repository Structure

```
├── index.html                          # GitHub Pages site (auto-generated)
├── data/
│   └── dorks.json                      # Master dork database (19,500+ entries)
├── artifacts/
│   ├── api-server/                     # Express 5 REST API (port 8080, path /api)
│   └── dork-library/                   # React + Vite frontend
├── lib/
│   ├── db/                             # Drizzle ORM schema, migrations, seeds
│   ├── api-spec/                       # OpenAPI spec + Orval codegen
│   ├── api-zod/                        # Generated Zod validation schemas
│   └── api-client-react/               # Generated React query hooks
├── scripts/
│   ├── fetch-github-dorks.js           # Fetches from security GitHub repos
│   ├── fetch-rss-dorks.js              # Fetches from RSS/Atom security feeds
│   ├── fetch-google-cse-dorks.js       # Fetches via Google Custom Search API
│   ├── fetch-exploitdb-dorks.js        # Fetches from Exploit-DB GHDB
│   ├── fetch-webcrawl-dorks.js         # Crawls public dork-listing pages
│   └── build-pages.js                  # Builds index.html from dorks.json
└── .github/
    └── workflows/
        ├── update-pages.yml            # Automated 12-hour dork update
        └── deploy.yml                  # GitHub Pages deployment on push to main
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod (`zod/v4`), `drizzle-zod` |
| API codegen | Orval (OpenAPI spec → React hooks + Zod schemas) |
| Build | esbuild (ESM bundle) |
| Frontend | React + Vite |

---

## Running Locally

### Static GitHub Pages site

No build tools required — just Node.js.

```bash
# Clone the repo
git clone https://github.com/21Lalit/dorklib.git
cd dorklib

# Fetch latest dorks (optional — data/dorks.json already included)
GITHUB_TOKEN=your_token node scripts/fetch-github-dorks.js
node scripts/fetch-rss-dorks.js
GOOGLE_CSE_API_KEY=your_key GOOGLE_CSE_ID=your_id node scripts/fetch-google-cse-dorks.js
node scripts/fetch-exploitdb-dorks.js
node scripts/fetch-webcrawl-dorks.js

# Rebuild the static site
node scripts/build-pages.js

# Open in browser
open index.html
```

### Full-stack development

Requires Node.js 24, pnpm, and a PostgreSQL instance.

```bash
# Install dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run API server locally (port 8080)
pnpm --filter @workspace/api-server run dev

# Run frontend locally
pnpm --filter @workspace/dork-library run dev

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

For full development setup details, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Triggering a Manual Update

Go to **Actions → Auto-Update DorkLib GitHub Pages → Run workflow** in this repository.

---

## GitHub Secrets Required

| Secret | Purpose |
|---|---|
| `GITHUB_TOKEN` | Built-in — no setup needed |
| `GOOGLE_CSE_API_KEY` | Google Cloud API key (Custom Search enabled) |
| `GOOGLE_CSE_ID` | Programmable Search Engine ID |

Add secrets at: **Settings → Secrets and variables → Actions**

---

## Dork Database Format

Each entry in `data/dorks.json` follows this schema:

```json
{
  "id": 1,
  "title": "Exposed .env files",
  "query": "filetype:env DB_PASSWORD",
  "difficulty": "BEGINNER",
  "intentType": "RESEARCH",
  "category": "Web Security",
  "description": "Finds publicly accessible .env files containing database credentials.",
  "featured": false,
  "source": "MANUAL"
}
```

The top-level JSON object includes metadata:

```json
{
  "version": 1,
  "total": 19521,
  "updatedAt": "2026-05-19T15:34:37.813Z",
  "dorks": [ ... ]
}
```

---

## Legal Disclaimer

DorkLib is intended for **authorized security research, education, and penetration testing with explicit permission** only. Using these dorks against systems you do not own or have permission to test may violate computer crime laws in your jurisdiction. Always obtain written authorization before testing.

---

## License

MIT License — free to use, modify, and distribute.

---

*Auto-updated every 12 hours via GitHub Actions · Hosted on GitHub Pages*
