import fs from 'node:fs';
import assert from 'node:assert/strict';
const {PNG}=await import(process.env.PERF_PNG_MODULE || 'pngjs');
const {default:pixelmatch}=await import(process.env.PERF_PIXELMATCH_MODULE || 'pixelmatch');
const root=process.env.PERF_VISUAL_DIR || '/tmp/gdg-pass2-visual';
const before=JSON.parse(fs.readFileSync(`${root}/before.json`));
const after=JSON.parse(fs.readFileSync(`${root}/after.json`));
if(!process.env.PERF_PARTIAL){assert.equal(before.length,128);assert.equal(after.length,128);}
fs.mkdirSync(`${root}/diff`,{recursive:true});
for(const row of after){const previous=`${root}/diff/${row.key}.png`;if(fs.existsSync(previous))fs.unlinkSync(previous);}
const results=[];
for(const a of after){
 const b=before.find(b=>b.key===a.key);if(!b && process.env.PERF_PARTIAL)continue;assert.ok(b);
 const left=PNG.sync.read(fs.readFileSync(`${root}/before/${a.key}.png`));
 const right=PNG.sync.read(fs.readFileSync(`${root}/after/${a.key}.png`));
 const sameSize=left.width===right.width&&left.height===right.height;
 let pixels=null, exactPixels=null;
 if(sameSize){exactPixels=0;for(let i=0;i<left.data.length;i+=4){if(left.data[i]!==right.data[i]||left.data[i+1]!==right.data[i+1]||left.data[i+2]!==right.data[i+2]||left.data[i+3]!==right.data[i+3])exactPixels++;}const diff=new PNG({width:left.width,height:left.height});pixels=pixelmatch(left.data,right.data,diff.data,left.width,left.height,{threshold:0.1,includeAA:false});if(pixels)fs.writeFileSync(`${root}/diff/${a.key}.png`,PNG.sync.write(diff));}
 results.push({key:a.key,sameSize,beforeSize:[left.width,left.height],afterSize:[right.width,right.height],pixels,exactPixels,ratio:pixels===null?null:pixels/(left.width*left.height),linksEqual:JSON.stringify(a.links)===JSON.stringify(b.links),controlsEqual:JSON.stringify(a.controls)===JSON.stringify(b.controls),textEqual:a.text===b.text,urlEqual:a.url===b.url});
}
fs.writeFileSync(`${root}/diff.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify({captures:results.length,sizeChanges:results.filter(x=>!x.sameSize),functionalDifferences:results.filter(x=>!x.linksEqual||!x.controlsEqual||!x.textEqual||!x.urlEqual),pixelChanges:results.filter(x=>x.pixels).sort((a,b)=>b.ratio-a.ratio)},null,2));
if(!process.env.PERF_PARTIAL){
 assert.ok(results.every(r=>r.linksEqual&&r.controlsEqual&&r.textEqual&&r.urlEqual),'Functional inventory changed');
 assert.ok(results.every(r=>r.sameSize),'Screenshot geometry changed; investigate before accepting');
}
