import { chromium } from 'playwright';
import fs from 'node:fs';
const out='ekip/ingilizce/paket14';
const browser=await chromium.launch({channel:'chrome'});
const report=[];
try {
  for(const [name,width,height] of [['telefon',874,402],['tablet',1366,1024]]){
    const page=await browser.newPage({viewport:{width,height}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:5173/ingilizce/?test=1&taslak',{waitUntil:'networkidle'});
    await page.evaluate(async()=>{
      const {sarkiKur}=await import('/ingilizce/src/adimlar/sarki.ts');
      const {SARKILAR}=await import('/ingilizce/src/sarkilar.ts');
      const root=document.querySelector('.ing');root.dataset.ekran='ders';root.dataset.adim='sarki';
      const area=document.createElement('div');area.className='ing-ders-alan';root.replaceChildren(area);
      window.stopP14=sarkiKur({alan:area,yas:4,unite:null,bitti(){},cevap(){},hata(){},tekrarla(){},ilkKez(){return true;}},{tip:'sarki',sarki:SARKILAR[0]});
      window.p14Samples=[];
      window.p14Observer=new MutationObserver(()=>{
        const img=document.querySelector('.ing-sarki-polly img:not([hidden])');
        if(img) window.p14Samples.push({t:performance.now(),pose:img.dataset.kare});
      });
      window.p14Observer.observe(area,{subtree:true,attributes:true,attributeFilter:['hidden']});
    });
    await page.waitForTimeout(2100);
    await page.screenshot({path:`${out}/${name}-sahne.png`});
    for(let i=0;i<4;i++){
      await page.waitForFunction(i=>document.querySelector(`.ing-sarki-polly img[data-kare="sarki-${i}"]`)?.hidden===false,i);
      await page.locator('.ing-sarki-sahne').screenshot({path:`${out}/${name}-poz-${i}.png`});
    }
    const data=await page.evaluate(()=>({samples:window.p14Samples,images:[...document.querySelectorAll('.ing-sarki img')].filter(i=>!i.hidden).map(i=>({src:i.getAttribute('src'),complete:i.complete,natural:[i.naturalWidth,i.naturalHeight]}))}));
    await page.evaluate(()=>{window.p14Observer.disconnect();window.stopP14();});
    report.push({name,width,height,errors,...data});await page.close();
  }
} finally {await browser.close();}
fs.writeFileSync(`${out}/oynatim-kontrol.json`,JSON.stringify({mode:'Isolated actual song component and CSS, test mode, no audio; completion callback held for visual inspection. Not full lesson or audio approval.',devices:report},null,2));
console.log(report.map(r=>({device:r.name,errors:r.errors,poses:[...new Set(r.samples.map(s=>s.pose))]})));
