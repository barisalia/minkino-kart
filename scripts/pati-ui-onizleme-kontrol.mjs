import { chromium } from '@playwright/test';
import { readFile, mkdir } from 'node:fs/promises';
const html=await readFile('C:/Users/Minkex/.codex/visualizations/2026/11/05/01a1add2-d3de-7d51-8b27-6be1a5cac4ce/pati-ui-onizleme.html','utf8');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1024,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setContent(html);
await mkdir('tests/screens/pati-ui',{recursive:true});
for(const layout of ['bottom','side']){
 await page.evaluate(l=>{for(const s of document.querySelectorAll('[data-variant]'))s.hidden=s.querySelector('[data-layout]').dataset.layout!==l;},layout);
 const host=page.locator(`[data-layout="${layout}"]`);
 const names=await host.locator('.review-nav button').allTextContents();
 for(const name of names){await host.locator('.review-nav').getByRole('button',{name,exact:true}).click();if(await host.locator('.screen-name').textContent()!==name)throw new Error(name);}
 await host.locator('.review-nav').getByRole('button',{name:'Bakım',exact:true}).click();
 await host.getByRole('button',{name:'Temizlik',exact:true}).click();
 await host.getByRole('button',{name:'Fırça',exact:true}).click();
 if(!await host.locator('.toast').isVisible())throw new Error('Bakım etkileşimi');
 await host.locator('.review-nav').getByRole('button',{name:'Salon',exact:true}).click();
 await host.screenshot({path:`tests/screens/pati-ui/${layout}-salon.png`});
 await page.setViewportSize({width:390,height:1000});
 for(const name of names){await host.locator('.review-nav').getByRole('button',{name,exact:true}).click();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw new Error(`Dar ekran taşması: ${layout}/${name}`);}
 await page.setViewportSize({width:1024,height:900});
}
await browser.close();
if(errors.length)throw new Error(errors.join('\n'));
console.log('İki düzen × 12 ekran, dar ekran genişliği ve bakım seçimi doğrulandı.');
