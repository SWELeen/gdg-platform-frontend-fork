const { chromium } = await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';import path from 'node:path';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])}
const routes=walk('app/[locale]').filter(p=>p.endsWith('/page.tsx')).map(p=>p.replace('app/[locale]','').replace('/page.tsx','').replace(/\/\([^/]+\)/g,'')).filter(p=>!p.includes('['));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const out=[];
for(const locale of ['en','ar']){const page=await browser.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));for(const route of routes){errors=[];try{const response=await page.goto(`${process.env.PERF_BASE_URL || "http://localhost:3100"}/${locale}${route}`,{waitUntil:'load',timeout:30000});await page.waitForTimeout(250);out.push({locale,route,status:response.status(),url:page.url(),errors:[...errors],...await page.evaluate(()=>({dir:document.documentElement.dir,overflow:document.documentElement.scrollWidth>innerWidth}))});}catch(e){out.push({locale,route,error:String(e)})}}await page.close();}await browser.close();fs.writeFileSync(`docs/perf/${process.argv[2]}-routes.json`,JSON.stringify(out,null,2));console.log(JSON.stringify({routes:out.length,errors:out.filter(r=>r.error||r.errors?.length)}));

// Fail the command on regressions; writing a JSON inventory alone is not a check.
const { default: assert } = await import('node:assert/strict');
assert.equal(out.length, 192, 'Update coverage deliberately when adding/removing routes');
for (const row of out) {
  assert.ok(!row.error && !row.errors?.length, `${row.locale}${row.route}: browser exception`);
  assert.equal(row.overflow, false, `${row.locale}${row.route}: horizontal overflow`);
  assert.equal(row.dir, row.locale === 'ar' ? 'rtl' : 'ltr');
  assert.equal(row.status, 200, `${row.locale}${row.route}: final response must succeed`);
}
