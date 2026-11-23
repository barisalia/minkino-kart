import {test,expect,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
const tarifler=['kurabiye','dondurma','minik-kek','meyveli-tart','sutlac'] as const;
type Tarif=typeof tarifler[number];
const kase={desen:'cicek',toz:.81,kivam:'ipeksi',doluluk:.75};
async function kaydet(page:Page,degisiklik:object){
  await page.evaluate(deger=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,deger);localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  },degisiklik);await page.reload();
}
async function yuklendi(page:Page){
  const eksik=await page.locator('img:visible').evaluateAll(async dugumler=>{
    const imgs=dugumler as HTMLImageElement[];
    await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));return imgs.filter(i=>!i.naturalWidth).map(i=>i.src);
  });expect(eksik).toEqual([]);
}
test.beforeEach(async({page})=>{
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
});
test('Küçük telefonda tatlı resmi ve süsleri sipariş balonuna sığar',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  for(const [id,tatli,ikon] of [
    ['makarna-kurabiye','kurabiye','.kb-siparis'],
    ['baba-pizza-kek','minik-kek','.mk-kek'],
    ['babaanne-simit-tart','meyveli-tart','.tart-tam-gorsel']
  ]){
    await kaydet(page,{tatliSeviye:5,ekran:'masa',secili:id,restoranda:true,restoran:{sira:2,menuId:id,evre:'mutfak'},
      masalar:{[id]:{sunuldu:false,tabaklar:{[tatli]:true},tatliPuani:3}}});
    const fis=page.locator('.tepsi-istek');
    const sinir=(await fis.boundingBox())!;
    const resim=fis.locator(ikon);
    await expect(resim).toBeVisible();
    expect((await resim.boundingBox())!.width).toBeGreaterThan(25);
    for(const sus of await fis.locator('.mk-fis>img,.tart-fis-rozet img,.kb-fis img').all()){
      const r=(await sus.boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(sinir.x);
      expect(r.x+r.width).toBeLessThanOrEqual(sinir.x+sinir.width);
      expect(r.height).toBeGreaterThan(8);
    }
  }
});
test('Kurabiye tepsisi rafa sürülür, fırın kapalı ekranda ilerlemez ve tezgahtan dönünce aynı kıvamda çıkar',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await kaydet(page,{tatliSeviye:5,pastane:{acik:true,vitrin:{},tezgah:'kurabiye',taslaklar:{kurabiye:{adim:3,surum:2,yanlis:0,sekil:'kalp'}}}});
  const firin=page.locator('.ta-firin-istasyonu'),tepsi=firin.locator('.ta-firin-yemek');
  const sure=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.pastane.taslaklar.kurabiye.firinSuresi);
  const kaydir=async(x:number,y:number)=>{
    const a=(await tepsi.boundingBox())!,b=(await firin.boundingBox())!;
    await page.mouse.move(a.x+a.width*.5,a.y+a.height*.56);await page.mouse.down();
    await page.mouse.move(b.x+b.width*x,b.y+b.height*y,{steps:12});await page.mouse.up();
  };
  await kaydir(.83,.42);await expect(firin).not.toHaveAttribute('data-evre',/.+/);
  await kaydir(.5,.49);
  await expect(firin).toHaveAttribute('data-evre','pisiyor');
  await expect.poll(sure).toBeGreaterThan(500);
  const arka=(v:boolean)=>page.evaluate(arkada=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada}})),v);
  await arka(true);const askida=await sure();
  await page.waitForTimeout(650);expect(await sure()).toBe(askida);
  await arka(false);await expect.poll(sure).toBeGreaterThan(askida);
  await expect(firin).toHaveAttribute('data-evre','hazir');
  await page.getByRole('button',{name:'Pastaneye dön'}).tap();
  expect(await sure()).toBeGreaterThanOrEqual(2300);
  await page.locator('.tatli-vitrin-karti').first().tap();
  await expect(firin).toHaveAttribute('data-evre','hazir');
  await page.reload();await expect(firin).toHaveAttribute('data-evre','hazir');
  await kaydir(.52,.85);
  await page.reload();
  await expect(page.locator('.tatli-tezgahi')).toHaveAttribute('data-adim','4');
  expect(await sure()).toBeUndefined();
});
test('Beş pastane tezgâhı küçük yatay dokunmatik ekranda açılır, geri döner ve tek porsiyon yazar',async({page})=>{
  test.setTimeout(150000);
  await kaydet(page,{tatliSeviye:5,pastane:{acik:true,vitrin:{},taslaklar:{}}});
  for(const [i,tarif] of tarifler.entries()){
    const kart=page.locator('.tatli-vitrin-karti').nth(i);await kart.tap();
    await expect(page.locator('[data-tatli="'+tarif+'"]')).toHaveAttribute('data-adim','0');
    await yuklendi(page);
    await page.getByRole('button',{name:'Pastaneye dön'}).tap();await expect(kart).toBeVisible();
    const adim=tarif==='sutlac'?4:tarif==='dondurma'?3:5;
    const taslak={surum:2,adim,yanlis:0,sutlac:{adim:4,pirinc:true,sut:1,isi:.59,karistirma:.8,...kase}};
    await page.evaluate(({tarif,taslak})=>{
      const ana=JSON.parse(localStorage.getItem('minkino-sef-v1')!);const p=ana.tepsiler.pastane;
      p.tezgah=tarif;p.taslaklar[tarif]=taslak;localStorage.setItem('minkino-sef-v1',JSON.stringify(ana));
    },{tarif,taslak});await page.reload();await yuklendi(page);
    const son=page.getByRole('button',{name:'Vitrine koy'}),r=await son.boundingBox();
    await page.touchscreen.tap(r!.x+r!.width/2,r!.y+r!.height/2);
    await page.touchscreen.tap(r!.x+r!.width/2,r!.y+r!.height/2);
    await page.reload();
    const stok=await page.evaluate((tarif:Tarif)=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.pastane.vitrin[tarif],tarif);
    expect(stok).toHaveLength(1);
    const geri=page.getByRole('button',{name:'Pastaneye dön'});if(await geri.isVisible())await geri.tap();
    await expect(kart).toHaveAccessibleName(/rafta 1 tane/);await yuklendi(page);
  }
});
// Tabak albümü 16 Kasım'da (c3d9d09a) kaldırıldı; kâsenin çizimi masada, sofra fotoğrafı kayıtta (tepsiler.anilar) denetlenir.
test('Gerçek sütlaç kâsesi masada üç kaşığa denk gelir, sofra kaydı aynı kâseyi tutar',async({page},info)=>{
  test.setTimeout(90000);
  const masa={sunuldu:true,tabaklar:{sutlac:true},sutlacIstegi:'cicek',sutlacServisi:kase,tatliPuani:3,tatliTabagi:'beyaz',tadilan:{}};
  await kaydet(page,{tatliSeviye:5,ekran:'masa',secili:'sutlac',restoranda:true,restoran:{sira:8,menuId:'sutlac',evre:'mutfak',sayildi:true},
    masalar:{sutlac:masa},anilar:[{gun:2,sira:8,menuId:'sutlac',masa}],gun:{no:2,ziyaret:1,kazanc:30,kapandi:false}});
  const yuva=page.locator('.tepsi-yuva[data-parca="sutlac"]');
  const kaseGorseli=yuva.locator('.sl-kase');
  await expect(kaseGorseli).toHaveAttribute('data-desen','cicek');await yuklendi(page);
  const r=await kaseGorseli.boundingBox();expect(r!.width).toBeGreaterThan(25);expect(r!.width/r!.height).toBeCloseTo(720/494,1);
  if(process.env.SEF_TATLI_KALITE)await page.screenshot({path:process.env.SEF_TATLI_KALITE+'/sutlac-masa-'+info.project.name+'.png'});
  for(let i=1;i<=3;i++){
    await yuva.tap();await expect(yuva).toHaveAttribute('data-lokma-adedi',String(i),{timeout:11000});
    if(i===1){await page.reload();await expect(yuva.locator('.sl-ic')).toHaveAttribute('data-lokma','1');}
    await expect(page.locator('.restoran-lokma')).toHaveCount(0,{timeout:11000});
  }
  await expect(yuva.locator('.sl-kase-dis')).toBeVisible();
  await expect(yuva.locator('.sl-ic')).toBeHidden();
  await kaydet(page,{ekran:'kapali',restoranda:false});
  const ani=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar.find((a:{menuId:string})=>a.menuId==='sutlac'));
  expect(ani).toMatchObject({gun:2,sira:8,masa:{sutlacServisi:{desen:'cicek'}}});
});
test('Sütlaçta üst üste kalıp seçimleri eski tarçını temizler, yarıda kesilen iki dokunuş aynı kâseyi korur',async({page},info)=>{
  const sutlac={adim:3,pirinc:true,sut:1,isi:.64,karistirma:.78,doluluk:.75,toz:0};
  await kaydet(page,{tatliSeviye:5,pastane:{acik:true,tezgah:'sutlac',vitrin:{},taslaklar:{sutlac:{surum:2,adim:3,yanlis:0,sutlac}}}});
  const raf=page.getByRole('group',{name:'Tarçın kalıpları'}),alan=page.locator('.sl-kalip-alani');
  await raf.getByRole('button',{name:'Kalp kalıbı'}).tap();await page.locator('.sl-elek').tap();
  await raf.getByRole('button',{name:'Çiçek kalıbı'}).tap();await raf.getByRole('button',{name:'Yıldız kalıbı'}).tap();
  await expect(alan.locator('.sl-kalip-ust')).toHaveCount(1);
  await expect(alan.locator('.sl-kalip-ust')).toHaveAttribute('src',/kalip-yildiz/);
  await expect(page.getByRole('button',{name:'Kalıbı kaldır'})).toBeDisabled();
  await page.locator('.sl-elek').tap();await page.locator('.sl-elek').tap();await page.reload();
  await expect(raf.getByRole('button',{name:'Yıldız kalıbı'})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Kalıbı kaldır'})).toBeEnabled();
  if(process.env.SEF_TATLI_KALITE)await page.screenshot({path:process.env.SEF_TATLI_KALITE+'/sutlac-kalip-'+info.project.name+'.png'});
  await page.getByRole('button',{name:'Kalıbı kaldır'}).tap();await page.getByRole('button',{name:'Vitrine koy'}).tap();
  const p=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.pastane.vitrin.sutlac[0]);
  expect(p.sutlac.toz).toBeCloseTo(.28);expect(p.sutlac).toMatchObject({desen:'yildiz',doluluk:.75,kivam:'ipeksi'});
});
test('Kurabiye, dondurma, minik kek ve tartın üçüncü lokması kayda geçer',async({page})=>{
  test.setTimeout(160000);
  for(const tarif of tarifler.filter(t=>t!=='sutlac')){
    const masa=await page.evaluate(async(tarif)=>{
      const mod=(s:string)=>import(/* @vite-ignore */s);
      const k=await mod('/sef/src/kurabiye-tepsisi.ts'),m=await mod('/sef/src/minik-kek.ts'),t=await mod('/sef/src/tart-tarifi.ts');
      return {sunuldu:true,tabaklar:{[tarif]:true},tatliPuani:3,tatliTabagi:'sari',...(
        tarif==='kurabiye'?{kurabiyeIstegi:'kalp',kurabiyeSekli:'kalp',kurabiyeTepsisi:k.kurabiyeOrnegi('kalp')}:
        tarif==='minik-kek'?{kekFisi:'muz',kekServisi:m.kekOrnegi('muz')}:
        tarif==='dondurma'?{dondurmaIstegi:'vanilya',dondurmaTadi:'vanilya'}:{tartIstegi:'mor',tartDilimleri:t.tartIstegi('mor')})};
    },tarif);
    await kaydet(page,{tatliSeviye:5,ekran:'masa',secili:tarif,restoranda:true,restoran:{sira:8,menuId:tarif,evre:'mutfak',sayildi:true},
      masalar:{[tarif]:masa},gun:{no:2,ziyaret:1,kazanc:30,kapandi:false}});
    const yuva=page.locator('.tepsi-yuva[data-parca="'+tarif+'"]');
    for(let i=1;i<=3;i++){await yuva.tap();await expect(yuva).toHaveAttribute('data-lokma-adedi',String(i),{timeout:12000});
      await expect(page.locator('.restoran-lokma')).toHaveCount(0,{timeout:12000});}
    await page.reload();await expect(yuva).toHaveAttribute('data-tukendi','true');await yuklendi(page);
  }
});
