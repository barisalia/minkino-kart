import { expect,test } from '@playwright/test';
import { hataTopla } from './yardimci';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test('Makarnayla tavuğu aynı tepside, ayrı ayrı pişirip bir kez sun',async({page})=>{
  const hatalar=hataTopla(page);
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).click();
  // "Müşteri masası" fiş arşivi panoda yok (15 Kasım ilk sürümde de); müşterinin masası ?giris=tepsiler&siparis= ile açılır.
  await page.goto('./sef/?test=1&giris=tepsiler&siparis=fiyonk-tavuk');
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'})).toHaveCount(0);
  const enter=async(sel:string)=>{const b=page.locator(sel).first();await expect(b).toBeEnabled();await b.press('Enter');};
  await page.locator('[data-parca=tavuk]').click();
  for(let n=0;n<6;n++){
    await expect(page.locator('.tv-mutfak')).toHaveAttribute('data-adet',String(n));
    await enter('.tv-fileto:enabled');
    if(n<2)await enter('.tv-tava');else if(n>=4)await enter('.tv-tabak');
    if(n===0){await expect(page.locator('.tv-mutfak')).toHaveAttribute('data-adet','1');await page.reload();}
  }
  await expect(page.locator('[data-parca=tavuk]')).toHaveAttribute('data-hazir','true');
  await page.locator('[data-parca=makarna]').click();
  await page.getByRole('button',{name:'Yumurtalı hamur seç'}).click();
  for(let i=0;i<2;i++)await enter('[data-mp-kes="'+i+'"]');
  for(let i=0;i<3;i++){
    await enter('.mp-buzgu');
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-fiyonk-tavuk')!).sekil)).toBe(i+1);
    await expect(page.locator('.mp-tepsi-parca')).toHaveCount(i===2?0:i+1);
  }
  await enter('.mp-tuzluk');for(let i=0;i<3;i++)await enter('[data-mp-at="'+i+'"]');
  await expect(page.locator('.mp-oyun')).toHaveAttribute('data-kivam','tam',{timeout:9000});
  for(let i=0;i<3;i++){await enter('.mp-kepce');await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-makarna-v1-masa-fiyonk-tavuk')!).suzulen)).toBe(i+1);if(i<2)await expect(page.locator('.mp-damla')).toHaveCount(0);}
  await enter('[data-mp-sos=yesil]');
  for(let yaprak=0;yaprak<3;yaprak++)await enter('.mp-havan-dokunus');
  await enter('.mp-havan-aktar');await enter('[data-sos-yeri="1"]');await enter('.mp-sos-bitti');
  await enter('[data-mp-sus=peynir]');await enter('.mp-sus-hedef');
  // Servis zilinden sonra atölye kapanır; tepsi tamam olduğu için masa sahnesi açılır.
  await enter('[data-mp-zil]');
  const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
  await expect(sunum.locator('img.defter-fotograf')).toHaveAttribute('src',/^data:image/);
  await page.reload();
  await expect(sunum.getByRole('img',{name:'Fiyonk Makarna'})).toBeVisible();
  await expect(sunum.getByRole('img',{name:'Pişirdiğin iki fileto'})).toBeVisible();
  await sunum.click();
  // İki tabak da üç yıldız: 6 jeton.
  await expect(page.getByRole('button',{name:/^6 jeton kazanıldı/})).toBeVisible();
  if(process.env.SEF_SUNUM_ONIZLEME && test.info().project.name==='dar-yatay')
    await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_SUNUM_ONIZLEME});
  await expect(page.getByRole('button',{name:'Tepsiyi müşteriye sun'})).toHaveCount(0);
  // Fiş arşivi panoda yok; "Başka bir müşteri seç" restoranın sıradaki müşterisini (Lokum, çorba sofrası) getirir.
  await page.getByRole('button',{name:'Başka bir müşteri seç'}).click();
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  await expect(page.locator('[data-parca]')).toHaveCount(3);
  await page.locator('[data-parca=icecek]').click();await enter('.ps-ham');await enter('.ps-dene');await enter('.ps-cevir');
  await page.getByRole('button',{name:'Geri',exact:true}).click();
  await page.locator('[data-parca=icecek]').click();
  await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek','2');
  expect(hatalar).toEqual([]);
});

