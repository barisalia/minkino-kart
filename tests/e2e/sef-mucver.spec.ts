import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const oyun = (page: Page) => page.locator('.mucver-oyunu');
const kart = (page: Page) => page.getByRole('button', { name: 'Fırın Mücver siparişi', exact: true });
const kayit = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('minkino-sef-mucver-v1') ?? 'null'));
type Konum = { x: number; y: number };

async function asama(page: Page, ad: string) {
  await expect(oyun(page)).toHaveAttribute('data-asama', ad);
  await expect.poll(() => oyun(page).locator('img:visible').evaluateAll(imgs =>
    imgs.every(el => el instanceof HTMLImageElement && el.complete && el.naturalWidth > 0),
  )).toBe(true);
}
async function konum(el: Locator, x = .5, y = .5): Promise<Konum> {
  const alan = await el.boundingBox();
  if (!alan) throw new Error('Dokunulacak nesne ekranda değil.');
  return { x: alan.x + alan.width*x, y: alan.y + alan.height*y };
}
async function parmak(page: Page, yol: Konum[], iptal = false) {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [yol[0]] });
    for (const n of yol.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [n] });
    await cdp.send('Input.dispatchTouchEvent', { type: iptal ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  } finally { await cdp.detach(); }
}
async function tasi(page: Page, kaynak: Locator, hedef: Locator, x = .5, y = .5, iptal = false) {
  const a = await konum(kaynak), b = await konum(hedef,x,y);
  await parmak(page, Array.from({length:7},(_,i)=>({x:a.x+(b.x-a.x)*i/6,y:a.y+(b.y-a.y)*i/6})),iptal);
}
async function basla(page: Page) {
  await kart(page).tap();
  await asama(page,'rende');
}
async function sonucArtisiniBekle(page: Page, alan: string, deger: number) {
  await expect.poll(async () => (await kayit(page))[alan]).toBe(deger);
}
test.beforeEach(async ({page},info)=>{
  await page.setViewportSize(info.project.name==='ipad'?{width:1024,height:768}:{width:740,height:360});
  if (process.env.MUCVER_DEV_QA) {
    // Ortak geliştirme sunucusunun başka tariflerdeki düzenlemeler için yolladığı
    // Vite güncellemelerini atla. Çocuğun gerçek sayfa yenilemeleri hâlâ çalışır.
    await page.routeWebSocket('**/*',socket=>{
      const sunucu=socket.connectToServer();
      sunucu.onMessage(ileti=>{
        if(typeof ileti==='string' && /"type":"(full-reload|update)"/.test(ileti))return;
        socket.send(ileti);
      });
    });
  }
});

test('Mücverin seçilen kızarma derecesi fırından tabağa, puana ve albüme taşınır',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');
  for(const derece of [1,2]){
    await page.evaluate(()=>{
      localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true}));
      localStorage.setItem('minkino-sef-mucver-v1',JSON.stringify({aktif:true,servis:1,siparis:1,sebze:'kabak',kabak:3,havuc:3,harc:6,tur:3,kasikDolu:false,yerler:[{x:27,y:48},{x:50,y:45},{x:73,y:49}],bitis:1,cikti:false,kizarma:0,sunulan:[]}));
      localStorage.setItem('minkino-sef-acik-atolye','mucver');
    });
    await page.reload();const o=oyun(page);
    for(let i=0;i<derece;i++){await asama(page,'cikar');await o.getByRole('button',{name:'Mücverleri biraz daha kızart'}).tap();}
    await asama(page,'cikar');await page.reload();await asama(page,'cikar');
    const renk= derece===1?'citir':'fazla';
    await expect(o.locator('.mv-firindaki .mv-koftesi').first()).toHaveAttribute('src',new RegExp(renk));
    await o.locator('[data-cikar]').tap();
    for(let i=0;i<3;i++){
      await o.locator('[data-parca="'+i+'"]').press('Enter');
      await expect(o.locator('.mv-spatula-lokma')).toHaveAttribute('src',new RegExp(renk));
      await o.locator('[data-tabaga]').press('Enter');
      await expect.poll(async()=>(await kayit(page)).sunulan.length).toBe(i+1);
    }
    await o.locator('[data-sus="dereotu"]').tap();await o.locator('[data-teslim]').tap();await asama(page,'son');
    const servis=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
    expect(servis).toMatchObject({puan:derece===1?3:1,istekPuani:3,pisirmePuani:derece===1?3:1,tercih:{tarifId:'mucver',tur:1,kizarma:derece,garnitur:'dereotu'}});
    await o.locator('.mv-ileri').tap();await page.getByRole('button',{name:'Hazırladığım tabaklar'}).tap();
    const album=page.getByRole('dialog');await album.getByRole('button',{name:'Fırın Mücver',exact:true}).tap();
    await expect(album.getByLabel('Kullandığım malzemeler').locator('img').first()).toHaveAttribute('src',new RegExp(renk));
    await page.keyboard.press('Escape');await page.keyboard.press('Escape');
  }
});

test('Fırın Mücver gerçek dokunuşla hazırlanır ve süslenmiş tabak deftere bir kez girer', async ({page},info)=>{
  const hatalar=hataTopla(page);
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat',exact:true}).tap();
  await basla(page);
  const o=oyun(page);
  const kare=async(ad:string)=>{if(process.env.MUCVER_KARE)await page.screenshot({path:process.env.MUCVER_KARE+'/'+info.project.name+'-'+ad+'.png'});};
  await kare('01-rende');
  await o.getByRole('button',{name:'Havuç seç'}).tap();
  for (const id of ['havuc','kabak']){
    const r=o.locator('[data-rende="'+id+'"]');
    const ilk=await konum(r,.50,.34), son=await konum(r,.50,.66);
    await parmak(page,[ilk,son,ilk,son]);
    await sonucArtisiniBekle(page,id,3);
  }
  await asama(page,'harc');
  for (let i=0;i<6;i++){
    const kaynak=o.locator('[data-ekle="'+i+'"]');
    if (i===0) {
      await tasi(page,kaynak,o.locator('.mv-harc-kase'),.5,.4,true);
      expect((await kayit(page)).harc).toBe(0);
    }
    if(i===2)await kaynak.tap();
    else await tasi(page,kaynak,o.locator('.mv-harc-kase'));
    await sonucArtisiniBekle(page,'harc',i+1);
    if(i===3)await kare('02-yumurta');
  }
  await asama(page,'harman');
  await kare('03-harman');
  const b=o.locator('[data-karistir]');
  const tur:Konum[]=[];
  for(let i=0;i<=26;i++){
    const aci=i*Math.PI/4;
    tur.push(await konum(b,.5+Math.cos(aci)*.21,.5+Math.sin(aci)*.24));
  }
  await parmak(page,tur);
  await asama(page,'tepsi');
  const kepce=o.locator('[data-pay="harc"]'),tepsi=o.locator('[data-pay="tepsi"]');
  await tepsi.tap();
  expect((await kayit(page)).yerler).toHaveLength(0);
  await tasi(page,kepce,tepsi,.24,.52);
  await expect.poll(async()=>(await kayit(page)).yerler.length).toBe(1);
  await kepce.tap();
  await page.reload();
  await asama(page,'tepsi');
  expect((await kayit(page)).kasikDolu).toBe(true);
  await tepsi.tap({position:{x:(await tepsi.boundingBox())!.width*.51,y:(await tepsi.boundingBox())!.height*.52}});
  await expect.poll(async()=>(await kayit(page)).yerler.length).toBe(2);
  await kare('04-pay');
  await tasi(page,kepce,tepsi,.79,.50);
  await asama(page,'firina');
  await kare('05-firin');
  await tasi(page,o.locator('[data-firina]'),o.locator('[data-raf]'));
  await asama(page,'pisiyor');
  await kare('06-pisiyor');
  await page.reload();
  await asama(page,'cikar');
  await kare('07-cikar');
  await tasi(page,o.locator('[data-cikar]'),o.locator('.mv-firindaki'));
  await asama(page,'servis');
  const tabak=o.locator('[data-tabaga]');
  await tasi(page,o.locator('[data-parca="2"]'),tabak);
  await expect.poll(async()=>(await kayit(page)).sunulan.length).toBe(1);
  await o.locator('[data-parca="0"]').tap();
  await page.reload();
  await asama(page,'servis');
  expect((await kayit(page)).spatulada).toBe(0);
  await tabak.tap();
  await expect.poll(async()=>(await kayit(page)).sunulan.length).toBe(2);
  await kare('08-servis');
  await tasi(page,o.locator('[data-parca="1"]'),tabak);
  await asama(page,'susle');
  await o.locator('[data-sus="yogurt"]').tap();
  await tasi(page,o.locator('[data-sus="limon"]'),o.locator('.mv-son-tabak'));
  await o.locator('[data-teslim]').tap();
  await asama(page,'son');
  await kare('09-sunum');
  const kaydedilen=await kayit(page);
  expect(kaydedilen).toMatchObject({sus:'limon',servis:1,sunulan:[2,0,1]});
  expect(kaydedilen.damga).toMatch(/^data:image\/webp;base64,/);
  await page.reload();
  await asama(page,'son');
  await o.locator('.mv-ileri').tap();
  await page.getByRole('button',{name:'Hazırladığım tabaklar',exact:true}).tap();
  const sonTabak=page.getByRole('dialog').getByRole('button',{name:'Fırın Mücver',exact:true});
  await expect(sonTabak).toHaveCount(1);
  await expect(sonTabak.locator('img')).toHaveAttribute('src',kaydedilen.damga);
  await kare('10-album');
  await page.getByRole('button',{name:'Tabak defterini kapat',exact:true}).tap();
  await basla(page);
  expect((await kayit(page)).servis).toBe(1);
  expect(hatalar).toEqual([]);
});

test('Fırın Mücver klavyeyle tamamlanır, geri dönüşte kalan rende hareketi korunur',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat',exact:true}).press('Enter');
  await kart(page).press('Enter');
  const o=oyun(page);
  await o.locator('[data-rende="kabak"]').press('Space');
  await page.keyboard.press('Escape');
  await expect(kart(page)).toBeVisible();
  await kart(page).press('Enter');
  await asama(page,'rende');
  for(let i=0;i<2;i++)await o.locator('[data-rende="kabak"]').press('Enter');
  for(let i=0;i<3;i++)await o.locator('[data-rende="havuc"]').press('Space');
  for(let i=0;i<6;i++){await o.locator('[data-ekle="'+i+'"]').press('Enter');await sonucArtisiniBekle(page,'harc',i+1);}
  for(let i=0;i<3;i++)await o.locator('[data-karistir]').press('Enter');
  for(let i=0;i<3;i++){
    await o.locator('[data-pay="harc"]').press('Enter');await o.locator('[data-pay="tepsi"]').press('Space');
    await expect.poll(async()=>(await kayit(page)).yerler.length).toBe(i+1);
  }
  await o.locator('[data-firina]').press('Enter');
  await o.locator('[data-cikar]').press('Space');
  for(let i=0;i<3;i++){
    await o.locator('[data-parca="'+i+'"]').press('Space');await o.locator('[data-tabaga]').press('Enter');
    await expect.poll(async()=>(await kayit(page)).sunulan.length).toBe(i+1);
  }
  await o.locator('[data-sus="dereotu"]').press('Enter');
  await o.locator('[data-teslim]').press('Enter');
  await asama(page,'son');
  expect((await kayit(page)).sus).toBe('dereotu');
});

test('Kabak bezinden çıkan su tutulur ve erken aktarılan sulu harç çıtır siparişin puanını etkiler', async ({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true}));
    localStorage.setItem('minkino-sef-mucver-v1',JSON.stringify({aktif:true,siparis:1,kabak:3,havuc:3,harc:0}));
    localStorage.setItem('minkino-sef-acik-atolye','mucver');
  });
  await page.reload();await asama(page,'harc');
  const bez=oyun(page).getByRole('button',{name:'Kabağın suyunu sık'});
  const cdp = await page.context().newCDPSession(page);
  try{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await konum(bez)]});
    await page.waitForFunction(()=>Number(document.querySelector<HTMLElement>('.mv-sik')?.dataset.sikma)>13);
    if(process.env.MUCVER_SU_KARE)await page.screenshot({path:process.env.MUCVER_SU_KARE});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  } finally { await cdp.detach(); }
  const sikma=(await kayit(page)).sikma;
  expect(sikma).toBeGreaterThan(10);
  await page.reload();await asama(page,'harc');
  await expect(bez).toHaveAttribute('data-sikma',String(sikma));
  await oyun(page).locator('[data-ekle="0"]').tap();
  await sonucArtisiniBekle(page,'harc',1);
  await page.setViewportSize({width:568,height:320});
  for (const su of [0,100]) {
    await page.evaluate(sikma=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-mucver-v1')!);
      Object.assign(k,{aktif:true,harc:6,tur:3,siparis:1,sikma,yerler:[{x:25,y:50},{x:50,y:50},{x:75,y:50}],bitis:1,cikti:true,kizarma:1,sunulan:[0,1,2],sus:'dereotu',damga:undefined});
      localStorage.setItem('minkino-sef-mucver-v1',JSON.stringify(k));localStorage.setItem('minkino-sef-acik-atolye','mucver');
    },su);
    await page.reload();await asama(page,'susle');
    await oyun(page).locator('[data-teslim]').tap();await asama(page,'son');
    const son=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
    expect(son).toMatchObject({puan:su===0?2:3,tercih:{sikma:su}});
  }
});
