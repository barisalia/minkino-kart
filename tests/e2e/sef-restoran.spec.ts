import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Lokum sipariş verir, tepsisini tadar, sonra Mino gelir',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.getByRole('button',{name:'Restoranı aç'}).click();
  const kabul=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(kabul).toBeVisible({timeout:15000});
  await expect(page.locator('.restoran-konusan img[data-misafir]')).toHaveAttribute('data-misafir','lokum');
  await expect(kabul.locator('.tepsi-gida')).toHaveCount(3);
  if(process.env.SEF_RESTORAN_KARE)await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_RESTORAN_KARE});
  await page.reload();
  await kabul.click();
  await page.locator('[data-parca=icecek]').click();
  await expect(page.locator('.ps-istek-fisi')).toHaveAttribute('data-istenen','limon');
  // Resume at the end of pouring, using the same receipt and customer.
  await page.evaluate(()=>{
    const kayit=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(kayit.tepsiler.masalar['corba-sofrasi'],{icecekMeyvesi:'limon',icecekMiktari:3,icecekPuani:3,adim:{icecek:5,tavuk:0}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(kayit));
  });
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).click();
  await expect(page.locator('.restoran-lokma[data-tur=icecek]')).toBeAttached();
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await expect(page.locator('.tepsi-ust h2')).toHaveText('3 / 9');
  await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).click();
  await expect(kabul).toBeVisible({timeout:15000});
  await expect(page.locator('.restoran-konusan img[data-misafir]')).toHaveAttribute('data-misafir','mino');
  await expect(kabul.locator('.tepsi-gida')).toHaveCount(2);
});
