import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Resimli tarif kitabı 16 Kasım'da (c3d9d09a) kaldırıldı. Omlet artık panodaki ikinci tarif rafından açılıyor;
// tezgâhın çizimleri yüklenir ve "Bu adımı dinle" ilk adımın kendi kaydını çalar.
for(const width of [568,844]){
  test('İkinci raftan Omlet tavası açılır; çizimleri ve kendi anlatımı hazır '+width,async({page},info)=>{
    await page.setViewportSize({width,height:width===568?320:390});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    await page.goto('./sef/');
    await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
    await page.getByRole('button',{name:'Omlet tezgâhını aç',exact:true}).tap();
    const sahne=page.getByRole('region',{name:'Omlet tavası'});
    await expect(sahne).toBeVisible();
    await expect.poll(()=>sahne.locator('img:visible').evaluateAll(l=>l.length>0&&l.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
    const ses=page.waitForResponse(res=>res.url().includes('/omlet/kir.mp3')&&res.ok());
    await sahne.getByRole('button',{name:'Bu adımı dinle'}).tap();await ses;
    await expect(sahne.getByRole('button',{name:'1. yumurtayı kâseye kır'})).toBeEnabled();
    if(width===844)await page.screenshot({path:info.outputPath('omlet-tezgahi.png')});
  });
}
