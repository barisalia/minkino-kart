import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.beforeEach(async({page})=>{await page.routeWebSocket(url=>url.port==='5173',()=>{});});

test('Vitrindeki gerçek dondurmanın tadı, tabak rengi, süsü ve geçmiş ödemesi her düzeltmede korunur',async({page})=>{
  test.setTimeout(180000);
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{tatliSeviye:2,jeton:14,secili:'dondurma',restoranda:true,ekran:'masa',
      gun:{no:4,ziyaret:1,kazanc:5,kapandi:false},restoran:{sira:11,menuId:'dondurma',evre:'mutfak'},
      masalar:{dondurma:{sunuldu:false,tabaklar:{},dondurmaIstegi:'vanilya',susIstegi:'sus-026'}},
      pastane:{acik:false,taslaklar:{},vitrin:{dondurma:[3,{puan:3,tat:'vanilya',tabak:'sari'},
        {puan:3,tat:'cikolata',tabak:'beyaz'}]}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  const masayiOku=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  await page.getByRole('button',{name:'Vanilyalı Dondurma vitrinden tepsiye al'}).tap();
  const vitrin=page.getByRole('dialog',{name:'Vitrinden bir porsiyon seç'});
  await expect(vitrin.locator('.vitrin-istegi .tabaktaki-tatli')).toHaveAttribute('src',/dondurma-vanilya/);
  await expect(vitrin.locator('.vitrin-tabagi')).toHaveCount(3);
  await expect(vitrin.locator('.vitrin-tabagi').first().locator('.tabaktaki-tatli')).toHaveAttribute('src',/dondurma-cilek/);
  if(process.env.SEF_DONDURMA_KARE)await page.screenshot({path:process.env.SEF_DONDURMA_KARE+'/dondurma-vitrini.png'});
  await vitrin.getByRole('button',{name:'3. porsiyon, Çikolatalı dondurma'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/6 jeton kazanıldı/})).toBeVisible();
  await expect(page.locator('.restoran-ilk-tadim')).toHaveCount(0);
  const karsilastir=page.getByRole('button',{name:/Dondurma siparişi ile tabağı karşılaştır/});
  await karsilastir.tap();await page.getByRole('button',{name:'Tatlı süsünü değiştir'}).tap();
  await page.locator('button[data-sus="sus-026"]').tap();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  expect((await masayiOku()).masalar.dondurma.tatliPuani).toBe(2);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/1 jeton kazanıldı/})).toBeVisible();
  await expect(page.locator('.restoran-ilk-tadim')).toHaveCount(0);
  await karsilastir.tap();await page.getByRole('button',{name:'Dondurma topunu değiştir'}).tap();
  await page.getByRole('button',{name:'Vanilyalı top',exact:true}).tap();
  const kepce=page.getByRole('button',{name:'Vanilyalı dondurmadan bir top çıkar'});
  for(let i=0;i<7;i++)await kepce.press('Enter');
  await page.getByRole('button',{name:'Vanilyalı topu al'}).press('Enter');
  await page.getByRole('button',{name:'Dondurma topunu külaha koy'}).press('Enter');
  await expect(page.locator('button[data-sus="sus-026"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Krem servis tabağı'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/3 jeton kazanıldı/})).toBeVisible();await page.reload();
  const t=await masayiOku(),masa=t.masalar.dondurma;
  expect(t.jeton).toBe(24);expect(t.gun).toMatchObject({ziyaret:2,kazanc:15});expect(t.pastane.vitrin.dondurma).toHaveLength(2);
  expect(masa).toMatchObject({sunuldu:true,tatliTabagi:'beyaz',dondurmaTadi:'vanilya',tatliSusu:'sus-026',hazirlamaPuani:3,tatliPuani:3,odenen:10});
  expect(t.anilar.filter((ani:{menuId:string})=>ani.menuId==='dondurma')).toHaveLength(1);
});

test('Vitrindeki gerçek porsiyon kendi tabağında servis edilir, gün kapanır ve ertesi sabah kasa korunur',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  // Reopen a family's saved game: the first two visitors have eaten and one
  // dessert is ready to plate. Production and serving use the normal controls.
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      jeton:8,tatliSeviye:1,gun:{no:1,ziyaret:2,kazanc:11,kapandi:false},
      secili:'kurabiye',restoranda:true,ekran:'masa',
      restoran:{sira:2,menuId:'kurabiye',sonYemek:'corba-sofrasi',evre:'mutfak'},
      pastane:{acik:true,tezgah:'kurabiye',taslaklar:{kurabiye:{surum:2,adim:5,yanlis:1}},vitrin:{}},
      masalar:{kurabiye:{tabaklar:{},sunuldu:false}}
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Sarı servis tabağı'}).click();
  await page.reload();
  await expect(page.getByRole('button',{name:'Sarı servis tabağı'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Vitrine koy'}).click();
  await expect(page.locator('[data-kademe="1"]')).toHaveAccessibleName(/rafta 1 tane/);
  await expect(page.locator('.tatli-cuzdan')).toHaveText('8');
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Yıldız Kurabiye vitrinden tepsiye al'}).click();
  await page.reload();
  await expect(page.locator('.salonda-servis-et .pastane-porsiyonu')).toHaveAttribute('data-tabak','sari');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.getByRole('button',{name:/4 jeton kazanıldı/})).toBeVisible();
  await page.getByRole('button',{name:'Günü kapat'}).click();
  await page.reload();
  await expect(page.getByRole('heading',{name:'1. gün bitti'})).toBeVisible();
  await expect(page.getByLabel('15 jeton kazanıldı',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'2. güne başla'}).click();
  await expect(page.getByRole('button',{name:'Siparişi al ve mutfağa geç'})).toBeVisible({timeout:20000});
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.gun).toEqual({no:2,ziyaret:0,kazanc:0,kapandi:false});
  expect(t.jeton).toBe(12);
  expect(t.pastane.vitrin.kurabiye).toHaveLength(0);
  expect(t.tatliSeviye).toBe(1);
});

test('Son tarifin kilidi, vitrindeki tart ve Dede Hasan’ın ilk tart siparişi',async({page})=>{
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      jeton:144,tatliSeviye:3,secili:'corba-sofrasi',restoranda:true,ekran:'masa',
      restoran:{sira:0,menuId:'corba-sofrasi',sonYemek:'corba-sofrasi',evre:'mutfak',sayildi:true},
      masalar:{'corba-sofrasi':{tabaklar:{icecek:true},sunuldu:true,odenen:3}},
      pastane:{acik:true,vitrin:{},taslaklar:{}},
      gun:{no:4,ziyaret:1,kazanc:3,kapandi:false}
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:/Meyveli Tart.*Kilidi aç.*144 jeton/}).click();
  await expect(page.locator('.tatli-cuzdan')).toHaveText('0');
  await page.getByRole('button',{name:/Meyveli Tart.*Hazırla/}).click();
  await expect(page.getByRole('button',{name:'Hamuru merdaneyle aç'})).toBeVisible();
  // Reopen during the last fruit's landing animation, just before the plating screen.
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.tepsiler.pastane.taslaklar['meyveli-tart']={adim:4,surum:2,yanlis:0,tartYerleri:[0,1,2,3,4]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Krem servis tabağı'}).click();
  await page.getByRole('button',{name:'Vitrine koy'}).click();
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).click();
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  await page.getByRole('button',{name:'Meyveli Tart vitrinden tepsiye al'}).click();
  await expect(page.locator('.salonda-servis-et .pastane-porsiyonu')).toHaveAttribute('data-tabak','beyaz');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.getByRole('button',{name:/24 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(24);
  expect(t.gun).toEqual({no:4,ziyaret:2,kazanc:27,kapandi:false});
  expect(t.tatliSeviye).toBe(4);
});
