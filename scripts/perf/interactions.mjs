const { chromium } = await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
const phase=process.argv[2],out=[];const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
for(const reducedMotion of ['no-preference','reduce'])for(const locale of ['en','ar']){
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion});await page.goto(`${process.env.PERF_BASE_URL || "http://localhost:3100"}/${locale}`,{waitUntil:'networkidle'});await page.waitForTimeout(1800);
async function writes(){return page.evaluate(async()=>{let count=0;const svg=document.querySelector('path[fill="url(#grad-lRed)"]').ownerSVGElement;const ob=new MutationObserver(list=>count+=list.length);ob.observe(svg,{subtree:true,attributes:true,attributeFilter:['d','x1','x2']});await new Promise(r=>setTimeout(r,1000));ob.disconnect();return count})}
const visible=await writes();await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(500);const offscreen=await writes();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(800);const resumed=await writes();
await page.evaluate(()=>{window.shifts=[];window.interactions=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>shifts.push({value:e.value,input:e.hadRecentInput}))).observe({type:'layout-shift'});new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(e.interactionId)interactions.push(e.duration)})).observe({type:'event',durationThreshold:16});});
const start=Date.now();await page.locator('button').filter({hasText:locale==='en'?'العربية':'English'}).first().click();await page.waitForURL(`**/${locale==='en'?'ar':'en'}`);await page.waitForTimeout(1800);
const detail=await page.evaluate(()=>({switchCls:shifts.filter(e=>!e.input).reduce((s,e)=>s+e.value,0),switchShiftAll:shifts.reduce((s,e)=>s+e.value,0),interactionMax:Math.max(0,...interactions),dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth,js:performance.getEntriesByType('resource').filter(e=>e.name.includes('.js')).map(e=>({url:new URL(e.name).pathname,bytes:e.encodedBodySize})),images:performance.getEntriesByType('resource').filter(e=>e.initiatorType==='img').map(e=>({url:new URL(e.name).pathname+new URL(e.name).search,bytes:e.encodedBodySize})),fonts:performance.getEntriesByType('resource').filter(e=>e.name.includes('.woff')).map(e=>({url:new URL(e.name).pathname,bytes:e.encodedBodySize}))}));out.push({locale,reducedMotion,visible,offscreen,resumed,switchMs:Date.now()-start,...detail});console.log(JSON.stringify(out.at(-1)));await page.close();}
await browser.close();fs.writeFileSync(`docs/perf/${phase}-interactions.json`,JSON.stringify(out,null,2));

if (phase !== "before") {
  const { default: assert } = await import("node:assert/strict");
  for (const row of out) {
    assert.equal(row.offscreen, 0, "offscreen ribbons must stop");
    assert.equal(row.overflow, false);
    assert.equal(row.dir, row.locale === "en" ? "rtl" : "ltr");
    if (row.reducedMotion === "reduce") {
      assert.equal(row.visible, 0, "reduced motion must disable ribbon loops");
    } else {
      assert.ok(row.visible > 0 && row.resumed > 0, "visible ribbons must run and resume");
    }
  }
}
