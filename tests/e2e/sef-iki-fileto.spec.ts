import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test('Tavada kalan ikinci fileto kızarırken tabağa alınan ilk fileto aynı kalır',async({page},info)=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});
  await page.clock.install();
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const id='fiyonk-tavuk';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:id,oynanan:'tavuk',restoranda:true,restoran:{sira:1,menuId:id,evre:'mutfak'},masalar:{[id]:{
        tabaklar:{},sunuldu:false,adim:{tavuk:4,icecek:0},tavaKaydi:{ilk:0,ikinci:0,son:0,ekSure:2500,ates:true,puan:3}}}
    }}));
  });
  await page.reload();
  const tava=page.locator('.tv-mutfak');
  await expect(tava).toHaveAttribute('data-isiniyor','false');
  await page.locator('[data-fileto="0"]').press('Enter');await page.locator('.tv-tabak').press('Enter');
  await expect(tava).toHaveAttribute('data-adet','5');
  await page.evaluate(()=>sessionStorage.clear());
  await page.reload();await expect(tava).toHaveAttribute('data-adet','5');
  await page.clock.fastForward(10500);
  await expect(page.locator('[data-fileto="1"] img')).toHaveAttribute('src',/fazla.webp/);
  await expect(page.locator('[data-fileto="0"] img')).toHaveAttribute('src',/pisti.webp/);
  await page.getByRole('button',{name:'Isıyı kapat'}).press('Enter');
  await page.clock.fastForward(24000);
  await expect(page.locator('[data-fileto="1"] img')).toHaveAttribute('src',/fazla.webp/);
  await page.getByRole('button',{name:'Tavukları şimdi tabağa al'}).press('Enter');
  const tabak=page.locator('.tepsi-yuva[data-parca=tavuk]');
  await expect(tabak.locator('.tv-porsiyon-fileto')).toHaveCount(2);
  await page.reload();
  await expect(tabak.locator('.tv-porsiyon-fileto').first()).toHaveAttribute('data-pisme','3');
  await expect(tabak.locator('.tv-porsiyon-fileto').last()).toHaveAttribute('data-pisme','2');
  await page.getByRole('button',{name:'Tavada Tavuk siparişi ile tabağı karşılaştır'}).tap();
  await expect(page.getByRole('dialog').locator('.sef-yildizlar')).toHaveAttribute('data-puan','2');
  await page.screenshot({path:info.outputPath('iki-fileto.png')});
});
