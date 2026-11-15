import {test,expect} from '@playwright/test';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

test('Yanlış ve yarım bardak: eski servisi gör, geri dön, kaldığın yerden düzelt',async({page})=>{
  await page.setViewportSize({width:750,height:360});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{ekran:'masa',secili:'pizza-molasi',masalar:{
      'pizza-molasi':{tabaklar:{icecek:true},adim:{icecek:6},icecekMeyvesi:'limon',icecekMiktari:2,icecekPuani:1,sunuldu:true},
      'fiyonk-tavuk':{tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3}},adim:{tavuk:3}}
    }}}));
  });
  await page.reload();
  const ek=page.locator('[data-parca=icecek]');
  await ek.tap();
  const d=page.getByRole('dialog');
  await expect(d.getByRole('img',{name:'Dolu Portakal suyu'})).toBeVisible();
  await expect(d.getByRole('img',{name:'Yarım Limon suyu'})).toBeVisible();
  const porsiyonlar=await d.locator('section img:not(.misafir)').evaluateAll(resimler=>resimler.map(img=>{
    const r=img.getBoundingClientRect(),s=img.closest('section')!.getBoundingClientRect();
    return {sigiyor:r.top>=s.top&&r.bottom<=s.bottom&&r.left>=s.left&&r.right<=s.right,h:r.height,w:r.width};
  }));
  expect(porsiyonlar.every(p=>p.sigiyor&&p.h>=50&&p.w>=50)).toBe(true);
  expect(Math.abs(porsiyonlar[0].h-porsiyonlar[1].h)).toBeLessThan(2);
  await page.screenshot({path:join(tmpdir(),'minik-sef-iki-bardak.png')});
  await d.getByRole('button',{name:'Meyve suyu tekrar hazırla'}).tap();
  await page.locator('.ps-portakal').tap();await page.locator('.ps-dene').tap();
  await page.locator('.ps-cevir').tap();
  await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek','2');
  await page.locator('.tepsi-ust button').first().tap();
  await expect(ek.locator('img')).toHaveAttribute('src',/limon-yarim-bardak/);
  await page.locator('.tepsi-ust button').first().tap();
  const fis=page.locator('[data-menu=fiyonk-tavuk]');
  await expect(fis.locator('[data-porsiyon=tavuk]')).toHaveAttribute('data-durum','tezgahta');
  await expect(fis.locator('[data-porsiyon=makarna]')).toHaveAttribute('data-durum','hazir');
  await page.reload();
  await page.locator('[data-menu=pizza-molasi]').tap();
  await ek.tap();
  await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek','2');
  for(const n of [3,4]){await page.locator('.ps-cevir').tap();await expect(page.locator('.ps-sahnesi')).toHaveAttribute('data-icecek',String(n));}
  for(let i=0;i<2;i++){await page.locator('.ps-surahi').tap();await page.locator('.ps-bardak').tap();if(!i)await expect(page.locator('.ps-yarim-sun')).toBeVisible();}
  await expect(ek.locator('img')).toHaveAttribute('src',/\/dolu\.webp/);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
  await expect(page.locator('.tepsi-ust h2')).toHaveText('3 / 6');
  await page.getByRole('button',{name:'Mini Pizza eksik tabağı hazırla'}).tap();
  await expect(page.locator('.tepsi-sahnesi')).toHaveCount(0);
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar['pizza-molasi'].tabaklar.icecek).toBe(true);
  expect(t.oynanan).toBe('pizza');
});
