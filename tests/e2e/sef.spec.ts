import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';
import type { Defter } from '../../sef/src/kayit';
import { TARIFLER, KESIM_HEDEFI, KARISTIRMA_HEDEFI, type TarifId } from '../../sef/src/tarif';

type Nokta = { x: number; y: number };

async function merkez(el: Locator): Promise<Nokta> {
  await expect(el).toBeVisible();
  const rect = await el.boundingBox();
  if (!rect) throw new Error('Dokunulacak nesne görünmüyor');
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

// Parmakla oynanışı tarayıcının dokunma ve pointer olayları üzerinden sınar.
async function parmak(page: Page, noktalar: Nokta[], iptal = false) {
  const cihaz = await page.context().newCDPSession(page);
  try {
    await cihaz.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [noktalar[0]] });
    for (const nokta of noktalar.slice(1)) {
      await cihaz.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [nokta] });
    }
    await cihaz.send('Input.dispatchTouchEvent', { type: iptal ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  } finally {
    await cihaz.detach();
  }
}

function duzYol(bas: Nokta, son: Nokta): Nokta[] {
  return Array.from({ length: 9 }, (_, i) => ({
    x: bas.x + (son.x - bas.x) * i / 8,
    y: bas.y + (son.y - bas.y) * i / 8,
  }));
}

async function tasi(page: Page, kaynak: Locator, hedef: Locator, iptal = false) {
  await parmak(page, duzYol(await merkez(kaynak), await merkez(hedef)), iptal);
}

async function defter(page: Page): Promise<Defter> {
  return page.evaluate(() => JSON.parse(localStorage.getItem('minkino-sef-v1') ?? 'null'));
}

async function resimleriDogrula(page: Page) {
  const resimler = page.locator('#sef img:visible');
  await expect(resimler.first()).toBeVisible();
  await expect.poll(() => resimler.evaluateAll(liste => liste.every(e => {
    const resim = e as HTMLImageElement;
    return resim.complete && resim.naturalWidth > 0;
  }))).toBe(true);
}

async function ekranda(page: Page, ad: string) {
  await expect(page.locator('.mutfak-sahnesi')).toHaveAttribute('data-ekran', ad);
  await resimleriDogrula(page);
}

async function istasyonAc(page: Page, ad: string) {
  await page.locator(`[data-istasyon="${ad}"]`).tap();
  await ekranda(page, ad);
}

async function geri(page: Page) {
  await page.getByRole('button', { name: 'Geri', exact: true }).tap();
}

async function karistirmaTuru(page: Page) {
  const alan = await page.locator('.karistirma').boundingBox();
  if (!alan) throw new Error('Kaşığa erişilemedi');
  const merkezNokta = await merkez(page.locator('.kap-alani'));
  const noktalar = Array.from({ length: 15 }, (_, i) => {
    const aci = i * Math.PI * 2 / 14;
    return {
      x: merkezNokta.x + Math.cos(aci) * alan.width * .24,
      y: merkezNokta.y + Math.sin(aci) * alan.height * .24,
    };
  });
  await parmak(page, noktalar);
}

test.beforeEach(async ({ page }, info) => {
  // Ortak geliştirme sunucusunda başka oyunların sıcak yenilemesi parmak
  // hareketinin ortasında sayfayı değiştirmesin. Derleme testinde HMR yoktur.
  if (new URL(info.project.use.baseURL!).port === '5173') {
    await page.routeWebSocket(url => url.port === '5173', () => {});
  }
  const viewport=info.project.use.viewport;
  if(viewport)await page.setViewportSize({width:Math.max(viewport.width,viewport.height),height:Math.min(viewport.width,viewport.height)});
});

for (const id of ['corba', 'salata'] as const) {
  test(`${TARIFLER[id].ad} parmakla hazırlanıp servis edilir`, async ({ page }) => {
    const hatalar = hataTopla(page);
    const tarif = TARIFLER[id];
    await page.goto('./sef/');
    await ekranda(page, 'siparis');
    await page.getByRole('button', { name: 'Sesi kapat' }).tap();
    await page.locator(`[data-tarif="${id}"].siparis-karti`).tap();
    await ekranda(page, 'mutfak');
    // Erken servis açılamaz. Diğer kaba bakınca çocuğun siparişi korunur.
    await expect(page.locator('[data-istasyon="servis"]')).toHaveCount(0);
    await istasyonAc(page, id === 'corba' ? 'kase' : 'ocak');
    await expect(page.locator('[data-sun]')).toHaveCount(0);
    await page.locator('[data-git="dolap"]').tap();
    await ekranda(page, 'dolap');
    const sebze = (ad: string) => page.locator(`[data-sebze="${ad}"]`);
    const sepet = page.locator('.sepet');
    const yanlis = sebze(id === 'corba' ? 'marul' : 'patates');
    await tasi(page, yanlis, sepet);
    await expect(yanlis).toHaveCount(0);
    await page.locator('.sepette-sebze').tap();
    await expect(yanlis).toBeVisible();
    expect((await defter(page)).siparisler[id]?.alinan).toEqual([]);
    const malzemeler = tarif.malzemeler;
    await tasi(page, sebze(malzemeler[0]), sepet, true);
    await expect(page.locator('.tasinan')).toHaveCount(0);
    await expect(sebze(malzemeler[0])).toBeVisible();
    for (const malzeme of malzemeler) {
      await tasi(page, sebze(malzeme), sepet);
      await expect(sebze(malzeme)).toHaveCount(0);
    }
    await expect(page.locator('.sepet-ic img')).toHaveCount(3);
    await page.locator('[data-git="tahta"]').tap();
    await ekranda(page, 'tahta');
    for (const malzeme of malzemeler) {
      await page.locator(`button[data-malzeme="${malzeme}"]`).tap();
      const hedef = page.locator(`[data-kes="${malzeme}"]`);
      for (let i = 1; i <= KESIM_HEDEFI; i++) {
        await expect(page.locator('.kesiyor')).toHaveCount(0);
        const uclar = hedef.locator('.kesim-hedef circle');
        const bas = await merkez(uclar.first()), son = await merkez(uclar.last());
        if (i === 1) {
          await hedef.tap();
          const r = (await hedef.boundingBox())!;
          await parmak(page, duzYol({ x: r.x + 4, y: r.y + 4 }, { x: r.x + 4, y: r.y + r.height - 4 }));
          expect((await defter(page)).siparisler[id]?.kesimler[malzeme]).toBe(0);
        }
        await parmak(page, i === 1 ? duzYol(bas, son) : duzYol(son, bas));
        await expect.poll(async () => (await defter(page)).siparisler[id]?.kesimler[malzeme]).toBe(i);
        if (i === 1 && malzeme === malzemeler[0]) {
          await page.reload();
          await ekranda(page, 'tahta');
          await expect(page.getByRole('button', { name: 'Sesi aç' })).toBeVisible();
          expect((await defter(page)).siparisler[id]?.kesimler[malzeme]).toBe(1);
        }
      }
      await tasi(page, page.locator(`[data-topla="${malzeme}"]`), page.locator('.dograma-tabagi'));
      await expect(page.locator('[data-topla]')).toHaveCount(0);
    }
    await page.locator(`[data-git="${tarif.istasyon}"]`).tap();
    await ekranda(page, tarif.istasyon);
    for (const malzeme of malzemeler) {
      const parcalar = page.locator(`[data-aktar="${malzeme}"]`);
      await tasi(page, parcalar, page.locator('.kap-alani'));
      await expect(parcalar).toHaveCount(0);
    }
    for (let i = 1; i <= KARISTIRMA_HEDEFI; i++) {
      await karistirmaTuru(page);
      await expect.poll(async () => (await defter(page)).siparisler[id]?.karistirma).toBe(i);
    }
    const kaynak = page.locator('[data-porsiyon-al]');
    const kucukKase = page.locator('[data-porsiyon-birak]');
    await expect(kaynak).toBeVisible();
    await kucukKase.tap();
    expect((await defter(page)).porsiyonlar[id]?.adet ?? 0).toBe(0);
    await tasi(page, kaynak, kucukKase);
    await expect.poll(async () => (await defter(page)).porsiyonlar[id]?.adet).toBe(1);
    if(id==='salata'){
      const alinan=await kucukKase.locator('.sef-kap-parcasi').count();
      expect([7,8]).toContain(alinan);
      await expect(page.locator('.kap-alani .sef-kap-parcasi:visible')).toHaveCount(15-alinan);
    }
    await kaynak.tap();
    await expect.poll(async () => (await defter(page)).porsiyonlar[id]?.yuklu).toBe(true);
    await expect(page.locator('.kap-alani .sef-kap-parcasi:visible')).toHaveCount(0);
    await page.reload();
    await ekranda(page, tarif.istasyon);
    await expect(page.locator('.kap-alani .sef-kap-parcasi:visible')).toHaveCount(0);
    await kucukKase.tap();
    await expect.poll(async () => (await defter(page)).porsiyonlar[id]?.adet).toBe(2);
    await page.locator('[data-git="servis"]').tap();
    await ekranda(page, 'servis');
    if(id==='salata')await expect(page.locator('[data-sun] .sef-kap-parcasi')).toHaveCount(15);
    await sunumuTamamla(page, id);
    await expect.poll(async () => (await defter(page)).tabaklar[id]).toBe(1);
    await page.reload();
    await ekranda(page, 'servis');
    await expect(page.locator('[data-sun] '+(id==='salata'?'.salata-sos-katmani':'.yemek-susu'))).toBeVisible();
    expect((await defter(page)).tabaklar[id]).toBe(1);
    await page.locator('[data-git="siparis"]').tap();
    await ekranda(page, 'siparis');
    await page.getByRole('button', { name: 'Hazırladığım tabaklar' }).tap();
    await expect(page.locator('.defter-tabagi '+(id==='salata'?'.salata-sos-katmani':'.yemek-susu'))).toBeVisible();
    const son = await defter(page);
    expect(son.gecmis).toHaveLength(1);
    expect(son.gecmis[0]).toMatchObject({tarifId:id,sus:son.susler[id]});
    if(id==='salata'){
      await expect(page.locator('.defter-tabagi .sef-kap-parcasi')).toHaveCount(15);
      expect(son.gecmis[0]).toMatchObject({salata:{kesitler:son.siparisler.salata?.kesitler}});
    }
    expect(hatalar).toEqual([]);
  });
}

async function sunumuTamamla(page: Page, id: TarifId) {
  await expect(page.locator('[data-zil]')).toHaveCount(0);
  const yemek = page.locator(`[data-sun="${id}"] .yemek-cizimi`);
  const alan = await yemek.boundingBox();
  if (!alan) throw new Error('Servis tabağı görünmüyor');
  const bitis = { x: alan.x + alan.width * .64, y: alan.y + alan.height * .32 };
  const secim=id==='salata'?'limon':'kruton';
  const sus = page.locator('[data-sus="'+secim+'"]');
  await parmak(page, duzYol(await merkez(sus), bitis));
  await expect(page.locator('[data-zil]')).toBeVisible();
  const yer = (await defter(page)).susler[id];
  expect(yer?.id).toBe(secim);
  expect(yer?.x).toBeGreaterThan(.6);
  await page.locator('[data-zil]').tap();
}

test('iki tarif arasında geçişte ilk sepet ve doğru seçilen sebzeler korunur', async ({ page }) => {
  await page.goto('./sef/?test=1');
  await page.locator('button[data-tarif="corba"]').tap();
  await istasyonAc(page, 'dolap');
  await page.locator('[data-sebze="havuc"]').tap();
  await expect(page.locator('.sepet-ic img')).toHaveCount(1);
  await geri(page);
  await geri(page);
  await page.locator('button[data-tarif="salata"]').tap();
  await istasyonAc(page, 'dolap');
  await page.locator('[data-sebze="marul"]').tap();
  await expect(page.locator('.sepet-ic img')).toHaveCount(1);
  await geri(page);
  await geri(page);
  await page.locator('button[data-tarif="corba"]').tap();
  await istasyonAc(page, 'dolap');
  await expect(page.locator('[data-sebze="havuc"]')).toHaveCount(0);
  await expect(page.locator('[data-sebze="marul"]')).toBeVisible();
  const kayit = await defter(page);
  expect(kayit.siparisler.corba?.alinan).toEqual(['havuc']);
  expect(kayit.siparisler.salata?.alinan).toEqual(['marul']);
});

test('serbest çorbanın sepeti ve masanın pürüzsüz çorbası birbirinden bağımsız kalır',async({page})=>{
  await page.goto('./sef/?test=1');
  await page.locator('button[data-tarif=corba]').tap();await istasyonAc(page,'dolap');
  await page.locator('[data-sebze=havuc]').tap();await geri(page);await geri(page);
  await page.getByRole('button',{name:'Müşteri masası',exact:true}).tap();
  await page.locator('[data-menu=corba-sofrasi]').tap();await page.locator('[data-parca=corba]').tap();
  await expect(page.locator('.fis-kivam')).toHaveAttribute('data-istenen-kivam','puruzsuz');
  await istasyonAc(page,'dolap');await expect(page.locator('.sepette-sebze')).toHaveCount(0);
  await page.locator('[data-sebze=patates]').tap();await page.reload();
  await geri(page);await geri(page);
  await page.getByRole('button',{name:'Geri',exact:true}).tap();
  await page.getByRole('button',{name:'Geri',exact:true}).tap();
  await page.locator('button[data-tarif=corba]').tap();
  await expect(page.locator('.fis-kivam')).toHaveAttribute('data-istenen-kivam','taneli');
  await istasyonAc(page,'dolap');await expect(page.getByRole('button',{name:'Havuç rafa geri koy'})).toBeVisible();
  await expect(page.locator('[data-sebze=patates]')).toBeVisible();
  expect((await defter(page)).sakliTezgahlar['corba/corba-sofrasi'].siparis.alinan).toEqual(['patates']);
});

test('fişteki salatalık yerine havuç seçilirse kesimler, maşa, tabak ve müşteri aynı seçimi görür',async({page})=>{
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.locator('button[data-tarif=salata]').tap();await istasyonAc(page,'dolap');
  const secim=['havuc','marul','domates'];
  for(const id of secim)await page.locator('[data-sebze="'+id+'"]').tap();
  await page.locator('[data-sebze=patates]').tap();
  expect((await defter(page)).siparisler.salata?.alinan).toEqual(secim);
  await page.locator('[data-git=tahta]').tap();
  for(const id of secim){
    await page.locator('button[data-malzeme="'+id+'"]').tap();
    for(let n=1;n<=4;n++){
      await expect(page.locator('.kesiyor')).toHaveCount(0);
      await page.locator('[data-kes="'+id+'"]').press('Enter');
      await expect.poll(async()=>(await defter(page)).siparisler.salata?.kesimler[id as 'havuc'|'marul'|'domates']).toBe(n);
    }
    await page.getByRole('button',{name:'Parçaları tabağa al'}).tap();
  }
  await page.locator('[data-git=kase]').tap();
  for(const id of secim)await page.locator('[data-aktar="'+id+'"]').press('Enter');
  for(let i=0;i<3;i++)await page.locator('.karistirma').press('Enter');
  await page.locator('[data-porsiyon-al]').tap();
  expect(await page.locator('.masa-lokmalari img').evaluateAll(liste=>liste.map(e=>e.getAttribute('data-malzeme')))).toEqual(secim);
  await page.locator('[data-porsiyon-birak]').tap();await page.locator('[data-porsiyon-al]').tap();
  await page.locator('[data-porsiyon-birak]').tap();await page.locator('[data-git=servis]').tap();
  await page.locator('[data-sus=limon]').tap();await page.locator('[data-sun]').tap();await page.locator('[data-zil]').tap();
  await expect(page.locator('.servis-misafiri [data-puan="2"]')).toBeVisible();
  await expect(page.locator('.sunum [data-malzeme=havuc]')).toHaveCount(5);
  await expect(page.locator('.sunum [data-malzeme=salatalik]')).toHaveCount(0);
  await expect(page.locator('.sebze-tadim [aria-label="İstenen"] img')).toHaveAttribute('src',/salatalik/);
  await expect(page.locator('.sebze-tadim [aria-label="Sunulan"] img')).toHaveAttribute('src',/havuc/);
});

for(const ezme of ['tam','kismi'] as const){
  test('blender ve servis edilen çorba aynı kıvamı korur '+ezme,async({page})=>{
    await page.goto('./sef/?test=1');
    await page.evaluate(()=>{
      const secim=['domates','havuc','patates'];
      const corba={tarifId:'corba',alinan:secim,eskiHazir:[],kesimler:{domates:4,havuc:4,patates:4},aktarilan:secim,istenenKivam:'puruzsuz',karistirma:3,ezilen:[]};
      localStorage.setItem('minkino-sef-v1',JSON.stringify({secili:'corba',ekran:'ocak',sessiz:true,siparisler:{corba},ozelIstekler:{corba:'domates'}}));
    });await page.reload();
    const alet=page.locator('.corba-blender');
    const nokta=page.locator('[data-ez=havuc]');
    const dokunma=await nokta.boundingBox();expect(dokunma).toBeTruthy();
    const yer={x:dokunma!.x+dokunma!.width/2,y:dokunma!.y+dokunma!.height/2};
    const kap=await page.locator('.kap-alani').boundingBox();
    await parmak(page,duzYol(await merkez(alet),{x:kap!.x+2,y:kap!.y+2}));
    expect((await defter(page)).siparisler.corba?.ezilen).toEqual([]);
    await parmak(page,duzYol(await merkez(alet),yer),true);
    expect((await defter(page)).siparisler.corba?.ezilen).toEqual([]);
    await parmak(page,duzYol(await merkez(alet),yer));
    await expect(page.locator('.kap-alani [data-malzeme=havuc]')).toHaveCount(0);
    await page.reload();expect((await defter(page)).siparisler.corba?.ezilen).toEqual(['havuc']);
    if(ezme==='tam'){
      await alet.tap();await page.locator('[data-ez=patates]').press('Enter');
      await expect(page.locator('[data-ez=patates]')).toHaveCount(0);
      await page.locator('[data-ez=domates]').tap();await expect(alet).toHaveCount(0);
    }
    const kase=page.locator('[data-porsiyon-birak]');
    for(let i=0;i<2;i++)await tasi(page,page.locator('[data-porsiyon-al]'),kase);
    await expect(kase.locator('.corba-lokmasi')).toHaveCount(ezme==='tam'?0:2);
    await page.locator('[data-git=servis]').tap();await page.locator('[data-sus=domates]').tap();
    await page.locator('[data-sun]').tap();await page.locator('[data-zil]').tap();await page.reload();
    await expect(page.locator('.servis-misafiri .sef-yildizlar')).toHaveAttribute('data-puan',ezme==='tam'?'3':'2');
    await expect(page.locator('.sunum .corba-lokmasi')).toHaveCount(ezme==='tam'?0:2);
    expect((await defter(page)).gecmis.at(-1)).toMatchObject({corba:{istenenKivam:'puruzsuz',ezilen:ezme==='tam'?['havuc','patates','domates']:['havuc']}});
  });
}

test('sebzelere peş peşe dokunup hemen mutfağa dönmek sepeti korur', async ({ page }) => {
  await page.goto('./sef/');
  await page.locator('button[data-tarif="corba"]').tap();
  await istasyonAc(page, 'dolap');
  const hedefler = [];
  for (const id of TARIFLER.corba.malzemeler) {
    hedefler.push(await merkez(page.locator(`[data-sebze="${id}"]`)));
  }
  hedefler.push(await merkez(page.getByRole('button', { name: 'Geri', exact: true })));
  for (const yer of hedefler) await page.touchscreen.tap(yer.x, yer.y);
  await ekranda(page, 'mutfak');
  await istasyonAc(page, 'dolap');
  await expect(page.locator('.sepet-ic img')).toHaveCount(3);
  expect((await defter(page)).siparisler.corba?.alinan).toEqual(TARIFLER.corba.malzemeler);
});

test('azaltılmış harekette yalnız klavyeyle ilerlenir ve sayfaya dönüşte yarım iş sürer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./sef/');
  await ekranda(page, 'siparis');
  async function tabIleSec(hedef: Locator) {
    await expect(hedef).toBeVisible();
    for (let i = 0; i < 20; i++) {
      if (await hedef.evaluate(el => el === document.activeElement)) {
        await page.keyboard.press('Enter');
        return;
      }
      await page.keyboard.press('Tab');
    }
    throw new Error('Düğmeye Tab ile ulaşılamadı: ' + await hedef.getAttribute('aria-label'));
  }
  await tabIleSec(page.locator('button[data-tarif="salata"]'));
  await ekranda(page, 'mutfak');
  await tabIleSec(page.locator('[data-istasyon="dolap"]'));
  await tabIleSec(page.locator('[data-sebze="salatalik"]'));
  await tabIleSec(page.locator('[data-git="tahta"]'));
  await tabIleSec(page.locator('[data-kes="salatalik"]'));
  await expect.poll(async () => (await defter(page)).siparisler.salata?.kesimler.salatalik).toBe(1);
  // Gerçek pagehide ve tarayıcı geri dönüşünü kullanır.
  await page.goto('about:blank');
  await page.goBack();
  await ekranda(page, 'tahta');
  await tabIleSec(page.locator('[data-kes="salatalik"]'));
  await expect.poll(async () => (await defter(page)).siparisler.salata?.kesimler.salatalik).toBe(2);
  await page.keyboard.press('Escape');
  await ekranda(page, 'mutfak');
});

test('serbest yatay kesit yeniden açıldığında ve tabaktan kâseye taşındığında şeklini korur', async ({ page }) => {
  await page.goto('./sef/');
  await page.locator('button[data-tarif="salata"]').tap();
  await istasyonAc(page,'dolap');
  await page.locator('[data-sebze="domates"]').tap();
  await page.locator('[data-git="tahta"]').tap();
  const sebze = page.locator('.kesim-govde');
  const yatay = await sebze.evaluate(el => {
    const m = (el as unknown as SVGSVGElement).getScreenCTM();
    return [-12,652].map(x => {
      const p = new DOMPoint(x,350).matrixTransform(m!);
      return {x:p.x,y:p.y};
    });
  });
  const cihaz=await page.context().newCDPSession(page);
  await cihaz.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[yatay[0]]});
  await cihaz.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:(yatay[0].x+yatay[1].x)/2,y:yatay[0].y}]});
  await cihaz.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
  await cihaz.detach();
  expect((await defter(page)).siparisler.salata?.kesimler.domates).toBe(0);
  const orta={x:(yatay[0].x+yatay[1].x)/2,y:yatay[0].y};
  await parmak(page,duzYol(yatay[0],orta));
  await expect(page.locator('.kesim-alani')).toHaveAttribute('data-yarim','true');
  expect((await defter(page)).siparisler.salata?.kesimler.domates).toBe(0);
  await parmak(page,duzYol(orta,yatay[1]));
  await expect.poll(async ()=>(await defter(page)).siparisler.salata?.kesimler.domates).toBe(1);
  const kesit=(await defter(page)).siparisler.salata!.kesitler.domates![0];
  expect(Math.abs(kesit.a.y-kesit.b.y)).toBeLessThan(2);
  await page.reload();
  expect((await defter(page)).siparisler.salata!.kesitler.domates![0]).toEqual(kesit);
  const uclar=page.locator('.kesim-hedef circle');
  for(let i=1; i<KESIM_HEDEFI; i++) {
    await expect(page.locator('.kesiyor')).toHaveCount(0);
    await parmak(page,duzYol(await merkez(uclar.first()),await merkez(uclar.last())));
    await expect.poll(async()=>(await defter(page)).siparisler.salata?.kesimler.domates).toBe(i+1);
  }
  const topla=page.locator('[data-topla="domates"]');
  await expect(topla).toBeVisible();
  await page.reload();
  await expect(topla).toBeVisible();
  const maskeler=(yer:Locator) => yer.locator('.dogranmis-parca > image').evaluateAll(a=>a.map(el=>el.getAttribute('style')));
  const tahta=await maskeler(topla);
  expect(tahta).toHaveLength(KESIM_HEDEFI+1);
  await page.getByRole('button',{name:'Parçaları tabağa al'}).tap();
  await expect(topla).toHaveCount(0);
  expect(await maskeler(page.locator('.dograma-tabagi'))).toEqual(tahta);
  await geri(page);
  await istasyonAc(page,'kase');
  await tasi(page,page.locator('[data-aktar="domates"]'),page.locator('.kap-alani'));
  // Maşa lokmaları ters çevirir. Kâsedeki yüzlerin büyüklüğü ve açısı çocuğun
  // kaydedilen kesitinden hesaplanır; her dilim kâsede bir kez bulunmalı.
  const lokmalar=page.locator('.sef-kap .salata-lokmasi[data-malzeme="domates"]');
  const yuzler=()=>lokmalar.evaluateAll(liste=>liste.map(el=>[el.getAttribute('data-kesik'),(el as HTMLElement).style.width,(el as HTMLElement).style.rotate]));
  await expect(lokmalar).toHaveCount(tahta.length);
  const kasede=await yuzler();
  expect(kasede.map(y=>y[0])).toEqual(['0','1','2','3','4']);
  expect(new Set(kasede.map(y=>y[1])).size).toBeGreaterThan(1);
  await page.reload();
  expect(await yuzler()).toEqual(kasede);
  expect((await defter(page)).siparisler.salata?.kesitler.domates?.[0]).toEqual(kesit);
});
