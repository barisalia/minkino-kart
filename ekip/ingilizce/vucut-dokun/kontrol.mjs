import fs from 'node:fs';
import {chromium} from 'playwright';
const dir='ekip/ingilizce/vucut-dokun', {points,boxes}=JSON.parse(fs.readFileSync(dir+'/koordinatlar.json'));const browser=await chromium.launch({channel:'chrome'});const report=[];
try{
 for(const [name,width,height] of [['telefon',844,390],['tablet',1024,768]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.routeWebSocket('**',w=>w.close());await page.route('**/ingilizce/src/main.ts*',r=>r.fulfill({contentType:'text/javascript',body:"import '/ingilizce/src/stil.css';import '/ingilizce/src/adimlar/ada-oyunlari.css';document.querySelector('#ingilizce').classList.add('ing');"}));
  await page.goto('http://localhost:5173/ingilizce/?test=1&taslak');await page.evaluate(async keys=>{
   const {vucutDokunKur}=await import('/ingilizce/src/adimlar/vucut-dokun.ts');const root=document.querySelector('.ing');root.dataset.ekran='ders';root.dataset.adim='adaOyunu';const area=document.createElement('div');area.className='ing-ders-alan';root.replaceChildren(area);window.answers=[];
   vucutDokunKur({alan:area,yas:4,unite:null,ilkKez:()=>false,tekrarla(){},hata(){throw Error('Yanlış hedef')},cevap(k){window.answers.push(k)},bitti(){window.done=true}},{ad:'dokun',turlar:keys});
  },Object.keys(points).map(k=>k.split('-')[0]));
  const pic=page.locator('img.ing-ao-beden-resim');await pic.waitFor();await page.waitForFunction(()=>document.querySelector('img.ing-ao-beden-resim')?.naturalWidth===800);
  for(const [i,[id,[x,y]]] of Object.entries(points).entries()){
   await page.waitForFunction(i=>window.answers.length===i&&document.querySelector('.ing-ao-beden').dataset.bekliyor==='true',i);const box=await pic.boundingBox();const px=box.x+x/800*box.width,py=box.y+y/1200*box.height;
   const hit=await page.evaluate(([x,y])=>document.elementFromPoint(x,y)?.closest('[data-kart]')?.dataset.kart,[px,py]);if(hit!==id)throw Error(JSON.stringify({name,id,hit,box}));
   if(i===0)await page.screenshot({path:dir+'/'+name+'.png'});await page.touchscreen.tap(px,py);
  }
  await page.waitForFunction(()=>window.done);report.push({name,answers:await page.evaluate(()=>window.answers),errors});await page.close();
 }
}finally{await browser.close()}
fs.writeFileSync(dir+'/oyun-kontrol.json',JSON.stringify(report,null,2));console.log(report);

