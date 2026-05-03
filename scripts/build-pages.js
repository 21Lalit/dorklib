#!/usr/bin/env node
/**
 * Builds index.html for GitHub Pages — DorkLib static site.
 * v4: zero inline onclick, data-* attributes + event delegation, no escaping bugs.
 */
const fs   = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'dorks.json');
if (!fs.existsSync(dataFile)) { console.error('[build-pages] data/dorks.json not found.'); process.exit(1); }

const { dorks: raw, updatedAt } = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
console.log('[build-pages] Loaded', raw.length, 'dorks');

const CAT_ICONS = {
  'Web Security':'🌐','Cloud Security':'☁️','Network Security':'🔌','DevSecOps':'⚙️',
  'OSINT':'🔍','Red Team':'🗡️','Blue Team':'🛡️','AI Security':'🤖',
  'Vulnerability Research':'🔬','Compliance and Audit':'📋','Identity and Access':'🔑',
  'IoT and OT Security':'🔧','Digital Forensics & IR':'🔎','Threat Intelligence':'🎯',
  'Mobile Security':'📱','Learning and Labs':'📚','Miscellaneous Dorks':'🗂️',
};
const CAT_DESC = {
  'Web Security':'Admin panels, login pages, exposed configs and web vulnerabilities.',
  'Cloud Security':'AWS, Azure, GCP misconfigurations and cloud-exposed assets.',
  'Network Security':'Routers, firewalls, switches and network device exposure.',
  'OSINT':'Person search, emails, social media and open-source intelligence.',
  'Vulnerability Research':'CVEs, PoCs, exploits and security advisory patterns.',
  'Red Team':'Offensive security patterns for penetration testing engagements.',
  'Blue Team':'Defensive research queries for threat hunting and monitoring.',
  'AI Security':'AI/ML model leaks, exposed API keys and AI infrastructure.',
  'DevSecOps':'CI/CD secrets, pipeline configs and developer credential exposure.',
  'Identity and Access':'SSO, OAuth tokens, credential exposure and IAM misconfigs.',
  'IoT and OT Security':'IP cameras, SCADA systems, embedded devices and ICS.',
  'Digital Forensics & IR':'Incident response artifacts and forensic data patterns.',
  'Threat Intelligence':'Malware infrastructure, C2 servers and threat actor patterns.',
  'Mobile Security':'APK analysis, mobile API endpoints and mobile app vulnerabilities.',
  'Compliance and Audit':'GDPR, HIPAA, ISO audit documents and compliance exposure.',
  'Learning and Labs':'CTF resources, security training materials and labs.',
  'Miscellaneous Dorks':'General-purpose patterns not fitting other categories.',
};

const DIFF_CFG = {
  BEGINNER:    { label:'Beginner',     cls:'badge-beginner'     },
  INTERMEDIATE:{ label:'Intermediate', cls:'badge-intermediate' },
  ADVANCED:    { label:'Advanced',     cls:'badge-advanced'     },
  EXPERT:      { label:'Expert',       cls:'badge-expert'       },
};

const dorks = raw.map((dk, idx) => ({
  id:      dk.id || idx + 1,
  title:   dk.title    || 'Untitled',
  query:   dk.query    || '',
  diff:    (dk.difficulty || 'BEGINNER').toUpperCase(),
  cat:     dk.category  || 'Miscellaneous Dorks',
  desc:    (dk.description || '').slice(0, 200),
  featured:dk.featured  || false,
  source:  dk.source    || 'MANUAL',
  addedAt: dk.addedAt   || dk.createdAt || null,
}));

const catMap = {};
dorks.forEach(d => { if (!catMap[d.cat]) catMap[d.cat] = []; catMap[d.cat].push(d); });
const categories = Object.entries(catMap)
  .map(([name, items]) => ({ name, count: items.length, icon: CAT_ICONS[name] || '📁', desc: CAT_DESC[name] || '' }))
  .sort((a, b) => b.count - a.count);

const TOTAL     = dorks.length;
const CAT_COUNT = categories.length;
const FEATURED  = dorks.filter(d => d.featured).slice(0, 6);
const RECENT    = [...dorks].slice(-6).reverse();
const DATE      = (updatedAt || new Date().toISOString()).slice(0, 10);

// Embed data safely — no </script> possible, no template literal injection
function safeJSON(obj) {
  return JSON.stringify(obj)
    .replace(/</g,'\\u003c')
    .replace(/>/g,'\\u003e')
    .replace(/&/g,'\\u0026')
    .replace(/`/g,'\\u0060')
    .replace(/\$/g,'\\u0024');
}

const POPULAR_CHIPS = ['site: filetype:','intitle:admin','inurl:api','ext:env','filetype:pdf'];

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

// Build chip HTML with data attributes (no inline onclick)
const chipsHTML = POPULAR_CHIPS.map(s =>
  `<button class="chip" data-action="chip-search" data-query="${esc(s)}">${esc(s)}</button>`
).join('');

// Build category sidebar filter HTML
const catFiltersHTML = `<button class="filter-btn active" data-action="cat-filter" data-cat="">All</button>` +
  categories.map(c =>
    `<button class="filter-btn" data-action="cat-filter" data-cat="${esc(c.name)}">${esc(c.icon)} ${esc(c.name)}</button>`
  ).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>DorkLib — ${TOTAL.toLocaleString()} Security Dork Patterns</title>
<meta name="description" content="${TOTAL.toLocaleString()} curated Google-style search dork patterns for cybersecurity, OSINT and penetration testing."/>
<meta property="og:title" content="DorkLib — Cybersecurity Intelligence Library"/>
<meta property="og:description" content="${TOTAL.toLocaleString()} curated Google dork patterns for security research."/>
<meta property="og:type" content="website"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
:root{
  --bg:#f5f1ea;--fg:#1a1410;--border:#d8cfc3;--card:#faf8f4;
  --muted:#ede8e0;--muted-fg:#7a6a58;--accent:#e6e0d6;--radius:4px;
  --sans:'DM Sans',system-ui,sans-serif;--serif:'Playfair Display',Georgia,serif;
  --mono:'JetBrains Mono','Menlo',monospace;
  --shadow-xs:0 1px 4px rgba(0,0,0,0.07);--shadow-sm:0 2px 8px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
}
body{min-height:100vh;background:var(--bg);font-family:var(--sans);color:var(--fg);overflow-x:hidden}
a{color:inherit;text-decoration:none}
button{cursor:pointer;font-family:var(--sans)}

/* NAVBAR */
.navbar{position:sticky;top:0;z-index:50;height:48px;border-bottom:1px solid var(--border);background:rgba(245,241,234,0.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.nav-inner{max-width:1280px;margin:0 auto;padding:0 24px;height:100%;display:flex;align-items:center;gap:24px}
.logo{font-family:var(--serif);font-size:17px;font-weight:900;letter-spacing:-0.03em;color:var(--fg);flex-shrink:0;cursor:pointer;background:none;border:none;padding:0}
.logo em{font-style:italic;font-weight:400}
.nav-links{display:flex;align-items:center;gap:0;border-left:1px solid var(--border);padding-left:24px;flex-shrink:0}
.nav-link{padding:6px 12px;font-size:13px;letter-spacing:0.01em;color:var(--muted-fg);background:none;border:none;transition:color 0.14s;white-space:nowrap}
.nav-link:hover,.nav-link.active{color:var(--fg);font-weight:500}
.nav-search-wrap{flex:1;max-width:280px;margin-left:auto;position:relative}
.nav-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);width:13px;height:13px;color:var(--muted-fg);pointer-events:none}
.nav-search{width:100%;padding:6px 10px 6px 30px;font-size:13px;font-family:var(--sans);background:rgba(237,232,224,0.7);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg)}
.nav-search:focus{outline:none;border-color:rgba(26,20,16,0.3)}
.nav-search::placeholder{color:rgba(122,106,88,0.6)}
.nav-gh{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted-fg);border:1px solid var(--border);border-radius:20px;padding:4px 12px;flex-shrink:0;transition:all 0.14s}
.nav-gh:hover{border-color:rgba(26,20,16,0.3);color:var(--fg)}

/* LAYOUT */
.container{max-width:1280px;margin:0 auto;padding:0 24px}

/* HERO */
.hero{border-bottom:1px solid var(--border);text-align:center;padding:40px 24px 24px}
.hero-inner{max-width:1280px;margin:0 auto}
.eyebrow{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted-fg);margin-bottom:20px}
.hero-title{font-family:var(--serif);font-size:clamp(64px,9vw,96px);font-weight:900;line-height:1;letter-spacing:-0.04em;color:var(--fg);margin-bottom:4px}
.hero-title em{font-style:italic;font-weight:400}
.hero-sub{font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:var(--muted-fg);margin-bottom:20px}
.double-rule{margin-bottom:28px}
.double-rule .r2{height:3px;background:var(--fg);margin-bottom:2px}
.double-rule .r1{height:1px;background:var(--fg)}
.hero-search-form{display:flex;gap:8px;max-width:480px;margin:0 auto 16px}
.hero-search-wrap{flex:1;position:relative}
.hero-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:var(--muted-fg)}
.hero-search{width:100%;padding:10px 14px 10px 36px;font-size:14px;font-family:var(--sans);background:var(--card);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg)}
.hero-search:focus{outline:none;border-color:rgba(26,20,16,0.4)}
.hero-search::placeholder{color:rgba(122,106,88,0.55)}
.hero-btn{background:var(--fg);color:var(--bg);border:none;border-radius:var(--radius);padding:10px 20px;font-size:13px;font-family:var(--sans);font-weight:600;letter-spacing:0.04em;white-space:nowrap;transition:opacity 0.14s}
.hero-btn:hover{opacity:0.85}
.chips{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:8px;align-items:center}
.chip-label{font-size:11px;color:var(--muted-fg);margin-right:2px}
.chip{font-family:var(--mono);font-size:11px;border:1px solid var(--border);border-radius:var(--radius);padding:4px 10px;background:transparent;color:#5a4a38;transition:all 0.14s}
.chip:hover{border-color:rgba(26,20,16,0.3);color:var(--fg)}

/* SECTIONS */
.gold-rule{height:1px;background:var(--border);margin:0}
.section{padding:36px 0}
.section-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px}
.section-title{font-family:var(--serif);font-size:20px;font-weight:700;color:var(--fg);display:flex;align-items:center;gap:8px}
.section-icon{width:16px;height:16px;color:var(--muted-fg);flex-shrink:0}
.section-link{font-size:12px;color:var(--muted-fg);letter-spacing:0.04em;transition:color 0.14s;background:none;border:none;cursor:pointer}
.section-link:hover{color:var(--fg)}

/* STATS */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;display:flex;align-items:center;gap:16px;transition:box-shadow 0.18s,transform 0.18s}
.stat-card:hover{box-shadow:var(--shadow-xs);transform:translateY(-1px)}
.stat-icon-wrap{padding:10px;border-radius:var(--radius);border:1px solid var(--border);background:rgba(237,232,224,0.5);flex-shrink:0}
.stat-icon-wrap svg{width:16px;height:16px;color:var(--muted-fg)}
.stat-value{font-family:var(--mono);font-size:24px;font-weight:600;color:var(--fg);letter-spacing:-0.03em;line-height:1}
.stat-label{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:var(--muted-fg);margin-top:2px}

/* CATEGORY CARDS */
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.cat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:12px;cursor:pointer;transition:box-shadow 0.18s,transform 0.18s}
.cat-card:hover{box-shadow:var(--shadow-xs);transform:translateY(-1px)}
.cat-card-top{display:flex;align-items:flex-start;justify-content:space-between}
.cat-name-wrap{display:flex;align-items:center;gap:10px}
.cat-emoji{font-size:18px;line-height:1;flex-shrink:0}
.cat-name{font-family:var(--serif);font-size:14px;font-weight:700;color:var(--fg)}
.cat-chevron{width:14px;height:14px;color:rgba(122,106,88,0.4);flex-shrink:0;margin-top:2px}
.cat-desc{font-size:12px;color:var(--muted-fg);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cat-footer{display:flex;align-items:center;border-top:1px solid var(--border);padding-top:10px;margin-top:auto}
.cat-count{font-family:var(--mono);font-size:11px;color:var(--muted-fg)}

/* DORK CARDS */
.dorks-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.dorks-grid.list-view{grid-template-columns:1fr}
.dork-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:12px;cursor:pointer;transition:box-shadow 0.18s,transform 0.18s}
.dork-card:hover{box-shadow:var(--shadow-xs);transform:translateY(-1px)}
.dork-card.open{background:#faf8f2;border-color:rgba(26,20,16,0.15)}
.dork-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.dork-cat-label{font-size:10px;color:var(--muted-fg);letter-spacing:0.14em;text-transform:uppercase;display:block;margin-bottom:3px}
.dork-title{font-family:var(--serif);font-size:15px;font-weight:700;color:var(--fg);line-height:1.3}
.dork-desc{font-size:12px;color:var(--muted-fg);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.query-box{font-family:var(--mono);font-size:12px;background:hsl(36,20%,93%);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;color:#1e1410;line-height:1.7;word-break:break-all}
.query-expand{display:flex;align-items:flex-start;gap:10px;margin-top:4px}
.query-expand .query-box{flex:1;background:rgba(237,232,224,0.6);font-size:11.5px}
.copy-btn{flex-shrink:0;border:1px solid var(--border);background:transparent;color:var(--muted-fg);font-family:var(--sans);font-size:11px;letter-spacing:0.04em;padding:5px 12px;border-radius:var(--radius);transition:all 0.14s}
.copy-btn:hover{border-color:rgba(26,20,16,0.3);color:var(--fg)}
.copy-btn.ok{border-color:#3a7a50!important;color:#3a7a50!important}
.dork-footer{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px;margin-top:auto}
.dork-footer-left{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--muted-fg)}
.dork-footer-left svg{width:11px;height:11px}
.dork-footer-icon-group{display:flex;align-items:center;gap:4px}
.dork-added{font-size:11px;color:var(--muted-fg)}

/* BADGES */
.badge{font-size:10px;font-weight:600;letter-spacing:0.05em;padding:2px 9px;border-radius:3px;white-space:nowrap;flex-shrink:0}
.badge-beginner    {background:rgba(60,130,80,0.10); color:rgb(40,100,58);  border:1px solid rgba(60,130,80,0.22)}
.badge-intermediate{background:rgba(160,110,20,0.10);color:rgb(120,82,12); border:1px solid rgba(160,110,20,0.22)}
.badge-advanced    {background:rgba(190,60,40,0.10); color:rgb(160,44,28); border:1px solid rgba(190,60,40,0.22)}
.badge-expert      {background:rgba(100,60,170,0.10);color:rgb(80,46,140); border:1px solid rgba(100,60,170,0.22)}

/* DORKS PAGE */
.dorks-page{padding:32px 0}
.dorks-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.dorks-header-left h2{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--fg)}
.dorks-header-left p{font-size:13px;color:var(--muted-fg);margin-top:2px}
.view-btns{display:flex;gap:6px}
.view-btn{padding:7px 10px;border:1px solid var(--border);border-radius:var(--radius);background:transparent;color:var(--muted-fg);transition:all 0.14s;display:flex;align-items:center}
.view-btn svg{width:14px;height:14px}
.view-btn.active{background:var(--fg);border-color:var(--fg);color:var(--bg)}
.dorks-layout{display:flex;gap:24px;align-items:flex-start}
.filter-sidebar{width:200px;flex-shrink:0;position:sticky;top:64px}
.filter-group{margin-bottom:20px}
.filter-label{font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--muted-fg);margin-bottom:8px;display:block}
.filter-options{display:flex;flex-direction:column;gap:4px}
.filter-btn{text-align:left;padding:5px 10px;border-radius:var(--radius);font-size:12px;background:none;border:none;color:var(--muted-fg);transition:all 0.13s;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.filter-btn:hover{background:var(--muted);color:var(--fg)}
.filter-btn.active{background:var(--fg);color:var(--bg)}
.dorks-main{flex:1;min-width:0}
.dorks-search-wrap{position:relative;margin-bottom:16px}
.dorks-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--muted-fg)}
.dorks-search{width:100%;padding:10px 14px 10px 38px;font-size:13px;font-family:var(--mono);background:var(--card);border:1px solid var(--border);border-radius:var(--radius);color:var(--fg)}
.dorks-search:focus{outline:none;border-color:rgba(26,20,16,0.3)}
.dorks-search::placeholder{color:rgba(122,106,88,0.55)}
.empty-state{text-align:center;padding:80px 0}
.empty-icon{width:36px;height:36px;color:rgba(122,106,88,0.3);margin:0 auto 12px}
.empty-state p{font-size:13px;color:var(--muted-fg)}
.empty-state .sub{font-size:12px;margin-top:4px;opacity:0.7}

/* PAGINATION */
.pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:24px 0 0}
.pg-btn{border:1px solid var(--border);border-radius:var(--radius);background:transparent;color:var(--muted-fg);font-family:var(--sans);font-size:12px;padding:6px 14px;transition:all 0.13s}
.pg-btn:hover:not(:disabled){border-color:rgba(26,20,16,0.3);color:var(--fg)}
.pg-btn.active{background:var(--fg);border-color:var(--fg);color:var(--bg)}
.pg-btn:disabled{opacity:0.3;cursor:default}
.pg-dots{font-size:12px;color:var(--muted-fg);padding:0 4px}
.pg-info{font-size:11px;color:var(--muted-fg);padding:0 8px;font-family:var(--mono)}

/* CATS PAGE */
.cats-page{padding:32px 0}
.cats-header{margin-bottom:24px}
.cats-header h2{font-family:var(--serif);font-size:22px;font-weight:700;color:var(--fg)}
.cats-header p{font-size:13px;color:var(--muted-fg);margin-top:2px}
.cat-grid-full{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}

/* FOOTER */
footer{border-top:1px solid var(--border);padding:28px 24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.foot-brand{font-family:var(--serif);font-size:15px;font-weight:900;color:var(--fg);letter-spacing:-0.02em}
.foot-brand em{font-style:italic;font-weight:400}
.foot-sub{font-size:11px;color:var(--muted-fg);margin-top:3px}
.foot-links{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.foot-link{font-size:11px;color:var(--muted-fg);letter-spacing:0.03em;transition:color 0.13s}
.foot-link:hover{color:var(--fg)}
.foot-sep{color:var(--border);font-size:12px}
.foot-badge{font-size:10px;color:var(--muted-fg);padding:3px 10px;border:1px solid var(--border);border-radius:20px}

/* PAGES */
.page{display:none}.page.active{display:block}

/* RESPONSIVE */
@media(max-width:900px){
  .nav-links{display:none}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .cat-grid,.cat-grid-full{grid-template-columns:repeat(2,1fr)}
  .dorks-grid{grid-template-columns:repeat(2,1fr)}
  .filter-sidebar{display:none}
}
@media(max-width:600px){
  .nav-inner{padding:0 16px;gap:12px}
  .container{padding:0 16px}
  .hero{padding:32px 16px 20px}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .cat-grid,.cat-grid-full,.dorks-grid{grid-template-columns:1fr}
  .hero-title{font-size:56px}
  .dorks-header{flex-direction:column;align-items:flex-start;gap:12px}
  footer{padding:20px 16px;flex-direction:column;align-items:flex-start}
}
</style>
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar">
  <div class="nav-inner">
    <button class="logo" data-action="nav" data-page="home">DORK<em>Lib</em></button>
    <div class="nav-links">
      <button class="nav-link active" data-action="nav" data-page="home" id="nav-home">Home</button>
      <button class="nav-link" data-action="nav" data-page="dorks" id="nav-dorks">Dorks</button>
      <button class="nav-link" data-action="nav" data-page="categories" id="nav-categories">Categories</button>
      <button class="nav-link" data-action="nav" data-page="trending" id="nav-trending">Trending</button>
      <button class="nav-link" data-action="nav" data-page="recent" id="nav-recent">Recent</button>
    </div>
    <div class="nav-search-wrap">
      <svg class="nav-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="nav-search" type="search" id="nav-search-input" placeholder="Search dorks..." autocomplete="off"/>
    </div>
    <a class="nav-gh" href="https://github.com/21Lalit/dorklib" target="_blank" rel="noopener">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
      GitHub
    </a>
  </div>
</nav>

<!-- HOME PAGE -->
<div id="page-home" class="page active">
  <section class="hero">
    <div class="hero-inner">
      <p class="eyebrow">Est. 2024 · Security Intelligence</p>
      <h1 class="hero-title">DORK<em>Lib</em></h1>
      <p class="hero-sub">Cybersecurity Intelligence Library</p>
      <div class="double-rule"><div class="r2"></div><div class="r1"></div></div>
      <div class="hero-search-form">
        <div class="hero-search-wrap">
          <svg class="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="hero-search" type="search" id="hero-search-input" placeholder="Search ${TOTAL.toLocaleString()} patterns…" autocomplete="off"/>
        </div>
        <button class="hero-btn" data-action="hero-search">Search</button>
      </div>
      <div class="chips">
        <span class="chip-label">Popular:</span>
        ${chipsHTML}
      </div>
    </div>
  </section>

  <div class="container">
    <div class="section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></div>
          <div><p class="stat-value">${TOTAL.toLocaleString()}</p><p class="stat-label">Total Dorks</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
          <div><p class="stat-value">${CAT_COUNT}</p><p class="stat-label">Categories</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div>
          <div><p class="stat-value">3</p><p class="stat-label">Sources</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
          <div><p class="stat-value" id="recent-count">—</p><p class="stat-label">Recent (30d)</p></div>
        </div>
      </div>
    </div>

    <div class="gold-rule"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Categories
        </h2>
        <button class="section-link" data-action="nav" data-page="categories">View all →</button>
      </div>
      <div class="cat-grid" id="home-cats"></div>
    </div>

    <div class="gold-rule"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          Trending Dorks
        </h2>
        <button class="section-link" data-action="nav" data-page="trending">View all →</button>
      </div>
      <div class="dorks-grid" id="home-trending"></div>
    </div>

    <div class="gold-rule"></div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">
          <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Recently Added
        </h2>
        <button class="section-link" data-action="nav" data-page="recent">View all →</button>
      </div>
      <div class="dorks-grid" id="home-recent"></div>
    </div>
    <div style="height:32px"></div>
  </div>
</div>

<!-- DORKS PAGE -->
<div id="page-dorks" class="page">
  <div class="container dorks-page">
    <div class="dorks-header">
      <div class="dorks-header-left">
        <h2>Dork Library</h2>
        <p id="dorks-count-label">Loading...</p>
      </div>
      <div class="view-btns">
        <button class="view-btn active" id="btn-grid" data-action="view" data-view="grid" title="Grid view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
        <button class="view-btn" id="btn-list" data-action="view" data-view="list" title="List view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="dorks-layout">
      <aside class="filter-sidebar">
        <div class="filter-group">
          <span class="filter-label">Difficulty</span>
          <div class="filter-options" id="diff-filters">
            <button class="filter-btn active" data-action="diff-filter" data-diff="">All</button>
            <button class="filter-btn" data-action="diff-filter" data-diff="BEGINNER">Beginner</button>
            <button class="filter-btn" data-action="diff-filter" data-diff="INTERMEDIATE">Intermediate</button>
            <button class="filter-btn" data-action="diff-filter" data-diff="ADVANCED">Advanced</button>
            <button class="filter-btn" data-action="diff-filter" data-diff="EXPERT">Expert</button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">Category</span>
          <div class="filter-options" id="cat-filters">${catFiltersHTML}</div>
        </div>
      </aside>
      <div class="dorks-main">
        <div class="dorks-search-wrap">
          <svg class="dorks-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input class="dorks-search" id="dorks-search-input" type="search" placeholder="Search patterns, operators, keywords…" autocomplete="off"/>
        </div>
        <div class="dorks-grid" id="dorks-grid"></div>
        <div class="empty-state" id="dorks-empty" style="display:none">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p>No dorks found</p>
          <p class="sub">Try adjusting your filters or search query</p>
        </div>
        <div class="pagination" id="dorks-pagination"></div>
      </div>
    </div>
  </div>
</div>

<!-- CATEGORIES PAGE -->
<div id="page-categories" class="page">
  <div class="container cats-page">
    <div class="cats-header">
      <h2>Categories</h2>
      <p>${CAT_COUNT} security categories · ${TOTAL.toLocaleString()} total patterns</p>
    </div>
    <div class="cat-grid-full" id="cats-full-grid"></div>
    <div style="height:32px"></div>
  </div>
</div>

<!-- TRENDING PAGE -->
<div id="page-trending" class="page">
  <div class="container dorks-page">
    <div class="dorks-header">
      <div class="dorks-header-left">
        <h2>Trending Dorks</h2>
        <p id="trending-count-label">Advanced &amp; Expert patterns</p>
      </div>
      <div class="view-btns">
        <button class="view-btn active" id="tbtn-grid" data-action="tview" data-view="grid" title="Grid view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
        <button class="view-btn" id="tbtn-list" data-action="tview" data-view="list" title="List view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="dorks-search-wrap" style="max-width:600px;margin-bottom:20px">
      <svg class="dorks-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="dorks-search" id="trending-search-input" type="search" placeholder="Filter trending patterns…" autocomplete="off"/>
    </div>
    <div class="dorks-grid" id="trending-grid"></div>
    <div class="empty-state" id="trending-empty" style="display:none">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p>No results</p><p class="sub">Try a different search</p>
    </div>
    <div class="pagination" id="trending-pagination"></div>
    <div style="height:32px"></div>
  </div>
</div>

<!-- RECENT PAGE -->
<div id="page-recent" class="page">
  <div class="container dorks-page">
    <div class="dorks-header">
      <div class="dorks-header-left">
        <h2>Recently Added</h2>
        <p id="recent-page-label">Newest patterns</p>
      </div>
      <div class="view-btns">
        <button class="view-btn active" id="rbtn-grid" data-action="rview" data-view="grid" title="Grid view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
        <button class="view-btn" id="rbtn-list" data-action="rview" data-view="list" title="List view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="dorks-search-wrap" style="max-width:600px;margin-bottom:20px">
      <svg class="dorks-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="dorks-search" id="recent-search-input" type="search" placeholder="Filter recent patterns…" autocomplete="off"/>
    </div>
    <div class="dorks-grid" id="recent-grid"></div>
    <div class="empty-state" id="recent-empty" style="display:none">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p>No results</p><p class="sub">Try a different search</p>
    </div>
    <div class="pagination" id="recent-pagination"></div>
    <div style="height:32px"></div>
  </div>
</div>

<footer>
  <div>
    <div class="foot-brand">DORK<em>Lib</em></div>
    <div class="foot-sub">Cybersecurity Intelligence Library · Updated ${DATE}</div>
  </div>
  <div class="foot-links">
    <a class="foot-link" href="https://github.com/21Lalit/dorklib" target="_blank" rel="noopener">View on GitHub</a>
    <span class="foot-sep">·</span>
    <a class="foot-link" href="https://github.com/21Lalit/dorklib/blob/main/data/dorks.json" target="_blank" rel="noopener">Raw Data</a>
    <span class="foot-sep">·</span>
    <a class="foot-link" href="https://github.com/21Lalit/dorklib/actions" target="_blank" rel="noopener">Actions</a>
    <span class="foot-sep">·</span>
    <span class="foot-badge">MIT License</span>
  </div>
</footer>

<!-- DATA — stored as JSON, never interpolated into JS strings -->
<script type="application/json" id="dorks-data">${safeJSON(dorks)}</script>
<script type="application/json" id="cats-data">${safeJSON(categories)}</script>
<script type="application/json" id="featured-data">${safeJSON(FEATURED)}</script>
<script type="application/json" id="recent-data">${safeJSON(RECENT)}</script>

<script>
(function(){
'use strict';

// ── LOAD DATA from JSON script tags (100% safe, no eval, no escaping issues) ──
const DORKS    = JSON.parse(document.getElementById('dorks-data').textContent);
const CATS     = JSON.parse(document.getElementById('cats-data').textContent);
const FEATURED = JSON.parse(document.getElementById('featured-data').textContent);
const RECENT_D = JSON.parse(document.getElementById('recent-data').textContent);

const DIFF_CFG = {
  BEGINNER:    { label:'Beginner',     cls:'badge-beginner'     },
  INTERMEDIATE:{ label:'Intermediate', cls:'badge-intermediate' },
  ADVANCED:    { label:'Advanced',     cls:'badge-advanced'     },
  EXPERT:      { label:'Expert',       cls:'badge-expert'       },
};
const PAGE_SIZE = 24;

// ── STATE ──
let currentPage = 'home';
let dorksPage   = 1;
let dorksQ      = '';
let dorksView   = 'grid';
let diffFilter  = '';
let catFilter   = '';
let openDorkId  = null;

// ── UTILS ──
function esc(s){
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function diffBadge(d){
  const c = DIFF_CFG[d] || DIFF_CFG.BEGINNER;
  return '<span class="badge ' + c.cls + '">' + c.label + '</span>';
}
function timeAgo(iso){
  if(!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if(s < 60)      return 'just now';
  if(s < 3600)    return Math.floor(s/60)   + 'm ago';
  if(s < 86400)   return Math.floor(s/3600) + 'h ago';
  if(s < 2592000) return Math.floor(s/86400)+ 'd ago';
  return new Date(iso).toLocaleDateString('en',{month:'short',day:'numeric'});
}

// ── COPY ──
function copyText(text, btn){
  navigator.clipboard.writeText(text).catch(function(){
    var t = document.createElement('textarea');
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand('copy'); document.body.removeChild(t);
  });
  btn.textContent = '✓ Copied'; btn.classList.add('ok');
  setTimeout(function(){ btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1500);
}

// ── NAVIGATION ──
function showPage(name){
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('active'); });
  var nl = document.getElementById('nav-' + name);
  if(nl) nl.classList.add('active');
  currentPage = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if(name === 'dorks')      renderDorksPage();
  if(name === 'categories') renderCatsPage();
  if(name === 'trending')   renderTrendingPage();
  if(name === 'recent')     renderRecentPage();
}

// ── DORK CARD ──
function dorkCardHTML(d){
  var isOpen  = openDorkId === d.id;
  var added   = d.addedAt ? timeAgo(d.addedAt) : '';
  var preview = d.query.length > 120 ? esc(d.query.slice(0,120)) + '…' : esc(d.query);
  var html = '<div class="dork-card' + (isOpen ? ' open' : '') + '" data-action="dork-toggle" data-id="' + d.id + '">';
  html += '<div class="dork-card-top">';
  html += '<div>';
  if(d.cat) html += '<span class="dork-cat-label">' + esc(d.cat) + '</span>';
  html += '<h3 class="dork-title">' + esc(d.title) + '</h3>';
  html += '</div>' + diffBadge(d.diff) + '</div>';
  html += '<div class="query-box">' + preview + '</div>';
  if(d.desc) html += '<p class="dork-desc">' + esc(d.desc) + '</p>';
  if(isOpen){
    html += '<div class="query-expand" data-action="stop-propagation">';
    html += '<div class="query-box">' + esc(d.query) + '</div>';
    html += '<button class="copy-btn" data-action="copy" data-id="' + d.id + '">Copy</button>';
    html += '</div>';
  }
  html += '<div class="dork-footer">';
  html += '<div class="dork-footer-left">';
  html += '<span class="dork-footer-icon-group"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>0</span>';
  html += '<span class="dork-footer-icon-group"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>0</span>';
  html += '</div>';
  html += '<span class="dork-added">' + added + '</span>';
  html += '</div></div>';
  return html;
}

// ── CAT CARD ──
function catCardHTML(cat){
  return '<div class="cat-card" data-action="cat-go" data-cat="' + esc(cat.name) + '">' +
    '<div class="cat-card-top">' +
      '<div class="cat-name-wrap">' +
        '<span class="cat-emoji">' + cat.icon + '</span>' +
        '<h3 class="cat-name">' + esc(cat.name) + '</h3>' +
      '</div>' +
      '<svg class="cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>' +
    '</div>' +
    (cat.desc ? '<p class="cat-desc">' + esc(cat.desc) + '</p>' : '') +
    '<div class="cat-footer"><span class="cat-count">' + cat.count.toLocaleString() + ' dorks</span></div>' +
  '</div>';
}

// ── RENDER HOME ──
function renderHome(){
  var cutoff = Date.now() - 30*24*3600*1000;
  var n = DORKS.filter(function(d){ return d.addedAt && new Date(d.addedAt).getTime() > cutoff; }).length;
  document.getElementById('recent-count').textContent = n.toLocaleString();

  document.getElementById('home-cats').innerHTML =
    CATS.slice(0,8).map(catCardHTML).join('');

  var trending = FEATURED.length ? FEATURED :
    DORKS.filter(function(d){ return d.diff==='ADVANCED'||d.diff==='EXPERT'; }).slice(0,6);
  document.getElementById('home-trending').innerHTML = trending.map(dorkCardHTML).join('');
  document.getElementById('home-recent').innerHTML   = RECENT_D.map(dorkCardHTML).join('');
}

// ── RENDER DORKS ──
function renderDorksPage(){
  var q = dorksQ.toLowerCase().trim();
  var filtered = DORKS.filter(function(d){
    if(diffFilter && d.diff !== diffFilter) return false;
    if(catFilter  && d.cat  !== catFilter)  return false;
    if(q && !d.title.toLowerCase().includes(q) &&
            !d.query.toLowerCase().includes(q) &&
            !d.cat.toLowerCase().includes(q)) return false;
    return true;
  });
  var total      = filtered.length;
  var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if(dorksPage > totalPages) dorksPage = totalPages;
  document.getElementById('dorks-count-label').textContent = total.toLocaleString() + ' patterns';

  var start     = (dorksPage - 1) * PAGE_SIZE;
  var pageItems = filtered.slice(start, start + PAGE_SIZE);
  var grid      = document.getElementById('dorks-grid');
  var empty     = document.getElementById('dorks-empty');

  if(pageItems.length === 0){
    grid.innerHTML = ''; empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    grid.className = 'dorks-grid' + (dorksView === 'list' ? ' list-view' : '');
    grid.innerHTML = pageItems.map(dorkCardHTML).join('');
  }

  // Pagination
  var pgHTML = '';
  if(totalPages > 1){
    pgHTML += '<button class="pg-btn" data-action="page" data-page="' + (dorksPage-1) + '"' +
              (dorksPage===1 ? ' disabled' : '') + '>← Prev</button>';
    var sp = [];
    if(totalPages <= 7){
      for(var i=1; i<=totalPages; i++) sp.push(i);
    } else {
      sp.push(1);
      if(dorksPage > 3) sp.push('…');
      for(var i=Math.max(2,dorksPage-1); i<=Math.min(totalPages-1,dorksPage+1); i++) sp.push(i);
      if(dorksPage < totalPages-2) sp.push('…');
      sp.push(totalPages);
    }
    sp.forEach(function(p){
      if(p==='…') pgHTML += '<span class="pg-dots">…</span>';
      else pgHTML += '<button class="pg-btn' + (p===dorksPage?' active':'') +
                     '" data-action="page" data-page="' + p + '">' + p + '</button>';
    });
    pgHTML += '<button class="pg-btn" data-action="page" data-page="' + (dorksPage+1) + '"' +
              (dorksPage===totalPages ? ' disabled' : '') + '>Next →</button>';
    pgHTML += '<span class="pg-info">' + dorksPage + ' / ' + totalPages + '</span>';
  }
  document.getElementById('dorks-pagination').innerHTML = pgHTML;
}

// ── RENDER CATS ──
function renderCatsPage(){
  document.getElementById('cats-full-grid').innerHTML = CATS.map(catCardHTML).join('');
}

// ── GENERIC PAGED LIST RENDERER ──
function renderPagedList(cfg){
  // cfg: { items, page, view, gridId, emptyId, paginationId, labelId, labelText, pageAction, viewAction, gridBtn, listBtn, openId }
  var q = (cfg.q || '').toLowerCase().trim();
  var filtered = cfg.items.filter(function(d){
    if(!q) return true;
    return d.title.toLowerCase().includes(q) || d.query.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q);
  });
  var total      = filtered.length;
  var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if(cfg.page[0] > totalPages) cfg.page[0] = totalPages;
  if(cfg.labelId) document.getElementById(cfg.labelId).textContent = total.toLocaleString() + ' ' + (cfg.labelText || 'patterns');

  var start     = (cfg.page[0] - 1) * PAGE_SIZE;
  var pageItems = filtered.slice(start, start + PAGE_SIZE);
  var grid  = document.getElementById(cfg.gridId);
  var empty = document.getElementById(cfg.emptyId);

  if(pageItems.length === 0){
    grid.innerHTML = ''; empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    grid.className = 'dorks-grid' + (cfg.view[0] === 'list' ? ' list-view' : '');
    // temporarily use openDorkId from outer scope for expansion
    grid.innerHTML = pageItems.map(dorkCardHTML).join('');
  }

  // Pagination
  var pgHTML = '';
  if(totalPages > 1){
    pgHTML += '<button class="pg-btn" data-action="' + cfg.pageAction + '" data-page="' + (cfg.page[0]-1) + '"' +
              (cfg.page[0]===1 ? ' disabled' : '') + '>← Prev</button>';
    var sp = [];
    if(totalPages <= 7){
      for(var i=1;i<=totalPages;i++) sp.push(i);
    } else {
      sp.push(1);
      if(cfg.page[0]>3) sp.push('…');
      for(var i=Math.max(2,cfg.page[0]-1);i<=Math.min(totalPages-1,cfg.page[0]+1);i++) sp.push(i);
      if(cfg.page[0]<totalPages-2) sp.push('…');
      sp.push(totalPages);
    }
    sp.forEach(function(p){
      if(p==='…') pgHTML+='<span class="pg-dots">…</span>';
      else pgHTML+='<button class="pg-btn'+(p===cfg.page[0]?' active':'')+'" data-action="'+cfg.pageAction+'" data-page="'+p+'">'+p+'</button>';
    });
    pgHTML += '<button class="pg-btn" data-action="' + cfg.pageAction + '" data-page="' + (cfg.page[0]+1) + '"' +
              (cfg.page[0]===totalPages ? ' disabled' : '') + '>Next →</button>';
    pgHTML += '<span class="pg-info">' + cfg.page[0] + ' / ' + totalPages + '</span>';
  }
  document.getElementById(cfg.paginationId).innerHTML = pgHTML;
}

// ── TRENDING STATE ──
var trendingItems  = null; // lazy-built
var trendingPage   = [1];
var trendingView   = ['grid'];
var trendingQ      = '';

function getTrendingItems(){
  if(!trendingItems){
    // Advanced + Expert dorks, sorted by addedAt desc
    trendingItems = DORKS.filter(function(d){ return d.diff==='ADVANCED'||d.diff==='EXPERT'; })
      .slice().sort(function(a,b){ return (b.addedAt||'') < (a.addedAt||'') ? -1 : 1; });
  }
  return trendingItems;
}

function renderTrendingPage(){
  renderPagedList({
    items: getTrendingItems(), page: trendingPage, view: trendingView, q: trendingQ,
    gridId: 'trending-grid', emptyId: 'trending-empty', paginationId: 'trending-pagination',
    labelId: 'trending-count-label', labelText: 'advanced & expert patterns',
    pageAction: 'tpage', viewAction: 'tview'
  });
}

// ── RECENT STATE ──
var recentItems = null; // lazy-built
var recentPage  = [1];
var recentView  = ['grid'];
var recentQ     = '';

function getRecentItems(){
  if(!recentItems){
    // Sorted by addedAt descending
    recentItems = DORKS.slice().sort(function(a,b){
      if(!a.addedAt && !b.addedAt) return 0;
      if(!a.addedAt) return 1;
      if(!b.addedAt) return -1;
      return a.addedAt < b.addedAt ? 1 : -1;
    });
  }
  return recentItems;
}

function renderRecentPage(){
  renderPagedList({
    items: getRecentItems(), page: recentPage, view: recentView, q: recentQ,
    gridId: 'recent-grid', emptyId: 'recent-empty', paginationId: 'recent-pagination',
    labelId: 'recent-page-label', labelText: 'patterns (newest first)',
    pageAction: 'rpage', viewAction: 'rview'
  });
}

// ── GLOBAL EVENT DELEGATION ──
document.addEventListener('click', function(e){
  var el = e.target;
  // Walk up to find a data-action element
  while(el && el !== document.body){
    var action = el.dataset && el.dataset.action;
    if(action) break;
    el = el.parentElement;
  }
  if(!el || !el.dataset || !el.dataset.action) return;

  var action = el.dataset.action;

  if(action === 'stop-propagation'){ e.stopPropagation(); return; }

  if(action === 'nav'){
    showPage(el.dataset.page);
    return;
  }

  if(action === 'hero-search'){
    var val = document.getElementById('hero-search-input').value.trim();
    dorksQ = val; dorksPage = 1; openDorkId = null;
    document.getElementById('dorks-search-input').value = val;
    showPage('dorks');
    return;
  }

  if(action === 'chip-search'){
    var q = el.dataset.query;
    document.getElementById('hero-search-input').value = q;
    document.getElementById('dorks-search-input').value = q;
    dorksQ = q; dorksPage = 1; openDorkId = null;
    showPage('dorks');
    return;
  }

  if(action === 'view'){
    dorksView = el.dataset.view;
    document.getElementById('btn-grid').classList.toggle('active', dorksView === 'grid');
    document.getElementById('btn-list').classList.toggle('active', dorksView === 'list');
    renderDorksPage();
    return;
  }

  if(action === 'diff-filter'){
    diffFilter = el.dataset.diff;
    dorksPage  = 1; openDorkId = null;
    document.querySelectorAll('#diff-filters .filter-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.diff === diffFilter);
    });
    renderDorksPage();
    return;
  }

  if(action === 'cat-filter'){
    catFilter  = el.dataset.cat;
    dorksPage  = 1; openDorkId = null;
    document.querySelectorAll('#cat-filters .filter-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.cat === catFilter);
    });
    renderDorksPage();
    return;
  }

  if(action === 'cat-go'){
    catFilter  = el.dataset.cat;
    dorksPage  = 1; openDorkId = null;
    document.querySelectorAll('#cat-filters .filter-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.cat === catFilter);
    });
    showPage('dorks');
    return;
  }

  if(action === 'dork-toggle'){
    var id = parseInt(el.dataset.id, 10);
    openDorkId = (openDorkId === id) ? null : id;
    renderDorksPage();
    return;
  }

  if(action === 'copy'){
    e.stopPropagation();
    var id   = parseInt(el.dataset.id, 10);
    var dork = DORKS.find(function(d){ return d.id === id; });
    if(dork) copyText(dork.query, el);
    return;
  }

  if(action === 'page'){
    if(el.disabled) return;
    dorksPage  = parseInt(el.dataset.page, 10);
    openDorkId = null;
    renderDorksPage();
    var dp = document.querySelector('.dorks-page');
    if(dp) dp.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if(action === 'tview'){
    trendingView[0] = el.dataset.view;
    document.getElementById('tbtn-grid').classList.toggle('active', trendingView[0]==='grid');
    document.getElementById('tbtn-list').classList.toggle('active', trendingView[0]==='list');
    renderTrendingPage(); return;
  }

  if(action === 'tpage'){
    if(el.disabled) return;
    trendingPage[0] = parseInt(el.dataset.page, 10);
    openDorkId = null;
    renderTrendingPage();
    var tp = document.getElementById('page-trending');
    if(tp) tp.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if(action === 'rview'){
    recentView[0] = el.dataset.view;
    document.getElementById('rbtn-grid').classList.toggle('active', recentView[0]==='grid');
    document.getElementById('rbtn-list').classList.toggle('active', recentView[0]==='list');
    renderRecentPage(); return;
  }

  if(action === 'rpage'){
    if(el.disabled) return;
    recentPage[0] = parseInt(el.dataset.page, 10);
    openDorkId = null;
    renderRecentPage();
    var rp = document.getElementById('page-recent');
    if(rp) rp.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
});

// Nav search
document.getElementById('nav-search-input').addEventListener('keydown', function(e){
  if(e.key === 'Enter'){
    var v = this.value.trim();
    dorksQ = v; dorksPage = 1; openDorkId = null;
    document.getElementById('dorks-search-input').value = v;
    showPage('dorks');
  }
});

// Hero search enter key
document.getElementById('hero-search-input').addEventListener('keydown', function(e){
  if(e.key === 'Enter'){
    var v = this.value.trim();
    dorksQ = v; dorksPage = 1; openDorkId = null;
    document.getElementById('dorks-search-input').value = v;
    showPage('dorks');
  }
});

// Dorks search input
document.getElementById('dorks-search-input').addEventListener('input', function(){
  dorksQ = this.value; dorksPage = 1; openDorkId = null;
  renderDorksPage();
});

// Trending search input
document.getElementById('trending-search-input').addEventListener('input', function(){
  trendingQ = this.value; trendingPage[0] = 1; openDorkId = null;
  renderTrendingPage();
});

// Recent search input
document.getElementById('recent-search-input').addEventListener('input', function(){
  recentQ = this.value; recentPage[0] = 1; openDorkId = null;
  renderRecentPage();
});

// ── INIT ──
renderHome();

})();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html);
const sz = (Buffer.byteLength(html)/1024).toFixed(0);
console.log('[build-pages] Done —', TOTAL, 'dorks,', sz + 'KB, dated', DATE);
