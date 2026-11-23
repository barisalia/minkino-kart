import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.use({hasTouch:true,isMobile:true});
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',s=>s.connectToServer().onMessage(m=>{if(typeof m==='string'&&m.includes('full-reload'))return;s.send(m);}));
});
for(const width of [568,960]){
  test('Kumpiri '+width+' pikselde aç, ez, doldur, tadımda gerçek lokmayı gör',async({page})=>{
    await page.setViewportSize({width,height:width===568?320:540});
    await page.goto('./sef/?test=1');
    await page.evaluate(()=>{const id='misirli-kumpir';localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:id,restoranda:true,restoran:{sira:6,menuId:id,evre:'siparis'},masalar:{[id]:{tabaklar:{},sunuldu:false}}
    }}));});await page.reload();
    if(process.env.TOST_ONIZLEME&&width===960)await page.screenshot({path:process.env.TOST_ONIZLEME+'/kumpir-siparis.png'});
    await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
    await page.getByRole('button',{name:'Kumpir hazırla',exact:true}).tap();
    const el=await page.context().newCDPSession(page);
    const send=(type:'touchStart'|'touchMove'|'touchEnd',x=0,y=0)=>el.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,radiusX:4,radiusY:4}]});
    const ac=page.getByRole('button',{name:'Patatesi çizgiden aç'}),r=(await ac.boundingBox())!;
    await send('touchStart',r.x+r.width*.23,r.y+r.height*.32);
    for(const x of [.28,.39,.52,.66,.81])await send('touchMove',r.x+r.width*x,r.y+r.height*.32);
    await send('touchEnd');
    await page.getByRole('button',{name:'1. patates parçasını ez'}).tap();
    await expect(page.locator('.kp-ez-izler [data-bolge="0"]')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button',{name:'1. patates parçasını ez'})).toBeHidden();
    const ikinci=(await page.getByRole('button',{name:'2. patates parçasını ez'}).boundingBox())!;
    const uc=(await page.getByRole('button',{name:'3. patates parçasını ez'}).boundingBox())!;
    await send('touchStart',ikinci.x+ikinci.width/2,ikinci.y+ikinci.height/2);
    if(process.env.TOST_ONIZLEME&&width===568)await page.screenshot({path:process.env.TOST_ONIZLEME+'/kumpir-ezme.png'});
    for(let i=1;i<=7;i++)await send('touchMove',(ikinci.x+ikinci.width/2)*(1-i/7)+(uc.x+uc.width/2)*i/7,(ikinci.y+ikinci.height/2)*(1-i/7)+(uc.y+uc.height/2)*i/7);
    await send('touchEnd');
    const hedef=page.locator('.kp-ust'),yer=(await hedef.boundingBox())!;
    const misir=(await page.getByRole('button',{name:'Mısır',exact:true}).boundingBox())!;
    await send('touchStart',misir.x+misir.width*.5,misir.y+misir.height*.5);
    for(let i=1;i<=10;i++)await send('touchMove',(misir.x+misir.width*.5)*(1-i/10)+(yer.x+yer.width*.36)*i/10,(misir.y+misir.height*.5)*(1-i/10)+(yer.y+yer.height*.40)*i/10);
    await send('touchEnd');
    await page.getByRole('button',{name:width===568?'Turşu':'Zeytin',exact:true}).tap();
    await expect(page.locator('.kp-malzeme[aria-pressed=true]')).toHaveCount(1);
    await hedef.tap({position:{x:yer.width*.64,y:yer.height*.44}});
    const tur=width===568?'tursu':'zeytin',once=await hedef.locator('.kumpir-ic[data-malzeme="'+tur+'"]').evaluate(e=>parseFloat((e as HTMLElement).style.left));
    const k=(await hedef.locator('.kumpir-ic[data-malzeme="'+tur+'"]').boundingBox())!;
    await send('touchStart',k.x+k.width/2,k.y+k.height/2);
    for(let i=1;i<=8;i++)await send('touchMove',k.x+k.width/2+yer.width*.095*i/8,k.y+k.height/2+yer.height*.01*i/8);
    await send('touchEnd');await el.detach();
    const sonra=await hedef.locator('.kumpir-ic[data-malzeme="'+tur+'"]').evaluate(e=>parseFloat((e as HTMLElement).style.left));
    expect(sonra).toBeGreaterThan(once+4);
    if(process.env.TOST_ONIZLEME&&width===568)await page.screenshot({path:process.env.TOST_ONIZLEME+'/kumpir-ic.png'});
    await page.getByRole('button',{name:'Kumpiri tepsiye koy'}).tap();
    await expect(page.locator('.salonda-servis-et .kumpir-ic')).toHaveCount(2);
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await expect(page.locator('.kp-kasik-dolgu')).toHaveAttribute('data-malzeme',width===568?'tursu':'zeytin');
    await expect(page.locator('.tepsi-yuva .kp-isirildi')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.anilar.at(-1)?.masa.kumpirServisi?.katlar.length)).toBe(2);
    await page.reload();
    const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
    const sonuc=t.masalar['misirli-kumpir'];expect(sonuc.kumpirPuan).toBe(width===568?3:1);
    expect(t.gun.kazanc).toBe(sonuc.kumpirPuan);expect(t.jeton).toBe(sonuc.kumpirPuan);
    expect(t.anilar.at(-1).masa.kumpirServisi.katlar).toEqual(sonuc.kumpirServisi.katlar);
    expect(t.anilar.at(-1).masa.kumpirPuan).toBe(sonuc.kumpirPuan);
    expect(sonuc.kumpirServisi.katlar[1].x-sonuc.kumpirServisi.katlar[0].x).toBeGreaterThan(15);
    if(width===960){
      await page.getByRole('button',{name:'Kumpir siparişi ile tabağı karşılaştır'}).tap();
      await page.getByRole('button',{name:'Kumpirin iç malzemelerini değiştir'}).tap();
      await expect(hedef.locator('.kumpir-ic')).toHaveCount(2);
      await page.getByRole('button',{name:'Son malzemeyi geri al'}).tap();
      await page.getByRole('button',{name:'Turşu',exact:true}).tap();
      await hedef.tap({position:{x:yer.width*.63,y:yer.height*.43}});
      await page.getByRole('button',{name:'Kumpiri tepsiye koy'}).tap();
      await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
      await expect(page.getByRole('button',{name:/2 jeton kazanıldı/})).toBeVisible();
      const duzeltilen=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
      expect(duzeltilen.gun.ziyaret).toBe(t.gun.ziyaret);
      expect(duzeltilen.jeton).toBe(3);expect(duzeltilen.gun.kazanc).toBe(3);
      expect(duzeltilen.masalar['misirli-kumpir'].kumpirServisi.katlar[0]).toEqual(sonuc.kumpirServisi.katlar[0]);
      expect(duzeltilen.anilar).toHaveLength(t.anilar.length);
      expect(duzeltilen.anilar.at(-1).masa.kumpirServisi.katlar.map((kat:{id:string})=>kat.id)).toEqual(['misir','tursu']);
    }
  });
}
// Resimli tarif kitabı 16 Kasım'da (c3d9d09a) kaldırıldı; Kumpir panodaki ikinci tarif rafından açılıyor.
test('İkinci raftaki Kumpir kartı oynanabilir hazırlığı açar',async({page})=>{
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
  const kart=page.getByRole('button',{name:'Kumpir tezgâhını aç',exact:true});
  expect(await kart.locator('img').evaluate(async el=>{const im=el as HTMLImageElement;await im.decode();return im.naturalWidth;})).toBeGreaterThan(100);
  await kart.tap();
  await expect(page.getByRole('region',{name:'Kumpir tezgâhı'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Patatesi çizgiden aç'})).toBeVisible();
  await expect(page.locator('.kp-fis img')).toHaveCount(2);
});

test('Çocuk gerçek kumpir lokmalarını kaşıkla taşır, tabağın en son konan iç malzemesi önce yenir',async({page})=>{
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const id='misirli-kumpir';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      jeton:3,gun:{no:1,ziyaret:1,kazanc:3,kapandi:false},restoranda:true,ekran:'masa',secili:id,
      restoran:{sira:4,menuId:id,evre:'mutfak',sayildi:true},masalar:{[id]:{sunuldu:true,tabaklar:{kumpir:true},kumpirPuan:3,odenen:3,
        kumpirServisi:{evre:'koy',yarik:1,ezme:7,katlar:[{id:'misir',x:30,y:43},{id:'tursu',x:63,y:42}]}}}
    }}));
  });
  await page.reload();const tabak=page.getByRole('button',{name:'Kumpir tattır'});
  const tut=(await tabak.locator('.lokma-tutamaci').boundingBox())!;
  const parmak=await page.context().newCDPSession(page);
  const hareket=(type:'touchStart'|'touchMove'|'touchEnd',x=0,y=0)=>parmak.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await hareket('touchStart',tut.x+tut.width/2,tut.y+tut.height/2);
  await hareket('touchMove',tut.x-14,tut.y-10);
  const pure=page.locator('.elle-tasinan .kp-kasik-pure');
  await expect(pure).toBeVisible();await expect(page.locator('.elle-tasinan .kp-kasik-dolgu')).toHaveAttribute('data-malzeme','tursu');
  expect(await pure.evaluate(async e=>{const im=e as HTMLImageElement;await im.decode();return im.naturalWidth;})).toBeGreaterThan(150);
  const agiz=await page.locator('.salon-figur:not(.salon-arkadas)').evaluate(el=>{
    const oyuncu=el as HTMLElement,r=oyuncu.querySelector('.restoran-oyuncu-bedeni')!.getBoundingClientRect();
    return {x:r.left+r.width*Number(oyuncu.dataset.agizX),y:r.top+r.height*Number(oyuncu.dataset.agizY)};
  });
  await hareket('touchMove',agiz.x,agiz.y);await hareket('touchEnd');await parmak.detach();
  await expect(tabak).toHaveAttribute('data-lokma-adedi','1');
  await expect(tabak.locator('.kumpir-ic:not([hidden])')).toHaveAttribute('data-malzeme','misir');
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await tabak.tap();await expect(page.locator('.kp-kasik-dolgu')).toHaveAttribute('data-malzeme','misir');
  await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await tabak.tap();await expect(tabak).toHaveAttribute('data-tukendi','true');
  await expect(tabak.locator('.kumpir-sunumu')).toBeHidden();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect([t.jeton,t.gun.ziyaret,t.gun.kazanc]).toEqual([3,1,3]);
});

test('Lokumun tekrar ziyaretinde istediği çift kayıtla korunur ve buna göre tadılır',async({page})=>{
  await page.setViewportSize({width:720,height:360});await page.goto('./sef/?test=1');
  await page.evaluate(async()=>{
    const a='/sef/src/tepsi-fisleri.ts',b='/sef/src/tepsi-masasi.ts';
    const {bosTepsiler,bosMasa}=await import(a),{restoranAc}=await import(b);
    const t=bosTepsiler(),id='misirli-kumpir';
    t.masalar[id]={...bosMasa(),kumpirFisi:id,sunuldu:true};t.rekorlar[id]=3;t.restoran={sira:3,menuId:id,evre:'mutfak'};
    restoranAc(t,true,()=>{},id);
    t.restoran.evre='siparis';
    const masa=t.masalar[id];masa.kumpirTaslagi={yarik:1,ezme:7,evre:'koy',katlar:[{id:'tursu',x:34,y:45},{id:'zeytin',x:63,y:45}]};
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:t}));
  });
  await page.reload();await expect(page.locator('.restoran-siparis .tost-fis-icerik img').first()).toHaveAttribute('src',/tursu/);
  await expect(page.locator('.restoran-siparis .tost-fis-icerik img').last()).toHaveAttribute('src',/zeytin/);
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
  await page.getByRole('button',{name:'Kumpir hazırla',exact:true}).tap();
  await expect(page.locator('.kp-fis [aria-label="Zeytin eklendi"]')).toBeVisible();
  await page.getByRole('button',{name:'Kumpiri tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/3 jeton kazanıldı/})).toBeVisible();
  await page.reload();const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar['misirli-kumpir'].kumpirFisi).toBe('kumpir-tursu-zeytin');expect(t.masalar['misirli-kumpir'].kumpirPuan).toBe(3);
});

test('Lokumun kumpir ve portakal suyu sofrasında çocuğun iki işi aynı ziyarette altı jeton getirir',async({page})=>{
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    const id='kumpir-portakal';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      ekran:'masa',secili:id,restoranda:true,restoran:{sira:16,menuId:id,evre:'siparis'},
      masalar:{[id]:{tabaklar:{},sunuldu:false,kumpirTaslagi:{evre:'koy',yarik:1,ezme:7,katlar:[{id:'misir',x:39,y:43}]}}}
    }}));
  });await page.reload();
  await expect(page.locator('.restoran-siparis .kumpir-sunumu')).toBeVisible();
  await expect(page.locator('.restoran-siparis > img.tepsi-gida')).toHaveAttribute('src',/portakal-128\.webp/);
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).tap();
  await page.getByRole('button',{name:'Kumpir hazırla',exact:true}).tap();
  await page.getByRole('button',{name:'Turşu',exact:true}).tap();
  await page.locator('.kp-ust').tap();
  await page.getByRole('button',{name:'Kumpiri tepsiye koy'}).tap();
  if(await page.locator('.tepsi-yuva[data-parca=icecek]').isVisible())await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('.ps-meyve-sec[data-meyve=portakal]').tap();
  await page.locator('.ps-ham').tap();await page.locator('.ps-dene').tap();
  for(let i=0;i<3;i++)await page.locator('.ps-cevir').tap();
  for(let i=0;i<2;i++){await page.locator('.ps-surahi').tap();await page.locator('.ps-bardak').tap();}
  await expect(page.locator('.salonda-servis-et > :not(.ustalik-dekor)')).toHaveCount(2);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:/6 jeton kazanıldı/})).toBeVisible();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect([t.gun.ziyaret,t.gun.kazanc,t.jeton]).toEqual([1,6,6]);
  expect(t.anilar.at(-1).masa.icecekMeyvesi).toBe('portakal');
});

for(const [width,id,istenen,konan,puan] of [
  [568,'kumpir-uc-renk',['kasar','bezelye','koz-biber'],['kasar','bezelye','koz-biber'],3],
  [844,'kumpir-kasar-bezelye',['kasar','bezelye'],['kasar','zeytin'],1],
  [568,'kumpir-koz-zeytin',['koz-biber','zeytin'],['koz-biber'],2],
] as const){
  test(id+' siparişi, altı garnitür ve gerçek jeton getirisi',async({page})=>{
    await page.setViewportSize({width,height:width===568?320:390});
    await page.goto('./sef/?test=1');
    await page.evaluate(id=>{
      localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
        ekran:'masa',secili:id,restoranda:true,restoran:{sira:5,menuId:id,evre:'siparis'},
        masalar:{[id]:{tabaklar:{},sunuldu:false,kumpirTaslagi:{evre:'koy',yarik:1,ezme:7,katlar:[]}}}
      }}));
    },id);
    await page.reload();
    const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
    for(const k of istenen)await expect(siparis.locator('.kumpir-ic[data-malzeme="'+k+'"]')).toBeVisible();
    await siparis.tap();
    await page.getByRole('button',{name:'Kumpir hazırla',exact:true}).tap();
    const tuslar=page.locator('.kp-raf button');await expect(tuslar).toHaveCount(8);
    const sinirlar=await tuslar.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.left,r.right,r.width,r.height];}));
    for(const [sol,sag,en,boy] of sinirlar){expect(sol).toBeGreaterThanOrEqual(0);expect(sag).toBeLessThanOrEqual(width);expect(Math.min(en,boy)).toBeGreaterThanOrEqual(42);}
    const patates=page.locator('.kp-ust'),alan=(await patates.boundingBox())!;
    for(const [i,k] of konan.entries()){
      await page.locator('.kp-malzeme[data-malzeme="'+k+'"]').tap();
      await patates.tap({position:{x:alan.width*(.33+.17*i),y:alan.height*.44}});
    }
    if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/'+id+'.png'});
    await page.getByRole('button',{name:'Kumpiri tepsiye koy'}).tap();
    await expect(page.locator('.salonda-servis-et .kumpir-ic')).toHaveCount(konan.length);
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await expect(page.getByRole('button',{name:new RegExp(puan+' jeton kazanıldı')})).toBeVisible();
    await page.reload();
    const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
    expect(t.masalar[id].kumpirFisi).toBe(id);expect(t.jeton).toBe(puan);
  });
}
// Kitaptaki fiş seçimi kaldırıldı; üç renkli kumpir siparişi kendi masasından açılır ve aynı garnitürleri tezgâha taşır.
test('Üç renkli kumpir siparişi aynı garnitürleri tezgâha taşır',async({page})=>{
  await page.setViewportSize({width:844,height:390});await page.goto('./sef/?test=1&giris=tepsiler&siparis=kumpir-uc-renk');
  await page.locator('.tepsi-yuva[data-parca=kumpir]').tap();
  if(process.env.TOST_ONIZLEME)await page.screenshot({path:process.env.TOST_ONIZLEME+'/kitap-kumpir.png'});
  await expect(page.getByRole('button',{name:'Patatesi çizgiden aç'})).toBeVisible();
  await expect(page.locator('.kp-fis img')).toHaveCount(3);
  await expect(page.locator('.kp-fis img').last()).toHaveAttribute('src',/koz-biber/);
});
