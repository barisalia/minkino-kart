/**
 * Tıkır Tıkır Lokanta · P3 mini oyunları tek başına (/restoran/mini.html?oyun=yika|soy|kizart|icecek; RESTORAN.md §12 P3):
 * telefon iki yön (844×390 3-4, 390×844 5-6) + 932×430 ve 667×375, her komik başarısızlık ve sürpriz en az bir kez
 * (uğur böceği, kürdan bıyık, spiral taç, tuz bulutu, ayran fışkırması, limon çekirdeği, taşma), parçalar sahnede
 * kalır, dokunuştan ilk görüntüye ≤ 1 kare (≤ 32 ms), zoom yok, tepsiye ürün gider, konsol hatası yok.
 * Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

type Nokta = { x: number; y: number };
type Durum = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const agDisi = (h: string) => !h.includes('ERR_CONNECTION_RESET') && !h.includes('Failed to load resource');

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3); uçuştakiler sayılmaz */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.rs-kok img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.closest('.rs-mini-sonuc') && !i.getAnimations({ subtree: false }).length && !i.parentElement?.getAnimations().length)
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
const kok = async (page: Page, sec: string) => (await page.locator(sec).boundingBox())!;
const dokun = async (page: Page, sec: string, bek = 420) => {
  const p = await orta(page, sec);
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(bek);
};
async function cizgi(page: Page, a: Nokta, b: Nokta, n = 10, bek = 16) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
    if (bek) await page.waitForTimeout(bek);
  }
}
const durum = (page: Page, ad: string): Promise<Durum> => page.evaluate((a) => (window as unknown as Record<string, { durum(): Durum }>)[a].durum(), ad);
const olaylar = (page: Page, ad: string): Promise<string[]> => page.evaluate((a) => (window as unknown as Record<string, { olaylar: string[] }>)[a].olaylar.slice(), ad);

/**
 * ≤ 1 kare: `hedef`e inen pointerdown'dan sonraki ilk karede `kosul` doğru mu. Önce boş bir yere bir dokunuş: sayfanın
 * ilk dokunuşu ses motorunu açar (sesiAc, ~50 ms; lokantada çocuk istasyona gelmeden çoktan dokunmuş olur).
 */
async function gecikmeKur(page: Page, kosul: string, hedef: string) {
  await page.mouse.click(5, 200);
  await page.waitForTimeout(300);
  await page.evaluate(([k, hd]) => {
    const w = window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] };
    w.__gecikme = [];
    addEventListener(
      'pointerdown',
      (e) => {
        const t = e.target as Element | null;
        if (!t?.closest?.(hd) || (t.closest('button') && !t.closest('button')!.matches(hd))) return;
        const t0 = e.timeStamp;
        requestAnimationFrame(() => w.__gecikme.push({ ms: performance.now() - t0, gorunur: !!new Function(`return (${k})`)(), hedef: t.className } as { ms: number; gorunur: boolean }));
      },
      { capture: true },
    );
  }, [kosul, hedef] as const);
}
const gecikme = (page: Page) => page.evaluate(() => (window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] }).__gecikme.slice());

const ac = async (page: Page, sorgu: string, gercek = false) => {
  await page.goto(`./restoran/mini.html?${gercek ? '' : 'test=1&'}${sorgu}`);
  await expect(page.locator('.rs-istasyon')).toBeVisible();
  await page.waitForTimeout(300);
};
const tepsiyeAl = async (page: Page) => {
  await dokun(page, '.rs-tepsi-dugme', 200);
  await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 8000 });
  return page.evaluate(() => (window as unknown as { __rsMiniSonuc: { tur: string; yemek?: string; servis?: boolean; ozellik: Durum }[] }).__rsMiniSonuc.map((u) => ({ tur: u.tur, yemek: u.yemek, servis: u.servis, ozellik: u.ozellik })));
};

const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 }, yas: 'kucuk' },
  { ad: 'dikey', viewport: { width: 390, height: 844 }, yas: 'buyuk' },
] as const;

for (const boy of TELEFON) {
  test.describe(`Restoran P3 mini oyunları telefon ${boy.ad} (${boy.yas})`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Yıka: leğene at, ov (lekeler söner, köpük), uğur böceği Mino\'ya, durula, süzgeç; köpüklü sebze Mino\'yu hapşırtır; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=yika&yas=${boy.yas}&tarif=salata`);
      await gecikmeKur(page, "document.querySelectorAll('.rs-yk-sebze').length > 0", '.rs-yk-raf-oge');
      const raf = (await durum(page, '__rsYika')).raf as string[];
      const yaprakli = raf.find((m) => m === 'marul' || m === 'maydanoz')!;
      expect(yaprakli).toBeTruthy();
      await dokun(page, `.rs-yk-raf-oge[data-malzeme="${yaprakli}"]`);
      const g = await gecikme(page);
      expect(g[0].gorunur, JSON.stringify(g)).toBe(true);
      expect(g[0].ms).toBeLessThanOrEqual(32);
      const k = await kok(page, '.rs-yika');
      let d = await durum(page, '__rsYika');
      const L = d.legen;
      // daire çizerek ov
      await cizgi(page, { x: k.x + L.cx + 30, y: k.y + L.cy }, { x: k.x + L.cx + 30, y: k.y + L.cy }, 1, 0);
      for (let i = 0; i < 220; i++) {
        const a = i * 0.25;
        await page.mouse.move(k.x + L.cx + Math.cos(a) * L.R * 0.25, k.y + L.cy + Math.sin(a) * L.R * 0.2);
        await page.waitForTimeout(6);
        if (i === 30) await page.screenshot({ path: `tests/screens/restoran-p3-yika-${boy.ad}-ov.png` });
      }
      await page.mouse.up();
      await page.waitForTimeout(300);
      d = await durum(page, '__rsYika');
      expect(d.sebzeler[0].temiz, JSON.stringify(d.sebzeler)).toBe(true);
      expect(d.sebzeler[0].kopuk).toBeGreaterThan(0);
      let o = await olaylar(page, '__rsYika');
      expect(o).toContain('leke');
      expect(o).toContain('ugur');
      // musluğun altında durula, süzgece bırak
      const M = d.musluk;
      const S = d.suzgec;
      const ux = k.x + M.x;
      const uy = k.y + (M.ust + M.alt) / 2 + 26;
      await cizgi(page, { x: k.x + L.cx, y: k.y + L.cy }, { x: ux, y: uy }, 16, 16);
      for (let i = 0; i < 70; i++) {
        await page.mouse.move(ux + (i % 2) * 3, uy);
        await page.waitForTimeout(16);
      }
      expect((await durum(page, '__rsYika')).su).toBe(true);
      await page.screenshot({ path: `tests/screens/restoran-p3-yika-${boy.ad}-durula.png` });
      for (let i = 1; i <= 12; i++) {
        await page.mouse.move(ux + ((k.x + S.cx - ux) * i) / 12, uy + ((k.y + S.cy - uy) * i) / 12);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(400);
      d = await durum(page, '__rsYika');
      expect(d.sebzeler[0]).toMatchObject({ yer: 'suzgec', kopuk: 0, temiz: true });
      // ikinci sebze: kısa ov, köpüklüyken doğrudan süzgece (komik: köpükler Mino'ya)
      const ikinci = raf.find((m) => m !== yaprakli)!;
      await dokun(page, `.rs-yk-raf-oge[data-malzeme="${ikinci}"]`);
      await cizgi(page, { x: k.x + L.cx + 24, y: k.y + L.cy }, { x: k.x + L.cx + 24, y: k.y + L.cy }, 1, 0);
      for (let i = 0; i < 60; i++) {
        await page.mouse.move(k.x + L.cx + Math.cos(i * 0.3) * 24, k.y + L.cy + Math.sin(i * 0.3) * 20);
        await page.waitForTimeout(6);
      }
      for (let i = 1; i <= 14; i++) {
        await page.mouse.move(k.x + L.cx - 20 + ((S.cx - L.cx + 20) * i) / 14, k.y + L.cy + ((S.cy - L.cy) * i) / 14);
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(1400);
      o = await olaylar(page, '__rsYika');
      expect(o).toContain('kopuklu');
      // parçalar sahnede kalır: ikisi de süzgeçte
      await expect(page.locator('.rs-yk-sebze[data-yer="suzgec"]')).toHaveCount(2);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p3-yika-${boy.ad}.png` });
      d = await durum(page, '__rsYika');
      const u = await tepsiyeAl(page);
      expect(u).toHaveLength(1);
      expect(u[0].tur).toBe('yikanmis');
      expect(u[0].ozellik.malzemeler[yaprakli]).toMatchObject({ adet: 1, temiz: true });
      expect(u[0].ozellik.temiz).toBe(d.sebzeler.every((x: { temiz: boolean }) => x.temiz));
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Soy: soyacak şerit şerit soyar, kabuk kovaya, yüz döner, fazlası kürdan → Mino bıyığı; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=soy&yas=${boy.yas}`);
      await // kısa dokunuşta (yüz dönmesi) parmak kare gelmeden kalkar: o karede sebze dönmeye başlamış olmalı
      await gecikmeKur(page, "document.querySelector('.rs-sy-soyacak.rs-tutuluyor') || document.querySelector('.rs-sy-sebze')?.getAnimations().length", '.rs-soy');
      await dokun(page, '.rs-sy-raf-oge[data-malzeme="havuc"]', 500);
      const k = await kok(page, '.rs-soy');
      const cek = async (v: number) => {
        const a = (await durum(page, '__rsSoy')).aktif;
        if (!a) return;
        const e = a.govde;
        const bx = k.x + a.x - a.boy / 2;
        const by = k.y + a.y - a.boy / 2;
        const cx = bx + (e.cx / 100) * a.boy;
        const cy = by + (e.cy / 100) * a.boy;
        const an = (e.a * Math.PI) / 180;
        const rx = (e.rx / 100) * a.boy;
        const ry = (e.ry / 100) * a.boy * a.ince;
        const P = (u: number) => ({ x: cx + u * rx * Math.cos(an) - v * ry * Math.sin(an), y: cy + u * rx * Math.sin(an) + v * ry * Math.cos(an) });
        await cizgi(page, P(-1.15), P(1.15), 12, 16);
        await page.mouse.up();
        await page.waitForTimeout(420);
        const d = (await durum(page, '__rsSoy')).aktif;
        if (d?.donBekliyor) await dokun(page, '.rs-sy-sebze', 500);
      };
      const VS = [-0.7, -0.35, 0, 0.35, 0.7];
      for (let i = 0; i < 24; i++) {
        const d = await durum(page, '__rsSoy');
        if (!d.aktif || d.aktif.soyuldu) break;
        await cek(VS[i % VS.length]);
        if (i === 1) await page.screenshot({ path: `tests/screens/restoran-p3-soy-${boy.ad}-serit.png` });
      }
      const g = await gecikme(page);
      expect(g.length).toBeGreaterThan(3);
      expect(g.every((x) => x.gorunur), JSON.stringify(g)).toBe(true);
      expect(Math.max(...g.map((x) => x.ms))).toBeLessThanOrEqual(32);
      let d = await durum(page, '__rsSoy');
      expect(d.aktif.soyuldu).toBe(true);
      expect(d.kabuk).toBeGreaterThan(2);
      let o = await olaylar(page, '__rsSoy');
      expect(o).toContain('don');
      // kabuklar kovada kalır
      expect(await page.locator('.rs-sy-yigin .rs-sy-kabuk').count()).toBeGreaterThan(2);
      // soyulmuşu soymaya devam: incelir, kürdan → Mino'nun bıyığı
      for (let i = 0; i < 8 && (await durum(page, '__rsSoy')).aktif; i++) await cek(0);
      o = await olaylar(page, '__rsSoy');
      expect(o).toContain('incelt');
      expect(o).toContain('kurdan');
      await page.waitForTimeout(500);
      await expect(page.locator('.rs-sy-biyik.rs-takili')).toHaveCount(1);
      await page.screenshot({ path: `tests/screens/restoran-p3-soy-${boy.ad}-biyik.png` });
      // ikinci sebze: patates biraz soyulur, tepsiye
      await dokun(page, '.rs-sy-raf-oge[data-malzeme="patates"]', 500);
      await cek(0);
      d = await durum(page, '__rsSoy');
      expect(d.aktif.kaplama).toBeGreaterThan(0);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p3-soy-${boy.ad}.png` });
      const u = await tepsiyeAl(page);
      expect(u[0].tur).toBe('soyulmus');
      expect(u[0].ozellik.malzemeler.patates).toMatchObject({ adet: 1, soyuldu: false });
      expect(u[0].ozellik.malzemeler.havuc).toBeUndefined();
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Kızart: sepete, yağa dal (cız), salla, kaldır, külaha; tuz bulutu Mino\'yu hapşırtır; ketçap noktası; çıtırda durur; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=kizart&yas=${boy.yas}`);
      await gecikmeKur(page, "document.querySelector('.rs-kzr-sepet.rs-tutuldu')", '.rs-kzr-sepet');
      await dokun(page, '.rs-kzr-raf-oge[data-malzeme="patates"]');
      await dokun(page, '.rs-kzr-raf-oge[data-malzeme="patates"]');
      let d = await durum(page, '__rsKizart');
      expect(d.sepet.length).toBeGreaterThanOrEqual(8);
      // sepeti yağa sürükle
      const s0 = await orta(page, '.rs-kzr-sepet');
      await cizgi(page, s0, { x: s0.x, y: s0.y + 60 }, 8, 16);
      await page.mouse.up();
      await page.waitForTimeout(300);
      expect((await durum(page, '__rsKizart')).durum).toBe('yagda');
      // salla
      const s1 = await orta(page, '.rs-kzr-sepet');
      await page.mouse.move(s1.x, s1.y);
      await page.mouse.down();
      for (let i = 0; i < 24; i++) {
        await page.mouse.move(s1.x + (i % 4 < 2 ? 34 : -34), s1.y);
        await page.waitForTimeout(30);
      }
      await page.mouse.up();
      const g = await gecikme(page);
      expect(g.every((x) => x.gorunur), JSON.stringify(g)).toBe(true);
      expect(Math.max(...g.map((x) => x.ms))).toBeLessThanOrEqual(32);
      // bir saat yağda: çıtır (kömür yok)
      await page.evaluate(() => (window as unknown as { __rsKizart: { pisir(sn: number): void } }).__rsKizart.pisir(3600));
      d = await durum(page, '__rsKizart');
      expect(d.sepet.every((x: { p: number }) => x.p <= 3.4 && x.p >= 3)).toBe(true);
      await page.screenshot({ path: `tests/screens/restoran-p3-kizart-${boy.ad}-yag.png` });
      let o = await olaylar(page, '__rsKizart');
      expect(o).toContain('dal');
      expect(o).toContain('salla');
      // kaldır ve külaha
      const K = d.kulahYer;
      const k = await kok(page, '.rs-kizart');
      const s2 = await orta(page, '.rs-kzr-sepet');
      await page.mouse.move(s2.x, s2.y);
      await page.mouse.down();
      for (let i = 1; i <= 20; i++) {
        const t = i / 20;
        await page.mouse.move(s2.x + (k.x + K.cx - s2.x) * t, s2.y - 90 * Math.min(1, t * 4) + (k.y + K.cy - s2.y + 90) * Math.max(0, (t - 0.25) / 0.75));
        await page.waitForTimeout(16);
      }
      await page.mouse.up();
      await page.waitForTimeout(500);
      d = await durum(page, '__rsKizart');
      expect(d.sepet).toHaveLength(0);
      expect(d.kulah.length).toBeGreaterThanOrEqual(8);
      // tuz: çok tuz = tuz bulutu
      const t0 = await orta(page, '.rs-kzr-tuzluk');
      await page.mouse.move(t0.x, t0.y);
      await page.mouse.down();
      for (let i = 1; i <= 70; i++) {
        await page.mouse.move(k.x + K.cx + (i % 2 ? 22 : -22), k.y + K.cy - K.h * 0.4 + 60);
        await page.waitForTimeout(22);
      }
      await page.mouse.up();
      await page.waitForTimeout(1200);
      await dokun(page, '.rs-kzr-ketcap', 300);
      o = await olaylar(page, '__rsKizart');
      expect(o).toContain('tuz-bulutu');
      expect(o).toContain('ketcap');
      await expect(page.locator('.rs-kzr-kulah .rs-kzr-ketcap-nokta')).toHaveCount(1);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p3-kizart-${boy.ad}.png` });
      const u = await tepsiyeAl(page);
      expect(u[0]).toMatchObject({ tur: 'kizartma', yemek: 'patates', servis: true });
      expect(u[0].ozellik).toMatchObject({ pisme: 'citir', tuz: 3, sus: 1, sicak: true });
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Çalkala ve Doldur: kapaksız fışkırır (Mino bıyığı), kapaklı köpürür, bardağa dök (3-4 çizgide durur / 5-6 taşar, Lokum yalar), limon çekirdeği Kino\'ya; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=icecek&yas=${boy.yas}`);
      await gecikmeKur(page, "document.querySelector('.rs-ic-surahi.rs-tutuldu')", '.rs-ic-surahi');
      for (const ad of ['yogurt', 'yogurt', 'yogurt', 'su', 'su', 'su']) await dokun(page, `.rs-ic-raf-oge[data-ad="${ad}"]`, 380);
      const ekle = async () => {
        for (const ad of ['yogurt', 'yogurt', 'su', 'su']) await dokun(page, `.rs-ic-raf-oge[data-ad="${ad}"]`, 380);
      };
      const k = await kok(page, '.rs-icecek');
      const salla = async () => {
        const s = (await durum(page, '__rsIcecek')).surahi;
        const x = k.x + s.x;
        const y = k.y + s.y + s.h * 0.2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let i = 0; i < 20; i++) {
          await page.mouse.move(x + (i % 2 ? 40 : -40), y);
          await page.waitForTimeout(40);
        }
        await page.mouse.up();
        await page.waitForTimeout(400);
      };
      // kapaksız: fışkırır (bir kez büyük), Mino'nun bıyığı beyaz
      await salla();
      await page.waitForTimeout(600);
      let o = await olaylar(page, '__rsIcecek');
      expect(o).toContain('fiskir');
      expect(o).toContain('biyik');
      await page.screenshot({ path: `tests/screens/restoran-p3-icecek-${boy.ad}-fiskir.png` });
      // fışkırınca sürahi azaldı: yeniden yoğurt ve su; kapaklı: köpürür
      await ekle();
      await dokun(page, '.rs-ic-kapak', 300);
      await salla();
      let d = await durum(page, '__rsIcecek');
      expect(d.surahi.kopuk).toBeGreaterThan(0.4);
      expect(d.surahi.tur).toBe('ayran');
      const g = await gecikme(page);
      expect(g.every((x) => x.gorunur), JSON.stringify(g)).toBe(true);
      expect(Math.max(...g.map((x) => x.ms))).toBeLessThanOrEqual(32);
      // bardağa dök: sürahinin ağzı bardağın üstünde, tut
      await dokun(page, '.rs-ic-kapak', 300);
      d = await durum(page, '__rsIcecek');
      const S = d.surahi;
      const B = d.bardak;
      const x0 = k.x + S.x;
      const y0 = k.y + S.y + S.h * 0.2;
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      const hx = k.x + B.cx + S.w * 0.06;
      const hy = k.y + (B.alt - B.h) - S.h / 2 - 20 + S.h * 0.2;
      for (let i = 1; i <= 20; i++) {
        await page.mouse.move(x0 + ((hx - x0) * i) / 20, y0 + ((hy - y0) * i) / 20);
        await page.waitForTimeout(25);
      }
      await page.waitForTimeout(boy.yas === 'kucuk' ? 3000 : 4200);
      await page.screenshot({ path: `tests/screens/restoran-p3-icecek-${boy.ad}-dok.png` });
      await page.mouse.up();
      await page.waitForTimeout(500);
      d = await durum(page, '__rsIcecek');
      o = await olaylar(page, '__rsIcecek');
      if (boy.yas === 'kucuk') {
        expect(d.bardak.dolum).toBeCloseTo(0.85, 2);
        expect(d.bardak.tasan).toBe(0);
        expect(o).toContain('cizgi');
      } else {
        expect(d.bardak.dolum).toBe(1);
        expect(d.bardak.tasan).toBeGreaterThan(0);
        expect(o).toContain('tasti');
      }
      // limon: kaydırmayla kes, yarım prese, daire çizerek sık; ilk çekirdek Kino'nun burnuna
      await dokun(page, '.rs-ic-raf-oge[data-ad="limon"]', 600);
      const q = await orta(page, '.rs-ic-kesme');
      await cizgi(page, { x: q.x - 70, y: q.y }, { x: q.x + 70, y: q.y }, 10, 16);
      await page.mouse.up();
      await page.waitForTimeout(300);
      await dokun(page, '.rs-ic-kesme', 300);
      expect((await durum(page, '__rsIcecek')).limon.presteki).toBe(true);
      const pr = (await page.locator('.rs-ic-pres').boundingBox())!;
      const cx = pr.x + pr.width / 2;
      const cy = pr.y + pr.height / 2;
      await page.mouse.move(cx + 20, cy);
      await page.mouse.down();
      for (let i = 0; i < 70; i++) {
        await page.mouse.move(cx + Math.cos(i * 0.3) * 20, cy + Math.sin(i * 0.3) * 14);
        await page.waitForTimeout(18);
      }
      await page.mouse.up();
      await page.waitForTimeout(800);
      o = await olaylar(page, '__rsIcecek');
      expect(o).toContain('limon-kes');
      expect(o).toContain('cekirdek-kino');
      expect((await durum(page, '__rsIcecek')).surahi.limon).toBeGreaterThan(1);
      await dokun(page, '.rs-ic-raf-oge[data-ad="buz"]', 500);
      expect((await durum(page, '__rsIcecek')).bardak.buz).toBe(1);
      expect(await buyutulen(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/restoran-p3-icecek-${boy.ad}.png` });
      const u = await tepsiyeAl(page);
      expect(u[0]).toMatchObject({ tur: 'icecek', yemek: 'ayran', servis: true });
      expect(u[0].ozellik.malzemeler.yogurt.adet).toBeGreaterThan(0);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}

test.describe('Restoran P3 · 5-6 portakal spiral kabuk: Lokum\'a taç (gerçek hız)', () => {
  test.use({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyu ayrı'));
  test('parmağı kaldırmadan daire: tek parça spiral, Lokum alttan çıkar, taç başında', async ({ page }) => {
    const hatalar = hataTopla(page);
    await ac(page, 'oyun=soy&yas=buyuk', true);
    await dokun(page, '.rs-sy-raf-oge[data-malzeme="portakal"]', 600);
    const k = await kok(page, '.rs-soy');
    const a = (await durum(page, '__rsSoy')).aktif;
    const e = a.govde;
    const cx = k.x + a.x - a.boy / 2 + (e.cx / 100) * a.boy;
    const cy = k.y + a.y - a.boy / 2 + (e.cy / 100) * a.boy;
    const R = (e.rx / 100) * a.boy;
    await page.mouse.move(cx + R * 0.8, cy);
    await page.mouse.down();
    for (let i = 0; i < 160; i++) {
      await page.mouse.move(cx + Math.cos(i * 0.1) * R * 0.8, cy + Math.sin(i * 0.1) * R * 0.8);
      await page.waitForTimeout(12);
    }
    await page.mouse.up();
    await expect(page.locator('.rs-p3-bakan[data-kim="lokum"] .rs-sy-spiral')).toHaveCount(1, { timeout: 5000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screens/restoran-p3-soy-spiral-tac.png' });
    const o = await olaylar(page, '__rsSoy');
    expect(o).toContain('spiral');
    expect(o).toContain('tac');
    expect((await durum(page, '__rsSoy')).aktif.soyuldu).toBe(true);
    expect(hatalar.filter(agDisi)).toEqual([]);
  });
});

test.describe('Restoran P3 · küçük ve geniş telefonlar', () => {
  for (const vp of [
    { ad: '932x430', viewport: { width: 932, height: 430 } },
    { ad: '667x375', viewport: { width: 667, height: 375 } },
  ]) {
    test.describe(vp.ad, () => {
      test.use({ viewport: vp.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
      test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyu ayrı'));
      test('dört oyun açılır, raf ve araçlar ekranda, tepsi ve Mino ile çakışmaz, zoom yok', async ({ page }) => {
        const hatalar = hataTopla(page);
        for (const [oyun, ilk] of [
          ['yika', '.rs-yk-raf-oge'],
          ['soy', '.rs-sy-raf-oge'],
          ['kizart', '.rs-kzr-raf-oge'],
          ['icecek', '.rs-ic-raf-oge'],
        ] as const) {
          await ac(page, `oyun=${oyun}&yas=kucuk`);
          await dokun(page, ilk, 500);
          const ekran = vp.viewport;
          // raf düğmeleri ≥ 64 css px ve ekranın içinde
          for (const r of await page.locator(ilk).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
            expect(r.width).toBeGreaterThanOrEqual(63.5);
            expect(r.right).toBeLessThanOrEqual(ekran.width + 1);
          }
          // ana araçlar tepsi düğmesinin altında kalmaz
          const tepsi = (await page.locator('.rs-tepsi-dugme').boundingBox())!;
          const arac = { yika: '.rs-yk-legen', soy: '.rs-sy-sebze', kizart: '.rs-kzr-fritoz', icecek: '.rs-ic-surahi' }[oyun];
          const a = (await page.locator(arac).first().boundingBox())!;
          const kesisim = Math.max(0, Math.min(a.x + a.width, tepsi.x + tepsi.width) - Math.max(a.x, tepsi.x)) * Math.max(0, Math.min(a.y + a.height, tepsi.y + tepsi.height) - Math.max(a.y, tepsi.y));
          expect(kesisim).toBe(0);
          expect(await buyutulen(page)).toEqual([]);
          await page.screenshot({ path: `tests/screens/restoran-p3-${oyun}-${vp.ad}.png` });
        }
        expect(hatalar.filter(agDisi)).toEqual([]);
      });
    });
  }
});
