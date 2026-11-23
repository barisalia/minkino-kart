import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Resimli tarif kitabının pastane bölümü 16 Kasım'da (c3d9d09a) kaldırıldı. Tatlı tarifleri Tatlı Atölyesi vitrininde:
// kilitli tarif kapalı kartta bekler, açılmış tarif "Hazırla" ile kendi tezgâhında pişer. İkisi de jeton harcamaz.
for(const acik of [false,true]){
  test('Tatlı Atölyesi vitrininde '+(acik?'açılmış tarif pişirilir':'kilitli tarif bekler'),async({page})=>{
    await page.setViewportSize(acik?{width:844,height:390}:{width:568,height:320});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Sesi kapat'}).tap();
    if(acik){
      await page.evaluate(()=>{
        const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
        k.tepsiler.tatliSeviye=2;k.tepsiler.jeton=12;
        localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
      });
      await page.reload();
    }
    await page.getByRole('button',{name:/^Tatlı atölyesini aç/}).tap();
    const kart=page.getByRole('button',{name:/^Çilekli Dondurma ·/});
    if(acik){
      await expect(page.locator('.tatli-dukkan')).toHaveAttribute('data-pastane','acik');
      await expect(kart).toHaveAccessibleName(/Hazırla/);
      await kart.tap();
      await expect(page.locator('.tatli-tezgahi')).toHaveAttribute('data-tatli','dondurma');
    }else{
      await expect(page.locator('.tatli-dukkan')).toHaveAttribute('data-pastane','kapali');
      await expect(kart).toBeDisabled();
      await expect(kart).toHaveAccessibleName(/Önce Kalıplı Kurabiye açılmalı/);
    }
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.jeton)).toBe(acik?12:0);
  });
}
