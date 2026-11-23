import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

// Tabak albümü 16 Kasım'da (c3d9d09a) kaldırıldı; son üç sofra ekranı yok ama kaydı (tepsiler.anilar) restorandan çıkınca da korunur.
test('Son üç sofra çocukların gerçek tabaklarıyla kayıtta saklanır',async({page})=>{
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
  await page.reload();
  const sakli=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar);
  expect(sakli.map((a:{menuId:string})=>a.menuId)).toEqual(['peynirli-tost','meyveli-mola','makarna-kurabiye']);
  expect(sakli[0].masa.tostServisi).toMatchObject({kizartma:'citir',katlar:[{tur:'zeytin'}]});
  expect(sakli[1].masa.smoothie).toMatchObject({meyveler:['kivi','muz'],buzlu:true});
  expect(sakli[2].masa).toMatchObject({tatliTabagi:'sari',tabaklar:{makarna:{tarifId:'makarna'},kurabiye:true}});
});
