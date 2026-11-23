import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Havanda ayrı yapraklar ezilir, yarım pesto kaydı ve tabağın gerçek dokusu korunur',async({page})=>{
  test.setTimeout(110000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-makarna-v1',JSON.stringify({renk:'altin',kesim:2,sekil:3,tencere:3,tuzlandi:true,suzulen:3,kivamlar:['tam','tam','tam'],istek:'yesil'})));
  await page.locator('[data-tarif=makarna]').click();
  await page.locator('[data-mp-sos=yesil]').press('Enter');
  const el=page.locator('.mp-havan-dokunus'),kap=page.locator('.mp-havan-kabi');
  await expect(el).toBeVisible();
  await expect(page.locator('.mp-havan-aktar')).toBeDisabled();
  const r=await kap.boundingBox();if(!r)throw new Error('Havan görünmüyor');
  const tokmak=await page.locator('.mp-havan-tokmagi').boundingBox();
  if(!tokmak)throw new Error('Tokmak görünmüyor');
  const x=tokmak.x+tokmak.width*.72,y=tokmak.y+tokmak.height*.22;
  await page.mouse.move(x,y);await page.mouse.down();
  // Move the pestle head from its rest point to the right-hand cluster, keeping the grab offset.
  await page.mouse.move(x-.04*r.width,y-.03*r.height,{steps:8});await page.mouse.up();
  await expect(page.locator('.mp-havan-istasyonu')).toHaveAttribute('data-ezilen','2');
  await page.reload();
  await expect(page.locator('.mp-havan-yaprak[data-ezildi=true]')).toHaveCount(1);
  await expect.poll(()=>kap.locator('img').evaluateAll(imgs=>imgs.every(img=>(img as HTMLImageElement).naturalWidth>0))).toBe(true);
  if(process.env.SEF_HAVAN_KARE)await page.locator('.mp-oyun').screenshot({path:process.env.SEF_HAVAN_KARE});
  await page.locator('.mp-havan-aktar').click();
  await expect(page.locator('.mp-tabak-iri-yaprak')).toHaveCount(2);
  await page.locator('[data-mp-sus=peynir]').click();await page.locator('.mp-sus-hedef').click();
  await page.locator('[data-mp-zil]').click();
  // Zilden sonra atölye kapanır, tabak rafın müşterisinin (Zıpzıp) masasına gider; puan kayıtta (eski özet ekranı yok).
  await expect(page.getByRole('button',{name:'Zıpzıp masasına götür'})).toBeVisible();
  await page.reload();
  const foto=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis[0]);
  expect(foto).toMatchObject({puan:2,istekPuani:3,pisirmePuani:3,makarna:{istenenSos:'yesil',sos:'yesil',pestoMaskesi:2}});
});
