import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {aileler,cesitler} from '../pati-yeni/cesitler.js';
import {gunGelirleri} from '../pati-yeni/ilerleme.js';
const key='pati-yeni-ilerleme-v1';
const base=process.env.PATI_TEST_URL||'http://127.0.0.1:5194';
const url=base+'/pati/index.html';
const browser=await chromium.launch({channel:'msedge'});
const page=await browser.newPage({viewport:{width:844,height:390}});
page.setDefaultTimeout(9000);
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
const tap=(act,id)=>page.locator('[data-act="'+act+'"]'+(id?'[data-key="'+id+'"]':'')).first().click();
const families=Object.entries(aileler);
assert.equal(Object.keys(cesitler).length,300);
for(const [tur,family] of families){
 assert.equal(family.ids.length,['kedi','kopek'].includes(tur)?50:20);
 assert.deepEqual(family.ids.slice(-3).map(id=>cesitler[id].madalya),['Bronz','Gümüş','Altın']);
 for(const [i,id] of family.ids.entries()){
  if(i)assert.ok(cesitler[id].fiyat>cesitler[family.ids[i-1]].fiyat);
  const data={gun:1,hayvanlar:{[id]:{bakimlar:[],kirGun:0}},defter:{}};
  assert.equal(gunGelirleri(data)[0].gelir,0);
  data.defter[id]={oyun:10,mama:10};
  assert.equal(gunGelirleri(data)[0].gelir,0);
  data.hayvanlar[id].bakimlar.push('uyku');
  assert.equal(gunGelirleri(data)[0].gelir,20+cesitler[id].gelir);
 }
}
try{
 await page.goto(url);
 const owned={};
 for(const room of ['ev','bahce','teraryum','golet']){
  const groups=families.filter(([,f])=>f.ortam===room);
  for(let i=0;i<11;i++){
   const ids=groups[i%groups.length][1].ids, idx=Math.floor(i/groups.length);
   const id=idx%2?ids[idx]:ids[ids.length-1-idx];
   owned[id]={};
  }
 }
 await page.evaluate(([key,owned])=>localStorage.setItem(key,JSON.stringify({gun:1,para:9999,hayvanlar:owned,canta:{}})),[key,owned]);
 await page.reload();
 for(const room of ['ev','bahce','teraryum','golet']){
  if(!await page.locator('.alan-'+room).count())await tap(room==='golet'?'akvaryum':'oda',room);
  const pets=page.locator('.alan .hayvana-git');assert.equal(await pets.count(),10);
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));await document.fonts.ready});
  assert.equal(await page.locator('.harita-ok').count(),2);
  assert.equal((await page.locator('.harita-yonleri').innerText()).trim(),'');
  await page.waitForFunction(()=>document.querySelector('.adimli'));
  await page.mouse.move(0,0);
  for(const pet of await pets.all()){
   await pet.click({trial:true});
  }
  await page.screenshot({path:'tests/screens/pati-yeni/alan-'+room+'.png'});
  await tap('sergi-ileri');assert.equal(await pets.count(),1);
  await tap('pet');await page.locator('.bakim-sahne').waitFor();
  if(room==='golet'){await tap('drawer');assert.equal(await page.locator('[data-key=temizlik],[data-act=banyo]').count(),0);await tap('drawer');}
  await tap('back');
 }
 await tap('oda','ev');await tap('toplu-yika');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).para===9989,key);
 assert.ok(await page.locator('.toplu-yika').isDisabled());
 const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 for(const [id,pet] of Object.entries(after.hayvanlar)){
  assert.equal(pet.bakimlar.length,cesitler[id].ortam==='golet'?0:1);
 }
 await tap('magaza');await tap('raf-tab','hayvan');await tap('aile','kedi');await tap('nadir');
 assert.equal(await page.locator('.cesit-sec[data-metal="Altın"]').count(),1);
 await page.screenshot({path:'tests/screens/pati-yeni/nadir-kediler.png'});
 assert.deepEqual(errors,[]);console.log('300 çeşit, 36 madalya, 4 x 10 dokunma alanı, sayfalama ve bakım geliri doğrulandı.');
}finally{await browser.close();}
