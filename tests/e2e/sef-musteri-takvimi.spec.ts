import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('On iki günün servisleri, kilitleri ve ertesi sabahın fişi kayıt sonrasında tutarlıdır',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(u=>u.searchParams.has('token'),()=>{});
  await page.goto('./sef/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Restoranı aç'}).waitFor({timeout:60000});
  const sonuc=await page.evaluate(async()=>{
    const modul=(ad:string)=>performance.getEntriesByType('resource').find(r=>new URL(r.name).pathname==='/sef/src/'+ad+'.ts')!.name;
    const fis=modul('tepsi-fisleri'),masa=modul('tepsi-masasi');
    const {menuAcik,menuTatlisi,aktifMenu,bosTepsiler,sonrakiMenu,sofrayiHatirla,tepsileriOku}=await import(fis);
    const {restoranAc}=await import(masa);
    let t=bosTepsiler();const gunler=[];restoranAc(t,false,()=>{});
    for(let gun=1;gun<=12;gun++){
      const yemekler=[];t.tatliSeviye=Math.min(4,gun-1);
      for(let ziyaret=0;ziyaret<3;ziyaret++){
        if(gun+ziyaret>1)restoranAc(t,true,()=>{});
        const m=aktifMenu(t),tabak=t.masalar[m.id];
        const tatli=menuTatlisi(m);if(tatli){tabak.tabaklar[tatli]=true;tabak.tatliPuani=3;}
        else if(m.parcalar.includes('icecek')&&!m.smoothie){tabak.tabaklar.icecek=true;tabak.adim.icecek=5;}
        yemekler.push({id:m.id,kim:m.misafir,tatli:!!menuTatlisi(m),ana:m.parcalar.some((p:string)=>p!=='icecek'&&p!==menuTatlisi(m)),acik:menuAcik(m,t.tatliSeviye)});
        tabak.sunuldu=true;t.rekorlar[m.id]=3;t.gun.ziyaret=ziyaret+1;
        sofrayiHatirla(t,m.id,tabak,t.restoran.sira);
        const beklenen=sonrakiMenu(t).id;
        t=tepsileriOku(JSON.parse(JSON.stringify(t)),(s:unknown)=>s);
        if(aktifMenu(t).id!==m.id||sonrakiMenu(t).id!==beklenen)throw Error('Fiş yeniden açıldığında değişti: '+m.id);
      }
      gunler.push(yemekler);t.gun={no:gun+1,ziyaret:0,kazanc:0,kapandi:false};
    }
    const eski=bosTepsiler();eski.restoran={sira:3,evre:'siparis'};eski.masalar['simit-pembe']={...t.masalar['corba-sofrasi']};
    const icecek=bosTepsiler(),id='simit-pembe';
    restoranAc(icecek,false,()=>{},id);
    const ilk=icecek.masalar[id].smoothieBuzIstegi;
    Object.assign(icecek.masalar[id],{sunuldu:true,tabaklar:{icecek:true},icecekPuani:3});icecek.gun.no=2;
    restoranAc(icecek,true,()=>{},id);
    return {gunler,eski:aktifMenu(tepsileriOku(eski,(s:unknown)=>s)).id,ilk,tekrar:icecek.masalar[id].smoothieBuzIstegi};
  });
  expect(sonuc.gunler[0].map((x:{id:string})=>x.id)).toEqual(['corba-sofrasi','fiyonk-tavuk','fiyonk-sis']);
  expect(sonuc.eski).toBe('simit-pembe');expect(sonuc.ilk).toBe(false);expect(sonuc.tekrar).toBe(false);
  for(const gun of sonuc.gunler){
    expect(gun.every((x:{acik:boolean})=>x.acik)).toBeTruthy();
    expect(gun.filter((x:{tatli:boolean})=>x.tatli).length).toBeLessThanOrEqual(1);
    expect(gun.filter((x:{ana:boolean})=>x.ana).length).toBeGreaterThanOrEqual(2);
  }
  const erken=sonuc.gunler.slice(0,4).flat();
  for(const kim of ['corba','salata','pizza','kino','anne','baba'])expect(erken.map((x:{kim:string})=>x.kim)).toContain(kim);
  for(const id of ['aile-kahvaltisi','bahce-durumu','kurabiye','dondurma','minik-kek','meyveli-tart'])expect(sonuc.gunler.flat().map((x:{id:string})=>x.id)).toContain(id);
});

test('İkinci sabah Kino ve Anne doğal sırada kapıdan gelir, ikisinin de siparişi tekrar açılır',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(u=>u.searchParams.has('token'),()=>{});
  await page.setViewportSize({width:568,height:320});
  await page.addInitScript(()=>{
    if(localStorage.getItem('minkino-sef-v1'))return;
    const id='fiyonk-sis';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{restoranda:true,ekran:'masa',secili:id,
      restoran:{sira:2,menuId:id,sonYemek:id,evre:'mutfak',sayildi:true},gun:{no:1,ziyaret:3,kazanc:6,kapandi:true},
      masalar:{[id]:{sunuldu:true,tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3}}}}}}));
  });
  await page.goto('./sef/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'2. güne başla'}).tap();
  const fis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(fis).toBeVisible({timeout:30000});
  await fis.tap();
  await expect(page.locator('.tepsi-yuva[data-parca=omlet]')).toBeVisible();
  await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toBeVisible();
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.tepsi-yuva[data-parca=icecek]')).toBeVisible({timeout:30000});
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.restoran).toMatchObject({menuId:'aile-kahvaltisi',sira:3});expect(t.gun.ziyaret).toBe(0);
});
