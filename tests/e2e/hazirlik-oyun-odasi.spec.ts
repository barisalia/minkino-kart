import { expect, test } from '@playwright/test';

test('Eski tren kaydı oyun odasında diğer çalışmaları korur',async({page})=>{
  await page.goto('/hazirlik/?ders=oyun-odasi');
  const muzik=page.locator('[data-kres=muzik]');
  await muzik.waitFor();
  await page.evaluate(()=>{
    const key='minkino-hazirlik-oyun-odasi-v1',s=JSON.parse(localStorage[key]);
    s.sahne='tren';s.kres.arabaRafta=true;localStorage[key]=JSON.stringify(s);
  });
  await page.reload();await expect(muzik).toBeVisible();
  await expect(page.locator('[data-kres=raftaki-araba]')).toHaveCount(1);
  await expect(page.locator('[data-kres=tren]')).toHaveCount(0);
});

test('Kayıtlı plağın çalgıları ve vuruş aralığı yeniden dinlenebilir',async({page})=>{
  await page.goto('/hazirlik/?ders=oyun-odasi');
  const b=(name:string)=>page.getByRole('button',{name,exact:true});
  await page.locator('[data-kres=muzik]').tap();
  await expect(page.locator('.beste-masa')).toHaveCount(0);
  await b('Kendi bandonu kur').tap();
  const kayit=b('Çaldığın sesleri plağa kaydet');await kayit.tap();
  await b('Davul ekle').tap();await b('Flüt ekle').tap();await kayit.tap();
  await page.reload();await b('Kendi bandonu kur').tap();await b('Kendi plağını dinle').tap();
  const beste=await page.evaluate(()=>JSON.parse(localStorage['minkino-hazirlik-oyun-odasi-v1']).kres.beste);
  expect(beste.plak.map((p:{saz:number})=>p.saz)).toEqual([0,5]);
  expect(beste.plak[1].an).toBeGreaterThan(beste.plak[0].an);
  expect(beste.vuruslar).toEqual([]);
});

test('Şamandıra rotası yanlış işareti atlar ve yeni turda sırayı değiştirir',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/hazirlik/?ders=oyun-odasi');await page.locator('[data-kres=kagit]').tap();
  for(let i=0;i<3;i++)await page.locator('[data-kres=katla]').tap();
  await page.locator('[data-kres=damga-2]').tap();await page.locator('[data-kres=yelken-parkuru]').tap();
  const r=(id:string)=>page.locator('[data-parkur="'+id+'"]');
  await r('duba-2').tap();await expect(r('sira')).toHaveAttribute('aria-label','Sıradaki şamandıra, Güneş');
  await r('duba-0').tap();await expect(r('sira')).toHaveAttribute('aria-label','Sıradaki şamandıra, Balık');
  await page.reload();await r('duba-1').tap();await expect(r('sira')).toHaveAttribute('aria-label','Sıradaki şamandıra, Yıldız');
  await r('duba-2').tap();await expect(r('sira')).toHaveAttribute('aria-label','Damalı bayrağa git');
  await r('liman').tap();await r('yeniden').tap();await expect(r('sira')).toHaveAttribute('aria-label','Sıradaki şamandıra, Balık');
});


test('Kâğıt kayık son ördeği bulmadan turu tamamlayamaz ve seçilen renk korunur', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/hazirlik/?ders=oyun-odasi');
  await page.getByRole('button', { name:'Kâğıt kayık katla' }).waitFor();
  const key = 'minkino-hazirlik-oyun-odasi-v1';
  await page.evaluate(key => {
    const kayit = JSON.parse(localStorage.getItem(key)!);
    kayit.sahne = 'golet';
    Object.assign(kayit.kres, {gemiVar:true,kat:3,gemiRengi:1});
    localStorage.setItem(key, JSON.stringify(kayit));
  }, key);
  await page.reload();
  const anne = page.getByRole('button', {name:'Anne ördeğin yanına git'});
  const bitti = page.locator('[data-golet="bitir"]');
  await anne.tap();
  await expect(bitti).toBeHidden();
  for (const i of [0,2,1]) {
    const yavru = page.locator('[data-golet="yavru-'+i+'"]');
    await yavru.tap();
    await expect(yavru).toBeDisabled();
    if (i===0) {
      await page.reload();
      await expect(yavru).toBeDisabled();
    }
  }
  await anne.tap();
  await expect(bitti).toBeVisible();
  const kres = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).kres,key);
  expect(kres.gemiRengi).toBe(1);
  expect(kres.golet).toMatchObject({arkadaslar:[0,2,1],yuvada:true});
});
