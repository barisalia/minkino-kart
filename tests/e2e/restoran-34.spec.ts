/**
 * Tıkır Tıkır Lokanta · P8 3/4 lokanta sahnesi (ekip/senaryo/RESTORAN.md §7, §12 P8 bitti ölçütü):
 * kadraj ve HUD (kaydırmasız, sabit kamera), ölçek (en uzun ≤ %26, toplam ≤ %18, yüz ≥ 22 css), derinlik
 * (elementFromPoint), sıra (5 müşteri: 3 sırada 2 yolun başında, herhangi biri oturtulur), yürüme (ayna, ön/arka),
 * HUD parçaları (≥ 56 css, kavanoz yalnız dolar, sandık = kayıt), balonlar (yüz ve HUD), bahçe (bahçeli resim).
 * 3/4 resmi gelmediyse `&sahne34=1` yer tutucu dioramayla sınar. Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const BOYLAR = [
  { width: 844, height: 390 },
  { width: 932, height: 430 },
  { width: 667, height: 375 },
  { width: 390, height: 844 },
];

const durum = (page: Page) => page.evaluate(() => (window as unknown as { __rsGun?: { durum(): Record<string, unknown> } }).__rsGun?.durum() as any);

async function ac(page: Page, ek = '', yas = 'kucuk', on = '') {
  await page.goto(`./restoran/?test=1&sifirla=1&yas=${yas}&ekran=lokanta&sahne34=1${on}${ek}`);
  await expect(page.locator('.rs-lokanta[data-s34]')).toBeVisible();
  await page.waitForTimeout(300);
}

/** Sahne, HUD, ölçek ölçüleri (sayfa içinde) */
const olcu = (page: Page) =>
  page.evaluate(() => {
    const s = document.querySelector('.rs-sahne')!.getBoundingClientRect();
    const hud = document.querySelector('.rs-hud')!.getBoundingClientRect();
    const kisiler = [...document.querySelectorAll<HTMLElement>('.rs-lokanta .rs-kisi')].filter((e) => e.getBoundingClientRect().width > 0);
    let enUzun = 0;
    let alan = 0;
    let enKucukYuz = Infinity;
    const yuzler: Record<string, number> = {};
    for (const e of kisiler) {
      const r = e.getBoundingClientRect();
      const [tepe, taban] = (e.dataset.figur ?? '0,1').split(',').map(Number);
      const fh = r.height * (taban - tepe);
      if (!e.classList.contains('rs-oturuyor')) enUzun = Math.max(enUzun, fh / s.height);
      alan += r.width * fh;
      // baş boyu: figür boyu × baş oranı (olcek.ts BAS_ORANI: yavru 0,46, yetişkin 0,27); boy birimi --rs-u0
      const u = parseFloat(getComputedStyle(document.querySelector('.rs-lokanta')!).getPropertyValue('--rs-u0'));
      const boy = fh / u;
      const yuz = fh * (boy < 1.6 ? 0.46 : 0.27);
      yuzler[e.dataset.kisi ?? '?'] = Math.round(yuz);
      enKucukYuz = Math.min(enKucukYuz, yuz);
    }
    const dugmeler = [...document.querySelectorAll<HTMLElement>('.rs-hud .rs-hud-parca')].filter((e) => !e.hidden && e.getBoundingClientRect().width > 0).map((e) => {
      const r = e.getBoundingClientRect();
      return { ad: e.className, w: r.width, h: r.height };
    });
    return {
      sahne: { x: s.x, y: s.y, w: s.width, h: s.height },
      hud: { x: hud.x, y: hud.y, w: hud.width, h: hud.height },
      kaydirma: document.scrollingElement!.scrollWidth > innerWidth || document.scrollingElement!.scrollHeight > innerHeight,
      enUzun,
      toplam: alan / (s.width * s.height),
      enKucukYuz,
      yuzler,
      dugmeler,
      ekran: { w: innerWidth, h: innerHeight },
    };
  });

for (const boy of BOYLAR) {
  test.describe(`Restoran 3/4 ${boy.width}x${boy.height}`, () => {
    test.use({ viewport: boy, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('kadraj: lokantanın tamamı ve HUD kaydırmasız; ölçek; HUD parçaları ≥ 56', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, '&sira=1');
      await expect.poll(async () => (await durum(page))?.sira?.length ?? 0, { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
      await page.waitForTimeout(600);
      const o = await olcu(page);
      await page.screenshot({ path: `tests/screens/restoran34-${boy.width}x${boy.height}.png` });
      // sahne ve HUD ekranın içinde, üst üste binmez
      expect(o.kaydirma).toBe(false);
      expect(o.sahne.x).toBeGreaterThanOrEqual(-0.5);
      expect(o.sahne.y).toBeGreaterThanOrEqual(-0.5);
      expect(o.sahne.x + o.sahne.w).toBeLessThanOrEqual(o.ekran.w + 0.5);
      expect(o.sahne.y + o.sahne.h).toBeLessThanOrEqual(o.ekran.h + 0.5);
      if (boy.width > boy.height) expect(o.sahne.x + o.sahne.w).toBeLessThanOrEqual(o.hud.x + 0.5);
      else expect(o.sahne.y + o.sahne.h).toBeLessThanOrEqual(o.hud.y + 0.5);
      expect(o.enUzun).toBeLessThanOrEqual(0.265);
      expect(o.toplam).toBeLessThanOrEqual(0.18);
      // yüz ≥ 22 css (667×375'te resim HUD yüzünden küçülür: orada ≥ 17; ORTAK_NOTLAR)
      expect(o.enKucukYuz).toBeGreaterThanOrEqual(boy.width === 667 ? 17 : 21.5);
      for (const d of o.dugmeler) {
        expect(d.w, d.ad).toBeGreaterThanOrEqual(55.5);
        expect(d.h, d.ad).toBeGreaterThanOrEqual(55.5);
      }
      expect(hatalar).toEqual([]);
      console.log(`${boy.width}x${boy.height}`, JSON.stringify({ sahne: o.sahne, enUzun: o.enUzun.toFixed(3), toplam: o.toplam.toFixed(3), yuz: o.yuzler }));
    });
    test('sıra: 5 müşteri → 3 sırada, 2 yolun başında; herhangi biri sürüklenip oturur; kimse gitmez', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, '&sira=1&tohum=7&musteriler=anne,baba,dede,lokum,tombi', 'buyuk');
      await expect.poll(async () => (await durum(page))?.sira?.filter((x: { hazir: boolean }) => x.hazir).length ?? 0, { timeout: 30_000 }).toBe(5);
      const d = await durum(page);
      const yuvalar = d.sira.map((x: { yuva: number }) => x.yuva).sort();
      expect(yuvalar).toEqual([0, 1, 2, 3, 4]);
      await page.screenshot({ path: `tests/screens/restoran34-sira-${boy.width}x${boy.height}.png` });
      // ortadaki (yuva 2) sürüklenir: ilki olmak zorunda değil
      const uc = d.sira.find((x: { yuva: number }) => x.yuva === 2);
      const a = (await page.locator(`.rs-kisi.rs-sirada[data-kisi="${uc.ad}"]`).first().boundingBox())!;
      const bos = d.masalar.findIndex((m: { oturan: string | null }) => !m.oturan);
      const b = (await page.locator(`.rs-masa[data-masa="${bos}"]`).boundingBox())!;
      await page.mouse.move(a.x + a.width / 2, a.y + a.height * 0.55);
      await page.mouse.down();
      for (let i = 1; i <= 14; i++) {
        await page.mouse.move(a.x + a.width / 2 + ((b.x + b.width / 2 - a.x - a.width / 2) * i) / 14, a.y + a.height * 0.55 + ((b.y + b.height / 2 - a.y - a.height * 0.55) * i) / 14);
        await page.waitForTimeout(20);
      }
      await page.mouse.up();
      await expect.poll(async () => (await durum(page))?.masalar?.[bos]?.oturan, { timeout: 10_000 }).toBe(uc.ad);
      // arkadakiler öne yürür: 4 kişi, yuvalar 0-3
      await expect.poll(async () => ((await durum(page))?.sira ?? []).filter((x: { hazir: boolean }) => x.hazir).map((x: { yuva: number }) => x.yuva).sort().join(), { timeout: 10_000 }).toBe('0,1,2,3');
      // 5-6 yaşta kendiliğinden oturma yok; kimse sıradan gitmez
      await page.waitForTimeout(3000);
      expect((await durum(page)).sira.length).toBe(4);
      expect(hatalar).toEqual([]);
    });

    test('derinlik: oturanın bacakları masanın arkasında; önden geçen Kino masanın önünde', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, '&tohum=3&musteriler=baba,lokum');
      await expect.poll(async () => (await durum(page))?.masalar?.filter((m: { oturan: string | null; durum: string }) => m.oturan && m.durum !== 'yuruyor').length ?? 0, { timeout: 30_000 }).toBeGreaterThanOrEqual(2);
      await page.waitForTimeout(800);
      await page.addStyleTag({ content: '.rs-lokanta .rs-kisi{pointer-events:auto!important}' });
      // 6 nokta: her oturanın masa üstünün ön kenarının altında sol / orta / sağ → masa (kişi değil)
      const sonuc = await page.evaluate(() => {
        const r: string[] = [];
        for (const m of document.querySelectorAll<HTMLElement>('.rs-masa')) {
          const mr = m.getBoundingClientRect();
          for (const f of [0.3, 0.42, 0.55]) {
            const x = mr.left + mr.width * f;
            const y = mr.top + mr.height * 0.62;
            const e = document.elementFromPoint(x, y);
            if (!e) continue;
            r.push(e.closest('.rs-masa') ? 'masa' : e.closest('.rs-kisi') ? `kisi:${(e.closest('.rs-kisi') as HTMLElement).dataset.kisi}` : (e as HTMLElement).className);
          }
        }
        return r;
      });
      expect(sonuc.length).toBeGreaterThanOrEqual(6);
      expect(sonuc.filter((x) => x !== 'masa')).toEqual([]);
      // Kino masanın önünden geçer (ayağı masanın çizgisinin altında) → üstte Kino
      const yerler = await page.evaluate(() => (window as any).__rsGun.masaYerleri());
      const m0 = yerler[0];
      const onY = m0.y + (boy.width > boy.height ? 6 : 3.5);
      await page.evaluate(([x, y]) => (window as any).__rsGun.kinoYuru(x, y), [m0.x + 1, onY]);
      await page.waitForTimeout(600);
      const onde = await page.evaluate(() => {
        const k = document.querySelector<HTMLElement>('.rs-kino')!;
        const r = k.getBoundingClientRect();
        const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height * 0.5);
        return { kino: !!e?.closest('.rs-kino'), ust: e ? (e as HTMLElement).className : '' };
      });
      expect(onde.kino, onde.ust).toBe(true);
      await page.screenshot({ path: `tests/screens/restoran34-derinlik-${boy.width}x${boy.height}.png` });
      // sola yürüyünce aynalanır (bütün resim)
      await page.evaluate(([x, y]) => (window as any).__rsGun.kinoYuru(x, y), [m0.x - 8, onY]);
      await expect.poll(() => page.evaluate(() => document.querySelector<HTMLElement>('.rs-kino')!.dataset.ayna ?? '')).toBe('1');
      expect(hatalar).toEqual([]);
    });

    test('HUD: kavanoz, sandık = kayıt, defter gün içinde (alım yok); balon yüzü ve paneli örtmez', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, '&tohum=5&musteriler=anne,tombi&jeton=9');
      await expect(page.locator('.rs-hud-takvim')).toBeVisible();
      const d0 = await durum(page);
      expect(await page.locator('.rs-hud-sandik').getAttribute('data-jeton')).toBe(String(d0.kasa));
      // balon: oturan müşterinin balonu sahnenin içinde, HUD'un dışında, yüzün üstünde değil
      await expect.poll(async () => page.locator('.rs-balon').count(), { timeout: 30_000 }).toBeGreaterThanOrEqual(1);
      await page.waitForTimeout(500);
      const b = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.rs-balon')].map((e) => {
          const r = e.getBoundingClientRect();
          const k = e.closest<HTMLElement>('.rs-kisi')!;
          const kr = k.getBoundingClientRect();
          const [tepe, taban] = (k.dataset.figur ?? '0,1').split(',').map(Number);
          const fh = kr.height * (taban - tepe);
          const ust = kr.top + kr.height * tepe;
          const yuz = { left: kr.left + kr.width / 2 - fh * 0.2, right: kr.left + kr.width / 2 + fh * 0.2, top: ust + fh * 0.05, bottom: ust + fh * 0.4 };
          const s = document.querySelector('.rs-sahne')!.getBoundingClientRect();
          const h = document.querySelector('.rs-hud')!.getBoundingClientRect();
          const kes = (a: { left: number; right: number; top: number; bottom: number }, c: { left: number; right: number; top: number; bottom: number }) => a.left < c.right && c.left < a.right && a.top < c.bottom && c.top < a.bottom;
          return { yuz: kes(yuz, r), hud: kes(r, h), disari: r.left < s.left - 1 || r.right > s.right + 1 || r.top < s.top - 1 };
        }),
      );
      for (const x of b) expect(x).toEqual({ yuz: false, hud: false, disari: false });
      await page.locator('.rs-hud-takvim').click();
      // defter gün içinde açılır, karta dokununca alınmaz
      await page.locator('.rs-hud-defter').click();
      await expect(page.locator('.rs-defter.rs-df-bak')).toBeVisible();
      const kart = page.locator('.rs-df-kart').first();
      if (await kart.count()) await kart.click();
      await page.waitForTimeout(300);
      expect((await durum(page)).kasa).toBe(d0.kasa);
      expect(await page.locator('.rs-df-alindi').count()).toBe(0);
      await page.locator('.rs-df-kapat').click();
      await expect(page.locator('.rs-defter')).toHaveCount(0);
      expect(hatalar).toEqual([]);
    });

    test('bahçe alındıysa bahçeli resim, bahçe masaları bahçede, müşteri oturur', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, '&sira=1&acilan=bahce&tohum=4&musteriler=dede,bulut,anne,baba,lokum,tombi');
      const d = await durum(page);
      expect(d.bahceAcik).toBe(true);
      await expect(page.locator('.rs-arka')).toHaveAttribute('data-bahce', '1');
      const yerler = await page.evaluate(() => (window as any).__rsGun.masaYerleri());
      const bahce = yerler.filter((m: { yuva: string }) => Number(m.yuva) >= 4);
      expect(bahce.length).toBe(2);
      for (const m of bahce) expect(boy.width > boy.height ? m.x > 56 : m.y > 73).toBe(true);
      await expect.poll(async () => (await durum(page))?.masalar?.filter((m: { oturan: string | null }) => m.oturan).length ?? 0, { timeout: 40_000 }).toBeGreaterThanOrEqual(3);
      await page.screenshot({ path: `tests/screens/restoran34-bahce-${boy.width}x${boy.height}.png` });
      expect(hatalar).toEqual([]);
    });
  });
}
