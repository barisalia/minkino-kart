import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome'}),report=[];
try { for(const [name,width,height] of [['telefon',874,402],['tablet',1366,1024]]) {
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.routeWebSocket('**',ws=>ws.close());
 await page.route('**/ingilizce/src/main.ts',r=>r.fulfill({contentType:'text/javascript',body:'import '+JSON.stringify('/ingilizce/src/stil.css')+';document.querySelector('+JSON.stringify('#ingilizce')+').classList.add('+JSON.stringify('ing')+');'}));
 await page.goto('http://localhost:5173/ingilizce/?test=1&taslak',{waitUntil:'networkidle'});
 for(const group of ['deniz','kus','bocek','orman','vahsi','yavru']) {
 await page.evaluate(async(group)=>{
 window.p16Stop?.();
 const {bahceKur}=await import('/ingilizce/src/adimlar/bahce.ts');const {HAYVAN_BOLUMLERI,kelimeBul}=await import('/ingilizce/src/icerik.ts');
 const root=document.querySelector('.ing');root.dataset.ekran='ders';root.dataset.adim='bahce';const alan=document.createElement('div');alan.className='ing-ders-alan';root.replaceChildren(alan);
 const x=HAYVAN_BOLUMLERI.find(x=>x.grup===group);const bolum={...x,hayvanlar:x.hayvanlar.map(kelimeBul),sorular:x.hayvanlar.slice(0,2).map(kelimeBul)};
 window.p16Stop=bahceKur({alan,yas:4,unite:null,bitti(){},cevap(){},hata(){},tekrarla(){},ilkKez(){return true;}},{tip:'bahce',bolumler:[bolum]});
 },group);
 await page.waitForFunction(()=>document.querySelector('.ing-bahce-izgara')?.dataset.hedef,undefined,{timeout:15000});
 await page.waitForTimeout(800);await page.screenshot({path:`ekip/ingilizce/paket16/${name}-${group}.png`});
 report.push(await page.evaluate(({name,group})=>{const a=document.querySelector('.ing-bahce-alan'),r=a.getBoundingClientRect();return{name,group,background:a.style.backgroundImage,images:[...document.querySelectorAll('.ing-bahce-hayvan img')].map(i=>{const b=i.getBoundingClientRect();return{src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0,width:b.width,clipped:b.top<r.top||b.bottom>r.bottom||b.left<r.left||b.right>r.right};})};},{name,group}));
 }
 report.push({name,errors});await page.evaluate(()=>window.p16Stop?.());await page.close();
}}finally{await browser.close();}
fs.writeFileSync('ekip/ingilizce/paket16/oyun-kontrol.json',JSON.stringify({mode:'Isolated actual component and CSS; each group mounted separately. No complete lesson or real audio verification.',report},null,2));console.log(report.map(x=>({device:x.name,group:x.group,errors:x.errors,missing:x.images?.filter(i=>!i.ok).length,clipped:x.images?.filter(i=>i.clipped).length})));


