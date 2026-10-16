/**
 * Tıkır Tıkır Lokanta · P5 mini oyunları tek başına (/restoran/mini.html?oyun=kir-cirp|kazan|rendele|pide;
 * ekip/senaryo/RESTORAN.md §12 P5 "bitti"): telefon iki yön (844×390 3-4, 390×844 5-6) + 932×430 + 667×375,
 * kabuk avı, un bulutu hapşırığı, köpük, Mino tadımı, taşma, domates rendesi, pencereli pide, fırın küreği, peynir
 * uzaması; dokunuştan ilk görüntüye ≤ 1 kare (performance ölçümü ≤ 32 ms), zoom yok, konsol hatası yok.
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 }, yas: 'kucuk' },
  { ad: 'dikey', viewport: { width: 390, height: 844 }, yas: 'buyuk' },
] as const;
const DIGER = [
  { ad: '932x430', viewport: { width: 932, height: 430 } },
  { ad: '667x375', viewport: { width: 667, height: 375 } },
] as const;

type Nokta = { x: number; y: number };
const agDisi = (h: string) => !h.includes('ERR_CONNECTION_RESET') && !h.includes('Failed to load resource');

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3) */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.getAnimations().length && !i.closest('.rs-p5-elde, .rs-mini-sonuc'))
      .map((i) => {
        const r = i.getBoundingClientRect();
        const fit = getComputedStyle(i).objectFit;
        const en = fit === 'contain' || fit === 'scale-down' ? Math.min(r.width, (r.height * i.naturalWidth) / i.naturalHeight) : r.width;
        return { src: i.src.split('/').pop(), en, dogal: i.naturalWidth };
      })
      .filter((x) => x.en * 3 > x.dogal * 1.02),
  );

const orta = async (page: Page, sec: string): Promise<Nokta> => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};
const dokun = async (page: Page, sec: string, bek = 120) => {
  const p = await orta(page, sec);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(bek);
};
const raf = (tur: string) => `.rs-p5-raf-oge[data-tur="${tur}"]`;
type Pencere = '__rsKirCirp' | '__rsKazan' | '__rsRendele' | '__rsPide';
const olaylar = (page: Page, ad: Pencere) => page.evaluate((a) => (window as unknown as Record<string, { olaylar: string[] }>)[a].olaylar.slice(), ad);
const durum = <T>(page: Page, ad: Pencere) => page.evaluate((a) => (window as unknown as Record<string, { durum(): unknown }>)[a].durum(), ad) as Promise<T>;
const merkez = <T>(page: Page, ad: Pencere) => page.evaluate((a) => (window as unknown as Record<string, { merkez(): unknown }>)[a].merkez(), ad) as Promise<T>;

/** Gecikme ölçer: her pointerdown'dan sonraki ilk karede (rAF) geçen süre ve o anki görüntü (seçici var mı) */
async function gecikmeKur(page: Page, secici: string) {
  await page.evaluate((s) => {
    const w = window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] };
    w.__gecikme = [];
    addEventListener(
      'pointerdown',
      (e) => {
        const t0 = e.timeStamp;
        requestAnimationFrame(() => w.__gecikme.push({ ms: performance.now() - t0, gorunur: !!document.querySelector(s) }));
      },
      { capture: true },
    );
  }, secici);
}
async function gecikmeDenetle(page: Page) {
  const g = await page.evaluate(() => (window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] }).__gecikme.filter((x) => x.gorunur));
  expect(g.length).toBeGreaterThan(0);
  expect(Math.max(...g.map((x) => x.ms)), JSON.stringify(g)).toBeLessThanOrEqual(32);
}
/** Daire çizer (merkez, yarıçap, tur, adım başına bekleme) */
async function daire(page: Page, c: Nokta, r: number, tur: number, bek = 6, adim = 18, dy = 0) {
  for (let i = 0; i <= tur * adim; i++) {
    const a = (i / adim) * Math.PI * 2;
    await page.mouse.move(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r + dy);
    if (bek) await page.waitForTimeout(bek);
  }
}

const ac = async (page: Page, sorgu: string) => {
  await page.goto(`./restoran/mini.html?test=1&${sorgu}`);
  await expect(page.locator('.rs-istasyon')).toBeVisible();
  await page.waitForTimeout(300);
};
const tepsiyeAl = async <T>(page: Page) => {
  await page.locator('.rs-tepsi-dugme').click();
  await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 6000 });
  return page.evaluate(() => (window as unknown as { __rsMiniSonuc: unknown[] }).__rsMiniSonuc) as Promise<T[]>;
};

for (const boy of TELEFON) {
  test.describe(`Restoran P5 mini oyunları telefon ${boy.ad} (${boy.yas})`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Kır ve Çırp: yumurta kenara iki vuruş, sert vuruşta kabuk avı, un bulutu hapşu, köpük, pürüzsüz; hamur tepsiye; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=kir-cirp&yas=${boy.yas}&tarif=pankek`);
      await gecikmeKur(page, '.rs-p5-elde');
      // 3-4 dokunuş yolu: yumurta kenara zıplar, ikinci dokunuşta açılır
      await dokun(page, raf('yumurta'));
      await dokun(page, '.rs-kc-kenar-yumurta');
      expect(await olaylar(page, '__rsKirCirp')).toEqual(expect.arrayContaining(['tik', 'yumurtaKirildi']));
      // 5-6: sürükleyerek sert vuruş, kabuk kâseye düşer; 3-4 (hoşgörülü): bütün yumurtayı kâseye atınca kendi çatlar
      const m = await merkez<{ cx: number; cy: number; R: number; Ri: number }>(page, '__rsKirCirp');
      const y = await orta(page, raf('yumurta'));
      const dis = { x: m.cx + 10, y: m.cy - m.R * 1.5 + 34 };
      const ic = { x: m.cx + 10, y: m.cy - m.R * 0.9 + 34 };
      await page.mouse.move(y.x, y.y);
      await page.mouse.down();
      if (boy.yas === 'buyuk') {
        await page.mouse.move(dis.x, dis.y, { steps: 4 });
        await page.mouse.move(ic.x, ic.y);
        await page.mouse.move(dis.x, dis.y, { steps: 2 });
        await page.mouse.move(ic.x, ic.y);
      } else await page.mouse.move(m.cx + 10, m.cy + 34, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(400);
      await page.waitForTimeout(200);
      await gecikmeDenetle(page);
      let o = await olaylar(page, '__rsKirCirp');
      expect(o).toContain('kabukKasede');
      await page.screenshot({ path: `tests/screens/restoran-mini-kir-cirp-${boy.ad}-kabuk.png` });
      // kabuk avı: kayar, kaçar, sonra yakalanır
      for (let i = 0; i < 12; i++) {
        const k = await page.evaluate(() => (window as unknown as { __rsKirCirp: { kabukYeri(): Nokta[] } }).__rsKirCirp.kabukYeri());
        if (!k.length) break;
        await page.mouse.click(k[0].x, k[0].y);
        await page.waitForTimeout(80);
      }
      o = await olaylar(page, '__rsKirCirp');
      expect(o).toEqual(expect.arrayContaining(['kaciyor', 'kabukCikti']));
      expect((await durum<{ kabuk: number }>(page, '__rsKirCirp')).kabuk).toBe(0);
      // süt, dört kaşık un: dördüncüde bulut kalkar, Mino hapşırır
      await dokun(page, raf('sut'));
      for (let i = 0; i < 4; i++) await dokun(page, raf('un'), 80);
      await dokun(page, raf('seker'));
      await expect.poll(async () => (await olaylar(page, '__rsKirCirp')).includes('hapsu')).toBe(true);
      // çırp: hızlı daire (köpük Mino'ya), sonra pürüzsüz olana dek (topaklar da patlar)
      const tel = await orta(page, '.rs-kc-tel');
      await page.mouse.move(tel.x, tel.y - 30);
      await page.mouse.down();
      await daire(page, { x: m.cx, y: m.cy }, m.Ri * 0.5, 2, 0, 12, 30);
      for (const r of [0.15, 0.35, 0.55, 0.65, 0.45, 0.25]) await daire(page, { x: m.cx, y: m.cy }, m.Ri * r, 2, 4, 18, 30);
      await page.mouse.up();
      await page.waitForTimeout(200);
      o = await olaylar(page, '__rsKirCirp');
      expect(o).toContain('kopukMino');
      expect(o).toContain('puruzsuz');
      await page.screenshot({ path: `tests/screens/restoran-mini-kir-cirp-${boy.ad}.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<{ tur: string; yemek: string; ozellik: { malzemeler: Record<string, { adet: number }>; karisim: number } }>(page);
      expect(u[0].tur).toBe('hamur');
      expect(u[0].yemek).toBe('pankek');
      expect(u[0].ozellik.malzemeler.yumurta.adet).toBe(2);
      expect(u[0].ozellik.karisim).toBe(1);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Kazan: kâse ve mercimek dökülür, kepçeyle akıntı, Mino tadımı dolaylı söyler, pişince kalp buhar, kâseye doldur (3-4 çizgi / 5-6 taşar); ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=kazan&yas=${boy.yas}&tarif=corba`);
      const m = await merkez<{ cx: number; cy: number; Ri: number; kx: number; ky: number }>(page, '__rsKazan');
      // boş kazanı tat: "Su gibi!"
      const k0 = await orta(page, '.rs-kz-kepce');
      const mn = await orta(page, '.rs-mino-kose');
      await page.mouse.move(k0.x, k0.y - 50);
      await page.mouse.down();
      await page.mouse.move(m.cx, m.cy + 26, { steps: 6 });
      await page.mouse.move(mn.x, mn.y + 26, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(150);
      expect(await olaylar(page, '__rsKazan')).toContain('tadim-su');
      await dokun(page, raf('kase'));
      await dokun(page, raf('mercimek'));
      await dokun(page, raf('mercimek'));
      await gecikmeKur(page, '.rs-kz-kepce.rs-tutuluyor');
      // tuz: kazanın üstünde salla
      const tz = await orta(page, raf('tuz'));
      await page.mouse.move(tz.x, tz.y);
      await page.mouse.down();
      await page.mouse.move(m.cx, m.cy + 34, { steps: 6 });
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(m.cx + 40, m.cy + 34, { steps: 3 });
        await page.mouse.move(m.cx - 40, m.cy + 34, { steps: 3 });
      }
      await page.mouse.up();
      expect((await durum<{ tuz: number }>(page, '__rsKazan')).tuz).toBeGreaterThanOrEqual(3);
      // karıştır, sonra Mino'ya tattır: tuzlu!
      const k = await orta(page, '.rs-kz-kepce');
      await page.mouse.move(k.x, k.y - 50);
      await page.mouse.down();
      await daire(page, { x: m.cx, y: m.cy }, m.Ri * 0.5, 6, 3, 18, 26);
      await page.mouse.move(mn.x, mn.y + 26, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(250);
      let o = await olaylar(page, '__rsKazan');
      expect(o).toContain('karistir');
      expect(o).toContain('tadim-tuzlu');
      await gecikmeDenetle(page);
      // pişsin: kalp buhar (doğal son)
      await page.evaluate(() => (window as unknown as { __rsKazan: { pisir(sn: number): void } }).__rsKazan.pisir(20));
      await expect.poll(async () => (await olaylar(page, '__rsKazan')).includes('kalp')).toBe(true);
      await page.screenshot({ path: `tests/screens/restoran-mini-kazan-${boy.ad}.png` });
      // dört kepçe kâseye
      for (let i = 0; i < 4; i++) {
        const kk = await orta(page, '.rs-kz-kepce');
        await page.mouse.move(kk.x, kk.y - 50);
        await page.mouse.down();
        await page.mouse.move(m.cx, m.cy + 26, { steps: 5 });
        await page.mouse.move(m.cx + 20, m.cy + 26, { steps: 2 });
        await page.mouse.move(m.kx, m.ky + 26, { steps: 6 });
        await page.mouse.up();
        await page.waitForTimeout(120);
      }
      o = await olaylar(page, '__rsKazan');
      if (boy.yas === 'buyuk') expect(o).toContain('tasti');
      else {
        expect(o).toContain('cizgi');
        expect(o).not.toContain('tasti');
      }
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<{ tur: string; servis: boolean; ozellik: { tuz: number; dolum: number; porsiyon: string; malzemeler: Record<string, unknown> } }>(page);
      expect(u[0].tur).toBe('corba');
      expect(u[0].servis).toBe(true);
      expect(u[0].ozellik.malzemeler.mercimek).toBeTruthy();
      expect(u[0].ozellik.tuz).toBe(3);
      expect(u[0].ozellik.porsiyon).toBe(boy.yas === 'buyuk' ? 'kocaman' : 'normal');
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Rendele: boş rende tıkırdar, kaşar sürtüldükçe kısalır ve yığın büyür, biter: pof; domates fışşş; rende tepsiye; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=rendele&yas=${boy.yas}${boy.yas === 'buyuk' ? '&ozel=cok' : ''}`);
      await gecikmeKur(page, '.rs-rd-malzeme.rs-tutuluyor');
      const m = await merkez<{ gx: number; ust: number; alt: number }>(page, '__rsRendele');
      const surt = async (n: number) => {
        await page.mouse.move(m.gx, m.ust + 30);
        await page.mouse.down();
        for (let i = 0; i < n; i++) {
          await page.mouse.move(m.gx, m.alt - 30, { steps: 6 });
          await page.mouse.move(m.gx, m.ust + 30, { steps: 6 });
        }
        await page.mouse.up();
        await page.waitForTimeout(60);
      };
      await surt(1);
      expect(await olaylar(page, '__rsRendele')).toContain('bosRende');
      // kaşar: bitene dek (yaşa göre 4 / 6 tam sürtme; bir tur iki sürtme)
      await dokun(page, raf('kasar'));
      await surt(2);
      const d1 = await durum<{ uzerinde: { kalan: number } | null; yigin: { n: number }[] }>(page, '__rsRendele');
      expect(d1.uzerinde!.kalan).toBeLessThan(1);
      expect(d1.yigin[0].n).toBeGreaterThan(5);
      await gecikmeDenetle(page);
      await surt(6);
      let o = await olaylar(page, '__rsRendele');
      expect(o).toEqual(expect.arrayContaining(['malzemeBitti', 'pof']));
      if (boy.yas === 'buyuk') {
        // "çok" isteği: ikinci kalıp da rendelenir
        await dokun(page, raf('kasar'));
        await surt(3);
        await expect(page.locator('.rs-rd-istek.rs-tuttu')).toBeVisible();
      }
      // gizli domates: fışşş
      await dokun(page, raf('domates'));
      await surt(1);
      o = await olaylar(page, '__rsRendele');
      expect(o).toContain('fis');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `tests/screens/restoran-mini-rendele-${boy.ad}.png` });
      expect(await buyutulen(page)).toEqual([]);
      const u = await tepsiyeAl<{ tur: string; ozellik: { malzemeler: Record<string, { rende: boolean; kesim: string }> } }>(page);
      expect(u[0].tur).toBe('rende');
      expect(u[0].ozellik.malzemeler.kasar.rende).toBe(true);
      expect(u[0].ozellik.malzemeler.domates.kesim).toBe('pure');
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Pide: merdane şekil verir, çok açılınca pencereli pide; malzeme diz, (5-6) kenar kıvır; kürekle fırın, pişer, çıkar, peynir uzar ve kopar; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=pide&yas=${boy.yas}`);
      // ilk dokunuş ses motorunu açar (lokantada zaten açık): un serpme
      await dokun(page, raf('un'));
      await gecikmeKur(page, '.rs-pd-merdane.rs-tutuluyor');
      const m = await merkez<{ px: number; py: number; r0: number; merdane: Nokta }>(page, '__rsPide');
      // merdane: önce yatay (kayık), sonra dikey de: delinir
      await page.mouse.move(m.merdane.x, m.merdane.y);
      await page.mouse.down();
      await page.mouse.move(m.px, m.py + 20, { steps: 6 });
      for (let i = 0; i < 4; i++) {
        await page.mouse.move(m.px + m.r0 * 1.5, m.py + 20, { steps: 6 });
        await page.mouse.move(m.px - m.r0 * 1.5, m.py + 20, { steps: 6 });
      }
      await page.mouse.up();
      expect((await durum<{ sekil: string }>(page, '__rsPide')).sekil).toBe('kayik');
      await gecikmeDenetle(page);
      const md = await orta(page, '.rs-pd-merdane');
      await page.mouse.move(md.x, md.y);
      await page.mouse.down();
      await page.mouse.move(m.px, m.py + 20, { steps: 6 });
      for (let i = 0; i < 6; i++) {
        await page.mouse.move(m.px, m.py + m.r0 * 1.2 + 20, { steps: 5 });
        await page.mouse.move(m.px, m.py - m.r0 * 1.2 + 20, { steps: 5 });
      }
      await page.mouse.up();
      let o = await olaylar(page, '__rsPide');
      expect(o).toEqual(expect.arrayContaining(['sekil-kayik', 'pencere']));
      // malzeme: kaşar iki kez, sucuk, domates, biber; yumurta kenara iki vuruş
      for (const t of ['kasar', 'kasar', 'sucuk', 'domates', 'biber', 'un']) await dokun(page, raf(t), 60);
      await dokun(page, raf('yumurta'));
      await dokun(page, '.rs-pd-kenar-yumurta');
      if (boy.yas === 'buyuk') {
        // kenar: iki dokunuş
        const p = (await page.locator('.rs-pd-pide').boundingBox())!;
        for (let i = 0; i < 2; i++) await page.mouse.click(p.x + p.width * 0.03, p.y + p.height / 2);
      }
      o = await olaylar(page, '__rsPide');
      expect(o).toEqual(expect.arrayContaining(['koy-kasar', 'koy-sucuk', 'koy-yumurta']));
      if (boy.yas === 'buyuk') expect(o).toContain('kenar');
      await page.screenshot({ path: `tests/screens/restoran-mini-pide-${boy.ad}-hamur.png` });
      expect(await buyutulen(page)).toEqual([]);
      // kürek: pide küreğe biner, kamera fırına kayar; kürek ağza: fırına girer
      await dokun(page, '.rs-pd-kurek', 500);
      await dokun(page, '.rs-pd-kurek', 500);
      o = await olaylar(page, '__rsPide');
      expect(o).toEqual(expect.arrayContaining(['kurege', 'firinda', 'kenar']));
      await page.evaluate(() => (window as unknown as { __rsPide: { pisir(sn: number): void } }).__rsPide.pisir(9));
      await expect.poll(async () => (await durum<{ pisme: string }>(page, '__rsPide')).pisme).toBe('altin');
      await page.screenshot({ path: `tests/screens/restoran-mini-pide-${boy.ad}-firin.png` });
      // çok uzun kalsa da çıtır (kömür yok)
      await page.evaluate(() => (window as unknown as { __rsPide: { pisir(sn: number): void } }).__rsPide.pisir(600));
      await expect.poll(async () => (await durum<{ pisme: string }>(page, '__rsPide')).pisme).toBe('citir');
      // boş kürek ağza, geri çek: pide dışarı, dilimlenmiş
      await dokun(page, '.rs-pd-kurek', 900);
      o = await olaylar(page, '__rsPide');
      expect(o).toEqual(expect.arrayContaining(['kurekteki', 'cikti', 'kalp']));
      await expect(page.locator('.rs-pd-dilim')).toHaveCount(5);
      // peynir uzar ve kopar
      const d = await orta(page, '.rs-pd-dilim[data-i="2"]');
      await page.mouse.move(d.x, d.y);
      await page.mouse.down();
      await page.mouse.move(d.x + 5, d.y - 90, { steps: 10 });
      await page.screenshot({ path: `tests/screens/restoran-mini-pide-${boy.ad}.png` });
      await page.mouse.move(d.x + 10, d.y - 260, { steps: 10 });
      await page.mouse.up();
      o = await olaylar(page, '__rsPide');
      expect(o).toEqual(expect.arrayContaining(['peynirUzadi', 'peynirKoptu']));
      expect(o.filter((x) => x === 'peynirKoptu').length).toBe(1);
      const u = await tepsiyeAl<{ tur: string; servis: boolean; ozellik: { pisme: string; porsiyon: string; malzemeler: Record<string, unknown> }; pide: { sekil: string; delik: boolean } }>(page);
      expect(u[0].tur).toBe('pide');
      expect(u[0].servis).toBe(true);
      expect(u[0].ozellik.pisme).toBe('citir');
      expect(u[0].ozellik.malzemeler.kasar).toBeTruthy();
      expect(u[0].pide.delik).toBe(true);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}

for (const boy of DIGER) {
  test.describe(`Restoran P5 mini oyunları ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));
    test('dört oyun açılır, raf ve iş alanı ekrana sığar, zoom yok', async ({ page }) => {
      const hatalar = hataTopla(page);
      for (const oyun of ['kir-cirp', 'kazan', 'rendele', 'pide']) {
        await ac(page, `oyun=${oyun}&yas=buyuk`);
        const raflar = await page.locator('.rs-p5-raf-oge').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
        expect(raflar.length).toBeGreaterThanOrEqual(4);
        for (const r of raflar) {
          expect(r.width).toBeGreaterThanOrEqual(63.5);
          expect(r.right).toBeLessThanOrEqual(boy.viewport.width + 1);
          expect(r.bottom).toBeLessThanOrEqual(boy.viewport.height + 1);
        }
        // iş alanı (kâse, kazan, rende, hamur) ekranın içinde ve raf altında
        const is = (await page.locator('.rs-kc-kase, .rs-kz-kazan, .rs-rd-rende, .rs-pd-pide').first().boundingBox())!;
        expect(is.x).toBeGreaterThanOrEqual(0);
        expect(is.x + is.width).toBeLessThanOrEqual(boy.viewport.width + 1);
        expect(is.y).toBeGreaterThanOrEqual(Math.max(...raflar.map((r) => r.bottom)) - 1);
        await page.screenshot({ path: `tests/screens/restoran-mini-${oyun}-${boy.ad}.png` });
        expect(await buyutulen(page)).toEqual([]);
      }
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}
