import {expect,test,type Locator,type Page} from '@playwright/test';
import {meyveler,renkAdi,renkSesi,smoothieOku,smoothiePuani,type SmoothieKaydi} from '../../sef/src/smoothie/tarif';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});
test.describe.configure({timeout:90000});
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',socket=>socket.connectToServer().onMessage(message=>{
    if(typeof message==='string'&&message.includes('full-reload'))return;
    socket.send(message);
  }));
});

test('Eski içecek kayıtları korunur ve sekiz malzemenin bütün çiftleri iki sırada da aynı rengi verir',()=>{
  const eski:SmoothieKaydi={evre:'servis',karisim:100,bardak:85,buzlu:false,meyveler:['muz','cilek'],denemeler:[['kivi','kivi']]};
  expect(smoothieOku(eski)).toEqual(eski);
  expect(smoothiePuani(eski,['cilek','muz'],false)).toBe(3);
  for(const [sira,a] of meyveler.entries())for(const b of meyveler.slice(sira)){
    expect(renkAdi([a,b])).toBeTruthy();expect(renkAdi([a,b])).toBe(renkAdi([b,a]));
    expect(renkSesi([a,b])).toBeTruthy();
  }
  const ikiTarif=smoothieOku({denemeler:[['portakal','portakal'],['muz','portakal'],['portakal','muz']]});
  expect(ikiTarif.denemeler).toEqual([['portakal','portakal'],['muz','portakal']]);
  const meyveCiftleri=meyveler.flatMap((a,i)=>meyveler.slice(i).map(b=>[a,b] as const));
  for(const ad of ['Şeftali','Koyu mor','Leylak','Pembe','Açık yeşil','Ahududu','Turuncu']){
    const tarifler=meyveCiftleri.filter(c=>renkAdi(c)===ad);
    expect(tarifler.length).toBeGreaterThan(0);
    for(const c of tarifler)expect(smoothiePuani({...eski,meyveler:[...c]},tarifler[0])).toBe(3);
  }
  for(const [a,b,renk] of [['muz','yabanmersini','Açık yeşil'],['cilek','sut','Pembe'],['cilek','yabanmersini','Koyu mor'],['cilek','muz','Turuncu']] as const){
    expect(renkAdi([a,b])).toBe(renk);
    expect(renkAdi([b,a])).toBe(renk);
  }
});

test('Sarı renk keşfi başka müşteride defterden dinlenir; denenmemiş tarif gizli kalır',async({page},info)=>{
  test.setTimeout(70000);
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=pizza-seftali');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  const ac=page.getByRole('button',{name:'Renk defterini aç'}),kitap=page.getByRole('dialog',{name:'Renk defterim'});
  await ac.tap();await expect(kitap.getByRole('listitem')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(kitap).toHaveCount(0);
  await expect(ac).toBeFocused();
  const muz=page.locator('[data-meyve=muz]');
  await expect.poll(()=>muz.locator('img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(150);
  await muz.tap();await muz.tap();await page.locator('.sm-kapak').tap();
  await tut(page,page.locator('.sm-motor-tusu'),2100);
  await expect(page.locator('.sm-tezgah')).toHaveAttribute('data-evre','dok');
  await page.goto('./sef/?giris=tepsiler&siparis=mor-mola');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();await ac.tap();
  await expect(kitap.getByRole('listitem')).toHaveCount(1);
  await expect(kitap.getByRole('listitem')).toHaveAccessibleName('Muz ve Muz — Muz sarısı');
  await expect(kitap.getByRole('listitem').locator('.sm-bardak')).toBeVisible();
  const ses=page.waitForResponse(r=>r.url().includes('/renk-sari.mp3')&&r.ok());
  await kitap.getByRole('button',{name:/rengini dinle/}).tap();await ses;
  await page.screenshot({path:info.outputPath('sari-renk-defteri.png')});
  await kitap.getByRole('button',{name:'Renk defterini kapat'}).tap();
  for(const meyve of await page.locator('.sm-meyve').all()){
    const r=(await meyve.boundingBox())!;expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);
    await expect(meyve).toBeInViewport();
  }
});

async function merkez(el:Locator){
  const r=await el.boundingBox();if(!r)throw Error('Tezgâhtaki araç görünmüyor.');
  return {x:r.x+r.width/2,y:r.y+r.height/2};
}
async function surukle(page:Page,kaynak:Locator,hedef:Locator){
  const a=await merkez(kaynak),b=await merkez(hedef);
  const dokunma=await page.context().newCDPSession(page);
  try{
    await dokunma.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    for(const t of [.25,.5,.75,1])await dokunma.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}]});
    await dokunma.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await dokunma.detach();}
}
async function tut(page:Page,el:Locator,sure:number){
  const nokta=await merkez(el),cdp=await page.context().newCDPSession(page);
  try{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[nokta]});
    await page.waitForTimeout(sure);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await cdp.detach();}
}
test('Çilek ve süt karışımında gerçek sürükleme, yarım kalan hazırlık ve servis',async({page})=>{
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?giris=tepsiler&siparis=meyveli-mola');
  await page.getByRole('button',{name:'Meyve karışımı hazırla',exact:true}).tap();
  const sahne=page.locator('.sm-tezgah');
  await surukle(page,page.locator('[data-meyve="cilek"]'),page.locator('.sm-surahi'));
  await page.reload();
  await expect(page.locator('.sm-dilimler .sm-parca')).toHaveCount(1);
  await expect(page.locator('[data-meyve="cilek"]')).toBeEnabled();
  await page.locator('[data-meyve="yabanmersini"]').tap();
  await page.getByRole('button',{name:'Son meyveyi geri al'}).tap();
  await page.locator('[data-meyve="sut"]').tap();
  if(process.env.SEF_SMOOTHIE_KARE)await sahne.screenshot({path:process.env.SEF_SMOOTHIE_KARE});
  await surukle(page,page.locator('.sm-kapak'),page.locator('.sm-surahi'));
  await tut(page,page.locator('.sm-motor-tusu'),650);
  await page.reload();
  await expect(sahne).toHaveAttribute('data-evre','karistir');
  await tut(page,page.locator('.sm-motor-tusu'),2000);
  await expect(sahne).toHaveAttribute('data-evre','dok');
  await tut(page,page.locator('.sm-dok-tusu'),3400);
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  await page.reload();
  await expect(page.locator(':is(.tepsi-yuva,.salonda-servis-et) .sm-bardak')).toHaveAttribute('data-meyveler','cilek,sut');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
});

test('Eksik doluluk ve farklı meyve gerçek puanı düşürür, önceki bardak yeniden hazırlanana kadar korunur',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=mor-mola');
  await page.locator('.tepsi-yuva[data-parca="icecek"]').tap();
  await page.locator('[data-meyve="muz"]').tap();await page.locator('[data-meyve="yabanmersini"]').tap();
  await page.locator('.sm-kapak').tap();
  await tut(page,page.locator('.sm-motor-tusu'),2050);
  await tut(page,page.locator('.sm-dok-tusu'),1560);
  await page.getByRole('button',{name:'Bardağı servise al'}).tap();
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  await page.reload();
  const kayit=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['mor-mola']);
  expect(await kayit()).toMatchObject({icecekPuani:1,smoothie:{meyveler:['muz','yabanmersini']}});
  await page.getByRole('button',{name:'Meyve karışımı yeniden hazırla'}).tap();
  await page.locator('[data-meyve="yabanmersini"]').tap();
  await page.reload();
  expect(await kayit()).toMatchObject({smoothie:{meyveler:['muz','yabanmersini']},tekrar:{icecek:{smoothie:{meyveler:['yabanmersini']}}}});
  await page.locator('[data-meyve="cilek"]').tap();await page.locator('.sm-kapak').tap();
  await tut(page,page.locator('.sm-motor-tusu'),2050);await tut(page,page.locator('.sm-dok-tusu'),3500);
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  expect(await kayit()).toMatchObject({icecekPuani:3,smoothie:{meyveler:['yabanmersini','cilek']}});
});

for(const senaryo of [{gun:2,istenen:true,puan:3},{gun:3,istenen:false,puan:2}]){
  test(senaryo.gun+'. günün hava durumu, müşteri buz tercihi ve tadım',async({page})=>{
    await page.setViewportSize({width:667,height:375});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Restoranı aç',exact:true}).tap();
    // Open the pink-drink ticket through the restaurant's normal arrival flow.
    await page.evaluate(async gun=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);k.sessiz=true;
      k.tepsiler.gun={no:gun,ziyaret:1,kazanc:3,kapandi:false};
      const modul='/sef/src/tepsi-masasi.ts';
      const {restoranAc}=await import(modul);
      restoranAc(k.tepsiler,true,()=>{},'simit-pembe');
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    },senaryo.gun);
    await page.reload();
    await page.getByRole('button',{name:'Siparişe geç',exact:true}).tap();
    const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
    await expect(siparis.locator('.sm-buz-isareti')).toHaveAttribute('data-buz',senaryo.istenen?'evet':'hayir');
    await siparis.tap();
    const simit=page.locator('.tepsi-yuva[data-parca=simit]');
    for(const boy of [{width:568,height:320},{width:844,height:390}]){
      await page.setViewportSize(boy);
      await expect(simit.locator('.simit-halkasi')).toBeVisible();
      const r=(await simit.boundingBox())!,g=(await simit.locator('.simit-halkasi').boundingBox())!;
      expect(g.x).toBeGreaterThanOrEqual(r.x);expect(g.y).toBeGreaterThanOrEqual(r.y);
      expect(g.x+g.width).toBeLessThanOrEqual(r.x+r.width);expect(g.y+g.height).toBeLessThanOrEqual(r.y+r.height);
    }
    await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
    await page.locator('[data-meyve=cilek]').tap();await page.locator('[data-meyve=sut]').tap();
    await page.locator('.sm-kapak').tap();await tut(page,page.locator('.sm-motor-tusu'),2200);
    await tut(page,page.locator('.sm-dok-tusu'),3500);
    const ver=page.getByRole('button',{name:'Meyve karışımını tepsiye koy'});
    await expect(ver).toBeDisabled();
    await surukle(page,page.getByRole('button',{name:'Bardağa buz küpü ekle'}),page.locator('.sm-servis-bardagi'));
    await page.reload();
    await expect(page.locator('.sm-servis-bardagi .sm-yuzen-buz')).toBeVisible();
    if(senaryo.istenen&&process.env.SEF_BUZ_KARE)await page.locator('.sm-tezgah').screenshot({path:process.env.SEF_BUZ_KARE});
    await ver.tap();
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
    await expect(page.getByRole('button',{name:senaryo.puan+' jeton kazanıldı'})).toBeVisible();
    const kayit=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
    expect(kayit.masalar['simit-pembe']).toMatchObject({icecekPuani:senaryo.puan,smoothieBuzIstegi:senaryo.istenen,smoothie:{buzlu:true}});
    expect(kayit.gun.ziyaret).toBe(2);
  });
}

test('Renk fişi tarifi saklar, çocuk karıştırıp başka bir çift deneyebilir',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=simit-pembe');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  const fis=page.getByRole('group',{name:'Müşterinin istediği renk'});
  await expect(fis.getByRole('img',{name:'Pembe içecek'})).toBeVisible();
  await expect(fis.locator('img[src*=suslemeler]')).toHaveCount(0);
  await page.locator('[data-meyve=yabanmersini]').tap();
  await page.locator('[data-meyve=muz]').tap();
  await page.locator('.sm-kapak').tap();
  await tut(page,page.locator('.sm-motor-tusu'),2100);
  const gecmis=page.getByRole('list',{name:'Keşfettiğin karışımlar'});
  await expect(gecmis.getByRole('listitem',{name:/Açık yeşil/})).toBeVisible();
  await page.getByRole('button',{name:'Başka iki meyve dene'}).tap();
  await page.reload();
  await expect(gecmis.getByRole('listitem')).toHaveCount(1);
  await expect(page.locator('.sm-meyve:enabled')).toHaveCount(4);
  await page.locator('[data-meyve=sut]').tap();await page.locator('[data-meyve=cilek]').tap();
  await page.locator('.sm-kapak').tap();await tut(page,page.locator('.sm-motor-tusu'),2100);
  await expect(gecmis.getByRole('listitem')).toHaveCount(2);
  await tut(page,page.locator('.sm-dok-tusu'),3500);
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  await expect(page.locator(':is(.tepsi-yuva,.salonda-servis-et) .sm-bardak')).toHaveAttribute('data-meyveler','sut,cilek');
});

test('Çocuk raftaki iki gerçek karışımı karşılaştırır, seçtiği renk ve kıvam servis edilir',async({page},info)=>{
  await page.setViewportSize(info.project.name==='ipad'?{width:844,height:390}:{width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=turuncu-mola');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  const tezgah=page.locator('.sm-tezgah');
  for(const [a,b] of [['muz','cilek'],['cilek','yabanmersini']]){
    await page.locator('[data-meyve="'+a+'"]').tap();await page.locator('[data-meyve="'+b+'"]').tap();
    await page.locator('.sm-kapak').tap();
    if(a==='muz'){
      await tut(page,page.locator('.sm-motor-tusu'),1100);
      await page.getByRole('button',{name:'Bu kıvamda dökmeye geç'}).tap();
      await page.getByRole('button',{name:'Başka iki meyve dene'}).tap();
      await page.reload();
    }else await tut(page,page.locator('.sm-motor-tusu'),2150);
  }
  const raf=page.locator('.sm-numune-rafi');
  await expect(raf.getByRole('button')).toHaveCount(2);
  const turuncu=raf.getByRole('button',{name:/Turuncu, meyve parçalı/});
  const mor=raf.getByRole('button',{name:/Koyu mor, pürüzsüz/});
  for(const secim of [turuncu,mor]){
    await expect(secim).toBeInViewport();
    const kutu=await secim.boundingBox();expect(kutu!.width).toBeGreaterThanOrEqual(44);
    expect(kutu!.height).toBeGreaterThanOrEqual(44);
  }
  await turuncu.tap();await page.reload();
  await expect(tezgah).toHaveAttribute('data-evre','dok');
  await expect(turuncu).toHaveAttribute('aria-pressed','true');
  await expect(mor).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.sm-servis-bardagi .sm-bardak-parcalari')).toHaveCount(1);
  await page.screenshot({path:'output/sef/icecek-tadim-rafi-'+info.project.name+'.png'});
  await tut(page,page.locator('.sm-dok-tusu'),3500);
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  const kayit=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['turuncu-mola']);
  expect(kayit.icecekPuani).toBe(3);
  expect(kayit.smoothie.meyveler).toEqual(['muz','cilek']);
  expect(kayit.smoothie.karisim).toBeLessThan(80);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
});

test('Lokum’un turuncu fişi meyveyi söylemez; yanlış renk ve iki doğru karışım servis edilebilir',async({page},info)=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=turuncu-mola');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  const fis=page.getByRole('group',{name:'Müşterinin istediği renk'});
  await expect(fis.getByRole('img',{name:'Turuncu içecek'})).toBeVisible();
  await expect(fis.locator('img[src*=portakal-dilimi],img[src*=suslemeler]')).toHaveCount(0);
  await expect(page.locator('.sm-meyve:enabled')).toHaveCount(4);
  for(const b of await page.locator('.sm-meyve').all()){
    const r=(await b.boundingBox())!;
    expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);
  }
  const ses=await Promise.all([
    'smoothie/renk-turuncu',
    ...['','-buzlu','-buzsuz'].map(ek=>'musteri-sesi/lokum-restoran-turuncu-mola'+ek),
  ].map(async yol=>{
    const res=await page.request.get('/assets/sef/'+yol+'.mp3');
    return res.ok()&&(await res.body()).length>8000;
  }));
  expect(ses).toEqual([true,true,true,true]);
  for(const [a,b,puan] of [['yabanmersini','yabanmersini',1],['muz','cilek',3],['cilek','muz',3]] as const){
    await page.locator('[data-meyve="'+a+'"]').tap();
    if(a==='yabanmersini')await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('.sm-dilimler .sm-parca')).toHaveCount(1);
    await page.locator('[data-meyve="'+b+'"]').tap();
    await page.locator('.sm-kapak').tap();await tut(page,page.locator('.sm-motor-tusu'),2200);
    await tut(page,page.locator('.sm-dok-tusu'),3500);
    await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
    if(a==='muz')await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator(':is(.tepsi-yuva,.salonda-servis-et) .sm-bardak')).toHaveAttribute('data-meyveler',a+','+b);
    const kayit=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['turuncu-mola']);
    expect(kayit.icecekPuani).toBe(puan);
    if(puan===3){
      if(a==='muz')expect(kayit.smoothie.denemeler).toHaveLength(2);
      await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
      await expect(page.getByRole('button',{name:'3 jeton kazanıldı'})).toBeVisible();
      if(a==='muz'){
        await page.goto('./sef/?giris=tepsiler&siparis=turuncu-mola');
        await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
      }
    }else{
      await page.getByRole('button',{name:'Meyve karışımı yeniden hazırla'}).tap();
      if(a==='yabanmersini')await page.screenshot({path:info.outputPath('turuncu-tezgah.png')});
    }
  }
});

test('İkinci meyveyi değiştirmek ve kısa dokunuşlarla yarım bardak doldurmak',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?giris=tepsiler&siparis=turuncu-mola');
  await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('[data-meyve=cilek]').tap();
  await expect(page.locator('.sm-meyve .sm-renk-damgasi')).toHaveCount(0);
  await expect(page.locator('.sm-meyve img')).toHaveCount(4);
  await page.locator('[data-meyve=yabanmersini]').tap();
  await expect(page.locator('.sm-karsilastir')).toHaveAttribute('data-eslesti','false');
  await page.locator('[data-meyve=muz]').tap();
  await expect(page.locator('.sm-karsilastir')).toHaveAttribute('data-eslesti','true');
  await page.locator('.sm-kapak').tap();
  for(let i=0;i<4;i++)await page.locator('.sm-motor-tusu').tap();
  for(let i=0;i<2;i++)await page.locator('.sm-dok-tusu').tap();
  await page.getByRole('button',{name:'Bardağı servise al'}).tap();
  await expect(page.locator('.sm-servis-bardagi')).toHaveAttribute('data-miktar','2');
  await page.reload();
  await expect(page.locator('.sm-servis-bardagi')).toHaveAttribute('data-miktar','2');
});
