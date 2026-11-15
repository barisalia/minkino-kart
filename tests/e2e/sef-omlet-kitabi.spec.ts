import {expect,test} from '@playwright/test';

for(const width of [568,844]){
  test('Omletin dört sayfası ve kendi anlatımı açılır '+width,async({page},info)=>{
    await page.setViewportSize({width,height:width===568?320:390});
    await page.routeWebSocket(url=>url.port==='5173',()=>{});
    await page.goto('./sef/');
    await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
    const kitap=page.getByRole('dialog',{name:'Resimli tarifler'});
    const omlet=kitap.locator('[data-kitap-yemek="omlet"]');
    while(!await omlet.isVisible())await kitap.getByRole('button',{name:'Sonraki tarif sayfası'}).tap();
    const onizleme=omlet.locator('.om-yuzey');
    await expect.poll(()=>onizleme.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
    for(let sira=1;sira<=4;sira++){
      const ses=page.waitForResponse(res=>res.url().includes('/omlet-kitap/adim-'+sira+'.mp3')&&res.ok());
      if(sira===1)await omlet.tap();
      else await kitap.getByRole('button',{name:'Sonraki adım'}).tap();
      await ses;
      const cizim=kitap.locator('.kitap-resim>img');
      await expect(cizim).toHaveAttribute('src',new RegExp('omlet-'+sira+'\\.webp'));
      await expect.poll(()=>cizim.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(960);
      await expect(kitap.getByRole('button',{name:sira+'. adımı aç'})).toHaveAttribute('aria-current','step');
      if(sira===3&&width===844)await page.screenshot({path:info.outputPath('omlet-tarif-kitabi.png')});
    }
    await expect(kitap.getByRole('button',{name:'Bu yemeği hazırla'})).toBeVisible();
  });
}
