import {expect,test} from '@playwright/test';

test('Tatlılı sofralar kendi tarif kilidini ve bağımsız tatlı ziyaretini korur',async({page})=>{
  test.setTimeout(105_000);
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Restoranı aç'}).waitFor({timeout:60000});
  const durum=await page.evaluate(async()=>{
    const yol=performance.getEntriesByType('resource').find(r=>new URL(r.name).pathname==='/sef/src/tepsi-fisleri.ts')!.name;
    const {aktifMenu,bosTepsiler,menuAcik,menuBul,sonrakiMenu}=await import(yol);
    const t=bosTepsiler();
    const ziyaretler=[aktifMenu(t).id,sonrakiMenu(t).id];
    const k=menuBul('makarna-kurabiye'),d=menuBul('pizza-dondurma');
    const kilitler=[menuAcik(k,0),menuAcik(k,1),menuAcik(d,1),menuAcik(d,2)];
    t.tatliSeviye=2;t.restoran={sira:5,menuId:'fiyonk-tavuk',evre:'mutfak'};
    ziyaretler.push(sonrakiMenu(t).id);t.rekorlar={kurabiye:3,dondurma:3};
    ziyaretler.push(sonrakiMenu(t).id);t.rekorlar['makarna-kurabiye']=6;
    ziyaretler.push(sonrakiMenu(t).id);
    return {kilitler,ziyaretler};
  });
  expect(durum.kilitler).toEqual([false,true,false,true]);
  expect(durum.ziyaretler).toEqual(['corba-sofrasi','fiyonk-tavuk','dondurma','makarna-kurabiye','pizza-dondurma']);
});

test('Mino makarna ve kurabiyeyi tek masada teslim alır, yeni günde ödeme ve pul tekrarlanmaz',async({page})=>{
  test.setTimeout(105_000);
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({
    sessiz:true,tepsiler:{jeton:7,tatliSeviye:1,ekran:'masa',secili:'makarna-kurabiye',restoranda:true,
      restoran:{sira:5,menuId:'makarna-kurabiye',sonYemek:'fiyonk-tavuk',evre:'siparis'},
      gun:{no:2,ziyaret:2,kazanc:5,kapandi:false},
      masalar:{'makarna-kurabiye':{tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3,makarna:{
        istenenSos:'yesil',sos:'yesil',pestoMaskesi:7,porsiyon:{renk:'ispanak',kivamlar:['tam','tam','tam'],sus:{id:'domates',x:.25,y:.53}}
      }}},tatliTaslagi:{surum:2,adim:5,yanlis:0},sunuldu:false}}}
  })));
  await page.reload();
  const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(siparis.locator('.tepsi-gida')).toHaveCount(2);
  await siparis.click();
  await page.getByRole('button',{name:'Yıldız Kurabiye hazırla'}).click();
  await page.getByRole('button',{name:'Sarı servis tabağı'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Sarı servis tabağı'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).click();
  await expect(page.locator('.tepsi-yuva[data-hazir=true]')).toHaveCount(2);
  if(process.env.SEF_IKILI_KARE)await page.locator('.tepsi-sahnesi').screenshot({path:process.env.SEF_IKILI_KARE});
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  const servis=page.locator('.sirali-servis');
  await expect(servis.locator('[data-yemek=makarna] [data-lokma=fiyonk]')).toHaveCount(3);
  await expect(page.locator('.salon-yuzune-dokun>img[data-misafir]')).toBeHidden();
  const konuk=(await page.locator('.salon-figur:not(.salon-arkadas) .restoran-oyuncu-bedeni').boundingBox())!;
  const tabak=(await servis.locator('.sirali-yer').boundingBox())!;
  const tepsi=(await servis.locator('.sirali-tepsi').boundingBox())!;
  expect(Math.abs(konuk.x+konuk.width/2-tabak.x-tabak.width/2)).toBeLessThan(2);
  expect(tepsi.x+tepsi.width).toBeLessThan(tabak.x);
  if(process.env.SEF_SIRALI_KARE)await page.screenshot({path:process.env.SEF_SIRALI_KARE});
  await servis.locator('[data-yemek=makarna]').tap();
  await expect(servis).toHaveAttribute('data-evre','1');
  await page.reload();
  await expect(servis.locator('[data-yemek=makarna]')).toBeHidden();
  await servis.locator('[data-yemek=kurabiye]').tap();
  await expect(page.getByRole('button',{name:/9 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:/9 jeton kazanıldı/})).toBeVisible();
  await expect(page.locator('.tepsi-yuva[data-parca=makarna]')).toHaveAttribute('data-lokma-adedi','1');
  await expect(page.locator('.tepsi-yuva[data-parca=makarna] [data-lokma=fiyonk]:not([hidden])')).toHaveCount(2);
  await expect(page.locator('.tepsi-yuva[data-parca=kurabiye] .kb-tane:visible')).toHaveCount(2);
  await page.getByRole('button',{name:'Günü kapat'}).click();
  await page.getByRole('button',{name:'3. güne başla'}).click();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(16);
  expect(t.pastane.pullar.kurabiye).toBe(1);
  expect(t.ustalik).toMatchObject({tatli:1,tamMasa:1});
  expect(t.gun).toMatchObject({no:3,kazanc:0,ziyaret:0});
});

test('Lokum pizzanın yanında vitrinden alınan dondurmayı görür ve aynı porsiyon iki kez kullanılamaz',async({page})=>{
  test.setTimeout(105_000);
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
    jeton:12,tatliSeviye:2,ekran:'masa',secili:'pizza-dondurma',restoranda:true,
    restoran:{sira:7,menuId:'pizza-dondurma',evre:'mutfak'},
    pastane:{vitrin:{dondurma:[{puan:3,tabak:'beyaz'}]},pullar:{dondurma:2}},
    masalar:{'pizza-dondurma':{tabaklar:{pizza:{tarifId:'pizza',no:1,ust:[{cesit:'biber',x:62,y:52}],fis:{malzemeler:['biber']},kivam:'tam',puan:3}},sunuldu:false}}
  }})));
  await page.reload();
  await page.getByRole('button',{name:'Çilekli Dondurma vitrinden tepsiye al'}).click();
  await page.reload();
  await expect(page.locator('.tepsi-yuva .pastane-porsiyonu')).toHaveAttribute('data-tabak','beyaz');
  await expect(page.locator('.vitrinden-sun')).toHaveCount(0);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  const servis=page.locator('.sirali-servis');
  await expect(servis.getByRole('img',{name:/Şimdi/})).toBeVisible();
  if(process.env.SEF_CIFT_SERVIS)await page.screenshot({path:process.env.SEF_CIFT_SERVIS});
  await servis.locator('[data-yemek=pizza]').tap();
  await expect(servis).toHaveAttribute('data-evre','1');
  await servis.locator('[data-yemek=dondurma]').tap();
  await expect(page.getByRole('button',{name:/12 jeton kazanıldı/})).toBeVisible();
  await expect(page.locator('.restoran-lokma')).toHaveCount(0);
  await page.getByRole('button',{name:'Çilekli Dondurma tattır'}).click();
  await expect(page.locator('.restoran-lokma[data-tur=dondurma]')).toBeAttached();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(24);expect(t.pastane.pullar.dondurma).toBe(3);expect(t.pastane.vitrin.dondurma).toEqual([]);
});
test('Makarna istenirken önce verilen kurabiye kabul edilir ve bir puan getirir',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const id='makarna-kurabiye';
    Object.assign(k.tepsiler,{tatliSeviye:1,restoranda:true,ekran:'masa',secili:id,restoran:{sira:5,menuId:id,evre:'mutfak'},masalar:{[id]:{siraliMasada:true,tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3},kurabiye:true},tatliPuani:3,sunuldu:false}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  const kurabiye=page.locator('.sirali-servis [data-yemek=kurabiye]');
  const tabak=page.locator('.sirali-yer');
  const teslim=(await tabak.boundingBox())!,bas=(await kurabiye.boundingBox())!;
  const x=bas.x+bas.width/2,y=bas.y+bas.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(x,y-bas.height,{steps:6});
  await expect(tabak).toHaveAttribute('data-birak','hazir');
  await page.mouse.up();
  await expect(tabak).not.toHaveAttribute('data-birak',/./);
  await expect(kurabiye).toHaveCSS('translate','none');
  await page.mouse.move(x,y);await page.mouse.down();
  await page.mouse.move(teslim.x+teslim.width/2,teslim.y+teslim.height/2,{steps:8});
  await expect(tabak).toHaveAttribute('data-birak','burada');
  await page.mouse.up();
  await expect(page.getByRole('button',{name:/^1 jeton kazanıldı/})).toBeVisible();
  await page.reload();await expect(page.getByLabel('Tepsi puanı')).toHaveText('1 / 6');
});

test('Küçük ekranda sipariş balonunda istenen dondurma, tepside hazırlanan tat görünür',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const id='pizza-dondurma';
    const pizza={tarifId:'pizza',no:1,ust:[{cesit:'biber',x:62,y:52}],fis:{malzemeler:['biber']},kivam:'tam',puan:3};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      secili:id,ekran:'masa',tatliSeviye:2,restoranda:true,restoran:{sira:7,menuId:id,evre:'mutfak'},
      masalar:{[id]:{siraliMasada:true,sunumSirasi:1,tabaklar:{pizza,dondurma:true},dondurmaIstegi:'cilek',dondurmaTadi:'cikolata',tatliPuani:2,sunuldu:false}}
    }}));
  });
  await page.reload();
  const balon=page.getByRole('img',{name:'Şimdi Çilekli Dondurma'});
  const kulah=balon.locator('img');
  await expect(kulah).toHaveAttribute('src',/dondurma-cilek/);
  const dis=await balon.boundingBox(),ic=await kulah.boundingBox();
  expect(ic!.y).toBeGreaterThanOrEqual(dis!.y);
  expect(ic!.y+ic!.height).toBeLessThanOrEqual(dis!.y+dis!.height);
  const cikolata=page.getByRole('button',{name:'Çikolatalı Dondurma sun'});
  await expect(cikolata.locator('img[src*="dondurma-cikolata"]')).toBeVisible();
  await cikolata.tap();
  await expect(page.getByRole('button',{name:/9 jeton kazanıldı/})).toBeVisible();
});
