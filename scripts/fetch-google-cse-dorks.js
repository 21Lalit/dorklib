#!/usr/bin/env node
/**
 * Fetches dork patterns via Google Custom Search Engine API
 * and merges new ones into data/dorks.json.
 *
 * Required GitHub secrets:
 *   GOOGLE_CSE_API_KEY  — Google Cloud API key with Custom Search enabled
 *   GOOGLE_CSE_ID       — Programmable Search Engine ID
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const API_KEY = process.env.GOOGLE_CSE_API_KEY;
const CSE_ID  = process.env.GOOGLE_CSE_ID;
const dataFile = path.join(__dirname, '..', 'data', 'dorks.json');

if (!API_KEY || !CSE_ID) {
  console.log('[fetch-google-cse] GOOGLE_CSE_API_KEY or GOOGLE_CSE_ID not set — skipping.');
  process.exit(0);
}

// Search queries designed to surface new dork patterns
const SEARCH_QUERIES = [
  'google dork site:github.com filetype:txt',
  'inurl:admin filetype:php site:github.com dork',
  'new google dorks 2024 2025 security',
  'google hacking database GHDB dorks list',
  '"filetype:" OR "inurl:" OR "intitle:" security dork',
  'google dork "ext:env" OR "ext:sql" OR "ext:bak"',
  'site:exploit-db.com google dork',
  '"inurl:admin" OR "inurl:login" dork list',
];

function cseSearch(query, start = 1) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(query);
    const path = `/customsearch/v1?key=${API_KEY}&cx=${CSE_ID}&q=${q}&start=${start}&num=10`;
    https.request({ hostname: 'www.googleapis.com', path, headers: { 'User-Agent': 'github-actions-dorklib' } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null)).end();
  });
}

const OPERATORS = /\b(site:|inurl:|intitle:|intext:|filetype:|ext:|allintitle:|allinurl:|cache:)/i;

function extractDorksFromSnippet(text) {
  if (!text) return [];
  const found = [];
  // Match code-like patterns: lines with Google operators
  const lines = text.split(/[\n,;|]+/);
  for (const line of lines) {
    const q = line.trim().replace(/[`'"]/g, '');
    if (q.length >= 8 && q.length <= 400 && OPERATORS.test(q)) {
      found.push(q);
    }
  }
  return found;
}

function guessCategory(q) {
  const l = q.toLowerCase();
  if (/admin|login|dashboard|panel|cpanel|phpmyadmin/.test(l)) return 'Web Security';
  if (/aws|azure|gcp|cloud|s3|bucket|storage/.test(l)) return 'Cloud Security';
  if (/api[_ ]?key|token|secret|credential|password|passwd/.test(l)) return 'Vulnerability Research';
  if (/cve-|exploit|vulnerability|nuclei|poc/.test(l)) return 'Vulnerability Research';
  if (/\.env|config|backup|\.sql|\.bak|dump/.test(l)) return 'Web Security';
  if (/email|username|osint|person|linkedin/.test(l)) return 'OSINT';
  if (/network|firewall|router|cisco|switch/.test(l)) return 'Network Security';
  if (/iot|camera|webcam|scada|modbus/.test(l)) return 'IoT and OT Security';
  if (/compliance|audit|gdpr|hipaa|iso/.test(l)) return 'Compliance and Audit';
  return 'Miscellaneous Dorks';
}

function guessDifficulty(q) {
  const n = (q.match(/site:|inurl:|intitle:|filetype:|ext:|after:|before:|-\w+/g) || []).length;
  return n >= 4 ? 'ADVANCED' : n >= 2 ? 'INTERMEDIATE' : 'BEGINNER';
}

function buildTitle(q) {
  const quoted = [...q.matchAll(/"([^"]+)"/g)].map(m => m[1]);
  if (quoted.length >= 2) return quoted[0] + ' + ' + quoted[1];
  if (quoted.length === 1) return quoted[0];
  return q.slice(0, 60);
}

async function main() {
  if (!fs.existsSync(dataFile)) { console.error('[fetch-google-cse] data/dorks.json not found'); process.exit(1); }

  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const existingQueries = new Set(db.dorks.map(d => d.query.toLowerCase().trim()));
  const startCount = db.dorks.length;
  let nextId = Math.max(0, ...db.dorks.map(d => d.id || 0)) + 1;
  let added = 0;
  let apiErrors = 0;

  for (const query of SEARCH_QUERIES) {
    console.log(`[fetch-google-cse] Searching: "${query.slice(0, 50)}…"`);
    const result = await cseSearch(query);

    if (!result || result.error) {
      console.warn('[fetch-google-cse] API error:', result?.error?.message || 'no response');
      apiErrors++;
      if (apiErrors >= 3) { console.warn('[fetch-google-cse] Too many errors, stopping.'); break; }
      continue;
    }

    const items = result.items || [];
    for (const item of items) {
      // Extract dorks from title + snippet
      const candidates = [
        ...extractDorksFromSnippet(item.title || ''),
        ...extractDorksFromSnippet(item.snippet || ''),
      ];

      for (const q of candidates) {
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
          description: `Sourced via Google CSE from: ${item.link || 'google search'}`,
          featured: false,
          source: 'GOOGLE_CSE',
          addedAt: new Date().toISOString(),
        });
        added++;
      }
    }

    // Respect API rate limits — 1 request/second for free tier
    await new Promise(r => setTimeout(r, 1100));
  }

  db.total = db.dorks.length;
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 0));
  console.log(`[fetch-google-cse] Done — added ${added} new dorks (total: ${db.total}, was: ${startCount})`);
}

main().catch(e => { console.error('[fetch-google-cse] Fatal:', e.message); process.exit(1); });
