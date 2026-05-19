#!/usr/bin/env node
/**
 * Fetches dork patterns from curated security RSS feeds
 * and merges new ones into data/dorks.json.
 *
 * No external dependencies — uses Node.js built-ins only.
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const { parse } = require('url');

const dataFile = path.join(__dirname, '..', 'data', 'dorks.json');

// Security RSS feeds likely to mention search operators / dorks
const RSS_FEEDS = [
  'https://feeds.feedburner.com/NakedSecurity',
  'https://www.exploit-db.com/rss.xml',
  'https://krebsonsecurity.com/feed/',
  'https://threatpost.com/feed/',
  'https://www.darkreading.com/rss.xml',
  'https://feeds.feedburner.com/securityweek',
  'https://www.securityweek.com/feed/',
  'https://isc.sans.edu/rssfeed_full.xml',
  'https://blog.rapid7.com/rss/',
  'https://portswigger.net/blog/rss',
  'https://feeds.feedburner.com/HackRead',
  'https://www.bleepingcomputer.com/feed/',
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    const u = parse(url);
    const lib = u.protocol === 'https:' ? https : http;
    const timeout = setTimeout(() => resolve(''), 10000);
    lib.get({ hostname: u.hostname, path: u.path || '/', headers: { 'User-Agent': 'github-actions-dorklib' } }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { clearTimeout(timeout); resolve(d); });
    }).on('error', () => { clearTimeout(timeout); resolve(''); });
  });
}

function extractDorksFromText(text) {
  // Look for code blocks or inline code containing Google operators
  const OPERATORS = /\b(site:|inurl:|intitle:|intext:|filetype:|ext:|allintitle:|allinurl:)/i;
  const found = [];

  // 1. Match <code>...</code> or backtick spans
  const codeBlocks = [...text.matchAll(/<code[^>]*>([^<]{8,300})<\/code>/gi)].map(m => m[1]);
  for (const block of codeBlocks) {
    const q = block.trim().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#34;/g,'"');
    if (OPERATORS.test(q) && q.length >= 8 && q.length <= 400) found.push(q);
  }

  // 2. Scan plain text lines (strip HTML tags first) for dork-like patterns
  const plainText = text.replace(/<[^>]+>/g, ' ');
  const lines = plainText.split(/[\n\r]+/);
  for (const line of lines) {
    const q = line.trim()
      .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
      .replace(/&quot;/g,'"').replace(/&#34;/g,'"').replace(/&#39;/g,"'")
      .replace(/\s+/g,' ');
    if (q.length >= 8 && q.length <= 400 && OPERATORS.test(q)
        && !q.startsWith('http') && !q.startsWith('#')) {
      found.push(q);
    }
  }

  return found;
}

function guessCategory(q) {
  const l = q.toLowerCase();
  if (/admin|login|dashboard|panel/.test(l)) return 'Web Security';
  if (/aws|azure|s3|cloud/.test(l)) return 'Cloud Security';
  if (/api[_ ]?key|token|secret|credential|password/.test(l)) return 'Vulnerability Research';
  if (/cve-|exploit|vulnerability/.test(l)) return 'Vulnerability Research';
  if (/\.env|config|backup|\.sql|dump/.test(l)) return 'Web Security';
  if (/network|firewall|router/.test(l)) return 'Network Security';
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
  if (!fs.existsSync(dataFile)) { console.error('data/dorks.json not found'); process.exit(1); }
  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const existingQueries = new Set(db.dorks.map(d => d.query.toLowerCase().trim()));
  const startCount = db.dorks.length;
  let nextId = Math.max(0, ...db.dorks.map(d => d.id || 0)) + 1;
  let added = 0;

  for (const feed of RSS_FEEDS) {
    console.log(`[fetch-rss] ${feed}…`);
    try {
      const xml = await fetchUrl(feed);
      if (!xml) { console.warn('[fetch-rss] Empty response, skipping'); continue; }
      const dorks = extractDorksFromText(xml);
      for (const q of dorks) {
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
          description: `Sourced from RSS: ${new URL(feed).hostname}`,
          featured: false,
          source: 'RSS',
          addedAt: new Date().toISOString(),
        });
        added++;
      }
    } catch (e) {
      console.warn(`[fetch-rss] Failed ${feed}:`, e.message);
    }
  }

  db.total = db.dorks.length;
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 0));
  console.log(`[fetch-rss] Done — added ${added} new dorks (total: ${db.total}, was: ${startCount})`);
}

main().catch(e => { console.error(e); process.exit(1); });
