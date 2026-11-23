import { expect, test } from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Resimli tarif kitabı 16 Kasım'da (c3d9d09a) kaldırıldı. Bu tezgâhlar artık panodaki ikinci tarif rafından açılıyor.
const tarifler = [
  { ad:'Sıcak Tost', tezgah:'Tost tezgâhı' },
  { ad:'Simit', tezgah:'Simit fırını' },
  { ad:'Tavada Tavuk', tezgah:'Tavuk tavası' },
  { ad:'Meyve Karışımı', tezgah:'Meyve karışımı tezgâhı' },
];

for (const boyut of [{width:568,height:320},{width:844,height:390}]) {
  for (const tarif of tarifler) {
    test(`İkinci raftan ${tarif.tezgah} açılır (${boyut.width}×${boyut.height})`,async ({ page }, info) => {
      await page.setViewportSize(boyut);
      const hatalar:string[]=[];
      page.on('pageerror', e => hatalar.push(e.message));
      await page.routeWebSocket(url => url.port==='5173', () => {});
      await page.goto('./sef/?test=1');
      await page.getByRole('button',{name:'Sesi kapat'}).tap();
      await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
      const kart=page.locator('.siparisler[data-raf="2"]').getByRole('button',{name:tarif.ad+' tezgâhını aç',exact:true});
      await expect.poll(()=>kart.locator('img').evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
      await kart.tap();
      const oyun=page.getByRole('region',{name:tarif.tezgah,exact:true});
      await expect(oyun).toBeVisible();
      await expect(oyun.locator('button:enabled').first()).toBeVisible();
      const tasan=await page.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{
        const r=b.getBoundingClientRect();
        return r.width<43.9 || r.height<43.9 || r.left<0 || r.top<0 || r.bottom>innerHeight || r.right>innerWidth;
      }).map(b=>b.getAttribute('aria-label')));
      expect(tasan).toEqual([]);
      if(process.env.SEF_KITAP_KARE)await page.screenshot({path:info.outputPath('tezgah-'+tarif.ad+'-'+boyut.width+'.png')});
      expect(hatalar).toEqual([]);
    });
  }
}
