const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs');

async function inspect(browser, count) {
  const page = await browser.newPage({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true });
  try {
    await page.addInitScript(age => {
      const done = Array.from({length:29},(_,i)=>String(i+1).padStart(2,'0'));
      localStorage.setItem('minkino-abonelik-v1',JSON.stringify({premium:true,zaman:Date.now()}));
      localStorage.setItem('minkino-kartlar-v1',JSON.stringify({yas:age}));
      localStorage.setItem('minkino-alfabe-v1'+(age===4?'-yas-4':''),JSON.stringify({akisSurumu:2,biten:done,bekleyen:[],son:'29',adimlar:{}}));
    },count===2?4:6);
    await page.goto('http://localhost:5173/alfabe/?test=1&havuz=1');
    await page.locator('.at-hece-ac').click();
    await page.locator('[data-dal=kopru]').click();
    const stage = page.locator('.hk-sahne');
    for(let attempt=0;attempt<18;attempt++){
      await page.locator('.hk-sahne[data-evre=diz]').waitFor();
      if(await page.locator('.hk-yuva').count()===count)break;
      await page.locator('.at-geri').click();
      await page.locator('[data-dal=kopru]').click();
    }
    if(await page.locator('.hk-yuva').count()!==count)throw Error('İstenen taş sayısı gelmedi.');
    const geometry=await stage.evaluate(async el=>{
      const imgs=[...el.querySelectorAll('img')];await Promise.all(imgs.map(i=>i.decode()));
      const base=el.getBoundingClientRect();
      return imgs.map(i=>{const b=i.getBoundingClientRect();return {asset:i.currentSrc.split('/').at(-1),x:b.x-base.x,y:b.y-base.y,w:b.width,h:b.height,inside:b.x>=base.x-1&&b.right<=base.right+1&&b.y>=base.y-1&&b.bottom<=base.bottom+1};});
    });
    if(geometry.some(x=>!x.inside || x.asset.includes('svg')))throw Error('Taşan ya da geçici çizim: '+JSON.stringify(geometry));
    const shot=name=>page.screenshot({path:path.join(__dirname,'prova','h9-'+count+'-'+name+'.png')});
    await shot('kiyi');
    const syllables=(await stage.getAttribute('data-heceler')).split(' ');
    const first=page.locator('.hk-tas:not(.hk-suda)').first();
    for(const syllable of syllables){
      const button=page.locator('.hk-tas:not(.hk-suda)').filter({has:page.locator('span',{hasText:new RegExp('^'+syllable+'$')})}).first();
      await button.click();
    }
    await page.waitForFunction(()=>document.querySelector('.hk-lokum')?.src.includes('lokum-3'));
    await shot('konus');
    await page.waitForFunction(()=>document.querySelector('.hk-sahne')?.dataset.evre==='vardi');
    await shot('sehpa');
    fs.writeFileSync(path.join(__dirname,'prova','h9-'+count+'-konumlar.json'),JSON.stringify(geometry,null,2));
  } finally { await page.close(); }
}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
  await inspect(browser,2); await inspect(browser,3);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
