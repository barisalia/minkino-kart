import {expect,test} from '@playwright/test';

for(const [width,height] of [[568,320],[844,390]]){
  test(width+' pikselde ikinci raftaki dokuz tezgâhın kendi kapağı görünür',async({page})=>{
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
      expect(kaynak).toContain('/tezgah-kapaklari/'+id);
      await expect(kart).toBeInViewport({ratio:1});
    }
    await page.getByRole('button',{name:'Önceki tarif rafı'}).tap();
    await expect(ilkRaf).toHaveCount(7);
  });
}
