import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Panoya asılı sofra fotoğrafındaki sütlacı Mino spesiyal olarak sipariş eder',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const masa={tabaklar:{sutlac:true},sunuldu:true,sutlacIstegi:'kalp',sutlacServisi:{desen:'kalp',toz:.95,doluluk:.9,kivam:'ipeksi'},tatliPuani:3};
    Object.assign(k.tepsiler,{tatliSeviye:5,anilar:[{gun:2,sira:2,menuId:'dondurma',masa:{sunuldu:true,tabaklar:{dondurma:true},tatliPuani:3}},{gun:2,sira:3,menuId:'sutlac',masa}],
      gun:{no:3,ziyaret:1,kapandi:false,kazanc:5},restoran:{sira:5,menuId:'corba-sofrasi',evre:'mutfak',sayildi:true},
      masalar:{...Object.fromEntries(['kurabiye','dondurma','minik-kek','meyveli-tart'].map(id=>[id,{sunuldu:true,tabaklar:{[id]:true},tatliPuani:3}])),sutlac:masa,'corba-sofrasi':{sunuldu:true,tabaklar:{icecek:true},icecekPuani:3}},rekorlar:{sutlac:3,kurabiye:3,dondurma:3,'minik-kek':3,'meyveli-tart':3},
      ekran:'kapali',restoranda:false,secili:'corba-sofrasi',spesiyal:{gun:2,sira:3,menuId:'sutlac',masa}});localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });await page.reload();
  // Fotoğrafı panoya asan düğme albümle birlikte kalktı (aşağıdaki test); burada panoda Mino'nun sütlaç fotoğrafı asılı.
  await page.getByRole('button',{name:'Restoranı aç'}).tap();
  await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).tap();
  const b=page.getByRole('button',{name:'Şefin spesiyalini büyüt'});
  await expect(b).toBeVisible({timeout:18000});await b.tap();
  const buyuk=page.getByRole('dialog',{name:'Şefin spesiyali'});
  await expect(buyuk.locator('.sl-kase')).toHaveAttribute('data-desen','kalp');
  await page.getByRole('button',{name:'Salona dön',exact:true}).tap();
  const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(siparis).toBeVisible({timeout:18000});
  await expect(siparis.getByRole('img',{name:'Şefin spesiyali'})).toBeVisible();
  await expect(siparis.locator('.sl-kase')).toHaveAttribute('data-desen','kalp');
  const alan=await siparis.locator('.sl-kase').boundingBox();expect(alan!.width/alan!.height).toBeCloseTo(720/494,1);
  if(process.env.SEF_SALON_KARE)await page.screenshot({path:process.env.SEF_SALON_KARE+'/sef-salon-spesiyali.png'});
  await siparis.tap();await expect(page.locator('.tepsi-istek .spesiyal-rozeti')).toBeVisible();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.restoran.menuId).toBe('sutlac');expect(t.spesiyalGunu).toBe(3);
});

// OLASI GERÇEK KUSUR (19 Kasım, Barış'ın kararı bekleniyor): sofra fotoğrafını restoran panosuna asan "Restoran panosuna as"
// yalnız tabak albümündeydi; albüm 16 Kasım'da (c3d9d09a) kaldırıldı ve spesiyali başlatan bir giriş kalmadı.
// Karar gelene kadar bu test 3 sn içinde, sebebini yazarak kalır.
test('Çocuk bir sofra fotoğrafını restoran panosuna asabilir',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:740,height:360});await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    const masa={tabaklar:{sutlac:true},sunuldu:true,sutlacIstegi:'kalp',sutlacServisi:{desen:'kalp',toz:.95,doluluk:.9,kivam:'ipeksi'},tatliPuani:3};
    Object.assign(k.tepsiler,{tatliSeviye:5,anilar:[{gun:2,sira:3,menuId:'sutlac',masa}],gun:{no:3,ziyaret:1,kapandi:false,kazanc:5},ekran:'kapali',restoranda:false});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });await page.reload();
  await expect(page.getByRole('button',{name:'Restoran panosuna as'}),
    'Şefin spesiyalini başlatan giriş yok: "Restoran panosuna as" yalnız 16 Kasım’da kaldırılan tabak albümündeydi. Barış kararı bekleniyor.').toBeVisible({timeout:3000});
});

test('Fotoğraf albümden çıktığında spesiyal kalır; 1 yıldız, kapalı tatlı ve art arda aynı müşteri uygun değildir',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});await page.goto('./sef/');
  const sonuc=await page.evaluate(async()=>{
    const mod=(p:string)=>import(/* @vite-ignore */p);
    const {bosTepsiler,bosMasa,menuBul,spesiyalMenusu,panoyaUygun,tepsileriOku}=await mod('/sef/src/tepsi-fisleri.ts');
    const t=bosTepsiler();t.tatliSeviye=5;t.gun.no=3;t.gun.ziyaret=2;t.restoran={sira:5,menuId:'peynirli-tost',evre:'mutfak'};
    const masa={...bosMasa(),sunuldu:true,tabaklar:{dondurma:true},tatliPuani:1,dondurmaIstegi:'vanilya'};
    const ani={menuId:'dondurma',gun:2,sira:2,masa};
    const zayif=panoyaUygun(ani);masa.tatliPuani=2;t.spesiyal=ani;t.rekorlar.dondurma=2;
    const normal=menuBul('dondurma');const siparis=()=>spesiyalMenusu(t,normal)?.id??null;
    const acik=siparis();t.spesiyalGunu=3;const ikinci=siparis();delete t.spesiyalGunu;t.tatliSeviye=0;const kilit=siparis();
    t.tatliSeviye=5;t.restoran.menuId='corba-sofrasi';const arkaArkaya=siparis();
    const kayit=tepsileriOku(t,(s:unknown)=>s);return {zayif,acik,ikinci,kilit,arkaArkaya,kalan:kayit.spesiyal.menuId};
  });
  expect(sonuc).toMatchObject({zayif:false,acik:'dondurma',ikinci:null,kilit:null,arkaArkaya:null,kalan:'dondurma'});
});
