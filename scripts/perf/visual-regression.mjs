import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
const phase=process.argv[2];
const base=process.env.PERF_BASE_URL || 'http://localhost:3100';
const output=process.env.PERF_VISUAL_DIR || '/tmp/gdg-pass2-visual';
fs.mkdirSync(`${output}/${phase}`,{recursive:true});
const routes=['','announcements','event-registration','login','signup','signup/pending','signup/verify','signup/complete','forgot-password','forgot-password/verify','reset-password','activate','profile','registrations','create-event','dashboard'];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
for(const theme of ['light','dark'])for(const width of [1440,390])for(const locale of ['en','ar'])for(const route of routes){
 const key=`${locale}-${route.replaceAll('/','-')||'home'}-${width}-${theme}`;
 if(process.env.PERF_VISUAL_KEYS && !process.env.PERF_VISUAL_KEYS.split(',').includes(key))continue;
 const page=await browser.newPage({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(theme=>localStorage.setItem('theme',theme),theme);
 await page.goto(`${base}/${locale}${route?'/'+route:''}`,{waitUntil:'load',timeout:60000});
 await page.evaluate(()=>document.fonts.ready);
 // Traverse the whole page so lazy artwork/counters settle before the full-page capture.
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,80))}scrollTo({top:0,behavior:'instant'})});
 await page.waitForTimeout(1800);
 await page.evaluate(async()=>{await Promise.race([Promise.all([...document.images].filter(i=>i.offsetWidth && i.complete).map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,3000))]);await document.fonts.ready;scrollTo({top:0,behavior:'instant'})});
 // Snapshot-only normalization: finish finite WAAPI effects, pause loops and
 // stop JS animation frames after settling. Motion is tested separately on live pages.
 await page.evaluate(async()=>{
  const frame=window.requestAnimationFrame.bind(window);
  for(const animation of document.getAnimations()){
   if(Number.isFinite(animation.effect?.getComputedTiming().endTime))animation.finish();
   else {animation.pause();animation.currentTime=0;}
  }
  await new Promise(resolve=>frame(()=>frame(resolve)));
  const last=frame(()=>{});
  for(let id=0;id<=last;id++)window.cancelAnimationFrame(id);
 });
 // Require two consecutive identical full-page captures. The first capture can
 // settle scroll-driven transforms or the browser's raster cache.
 let previous=await page.screenshot({fullPage:true,animations:'disabled'});
 let stable=false, captureAttempts=0;
 for(;captureAttempts<12;captureAttempts++){
  await page.waitForTimeout(250);
  const current=await page.screenshot({fullPage:true,animations:'disabled'});
  if(current.equals(previous)){stable=true;break;}
  previous=current;
 }
 assert.ok(stable,`${key}: screenshot did not settle`);
 fs.writeFileSync(`${output}/${phase}/${key}.png`,previous);
 const state=await page.evaluate(()=>({
  dir:document.documentElement.dir,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth,
  links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.textContent.trim(),href:a.href.startsWith(location.origin)?a.href.slice(location.origin.length):a.href})),
  controls:[...document.querySelectorAll('input,select,textarea,button')].map(e=>({tag:e.tagName,type:e.type,name:e.name,text:(e.textContent||e.getAttribute('aria-label')||'').trim(),disabled:e.disabled})),
  text:document.body.innerText.replace(/\s+/g,' ').trim()
 }));
 assert.equal(state.dir,locale==='ar'?'rtl':'ltr',key);
 assert.equal(state.overflow,false,key);
 assert.deepEqual(errors,[],key);
 const url=new URL(page.url());
 results.push({key,locale,route,width,theme,captureAttempts:captureAttempts+2,url:url.pathname+url.search,...state,errors});
 fs.writeFileSync(`${output}/${phase}.json`,JSON.stringify(results,null,2));
 console.log(key);
 await page.close();
}
await browser.close();assert.equal(results.length,process.env.PERF_VISUAL_KEYS?process.env.PERF_VISUAL_KEYS.split(',').length:128);
