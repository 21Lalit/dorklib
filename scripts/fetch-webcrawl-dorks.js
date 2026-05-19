#!/usr/bin/env node
/**
 * Web-crawl dork harvester — DorkLib
 *
 * Strategy:
 *   1. Fetch each seed URL (public pages known to list Google dork patterns).
 *   2. Extract dork patterns from the HTML (code blocks + plain text).
 *   3. Follow on-domain links that look dork-related (depth = 1, max 4 extra
 *      pages per seed) to catch paginated or categorised sub-pages.
 *   4. Rate-limit: ≥1.5 s between successive requests to the same hostname.
 *
 * No API keys required — pure HTTP(S) with Node.js built-ins.
 */
'use strict';

const https   = require('https');
const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const { URL } = require('url');

const dataFile = path.join(__dirname, '..', 'data', 'dorks.json');

// ── Seed pages ───────────────────────────────────────────────────────────────
// Each entry: { url, label? }
// These are publicly reachable pages that list, demonstrate or collect dorks.
const SEEDS = [
  // Hacking-Articles comprehensive guides (many hands-on dork examples)
  { url: 'https://www.hackingarticles.in/google-dorking-complete-guide/'       },
  { url: 'https://www.hackingarticles.in/google-dorks-for-bug-bounty/'         },
  { url: 'https://www.hackingarticles.in/osint-using-google-dorks/'            },

  // GBHackers security blog
  { url: 'https://gbhackers.com/google-dorks/'                                 },
  { url: 'https://gbhackers.com/category/google-dorks/'                        },

  // Pentest-Tools public dork reference
  { url: 'https://pentest-tools.com/information-gathering/google-hacking'      },

  // SecurityTrails blog — Google hacking techniques
  { url: 'https://securitytrails.com/blog/google-hacking-techniques'           },

  // NmMapper maintained dork list page
  { url: 'https://www.nmmapper.com/sys/tools/google-dork-list/'                },

  // Acunetix web-app security — google hacking article
  { url: 'https://www.acunetix.com/websitesecurity/google-hacking/'            },

  // NullByte / WonderHowTo — google hacks tutorial
  { url: 'https://null-byte.wonderhowto.com/how-to/use-google-hacks-0148321/' },

  // Infosec Institute pentesting resource
  { url: 'https://resources.infosecinstitute.com/topics/penetration-testing/google-hacking-dorks/' },

  // HackTricks — Google Dorks / OSINT
  { url: 'https://book.hacktricks.xyz/generic-methodologies-and-resources/external-recon-methodology/github-leaked-secrets' },
  { url: 'https://book.hacktricks.xyz/generic-methodologies-and-resources/external-recon-methodology' },

  // SecurityOnline blog posts
  { url: 'https://securityonline.info/tag/google-dorks/'                       },

  // HackerTarget — google hacking cheatsheet
  { url: 'https://hackertarget.com/google-hacking-the-ultimate-guide/'         },

  // SANS Internet Storm Center — periodic dork mentions
  { url: 'https://isc.sans.edu/diary/Google+Hacking+-+Using+Google+to+find+vulnerable+targets/27818' },

  // Kitploit security tool blog — google dork tagged posts
  { url: 'https://www.kitploit.com/search/label/Google%20Dorks'               },

  // RedPacket Security — dork lists
  { url: 'https://www.redpacketsecurity.com/category/google-dorks/'            },

  // SearchSploit / Exploit-DB blog
  { url: 'https://www.exploit-db.com/papers/13694'                             },

  // Offensive Security blog article on GHDB
  { url: 'https://www.offensive-security.com/blog/google-hacking-database/'   },

  // BugBountyHunting.com dork guide
  { url: 'https://www.bugbountyhunting.com/google-dorks-for-bug-bounty-hunters/' },

  // Medium / Infosec Write-ups — public dork lists (no login wall)
  { url: 'https://infosecwriteups.com/google-dorking-and-useful-queries-c7c41de9c10c' },

  // Cheatography Google Dork cheat sheet
  { url: 'https://cheatography.com/tag/google-dork/'                           },
];

// Regex to detect lines with Google-search operators
const OPERATORS_RE = /\b(site:|inurl:|intitle:|intext:|filetype:|ext:|allintitle:|allinurl:|cache:|link:|related:)/i;

// Keywords that suggest a followed link will have more dork content
const DORK_LINK_RE = /dork|google.hack|ghdb|hacking.techni|pentest.google|inurl|intext|filetype/i;

const MAX_FOLLOW      = 4;         // extra on-domain pages to crawl per seed
const REQ_TIMEOUT     = 12000;     // ms per HTTP request
const RATE_DELAY_MS   = 1500;      // ms between requests to the same hostname
const MAX_RESPONSE_SIZE = 2_000_000; // bytes — abort oversized responses

// ── HTTP helpers ─────────────────────────────────────────────────────────────

/** ms since epoch of last request per hostname */
const lastReqMs = Object.create(null);

async function _fetchRaw(rawUrl) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(rawUrl); } catch { return resolve(''); }

    const lib     = u.protocol === 'https:' ? https : http;
    const options = {
      hostname: u.hostname,
      path:     u.pathname + u.search,
      headers:  {
        'User-Agent': 'DorkLib-Crawler/1.0 (github.com/21Lalit/dorklib)',
        'Accept':     'text/html,application/xhtml+xml',
      },
    };

    const timer = setTimeout(() => resolve(''), REQ_TIMEOUT);

    const req = lib.request(options, (res) => {
      // Follow one redirect
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        clearTimeout(timer);
        _fetchRaw(new URL(res.headers.location, rawUrl).toString()).then(resolve);
        return;
      }
      let body = '';
      res.on('data', c => { body += c; if (body.length > MAX_RESPONSE_SIZE) req.destroy(); });
      res.on('end', () => { clearTimeout(timer); resolve(body); });
    });

    req.on('error', () => { clearTimeout(timer); resolve(''); });
    req.end();
  });
}

async function fetchWithRateLimit(rawUrl) {
  let hostname;
  try { hostname = new URL(rawUrl).hostname; } catch { return ''; }

  const now  = Date.now();
  const last = lastReqMs[hostname] || 0;
  const wait = RATE_DELAY_MS - (now - last);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));

  lastReqMs[hostname] = Date.now();
  return _fetchRaw(rawUrl);
}

// ── Extraction helpers ────────────────────────────────────────────────────────

/**
 * Pull dork-like strings out of raw HTML.
 * Checks <code>/<pre> blocks first (highest precision), then every stripped
 * text line (lower precision but catches plain-text lists).
 */
function extractDorksFromHtml(html) {
  const found = new Set();

  // 1. High-confidence: <code> and <pre> blocks
  const codeRe = /<(?:code|pre)[^>]*>([\s\S]{4,600}?)<\/(?:code|pre)>/gi;
  for (const m of html.matchAll(codeRe)) {
    for (const line of m[1].split(/[\n\r]+/)) {
      const q = decodeHtmlEntities(line.trim());
      if (isGoodDork(q)) found.add(q);
    }
  }

  // 2. Strip all HTML tags and scan every line.
  // The closing-tag pattern uses \s* to handle optional whitespace (e.g. </script >)
  // but does not allow attributes, as HTML closing tags cannot have them.
  const plain = html.replace(/<style[^>]*>[\s\S]*?<\/\s*style\s*>/gi, ' ')
                    .replace(/<script[^>]*>[\s\S]*?<\/\s*script\s*>/gi, ' ')
                    .replace(/<[^>]+>/g, ' ');

  for (const raw of plain.split(/[\n\r]+/)) {
    const q = decodeHtmlEntities(raw.replace(/\s+/g, ' ').trim());
    if (isGoodDork(q)) found.add(q);
  }

  return [...found];
}

function isGoodDork(q) {
  if (!q || q.length < 8 || q.length > 400) return false;
  if (!OPERATORS_RE.test(q))                return false;
  // Skip if it's just a menu label or a bare URL
  if (/^https?:\/\//i.test(q))             return false;
  if (/^[#<]/.test(q))                     return false;
  return true;
}

function decodeHtmlEntities(s) {
  // Single-pass decode to avoid chained/double-unescaping issues.
  return s.replace(/&(amp|lt|gt|quot|#39|#34|nbsp);/g, (_, e) => {
    switch (e) {
      case 'amp':  return '&';
      case 'lt':   return '<';
      case 'gt':   return '>';
      case 'quot': return '"';
      case '#39':  return "'";
      case '#34':  return '"';
      case 'nbsp': return ' ';
      default:     return `&${e};`;
    }
  });
}

/**
 * Extract absolute same-domain links from HTML that look dork-related.
 */
function extractDorkLinks(html, baseUrl) {
  let base;
  try { base = new URL(baseUrl); } catch { return []; }

  const links = [];
  const hrefRe = /href=["']([^"'#?]{4,300})["']/gi;
  for (const m of html.matchAll(hrefRe)) {
    let href;
    try { href = new URL(m[1], base).toString(); } catch { continue; }

    const u = new URL(href);
    if (u.hostname !== base.hostname) continue;
    if (!DORK_LINK_RE.test(u.pathname + u.search)) continue;
    links.push(href);
  }
  return [...new Set(links)];
}

// ── Category / difficulty helpers ────────────────────────────────────────────

function guessCategory(q) {
  const l = q.toLowerCase();
  if (/admin|login|dashboard|panel|cpanel|phpmyadmin/.test(l))   return 'Web Security';
  if (/aws|azure|gcp|cloud|s3|bucket|storage/.test(l))           return 'Cloud Security';
  if (/api[_ -]?key|token|secret|credential|password|passwd/.test(l)) return 'Vulnerability Research';
  if (/cve-|exploit|vulnerability|nuclei|poc/.test(l))           return 'Vulnerability Research';
  if (/\.env|config|backup|\.sql|\.bak|dump/.test(l))            return 'Web Security';
  if (/email|linkedin|username|profile|osint|person/.test(l))    return 'OSINT';
  if (/firewall|router|network|cisco|juniper|switch/.test(l))    return 'Network Security';
  if (/iot|camera|webcam|scada|modbus/.test(l))                  return 'IoT and OT Security';
  if (/compliance|audit|gdpr|hipaa|iso/.test(l))                 return 'Compliance and Audit';
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

function seedHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function crawlSeed(seedUrl) {
  const visited = new Set([seedUrl]);
  const queue   = [seedUrl];
  const dorks   = [];

  while (queue.length && visited.size < 1 + MAX_FOLLOW) {
    const url = queue.shift();
    console.log(`  [crawl] GET ${url}`);

    const html = await fetchWithRateLimit(url);
    if (!html) { console.warn(`  [crawl] Empty response: ${url}`); continue; }

    dorks.push(...extractDorksFromHtml(html));

    // Only follow links from the seed page (depth = 1)
    if (url === seedUrl) {
      for (const link of extractDorkLinks(html, seedUrl)) {
        if (!visited.has(link) && visited.size < 1 + MAX_FOLLOW) {
          visited.add(link);
          queue.push(link);
        }
      }
    }
  }

  return dorks;
}

async function main() {
  if (!fs.existsSync(dataFile)) { console.error('[fetch-webcrawl] data/dorks.json not found'); process.exit(1); }

  const db = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const existingQueries = new Set(db.dorks.map(d => d.query.toLowerCase().trim()));
  const startCount = db.dorks.length;
  let nextId = Math.max(0, ...db.dorks.map(d => d.id || 0)) + 1;
  let added  = 0;

  for (const seed of SEEDS) {
    console.log(`[fetch-webcrawl] Seed: ${seed.url}`);
    try {
      const dorks = await crawlSeed(seed.url);

      for (const q of dorks) {
        const key = q.toLowerCase().trim();
        if (existingQueries.has(key)) continue;
        existingQueries.add(key);
        db.dorks.push({
          id:         nextId++,
          title:      buildTitle(q),
          query:      q,
          difficulty: guessDifficulty(q),
          intentType: 'RESEARCH',
          category:   guessCategory(q),
          description: `Sourced via web crawl from ${seedHostname(seed.url)}`,
          featured:   false,
          source:     'WEBCRAWL',
          addedAt:    new Date().toISOString(),
        });
        added++;
      }

      console.log(`  [fetch-webcrawl] +${added} total so far after ${seed.url}`);
    } catch (e) {
      console.warn(`[fetch-webcrawl] Failed seed ${seed.url}:`, e.message);
    }
  }

  db.total     = db.dorks.length;
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 0));
  console.log(`[fetch-webcrawl] Done — added ${added} new dorks (total: ${db.total}, was: ${startCount})`);
}

main().catch(e => { console.error('[fetch-webcrawl] Fatal:', e.message); process.exit(1); });
