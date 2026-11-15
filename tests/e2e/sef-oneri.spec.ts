import {expect,test} from '@playwright/test';

test('Şefin önerdiği yemek ertesi sabah ilk masaya gelir',async({page})=>{
  await page.routeWebSocket(u=>u.searchParams.has('token'),()=>{});
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
  const tost=page.getByRole('button',{name:'Mino için Sıcak Tost'});
  await tost.tap();await expect(tost).toHaveAttribute('aria-pressed','true');
  await page.reload();await expect(tost).toHaveAttribute('aria-pressed','true');
  await tost.tap();await expect(tost).toHaveAttribute('aria-pressed','false');
  await tost.press('Enter');
  if(process.env.SEF_ONERI_KARE)await page.screenshot({path:process.env.SEF_ONERI_KARE});
  await page.getByRole('button',{name:'2. güne başla'}).tap();
  await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t).toMatchObject({gun:{no:2,ziyaret:0},jeton:14,secili:'peynirli-tost',restoran:{menuId:'peynirli-tost',sira:3}});
  expect(t.gun.oneri).toBeUndefined();
});
