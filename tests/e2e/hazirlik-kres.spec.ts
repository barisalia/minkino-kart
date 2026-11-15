import {test,expect,type Page} from '@playwright/test';

const nesne=(p:Page,id:string)=>p.locator('[data-kres="'+id+'"]');
const sec=(p:Page,id:string)=>nesne(p,id).tap();
const kayit=(p:Page)=>p.evaluate(()=>JSON.parse(localStorage.getItem('minkino-hazirlik-kres-v1')!));
async function surukle(p:Page,kaynak:string,hedef:string){
  const a=(await nesne(p,kaynak).boundingBox())!,b=(await nesne(p,hedef).boundingBox())!;
  await p.mouse.move(a.x+a.width/2,a.y+a.height/2);await p.mouse.down();
  await p.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await p.mouse.up();
}
test.beforeEach(async({page})=>{await page.goto('/hazirlik/?ders=kres');await expect(nesne(page,'saga')).toBeVisible()});
test('Kendi dansı aynı hareketi iki kez kabul eder, düzenlenir ve gösteri puanını korur',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);
    s.sahne='gosteri';s.renk='sari';
    Object.assign(s.kres.gosteri,{program:'dort',dal:'dans',bolum:'sonuc',kararlar:[true,true],isaretler:Array(8).fill(true),sonuc:{dal:'dans',puan:10}});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();
  const b=(name:string)=>page.getByRole('button',{name,exact:true});
  const oyna=b('Dansımı birlikte oynat');
  await b('Kendi dansını hazırla').tap();
  await expect(oyna).toBeDisabled();
  for(const ad of ['Patiler yukarı','Alkış','Alkış','Eğilerek selam'])await b(ad).tap();
  await expect(b('Yana adım')).toBeDisabled();
  await b('2. hareketi kaldır, Alkış').tap();await b('Yana adım').tap();
  const dizi=[2,0,3,1];
  expect((await kayit(page)).kres.gosteri.dansDizisi).toEqual(dizi);
  await page.reload();await expect(oyna).toBeEnabled();
  await oyna.tap();await expect(page.locator('.dans-yuvasi.sahnede')).toHaveCount(1);
  await page.setViewportSize({width:960,height:540});
  await expect(oyna).toBeEnabled();
  await oyna.tap();
  const yuvalar=page.locator('.dans-yuvasi');
  for(let i=0;i<4;i++)await expect(yuvalar.nth(i)).toHaveClass(/sahnede/);
  await expect(oyna).toBeEnabled();
  await oyna.tap();await b('Gösteri sonucuna dön').tap();
  await expect(b('Kendi dansını hazırla')).toBeVisible();
  expect((await kayit(page)).kres.gosteri).toMatchObject({sonuc:{dal:'dans',puan:10},dansDizisi:dizi});
});
for(const puan of [0,10])test('Evde kendi dansı '+puan+' puanla annesine gösterilir ve albümde kalır',async({page})=>{
  const dizi=[2,0,0,3];
  await page.evaluate(({dizi,puan})=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';s.renk='sari';
    Object.assign(s.kres,{biten:['gosteri'],evKarsilama:'ani'});
    Object.assign(s.kres.gosteri,{program:'dort',dal:'dans',bolum:'sonuc',kararlar:Array(2).fill(!!puan),isaretler:Array(8).fill(!!puan),
      dansDizisi:dizi,sonuc:{dal:'dans',puan},sonAni:{dal:'dans',puan,renk:'sari',program:'dort',dokunuslar:[]}});
    localStorage[key]=JSON.stringify(s);
  },{puan,dizi});
  await page.reload();await sec(page,'hatirla-gosteri');
  const serit=nesne(page,'ev-kendi-dansin');
  await expect(serit.locator('i')).toHaveCount(4);
  await serit.tap();await expect(serit.locator('i').first()).toHaveClass(/sirada/);
  await page.evaluate(()=>window.dispatchEvent(new Event('hazirlik-mola')));
  await expect(serit).not.toHaveAttribute('aria-busy','true');
  if(puan===10)await page.setViewportSize({width:980,height:580});
  await serit.tap();
  for(let i=0;i<4;i++)await expect(serit.locator('i').nth(i)).toHaveClass(/sirada/);
  await expect(nesne(page,'anne')).toHaveClass(/eslik-ediyor/);
  await expect(serit).not.toHaveAttribute('aria-busy','true');
  await sec(page,'ev-dans-panoya');await sec(page,'ev-pano');
  expect((await kayit(page)).kres.evAlbumu.at(-1)).toMatchObject({puan,ani:{renk:'sari',dansDizisi:dizi}});
  await page.reload();await sec(page,'ev-hatira');
  await page.getByRole('button',{name:'Kendi dansını albümde oynat'}).tap();
  const iz=page.locator('.ev-ani-iz');
  for(const el of [2,0,3])await expect(iz).toHaveAttribute('data-el',String(el));
  await expect(page.locator('.ev-ani-perdesi')).toHaveAttribute('data-oynuyor','bitti');
  await page.getByRole('button',{name:'Evdeki panoya dön'}).tap();
  await expect(page.locator('.ev-ani-salonu')).toHaveCount(0);
});
for(const dal of ['sarki','dans'] as const)test('Yıl sonu: '+dal+' kesintisiz on vuruş ve eve dönüş',async({page})=>{
  test.slow();const hata:string[]=[];page.on('pageerror',e=>hata.push(e.message));
  const b=(ad:string)=>page.getByRole('button',{name:ad,exact:true}),oyun=page.locator('.gosteri-oyunu'),ped=page.locator('.gosteri-ped');
  const sonuc=dal==='sarki'?7:6;
  await sec(page,'sola');await b('Perdeyi aç').tap();
  await expect(oyun).toHaveAttribute('data-sahne','mino');await b('Arkadaşını alkışla').tap();
  await expect(oyun.getByRole('img',{name:'Mino, 10 üzerinden 4 puan'})).toBeVisible({timeout:23500});
  await expect(oyun).toHaveAttribute('data-sahne','bulut',{timeout:8500});
  await expect(oyun.getByRole('img',{name:'Bulut, 10 üzerinden 6 puan'})).toBeVisible({timeout:20000});
  await expect(oyun.locator('.gosteri-on-sira')).toHaveCount(0);
  await expect(oyun).toHaveAttribute('data-sahne','sec',{timeout:18500});
  await expect(oyun.locator('.gosteri-on-sira')).toHaveCount(0);
  await b(dal==='sarki'?'Cebimdeki Tohum şiirini oku':'Birlikte dans et').tap();
  await expect(oyun).toHaveAttribute('data-sahne','final');
  await expect(ped).toHaveCount(dal==='dans'?5:4);
  await expect(b('Final gösterisini başlat')).toHaveCount(0);
  for(let i=0;i<10;i++){
    await expect(oyun).toHaveAttribute('data-sahne','final');
    await page.waitForFunction(()=>{
      const r=document.querySelector<HTMLElement>('.gosteri-ray');
      return document.querySelector('.siir-tuslari .sira-sende')||r?.firstElementChild&&Number(r.style.getPropertyValue('--inis'))>.67;
    },undefined,{timeout:11000});
    const n=dal==='sarki'?await ped.evaluateAll(els=>els.findIndex(e=>e.classList.contains('sira-sende'))):await page.locator('.gosteri-dusen').evaluate(e=>Number(e.className.match(/iz-(\d)/)![1]));
    if(dal==='dans'&&i===3)await ped.nth((n+1)%4).tap();
    const kacir=dal==='sarki'?[4,7,9]:[4,6,8];
    if(!kacir.includes(i)){
      await ped.nth(n).tap();
    }
    await expect.poll(async()=>(await kayit(page)).kres.gosteri.isaretler.length,{timeout:6500}).toBe(i+1);
    if(i===2){await page.reload();await b('Perdeyi aç').tap()}
    if(i===0&&dal==='sarki'){
      await sec(page,'dinle');await expect(b('Final gösterisini başlat')).toBeVisible();
      expect((await kayit(page)).kres.gosteri.isaretler).toHaveLength(1);await b('Final gösterisini başlat').tap();
    }
  }
  await expect(oyun).toHaveAttribute('data-kapanis','birlikte',{timeout:10000});
  await expect(page.locator('.gosteri-pedler')).toHaveAttribute('inert','');
  await expect(oyun).toHaveAttribute('data-sahne','selam',{timeout:9500});
  await expect(oyun.locator('.kino-sol img')).toHaveCount(dal==='sarki'?4:6);
  await expect(oyun).toHaveAttribute('data-sahne','sonuc',{timeout:6500});
  expect((await kayit(page)).kres.gosteri.sonuc).toEqual({dal,puan:sonuc,...(dal==='sarki'?{siir:true}:{})});
  expect((await kayit(page)).kres.bugununKupasi?.puan??null).toBe(sonuc>=7?sonuc:null);
  await expect(oyun.locator('.gosteri-kazanan')).toHaveCount(sonuc>=7?1:0);
  await b('Yıldızların nereden geldiğini gör').tap();
  expect(await page.locator('.gosteri-yildiz-sirasi .dolu').count()).toBe(sonuc);
  expect(await page.locator('.gosteri-yildiz-sirasi .bos').count()).toBe(10-sonuc);
  await b('Son beş vuruş').tap();await b('Gösteri sonucuna dön').tap();
  await b('Gösteriden eve dön').tap();await sec(page,'yolda-kino');await expect(nesne(page,'eve-gir')).toHaveClass(/zil-hazir/,{timeout:11000});await sec(page,'eve-gir');
  await expect(nesne(page,'anne-esikte')).toBeVisible();await nesne(page,'ev-aski').waitFor();await surukle(page,'ev-aski','ev-kanca');
  await sec(page,'hatirla-gosteri');
  if(sonuc===7)await expect(b('Annenle kazanan şiiri yeniden oku')).toBeVisible();
  if(sonuc<7){await page.reload();await sec(page,'ev-goster-1');expect((await kayit(page)).kres.evHareketi).toBe(1)}
  await expect(nesne(page,'ev-hatira')).toBeVisible();
  const ilk=await nesne(page,'ev-hatira').innerHTML();await surukle(page,'ev-hatira','ev-pano');
  await page.reload();await expect(nesne(page,'yeni-gun')).toBeVisible();expect(await nesne(page,'ev-hatira').innerHTML()).toBe(ilk);
  const album=(await kayit(page)).kres.evAlbumu;expect(album).toMatchObject([{gun:1,dal,puan:sonuc,ani:{dal,puan:sonuc}}]);
  expect(album[0].ani.dokunuslar.filter((e:{sira:number})=>e.sira===6)).toHaveLength(dal==='dans'?0:1);
  if(dal==='dans')expect(album[0].ani.dokunuslar.filter((e:{sira:number})=>e.sira===3)).toHaveLength(2);
  await sec(page,'ev-hatira');const an=page.getByRole('dialog',{name:'Kino ile Zıpzıp’ın o günkü gösterisinden'});
  await expect(an.locator('.ev-ani-perdesi')).toHaveAttribute('data-oynuyor','evet');await b('Evdeki panoya dön').tap();
  await expect(an).toHaveCount(0);expect((await kayit(page)).kres.gosteri.sonuc).toEqual({dal,puan:sonuc,...(dal==='sarki'?{siir:true}:{})});
  if(dal==='sarki'){
    await sec(page,'anne');await expect(nesne(page,'ev-sarilma')).toBeVisible();
    await page.reload();await expect(nesne(page,'ev-sarilma')).toBeVisible();
  }
  await sec(page,'yeni-gun');expect((await kayit(page)).kres.evAlbumu).toEqual(album);
  expect(hata).toEqual([]);
});
test('Gösterisiz eve dönüş: pati zili, gerçekten hazırlanan beslenme ve kupasız kapanış',async({page})=>{
  await page.addInitScript(()=>{
    const key='minkino-hazirlik-kres-v1';
    if(sessionStorage['normal-ev-basladi'])return;
    const s=JSON.parse(localStorage[key]);s.sahne='ev-yolu';s.renk='yesil';s.meyve='armut';s.kalanPaketlendi=true;s.ic=['peynir','domates'];s.kres.eveYol=1;s.kres.biten=['beslenme'];localStorage[key]=JSON.stringify(s);sessionStorage['normal-ev-basladi']='1';
  });
  await page.reload();await expect(nesne(page,'yolda-kino')).toHaveClass(/kapida/);
  await expect(nesne(page,'yolda-kino').locator('.ev-yol-uzan img').first()).toHaveAttribute('src',/kino-zil-yesil-0/);
  await sec(page,'ev-zili');await expect(nesne(page,'cocuk-zili')).toHaveClass(/basildi/);
  await expect(nesne(page,'anne-esikte')).toBeVisible();await sec(page,'ev-aski');await sec(page,'hatirla-beslenme');
  await expect(nesne(page,'ev-hatira').locator('.ev-beslenme-hatirasi svg')).toHaveCount(2);
  await sec(page,'ev-hatira');await expect(nesne(page,'ev-kupa-rafi')).toHaveCount(0);await sec(page,'anne');await expect(nesne(page,'ev-sarilma')).toBeVisible();
  expect((await kayit(page)).kres.gosteri.sonuc).toBeNull();
});
test('Kulise yürürken telefon araya girerse çocuk daha perde açılmadan yanlış odaya geçmez',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await sec(page,'sola');const yuru=page.locator('.kres-yuruyor');
  await expect(yuru).toBeVisible();
  await expect(yuru.locator('img').first()).toHaveAttribute('src',/kino-sola-yuru-yesil-0/);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:true}})));
  await expect(page.locator('.gosteri-oyunu')).toHaveCount(0);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:false}})));
  await expect(nesne(page,'sola')).toBeVisible();expect((await kayit(page)).sahne).toBe('anasinifi');
  await sec(page,'sola');await expect(page.getByRole('button',{name:'Perdeyi aç'})).toBeVisible({timeout:12000});
});
test('Evde anlatılan tabaklar ve çocuğun sergi yazısı gerçekten o günküyle aynı',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';
    Object.assign(s.kres,{biten:['paylas','harf'],evKarsilama:'ani',tabaklar:[[0,0],[3,3,3]],servis:[true,true]});
    s.ders.sergi.limon={meyve:'limon',asama:'bitti',yardim:false,izler:{'2':[[[33,45],[61,51],[48,85]]],L:[[[61,69],[63,145],[123,145]]],A:[]}};
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();
  const tabak=nesne(page,'hatirla-paylas').locator('.ev-sofra-hatirasi>i');
  await expect(nesne(page,'hatirla-paylas')).toHaveAccessibleName('Arkadaşlarına hazırladığın tabakları annene anlat');
  await expect(nesne(page,'hatirla-harf')).toHaveAccessibleName('Kendi yazdığın etiketi annene anlat');
  expect(await tabak.nth(0).locator('b img[src*="meyve-0"]').count()).toBe(2);
  expect(await tabak.nth(1).locator('b img[src*="meyve-3"]').count()).toBe(3);
  await sec(page,'hatirla-harf');const kart=nesne(page,'ev-hatira').locator('.sergi-etiket');
  await expect(kart.locator('img')).toHaveAttribute('src',/meyve-5/);
  await expect(kart.locator('svg').last().locator('path')).toHaveAttribute('d','M61 69 L63 145 L123 145');
});
test('Evde konuşan Kino iki patisiyle kupayı tutar; annesi aynı anda konuşmaz',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';s.renk='sari';
    Object.assign(s.kres,{evKarsilama:'pano',anlatilan:'gosteri',biten:['gosteri']});
    Object.assign(s.kres.gosteri,{program:'dort',bolum:'sonuc',dal:'dans',kararlar:[true,true],isaretler:Array(8).fill(true),sonuc:{dal:'dans',puan:10}});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();await sec(page,'eve-kino');
  const k=nesne(page,'eve-kino'),a=nesne(page,'anne');
  await expect(k.locator('.ev-kino-ses')).toBeVisible();
  await expect(k.locator('.ev-kino-ses img').first()).toHaveAttribute('src',/kino-sohbet-sari-kupa-0/);
  const acik=()=>page.evaluate(()=>{
    const el=document.querySelector('#sahne'),sec=el?.getAttribute('data-ev-agiz');
    if(el?.getAttribute('data-konusan')!=='kino'||!sec||+sec<1||+sec>4)return false;
    const kareler=(id:string)=>[...document.querySelectorAll('[data-kres='+id+'] .ev-sohbet img')].map((im,i)=>getComputedStyle(im).visibility==='visible'?i:-1).filter(i=>i>=0);
    return kareler('eve-kino').join(',')===sec&&kareler('anne').join(',')==='0';
  });
  await expect.poll(acik,{intervals:[40,50,80],timeout:5000}).toBe(true);
  await a.tap();await expect(k.locator('.ev-kino-ses')).toBeHidden();
  await sec(page,'ev-birlikte-goster');await expect(nesne(page,'ev-kupa-rafi')).toBeVisible();
  await sec(page,'ev-goster-1');await expect(nesne(page,'anne').locator('img[src*="anne-adim-0"]')).toHaveCount(1);
  await expect(nesne(page,'eve-kino').locator('img[src*="kino-kupa-"]')).toHaveCount(0);
  await sec(page,'ev-hatira');expect((await kayit(page)).kres.gosteri.sonuc).toEqual({dal:'dans',puan:10});
});
test('Sınıftan erkenden dönen çocuk boş anı seçimine yönlendirilmeden sarılır',async({page})=>{
  await page.evaluate(()=>{const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';localStorage[key]=JSON.stringify(s)});
  await page.reload();await sec(page,'ev-aski');await expect(nesne(page,'ev-sarilma')).toBeVisible();await expect(nesne(page,'ev-son-kupa')).toHaveCount(0);
  await expect(nesne(page,'ev-son-hatira')).toHaveCount(0);await sec(page,'yeni-gun');expect((await kayit(page)).kres.gun).toBe(2);
});
test('İlk gösteride kazanılan kupa ikinci denemenin altı puanına yazılmadan eve gelir',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';s.renk='sari';
    Object.assign(s.kres,{biten:['gosteri'],bugununKupasi:{dal:'sarki',renk:'sari',puan:10,dokunuslar:[{sira:0,el:0,fark:0}]}});
    Object.assign(s.kres.gosteri,{program:'dort',bolum:'sonuc',dal:'dans',kararlar:[true,false],isaretler:[true,true,true,true,true,false,false,false],sonuc:{dal:'dans',puan:6},sonAni:{dal:'dans',renk:'sari',puan:6,dokunuslar:[]}});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();const b=(ad:string)=>page.getByRole('button',{name:ad,exact:true});
  await b('Bugün daha önce kazandığın kupayı dinle').tap();await expect(page.locator('.gosteri-kazanan')).toHaveCount(0);
  await b('Gösteriden eve dön').tap();await expect(nesne(page,'yolda-kino').locator('img').first()).toHaveAttribute('src',/kino-kupayla-sari-0/);
  await sec(page,'yolda-kino');await sec(page,'ev-zili');await sec(page,'ev-aski');
  await expect(nesne(page,'ev-kupa-rafi')).toBeVisible();await sec(page,'hatirla-gosteri');
  await sec(page,'ev-goster-0');await sec(page,'ev-hatira');await sec(page,'anne');
  await expect(nesne(page,'ev-son-kupa')).toBeVisible();await expect(nesne(page,'ev-son-hatira')).toBeVisible();
  await sec(page,'ev-son-kupa');await sec(page,'ev-son-hatira');
  const oynayan=page.getByRole('dialog',{name:'Kino ile Zıpzıp’ın o günkü gösterisinden'});
  await expect(oynayan.locator('.ev-ani-perdesi')).toHaveAttribute('data-oynuyor','evet');
  await page.getByRole('button',{name:'Evdeki panoya dön',exact:true}).tap();
  await expect(nesne(page,'ev-sarilma')).toBeVisible();
  expect((await kayit(page)).kres.evAlbumu[0]).toMatchObject({dal:'dans',puan:6,ani:{dal:'dans',puan:6}});
  await sec(page,'yeni-gun');expect((await kayit(page)).kres).toMatchObject({evKupasi:true,bugununKupasi:null});
});
test('Şarkı albümü sözlü vokali çalar ve eski la örneklerini çağırmaz',async({page})=>{
  await page.addInitScript(()=>{
    const w=window as Window & {notalar:number[]};w.notalar=[];
    const bas=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args){
      if(this.buffer)w.notalar.push(this.buffer.duration);
      bas.apply(this,args);
    };
  });
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';
    const ani={dal:'sarki',puan:8,program:'dort',renk:'yesil',sesliYanki:true,dokunuslar:[{sira:7,el:0,fark:0}]};
    Object.assign(s.kres,{gun:2,evKarsilama:'kapi',evAlbumu:[{gun:1,dal:'sarki',puan:8,ani}]});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();await sec(page,'ev-aile-albumu');
  await page.getByRole('button',{name:'1. gün, şarkı gösterisi, 8 puan'}).tap();
  await expect(page.locator('.ev-ani-perdesi')).toHaveAttribute('data-oynuyor','bitti',{timeout:18000});
  const notalar=await page.evaluate(()=>(window as Window & {notalar:number[]}).notalar);
  expect(notalar.some(s=>Math.abs(s-40)<.02)).toBe(true);
  expect(notalar.some(s=>Math.abs(s-.53)<.006)).toBe(false);
});
test('Şarkı provasında çocuk Zıpzıp’ı tekrar dinler ve Kino kendi sırasında cevap verir',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';s.renk='yesil';
    Object.assign(s.kres.gosteri,{program:'dort',dal:'sarki',bolum:'prova',kararlar:[],prova:1});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();
  const tekrar=page.getByRole('button',{name:'Ritim sesini yeniden dinle'});
  const balon=page.locator('.gosteri-ses-balonu');
  await tekrar.tap();await expect(balon).toHaveAttribute('data-kim','zip');await expect(balon).toBeVisible();
  await page.getByRole('button',{name:'Güneş',exact:true}).tap();
  expect((await kayit(page)).kres.gosteri.prova).toBe(1);
  await page.getByRole('button',{name:'Ay',exact:true}).tap();
  await expect(balon).toHaveAttribute('data-kim','kino');
  await expect.poll(async()=>(await kayit(page)).kres.gosteri.prova).toBe(2);
  await page.reload();await tekrar.tap();await expect(page.locator('.gosteri-ray .iz-2')).toBeAttached();
  expect((await kayit(page)).kres.gosteri.isaretler).toEqual([]);
});
test('Ses mikseri olmayan cihazda da prova kayıtlı çalgı sesiyle oynanır',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});
    Object.defineProperty(window,'webkitAudioContext',{value:undefined,configurable:true});
    const w=window as Window & {heceler:string[]};w.heceler=[];
    const bas=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){
      const ses=this;
      if(ses.src.includes('.wav'))ses.addEventListener('playing',()=>w.heceler.push(new URL(ses.src).pathname),{once:true});
      return bas.call(ses);
    };
  });
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
    Object.assign(s.kres.gosteri,{program:'dort',dal:'sarki',bolum:'prova',kararlar:[true],prova:2});
    localStorage[key]=JSON.stringify(s);
  });
  await page.reload();await page.getByRole('button',{name:'Ritim sesini yeniden dinle'}).tap();
  const sesler=()=>page.evaluate(()=>(window as Window & {heceler:string[]}).heceler.join(' '));
  await expect.poll(sesler).toContain('/calgi-4-79');
  await page.getByRole('button',{name:'Yıldız',exact:true}).tap();
  await expect.poll(sesler).toContain('/calgi-4-79');
  expect((await kayit(page)).kres.gosteri.prova).toBe(3);
});
test('Sahneye klavyeyle katılım: odak, puansız prova ve yardım molası',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
    Object.assign(s.kres.gosteri,{bolum:'isik',dal:'sarki'});localStorage[key]=JSON.stringify(s);
  });
  await page.reload();const b=(ad:string)=>page.getByRole('button',{name:ad,exact:true});
  await expect(b('Sahne ışığını aç')).toHaveCount(0);await b('Güneş').focus();
  await expect(b('Güneş')).toBeFocused();
  await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');
  expect((await kayit(page)).kres.gosteri.prova).toBe(0);
  await page.keyboard.press('ArrowLeft');await page.keyboard.press('Enter');
  for(const i of [1,2,3]){await expect(page.locator('.gosteri-ray .iz-'+i)).toBeAttached();await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter')}
  await expect(b('Final gösterisini başlat')).toBeFocused();await page.keyboard.press('Enter');
  await expect(b('Güneş')).toBeFocused();
  await nesne(page,'dinle').press('Enter');
  await expect(b('Final gösterisini başlat')).toBeVisible();
  expect((await kayit(page)).kres.gosteri).toMatchObject({kararlar:[],prova:4,isaretler:[]});
  await b('Puanını koruyarak birlikte tekrar çalış').press('Enter');
  await expect(b('Güneş')).toBeFocused();for(const [i,ad] of ['Güneş','Ay','Yıldız','Zil'].entries()){await expect(page.locator('.gosteri-ray .iz-'+i)).toBeAttached();await b(ad).press('Enter')}
  await expect(b('Final gösterisini başlat')).toBeFocused();
  expect((await kayit(page)).kres.gosteri).toMatchObject({kararlar:[],prova:4,isaretler:[]});
});
test('Sahneye katılım: hiç vuruş alınmadığında kupa gelmez, annenin şarkı hatırası oynanır',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
    Object.assign(s.kres.gosteri,{bolum:'final',dal:'sarki',kararlar:[],prova:4,isaretler:Array(9).fill(false)});localStorage[key]=JSON.stringify(s);
  });
  await page.reload();const b=(ad:string)=>page.getByRole('button',{name:ad,exact:true});
  await b('Final gösterisini başlat').tap();
  await expect(page.locator('.gosteri-oyunu')).toHaveAttribute('data-sahne','sonuc',{timeout:15000});
  expect((await kayit(page)).kres.gosteri.sonuc).toEqual({dal:'sarki',puan:0});
  await expect(page.locator('.gosteri-kazanan')).toHaveCount(0);
  await b('Gösteriden eve dön').tap();await sec(page,'yolda-kino');await sec(page,'ev-zili');
  await sec(page,'ev-aski');await sec(page,'hatirla-gosteri');await b('Güneş notasını söyle').tap();
  await expect(nesne(page,'ev-hatira')).toBeVisible();expect((await kayit(page)).kres.evHareketi).toBe(0);
});
test('Şarkıda bekleyen parmak yalnızca gördüğü notayı çalar',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
    Object.assign(s.kres.gosteri,{program:'konser',bolum:'final',dal:'sarki',kararlar:[],prova:4,isaretler:[true,true,true,true,true]});localStorage[key]=JSON.stringify(s);
  });
  await page.reload();await page.getByRole('button',{name:'Final gösterisini başlat'}).tap();
  await expect(page.locator('.gosteri-dusen.iz-1')).toBeVisible();
  const r=(await page.getByRole('button',{name:'Ay',exact:true}).boundingBox())!;
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
  await expect.poll(async()=>(await kayit(page)).kres.gosteri.isaretler.length).toBe(6);
  await expect.poll(async()=>(await kayit(page)).kres.gosteri.isaretler.length,{timeout:9000}).toBe(7);await page.mouse.up();
  const g=(await kayit(page)).kres.gosteri;
  expect(g.isaretler.slice(5)).toEqual([true,false]);expect(g.dokunuslar).toHaveLength(1);
});
test('Görüntü durduğunda görünmeyen nota puan kaybettirmez',async({page})=>{
  await page.addInitScript(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);
    s.sahne='gosteri';Object.assign(s.kres.gosteri,{bolum:'final',dal:'dans',kararlar:[true,true],prova:2,isaretler:[true,true,true,true,true]});
    localStorage[key]=JSON.stringify(s);
    const asil=window.requestAnimationFrame.bind(window);let acik=true;
    window.addEventListener('test-ekran-beklet',()=>{acik=false});
    window.addEventListener('test-ekrani-getir',()=>{acik=true});
    window.requestAnimationFrame=(fn)=>{const ciz:FrameRequestCallback=t=>{if(acik)fn(t);else asil(ciz)};return asil(ciz)};
  });
  await page.reload();const bas=page.getByRole('button',{name:'Final gösterisini başlat'});
  await bas.tap();await expect(page.locator('.gosteri-dusen')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new Event('test-ekran-beklet')));
  await page.waitForTimeout(3200);
  await page.evaluate(()=>window.dispatchEvent(new Event('test-ekrani-getir')));
  await expect(bas).toBeVisible();expect((await kayit(page)).kres.gosteri.isaretler).toEqual(Array(5).fill(true));
});
test('Aile albümünde farklı günün kıyafeti, gerçek vuruşu ve eski sesli kart birbirine karışmaz',async({page})=>{
  await page.addInitScript(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='veda';s.renk='sari';
    Object.assign(s.kres,{gun:4,evKarsilama:'kapi',evAlbumu:[
      {gun:1,dal:'sarki',puan:7},
      {gun:2,dal:'dans',puan:8,ani:{dal:'dans',puan:8,renk:'yesil',program:'yanki',dokunuslar:[{sira:6,el:1,fark:.15}]}},
      {gun:3,dal:'sarki',puan:10,ani:{dal:'sarki',puan:10,renk:'sari',dokunuslar:[{sira:7,el:1,fark:.25}]}},
    ]});localStorage[key]=JSON.stringify(s);
  });
  await page.reload();const b=(ad:string)=>page.getByRole('button',{name:ad,exact:true});
  await b('Aile albümünü aç').tap();const kitap=page.getByRole('dialog',{name:'Önceki gösterilerin aile albümü'});
  const eski=b('1. gün, şarkı gösterisi, 7 puan');await eski.tap();await expect(page.locator('.ev-ani-salonu')).toHaveCount(0);
  const iki=b('2. gün, dans gösterisi, 8 puan');
  await expect(iki.locator('.ev-sahne-fotografi img')).toHaveCount(3);
  await iki.tap();await expect(page.locator('.ev-ani-perdesi')).toHaveAttribute('data-oynuyor','evet');
  await expect(page.locator('.ev-ani-iz')).toHaveAttribute('data-el','1',{timeout:10000});
  await page.evaluate(()=>window.dispatchEvent(new Event('minkino:geri',{cancelable:true})));
  await expect(kitap).toBeVisible();await expect(iki).toBeFocused();
  await b('3. gün, şarkı gösterisi, 10 puan').tap();await expect(page.locator('.ev-ani-salonu')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:true}})));
  await expect(page.locator('dialog[open]')).toHaveCount(0);expect((await kayit(page)).kres.evAlbumu).toHaveLength(3);
});
test('Telefon kesintisi gösteriyi dondurur; geri tuşu önce evdeki anıyı kapatır',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);s.sahne='gosteri';
    Object.assign(s.kres.gosteri,{bolum:'final',dal:'dans',kararlar:[true,true],prova:2,isaretler:[true,true,true,true,true,true,true]});localStorage[key]=JSON.stringify(s);
  });
  await page.reload();const b=page.getByRole('button',{name:'Final gösterisini başlat'});
  await b.tap();await expect(page.locator('.gosteri-dusen')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:true}})));
  await page.waitForTimeout(4100);expect((await kayit(page)).kres.gosteri.isaretler).toHaveLength(7);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:false}})));
  await expect(b).toBeVisible();
  // Seed the archived day in the next page, after WebKit has delivered
  // visibilitychange and the previous show has saved its genuine progress.
  await page.addInitScript(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage[key]);
    Object.assign(s,{sahne:'veda'});Object.assign(s.kres,{biten:['gosteri'],anlatilan:'gosteri',evKarsilama:'kapanis'});
    Object.assign(s.kres.gosteri,{program:'dort',bolum:'sonuc',isaretler:Array(8).fill(true),sonuc:{dal:'dans',puan:10},sonAni:{dal:'dans',puan:10,renk:'yesil',dokunuslar:[]}});
    localStorage[key]=JSON.stringify(s);
  });await page.reload();await sec(page,'ev-hatira');await expect(page.locator('.ev-ani-salonu')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new Event('minkino:geri',{cancelable:true})));
  await expect(page.locator('.ev-ani-salonu')).toHaveCount(0);await expect(nesne(page,'ev-kupa-rafi')).toBeVisible();expect((await kayit(page)).sahne).toBe('veda');
});
for(const tarif of ['salata','sis'] as const)test('Meyve mutfağı: '+tarif+' yıkama, kesit, dizme ve ikram',async({page})=>{
  const secili=()=>page.locator('.meyve-elde');
  async function nokta(x:number,y:number){
    return secili().evaluate((g,[x,y])=>{const p=new DOMPoint(x,y).matrixTransform((g as SVGGElement).getScreenCTM()!);return [p.x,p.y] as [number,number]},[x,y]);
  }
  const mut=()=>kayit(page).then(s=>s.kres.meyveMutfagi);
  await sec(page,'meyve');await page.locator('[data-tarif='+tarif+']').tap();
  for(let i=0;i<3;i++){
    await page.mouse.move(...await nokta(78,80));await page.mouse.down();
    for(const x of [47,108,52,104,65])await page.mouse.move(...await nokta(x,84),{steps:6});
    await page.mouse.up();expect((await mut()).temiz[i]).toBe(3);
  }
  for(let i=0;i<3;i++){
    await page.mouse.click(...await nokta(80,85));expect((await mut()).kesitler[i]).toBeNull();
    const [a,z]=i===1?[[82,4],[78,157]]:i===2?[[153,108],[4,63]]:[[5,82],[157,94]];
    await page.mouse.move(...await nokta(a[0],a[1]));await page.mouse.down();
    await page.mouse.move(...await nokta(z[0],z[1]),{steps:12});await page.mouse.up();
    expect((await mut()).kesitler[i]).toHaveLength(4);
    if(i===1)await page.reload();
    for(const j of [1,0])await page.locator('[data-yarim="'+j+'"]').press('Enter');
  }
  const alt=page.locator('.meyve-raf button');
  await alt.last().dragTo(page.locator('.meyve-calisma'));
  expect((await mut()).dizilen).toHaveLength(1);
  await page.getByRole('button',{name:'Son meyve parçasını geri al'}).tap();
  for(let n=0;n<6;n++)await alt.last().tap();
  if(tarif==='salata'){
    await page.mouse.move(...await nokta(132,85));await page.mouse.down();
    for(let j=1;j<=40;j++){
      if(await page.locator('.meyve-mutfagi').getAttribute('data-asama')!=='karistir')break;
      const t=j*Math.PI/10;await page.mouse.move(...await nokta(80+52*Math.cos(t),85+52*Math.sin(t)),{steps:2});
    }await page.mouse.up();
  }
  await page.locator('.meyve-servis').dragTo(page.locator('.meyve-musteri'));
  const d=await mut();expect(d.hatira.tarif).toBe(tarif);expect(d.hatira.dizilen).toEqual(d.dizilen);
  expect(d.sunuldu).toBe(true);await page.reload();await page.getByRole('button',{name:'Yeni tarif hazırla'}).tap();
  await expect(nesne(page,'cicekci')).toBeVisible();
});
test('Boyama defterinde ayrı taslaklar, sınırda duran fırça ve ileri alma',async({page})=>{
  await sec(page,'boya');await sec(page,'kendi-kagidim');
  const b=(name:string)=>page.getByRole('button',{name,exact:true});
  const kagit=page.getByLabel('Serbest resim kâğıdı');
  const renk=(x:number,y:number)=>kagit.evaluate((el,[x,y])=>Array.from((el as HTMLCanvasElement).getContext('2d')!.getImageData(x,y,1,1).data).slice(0,3),[x,y]);
  const yer=async(x:number,y:number)=>{const r=(await kagit.boundingBox())!;return [r.x+r.width*x/600,r.y+r.height*y/400] as const};
  await b('Yelkenli sayfası').tap();await b('Mavi boya').tap();
  await page.touchscreen.tap(...await yer(35,30));await expect(b('Son çizgiyi geri al')).toBeDisabled();
  await page.touchscreen.tap(...await yer(250,210));expect(await renk(250,210)).toEqual([78,158,224]);
  await page.touchscreen.tap(...await yer(250,210));expect((await kayit(page)).kres.serbestResim.hamleler).toHaveLength(1);
  await b('Son çizgiyi geri al').tap();expect(await renk(250,210)).toEqual([255,250,240]);
  await b('Geri aldığın çizgiyi getir').tap();expect(await renk(250,210)).toEqual([78,158,224]);
  await b('Mercan boya').tap();await b('Renkli fırça').tap();
  await page.mouse.move(...await yer(250,210));await page.mouse.down();await page.mouse.move(...await yer(345,210),{steps:15});await page.mouse.up();
  expect(await renk(260,210)).toEqual([244,99,80]);expect(await renk(345,210)).toEqual([255,250,240]);
  await b('Kelebek sayfası').tap();await page.touchscreen.tap(...await yer(172,142));await page.reload();
  expect(await renk(172,142)).toEqual([244,99,80]);
  await b('Limon bahçesi sayfası').tap();await b('Sarı boya').tap();await page.touchscreen.tap(...await yer(198,125));
  expect(await renk(198,125)).toEqual([255,198,67]);
  await b('Yelkenli sayfası').tap();expect(await renk(260,210)).toEqual([244,99,80]);
  await b('Kendi resmini panoya as').tap();await expect(nesne(page,'pano').locator('i img')).toBeVisible();
  await sec(page,'boya');await sec(page,'kendi-kagidim');await b('Kelebek sayfası').tap();expect(await renk(172,142)).toEqual([244,99,80]);
});
test('Turuncu çiçeğin yan yaprağında ilk iz gerçekten görünür ve geri alınır',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage.getItem(key)!);
    s.sahne='boyahane';Object.assign(s.kres,{boyalar:['sari','kirmizi'],donus:12,fircaElde:true});localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();
  const svg=nesne(page,'kagit-resim').locator('svg');
  const p=await svg.evaluate(el=>{const p=new DOMPoint(77,33).matrixTransform((el as SVGSVGElement).getScreenCTM()!);return {x:p.x,y:p.y}});
  async function piksel(){
    const png=(await page.screenshot({scale:'css'})).toString('base64');
    return page.evaluate(async({png,p})=>{
      const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();
      const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d')!;
      ctx.drawImage(img,Math.round(p.x),Math.round(p.y),1,1,0,0,1,1);
      return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);
    },{png,p});
  }
  const kagitRengi=await piksel();await page.touchscreen.tap(p.x,p.y);
  await expect(nesne(page,'izi-sil')).toBeVisible();expect(await piksel()).toEqual([246,155,70]);
  await sec(page,'izi-sil');expect(await piksel()).toEqual(kagitRengi);
  await expect(nesne(page,'panoya')).toBeHidden();
});
test('Çiçekçi dört siparişi tek tek sayar, yanlış kartı düzeltir ve buketi teslim eder',async({page})=>{
  await sec(page,'meyve');await sec(page,'cicekci');
  const b=(name:string)=>page.getByRole('button',{name,exact:true});
  const masa=page.locator('.cicekci-masa'),bagla=b('Buketi kurdeleyle bağla');
  const cicek=page.locator('.buket-vazo').first();
  for(let tur=0;tur<4;tur++){
    const adet=tur+2,kim=tur%2?'Zıpzıp':'Mino';
    if(!tur){
      await cicek.dragTo(page.locator('.buket-tepsi'));await bagla.tap();
      await expect(masa).toHaveAttribute('data-asama','topla');
      await cicek.tap();await cicek.tap();await bagla.tap();
      expect((await kayit(page)).kres.buket.cicekler.length).toBe(3);
      await page.locator('.buket-geri').last().tap();await page.reload();
    }else for(let j=0;j<adet;j++)await page.locator('.buket-vazo').nth(j%3).tap();
    await bagla.tap();await expect(b(kim+' siparişini tekrarlasın')).toBeHidden();
    if(!tur){await b('1 çiçek kartı').tap();await expect(masa).toHaveAttribute('data-asama','say')}
    await b(adet+' çiçek kartı').tap();await b('Buketi '+kim+' için ver').tap();
    await expect(masa).toHaveAttribute('data-asama','hediye');
    expect((await kayit(page)).kres.buket.teslim).toBe(tur+1);
    if(tur<3)await b('Sonraki arkadaşın buketini hazırla').tap();
  }
  await b('Sınıfa dön').tap();expect((await kayit(page)).kres.biten).toContain('cicekci');
});
test('Oda beklerse bir köşe gösterilir, dönüşte başka bir köşe önerilir',async({page})=>{
  const ipucu=page.locator('.kres-kesif-patisi');
  await expect(ipucu).toBeHidden();
  await expect(ipucu).toHaveAttribute('data-hedef','boya',{timeout:7500});
  const hedef=await ipucu.locator('svg').evaluate(el=>{
    const r=el.getBoundingClientRect();
    return document.elementFromPoint(r.left+r.width*.2,r.top+r.height*.21)?.closest('[data-kres]')?.getAttribute('data-kres');
  });
  expect(hedef).toBe('boya');await sec(page,'boya');await sec(page,'geri');
  await expect(ipucu).toHaveAttribute('data-hedef','meyve',{timeout:7500});
  await sec(page,'saga');await expect(nesne(page,'sola')).toBeVisible();
  await expect(ipucu).toHaveAttribute('data-hedef','blok',{timeout:7500});
  await sec(page,'muzik');await expect(ipucu).toHaveCount(0);
});
test('Boş dokunuş yakındaki eşyayı gösterir, parmak kayması etkinliği kendiliğinden açmaz',async({page})=>{
  const alan=page.locator('.kres-sahne'),ipucu=page.locator('.kres-kesif-patisi');
  const bos=await alan.evaluate(el=>{
    const k=el.querySelector('[data-kres="pano"]')!.getBoundingClientRect();
    const x=k.x+k.width/2;
    // Mobil tarayıcı kenardaki dokunuşu yakındaki düğmeye aktarabilir.
    for(let y=k.y-32;y>0;y-=2)if(document.elementFromPoint(x,y)===el)return {x,y};
    throw Error('Pano yanında boş nokta bulunamadı.');
  });
  await page.touchscreen.tap(bos.x,bos.y);
  await expect(ipucu).toHaveAttribute('data-hedef','pano');
  await page.waitForFunction(()=>document.querySelector('#sahne')?.getAttribute('data-konusan')==='ceren');
  await page.mouse.move(bos.x,bos.y);await page.mouse.down();await page.mouse.move(bos.x-25,bos.y);await page.mouse.up();
  await expect(ipucu).toBeHidden();await expect(nesne(page,'saga')).toBeVisible();
});
test('Boş kâğıda çizilir, içi boyanır, taslak yenilemede kalır ve panoya asılır',async({page})=>{
  await sec(page,'boya');await sec(page,'kendi-kagidim');
  const tus=(name:string)=>page.getByRole('button',{name,exact:true});
  const kagit=page.getByLabel('Serbest resim kâğıdı');
  await tus('Siyah çizgi kalemi').tap();
  const r=(await kagit.boundingBox())!;
  const xy=(t:number)=>[r.x+r.width*(.5+.22*Math.cos(t)),r.y+r.height*(.5+.27*Math.sin(t))] as const;
  await page.mouse.move(...xy(0));await page.mouse.down();
  for(let i=1;i<=36;i++)await page.mouse.move(...xy(i*Math.PI/18));
  await page.mouse.up();await tus('Mavi boya').tap();await tus('Kapalı şeklin içini boya').tap();
  const doldur=()=>page.touchscreen.tap(r.x+r.width*.5,r.y+r.height*.5);
  await doldur();
  const merkez=()=>kagit.evaluate(el=>Array.from((el as HTMLCanvasElement).getContext('2d')!.getImageData(300,200,1,1).data).slice(0,3));
  expect(await merkez()).toEqual([78,158,224]);
  await tus('Son çizgiyi geri al').tap();expect(await merkez()).not.toEqual([78,158,224]);
  await doldur();await page.reload();await expect(kagit).toBeVisible();expect(await merkez()).toEqual([78,158,224]);
  await tus('Kendi resmini panoya as').tap();await expect(nesne(page,'pano').locator('i img')).toBeVisible();
  expect((await kayit(page)).kres.biten).toContain('serbest-resim');
});
test('Oyun odasında beste yazılır, bir vuruş değiştirilir, sus çalınır ve beste saklanır',async({page})=>{
  await sec(page,'saga');await sec(page,'muzik');
  const tus=(name:string)=>page.getByRole('button',{name,exact:true});
  await tus('Kendi bandonu kur').tap();await tus('Davul ekle').tap();await tus('Bir vuruş sessizlik ekle').tap();await tus('Marakas ekle').tap();
  await tus('1. vuruşu değiştir').tap();await tus('Tef ekle').tap();await tus('Orta tempo, değiştirmek için dokun').tap();
  await tus('Besteni çal').tap();await expect(tus('Çalmayı durdur')).toBeVisible();
  await expect(tus('Besteni çal')).toBeVisible();
  await tus('Besteni sakla ve dön').tap();expect((await kayit(page)).kres.biten).toContain('beste');
  await page.reload();await tus('Kendi bandonu kur').tap();expect((await kayit(page)).kres.beste).toEqual({vuruslar:[2,-1,1],tempo:2});
  await tus('Bir vuruş çıkar').tap();expect((await kayit(page)).kres.beste.vuruslar).toEqual([2,-1]);
});
test('Ders içindeki bandoda da beste defteri açılır ve masaya dönülür',async({page})=>{
  await page.goto('/hazirlik/?ders=bando');
  await page.getByRole('button',{name:'Kendi bandonu kur'}).tap();
  await page.getByRole('button',{name:'Flüt ekle'}).tap();
  await page.getByRole('button',{name:'Besteni sakla ve dön'}).tap();
  await expect(page.locator('.bando-calgi')).toHaveCount(6);
});
test('Tahta oyuncağa yanlış şekil oturmaz, aynı tekerlek iki tarafa da takılır, araba rafta kalır',async({page})=>{
  await sec(page,'saga');await sec(page,'blok');
  await surukle(page,'sekil-0','yuva-1');expect((await kayit(page)).kres.kalip).toHaveLength(0);
  await surukle(page,'sekil-0','yuva-0');await sec(page,'sekil-2');await sec(page,'yuva-2');await page.reload();
  await expect(nesne(page,'sekil-2')).toHaveCount(0);await sec(page,'sekil-1');await sec(page,'yuva-1');
  await sec(page,'kaporta-1');await expect(nesne(page,'kaporta-1')).toHaveAttribute('aria-pressed','true');
  await surukle(page,'tak-2','araba-yuva-3');await surukle(page,'tak-2','araba-yuva-2');
  await surukle(page,'tak-0','araba-yuva-0');await sec(page,'tak-1');await sec(page,'araba-yuva-1');
  await sec(page,'sur');await expect(page.locator('.yol-tabla')).toHaveClass(/kol-bekliyor/);await expect(nesne(page,'park')).toBeHidden();
  await page.reload();await expect(page.locator('.yol-tabla')).toHaveClass(/kol-bekliyor/);
  await sec(page,'kopru-kolu');await expect(page.locator('.yol-kanat')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await sec(page,'sur');await expect(nesne(page,'park')).toBeVisible();await sec(page,'park');
  await page.reload();await expect(nesne(page,'raftaki-araba').locator('[fill="#69b6df"]')).toHaveCount(1);
  expect((await kayit(page)).kres.biten).toContain('blok');
  await sec(page,'raftaki-araba');expect((await kayit(page)).kres.surusKonumu).toBe(0);
  await expect(nesne(page,'sur').locator('[fill="#69b6df"]')).toHaveCount(1);
});
test('Oyuncak araba itildiği yerde kalır, geri gider, tekerleri döner ve yeniden sürülür',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage.getItem(key)!);
    s.sahne='blok';Object.assign(s.kres,{kalip:[0,1,2],araba:[0,1,2,3],arabaSuruldu:false});localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();
  const araba=nesne(page,'sur'),teker=araba.locator('.oto-teker').first();await expect(araba).toBeVisible();
  const ilk=await teker.getAttribute('transform');
  async function it(pay:number){
    const r=(await araba.boundingBox())!,tab=(await page.locator('.yol-tabla').boundingBox())!;
    await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
    await page.mouse.move(r.x+r.width/2+tab.width*pay,r.y+r.height/2,{steps:14});await page.mouse.up();
  }
  await it(.12);const gitti=(await kayit(page)).kres.surusKonumu;expect(gitti).toBeGreaterThan(0);
  expect(await teker.getAttribute('transform')).not.toBe(ilk);await page.reload();expect((await kayit(page)).kres.surusKonumu).toBe(gitti);
  await it(-.06);expect((await kayit(page)).kres.surusKonumu).toBeLessThan(gitti);
  await it(.70);await expect(page.locator('.yol-tabla')).toHaveClass(/kol-bekliyor/);
  const kol=(await nesne(page,'kopru-kolu').boundingBox())!,x=kol.x+kol.width/2,y=kol.y+kol.height/2;
  const kanat=page.locator('.yol-kanat'),ilkAci=await kanat.evaluate(e=>getComputedStyle(e).transform);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+8,{steps:4});
  expect(await kanat.evaluate(e=>getComputedStyle(e).transform)).not.toBe(ilkAci);await page.mouse.up();
  expect((await kayit(page)).kres.kopruIndi).toBe(false);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+kol.height*.7,{steps:12});await page.mouse.up();
  await expect(page.locator('.yol-kanat')).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  await it(.65);await expect(nesne(page,'park')).toBeVisible();await sec(page,'yeni-tur');await expect(nesne(page,'park')).toBeHidden();
  expect((await kayit(page)).kres).toMatchObject({kopruIndi:false,surusKonumu:0,arabaSuruldu:false});
});
test('Önceki sürümde park edilmiş araba açılır ve seçilen gövde rengi ertesi güne kalır',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage.getItem(key)!);
    Object.assign(s.kres,{araba:[0,1,2,3],kalip:[0,1,2],arabaRafta:true,arabaSuruldu:true});
    delete s.kres.arabaRengi;delete s.kres.surusKonumu;delete s.kres.kopruIndi;
    s.sahne='blok';localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();await expect(nesne(page,'park')).toBeVisible();
  expect((await kayit(page)).kres).toMatchObject({arabaRengi:0,surusKonumu:1000,kopruIndi:true});
  await sec(page,'park');await expect(nesne(page,'raftaki-araba')).toBeVisible();
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage.getItem(key)!);
    s.kres.arabaRengi=2;s.kres.biten=['blok','bahce'];s.sahne='veda';localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();await sec(page,'ev-aski');await expect(nesne(page,'hatirla-blok').locator('[fill="#a4c966"]')).toHaveCount(1);
  await sec(page,'hatirla-blok');await sec(page,'ev-hatira');
  await sec(page,'yeni-gun');expect((await kayit(page)).kres).toMatchObject({gun:2,arabaRafta:true,arabaRengi:2,surusKonumu:0});
});
test('Boya çocuk karıştırınca değişir, seçtiği renk panoya asılır',async({page})=>{
  await sec(page,'boya');await sec(page,'tup-mavi');await sec(page,'tup-sari');await page.reload();
  const kas=nesne(page,'kase'),r=(await kas.boundingBox())!;
  const nokta=(t:number)=>[r.x+r.width*(.5+.26*Math.cos(t)),r.y+r.height*(.44+.18*Math.sin(t))];
  const [x,y]=nokta(0);await page.mouse.move(x,y);await page.mouse.down();
  for(let i=1;i<=85;i++){const [u,v]=nokta(i*Math.PI/24);await page.mouse.move(u,v)}
  await page.mouse.up();await expect(nesne(page,'firca')).toBeVisible();
  await surukle(page,'firca','kagit-resim');
  await expect(nesne(page,'panoya')).toBeHidden();
  const iz=await nesne(page,'kagit-resim').locator('svg').evaluate(el=>{
    const svg=el as SVGSVGElement;
    return [[53,53],[68,38],[75,37]].map(([x,y])=>{const n=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM()!);return [n.x,n.y]});
  });
  await page.mouse.move(iz[0][0],iz[0][1]);await page.mouse.down();await page.mouse.move(iz[1][0],iz[1][1],{steps:10});await page.mouse.move(iz[2][0],iz[2][1],{steps:6});await page.mouse.up();
  await sec(page,'panoya');await expect(nesne(page,'pano').locator('i svg')).toHaveCount(1);
  expect((await kayit(page)).kres.baskilar).toEqual(['yesil']);expect((await kayit(page)).kres.boyaliResimler.yesil[0].length).toBeGreaterThan(2);
});
test('Katlanan kayık su masasında yüzer, taş dibe iner ve tekrar deney yapılır',async({page})=>{
  await sec(page,'saga');await sec(page,'kagit');await surukle(page,'katla','uc');await page.reload();
  await sec(page,'katla');await sec(page,'katla');await sec(page,'suya');
  await surukle(page,'deney-kayik','legen');await sec(page,'suda-kayik');await sec(page,'deney-tas');
  await expect(nesne(page,'suda-tas')).toHaveClass(/kres-dip/);await expect(nesne(page,'suda-kayik')).toHaveClass(/kres-yuzer/);
  expect((await kayit(page)).kres.biten).toEqual(['kagit','su-masasi']);
  await page.reload();await sec(page,'cikar');await expect(nesne(page,'deney-kayik')).toBeVisible();
  await sec(page,'geri');await sec(page,'sola');await sec(page,'zil');await expect(page.locator('#sahne')).toHaveAttribute('data-sahne','toplan');
});
test('Pencere bahçesi sonraki gerçek günde filizlenir',async({page})=>{
  await sec(page,'saksi');await sec(page,'tohum');await sec(page,'sula');
  const once=(await kayit(page)).kres.ekimTarihi;
  await sec(page,'pencere');const dun=await nesne(page,'saksi').innerHTML();
  const yarin=new Date(once+'T12:00:00');yarin.setDate(yarin.getDate()+1);
  await page.clock.setFixedTime(yarin);await page.reload();
  expect(await nesne(page,'saksi').innerHTML()).not.toBe(dun);
  await sec(page,'saksi');await sec(page,'sula');expect((await kayit(page)).kres.ekimTarihi).toBe(once);
});

test('Yemekte çocuğun koyduğu fazla veya farklı meyve geri alınabilir; teslimi arkadaşı bekler',async({page})=>{
  await sec(page,'mino');
  await surukle(page,'sepet-2','tabak-mino');await sec(page,'arkadas-mino');
  expect((await kayit(page)).kres.servis[0]).toBe(false);
  await sec(page,'lokma-0-0');
  for(let i=0;i<3;i++){await sec(page,'sepet-0');await sec(page,'tabak-mino')}
  await sec(page,'arkadas-mino');expect((await kayit(page)).kres.tabaklar[0]).toEqual([0,0,0]);
  await sec(page,'lokma-0-2');await sec(page,'arkadas-mino');await page.reload();
  expect((await kayit(page)).kres.servis).toEqual([true,false]);
  for(let i=0;i<3;i++)await surukle(page,'sepet-2','tabak-zipzip');
  await sec(page,'arkadas-zipzip');await sec(page,'sinifa');
  expect((await kayit(page)).kres.biten).toEqual(['paylas']);
});
test('Kino sabunlamadan kurulanmaz, patileri ovalayınca durulama açılır',async({page})=>{
  await sec(page,'lavabo');await sec(page,'havlu');expect((await kayit(page)).kres.elYikama).toBe(0);
  await sec(page,'musluk');await sec(page,'patiler');await sec(page,'sabun');
  await sec(page,'musluk');expect((await kayit(page)).kres.elYikama).toBe(3);
  const r=(await nesne(page,'patiler').boundingBox())!,x=r.x+.5*r.width,y=r.y+.4*r.height;
  await page.mouse.move(x,y);await page.mouse.down();
  for(let i=0;i<6;i++)await page.mouse.move(x+((i%2?1:-1)*.32*r.width),y,{steps:6});
  await page.mouse.up();expect((await kayit(page)).kres.ovma).toBe(8);
  await page.reload();await sec(page,'musluk');await surukle(page,'patiler','akan-su');await sec(page,'havlu');
  expect((await kayit(page)).kres.biten).toContain('lavabo');
  await expect(nesne(page,'patiler').locator('.kres-kopukler,.kres-islak')).toHaveCount(0);
  await sec(page,'done');await expect(nesne(page,'hali')).toBeVisible();
});

test('Sabah çemberinde sözü arkadaşına verir, iki arkadaşını dinleyince kendi köşesini seçer',async({page})=>{
  await sec(page,'hali');await expect(nesne(page,'oturan-kino').locator('img')).toHaveCount(4);
  await sec(page,'soz-tasi');await sec(page,'oturan-kino');
  expect((await kayit(page)).kres.konusanlar).toEqual([]);
  await surukle(page,'soz-tasi','oturan-zipzip');await page.reload();
  expect((await kayit(page)).kres.konusanlar).toEqual(['zipzip']);
  await sec(page,'soz-tasi');await sec(page,'oturan-mino');await surukle(page,'soz-tasi','oturan-kino');
  await sec(page,'git-su-masasi');await expect(nesne(page,'legen')).toBeVisible();
  expect((await kayit(page)).kres.biten).toContain('cember');
});
test('Toplanmada yanlış kutu eşyayı kabul etmez, sınıfta oynanan köşelerin eşyaları kalır',async({page})=>{
  await page.evaluate(()=>{
    const key='minkino-hazirlik-kres-v1',s=JSON.parse(localStorage.getItem(key)!);
    s.kres.biten=['boyahane','muzik'];localStorage.setItem(key,JSON.stringify(s));
  });
  await page.reload();await sec(page,'zil');
  await surukle(page,'duzen-firca','kutu-muzik');expect((await kayit(page)).kres.duzenBitti).toEqual([]);
  await sec(page,'duzen-firca');await sec(page,'kutu-atolye');await page.reload();
  await expect(nesne(page,'duzen-firca')).toHaveCount(0);await sec(page,'geri');
  await sec(page,'saksi');await sec(page,'tohum');await sec(page,'sula');await sec(page,'pencere');await sec(page,'zil');
  expect((await kayit(page)).kres.duzenPlani).toHaveLength(4);
  await surukle(page,'duzen-boya','kutu-atolye');await surukle(page,'duzen-marakas','kutu-muzik');
  await sec(page,'duzen-davul');await sec(page,'kutu-muzik');await sec(page,'vedaya');
  await sec(page,'yolda-kino');await expect(nesne(page,'eve-gir')).toHaveClass(/zil-hazir/);await sec(page,'eve-gir');
  await sec(page,'ev-aski');await sec(page,'hatirla-bahce');await sec(page,'ev-hatira');await sec(page,'yeni-gun');const k=(await kayit(page)).kres;
  expect(k.ekimTarihi).toBeTruthy();expect(k.duzenPlani).toEqual([]);expect(k.oncekiGun.biten).toContain('boyahane');
});
test('Üç sayfalık öyküyü çocuk dinler, son ile nedeni karıştırırsa kaldığı yer korunur',async({page})=>{
  await sec(page,'saga');await sec(page,'oyku');await sec(page,'cevir');await sec(page,'cevir');await sec(page,'cevir');
  await sec(page,'oyku-karti-2');expect((await kayit(page)).kres.oykuDizi).toEqual([]);
  await sec(page,'oyku-karti-0');await page.reload();await sec(page,'oyku-karti-1');await sec(page,'oyku-karti-2');
  await sec(page,'kitabi-kaldir');expect((await kayit(page)).kres.biten).toContain('oyku');
});
