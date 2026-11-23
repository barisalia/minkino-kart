import {expect,test,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Resimli tarif kitabı 16 Kasım'da (c3d9d09a) kaldırıldı; tarifler panodaki iki rafta.
async function tusBoylari(page:Page){
  const kucuk=await page.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{
    const r=b.getBoundingClientRect();return r.width<43.9||r.height<43.9||r.left<0||r.top<0||r.bottom>innerHeight||r.right>innerWidth;
  }).map(b=>b.getAttribute('aria-label')));
  expect(kucuk).toEqual([]);
}
async function resimlerYuklu(page:Page){
  await expect.poll(()=>page.locator('.siparisler img').evaluateAll(l=>l.length>0&&l.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0))).toBe(true);
}
test('Küçük yatay telefonda iki tarif rafı, kartları ve kapılar erişilebilir',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  const raf=page.locator('.siparisler');
  await expect(raf.locator('.siparis-karti')).toHaveCount(7);
  await expect(page.getByRole('button',{name:'Restoranı aç'})).toBeVisible();
  await expect(page.getByRole('button',{name:/^Tatlı atölyesini aç/})).toBeVisible();
  await resimlerYuklu(page);await tusBoylari(page);
  if(process.env.SEF_KITAP_KARE)await page.screenshot({path:process.env.SEF_KITAP_KARE+'/tarif-rafi-1-cep.png'});
  await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
  await expect(raf).toHaveAttribute('data-raf','2');
  await expect(raf.getByRole('button')).toHaveCount(9);
  await expect(page.getByRole('button',{name:'Önceki tarif rafı'})).toBeFocused();
  await resimlerYuklu(page);await tusBoylari(page);
  if(process.env.SEF_KITAP_KARE)await page.screenshot({path:process.env.SEF_KITAP_KARE+'/tarif-rafi-2-cep.png'});
  await page.getByRole('button',{name:'Önceki tarif rafı'}).press('Enter');
  await expect(raf.locator('.siparis-karti')).toHaveCount(7);
  await expect(page.getByRole('button',{name:'Sonraki tarif rafı'})).toBeFocused();
  await page.setViewportSize({width:844,height:390});
  await tusBoylari(page);
});
