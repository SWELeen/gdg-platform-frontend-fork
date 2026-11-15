import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PERF_BASE_URL || 'http://localhost:3100';
const phase=process.argv[2];const results=[];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
for(const locale of ['en','ar'])for(const width of [1440,390])for(const theme of ['light','dark']){
 const page=await browser.newPage({viewport:{width,height:900},colorScheme:theme});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(t=>localStorage.setItem('theme',t),theme);
 const common=JSON.parse(fs.readFileSync(`messages/${locale}/common.json`));
 await page.goto(`${base}/${locale}`,{waitUntil:'load'});await page.waitForTimeout(1200);
 const openMenu=async()=>{if(width===390){const b=page.locator('nav > button[aria-expanded]');if(await b.getAttribute('aria-expanded')==='false')await b.click();assert.equal(await b.getAttribute('aria-expanded'),'true')}};
 await openMenu();
 await page.getByRole('button',{name:theme==='light'?common.theme.toDark:common.theme.toLight,exact:true}).filter({visible:true}).first().click();
 await page.waitForFunction(t=>document.documentElement.dataset.theme===t,theme==='light'?'dark':'light');
 for(const from of [locale,locale==='en'?'ar':'en']){
  await openMenu();const next=from==='en'?'ar':'en';
  await page.locator('button:visible').filter({hasText:from==='en'?'العربية':'English'}).first().click();
  await page.waitForURL(`**/${next}`);assert.equal(await page.locator('html').getAttribute('dir'),next==='ar'?'rtl':'ltr');
 }
 await page.goto(`${base}/${locale}/login`,{waitUntil:'load'});
 await page.locator('input[type=email]').fill('not-an-email');await page.locator('form button[type=submit]').click();
 assert.equal(await page.locator('input[type=email]').getAttribute('aria-invalid'),'true');
 await page.locator('input[type=email]').fill('performance@example.com');await page.locator('form button[type=submit]').click();
 const password=page.locator('input[autocomplete=current-password]');await password.waitFor();await password.fill('x');
 const toggle=password.locator('..').locator('button');await toggle.click();assert.equal(await password.getAttribute('type'),'text');await toggle.click();assert.equal(await password.getAttribute('type'),'password');
 await page.goto(`${base}/${locale}/reset-password`,{waitUntil:'load'});
 await page.locator('#new-password').fill('x');await page.locator('#new-password').blur();
 assert.equal(await page.locator('#new-password').getAttribute('aria-invalid'),'true');
 await page.goto(`${base}/${locale}/signup`,{waitUntil:'load'});
 await page.locator('form button[type=submit]').first().click();await page.waitForTimeout(300);
 assert.ok(await page.locator('[aria-invalid=true],[role=alert]').count()>0,'signup must validate empty input');
 assert.deepEqual(errors,[]);
 results.push({locale,width,theme,navigation:true,languageBothDirections:true,rtl:true,themeToggle:true,loginValidation:true,passwordVisibility:true,resetValidation:true,signupValidation:true,errors});
 await page.close();console.log(JSON.stringify(results.at(-1)));
}
await browser.close();
fs.writeFileSync(`docs/perf/pass2/${phase}-functional.json`,JSON.stringify({results,notExercised:['Authenticated QR camera capture/decoding','Authenticated 3D badge interaction','Real backend-driven mutations and valid recovery/invitation links']},null,2));
