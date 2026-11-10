import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';

const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:844,height:390}});
const key='pati-yeni-ilerleme-v1';
const url=(process.env.PATI_TEST_URL||'http://127.0.0.1:5194')+'/pati/index.html';
const tap=(act,id)=>page.locator('[data-act="'+act+'"]'+(id?'[data-key="'+id+'"]':'')).first().click();
const snapshot=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
try{
 await page.goto(url);
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({gun:1,para:200,hayvanlar:{kopek:{yuva:true},kedi:{},beta:{}}})),key);
 await page.reload();
 await tap('magaza');await tap('raf-tab','donanim');
 assert.equal(await page.locator('[data-act=donat][data-key=yuva]').getAttribute('aria-pressed'),'true');
 await tap('donat','kayik');await tap('prova','papatya');await tap('donat','papatya');await tap('donat','yuva');await tap('donat','kayik');
 assert.equal((await snapshot()).para,156);
 await tap('back');await tap('pet','kopek');
 const bed=page.locator('.yatak');
 assert.match(await bed.locator('img').getAttribute('src'),/kayik/);
 assert.ok(await bed.isDisabled());await page.clock.setSystemTime(new Date(Date.now()+181000));await page.locator('#pati[data-vakit=gece]').waitFor();
 await page.locator('.oksanabilir').dragTo(bed);
 await page.locator('.yeni-uyku .cizili-uyku.findik').waitFor();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.uyku-karesi:nth-child(4)')).opacity==='1');
 await page.screenshot({path:'tests/screens/pati-yeni/kayikta-findik.png'});
 await page.locator('.siradaki-pati').click();
 await tap('play-prop');
 const center=async locator=>{const r=await locator.boundingBox();return [r.x+r.width/2,r.y+r.height/2];};
 for(let i=0;i<3;i++){
  const fare=page.locator('.oyun-parcasi');
  await page.mouse.move(...await center(fare));await page.mouse.down();
  const izler=await page.locator('.fare-izi').all();
  for(const iz of izler.reverse())await page.mouse.move(...await center(iz),{steps:5});
  await page.mouse.move(...await center(page.locator('.oyun-hedefi')),{steps:5});await page.mouse.up();
  await page.waitForTimeout(780);
 }
 assert.equal((await snapshot()).defter.kedi.oyun,10);
 await page.waitForSelector('.oksanabilir');
 await page.locator('.yatak').click();await page.locator('.yeni-uyku .tekir').waitFor();
 await page.reload();await tap('pet','kedi');
 assert.equal(await page.locator('.yeni-uyku').count(),0);
 await tap('gece');const once=(await snapshot()).para;
 await tap('uyu');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).gun===2,key);
 assert.ok(!(await snapshot()).hayvanlar.kopek.bakimlar.includes('uyku'));
 assert.equal(await page.locator('#pati').getAttribute('data-vakit'),'gunduz');
 assert.ok((await snapshot()).para>once);assert.deepEqual(errors,[]);
 console.log('Eski yuva, ücretsiz yeniden takma, çizimli uyku, sıradaki hayvan, kurmalı fare ve gün sonu doğrulandı.');
}finally{await browser.close();}
