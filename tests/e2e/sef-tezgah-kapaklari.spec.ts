import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

for(const [width,height] of [[568,320],[844,390]]){
  // İkinci raf kartları ilk sürümden (15 Kasım) beri birinci raftaki gibi sade tarif simgelerini kullanıyor (ikon-atolyesi/tarif);
  // assets/sef/tezgah-kapaklari/ çizimleri hiçbir yerde kullanılmıyor.
  test(width+' pikselde ikinci raftaki dokuz tezgâhın kendi simgesi görünür',async({page})=>{
    await page.setViewportSize({width,height});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    await page.goto('./sef/?test=1');
    const ilkRaf=page.locator('.siparis-karti[data-tarif]');
    await expect(ilkRaf).toHaveCount(7);
    await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
    const kartlar=page.locator('.siparis-karti[data-tezgah]');
    await expect(kartlar).toHaveCount(9);
    for(const kart of await kartlar.all()){
      const id=await kart.getAttribute('data-tezgah');
      const img=kart.locator('.raf-gorseli img');
      await img.evaluate(el=>(el as HTMLImageElement).decode());
      const kaynak=await img.evaluate(el=>(el as HTMLImageElement).currentSrc);
      expect(kaynak).toContain('/ikon-atolyesi/tarif/'+id+'.webp');
      expect(await img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
      await expect(kart).toBeInViewport({ratio:1});
    }
    await page.getByRole('button',{name:'Önceki tarif rafı'}).tap();
    await expect(ilkRaf).toHaveCount(7);
  });
}
