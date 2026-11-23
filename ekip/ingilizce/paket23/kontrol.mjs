import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome'});
const points={'kutu-ic':[1025,550],'masa-ust':[672,460],'masa-alt':[670,764],'yatak-ust':[1350,518],'sandalye-ust':[160,507],'sandalye-yan':[360,704]};
const results=[];
try {
 for(const [name,width,height] of [['telefon',844,390],['tablet',1366,1024]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:true}); await page.routeWebSocket('**',s=>s.close());
 await page.addInitScript(()=>localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:4})));
 await page.goto('http://localhost:5173/ingilizce/?test=1&ekran=oyunlar',{waitUntil:'domcontentloaded'});await page.locator('.ing-saklambac-karti').click();
 const room=page.locator('.ing-sk-oda');const turns=[];
 for(let i=0;i<4;i++){
 await page.waitForFunction(i=>{const r=document.querySelector('.ing-sk-oda');return r?.dataset.bekliyor==='true' && r.dataset.hedef!==i},turns.at(-1)?.target);
 const target=await room.getAttribute('data-hedef'),rect=await room.boundingBox();const hits=await page.evaluate(({points,rect})=>Object.fromEntries(Object.entries(points).map(([k,[x,y]])=>[k,document.elementFromPoint(rect.x+x*rect.width/1600,rect.y+y*rect.height/900)?.closest('[data-yer]')?.dataset.yer])),{points,rect});
 const art=await room.locator('img').evaluateAll(xs=>xs.map(x=>({src:x.getAttribute('src'),loaded:x.complete&&x.naturalWidth>0})));
 if(i===0)await page.screenshot({path:'ekip/ingilizce/paket23/'+name+'.png'});
 if(hits[target]!==target||!art.some(i=>i.loaded&&i.src.includes('oda.webp'))) throw Error(JSON.stringify({name,target,hits,art}));
 const [x,y]=points[target]; await page.touchscreen.tap(rect.x+x*rect.width/1600,rect.y+y*rect.height/900);turns.push({target,hits,art});
 }
 await page.locator('.ing-sonuc-baslik').waitFor();results.push({name,turns});await page.close();
 }
 fs.writeFileSync('ekip/ingilizce/paket23/oyun-kontrol.json',JSON.stringify(results,null,2));console.log(results.map(x=>[x.name,x.turns.map(t=>t.target)]));
}finally{await browser.close()}
