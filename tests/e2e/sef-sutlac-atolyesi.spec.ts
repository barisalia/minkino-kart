import {expect,test} from '@playwright/test';
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
});
test('Sütlaç yalnız son 240 jetonla açılır ve eski atölye kaydı korunur',async({page})=>{
  const kaydiHazirla=async(jeton:number)=>{
    await page.evaluate((jeton)=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      Object.assign(k.tepsiler,{tatliSeviye:4,jeton,pastane:{acik:true,taslaklar:{},vitrin:{kurabiye:[3]}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    },jeton);
    await page.reload();
  };
  await kaydiHazirla(239);
  const kart=page.locator('[data-kademe="5"]');
  await expect(kart).toBeDisabled();await expect(kart).toHaveAccessibleName(/1 jeton eksik/);
  await kaydiHazirla(240);await kart.click();
  await expect(page.locator('.tatli-cuzdan')).toHaveText('0');
  await page.reload();
  await expect(kart).toHaveAccessibleName(/Hazırla/);
  await expect(page.locator('[data-kademe="1"]')).toHaveAccessibleName(/rafta 1 tane/);
  await kart.click();
  await expect(page.locator('.tatli-dukkan')).toHaveCount(0);
});

for(const [desen,puan] of [['kalp',30],['cicek',20]] as const){
  test('Vitrinde Mino için '+desen+' seçimi, gerçek porsiyon, kayıt ve '+puan+' jeton',async({page})=>{
    const porsiyon={desen,toz:.87,kivam:'ipeksi',doluluk:.84};
    await page.evaluate(p=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      Object.assign(k.tepsiler,{tatliSeviye:5,jeton:8,restoranda:true,secili:'sutlac',ekran:'masa',
        gun:{no:2,ziyaret:0,kazanc:0,kapandi:false},restoran:{sira:4,menuId:'sutlac',evre:'mutfak'},
        masalar:{sutlac:{tabaklar:{},sunuldu:false,sutlacIstegi:'kalp'}},
        pastane:{acik:false,vitrin:{sutlac:[{puan:3,tabak:'beyaz',sutlac:{...p,desen:'yildiz'}},{puan:1,tabak:'beyaz',sutlac:p}]},taslaklar:{}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    },porsiyon);await page.reload();
    await page.getByRole('button',{name:'Tarçınlı Sütlaç vitrinden tepsiye al'}).click();
    const vitrin=page.getByRole('dialog',{name:'Vitrinden bir porsiyon seç'});
    await expect(vitrin.locator('.vitrin-istegi .sl-kase')).toHaveAttribute('data-desen','kalp');
    if(process.env.SEF_SUTLAC_KARE&&desen==='kalp')await page.screenshot({path:process.env.SEF_SUTLAC_KARE+'/sutlac-vitrin-740.png'});
    await vitrin.getByRole('button',{name:/2\. porsiyon/}).click();
    const kase=page.locator('.tepsi-yuva .sl-kase').first();await expect(kase).toHaveAttribute('data-desen',desen);
    const alan=await kase.boundingBox();expect(alan!.width).toBeGreaterThan(35);expect(alan!.height).toBeGreaterThan(28);
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
    await expect(page.getByRole('button',{name:new RegExp(puan+' jeton kazanıldı')})).toBeVisible();
    await page.reload();
    const durum=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
    expect(durum.jeton).toBe(8+puan);expect(durum.pastane.vitrin.sutlac).toHaveLength(1);
    expect(durum.masalar.sutlac.sutlacServisi).toEqual(porsiyon);
    expect(durum.pastane.pullar.sutlac).toBe(1);
    await page.getByRole('button',{name:'Yeni pul: Yıldız desenli sütlaç'}).click();
    await expect(page.locator('.pul-sayac')).toHaveText('1 / 3');
    await page.getByRole('button',{name:'Yıldız desenli sütlaç pulunu büyüt'}).click();
    await expect(page.locator('.pul-yakin')).toHaveAttribute('src',/pul-yildiz/);
    expect(durum.anilar.find((a:{menuId:string})=>a.menuId==='sutlac')?.masa.sutlacServisi).toEqual(porsiyon);
    if(desen==='cicek'){
      await page.getByRole('button',{name:'Pullara dön'}).click();
      await page.getByRole('button',{name:'Defteri kapat'}).click();
      await page.getByRole('button',{name:/Sütlaç siparişi ile tabağı karşılaştır/}).click();
      await page.getByRole('button',{name:'Tarçın desenini değiştir'}).click();
      await expect(page.locator('.sl-tezgah')).toHaveAttribute('data-adim','3');
      await page.getByRole('button',{name:'Kalp kalıbı'}).click();
      const elek=page.getByRole('button',{name:'Eleği kâsenin üzerinde sağa sola salla'});
      for(let i=0;i<8;i++)await elek.press('Enter');
      await page.getByRole('button',{name:'Kalıbı kaldır'}).click();
      await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).click();
      await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
      await expect(page.getByRole('button',{name:/10 jeton kazanıldı/})).toBeVisible();
      const duzeldi=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
      expect(duzeldi.jeton).toBe(38);expect(duzeldi.gun.ziyaret).toBe(1);
      expect(duzeldi.anilar).toHaveLength(1);expect(duzeldi.pastane.vitrin.sutlac).toHaveLength(1);
      expect(duzeldi.masalar.sutlac.sutlacServisi).toMatchObject({desen:'kalp',kivam:'ipeksi',doluluk:.84});
    }
  });
}
test('Sütlaç tarifinin dört resimli adımı son kademeye bağlıdır',async({page})=>{
  await page.getByRole('button',{name:'Resimli tarif kitabı'}).click();
  await page.getByRole('button',{name:'Pastane tariflerini aç'}).click();
  await page.getByRole('button',{name:'Tarçınlı Sütlaç tarifini incele'}).click();
  for(let i=1;i<=4;i++){
    const resim=page.locator('.kitap-resim>img[src*="tarif-kartlari/sutlac-'+i+'.webp"]');
    await expect(resim).toBeVisible();
    await resim.evaluate((el:HTMLImageElement)=>el.decode());
    expect(await resim.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(250);
    if(i<4)await page.getByRole('button',{name:'Sonraki adım'}).click();
  }
  await page.getByRole('button',{name:'Pastanede tarif kilidini gör'}).click();
  await expect(page.locator('[data-kademe="5"]')).toBeDisabled();
});
test('İlk sipariş yıldız, dönen müşteride uygun vitrin deseni tercih edilir',async({page})=>{
  const sonuc=await page.evaluate(async()=>{
    const mod=(yol:string)=>import(/* @vite-ignore */yol);
    const {restoranAc}=await mod('/sef/src/tepsi-masasi.ts');
    const {bosTepsiler}=await mod('/sef/src/tepsi-fisleri.ts');
    const {sutlacOrnegi}=await mod('/sef/src/sutlac-tarifi.ts');
    const t=bosTepsiler();t.tatliSeviye=5;
    t.pastane.vitrin.sutlac=[{tabak:'beyaz',puan:3,sutlac:sutlacOrnegi('cicek')}];
    const gel=()=>{restoranAc(t,true,()=>{},'sutlac');const m=t.masalar.sutlac;m.sunuldu=true;return m.sutlacIstegi;};
    const ilk=gel();t.rekorlar.sutlac=3;const ikinci=gel();t.pastane.vitrin.sutlac=[];return [ilk,ikinci,gel(),gel()];
  });expect(sonuc).toEqual(['yildiz','cicek','yildiz','kalp']);
});
test('Tarçınlanan kâse vitrinden Mino’ya taşınır, tarif yarıda bırakılınca aynı desenden sürer',async({page})=>{
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{tatliSeviye:5,jeton:2,secili:'sutlac',restoranda:true,ekran:'masa',
      restoran:{sira:1,menuId:'sutlac',evre:'mutfak'},gun:{no:2,ziyaret:1,kazanc:0,kapandi:false},
      masalar:{sutlac:{tabaklar:{},sunuldu:false,sutlacIstegi:'cicek'}},
      pastane:{acik:true,tezgah:'sutlac',vitrin:{},taslaklar:{sutlac:{adim:3,yanlis:0,surum:2,sutlac:{
        adim:3,pirinc:true,sut:1,isi:.51,karistirma:.82,doluluk:.75,toz:0}}}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });await page.reload();
  await page.getByRole('button',{name:'Çiçek kalıbı'}).click();
  const elek=page.getByRole('button',{name:'Eleği kâsenin üzerinde sağa sola salla'});
  for(let i=0;i<6;i++)await elek.press('Enter');
  await page.reload();
  await expect(page.getByRole('button',{name:'Çiçek kalıbı'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Kalıbı kaldır'}).click();
  await page.getByRole('button',{name:'Vitrine koy'}).click();
  await expect(page.locator('[data-kademe="5"] .sl-kase')).toHaveAttribute('data-desen','cicek');
  if(process.env.SEF_SUTLAC_KARE)await page.screenshot({path:process.env.SEF_SUTLAC_KARE+'/sutlac-pastane-740.png'});
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Tarçınlı Sütlaç vitrinden tepsiye al'}).click();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.getByRole('button',{name:/30 jeton kazanıldı/})).toBeVisible();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.pastane.vitrin.sutlac).toHaveLength(0);expect(t.jeton).toBe(32);
  expect(t.masalar.sutlac.sutlacServisi).toMatchObject({desen:'cicek',doluluk:.75,kivam:'ipeksi'});
});
