import {expect,test,type Locator,type Page} from '@playwright/test';
import {bardakUyuyor,bosSmoothie,meyveler,renkAdi,smoothieOku,smoothiePuani,type Meyve} from '../../sef/src/smoothie/tarif';
import {tostKalitesi,yeniTost} from '../../sef/src/tost-tarifi';

const boy={width:667,height:375};
test.beforeEach(async({page})=>{
  await page.setViewportSize(boy);
  await page.routeWebSocket(url=>url.hostname==='localhost',s=>s.connectToServer().onMessage(m=>{
    if(typeof m!=='string'||!m.includes('full-reload'))s.send(m);
  }));
});
async function ac(page:Page,id:string){
  await page.goto('./sef/?test=1&giris=tepsiler&siparis='+id,{waitUntil:'domcontentloaded'});
  await expect(page.locator('.tepsi-yuva').first()).toBeVisible();
}
async function karistir(page:Page,secim:[Meyve,Meyve],parcali:boolean){
  for(const m of secim)await page.locator('[data-meyve='+m+']').tap();
  await page.locator('.sm-kapak').tap();
  // The keyboard path is stepped, giving the same deterministic pour on a busy renderer.
  const bas=async(el:Locator,n:number)=>{
    for(let i=0;i<n;i++)await el.evaluate(b=>(b as HTMLButtonElement).click());
  };
  await bas(page.locator('.sm-motor-tusu'),parcali?2:4);
  if(parcali)await page.getByRole('button',{name:'Bu kıvamda dökmeye geç'}).tap();
  await expect(page.locator('.sm-tezgah')).toHaveAttribute('data-evre','dok');
  await page.reload({waitUntil:'domcontentloaded'});
  await bas(page.locator('.sm-dok-tusu'),2);
  await page.getByRole('button',{name:'Bardağı servise al'}).tap();
  await expect(page.locator('.sm-servis-bardagi .sm-bardak-parcalari')).toHaveCount(parcali?1:0);
}
const masa=(page:Page,id:string)=>page.evaluate(id=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar[id],id);

test('Lokum kırmızı, fazla dolu ve pürüzsüz bardağı alır; şef aynı siparişi düzeltebilir',async({page})=>{
  await ac(page,'sade-simit');await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await karistir(page,['cilek','cilek'],false);
  await page.getByRole('button',{name:'Biraz daha doldur'}).tap();
  for(let i=0;i<2;i++)await page.locator('.sm-dok-tusu').evaluate(b=>(b as HTMLButtonElement).click());
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  expect(await masa(page,'sade-simit')).toMatchObject({icecekPuani:1,smoothie:{meyveler:['cilek','cilek'],bardak:100}});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Meyve karışımı yeniden hazırla'}).tap();
  await karistir(page,['cilek','muz'],true);
  await page.getByRole('button',{name:'Biraz daha doldur'}).tap();
  for(let i=0;i<2;i++)await page.locator('.sm-dok-tusu').evaluate(b=>(b as HTMLButtonElement).click());
  const geriDok=page.getByRole('button',{name:'Bardaktan sürahiye biraz geri dök'});
  for(let i=0;i<3;i++)await geriDok.tap();
  await page.reload({waitUntil:'domcontentloaded'});
  if(process.env.SEF_SECIM_KARE)await page.screenshot({path:process.env.SEF_SECIM_KARE+'/yarim-bardak.png'});
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  expect(await masa(page,'sade-simit')).toMatchObject({icecekPuani:3,smoothie:{karisim:50,bardak:55}});
  await expect(page.locator('.tepsi-yuva .sm-bardak-parcalari')).toHaveCount(1);
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı',exact:false})).toBeVisible();
});

test('Mino iki peynir ister; bir dilimi geri alıp yanlış tostla iki jeton kazanılabilir',async({page})=>{
  await ac(page,'cift-kasar');await page.locator('.tepsi-yuva[data-parca=tost]').tap();
  await page.getByRole('button',{name:'Tost ekmeğini aç'}).tap();
  const ekmek=page.locator('.tost-acik-ekmek'),r=(await ekmek.boundingBox())!;
  for(const [tur,x] of [['kasar',.3],['domates',.52],['kasar',.75]] as const){
    await page.locator('.tost-mal[data-tur='+tur+']').tap();
    await ekmek.tap({position:{x:r.width*x,y:r.height*.55}});
  }
  await expect(page.locator('.tost-fis [data-tamam=true]')).toHaveCount(3);
  const kat=page.locator('.tost-acik-ekmek .tost-kat').last(),k=(await kat.boundingBox())!;
  const iade=page.locator('.tost-iade');
  await page.mouse.move(k.x+k.width/2,k.y+k.height/2);await page.mouse.down();
  await page.mouse.move(k.x+k.width/2-16,k.y+k.height/2+4,{steps:5});
  await expect(iade).toBeVisible();
  const hedef=(await iade.boundingBox())!;
  await page.mouse.move(hedef.x+hedef.width/2,hedef.y+hedef.height/2,{steps:10});await page.mouse.up();
  await expect(page.locator('.tost-acik-ekmek .tost-kat')).toHaveCount(2);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.tost-fis [data-tamam=true]')).toHaveCount(2);
  await page.getByRole('button',{name:'Üst ekmeği kapat'}).tap();
  await page.getByRole('button',{name:'Tost presine götür'}).tap();
  await page.getByRole('button',{name:'Tost presini kapat'}).tap();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Çıtır',{timeout:9500});
  await page.getByRole('button',{name:'Tost presini aç'}).tap();
  await page.getByRole('button',{name:'Tostu tepsiye koy'}).tap();
  expect(await masa(page,'cift-kasar')).toMatchObject({tostPuani:2});
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'2 jeton kazanıldı',exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Sıcak Tost siparişi ile tabağı karşılaştır'}).tap();
  await page.getByRole('button',{name:'Sıcak Tost tekrar pişir'}).tap();
  await expect(page.locator('.tost-acik-ekmek .tost-kat')).toHaveCount(2);
  await page.getByRole('button',{name:'Kaşar peyniri',exact:true}).tap();
  await page.getByRole('button',{name:'Seçili malzemeyi ekmeğe koy'}).tap();
  await page.getByRole('button',{name:'Üst ekmeği kapat'}).tap();
  await page.getByRole('button',{name:'Tost presine götür'}).tap();
  await page.getByRole('button',{name:'Tost presini kapat'}).tap();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Çıtır',{timeout:9500});
  await page.getByRole('button',{name:'Tost presini aç'}).tap();
  await page.getByRole('button',{name:'Tostu tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'1 jeton kazanıldı',exact:false})).toBeVisible();
  expect(await masa(page,'cift-kasar')).toMatchObject({odenen:3,tostPuani:3});

});

test('Karışık simitte sıra korunsun; iki yarıyı ters sırada kaplamak da tam puan getirir',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await ac(page,'iki-renk-simit');
  await page.locator('.tepsi-yuva[data-parca=simit]').tap();
  const hamur=page.getByRole('button',{name:'Hamuru sağa sola yuvarla'});
  for(let i=0;i<4;i++)await hamur.press('ArrowRight');
  for(const yon of ['Sol','Sağ']){
    const uc=page.getByRole('button',{name:yon+' hamur ucunu birleştir'});
    for(let i=0;i<3;i++)await uc.press('ArrowUp');
  }
  await page.getByRole('button',{name:'Yarıları ayrı kapla'}).tap();
  await page.locator('.simit-kap[data-kaplama=hashas]').tap();
  await expect(page.locator('.simit-yarim-onizleme')).toBeVisible();
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:'Sağ yarıyı seçtiğin kaba batır'})).toBeVisible();
  await page.locator('.simit-kap[data-kaplama=susam]').tap();
  await expect(page.locator('.simit-batir .simit-buyuk')).toHaveAttribute('data-ters','true');
  const simit=(await page.locator('.simit-batir .simit-buyuk').boundingBox())!;
  const raf=(await page.locator('.simit-alt').boundingBox())!;
  expect(simit.y+simit.height).toBeLessThanOrEqual(raf.y);
  if(process.env.SEF_SECIM_KARE)await page.screenshot({path:process.env.SEF_SECIM_KARE+'/iki-yari.png'});
  await page.getByRole('button',{name:'Simidi fırına ver'}).tap();
  await expect(page.locator('.simit-firinda')).toHaveAttribute('data-ters','true');
  await expect(page.locator('.simit-saat img[data-ters=true]')).toHaveCount(3);
  await page.getByRole('button',{name:'Simidi pişirmeye başla'}).tap();
  await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Altın renginde');
  await page.getByRole('button',{name:'Simidi fırından çıkar'}).tap();await page.getByRole('button',{name:'Simidi tepsiye koy'}).tap();
  await expect(page.locator('.tepsi-yuva .simit-halkasi')).toHaveAttribute('data-ters','true');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  await expect(page.getByRole('button',{name:'3 jeton kazanıldı',exact:false})).toBeVisible();
});

test('Altı meyvede yirmi bir karışım; eş renkli tarifler aynı puanı kazanır, kıvam ve doluluk ayrıca ölçülür',()=>{
  expect(meyveler).toHaveLength(6);
  let ciftSayisi=0;
  const renkler=new Set<string>();
  for(const [i,a] of meyveler.entries())for(const b of meyveler.slice(i)){
    ciftSayisi++;expect(renkAdi([a,b])).toBeTruthy();renkler.add(renkAdi([a,b]));expect(renkAdi([a,b])).toBe(renkAdi([b,a]));
  }
  expect(ciftSayisi).toBe(21);expect(renkler.size).toBe(12);
  expect(renkAdi(['yabanmersini','yabanmersini'])).toBe(renkAdi(['kivi','yabanmersini']));
  const t={...bosSmoothie(),evre:'servis' as const,meyveler:['cilek','muz'] as Meyve[],bardak:50,karisim:55};
  const hedef={yarim:true,kivam:'taneli' as const};
  expect(smoothiePuani(t,['cilek','muz'],undefined,hedef)).toBe(3);
  for(const s of [{...t,bardak:90},{...t,karisim:100}]){
    expect(smoothiePuani(s,['cilek','muz'],undefined,hedef)).toBe(2);
  }
  expect(smoothiePuani({...t,meyveler:['seftali','cilek']},['cilek','muz'],undefined,hedef)).toBe(3);
  expect(smoothiePuani({...t,meyveler:['kivi','kivi']},['cilek','muz'],undefined,hedef)).toBe(1);
  expect(smoothieOku(t)).toMatchObject({karisim:55,bardak:50,evre:'servis'});
  expect([39,40,65,66].map(d=>bardakUyuyor(d,hedef))).toEqual([false,true,true,false]);
  const tost=yeniTost();tost.kizartma='citir';tost.katlar=[{tur:'kasar',x:30,y:50},{tur:'kasar',x:60,y:50},{tur:'domates',x:50,y:60}];
  expect(tostKalitesi(tost,'cift-kasar')).toBe(3);
  tost.katlar.push({...tost.katlar[0]});expect(tostKalitesi(tost,'cift-kasar')).toBe(2);
});

test('Dede’nin siparişindeki porsiyon, kıvam ve dilimler dar ekranda ayrı ayrı okunur',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await ac(page,'cift-domates');
  await page.evaluate(()=>{
    const kayit=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const t=kayit.tepsiler;
    t.restoran={sira:8,menuId:'cift-domates',sonYemek:'cift-domates',evre:'siparis'};
    t.restoranda=true;t.masalar['cift-domates'].smoothieBuzIstegi=true;
    localStorage.setItem('minkino-sef-v1',JSON.stringify(kayit));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const fis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(fis.getByRole('img',{name:'Pürüzsüz'})).toBeVisible();
  await expect(fis.getByRole('img',{name:'Açık yeşil yarım bardak içecek'})).toBeVisible();
  await expect(fis.locator('.tost-fis-icerik img')).toHaveCount(3);
  const raf=(await fis.boundingBox())!;
  for(const el of await fis.locator(':scope > .tepsi-gida,:scope > .sm-fis-dilimler,:scope > .tost-fis-icerik').all()){
    const r=(await el.boundingBox())!;expect(r.x).toBeGreaterThanOrEqual(raf.x-1);
    expect(r.x+r.width).toBeLessThanOrEqual(raf.x+raf.width+1);
  }
  if(process.env.SEF_SECIM_KARE)await page.screenshot({path:process.env.SEF_SECIM_KARE+'/dede-fis.png',animations:'disabled'});
  await fis.tap();await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await karistir(page,['kivi','muz'],true);
  await page.getByRole('button',{name:'Bardağa buz küpü ekle'}).tap();
  await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
  expect(await masa(page,'cift-domates')).toMatchObject({icecekPuani:2});
  await page.getByRole('button',{name:'Meyve suyu siparişi ile tabağı karşılaştır'}).tap();
  const dialog=page.getByRole('dialog');
  await expect(dialog.locator('.tepsi-tabak-ornek .sm-kivam-isareti')).toHaveAttribute('data-uyum','false');
  await expect(dialog.locator('.tepsi-tabak-ornek .sm-bardak')).toHaveAttribute('data-miktar-uyumu','true');
  const bardakEni=(await dialog.locator('.tepsi-tabak-ornek .sm-bardak').boundingBox())!.width;
  expect((await dialog.locator('.sm-yuzen-buz').boundingBox())!.width).toBeLessThan(bardakEni*.5);
  for(const side of ['.tepsi-fis-ornek','.tepsi-tabak-ornek']){
    const kart=dialog.locator(side),cerceve=(await kart.boundingBox())!;
    for(const el of await kart.locator('.sm-bardak,.sm-bardak>img,.sm-buz-isareti,.sm-kivam-isareti,button').all()){
      const r=(await el.boundingBox())!;
      expect(r.y).toBeGreaterThanOrEqual(cerceve.y-1);expect(r.y+r.height).toBeLessThanOrEqual(cerceve.y+cerceve.height+1);
    }
  }
  if(process.env.SEF_SECIM_KARE)await page.screenshot({path:process.env.SEF_SECIM_KARE+'/dede-tadim.png',animations:'disabled'});
});

test('Parmak bırakılınca blender ve sürahi durur; yarım bardak ve iri parçalar korunur',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await ac(page,'sade-simit');await page.locator('.tepsi-yuva[data-parca=icecek]').tap();
  await page.locator('[data-meyve=muz]').tap();await page.locator('[data-meyve=cilek]').tap();
  await page.locator('.sm-kapak').tap();
  const cdp=await page.context().newCDPSession(page);
  async function tutuldu(tus:Locator,hedef:()=>Promise<void>){
    const r=(await tus.boundingBox())!;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
    try{await hedef();}finally{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  }
  try{
    await tutuldu(page.locator('.sm-motor-tusu'),async()=>{
      await page.waitForFunction(()=>!(document.querySelector('.sm-onay') as HTMLButtonElement)?.disabled,{},{polling:'raf'});
    });
    await page.getByRole('button',{name:'Bu kıvamda dökmeye geç'}).tap();
    await tutuldu(page.locator('.sm-dok-tusu'),async()=>{
      await page.waitForFunction(()=>{
        const c=document.querySelector<HTMLElement>('.sm-servis-bardagi');
        return c&&parseFloat(c.style.getPropertyValue('--sm-dolu'))>=41;
      },{},{polling:'raf'});
    });
    await page.getByRole('button',{name:'Bardağı servise al'}).tap();
    await page.getByRole('button',{name:'Meyve karışımını tepsiye koy'}).tap();
    expect(await masa(page,'sade-simit')).toMatchObject({icecekPuani:3});
    await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('.tepsi-yuva .sm-bardak-parcalari')).toBeVisible();
  }finally{await cdp.detach();}
});
