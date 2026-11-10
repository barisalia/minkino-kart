import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {aileler} from '../pati-yeni/cesitler.js';
const browser=await chromium.launch({channel:'msedge'});
try{
 const page=await browser.newPage({viewport:{width:844,height:390}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(owned=>{
  localStorage.setItem('pati-yeni-ilerleme-v1',JSON.stringify({gun:1,para:100,hayvanlar:owned,canta:{}}));
  let time=performance.now(),queue=[],seed=883;
  Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  window.requestAnimationFrame=cb=>queue.push(cb);
  window.frame=()=>{time+=40;const batch=queue;queue=[];for(const cb of batch)cb(time);};
 },Object.fromEntries(Object.keys(aileler).map(t=>[t,{}])));
 await page.goto((process.env.PATI_TEST_URL||'http://127.0.0.1:5194')+'/pati/');
 for(const room of ['ev','bahce','teraryum','golet']){
  if(room!=='ev')await page.locator('.harita-ok.sag').evaluate(b=>b.click());
  const results=await page.evaluate(async()=>{
   const pets=[...document.querySelectorAll('.sergi-yeri')];
   const records=pets.map(()=>({dirs:new Set(),rest:0,moving:0,wasMoving:false,lastEnd:-Infinity}));
   let error='';
   for(let i=0;i<6200;i++){
    if(i%50===0)await new Promise(r=>setTimeout(r,4));
    window.frame();
    for(const [j,el] of pets.entries()){
     const rec=records[j],move=el.classList.contains('adimli'),x=parseFloat(el.style.left);
     if(move){
      rec.moving++;
      if(!rec.wasMoving){
       if((i-rec.lastEnd)*40<11000)error='short rest '+el.dataset.aile;
       if(!rec.turned)error='missing anticipation '+el.dataset.aile;
       const art=el.querySelector('.sergi-hayvan');
       if(getComputedStyle(art).animationName==='none')error='missing gait '+el.dataset.aile;
       const side=el.querySelector('.yan-bas');
       if(side&&getComputedStyle(side).visibility!=='visible')error='missing turned face';
      }
      if(Math.abs(x-rec.x)>.02){
       const dir=x>rec.x?'sag':'sol';rec.dirs.add(dir);
       if(el.dataset.bakis!==dir)error='facing against travel '+el.dataset.aile;
      }
     }else{
      rec.rest++;
      if(rec.wasMoving)rec.lastEnd=i;
      if(!el.classList.contains('yoneldi')&&rec.x!==undefined&&Math.abs(x-rec.x)>.15)error='idle drift';
     }
     rec.turned=el.classList.contains('yoneldi');rec.wasMoving=move;rec.x=x;
    }
   }
   return {error,pets:records.map((r,j)=>[pets[j].dataset.aile,r.dirs.size,r.rest/(r.rest+r.moving)])};
  });
  assert.equal(results.error,'');
  for(const [tur,dirs,rest] of results.pets){assert.equal(dirs,2,tur);assert.ok(rest>.70,tur+' rest '+rest);}
  console.log(room,results.pets.map(p=>p[0]+' '+Math.round(p[2]*100)+'%').join(', '));
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
