import {expect,test} from '@playwright/test';

test('Son üç sofra yeniden açılan albümde çocukların gerçek tabaklarıyla saklanır',async({page})=>{
  test.setTimeout(105_000);
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,
    gecmis:[{tarifId:'salata',sus:{id:'domates',x:.7,y:.2}}],
    tepsiler:{ekran:'masa',secili:'makarna-kurabiye',restoranda:true,tatliSeviye:2,gun:{no:2,ziyaret:1,kazanc:0,kapandi:false},
      restoran:{sira:6,menuId:'makarna-kurabiye',evre:'mutfak'},
      anilar:[
        {gun:1,sira:0,menuId:'dondurma',masa:{tabaklar:{dondurma:true},tatliPuani:1,sunuldu:true}},
        {gun:1,sira:1,menuId:'peynirli-tost',masa:{tabaklar:{tost:true},tostServisi:{evre:'sun',kizartma:'citir',katlar:[{tur:'zeytin',x:68,y:57}]},sunuldu:true}},
        {gun:1,sira:2,menuId:'meyveli-mola',masa:{tabaklar:{icecek:true},smoothie:{evre:'servis',meyveler:['kivi','muz'],bardak:84,karisim:100,buzlu:true},sunuldu:true}}
      ],
      masalar:{'makarna-kurabiye':{tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3},kurabiye:true},tatliPuani:3,tatliTabagi:'sari',sunuldu:false}}}
  })));
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  const servis=page.locator('.sirali-servis');
  await servis.locator('[data-yemek=makarna]').click();
  await expect(servis).toHaveAttribute('data-evre','1');
  await servis.locator('[data-yemek=kurabiye]').click();
  await expect(servis).toHaveCount(0);
  await page.reload();
  const anilar=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar);
  expect(anilar.map((a:{sira:number})=>a.sira)).toEqual([1,2,6]);
  // Family exits the restaurant and reopens the same album on a later visit.
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.tepsiler.ekran='kapali';k.tepsiler.restoranda=false;
    k.tepsiler.masalar['makarna-kurabiye']={tabaklar:{},sunuldu:false};
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();await page.getByRole('button',{name:'Hazırladığım tabaklar'}).click();
  await page.getByRole('button',{name:'Müşteri sofraları'}).click();
  await expect(page.locator('.ani-karti')).toHaveCount(3);
  await expect(page.locator('.ani-karti .tost-yigin')).toHaveAttribute('data-kizartma','citir');
  await expect(page.locator('.ani-karti .tost-kat')).toHaveAttribute('data-tur','zeytin');
  await expect(page.locator('.ani-karti .sm-bardak')).toHaveAttribute('data-meyveler','kivi,muz');
  await expect(page.locator('.ani-karti .sm-bardak')).toHaveAttribute('data-buz','evet');
  await page.locator('.ani-karti').first().click();
  await expect(page.locator('.ani-buyuk .pastane-porsiyonu')).toHaveAttribute('data-tabak','sari');
  if(process.env.SEF_ANI_KARE)await page.getByRole('dialog').screenshot({path:process.env.SEF_ANI_KARE});
  await page.evaluate(()=>window.dispatchEvent(new Event('minkino:geri',{cancelable:true})));
  await expect(page.locator('.ani-karti')).toHaveCount(3);
  await page.getByRole('dialog').getByRole('button',{name:'Hazırladığım tabaklar',exact:true}).click();
  await expect(page.getByRole('button',{name:'Bahçe Salatası',exact:true})).toBeVisible();
});
