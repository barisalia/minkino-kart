import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Çocuğun hazırladığı bahçe sofrası sepette korunur ve bir kez servis edilir',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(d.tepsiler,{
      secili:'bahce-tabagi',ekran:'masa',restoranda:true,
      restoran:{sira:5,menuId:'bahce-tabagi',sonYemek:'bahce-tabagi',evre:'mutfak'},
      masalar:{'bahce-tabagi':{sunuldu:false,tavukPuani:3,tabaklar:{tavuk:true,salata:{
        tarifId:'salata',istenenSus:'limon',sus:{id:'limon',x:.48,y:.52},puan:3
      }}}}
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
  });
  await page.reload();
  await page.getByRole('button',{name:'Piknik sepetini hazırla'}).click();
  await page.getByRole('button',{name:'Bahçe Salatası sepete koy'}).dragTo(page.getByRole('button',{name:'Piknik sepeti',exact:true}));
  await page.reload();
  await expect(page.locator('.piknik-cep .yemek-cizimi')).toHaveAttribute('data-tabak','salata');
  await expect(page.locator('.piknik-yolla')).toBeHidden();
  await page.getByRole('button',{name:'Tavada Tavuk sepete koy'}).tap();
  await page.getByRole('button',{name:'Peçete ve çatal sepete koy'}).press('Enter');
  await expect(page.getByRole('status',{name:'3 / 3 eşya sepette'})).toBeVisible();
  if(process.env.SEF_PIKNIK_KARE)await page.screenshot({path:process.env.SEF_PIKNIK_KARE});
  await page.getByRole('button',{name:'Pikniği servis et'}).tap();
  await expect(page.getByRole('button',{name:/6 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(6);expect(t.gun.ziyaret).toBe(1);
});
