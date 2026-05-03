# DorkLib — Cybersecurity Intelligence Library

> A curated, auto-updating collection of Google-style search dork patterns for cybersecurity professionals, penetration testers, and OSINT researchers.

**Live site →** [https://21lalit.github.io/dorklib/](https://21lalit.github.io/dorklib/)

---

## What is DorkLib?

DorkLib is an open-source library of **3,200+ Google dork patterns** across 18 security categories. Each dork is a crafted search query using operators like `site:`, `inurl:`, `filetype:`, and `intitle:` to surface information that standard searches miss.

Use cases:
- **Penetration testing** — discover exposed admin panels, login pages, and sensitive files
- **OSINT research** — find publicly accessible data about targets
- **Bug bounty hunting** — locate misconfigured cloud storage, leaked credentials, and API keys
- **Security auditing** — identify your own attack surface before adversaries do

---

## Categories

| Category | Focus |
|---|---|
| Web Security | Admin panels, login pages, exposed configs |
| Cloud Security | AWS, Azure, GCP misconfigurations |
| Network Security | Routers, firewalls, network devices |
| OSINT | Person search, email, social media |
| Vulnerability Research | CVEs, PoCs, exploits |
| Red Team | Offensive security patterns |
| Blue Team | Defensive research queries |
| AI Security | AI/ML model leaks, API keys |
| DevSecOps | CI/CD secrets, pipeline configs |
| Identity and Access | SSO, OAuth, credential exposure |
| IoT and OT Security | Cameras, SCADA, embedded devices |
| Digital Forensics & IR | Incident response, forensic artifacts |
| Threat Intelligence | Malware, C2 infrastructure |
| Mobile Security | APKs, mobile API endpoints |
| Compliance and Audit | GDPR, HIPAA, ISO documents |
| Learning and Labs | CTF, security training resources |
| Miscellaneous Dorks | General-purpose patterns |

---

## How It Works

DorkLib is fully automated — no manual updates needed.

```
Every 6 hours (GitHub Actions)
  ├── fetch-github-dorks.js   — pulls dorks from 5 curated security GitHub repos
  ├── fetch-rss-dorks.js      — reads 6 security RSS/Atom feeds
  ├── fetch-google-cse-dorks.js — discovers patterns via Google Custom Search
  └── build-pages.js          — rebuilds index.html from data/dorks.json
                                 → auto-commits to GitHub Pages
```

All data lives in [`data/dorks.json`](data/dorks.json). The site rebuilds itself every 6 hours.

---

## Repository Structure

```
├── index.html                          # GitHub Pages site (auto-generated)
├── data/
│   └── dorks.json                      # Master dork database (3,200+ entries)
├── scripts/
│   ├── fetch-github-dorks.js           # Fetches from security GitHub repos
│   ├── fetch-rss-dorks.js              # Fetches from RSS/Atom security feeds
│   ├── fetch-google-cse-dorks.js       # Fetches via Google Custom Search API
│   └── build-pages.js                  # Builds index.html from dorks.json
└── .github/
    └── workflows/
        └── update-pages.yml            # Automated 6-hour update schedule
```

---

## Running Locally

No build tools or dependencies required — just Node.js.

```bash
# Clone the repo
git clone https://github.com/21Lalit/dorklib.git
cd dorklib

# Fetch latest dorks (optional — data/dorks.json already included)
GITHUB_TOKEN=your_token node scripts/fetch-github-dorks.js
node scripts/fetch-rss-dorks.js
GOOGLE_CSE_API_KEY=your_key GOOGLE_CSE_ID=your_id node scripts/fetch-google-cse-dorks.js

# Rebuild the site
node scripts/build-pages.js

# Open in browser
open index.html
```

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

---

## Legal Disclaimer

DorkLib is intended for **authorized security research, education, and penetration testing with explicit permission** only. Using these dorks against systems you do not own or have permission to test may violate computer crime laws in your jurisdiction. Always obtain written authorization before testing.

---

## License

MIT License — free to use, modify, and distribute.

---

*Auto-updated every 6 hours via GitHub Actions · Hosted on GitHub Pages*
