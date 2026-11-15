const { chromium } = await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
const phase=process.argv[2];
const root=process.cwd();
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const routes=['','announcements','event-registration','login','signup','signup/pending','signup/verify','signup/complete','forgot-password','forgot-password/verify','reset-password','activate','profile','registrations','create-event','dashboard'];
const out=[];
for(const mobile of [false,true]) for(const locale of ['en','ar']) for(const route of routes){
if(out.some(r=>r.mobile===mobile&&r.locale===locale&&r.route===route))continue;
const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},deviceScaleFactor:1});
const page=await context.newPage(); const errors=[];
page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const cdp=await context.newCDPSession(page);
if(mobile){await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});}
await page.addInitScript(()=>{window.audit={lcp:0,cls:0,tasks:[],events:[],frames:[]};for(const type of ['largest-contentful-paint','layout-shift','longtask','event'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')audit.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)audit.cls+=e.value;if(type==='longtask')audit.tasks.push(e.duration);if(type==='event'&&e.interactionId)audit.events.push(e.duration)}}).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})});}catch{}});
let status;try{status=(await page.goto(`http://localhost:3100/${locale}/${route}`,{waitUntil:'domcontentloaded',timeout:60000})).status();await page.waitForTimeout(mobile?(route?3000:8000):(route?500:1800));
const load=await page.evaluate(()=>({lcp:audit.lcp,cls:audit.cls,longTasks:audit.tasks.length,tbt:audit.tasks.reduce((s,t)=>s+Math.max(0,t-50),0),jsBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('.js')).reduce((s,r)=>s+r.encodedBodySize,0),imageBytes:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='img').reduce((s,r)=>s+r.encodedBodySize,0),fontBytes:performance.getEntriesByType('resource').filter(r=>r.name.includes('.woff')).reduce((s,r)=>s+r.encodedBodySize,0),overflow:document.documentElement.scrollWidth>innerWidth,dir:document.documentElement.dir,fonts:document.fonts.status}));
let scroll={};if(!route){await page.screenshot({path:`${root}/docs/perf/${phase}-${locale}-${mobile?'mobile':'desktop'}.png`});await cdp.send('Tracing.start',{categories:'devtools.timeline',transferMode:'ReturnAsStream'});scroll=await page.evaluate(async()=>{const samples=[];let last=performance.now();const start=last;await new Promise(resolve=>{function frame(now){samples.push(now-last);last=now;window.scrollBy(0,18);if(now-start<3000)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});const sorted=samples.slice().sort((a,b)=>a-b);return {fps:samples.length/3,p95Frame:sorted[Math.floor(sorted.length*.95)],jank:samples.filter(t=>t>50).length}});const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const {stream}=await done;let trace='';for(;;){const r=await cdp.send('IO.read',{handle:stream});trace+=r.data;if(r.eof)break}await cdp.send('IO.close',{handle:stream});fs.writeFileSync(`${root}/docs/perf/${phase}-${locale}-${mobile?'mobile':'desktop'}-trace.json`,trace);

}
out.push({mobile,locale,route,status,url:page.url(),...load,...scroll,errors:[...new Set(errors)]});console.log(JSON.stringify(out.at(-1)));
}catch(e){out.push({mobile,locale,route,error:String(e)})}
fs.writeFileSync(`${root}/docs/perf/${phase}.json`,JSON.stringify(out,null,2));await context.close();}
await browser.close();
