#!/usr/bin/env node
/**
 * Fetches dork patterns from curated GitHub security repositories
 * and merges new ones into data/dorks.json.
 *
 * Required env: GITHUB_TOKEN (for higher API rate limits)
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const TOKEN    = process.env.GITHUB_TOKEN || '';
const dataFile = path.join(__dirname, '..', 'data', 'dorks.json');

// Curated repos known to contain Google dork lists
const SOURCES = [
  { repo: 'cipher387/Dorks-collections-list',      path: '',                   type: 'readme' },
  { repo: 'BullsEye0/google_dork_list',            path: 'google_dorks_file.txt', type: 'raw' },
  { repo: 'Ishanoshada/GDorks',                    path: 'README.md',          type: 'readme' },
  { repo: 'TakSec/google-dorks-bug-bounty',        path: 'README.md',          type: 'readme' },
  { repo: 'rootac/dorks-collections',              path: '',                   type: 'readme' },
  { repo: 'Proviesec/google-dorks',                path: 'README.md',          type: 'readme' },
  { repo: 'arimogi/Google-Dork-List',              path: 'Google-Dork-List.txt', type: 'raw'  },
  { repo: 'the-useless-one/theHarvester',          path: 'README.md',          type: 'readme' },
  { repo: 'smicallef/spiderfoot',                  path: 'README.md',          type: 'readme' },
  { repo: 'AlessandroZ/LaZagne',                   path: 'README.md',          type: 'readme' },
  { repo: 'swisskyrepo/PayloadsAllTheThings',      path: 'IDOR/README.md',     type: 'readme' },
  { repo: 'swisskyrepo/PayloadsAllTheThings',      path: 'File Inclusion/README.md', type: 'readme' },
  { repo: 'trufflesecurity/trufflehog',            path: 'README.md',          type: 'readme' },
  { repo: 'daffainfo/AllAboutBugBounty',           path: 'Google Dorking.md',  type: 'raw'    },
  { repo: 'eslam3kl/SQLiDetector',                 path: 'README.md',          type: 'readme' },
  { repo: 'MrCl0wnLab/ShellGPT-GoogleHacking',    path: 'README.md',          type: 'readme' },
  { repo: 'xmendez/wfuzz',                        path: 'README.md',          type: 'readme' },
  { repo: 'orwagodfather/Google-Dorking',          path: 'README.md',          type: 'readme' },
];

function apiGet(urlPath, isRaw = false) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'github-actions-dorklib', Accept: 'application/vnd.github.v3+json' };
    if (TOKEN) headers['Authorization'] = `token ${TOKEN}`;
    if (isRaw)  headers['Accept'] = 'application/vnd.github.v3.raw';
    https.request({ hostname: 'api.github.com', path: urlPath, headers }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(isRaw ? d : JSON.parse(d)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null)).end();
  });
}

// Rough heuristics to identify lines that look like Google dorks
function looksLikeDork(line) {
  const l = line.trim();
  if (l.length < 8 || l.length > 400) return false;
  if (l.startsWith('#') || l.startsWith('//') || l.startsWith('http')) return false;
  const OPERATORS = /\b(site:|inurl:|intitle:|intext:|filetype:|ext:|allintitle:|allinurl:|cache:|link:|related:)/i;
  return OPERATORS.test(l);
}

function guessCategory(q) {
  const l = q.toLowerCase();
  if (/admin|login|dashboard|panel|cpanel|phpmyadmin/.test(l)) return 'Web Security';
  if (/aws|azure|gcp|cloud|s3|bucket|storage/.test(l)) return 'Cloud Security';
  if (/api[_ -]?key|token|secret|credential|password|passwd/.test(l)) return 'Vulnerability Research';
  if (/email|linkedin|username|profile|osint|person/.test(l)) return 'OSINT';
  if (/cve-|exploit|vulnerability|nuclei|poc/.test(l)) return 'Vulnerability Research';
  if (/\.env|config|backup|\.sql|\.bak|dump/.test(l)) return 'Web Security';
  if (/firewall|router|network|cisco|juniper|switch/.test(l)) return 'Network Security';
  if (/iot|camera|webcam|scada|modbus/.test(l)) return 'IoT and OT Security';
  return 'Miscellaneous Dorks';
}

function guessDifficulty(q) {
  const qualCount = (q.match(/site:|inurl:|intitle:|filetype:|ext:|after:|before:|-\w+/g) || []).length;
  if (qualCount >= 4) return 'ADVANCED';
  if (qualCount >= 2) return 'INTERMEDIATE';
  return 'BEGINNER';
}

function buildTitle(q) {
  const quoted = [...q.matchAll(/"([^"]+)"/g)].map(m => m[1]);
  if (quoted.length >= 2) return quoted[0] + ' + ' + quoted[1];
  if (quoted.length === 1) return quoted[0];
  return q.slice(0, 60);
}

async function fetchContent(src) {
  const filePath = src.path || 'README.md';
  const content  = await apiGet(`/repos/${src.repo}/contents/${filePath}`, true);
  return content || '';
}

async function main() {
  if (!fs.existsSync(dataFile)) { console.error('data/dorks.json not found'); process.exit(1); }
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const existingQueries = new Set(db.dorks.map(d => d.query.toLowerCase().trim()));
  const startCount = db.dorks.length;
  let nextId = Math.max(0, ...db.dorks.map(d => d.id || 0)) + 1;
  let added = 0;

  for (const src of SOURCES) {
    console.log(`[fetch-github] ${src.repo}…`);
    try {
      const text = await fetchContent(src);
      const lines = text.split('\n');
      for (const line of lines) {
        const q = line.replace(/^[-*•·]\s*/, '').trim().replace(/`/g, '');
        if (!looksLikeDork(q)) continue;
        const key = q.toLowerCase().trim();
        if (existingQueries.has(key)) continue;
        existingQueries.add(key);
        db.dorks.push({
          id: nextId++,
          title: buildTitle(q),
          query: q,
          difficulty: guessDifficulty(q),
          intentType: 'RESEARCH',
          category: guessCategory(q),
          description: `Sourced from github.com/${src.repo}`,
          featured: false,
          source: 'GITHUB',
          addedAt: new Date().toISOString(),
        });
        added++;
      }
    } catch (e) {
      console.warn(`[fetch-github] Failed ${src.repo}:`, e.message);
    }
  }

  db.total = db.dorks.length;
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 0));
  console.log(`[fetch-github] Done — added ${added} new dorks (total: ${db.total}, was: ${startCount})`);
}

main().catch(e => { console.error(e); process.exit(1); });
