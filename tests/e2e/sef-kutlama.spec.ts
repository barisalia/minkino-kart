import {expect,test} from '@playwright/test';

test('Üç misafir çocuğun süslediği pastanın kendi dilimlerini alır',async({page})=>{
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{jeton:14,restoranda:true,ekran:'masa',secili:'bahce-tabagi',
      masalar:{'bahce-tabagi':{tabaklar:{tavuk:true},sunuldu:true}},
      restoran:{sira:2,menuId:'bahce-tabagi',evre:'mutfak',sayildi:true},
      gun:{no:1,ziyaret:3,kazanc:14,kapandi:true}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Kutlama pastasını paylaş'}).tap();
  await page.getByRole('button',{name:'Çilek kreması sür'}).tap();
  const kek=page.locator('.kutlama-ust');
  await page.locator('[data-meyve="kivi"]').dragTo(kek);
  await page.reload();
  await expect(kek.locator('.kutlama-meyve')).toHaveCount(1);
  await page.locator('[data-meyve="cilek"]').tap();
  const r=(await kek.boundingBox())!;
  await kek.tap({position:{x:r.width*.65,y:r.height*.70}});
  await page.getByRole('button',{name:'Pasta mumunu yerleştir'}).tap();
  await expect(page.locator('.kutlama-alev')).toBeVisible();
  if(process.env.SEF_KUTLAMA_KARE)await page.screenshot({path:process.env.SEF_KUTLAMA_KARE});
  await page.getByRole('button',{name:'Mumu üfle'}).press('Enter');
  await expect(page.locator('.kutlama-alev')).toHaveCount(0);
  await page.mouse.move(r.x+r.width*.5,r.y+r.height*.5);await page.mouse.down();
  await page.mouse.move(r.x+r.width*.5,r.y+r.height*.10,{steps:6});await page.mouse.up();
  await expect(page.locator('.kutlama-kesikler [data-kesildi=true]')).toHaveCount(1);
  await page.reload();
  await page.getByRole('button',{name:'Pastayı dilimle'}).tap();
  await page.getByRole('button',{name:'Pastayı dilimle'}).press('Enter');
  const mino=page.getByRole('button',{name:'Mino için pasta dilimi'});
  await kek.dragTo(mino);await expect(mino).toBeDisabled();
  await page.reload();await expect(mino).toBeDisabled();
  await expect(mino.locator('.kutlama-meyve')).toHaveCount(2);
  await page.getByRole('button',{name:'Lokum için pasta dilimi'}).tap();
  await page.getByRole('button',{name:'Dede Hasan için pasta dilimi'}).tap();
  await page.getByRole('button',{name:'Kutlamayı tamamla'}).tap();
  await expect(page.getByRole('button',{name:'2. güne başla'})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.jeton)).toBe(14);
});
