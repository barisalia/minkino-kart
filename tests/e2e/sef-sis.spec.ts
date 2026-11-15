import { test, expect, type Page, type Locator } from '@playwright/test';
import { hataTopla } from './yardimci';

const sayfa = (p: Page) => p.locator('.sis-oyunu');
const kart = (p: Page) => p.getByRole('button', { name: 'Renkli Şişler siparişi', exact: true });
const buton = (p: Page, name: string) => sayfa(p).getByRole('button', { name, exact: true });
const kayit = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('minkino-sef-sis-v1') ?? 'null'));
async function asama(p: Page, durak: string) {
  await expect(sayfa(p)).toHaveAttribute('data-sis-asama', durak);
  await expect.poll(() => sayfa(p).locator('img:visible').evaluateAll(imgs =>
    imgs.every(i => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0))).toBe(true);
}
type Nokta = {x:number;y:number};
async function yer(el: Locator, x=.5, y=.5) {
  const b = await el.boundingBox();
  if (!b) throw new Error('Etkileşim alanı bulunamadı.');
  return {x:b.x+b.width*x,y:b.y+b.height*y};
}
async function kaydir(p: Page, a: Nokta, b: Nokta, iptal=false, adimlar=16) {
  const c = await p.context().newCDPSession(p);
  try {
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});
    for(let i=1;i<=adimlar;i++){
      const ilerleme=i/adimlar;
      await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*ilerleme,y:a.y+(b.y-a.y)*ilerleme}]});
    }
    await c.send('Input.dispatchTouchEvent',{type:iptal?'touchCancel':'touchEnd',touchPoints:[]});
  } finally { await c.detach(); }
}
async function siyiAc(p: Page) {
  await p.goto('./?test=1&yassor=1');
  await p.getByRole('button',{name:'5 yaş',exact:true}).click();
  await p.getByRole('button',{name:'Oyunlar',exact:true}).click();
  await p.getByRole('button',{name:'Minik Şef',exact:true}).click();
  await expect(p).toHaveTitle('Minik Şef');
  await p.getByRole('button',{name:'Sesi kapat',exact:true}).click();
  await kart(p).click();
  await asama(p,'islat');
}
test('Şişler gerçek menüden hazırlanır, çevrilir, soslanır ve çocuğun tabağı deftere eklenir', async ({ page },info) => {
  test.slow();
  await page.setViewportSize(info.project.name==='tablet'?{width:1024,height:768}:{width:844,height:390});
  const hatalar=hataTopla(page);
  await siyiAc(page);
  await kaydir(page,await yer(buton(page,'Tahta çubuğu suya bırak')),await yer(sayfa(page).locator('.sk-su')));
  const islanmis=buton(page,'Islanan çubuğu tezgâha al');
  await expect(islanmis).toBeEnabled();
  await kaydir(page,await yer(islanmis),await yer(sayfa(page).locator('.sk-kuru-yer')));
  await asama(page,'diz');
  const tahta=sayfa(page).locator('.sk-tut');
  await kaydir(page,await yer(buton(page,'Mısır geçir')),await yer(tahta));
  await kaydir(page,await yer(buton(page,'Biber geçir')),await yer(tahta),true);
  expect((await kayit(page)).lokmalar).toEqual(['misir']);
  await expect(sayfa(page).locator('.sk-fis-goz[data-uyum=eksik]')).toHaveCount(1);
  await buton(page,'Son malzemeyi çıkar').tap();
  expect((await kayit(page)).lokmalar).toEqual([]);
  for(const a of ['Biber','Kabak']) await kaydir(page, await yer(buton(page,a+' geçir')),await yer(tahta));
  await page.reload();
  await asama(page,'diz');
  expect((await kayit(page)).dizilen).toBe(2);
  for(const a of ['Mantar','Mısır']) await kaydir(page,await yer(buton(page,a+' geçir')),await yer(tahta));
  await buton(page,'Izgaraya git').tap();
  await asama(page,'izgara');
  await kaydir(page,await yer(buton(page,'Şişi ızgaraya taşı')),await yer(sayfa(page).locator('.sk-mangal-hedef')));
  const don=buton(page,'Şişi çevir');
  await expect(don).toHaveAttribute('data-kivam','tam');
  await kaydir(page,await yer(don,.48,.25),await yer(don,.48,.84));
  const al=buton(page,'Maşayla şişi tabağa al');
  await expect(don).toHaveAttribute('data-kivam','tam');
  await expect(al).toBeEnabled();
  await kaydir(page,await yer(al),await yer(sayfa(page).locator('.sk-mangal-sis')));
  await asama(page,'sos');
  await buton(page,'Fesleğen sosunu seç').tap();
  const firca=buton(page,'Sosu şişin üzerine sür');
  await kaydir(page,await yer(firca,.21,.5),await yer(firca,.73,.5),false,1);
  expect((await kayit(page)).kaplama).toBe(15);
  await expect(firca.locator('.sk-dilim[src*="pismis-feslegen"]')).toHaveCount(4);
  await buton(page,'Servis tabağı seç').tap();
  await asama(page,'servis');
  await buton(page,'Nane tabak seç').tap();
  await buton(page,'Siparişi sun').tap();
  await asama(page,'son');
  expect((await kayit(page)).servis).toBe(1);
  await expect(sayfa(page).locator('.sk-odul')).toHaveAttribute('data-puan','3');
  await page.reload();await asama(page,'son');
  expect((await kayit(page)).servis).toBe(1);
  await buton(page,'Yeni sipariş seç').tap();
  await page.getByRole('button',{name:'Hazırladığım tabaklar',exact:true}).tap();
  const yemek=page.getByRole('dialog').getByRole('button',{name:'Renkli Şişler',exact:true});
  await expect(yemek).toHaveCount(1);
  await expect(yemek.locator('img')).toHaveAttribute('src',/^data:image\/webp;base64,/);
  await expect.poll(()=>yemek.locator('img').evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(420);
  await page.getByRole('button',{name:'Tabak defterini kapat',exact:true}).tap();
  await kart(page).tap();await asama(page,'islat');
  expect((await kayit(page)).tur).toBe(1);
  await page.keyboard.press('Escape');
  await expect(kart(page)).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Şişler klavye ile pişer; seçimi değiştirmek yalnız sosu sıfırlar',async({page})=>{
  test.slow();
  await page.setViewportSize({width:740,height:360});
  await siyiAc(page);
  await buton(page,'Tahta çubuğu suya bırak').press('Enter');
  await expect(buton(page,'Islanan çubuğu tezgâha al')).toBeEnabled();
  await buton(page,'Islanan çubuğu tezgâha al').press('Space');
  for(const ad of ['Biber','Kabak','Mantar','Mısır']) await buton(page,ad+' geçir').press('Enter');
  await buton(page,'Izgaraya git').press('Enter');
  await buton(page,'Şişi ızgaraya taşı').press('Enter');
  await expect(buton(page,'Şişi çevir')).toBeEnabled();
  await buton(page,'Şişi çevir').press('Space');
  await expect(buton(page,'Maşayla şişi tabağa al')).toBeEnabled();
  await buton(page,'Maşayla şişi tabağa al').press('Enter');
  await buton(page,'Yoğurt sosunu seç').press('Enter');
  await buton(page,'Sosu şişin üzerine sür').press('Enter');
  expect((await kayit(page)).kaplama).toBe(1);
  await buton(page,'Domates sosunu seç').press('Enter');
  expect((await kayit(page)).kaplama).toBe(0);
  await page.keyboard.press('Escape');
  await expect(kart(page)).toBeVisible();
  await kart(page).press('Space');
  await asama(page,'sos');
  for(let i=0;i<4;i++) await buton(page,'Sosu şişin üzerine sür').press('Enter');
  await buton(page,'Servis tabağı seç').press('Space');
  await buton(page,'Sarı tabak seç').press('Space');
  await buton(page,'Renkli şişi servis et').press('Enter');
  await asama(page,'son');
  expect((await kayit(page)).tabak).toBe('tabak-sari');
  await expect(sayfa(page).locator('.sk-odul')).toHaveAttribute('data-puan','2');
});
test('Eksik ve farklı şişi çocuğun kendi tabağı olarak saklar',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-sis-v1',JSON.stringify({
      aktif:false,servis:0,tur:0,suyaGirdi:true,durak:'diz',dizilen:2,
      ateste:false,cevrildi:false,kaplama:0,
    }));
  });
  await kart(page).click();await asama(page,'diz');
  expect((await kayit(page)).lokmalar).toEqual(['biber','kabak']);
  await buton(page,'Son malzemeyi çıkar').tap();
  await buton(page,'Son malzemeyi çıkar').tap();
  await buton(page,'Ananas geçir').tap();
  await buton(page,'Izgaraya git').tap();
  await buton(page,'Şişi ızgaraya taşı').tap();
  await expect(buton(page,'Şişi çevir')).toBeEnabled();
  await buton(page,'Şişi çevir').tap();
  await expect(buton(page,'Maşayla şişi tabağa al')).toBeEnabled();
  await buton(page,'Maşayla şişi tabağa al').tap();
  await buton(page,'Yoğurt sosunu seç').tap();
  await buton(page,'Sosu şişin üzerine sür').press('Enter');
  await buton(page,'Servis tabağı seç').tap();
  await buton(page,'Sosu değiştir').tap();await asama(page,'sos');
  await buton(page,'Fesleğen sosunu seç').tap();
  await buton(page,'Sosu şişin üzerine sür').press('Enter');
  await buton(page,'Servis tabağı seç').tap();
  await page.reload();await asama(page,'servis');
  await expect(sayfa(page).locator('.sk-fis-goz[data-uyum=eksik]')).toHaveCount(4);
  await expect(sayfa(page).locator('.sk-fis-sos[data-uyum=dogru]')).toHaveCount(1);
  await expect(sayfa(page).locator('.sk-dilim')).toHaveCount(1);
  await expect(sayfa(page).locator('.sk-dilim')).toHaveAttribute('src',/ananas-pismis-feslegen/);
  await buton(page,'Krem tabak seç').tap();
  await buton(page,'Siparişi sun').tap();await asama(page,'son');
  await expect(sayfa(page).locator('.sk-odul')).toHaveAttribute('data-puan','1');
  await expect(sayfa(page).locator('.sk-odul i[data-dolu=false]')).toHaveCount(2);
  expect((await kayit(page)).lokmalar).toEqual(['ananas']);
  const sonuc=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
  expect(sonuc.puan).toBe(1);
  expect(sonuc.resim).toMatch(/^data:image\/webp;base64,/);
});

test('Çubuktaki lokmalar yer değiştirebilir; değiştirilen sıra yenilemede korunur',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');await page.evaluate(()=>localStorage.setItem('minkino-sef-sis-v1',JSON.stringify({
    aktif:false,servis:0,tur:0,suyaGirdi:true,durak:'diz',lokmalar:['biber','misir','kabak','mantar'],
  })));
  await kart(page).tap();await asama(page,'diz');
  const misir=buton(page,'Mısır parçasını şişten çıkar');
  await misir.press('ArrowRight');
  const yer=await misir.boundingBox(),son=await buton(page,'Mantar parçasını şişten çıkar').boundingBox();
  if(!yer||!son)throw new Error('Şişteki tutma noktaları görünmüyor');
  const y=yer.y+yer.height/2;
  await page.mouse.move(yer.x+yer.width/2,y);await page.mouse.down();
  await page.mouse.move(son.x+son.width/2,y,{steps:8});await page.mouse.up();
  expect((await kayit(page)).lokmalar).toEqual(['biber','kabak','mantar','misir']);
  await page.reload();await asama(page,'diz');
  await expect(sayfa(page).locator('.sk-fis-goz[data-uyum=dogru]')).toHaveCount(4);
});
test('İki yüzde etkin süre, erken dönüp geri pişirme ve kapalı sekmede bekleme',async({page})=>{
  test.setTimeout(85000);
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/');
  await page.evaluate(()=>{
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true}));
    localStorage.setItem('minkino-sef-sis-v1',JSON.stringify({aktif:true,durak:'izgara',suyaGirdi:true,dizilen:4,ateste:true,cevrildi:false,isinma:[0,0],alt:0}));
  });
  await kart(page).tap();
  const sise=buton(page,'Şişi çevir'),masa=buton(page,'Maşayla şişi tabağa al');
  await expect(sise).toHaveAttribute('data-kivam','az');
  await sise.tap();
  await expect(sise).toHaveAttribute('data-yuz','1');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:true}})));
  const once=(await kayit(page)).isinma;
  await page.waitForTimeout(2200);
  expect((await kayit(page)).isinma).toEqual(once);
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:false}})));
  await expect(sise).toHaveAttribute('data-kivam','tam',{timeout:5000});
  await masa.tap();await asama(page,'sos');
  await buton(page,'Az pişen yüzü tekrar ızgaraya koy').tap();
  await expect(sise).toHaveAttribute('data-yuz','0');
  await expect(sise).toHaveAttribute('data-kivam','tam',{timeout:5000});
  await expect(sise).toHaveAttribute('data-kivam','kavruk',{timeout:11000});
  if(process.env.SEF_SIS_ISI)await page.screenshot({path:process.env.SEF_SIS_ISI});
  await masa.tap();await asama(page,'sos');
  await buton(page,'Fesleğen sosunu seç').tap();const hedef=buton(page,'Sosu şişin üzerine sür');
  await kaydir(page,await yer(hedef,.21,.5),await yer(hedef,.74,.5));
  await buton(page,'Servis tabağı seç').tap();await buton(page,'Nane tabak seç').tap();
  await buton(page,'Renkli şişi servis et').tap();await asama(page,'son');
  const servis=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).gecmis.at(-1));
  expect(servis).toMatchObject({puan:2,istekPuani:3,pisirmePuani:2,tercih:{yuzler:['kavruk','tam']}});
});
