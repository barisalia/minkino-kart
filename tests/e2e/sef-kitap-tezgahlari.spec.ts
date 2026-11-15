import { expect, test } from '@playwright/test';

const tarifler = [
  { id:'tost', sayfa:4, tezgah:'Tost tezgâhı' },
  { id:'simit', sayfa:4, tezgah:'Simit fırını' },
  { id:'tavuk', sayfa:3, tezgah:'Tavuk tavası' },
  { id:'icecek', sayfa:3, tezgah:'Meyve karışımı tezgâhı' },
];

for (const boyut of [{width:568,height:320},{width:844,height:390}]) {
  for (const tarif of tarifler) {
    test(`Kitaptan ${tarif.tezgah} açılır (${boyut.width}×${boyut.height})`,async ({ page }, info) => {
      await page.setViewportSize(boyut);
      const hatalar:string[]=[];
      page.on('pageerror', e => hatalar.push(e.message));
      await page.routeWebSocket(url => url.port==='5173', () => {});
      await page.goto('./sef/?test=1');
      await page.getByRole('button',{name:'Sesi kapat'}).tap();
      await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
      const kitap=page.getByRole('dialog',{name:'Resimli tarifler'});
      const kart=kitap.locator('[data-kitap-yemek="'+tarif.id+'"]');
      const ileri=kitap.getByRole('button',{name:'Sonraki tarif sayfası'});
      while(!await kart.isVisible() && await ileri.isEnabled())await ileri.tap();
      await kart.tap();
      for(let sira=1;sira<=tarif.sayfa;sira++){
        const resim=kitap.locator('.kitap-resim>img');
        await expect(resim).toHaveAttribute('src',new RegExp(tarif.id+'-'+sira+'\\.webp'));
        await expect.poll(()=>resim.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
        await expect(kitap.getByRole('button',{name:sira+'. adımı aç'})).toHaveAttribute('aria-current','step');
        const tasan=await kitap.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{
          const r=b.getBoundingClientRect();
          return r.width<43.9 || r.height<43.9 || r.left<0 || r.top<0 || r.bottom>innerHeight || r.right>innerWidth;
        }).map(b=>b.getAttribute('aria-label')));
        expect(tasan).toEqual([]);
        if(sira===2 && tarif.id==='simit' && boyut.width===844)await page.screenshot({path:info.outputPath('simit-tarif-kitabi.png')});
        if(process.env.SEF_KITAP_KARE && sira===tarif.sayfa)await page.screenshot({path:info.outputPath('kitap-'+tarif.id+'-'+boyut.width+'.png')});
        if(sira<tarif.sayfa)await kitap.getByRole('button',{name:'Sonraki adım'}).tap();
      }
      await kitap.getByRole('button',{name:'Bu yemeği hazırla'}).tap();
      await expect(kitap).toHaveCount(0);
      const oyun=page.getByRole('region',{name:tarif.tezgah,exact:true});
      await expect(oyun).toBeVisible();
      await expect(oyun.locator('button:enabled').first()).toBeVisible();
      if(process.env.SEF_KITAP_KARE)await page.screenshot({path:info.outputPath('tezgah-'+tarif.id+'-'+boyut.width+'.png')});
      expect(hatalar).toEqual([]);
    });
  }
}
