import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:844,height:390},reducedMotion:'reduce',hasTouch:true});
page.setDefaultTimeout(7000);
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
const key='pati-yeni-ilerleme-v1';
const url=(process.env.PATI_TEST_URL||'http://127.0.0.1:5182')+'/pati/';
const control=(act,id)=>page.locator('[data-act="'+act+'"]'+(id?'[data-key="'+id+'"]':'')).first();
const click=(act,id)=>control(act,id).tap();
const saved=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
async function snap(name){
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 await page.screenshot({path:'tests/screens/pati-yeni/'+name+'.png'});
}
async function showroom(){await page.goto(url);await control('gece').waitFor();}
async function buy(family,id,price){
 const before=(await saved()).para;
 const water=['balik','beta'].includes(family);
 if(water)await click('akvaryum');
 await click('magaza');await click('raf-tab','hayvan');await click('aile',family);await click('incele',id);await click('satin-al',id);
 await page.locator('.bakim-sahne').waitFor();
 assert.equal((await saved()).para,before-price);
 assert.ok((await saved()).hayvanlar[id]);
 await click('back');
 if(water)await click('back');
}
await page.addInitScript(()=>{Math.random=()=>.65;});
try{
 await mkdir('tests/screens/pati-yeni',{recursive:true});
 await page.goto(url);
 assert.equal(await control('pet','kopek').count(),1);
 await click('akvaryum');assert.equal(await page.locator('[data-act="pet"]').count(),0);
 await click('magaza');await click('raf-tab','hayvan');assert.equal(await control('aile','beta').count(),1);
 assert.equal(await control('aile','kopek').count(),1);await click('back');await click('back');
 // Leave as soon as the drink is delivered; the animation can finish after navigation.
 await click('pet','kopek');await click('drawer');await click('use','su');await click('give');
 await click('back');await showroom();await click('gece');
 const balanceBeforeSleep=(await saved()).para;
 await click('uyu');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).gun===2,key);
 assert.equal((await saved()).para,balanceBeforeSleep+5);
 await page.evaluate(key=>{
  const d=new Date(),gun=[d.getFullYear(),d.getMonth()+1,d.getDate()].join('-');
  localStorage.setItem(key,JSON.stringify({para:240,canta:{biskuvi:3,'pul-yem':1},hayvanlar:{kopek:{gun,bakimlar:['su'],kurdele:true},kedi:{gun,bakimlar:[]}}}));
 },key);
 await showroom();
 assert.equal(await page.locator('.sergi-yeri').count(),2);
 await click('magaza');await click('raf-tab','hayvan');assert.equal(await control('aile','balik').count(),1);await click('back');
 await buy('kedi','kedi-2',40);
 await buy('balik','balik-3',50);
 await buy('beta','beta',36);
 assert.equal(await control('pet','balik-3').count(),0);
 await click('akvaryum');
 assert.equal(await control('pet','kopek').count(),0);
 await control('pet','balik-3').waitFor();await control('pet','beta').waitFor();
 await snap('akvaryum');
 await click('pet','beta');await click('drawer');
 assert.equal(await control('use','su').count(),0);
 await click('use','mama');
 const fishWish=await page.locator('[data-istek]').getAttribute('data-istek');
 await page.locator('[data-food="pul-yem"]').tap();await click('give');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).hayvanlar.beta.bakimlar.includes('mama'),key);
 assert.equal((await saved()).canta['pul-yem'],0);
 await showroom();await click('akvaryum');await click('pet','beta');await click('drawer');await click('use','uyku');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).hayvanlar.beta.bakimlar.includes('uyku'),key);
 await showroom();await click('akvaryum');await click('pet','beta');
 await page.locator('.hareket-uyu').waitFor();assert.equal(await control('drawer').count(),0);
 await showroom();await snap('showroom');
 await click('magaza');await click('raf-tab','hayvan');await click('aile','kedi');
 assert.equal(await page.locator('.cesit-sec').count(),3);
 await click('cesit-ileri');await control('incele','kedi-6').waitFor();await click('cesit-geri');
 await snap('showroom-cesitler');await click('back');
 await click('kart','kedi-2');assert.ok(await control('sat-onay','kedi-2').isDisabled());await click('vazgec');
 await click('pet','kedi-2');await click('drawer');await click('use','su');await click('give');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).hayvanlar['kedi-2'].bakimlar.includes('su'),key);
 await click('use','uyku');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).hayvanlar['kedi-2'].bakimlar.includes('uyku'),key);
 await showroom();await click('gece');
 const before=await saved();
 assert.deepEqual(before.hayvanlar.kedi.bakimlar,[]);
 const fishFoodScore=fishWish==='pul-yem'?10:5;
 // A water care entry survives migration, while the untouched cat contributes nothing.
 assert.deepEqual(before.defter.kopek,{su:5});
 assert.equal(await page.locator('.gelir-listesi li').count(),5);
 assert.equal(before.para,240-40-50-36,'Bakımlar tamamlandığı anda bakiyeyi değiştirmemeli');
 assert.deepEqual(before.defter['kedi-2'],{su:5,uyku:5});
 assert.deepEqual(before.defter.beta,{uyku:5,mama:fishFoodScore});
 await snap('showroom-gece');
 await click('uyu');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).gun===2,key);
 const end=await saved();
 assert.equal(end.para,before.para+5+10+5+fishFoodScore+3+Math.round(Math.floor((5+fishFoodScore)/2)*.5));
 assert.deepEqual(end.defter,{});
 assert.equal(end.canta.biskuvi,3);
 assert.ok(end.hayvanlar.kopek.kurdele);
 assert.equal(end.hayvanlar['kedi-2'].bakimlar.length,0);
 await showroom();await click('pet','kedi-2');await control('drawer').waitFor();await click('back');await click('gece');await click('uyu');
 await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).gun===3,key);
 assert.equal((await saved()).para,end.para);
 await click('kart','kedi-2');await click('sat-onay','kedi-2');await click('vazgec');
 assert.ok((await saved()).hayvanlar['kedi-2']);
 await click('kart','kedi-2');await click('sat-onay','kedi-2');await click('sat','kedi-2');
 await page.waitForFunction(key=>!JSON.parse(localStorage.getItem(key)).hayvanlar['kedi-2'],key);
 assert.equal((await saved()).para,end.para+32);
 await showroom();assert.equal(await control('pet','kedi-2').count(),0);
 assert.ok((await saved()).hayvanlar.kedi);
 await click('akvaryum');await click('kart','beta');await click('sat-onay','beta');await click('sat','beta');
 await page.waitForFunction(k=>!JSON.parse(localStorage.getItem(k)).hayvanlar.beta,key);await page.locator('.sayfa-akvaryum').waitFor();
 assert.ok((await saved()).hayvanlar['balik-3']);
 // Even after selling the last animal, an empty collection survives reload and can start again.
 await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({gun:4,para:0,canta:{},hayvanlar:{}})),key);
 await showroom();assert.equal(await page.locator('.sergi-yeri').count(),0);
 await click('magaza');await click('raf-tab','hayvan');await click('incele','kopek');await click('satin-al','kopek');
 await page.locator('.bakim-sahne').waitFor();
 assert.equal((await saved()).para,0);assert.ok((await saved()).hayvanlar.kopek);
 // Count missed meals in game days. A meal on the last day saves only the pet that ate it.
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({gun:4,para:17,canta:{biskuvi:1},hayvanlar:{
  kopek:{acGun:3,kirGun:2,susuzGun:2},hamster:{acGun:3}
 }})),key);
 await showroom();await click('pet','kopek');await page.locator('.buyuk.karni-gurulduyor.kirli-tuy.susadi').waitFor();
 await snap('ac-ve-kirli');
 await click('bowl');await page.locator('[data-food=biskuvi]').click();await click('give');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).hayvanlar.kopek.acGun===0,key);
 await showroom();await click('gece');assert.equal(await page.locator('.gelir-listesi li').count(),2);
 assert.ok(!(await page.locator('.gelir-listesi').innerText()).includes('🕊️'));
 await click('uyu');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).gun===5,key);
 assert.equal((await saved()).hayvanlar.hamster.hastaGun,5);
 // Buy one dose, use the stored medicine once, then leave a different pet untreated.
 await click('magaza');await click('raf-tab','esya');
 const oldBalance=(await saved()).para;await click('urun-al','ilac');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).canta.ilac===1,key);
 await showroom();await click('pet','hamster');await click('drawer');await click('tedavi');
 await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).hayvanlar.hamster.hastaGun===0,key);
 assert.equal((await saved()).para,oldBalance-3);
 assert.equal((await saved()).canta.ilac||0,0);
 await page.evaluate(k=>{const d=JSON.parse(localStorage.getItem(k));d.hayvanlar.kopek.hastaGun=d.gun;d.hayvanlar.hamster.hastaGun=d.gun;localStorage.setItem(k,JSON.stringify(d));},key);
 await showroom();await click('pet','kopek');await click('drawer');await click('tedavi');
 await page.waitForFunction(k=>!JSON.parse(localStorage.getItem(k)).hayvanlar.kopek.hastaGun,key);
 assert.equal((await saved()).para,oldBalance-6);
 for(let gun=6;gun<=8;gun++){
  await showroom();await click('gece');await click('uyu');
  await page.waitForFunction(([k,n])=>JSON.parse(localStorage.getItem(k)).gun===n,[key,gun]);
  assert.equal(Boolean((await saved()).hayvanlar.hamster),gun<8);
 }
 assert.ok((await saved()).hayvanlar.kopek);
 assert.deepEqual(errors,[]);
 console.log('Eski kayıt, ayrı çeşitler, bakım, satış onayı, gün sonu, boş gün ve yeniden başlama doğrulandı.');
}finally{await browser.close();}
