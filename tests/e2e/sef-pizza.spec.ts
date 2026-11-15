import { test, expect, type Page, type Locator } from '@playwright/test';
import { hataTopla } from './yardimci';

type Nokta = { x: number; y: number };
const alan = (p: Page) => p.locator('.firin-oyunu');
const kart = (p: Page) => p.locator('.siparis-karti[data-tarif="pizza"]');
const durum = (p: Page, masa?:string) => p.evaluate(id => JSON.parse(localStorage.getItem('minkino-sef-pizza-v1'+(id?'-masa-'+id:'')) ?? 'null'),masa);
async function bekle(p: Page, asama: string) {
  await expect(alan(p)).toHaveAttribute('data-asama', asama);
  await expect.poll(() => alan(p).locator('img:visible').evaluateAll(imgs =>
    imgs.every(el => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0),
  )).toBe(true);
}
async function pizzaKaydi(p:Page){
  await expect(alan(p)).toHaveCount(0);
  return p.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
}
async function dedeyeSun(p:Page){
  await p.getByRole('button',{name:'Dede Hasan masasına götür'}).tap();
  await expect(p.locator('.servis-jetonu')).toBeVisible();
  await p.getByRole('button',{name:'Geri',exact:true}).first().tap();
}
async function nokta(el: Locator, x = .5, y = .5): Promise<Nokta> {
  const kutu = await el.boundingBox();
  if (!kutu) throw new Error('Dokunma alanı bulunamadı');
  return { x: kutu.x + kutu.width * x, y: kutu.y + kutu.height * y };
}
async function surukle(p: Page, yol: Nokta[], iptal = false) {
  const c = await p.context().newCDPSession(p);
  try {
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [yol[0]] });
    for (const n of yol.slice(1)) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [n] });
    await c.send('Input.dispatchTouchEvent', { type: iptal ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  } finally { await c.detach(); }
}
function ip(bas: Nokta, son: Nokta) {
  return Array.from({ length: 9 }, (_, i) => ({ x: bas.x + (son.x - bas.x)*i/8, y: bas.y + (son.y - bas.y)*i/8 }));
}
async function ac(p: Page) {
  await p.goto('./sef/');
  await p.getByRole('button', { name: 'Sesi kapat', exact: true }).click();
  await kart(p).click();
  await bekle(p, 'hamur');
}
test.beforeEach(async ({ page }, info) => {
  // Bir başka çalışma dosyayı kaydettiğinde Vite, oynanan siparişi ortada yeniden yüklememeli.
  await page.routeWebSocket(/localhost:5173/, ws => {
    const sunucu=ws.connectToServer();
    sunucu.onMessage(m=>{if(typeof m!=='string'||!['full-reload','update'].includes(JSON.parse(m).type))ws.send(m);});
  });
  await page.setViewportSize(info.project.name === 'ipad' || info.project.name === 'tablet'
    ? { width: 1024, height: 768 } : { width: 844, height: 390 });
});

test('Mini Pizza hamuru, sosu ve çocuğun seçtiği yerler fırından masaya taşınır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await ac(page);
  const hamur = alan(page).locator('.pz-yuvarla');
  const ust = await nokta(hamur, .5, .23), alt = await nokta(hamur, .5, .78);
  await surukle(page, [...ip(ust, alt), ...ip(alt, ust), ...ip(ust, alt), ...ip(alt, ust)]);
  await bekle(page, 'sos');

  const sos = alan(page).locator('.pz-sos');
  for (const [x,y] of [[.35,.30], [.65,.30], [.76,.56], [.57,.74], [.33,.70], [.25,.48]]) {
    const n = await nokta(sos, x, y);
    await surukle(page, [n]);
  }
  await bekle(page, 'malzeme');
  const pizza = alan(page).locator('.pz-diz');
  await alan(page).getByRole('button',{name:'Tek dilim koy'}).tap();
  const malzeme = (id: string) => alan(page).locator(`.pz-malzeme[data-cesit="${id}"]`);
  async function yerlestir(id: string, x: number, y: number, iptal = false) {
    await surukle(page, ip(await nokta(malzeme(id)), await nokta(pizza,x,y)), iptal);
  }
  await yerlestir('domates', .40, .4);
  await yerlestir('mantar', .4, .4, true);
  expect((await durum(page)).ust.map((v:{cesit:string})=>v.cesit)).toEqual(['domates']);
  await surukle(page,ip(await nokta(pizza,.4,.4),await nokta(malzeme('domates'))));
  expect((await durum(page)).ust).toEqual([]);
  await yerlestir('biber', .31, .43);
  await yerlestir('mantar', .68, .38);
  await yerlestir('peynir', .48, .69);
  await surukle(page, ip(await nokta(pizza,.68,.38), await nokta(pizza,.66,.50)));
  const parcalar = (await durum(page)).ust;
  expect(parcalar.map((v: {cesit: string}) => v.cesit)).toEqual(['biber','peynir','mantar']);
  expect(parcalar[0].x).toBeCloseTo(31,0);
  expect(parcalar[2].y).toBeCloseTo(50,0);
  await page.reload();
  await bekle(page, 'malzeme');
  expect((await durum(page)).ust).toEqual(parcalar);

  await page.getByRole('button',{name:'Fırına git',exact:true}).tap();
  await bekle(page,'firin');
  await page.getByRole('button',{name:'Pizza tezgâhına dön',exact:true}).tap();
  await bekle(page,'malzeme');
  await page.getByRole('button',{name:'Fırına git',exact:true}).tap();
  const tepsi = alan(page).locator('.pz-tepsi');
  await surukle(page, ip(await nokta(tepsi), await nokta(alan(page).locator('.pz-firin-hedef'))));
  await bekle(page, 'pisiyor');
  await page.reload();
  await bekle(page,'hazir');
  await surukle(page, ip(await nokta(tepsi), await nokta(alan(page).locator('.pz-park'))));
  await bekle(page,'servis');
  await surukle(page, ip(await nokta(alan(page).locator('.pz-sun')), await nokta(alan(page).locator('.pz-tabak'))));
  const son=await pizzaKaydi(page);
  expect(son).toMatchObject({no:1,kivam:'tam',pisirme:3,ust:parcalar});
  const sonKoordinatlar=son.ust;
  await dedeyeSun(page);
  await expect(kart(page)).toBeVisible();
  expect((await durum(page)).aktif).toBe(false);
  await page.reload();
  await page.getByRole('button', {name:'Hazırladığım tabaklar',exact:true}).tap();
  const defterPizzasi = page.getByRole('dialog').getByRole('button', {name:'Mini Pizza', exact:true});
  await expect(defterPizzasi).toHaveCount(1);
  const defterYerleri = await defterPizzasi.locator('.pz-parca').evaluateAll(parcalar => parcalar.map(r => {
    const el = r as HTMLElement;
    return { cesit: el.dataset.cesit, x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
  }));
  expect(defterYerleri).toEqual(sonKoordinatlar);
  await page.getByRole('button', {name:'Tabak defterini kapat',exact:true}).tap();
  await kart(page).tap();
  await bekle(page,'hamur');
  expect((await durum(page)).tur).toBe(1);
  expect(hatalar).toEqual([]);
});

test('Mini Pizza klavye ile tamamlanır, siparişlere dönünce yarım hamur korunur', async ({ page }) => {
  await ac(page);
  const hamur = page.getByRole('button',{name:'Merdaneyi ileri geri yuvarla'});
  await hamur.press('Space');
  await page.keyboard.press('Escape');
  await expect(kart(page)).toBeVisible();
  expect((await durum(page)).hamur).toBe(1);
  await kart(page).press('Enter');
  for (let i=0;i<3;i++) await hamur.press('Space');
  await bekle(page,'sos');
  const sos = page.getByRole('button',{name:'Sosu hamurun üzerine yay'});
  for (let i=0;i<6;i++) await sos.press('Enter');
  await bekle(page,'malzeme');
  for(const tur of ['Peynir','Biber','Mantar']) {
    if(tur==='Peynir')await alan(page).getByRole('button',{name:'Tek dilim koy'}).press('Enter');
    await page.getByRole('button',{name:tur+' seç',exact:true}).press('Enter');
    await expect(page.getByRole('button',{name:'Malzemeyi pizzaya yerleştir'})).toBeFocused();
    if (tur === 'Peynir') await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
  }
  expect((await durum(page)).ust[0].x).toBe(40);
  await page.getByRole('button',{name:'Fırına git',exact:true}).press('Enter');
  await page.getByRole('button',{name:'Tepsiyi fırına sür'}).press('Space');
  await bekle(page,'hazir');
  await page.getByRole('button',{name:'Pizzayı fırından çıkar'}).press('Enter');
  await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).press('Enter');
  await page.getByRole('button',{name:'Dede Hasan masasına götür'}).press('Enter');
  await expect(page.locator('.servis-jetonu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(kart(page)).toBeVisible();
});

test('pizza erken geri döner, görünmeyen fırında süre ilerlemez, yanık kıvamı saklanır',async({page})=>{
  const ust=[{cesit:'peynir',x:34,y:47},{cesit:'biber',x:66,y:52},{cesit:'mantar',x:50,y:70}];
  await page.goto('./sef/?test=1');
  await page.evaluate(ust=>{
    localStorage.setItem('minkino-sef-pizza-v1',JSON.stringify({
      asama:'firin',tur:0,servis:0,hamur:4,sos:[0,1,2,3,4,5],ust,pismeMs:0,aktif:true,
    }));
  },ust);
  await page.reload();await bekle(page,'firin');
  await page.clock.install();
  await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
  await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
  await bekle(page,'servis');
  await expect(alan(page)).toHaveAttribute('data-kivam','erken');
  await page.getByRole('button',{name:'Pizzayı tekrar fırına sür'}).tap();
  await page.clock.fastForward(4000);
  await expect(alan(page)).toHaveAttribute('data-kivam','tam');
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(60000);
  await expect(alan(page)).toHaveAttribute('data-kivam','tam');
  await page.evaluate(()=>{
    Reflect.deleteProperty(document,'hidden');document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(13000);
  await expect(alan(page)).toHaveAttribute('data-kivam','fazla');
  await page.clock.fastForward(10000);
  await expect(alan(page)).toHaveAttribute('data-kivam','yanik');
  await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
  await expect(page.getByRole('button',{name:'Taze pizzayla yeniden başla'})).toBeVisible();
  await page.reload();await bekle(page,'servis');
  await expect(alan(page)).toHaveAttribute('data-kivam','yanik');
  await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
  expect(await pizzaKaydi(page)).toMatchObject({pisirme:1,kivam:'yanik'});
  expect((await durum(page)).ust).toEqual(ust);
  await dedeyeSun(page);
  await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
  const tabak=page.getByRole('dialog').getByRole('button',{name:'Mini Pizza',exact:true});
  await expect(tabak.locator('.pz-pizza')).toHaveAttribute('data-kivam','yanik');
  await expect(tabak.locator('.pz-parca')).toHaveCount(3);
});

test('çocuk fişten farklı tek malzemeyi kendi seçip servis edebilir',async({page})=>{
  await ac(page);
  for(let i=0;i<4;i++) await alan(page).locator('.pz-yuvarla').press('Enter');
  for(let i=0;i<6;i++) await alan(page).locator('.pz-sos').press('Enter');
  await bekle(page,'malzeme');
  const tahta=alan(page).locator('.pz-diz');
  await alan(page).getByRole('button',{name:'Tek dilim koy'}).tap();
  for(const [i,id] of ['peynir','biber','mantar','domates'].entries()){
    await alan(page).locator('.pz-malzeme[data-cesit="'+id+'"]').tap();
    const nok=await nokta(tahta,.36+i*.09,.5);
    await page.touchscreen.tap(nok.x,nok.y);
  }
  expect((await durum(page)).ust).toHaveLength(4);
  await page.reload();await bekle(page,'malzeme');
  for(const ad of ['Peynir','Biber','Mantar'])await alan(page).getByRole('button',{name:ad+' kaldır',exact:true}).tap();
  await page.getByRole('button',{name:'Fırına git',exact:true}).tap();
  await page.reload();await bekle(page,'firin');
  await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
  await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
  await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
  expect(await pizzaKaydi(page)).toMatchObject({istekPuani:1,pisirme:2,puan:1});
  await dedeyeSun(page);
  await page.reload();
  await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
  const sunulan=page.getByRole('dialog').getByRole('button',{name:'Mini Pizza',exact:true});
  await expect(sunulan.locator('.pz-parca')).toHaveCount(1);
  await expect(sunulan.locator('.pz-parca')).toHaveAttribute('data-cesit','domates');
});

for(const fazladan of [false,true]){
  test('Lokum kendi pizzasını ister, tepside '+(fazladan?'istemediği zeytini fark eder':'tam siparişi alır'),async({page})=>{
    await page.setViewportSize({width:667,height:375});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Sesi kapat',exact:true}).tap();
    await page.goto('./sef/?giris=tepsiler&siparis=pizza-molasi');
    await page.locator('[data-parca=pizza]').tap();
    await expect(alan(page).locator('.pz-fis img.misafir')).toHaveAttribute('alt','Lokum');
    for(let i=0;i<4;i++)await alan(page).locator('.pz-yuvarla').press('Enter');
    for(let i=0;i<6;i++)await alan(page).locator('.pz-sos').press('Enter');
    await bekle(page,'malzeme');
    await expect(alan(page).locator('.pz-malzeme')).toHaveCount(11);
    await alan(page).getByRole('button',{name:'Tek dilim koy'}).tap();
    await expect(alan(page).locator('.pz-haric')).toHaveAttribute('aria-label','Siyah zeytin istemiyor');
    for(const [i,id] of (fazladan?['ananas','peynir','zeytin']:['ananas','peynir']).entries()){
      await alan(page).locator('.pz-malzeme[data-cesit="'+id+'"]').tap();
      const konum=await nokta(alan(page).locator('.pz-diz'),.35+.16*i,.45);
      await page.touchscreen.tap(konum.x,konum.y);
    }
    // İkinci ananas bağımsız bir dilimdir. Geri alma, ilk dilimi yerinden etmemeli.
    const ilkAnanas=(await durum(page,'pizza-molasi')).ust[0];
    await alan(page).locator('.pz-malzeme[data-cesit="ananas"]').tap();
    const ekYer=await nokta(alan(page).locator('.pz-diz'),.60,.67);
    await page.touchscreen.tap(ekYer.x,ekYer.y);
    await page.reload();await bekle(page,'malzeme');
    await expect(alan(page).locator('.pz-diz [data-cesit="ananas"]')).toHaveCount(2);
    await alan(page).getByRole('button',{name:'Ananas kaldır'}).tap();
    expect((await durum(page,'pizza-molasi')).ust[0]).toEqual(ilkAnanas);
    await expect(alan(page).locator('.pz-fis-malzeme[data-hazir="1"]')).toHaveCount(2);
    if(fazladan&&process.env.SEF_PIZZA_RAF_KARE)await alan(page).screenshot({path:process.env.SEF_PIZZA_RAF_KARE});
    await page.getByRole('button',{name:'Fırına git'}).tap();
    await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
    await bekle(page,'hazir');await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
    await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
    const puan=fazladan?2:3;
    expect(await pizzaKaydi(page)).toMatchObject({istekPuani:puan,puan});
    await page.getByRole('button',{name:/Pizza siparişi ile tabağı karşılaştır/}).tap();
    const fis=page.getByRole('dialog');
    await expect(fis.locator('[data-puan]')).toHaveAttribute('data-puan',String(puan));
    if(fazladan)await expect(fis.getByLabel('Kullanılan malzemeler').getByRole('img',{name:/zeytin/i}).first()).toBeVisible();
    await fis.getByRole('button',{name:'Tepsiye dön'}).tap();
    await page.reload();
    await expect(page.locator('[data-parca=pizza] .pz-parca')).toHaveCount(fazladan?3:2);
    await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
    await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).tap();
    await expect(page.locator('.tepsi-ust h2')).toHaveText(puan+' / 6');
  });
}

for(const ters of [false,true]){
  test('paylaşılan pizzada '+(ters?'ters yarılar düşük puanla kalır':'dilim doğru yarıya taşınınca fiş tamamlanır'),async({page}, info)=>{
    await page.goto('./sef/?test=1');
    // Dört sipariş tamamlamış bir çocuğun bir sonraki gerçek menü seçimini aç.
    await page.evaluate(()=>localStorage.setItem('minkino-sef-pizza-v1',JSON.stringify({
      servis:4,tur:3,aktif:false,asama:'son',hamur:4,sos:[0,1,2,3,4,5],ust:[{cesit:'zeytin',x:42,y:45}],pismeMs:5000
    })));
    await page.reload();
    await kart(page).tap();
    for(let i=0;i<4;i++)await alan(page).locator('.pz-yuvarla').press('Enter');
    for(let i=0;i<6;i++)await alan(page).locator('.pz-sos').press('Enter');
    await bekle(page,'malzeme');
    const tahta=alan(page).locator('.pz-diz');
    await alan(page).getByRole('button',{name:'Tek dilim koy'}).tap();
    for(const [cesit,x] of [['mantar',.70],['biber',ters?.30:.67]] as const){
      await alan(page).locator('.pz-malzeme[data-cesit="'+cesit+'"]').tap();
      const n=await nokta(tahta,x,cesit==='mantar'?.40:.60);
      await page.touchscreen.tap(n.x,n.y);
    }
    await page.reload();await bekle(page,'malzeme');
    if(!ters)await surukle(page,ip(await nokta(tahta,.70,.40),await nokta(tahta,.31,.45)));
    await expect(alan(page).locator('.pz-fis-yari .pz-fis-malzeme[data-hazir="1"]')).toHaveCount(ters?0:2);
    await alan(page).screenshot({path:info.outputPath('paylasim-tahta.png')});
    await page.getByRole('button',{name:'Fırına git'}).tap();
    await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
    await bekle(page,'hazir');await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
    await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
    expect(await pizzaKaydi(page)).toMatchObject({istekPuani:ters?1:3,puan:ters?2:3});
    await page.screenshot({path:info.outputPath('paylasim-servis.png')});
    await dedeyeSun(page);
    await page.reload();
    await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
    const album=page.getByRole('dialog').getByRole('button',{name:'Mini Pizza',exact:true});
    await expect(album.locator('.pz-parca')).toHaveCount(2);
    expect(await album.locator('[data-cesit=mantar]').evaluate(e=>parseFloat((e as HTMLElement).style.left)>50)).toBe(ters);
  });
}

test('bağımsız hamur ve müşteri masası ayrı ilerler, yeniden hazırlanan pizza aynı fişi taşır',async({page})=>{
  await ac(page);
  await page.getByRole('button',{name:'Merdaneyi ileri geri yuvarla'}).tap();
  await page.getByRole('button',{name:'Siparişlere dön'}).tap();
  await page.goto('./sef/?giris=tepsiler&siparis=pizza-molasi');
  await page.locator('[data-parca=pizza]').tap();
  expect((await durum(page)).hamur).toBe(1);
  expect((await durum(page,'pizza-molasi')).hamur).toBe(0);
  const fis=(await durum(page,'pizza-molasi')).fis;
  for(let deneme=0;deneme<2;deneme++){
    for(let i=0;i<4;i++)await alan(page).locator('.pz-yuvarla').press('Enter');
    for(let i=0;i<6;i++)await alan(page).locator('.pz-sos').press('Enter');
    for(const id of (deneme?['ananas','peynir']:['zeytin'])){
      await alan(page).locator('.pz-malzeme[data-cesit="'+id+'"]').tap();
      const n=await nokta(alan(page).locator('.pz-diz'),id==='ananas'?.35:.65,.53);
      await page.touchscreen.tap(n.x,n.y);
    }
    await page.getByRole('button',{name:'Fırına git'}).tap();
    await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
    await bekle(page,'hazir');await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
    await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
    await expect(alan(page)).toHaveCount(0);
    expect((await durum(page,'pizza-molasi')).servis).toBe(deneme+1);
    if(!deneme){
      await page.locator('[data-parca=pizza]').tap();
      await bekle(page,'hamur');
      expect((await durum(page,'pizza-molasi')).fis).toEqual(fis);
      await page.reload();await bekle(page,'hamur');
    }
  }
  expect((await durum(page)).hamur).toBe(1);
});
test('ileri fişte istenen ve konan dilim sayıları karşılaştırılır, serbest fişte ek dilim puan kırmaz',async({page},info)=>{
  await ac(page);
  await expect(alan(page).getByRole('button',{name:'Klasik pizza siparişi'})).toHaveAttribute('aria-pressed','true');
  await alan(page).getByRole('button',{name:'İki yarılı pizza siparişi'}).tap();
  await expect(alan(page).locator('.pz-fis-yari')).toHaveCount(2);
  await alan(page).getByRole('button',{name:'Sayılı pizza siparişi'}).tap();
  await expect(alan(page).getByRole('button',{name:'Sayılı pizza siparişi'})).toHaveAttribute('aria-pressed','true');
  await alan(page).screenshot({path:info.outputPath('ilk-fis-secimi.png')});
  for(let i=0;i<4;i++)await alan(page).locator('.pz-yuvarla').press('Enter');
  for(let i=0;i<6;i++)await alan(page).locator('.pz-sos').press('Enter');
  await bekle(page,'malzeme');
  const fis=alan(page).locator('.pz-fis');
  await expect(fis).toHaveAttribute('aria-description','Pizzama iki dilim mantar ve bir dilim biber koyar mısın?');
  const hamur=alan(page).locator('.pz-diz');
  async function dilim(id:string,x:number,y:number){
    await alan(page).locator('.pz-malzeme[data-cesit="'+id+'"]').tap();
    const n=await nokta(hamur,x,y);await page.touchscreen.tap(n.x,n.y);
  }
  await dilim('mantar',.30,.45);
  await expect(fis.getByLabel('Mantar: 1 / 2')).toHaveAttribute('data-hazir','0');
  await dilim('biber',.65,.55);
  await dilim('mantar',.40,.65);
  await expect(fis.getByLabel('Mantar: 2 / 2')).toHaveAttribute('data-hazir','1');
  await page.reload();await bekle(page,'malzeme');
  await expect(fis.getByLabel('Mantar: 2 / 2')).toBeVisible();
  await dilim('mantar',.58,.32);
  await expect(fis.getByLabel('Mantar: 3 / 2')).toHaveAttribute('data-hazir','0');
  await alan(page).screenshot({path:info.outputPath('miktar-fisi.png')});
  await page.getByRole('button',{name:'Fırına git'}).tap();
  await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();
  await bekle(page,'hazir');await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
  await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();
  const tabak=await pizzaKaydi(page);
  expect(tabak).toMatchObject({istekPuani:2,puan:2});
  expect(tabak.ust.filter((d:{cesit:string})=>d.cesit==='mantar')).toHaveLength(3);
  await dedeyeSun(page);
  await page.reload();
  await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
  await expect(page.getByRole('dialog').getByRole('button',{name:'Mini Pizza'}).locator('[data-cesit=mantar]')).toHaveCount(3);
});

for(const dogru of [false,true]){
  test('pesto siparişinde sos, porsiyon ve gerçek servis '+(dogru?'birlikte korunur':'yanlış seçimle puana yansır'),async({page},info)=>{
    await page.setViewportSize({width:568,height:320});
    await page.goto('./sef/?giris=tepsiler&siparis=pesto-pizzasi');
    await page.locator('[data-parca=pizza]').tap();
    await expect(alan(page).locator('.pz-fis')).toHaveAttribute('aria-description',/Fesleğen sosu/);
    for(let i=0;i<4;i++)await alan(page).locator('.pz-yuvarla').press('Enter');
    const sos=alan(page).locator('.pz-sos');
    await sos.press('Enter');
    expect((await durum(page,'pesto-pizzasi')).sos).toEqual([]);
    await page.getByRole('button',{name:'Domates sosu seç'}).tap();
    await sos.press('Enter');
    expect((await durum(page,'pesto-pizzasi')).sos).toHaveLength(1);
    await page.getByRole('button',{name:'Fesleğen sosu seç'}).tap();
    expect((await durum(page,'pesto-pizzasi')).sos).toEqual([]);
    for(let i=0;i<2;i++)await sos.press('Enter');
    await page.reload();await bekle(page,'sos');
    const yesil=page.getByRole('button',{name:'Fesleğen sosu seç'});
    await expect(yesil).toHaveAttribute('aria-pressed','true');
    await alan(page).screenshot({path:info.outputPath('sos-tezgahi.png')});
    for(let i=0;i<4;i++)await sos.press('Enter');
    await bekle(page,'malzeme');
    const tahta=alan(page).locator('.pz-diz');
    await expect(page.getByRole('button',{name:'Üç dilim serp'})).toHaveAttribute('aria-pressed','true');
    for(const [cesit,x,y] of [['peynir',.38,.47],['domates',.61,.53],['zeytin',.5,.68]] as const){
      const n=await nokta(tahta,x,y);
      await surukle(page,ip(await nokta(alan(page).locator('.pz-malzeme[data-cesit="'+cesit+'"]')),n));
    }
    const once=(await durum(page,'pesto-pizzasi')).ust;
    expect(once).toHaveLength(9);
    expect(once.every((d:Nokta)=>Math.hypot(d.x-50,d.y-50)<=34.001)).toBeTruthy();
    if(!dogru){
      await page.getByRole('button',{name:'Sos tezgâhına dön'}).tap();
      await page.getByRole('button',{name:'Domates sosu seç'}).tap();
      for(let i=0;i<6;i++)await sos.press('Enter');
      expect((await durum(page,'pesto-pizzasi')).ust).toEqual(once);
    }
    await page.getByRole('button',{name:'Fırına git'}).tap();
    await page.getByRole('button',{name:'Tepsiyi fırına sür'}).tap();await bekle(page,'hazir');
    await page.getByRole('button',{name:'Tepsiyi şimdi al'}).tap();
    await page.getByRole('button',{name:'Pizzayı servis tabağına koy'}).tap();const tabak=await pizzaKaydi(page);
    expect(tabak).toMatchObject({istekPuani:dogru?3:2,sosCesidi:dogru?'feslegen':'domates',ust:once});
    const porsiyon=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
    await expect(porsiyon.locator('[data-cesit=peynir]').first()).toHaveAttribute('src',/peynir-erimis/);
    await page.screenshot({path:info.outputPath('servis.png')});
    await page.reload();
    await expect(porsiyon.locator('.pz-pizza')).toHaveAttribute('data-sos',dogru?'feslegen':'domates');
    await expect(porsiyon.locator('.pz-parca')).toHaveCount(9);
  });
}
