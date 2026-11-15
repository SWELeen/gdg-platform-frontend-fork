import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
const before=JSON.parse(fs.readFileSync('docs/perf/pass2/before-summary.json'));
const after=JSON.parse(fs.readFileSync('docs/perf/pass2/after-summary.json'));
const median=(rows,key)=>rows.map(r=>r[key]).sort((a,b)=>a-b)[Math.floor(rows.length/2)];
const routes=[...new Set(before.map(r=>r.route))];
let table='| Route | EN LCP before → after (s) | AR LCP before → after (s) | CLS EN / AR | TBT EN / AR (ms) |\n|---|---:|---:|---:|---:|\n';
for(const route of routes){
 const results=['en','ar'].map(locale=>{
  const rows=after.filter(r=>r.route===route&&r.locale===locale);
  if(rows.length!==3||rows.some(r=>r.error||!['lcp','cls','tbt'].every(key=>Number.isFinite(r[key]))))throw new Error(`Incomplete measurements: ${locale}/${route}`);
  return {lcp:median(rows,'lcp'),cls:median(rows,'cls'),tbt:median(rows,'tbt'),before:before.find(r=>r.route===route&&r.locale===locale).lcp};
 });
 table+=`| ${route} | ${results.map(r=>`${(r.before/1000).toFixed(2)} → ${(r.lcp/1000).toFixed(2)}`).join(' | ')} | ${results.map(r=>r.cls.toFixed(3)).join(' / ')} | ${results.map(r=>r.tbt.toFixed(0)).join(' / ')} |\n`;
}
fs.writeFileSync('docs/perf/pass2/table.md',table);console.log(table);
// The breakdown timings are observed localhost trace timings, not simulated
// Lighthouse medians. Retain both, without adding the two timing models.
const diagnostics=[];
for(const route of routes)for(const locale of ['en','ar']){
 const stem=`docs/perf/pass2/after-${locale}-${route==='/'?'home':route.replaceAll('/','-')}-1`;
 const report=JSON.parse(gunzipSync(fs.readFileSync(stem+'.json.gz')));
 const trace=JSON.parse(gunzipSync(fs.readFileSync(stem+'-0.trace.json.gz')));
 const audits=report.audits;
 const items=audits['lcp-breakdown-insight']?.details?.items || [];
 const requests=audits['network-requests']?.details?.items || [];
 diagnostics.push({route,locale,lcpElement:items.find(i=>i.type==='node'),traceLcpCandidate:trace.traceEvents.filter(e=>e.name==='largestContentfulPaint::Candidate'&&e.args?.data?.isMainFrame).at(-1)?.args?.data,observedTraceBreakdown:items.find(i=>i.type==='table')?.items,
  transferByType:requests.reduce((sum,r)=>({...sum,[r.resourceType]:(sum[r.resourceType]||0)+r.transferSize}),{}),
  renderBlocking:audits['render-blocking-insight']?.details,
  mainThread:audits['mainthread-work-breakdown']?.details,
  layoutShiftCulprits:audits['cls-culprits-insight']?.details,
  thirdParty:audits['third-parties-insight']?.details});
}
fs.writeFileSync('docs/perf/pass2/diagnostics.json',JSON.stringify(diagnostics,null,2));
const chartData=routes.map(route=>({route,...Object.fromEntries(['en','ar'].map(locale=>[locale,{before:before.find(r=>r.route===route&&r.locale===locale).lcp/1000,after:median(after.filter(r=>r.route===route&&r.locale===locale),'lcp')/1000}]))}));
const html=`<!doctype html><meta charset="utf-8"><style>
body{font-family:var(--font-sans,system-ui);color:var(--foreground);margin:0}button{font:inherit;color:inherit;background:var(--secondary);border:1px solid var(--border);padding:6px 14px;border-radius:var(--radius,6px);cursor:pointer}.legend{display:flex;gap:14px;font-size:12px;margin:12px 0}.row{display:grid;grid-template-columns:140px 1fr 90px;gap:8px;align-items:center;min-height:34px;font-size:12px}.track{position:relative;height:22px}.bar{height:8px;margin:2px 0;border-radius:2px}.before{background:var(--chart-2,#8b95a5)}.after{background:var(--chart-1,#36a87b)}.target{position:absolute;left:25%;top:0;bottom:0;border-left:1px dashed var(--muted-foreground,#999)}.values{text-align:right;font-variant-numeric:tabular-nums}@media(max-width:480px){.row{grid-template-columns:110px 1fr 76px;font-size:10px}}
</style><div><button onclick="draw('en')">EN</button> <button onclick="draw('ar')">AR</button><div class="legend"><span>LCP seconds · <i class="before" style="display:inline-block;width:10px;height:8px"></i> Before <i class="after" style="display:inline-block;width:10px;height:8px"></i> After</span><span>Dashed line: 2.5 s target</span></div><div id="rows"></div><p style="font-size:12px;color:var(--muted-foreground)">Before: one run on pass-1 revision. After: median of 3 mobile runs. Signed-out demo mode; dashboard/create-event include login redirects.</p></div><script>
const data=${JSON.stringify(chartData)};
function draw(locale){document.getElementById('rows').innerHTML=data.map(r=>{const v=r[locale];return '<div class="row"><span>'+r.route+'</span><div class="track"><div class="target"></div><div class="bar before" style="width:'+Math.min(100,v.before*10)+'%"></div><div class="bar after" style="width:'+Math.min(100,v.after*10)+'%"></div></div><span class="values">'+v.before.toFixed(2)+' → '+v.after.toFixed(2)+'</span></div>'}).join('')}draw('en');
</script>`;
fs.writeFileSync('docs/perf/pass2/lcp-chart.html',html);
