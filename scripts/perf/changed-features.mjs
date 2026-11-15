import fs from 'node:fs';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PERF_PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PERF_BASE_URL || 'http://localhost:3100';
const phase=process.argv[2];
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try {
 for(const locale of ['en','ar'])for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900}});
  const errors=[],mutations=[];
  page.on('pageerror',e=>errors.push(e.message));
  // This probe is for demo builds only. Prevent any accidental real mutation.
  await page.route('**/*',route=>{
   const request=route.request();
   if(!['GET','HEAD'].includes(request.method())){mutations.push({url:request.url(),method:request.method()});return route.abort();}
   return route.continue();
  });
  const t=JSON.parse(fs.readFileSync(`messages/${locale}/userRegistrations.json`));
  await page.goto(`${base}/${locale}/registrations`,{waitUntil:'load'});
  const confirm=page.getByRole('button',{name:t.confirmAction,exact:true}).first();
  await confirm.click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('button',{name:t.actionDialog.backButton,exact:true}).click();
  assert.equal(await page.locator('dialog[open]').count(),0);
  await confirm.click();
  await dialog.getByRole('button',{name:t.actionDialog.confirmButton,exact:true}).click();
  await page.getByRole('status').filter({hasText:t.confirmSuccess}).waitFor();
  await page.getByRole('button',{name:t.cancelAction,exact:true}).first().click();
  await dialog.getByRole('button',{name:t.actionDialog.cancelButton,exact:true}).click();
  await page.getByRole('status').filter({hasText:t.cancelSuccess}).waitFor();
  // Exercise the native image fallback after the Next Image wrapper change.
  const earlyFailure=process.env.PERF_EARLY_IMAGE_FAILURE==='1';
  if(earlyFailure)await page.route('**/images/event-image.png',route=>route.abort());
  await page.goto(`${base}/${locale}/event-registration`,{waitUntil:'load'});
  if(!earlyFailure){
   await page.waitForTimeout(1200);
   await page.route('**/images/event-image.png?perf-failure=1',route=>route.abort());
   await page.locator('img[src$="/images/event-image.png"]').evaluate(img=>{img.src='/images/event-image.png?perf-failure=1';});
  }
  const fallback=page.locator('img[src$="/images/event-placeholder.png"]');
  await fallback.waitFor();
  await fallback.evaluate(img=>img.decode());
  assert.ok(await fallback.evaluate(img=>img.complete&&img.naturalWidth>0));
  assert.deepEqual(errors,[]);assert.deepEqual(mutations,[]);
  const result={locale,width,demoConfirmDismiss:true,demoConfirmFeedback:true,demoCancelFeedback:true,eventImageFallback:true,earlyFailure,errors,mutations};
  results.push(result);console.log(JSON.stringify(result));await page.close();
 }
} finally {await browser.close();}
fs.writeFileSync(`docs/perf/pass2/${phase}-changed-features.json`,JSON.stringify(results,null,2));
