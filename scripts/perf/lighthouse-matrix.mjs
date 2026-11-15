import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
const phase=process.argv[2];
const runs=Number(process.argv[3] || 3);
const cli=process.env.LIGHTHOUSE_CLI;
if(!cli) throw new Error('Set LIGHTHOUSE_CLI to lighthouse/cli/index.js');
const routes=['','announcements','event-registration','login','signup','signup/pending','signup/verify','signup/complete','forgot-password','forgot-password/verify','reset-password','activate','profile','registrations','create-event','dashboard'];
const summaryPath=`docs/perf/pass2/${phase}-summary.json`;
const summary=fs.existsSync(summaryPath)?JSON.parse(fs.readFileSync(summaryPath)):[];
for(const route of routes) for(const locale of ['en','ar']) for(let run=1;run<=runs;run++) {
 if(process.env.PERF_ROUTES && !process.env.PERF_ROUTES.split(',').includes(route||'/')) continue;
 if(summary.some(r=>r.route===(route||'/') && r.locale===locale && r.run===run)) continue;
 const stem=`docs/perf/pass2/${phase}-${locale}-${route.replaceAll('/','-')||'home'}-${run}`;
 execFileSync(process.execPath,[cli,`http://localhost:3100/${locale}${route?'/'+route:''}`,'--only-categories=performance','--output=json',`--output-path=${stem}.json`,'--chrome-flags=--headless --no-sandbox','--save-assets','--quiet'],{stdio:'ignore',timeout:120000});
 const j=JSON.parse(fs.readFileSync(`${stem}.json`));
 const a=j.audits;
 const row={route:route||'/',locale,run,url:j.finalDisplayedUrl,lcp:a['largest-contentful-paint'].numericValue,cls:a['cumulative-layout-shift'].numericValue,tbt:a['total-blocking-time'].numericValue,lcpDetails:a['lcp-breakdown-insight']?.details,requests:a['network-requests']?.details?.items.map(({url,transferSize,resourceType})=>({url,transferSize,resourceType})),error:j.runtimeError};
 summary.push(row);console.log(JSON.stringify({...row,requests:undefined,lcpDetails:undefined}));
 for(const suffix of ['.json','-0.trace.json','-0.devtoolslog.json']) { const f=stem+suffix;if(fs.existsSync(f)){if(suffix === '.json' || run === 1) fs.writeFileSync(f+'.gz',gzipSync(fs.readFileSync(f)));fs.unlinkSync(f)}}
 fs.writeFileSync(`docs/perf/pass2/${phase}-summary.json`,JSON.stringify(summary,null,2));
}
