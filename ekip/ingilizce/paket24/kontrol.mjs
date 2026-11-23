import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{
 for(const [device,width,height] of [['telefon',844,390],['tablet',1024,768]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.routeWebSocket('**',ws=>ws.close());
 await page.addInitScript(()=>{
 const islands='ciftlik renkler sayilar yiyecekler oyuncaklar ailem yuzum kiyafetler odam tasitlar hareketler vahsi meyve hava doga evim okul duygular sekiller sofra park vucudum gunum sayilar2'.split(' ');
 localStorage.setItem('minkino-ingilizce-v1',JSON.stringify({surum:1,dersler:Object.fromEntries(islands.flatMap(u=>[1,2,3].map(n=>[u+'-'+n,3]))),kelimeler:{},cikartmalar:[],tekrar:{gun:'',adet:0},gunler:[],tanisildi:true}));
 });
 await page.goto('http://localhost:5173/ingilizce/?test=1&taslak',{waitUntil:'networkidle'});await page.locator('.ing-ae-giris').click();const items=page.locator('.ing-ae-esya');await items.first().waitFor();const count=await items.count();if(count!==24)throw Error('Beklenen 24 eşya, görülen '+count);
 for(const state of [1,0]){
 for(const item of await items.all()){const r=await item.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);if(await item.getAttribute('data-durum')!==String(state))throw Error('Dokunma eşleşmedi: '+await item.getAttribute('data-esya'));}
 await page.waitForTimeout(650);await page.screenshot({path:'ekip/ingilizce/paket24/'+device+'-'+state+'.png'});
 }
 const imgs=await page.locator('.ing-ae-sahne img').evaluateAll(xs=>xs.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));if(imgs.length!==51||imgs.some(i=>!i.ok)||errors.length)throw Error(JSON.stringify({count:imgs.length,errors}));
 results.push({device,width,height,count,taps:2*count,errors,images:imgs.length});await page.close();
 }
}finally{await browser.close();}
fs.writeFileSync('ekip/ingilizce/paket24/oyun-kontrol.json',JSON.stringify(results,null,2));console.log(results);

