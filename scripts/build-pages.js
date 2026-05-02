#!/usr/bin/env node
/**
 * Fetches all dorks from the live Replit API and rebuilds index.html.
 * Used by GitHub Actions to auto-update GitHub Pages every 6 hours.
 *
 * Required env var: REPLIT_API_URL — base URL of the deployed Replit app
 *   e.g. https://your-app.replit.app
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const { parse } = require('url');

const API_BASE = (process.env.REPLIT_API_URL || '').replace(/\/$/, '');
if (!API_BASE) {
  console.error('[build-pages] REPLIT_API_URL is not set. Add it as a GitHub Actions secret.');
  process.exit(1);
}

function fetchPage(page) {
  const u = parse(API_BASE + '/api/dorks?limit=500&page=' + page);
  const lib = u.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    lib.get(
      { hostname: u.hostname, path: u.path, headers: { 'User-Agent': 'github-actions-dorklib' } },
      res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => {
          try { resolve(JSON.parse(d)); }
          catch (e) { reject(new Error('Bad JSON page ' + page + ': ' + d.slice(0, 120))); }
        });
      }
    ).on('error', reject);
  });
}

const ROOT_SLUG_MAP = {
  'web-security':'Web Security','cloud-security':'Cloud Security','ai-security':'AI Security',
  'osint':'OSINT','blue-team':'Blue Team','devsecops':'DevSecOps',
  'identity-access':'Identity and Access','vulnerability-research':'Vulnerability Research',
  'compliance-audit':'Compliance and Audit','digital-forensics':'Digital Forensics & IR',
  'threat-intelligence':'Threat Intelligence','learning-labs':'Learning and Labs',
  'network-security':'Network Security','mobile-security':'Mobile Security',
  'iot-ot-security':'IoT and OT Security','misc-dorks':'Miscellaneous Dorks','red-team':'Red Team',
};
function getRootCat(dk) {
  if (!dk.primaryCategory) return 'Miscellaneous Dorks';
  const k = (dk.primaryCategory.slug || '').split('--')[0];
  return ROOT_SLUG_MAP[k] || 'Miscellaneous Dorks';
}
const HIGH = new Set(['CREDENTIAL_HARVESTING','DATA_EXPOSURE','ADMIN_ACCESS','VULNERABILITY_DISCOVERY']);

const CAT_ICONS = {
  'All':'✦','Web Security':'🌐','Cloud Security':'☁️','Network Security':'🔌','DevSecOps':'⚙️',
  'OSINT':'🔍','Red Team':'🗡️','Blue Team':'🛡️','AI Security':'🤖',
  'Vulnerability Research':'🔬','Compliance and Audit':'📋','Identity and Access':'🔑',
  'IoT and OT Security':'🔧','Digital Forensics & IR':'🔎','Threat Intelligence':'🎯',
  'Mobile Security':'📱','Learning and Labs':'📚','Miscellaneous Dorks':'🗂️',
};

const DIFF_CFG = {
  BEGINNER:    { label:'Beginner',     color:'#2a6a3c', bg:'rgba(42,106,60,0.10)',  border:'rgba(42,106,60,0.22)'  },
  INTERMEDIATE:{ label:'Intermediate', color:'#7a520c', bg:'rgba(122,82,12,0.10)',  border:'rgba(122,82,12,0.22)'  },
  ADVANCED:    { label:'Advanced',     color:'#8a2a20', bg:'rgba(138,42,32,0.10)',  border:'rgba(138,42,32,0.22)'  },
  EXPERT:      { label:'Expert',       color:'#5a2a8a', bg:'rgba(90,42,138,0.10)',  border:'rgba(90,42,138,0.22)'  },
};

async function main() {
  console.log('[build-pages] Fetching from', API_BASE);
  const first = await fetchPage(1);
  if (!first.dorks) throw new Error('Unexpected API response: ' + JSON.stringify(first).slice(0, 200));
  const total = first.total;
  const pages = Math.ceil(total / 500);
  const raw = [...first.dorks];
  for (let p = 2; p <= pages; p++) {
    const r = await fetchPage(p);
    raw.push(...r.dorks);
    process.stdout.write('\r[build-pages] Fetched ' + raw.length + '/' + total);
  }
  console.log('\n[build-pages] Total:', raw.length, 'dorks');

  const dorks = raw.map(dk => ({
    id: dk.id,
    title: dk.title || 'Untitled',
    query: dk.queryTemplate || dk.optimizedQuery || '',
    diff: dk.difficulty || 'BEGINNER',
    cat: getRootCat(dk),
    desc: (dk.description || dk.usageContext || '').slice(0, 180),
    featured: dk.difficulty === 'ADVANCED' && HIGH.has(dk.intentType),
  }));

  const cats = ['All', ...[...new Set(dorks.map(x => x.cat))].sort()];
  const TOTAL = dorks.length.toLocaleString();
  const CATCOUNT = cats.length - 1;
  const DATE = new Date().toISOString().slice(0, 10);

  const DJ  = JSON.stringify(dorks).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  const CJ  = JSON.stringify(cats);
  const IJ  = JSON.stringify(CAT_ICONS);
  const DFJ = JSON.stringify(DIFF_CFG);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>DorkLib — ${TOTAL} Security Dork Patterns</title>
<meta name="description" content="${TOTAL} curated Google-style search dork patterns for cybersecurity."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{min-height:100vh;background:#f5f1eb;font-family:'DM Sans',sans-serif;color:#1a1410;overflow-x:hidden}
nav{position:sticky;top:0;z-index:50;border-bottom:1px solid #d8cfc4;background:rgba(245,241,235,0.94);backdrop-filter:blur(12px);padding:0 40px;display:flex;align-items:center;justify-content:space-between;height:48px}
.logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:900;color:#1a1410;letter-spacing:-0.03em;text-decoration:none}.logo em{font-style:italic;font-weight:400}
.nav-stats{display:flex;gap:6px}.nav-stat{font-size:11px;color:#7a6a58;border:1px solid #d0c8bc;border-radius:20px;padding:3px 12px}
.main{max-width:1100px;margin:0 auto;padding:0 40px 100px}
.hero{text-align:center;padding:40px 0 24px;border-bottom:2px solid #1a1410}
.eyebrow{font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#7a6a58;margin-bottom:18px}
h1{font-family:'Playfair Display',serif;font-size:80px;font-weight:900;line-height:1;letter-spacing:-0.04em;color:#1a1410;margin-bottom:4px}
h1 em{font-style:italic;font-weight:400}
.sub{font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#7a6a58;margin-bottom:24px}
.rule2{height:3px;background:#1a1410;margin-bottom:2px}.rule1{height:1px;background:#1a1410;margin-bottom:28px}
.search-row{display:flex;gap:10px;max-width:520px;margin:0 auto 20px}
.search-row input{flex:1;border:1px solid #c8c0b4;border-radius:4px;padding:10px 14px;font-size:14px;color:#1a1410;font-family:'DM Sans',sans-serif;background:#fff}
.search-row input:focus{outline:none;border-color:#8a7a68}
.search-row button{background:#1a1410;color:#f5f1eb;border:none;border-radius:4px;padding:10px 22px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:0.04em;white-space:nowrap}
.search-row button:hover{background:#2a2018}
.quick-chips{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:36px}
.quick-chip{font-family:'DM Mono',monospace;font-size:11px;border:1px solid #c8c0b4;border-radius:3px;padding:4px 10px;cursor:pointer;color:#5a4a38;background:transparent;transition:all 0.15s}
.quick-chip:hover{border-color:#8a7a68;color:#1a1410}
.pills-section{padding:28px 0 0}.pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:32px}
.pill{border:1px solid #c8c0b4;border-radius:100px;background:transparent;font-size:12px;padding:5px 16px;cursor:pointer;transition:all 0.15s;color:#6a5a48;font-family:'DM Sans',sans-serif;white-space:nowrap}
.pill:hover{border-color:#8a7a68;color:#1a1410}.pill.active{background:#1a1410;border-color:#1a1410;color:#f5f1eb}
.section-hdr{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.section-lbl{font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#7a6a58}
.section-line{flex:1;height:1px;background:#d0c8bc}.section-count{font-size:11px;color:#b0a090}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:12px;margin-bottom:40px}
.feat-card{background:#fff;border:1px solid #d0c8bc;border-radius:4px;padding:24px;cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden}
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:#1a1410}
.feat-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateY(-1px)}.feat-card.open{background:#faf8f4}
.card-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
.card-cat{font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:#8a7a68}
.diff-badge{font-size:10px;font-weight:600;letter-spacing:0.06em;padding:2px 9px;border-radius:2px}
.card-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#1a1410;line-height:1.35;margin-bottom:8px}
.card-desc{font-size:12px;color:#7a6a58;line-height:1.7}
.list-wrap{border:1px solid #d0c8bc;border-radius:4px;overflow:hidden;background:#fff}
.dork-row{border-bottom:1px solid #ece5dc;cursor:pointer;transition:background 0.12s}
.dork-row:last-child{border-bottom:none}.dork-row:hover{background:#faf8f4}.dork-row.open{background:#faf8f4}
.row-main{display:grid;grid-template-columns:1fr 160px 130px 18px;gap:16px;padding:13px 18px;align-items:center}
.row-title{font-size:13px;color:#2a1e14;font-weight:500;margin-bottom:2px;line-height:1.4}
.row-desc{font-size:11px;color:#9a8a78;line-height:1.5}.row-cat{font-size:11px;color:#8a7a68}
.row-diff{font-size:11px;font-weight:600}.row-chev{color:#b0a090;transition:transform 0.18s;flex-shrink:0}
.dork-row.open .row-chev{transform:rotate(180deg)}.row-detail{padding:0 18px 14px 18px}
.qblock{background:#f5f1eb;border:1px solid #d8cfc4;border-radius:3px;padding:12px 14px;display:flex;gap:10px;align-items:flex-start}
.qcode{font-family:'DM Mono',monospace;font-size:12px;color:#2a1e14;line-height:1.7;flex:1;word-break:break-all}
.copy-btn{border:1px solid #c8c0b4;background:transparent;color:#6a5a48;font-family:'DM Sans',sans-serif;font-size:11px;padding:4px 12px;border-radius:3px;cursor:pointer;transition:all 0.14s;flex-shrink:0}
.copy-btn:hover{border-color:#8a7a68;color:#1a1410}.copy-btn.ok{border-color:#4a8a5c!important;color:#4a8a5c!important}
.feat-qblock{background:#f5f1eb;border:1px solid #d8cfc4;border-radius:3px;padding:11px 14px;margin:12px 0 8px;display:flex;gap:10px;align-items:flex-start}
.empty{text-align:center;padding:80px 0;font-size:13px;color:#9a8a78}
.pagination{display:flex;gap:6px;justify-content:center;align-items:center;padding:28px 0 0}
.pg-btn{border:1px solid #c8c0b4;border-radius:3px;background:transparent;color:#6a5a48;font-family:'DM Sans',sans-serif;font-size:12px;padding:6px 14px;cursor:pointer;transition:all 0.13s}
.pg-btn:hover{border-color:#8a7a68;color:#1a1410}.pg-btn.active{background:#1a1410;border-color:#1a1410;color:#f5f1eb}
.pg-btn:disabled{opacity:0.3;cursor:default}.pg-info{font-size:12px;color:#9a8a78;padding:0 6px}
.updated-badge{position:fixed;bottom:16px;right:16px;font-size:10px;color:#9a8a78;background:rgba(245,241,235,0.9);border:1px solid #d0c8bc;border-radius:20px;padding:4px 12px;letter-spacing:0.06em}
@media(max-width:680px){nav{padding:0 16px}.main{padding:0 16px 80px}h1{font-size:52px}.search-row{flex-direction:column}.row-main{grid-template-columns:1fr 18px;gap:8px}.row-cat,.row-diff{display:none}}
</style>
</head>
<body>
<nav>
  <a class="logo" href="#">DORK<em>Lib</em></a>
  <div class="nav-stats">
    <span class="nav-stat"><span id="nav-count">${TOTAL}</span> patterns</span>
    <span class="nav-stat">${CATCOUNT} categories</span>
  </div>
</nav>
<div class="main">
  <div class="hero">
    <div class="eyebrow">Est. 2024 · Security Intelligence</div>
    <h1>DORK<em>Lib</em></h1>
    <div class="sub">Cybersecurity Intelligence Library</div>
    <div class="rule2"></div><div class="rule1"></div>
    <div class="search-row">
      <input type="text" id="search" placeholder="Search ${TOTAL} patterns…" autocomplete="off" spellcheck="false"/>
      <button onclick="doSearch()">Search</button>
    </div>
    <div class="quick-chips">
      <span style="font-size:11px;color:#9a8a78;margin-right:4px">Popular:</span>
      ${['site: filetype:','intitle:admin','inurl:api','filetype:pdf','ext:env'].map(s=>`<button class="quick-chip" onclick="quickSearch('${s}')">${s}</button>`).join('')}
    </div>
  </div>
  <div class="pills-section">
    <div class="pills" id="pills"></div>
    <div id="feat-section">
      <div class="section-hdr">
        <span class="section-lbl" style="color:#8a3a2a">High Severity</span>
        <div class="section-line" style="background:rgba(138,58,42,0.2)"></div>
      </div>
      <div class="feat-grid" id="feat-grid"></div>
    </div>
    <div id="list-section">
      <div class="section-hdr">
        <span class="section-lbl">All Patterns</span>
        <div class="section-line"></div>
        <span class="section-count" id="list-count"></span>
      </div>
      <div class="list-wrap" id="list-wrap"></div>
      <div class="pagination" id="pagination"></div>
    </div>
    <div class="empty" id="empty" style="display:none">No patterns match your search.</div>
  </div>
</div>
<div class="updated-badge">Updated ${DATE}</div>
<script>
const DORKS=${DJ};const CATS=${CJ};const ICONS=${IJ};const DIFF_CFG=${DFJ};
const PAGE_SIZE=50;
let activeCat='All',activeSearch='',openId=null,currentPage=1;
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function dc(d){return DIFF_CFG[d]||DIFF_CFG.BEGINNER;}
function getFiltered(){const q=activeSearch.toLowerCase();return DORKS.filter(d=>(activeCat==='All'||d.cat===activeCat)&&(!q||d.title.toLowerCase().includes(q)||d.query.toLowerCase().includes(q)||d.cat.toLowerCase().includes(q)));}
function renderPills(){document.getElementById('pills').innerHTML=CATS.map(c=>\`<button class="pill\${c===activeCat?' active':''}" onclick="setCat('\${c.replace(/'/g,String.fromCharCode(92)+"'")}')">\${ICONS[c]?' '+ICONS[c]+' ':''}\${esc(c)}</button>\`).join('');}
function setCat(c){activeCat=c;currentPage=1;openId=null;renderPills();renderAll();}
document.getElementById('search').addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
function doSearch(){activeSearch=document.getElementById('search').value;currentPage=1;openId=null;renderAll();}
function quickSearch(s){document.getElementById('search').value=s;doSearch();}
function toggleRow(id){openId=openId===id?null:id;renderAll();}
function copyQuery(id,q){navigator.clipboard.writeText(q).catch(()=>{const t=document.createElement('textarea');t.value=q;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);});const btn=document.querySelector('[data-copy="'+id+'"]');if(btn){btn.textContent='✓ Copied';btn.classList.add('ok');setTimeout(()=>{btn.textContent='Copy';btn.classList.remove('ok');},1500);}}
function renderAll(){
  const list=getFiltered();const feat=list.filter(d=>d.featured);const rest=list.filter(d=>!d.featured);
  const empty=document.getElementById('empty');const featSec=document.getElementById('feat-section');const listSec=document.getElementById('list-section');
  document.getElementById('nav-count').textContent=list.length.toLocaleString();
  if(!list.length){empty.style.display='block';featSec.style.display='none';listSec.style.display='none';return;}
  empty.style.display='none';
  if(feat.length){
    featSec.style.display='block';
    document.getElementById('feat-grid').innerHTML=feat.map(d=>{const cfg=dc(d.diff);const isOpen=openId===d.id;
      return '<div class="feat-card'+(isOpen?' open':'')+'" onclick="toggleRow('+d.id+')"><div class="card-top"><span class="card-cat">'+esc(d.cat)+'</span><span class="diff-badge" style="color:'+cfg.color+';background:'+cfg.bg+';border:1px solid '+cfg.border+'">'+cfg.label+'</span></div><div class="card-title">'+esc(d.title)+'</div>'+(d.desc?'<div class="card-desc">'+esc(d.desc.slice(0,160))+'</div>':'')+(isOpen?'<div class="feat-qblock" onclick="event.stopPropagation()"><code class="qcode">'+esc(d.query)+'</code><button class="copy-btn" data-copy="'+d.id+'" onclick="copyQuery('+d.id+','+JSON.stringify(d.query)+')">Copy</button></div>':'')+'</div>';
    }).join('');
  } else { featSec.style.display='none'; }
  const totalPages=Math.max(1,Math.ceil(rest.length/PAGE_SIZE));if(currentPage>totalPages)currentPage=totalPages;
  const start=(currentPage-1)*PAGE_SIZE;const pageItems=rest.slice(start,start+PAGE_SIZE);
  document.getElementById('list-count').textContent=rest.length.toLocaleString()+' results';
  document.getElementById('list-wrap').innerHTML=pageItems.map(d=>{const cfg=dc(d.diff);const isOpen=openId===d.id;
    return '<div class="dork-row'+(isOpen?' open':'')+'" onclick="toggleRow('+d.id+')"><div class="row-main"><div><div class="row-title">'+esc(d.title)+'</div>'+(d.desc?'<div class="row-desc">'+esc(d.desc.slice(0,90))+'</div>':'')+'</div><span class="row-cat">'+esc(d.cat)+'</span><span class="row-diff" style="color:'+cfg.color+'">'+cfg.label+'</span><svg class="row-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div>'+(isOpen?'<div class="row-detail" onclick="event.stopPropagation()"><div class="qblock"><code class="qcode">'+esc(d.query)+'</code><button class="copy-btn" data-copy="'+d.id+'" onclick="copyQuery('+d.id+','+JSON.stringify(d.query)+')">Copy</button></div></div>':'')+'</div>';
  }).join('');
  if(totalPages<=1){document.getElementById('pagination').innerHTML='';listSec.style.display='block';return;}
  let pgHTML='<button class="pg-btn" '+(currentPage===1?'disabled':'')+' onclick="goPage('+(currentPage-1)+')">← Prev</button>';
  const sp=[];if(totalPages<=7){for(let i=1;i<=totalPages;i++)sp.push(i);}else{sp.push(1);if(currentPage>3)sp.push('…');for(let i=Math.max(2,currentPage-1);i<=Math.min(totalPages-1,currentPage+1);i++)sp.push(i);if(currentPage<totalPages-2)sp.push('…');sp.push(totalPages);}
  sp.forEach(p=>{if(p==='…'){pgHTML+='<span class="pg-info">…</span>';}else{pgHTML+='<button class="pg-btn'+(p===currentPage?' active':'')+'" onclick="goPage('+p+')">'+p+'</button>';}});
  pgHTML+='<button class="pg-btn" '+(currentPage===totalPages?'disabled':'')+' onclick="goPage('+(currentPage+1)+')">Next →</button>';
  pgHTML+='<span class="pg-info">pg '+currentPage+'/'+totalPages+'</span>';
  document.getElementById('pagination').innerHTML=pgHTML;listSec.style.display='block';
}
function goPage(p){currentPage=p;openId=null;renderAll();window.scrollTo({top:document.querySelector('.pills-section').offsetTop-60,behavior:'smooth'});}
renderPills();renderAll();
</script>
</body>
</html>`;

  fs.writeFileSync('index.html', html);
  console.log('[build-pages] Wrote index.html —', raw.length, 'dorks,', (Buffer.byteLength(html) / 1024).toFixed(0) + 'KB, dated', DATE);
}

main().catch(e => { console.error('[build-pages] Fatal:', e.message); process.exit(1); });
