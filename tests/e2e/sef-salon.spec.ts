import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});
});

for(const [kim,menu,ad,meyve] of [
  ['kino','kino-tost-molasi','Kino','portakal'],
  ['anne','anne-kahvaltisi','Anne','limon']
] as const){
  test(ad+' salonda oturur, kendi sesiyle sipariş verir, servis ağzına ulaşır',async({page})=>{
    await page.goto('./sef/');
    await page.evaluate(({menu,meyve})=>{
      const t={sessiz:false,tepsiler:{restoranda:true,ekran:'masa',secili:menu,
        restoran:{sira:6,menuId:menu,evre:'gelis'},masalar:{[menu]:{tabaklar:{icecek:true},sunuldu:false,icecekMeyvesi:meyve,adim:{icecek:5,tavuk:0},icecekPuani:3}}}};
      localStorage.setItem('minkino-sef-v1',JSON.stringify(t));
    },{menu,meyve});
    await page.reload();
    await expect(page.locator('.salon-figur[data-karakter="'+kim+'"]')).toBeAttached();
    const ses=page.waitForRequest(r=>r.url().includes('/salon/'+kim+'-restoran-'+menu+'.mp3'));
    await page.getByRole('button',{name:'Siparişe geç'}).tap();
    await ses;
    const oyuncu=page.locator('.salon-figur[data-karakter="'+kim+'"]');
    await expect(oyuncu).toHaveAttribute('data-poz','otur');
    await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
    await page.getByRole('button',{name:'Restoran salonuna dön'}).tap();
    await expect(oyuncu).toHaveAttribute('data-poz','otur');
    await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
    await expect(oyuncu).toHaveAttribute('data-yuz','acik');
    await expect(page.locator('.restoran-lokma')).toHaveCount(0);
    await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toHaveAttribute('data-lokma-adedi','1');
    await expect(page.locator('.servis-jetonu')).toHaveAccessibleName(/3 jeton/);
  });
}

test('Çocuk vitrindeki porsiyonlar arasında gezip siparişe uymayanı da seçebilir',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const stok=['cilek','vanilya','cilek','cikolata'].map(tat=>({tat,puan:3,tabak:'beyaz'}));
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:'dondurma',restoranda:true,tatliSeviye:2,restoran:{sira:5,menuId:'dondurma',evre:'mutfak'},
      masalar:{dondurma:{tabaklar:{},sunuldu:false,dondurmaIstegi:'vanilya'}},pastane:{vitrin:{dondurma:stok}}
    }}));
  });
  await page.reload();const giris=page.locator('.vitrinden-sun');
  await giris.tap();await expect(page.locator('.vitrin-tabagi')).toHaveCount(3);
  await page.keyboard.press('Escape');await expect(giris).toBeFocused();
  await giris.tap();await page.getByRole('button',{name:'Sonraki porsiyonlar'}).tap();
  await page.getByRole('button',{name:'4. porsiyon, Çikolatalı dondurma'}).tap();
  await page.reload();
  await expect(page.locator('.salonda-servis-et .pastane-porsiyonu')).toHaveAttribute('data-tat','cikolata');
  await page.getByRole('button',{name:'Lokum masasına götür'}).tap();
  await expect(page.locator('.tepsi-yuva .pastane-porsiyonu')).toHaveAttribute('data-tat','cikolata');
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar.dondurma.tatliPuani).toBe(2);
  expect(t.pastane.vitrin.dondurma.map((p:{tat:string})=>p.tat)).toEqual(['cilek','vanilya','cilek']);
});
for(const doluluk of [50,90])test('Turuncu içecek yudumlandıkça azalır ve masaya geri gelince dolmaz '+doluluk,async({page})=>{
  await page.goto('./sef/');
  await page.evaluate(doluluk=>{
    const menu='turuncu-mola';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:menu,restoranda:true,jeton:18,restoran:{sira:2,menuId:menu,evre:'mutfak',sayildi:true},
      masalar:{[menu]:{sunuldu:true,adim:{icecek:5,tavuk:0},tabaklar:{icecek:true},smoothie:{evre:'servis',meyveler:['portakal','portakal'],karisim:96,bardak:doluluk,buzlu:true}}}
    }}));
  },doluluk);
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  const tabak=page.locator('.tepsi-yuva[data-parca=icecek]'),bardak=tabak.locator('.sm-bardak');
  const seviye=()=>bardak.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--sm-dolu')));
  const tam=await seviye();
  const yudum=doluluk===50?2:3;
  await tabak.tap();await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await seviye()).toBeCloseTo(tam*(1-1/yudum));
  await page.reload();expect(await seviye()).toBeCloseTo(tam*(1-1/yudum));
  for(let i=1;i<yudum;i++){await tabak.tap();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');}
  await expect(tabak).toHaveAttribute('data-tukendi','true');
  expect(await seviye()).toBe(0);
  await page.reload();await expect(tabak).toHaveAttribute('data-tukendi','true');
  const durum=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(durum.jeton).toBe(18);expect(durum.masalar['turuncu-mola'].smoothie.bardak).toBe(doluluk);
});
