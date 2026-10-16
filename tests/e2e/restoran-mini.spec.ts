/**
 * Tıkır Tıkır Lokanta · P2 mini oyunları tek başına (/restoran/mini.html?oyun=dogra|tava|tabakla; ekip/senaryo/
 * RESTORAN.md §12 P2 "bitti"): telefon iki yön, 3-4 ve 5-6 farkı, her komik başarısızlık en az bir kez, kesilen
 * parçalar sahnede kalır, dokunuştan ilk görüntüye ≤ 1 kare (performance ölçümü ≤ 32 ms), zoom yok, konsol hatası yok.
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
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.getAnimations().length && !i.closest('.rs-tv-elde, .rs-tb-elde, .rs-mini-sonuc'))
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
async function kaydir(page: Page, a: Nokta, b: Nokta, n = 8, bek = 12) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= n; i++) {
    await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
    if (bek) await page.waitForTimeout(bek);
  }
  await page.mouse.up();
  await page.waitForTimeout(60);
}
/** Oyun alanındaki uçuşlar bitsin (raftan tahtaya uçan sebze, dökülen parçalar); Mino'nun sonsuz döngüleri sayılmaz */
const sakin = (page: Page) =>
  page.waitForFunction(() => document.querySelectorAll('.rs-ist-alan *').length > 0 && [...document.querySelectorAll('.rs-ist-alan *')].every((e) => !e.getAnimations().some((a) => a.playState === 'running' && a.effect?.getTiming().iterations !== Infinity)), undefined, { timeout: 5000 });
const dokun = async (page: Page, p: Nokta) => {
  await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(80);
  await sakin(page);
};
const olaylar = (page: Page, ad: '__rsDogra' | '__rsTava' | '__rsTabakla') => page.evaluate((a) => (window as unknown as Record<string, { olaylar: string[] }>)[a].olaylar.slice(), ad);

/** Gecikme ölçer: her pointerdown/move'dan sonraki ilk karede (rAF) geçen süre ve o anki görüntü */
async function gecikmeKur(page: Page, secici: string) {
  await page.evaluate((s) => {
    const w = window as unknown as { __gecikme: { tur: string; ms: number; gorunur: boolean }[] };
    w.__gecikme = [];
    for (const tur of ['pointerdown']) {
      addEventListener(
        tur,
        (e) => {
          const t0 = e.timeStamp;
          requestAnimationFrame(() => {
            const el = document.querySelector(s);
            // görüntü durumu bu karede kurulmuş mu (test modunda her geçiş 1 ms sürdüğü için hesaplanmış opaklığa bakılmaz)
            w.__gecikme.push({ tur, ms: performance.now() - t0, gorunur: !!el && (!el.classList.contains('rs-dg-bicak') || el.classList.contains('rs-gorunur')) });
          });
        },
        { capture: true },
      );
    }
  }, secici);
}

const ac = async (page: Page, sorgu: string) => {
  await page.goto(`./restoran/mini.html?test=1&${sorgu}`);
  await expect(page.locator('.rs-istasyon')).toBeVisible();
  await page.waitForTimeout(300);
};

for (const boy of TELEFON) {
  test.describe(`Restoran mini oyunları telefon ${boy.ad} (${boy.yas})`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('Doğra: seç, kaydırarak kes, parçalar tahtada kalır; şlap, püre, soğan ağlatır + mendil, boş tahta "tok"; kâse tepsiye; ≤ 1 kare', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=dogra&yas=${boy.yas}&tarif=salata`);
      await gecikmeKur(page, '.rs-dg-bicak');
      // domates tahtaya
      await dokun(page, await orta(page, '.rs-dg-raf-oge[data-malzeme="domates"]'));
      const parca = page.locator('.rs-p2-parca[data-malzeme="domates"]');
      await expect(parca).toHaveCount(1);
      // domatesin üstünden dik kaydırmalar: ilk kesim şlap; aşırı kesimde püre
      for (let i = 0; i < 20; i++) {
        const d = await page.evaluate(() => (window as unknown as { __rsDogra: { durum(): { tahta: { ad: string; ozet: { kesim: string } }[] } } }).__rsDogra.durum());
        if (d.tahta.find((t) => t.ad === 'domates')?.ozet.kesim === 'pure') break;
        await page.waitForTimeout(i === 0 ? 150 : 0);
        const r = (await parca.first().boundingBox())!;
        const x = r.x + r.width * (0.3 + (i % 3) * 0.2);
        await kaydir(page, { x, y: r.y - 30 }, { x, y: r.y + r.height + 30 }, 6, 0);
        if (i === 0) {
          // parçalar sahnede kalır: iki yarım
          await expect(parca).toHaveCount(2);
          await page.screenshot({ path: `tests/screens/restoran-mini-dogra-${boy.ad}-slap.png` });
        }
      }
      let o = await olaylar(page, '__rsDogra');
      expect(o).toContain('slap');
      expect(o).toContain('pure');
      await expect(page.locator('.rs-p2-parca[data-gorunum="pure"]')).toHaveCount(1);
      // ≤ 1 kare: parmak tahtaya değince bıçak bir sonraki karede görünür
      const tb = (await page.locator('.rs-dg-tahta').boundingBox())!;
      await page.evaluate(() => ((window as unknown as { __gecikme: unknown[] }).__gecikme = []));
      for (let i = 0; i < 5; i++) {
        await page.mouse.move(tb.x + tb.width * (0.2 + i * 0.12), tb.y + tb.height * 0.2);
        await page.mouse.down();
        await page.waitForTimeout(60);
        await page.mouse.up();
        await page.waitForTimeout(40);
      }
      const g = await page.evaluate(() => (window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] }).__gecikme);
      expect(g.length).toBe(5);
      expect(g.every((x) => x.gorunur), JSON.stringify(g)).toBe(true);
      expect(Math.max(...g.map((x) => x.ms))).toBeLessThanOrEqual(32);
      // kesim de aynı karede görünür: parmak domatesin üstünden geçtiği hareketten sonraki ilk karede parça sayısı değişmiş
      await dokun(page, await orta(page, '.rs-dg-raf-oge[data-malzeme="salatalik"]'));
      const sal = (await page.locator('.rs-p2-parca[data-malzeme="salatalik"]').first().boundingBox())!;
      await page.evaluate(() => {
        const w = window as unknown as { __kesimKare: number[] };
        w.__kesimKare = [];
        addEventListener(
          'pointermove',
          (e) => {
            const once = document.querySelectorAll('.rs-p2-parca[data-malzeme="salatalik"]').length;
            const t0 = e.timeStamp;
            requestAnimationFrame(() => {
              if (document.querySelectorAll('.rs-p2-parca[data-malzeme="salatalik"]').length !== once) w.__kesimKare.push(performance.now() - t0);
            });
          },
          { capture: true },
        );
      });
      await kaydir(page, { x: sal.x + sal.width / 2, y: sal.y - 20 }, { x: sal.x + sal.width / 2, y: sal.y + sal.height + 20 }, 6, 30);
      const kk = await page.evaluate(() => (window as unknown as { __kesimKare: number[] }).__kesimKare);
      expect(kk.length).toBeGreaterThan(0);
      expect(Math.max(...kk)).toBeLessThanOrEqual(32);

      // soğan: kabuğu çek, kes; 3. kesimde Mino ağlar, Kino mendil uzatır
      await dokun(page, await orta(page, '.rs-dg-raf-oge[data-malzeme="sogan"]'));
      const sogan = page.locator('.rs-p2-parca[data-malzeme="sogan"]');
      for (let i = 0; i < 4; i++) {
        const d = await page.evaluate(() => (window as unknown as { __rsDogra: { durum(): { tahta: { ad: string; kabuk: number }[] } } }).__rsDogra.durum());
        if (!d.tahta.find((t) => t.ad === 'sogan')?.kabuk) break;
        const r = (await sogan.first().boundingBox())!;
        await kaydir(page, { x: r.x + r.width / 2, y: r.y + r.height / 2 }, { x: r.x + r.width / 2 + 70, y: r.y + r.height / 2 - 40 }, 5, 10);
      }
      expect(await olaylar(page, '__rsDogra')).toContain('soyuldu');
      for (let i = 0; i < 4; i++) {
        const r = (await sogan.first().boundingBox())!;
        const x = r.x + r.width * 0.5;
        await kaydir(page, { x, y: r.y - 30 }, { x, y: r.y + r.height + 30 }, 6, 0);
      }
      o = await olaylar(page, '__rsDogra');
      expect(o).toContain('agla');
      await expect(page.locator('.rs-dg-mendil.rs-gorunur')).toBeVisible();
      await page.screenshot({ path: `tests/screens/restoran-mini-dogra-${boy.ad}-agla.png` });
      await page.locator('.rs-dg-mendil').click();
      expect(await olaylar(page, '__rsDogra')).toContain('mendil');

      // boş tahtaya dokunuş: "tok", Mino zıplar
      const t = (await page.locator('.rs-dg-tahta').boundingBox())!;
      await dokun(page, { x: t.x + t.width * 0.5, y: t.y + 12 });
      expect(await olaylar(page, '__rsDogra')).toContain('tok');
      expect(await buyutulen(page)).toEqual([]);

      // tepsi: yelpaze + kâse tepsiye
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 5000 });
      const urun = await page.evaluate(() => (window as unknown as { __rsMiniSonuc: { tur: string; ozellik: { malzemeler: Record<string, { kesim: string }> } }[] }).__rsMiniSonuc);
      expect(urun[0].tur).toBe('dogranmis');
      expect(urun[0].ozellik.malzemeler.domates.kesim).toBe('pure');
      expect(urun[0].ozellik.malzemeler.sogan).toBeTruthy();
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Doğra: yaşa göre fark (soğan kabuğu 3-4 tek çekiş, 5-6 üç; havuç sert)', async ({ page }) => {
      await ac(page, `oyun=dogra&yas=${boy.yas}&malzemeler=sogan,havuc,salatalik`);
      await dokun(page, await orta(page, '.rs-dg-raf-oge[data-malzeme="sogan"]'));
      const d = await page.evaluate(() => (window as unknown as { __rsDogra: { durum(): { tahta: { kabuk: number }[] } } }).__rsDogra.durum());
      expect(d.tahta[0].kabuk).toBe(boy.yas === 'kucuk' ? 1 : 3);
      await dokun(page, await orta(page, '.rs-dg-raf-oge[data-malzeme="havuc"]'));
      const havuc = page.locator('.rs-p2-parca[data-malzeme="havuc"]');
      const r = (await havuc.first().boundingBox())!;
      // 3-4: her yön dilim; 5-6: yatay kaydırma dik duran havucu dilimler
      await kaydir(page, { x: r.x - 30, y: r.y + r.height * 0.5 }, { x: r.x + r.width + 30, y: r.y + r.height * 0.5 }, 6, 0);
      expect(await olaylar(page, '__rsDogra')).toContain('sert');
      await expect(havuc).toHaveCount(1);
      const r2 = (await havuc.first().boundingBox())!;
      await kaydir(page, { x: r2.x - 30, y: r2.y + r2.height * 0.5 }, { x: r2.x + r2.width + 30, y: r2.y + r2.height * 0.5 }, 6, 0);
      await expect(havuc).toHaveCount(2);
    });

    test('Tava: yağ, kâse (cızz), yumurta kenara iki vuruş, karıştır, pişme rengi, kömür yok; kabuk kaçar; menemen tepsiye', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=tava&yas=${boy.yas}&tarif=menemen`);
      await gecikmeKur(page, '.rs-tv-elde');
      await dokun(page, await orta(page, '.rs-tv-raf-oge[data-tur="yag"]'));
      await dokun(page, await orta(page, '.rs-tv-raf-oge[data-tur="kase"]'));
      expect(await olaylar(page, '__rsTava')).toEqual(expect.arrayContaining(['yag', 'dokuldu']));
      // yumurta: tavanın kenarına iki kez vur (hızlı ve sert: kabuk tavaya düşer)
      const tv = await page.evaluate(() => {
        const t = document.querySelector<HTMLElement>('.rs-tv-tava')!;
        const r = t.getBoundingClientRect();
        return { x: r.left, y: r.top, R: parseFloat(t.style.getPropertyValue('--R')) };
      });
      const yum = await orta(page, '.rs-tv-raf-oge[data-tur="yumurta"]');
      await page.evaluate(() => ((window as unknown as { __gecikme: unknown[] }).__gecikme = []));
      const ust = { x: tv.x + tv.R * 0.3, y: tv.y - tv.R * 1.7 + 34 };
      const kenar = { x: tv.x + tv.R * 0.3, y: tv.y - tv.R * 1.05 + 34 };
      await page.mouse.move(yum.x, yum.y);
      await page.mouse.down();
      const git = async (a: Nokta, b: Nokta, n: number) => {
        for (let i = 1; i <= n; i++) {
          await page.mouse.move(a.x + ((b.x - a.x) * i) / n, a.y + ((b.y - a.y) * i) / n);
          await page.waitForTimeout(8);
        }
      };
      await git(yum, ust, 5);
      await git(ust, kenar, 2);
      await git(kenar, ust, 3);
      await git(ust, kenar, 2);
      await page.mouse.up();
      let o = await olaylar(page, '__rsTava');
      expect(o).toEqual(expect.arrayContaining(['tik', 'yumurtaKirildi']));
      // ≤ 1 kare: yumurta parmağa aynı karede gelir
      const g = await page.evaluate(() => (window as unknown as { __gecikme: { ms: number; gorunur: boolean }[] }).__gecikme.filter((x) => x.gorunur));
      expect(g.length).toBeGreaterThan(0);
      expect(Math.max(...g.map((x) => x.ms))).toBeLessThanOrEqual(32);
      // bütün yumurtayı tavaya atınca kendi çatlar, kabuklar tavada; kaygan: üçüncüde çıkar
      await kaydir(page, yum, { x: tv.x, y: tv.y + 34 }, 8, 8);
      await page.waitForTimeout(200);
      o = await olaylar(page, '__rsTava');
      expect(o).toContain('butunYumurta');
      const kabuk = page.locator('.rs-tv-kabuk');
      expect(await kabuk.count()).toBeGreaterThan(0);
      for (let i = 0; i < 3; i++) {
        await kabuk.first().dispatchEvent('pointerdown');
        await page.waitForTimeout(60);
      }
      o = await olaylar(page, '__rsTava');
      expect(o).toEqual(expect.arrayContaining(['kaciyor', 'kabukCikti']));
      // karıştır (spatula dokununca kendi kendine bir tur)
      for (let i = 0; i < 6; i++) await dokun(page, await orta(page, '.rs-tv-spatula'));
      await page.waitForTimeout(300);
      expect(await olaylar(page, '__rsTava')).toContain('karistir');
      // çok uzun pişse de çıtır (kömür yok)
      await page.evaluate(() => (window as unknown as { __rsTava: { pisir(sn: number): void } }).__rsTava.pisir(600));
      const d = await page.evaluate(() => (window as unknown as { __rsTava: { durum(): { pisme: string; karisim: number } } }).__rsTava.durum());
      expect(d.pisme).toBe('citir');
      expect(await olaylar(page, '__rsTava')).toContain('dogalSon');
      await page.screenshot({ path: `tests/screens/restoran-mini-tava-${boy.ad}.png` });
      expect(await buyutulen(page)).toEqual([]);
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 5000 });
      const urun = await page.evaluate(() => (window as unknown as { __rsMiniSonuc: { tur: string; ozellik: { pisme: string; malzemeler: Record<string, unknown> } }[] }).__rsMiniSonuc);
      expect(urun[0].tur).toBe('menemen');
      expect(urun[0].ozellik.pisme).toBe('citir');
      expect(urun[0].ozellik.malzemeler.yumurta).toBeTruthy();
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Tava: pankek dök, kabarcık, fiske; 5-6 çok güçlü fiske tavana yapışır → Mino şapka; 3-4 hep tavaya döner', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=tava&yas=${boy.yas}&tarif=pankek`);
      await dokun(page, await orta(page, '.rs-tv-raf-oge[data-tur="hamur"]'));
      await expect(page.locator('.rs-tv-pankek:not([hidden])')).toBeVisible();
      await page.evaluate(() => (window as unknown as { __rsTava: { pisir(sn: number): void } }).__rsTava.pisir(7));
      await expect(page.locator('.rs-tv-pankek.rs-kabarcik')).toBeVisible();
      await page.screenshot({ path: `tests/screens/restoran-mini-tava-pankek-${boy.ad}.png` });
      // çok hızlı yukarı fiske
      const p = await orta(page, '.rs-tv-pankek');
      await kaydir(page, p, { x: p.x, y: p.y - 140 }, 3, 0);
      await page.waitForTimeout(400);
      let o = await olaylar(page, '__rsTava');
      expect(o).toContain('fiske');
      if (boy.yas === 'buyuk') {
        expect(o).toContain('tavan');
        await expect.poll(async () => (await olaylar(page, '__rsTava')).includes('sapka'), { timeout: 4000 }).toBe(true);
      } else expect(o).not.toContain('tavan');
      await page.waitForTimeout(500);
      const d = await page.evaluate(() => (window as unknown as { __rsTava: { durum(): { pankek: { cevirme: number; tavanda: boolean } } } }).__rsTava.durum());
      expect(d.pankek.tavanda).toBe(false);
      if (boy.yas === 'kucuk') expect(d.pankek.cevirme).toBe(1);
      o = await olaylar(page, '__rsTava');
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('Tabakla: boş tabak şakası; kâse dökülür, parçalar kayar, iki zeytin + ekmek = yüz; bal çizgisi; tabak tepsiye', async ({ page }) => {
      const hatalar = hataTopla(page);
      await ac(page, `oyun=tabakla&yas=${boy.yas}&tarif=pankek`);
      // boş tabak: Mino "Tabak bomboş!", yine servis
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 8000 });
      expect(await olaylar(page, '__rsTabakla')).toContain('bosTabak');
      let urun = await page.evaluate(() => (window as unknown as { __rsMiniSonuc: { tur: string; servis: boolean; ozellik: { malzemeler: object } }[] }).__rsMiniSonuc);
      expect(urun[0].tur).toBe('tabak');
      expect(urun[0].servis).toBe(true);
      expect(urun[0].ozellik.malzemeler).toEqual({});
      // yeniden: dolu tabak
      await page.locator('.rs-mini-yeniden').click();
      await expect(page.locator('.rs-tabakla')).toBeVisible();
      await page.waitForTimeout(200);
      const m = await page.evaluate(() => (window as unknown as { __rsTabakla: { merkez(): { cx: number; cy: number; R: number } } }).__rsTabakla.merkez());
      const k = (await page.locator('.rs-tabakla').boundingBox())!;
      const T = (u: number, v: number) => ({ x: k.x + m.cx + u * m.R, y: k.y + m.cy + v * m.R + 34 });
      await kaydir(page, await orta(page, '.rs-tb-urun'), T(0, 0.45), 8, 8);
      expect(await page.locator('.rs-tb-parcalar .rs-tb-parca').count()).toBeGreaterThan(2);
      await kaydir(page, await orta(page, '[data-sus="zeytin"]'), T(-0.35, -0.42), 8, 8);
      await kaydir(page, await orta(page, '[data-sus="zeytin"]'), T(0.35, -0.42), 8, 8);
      await kaydir(page, await orta(page, '[data-sus="ekmek"]'), T(0, 0.12), 8, 8);
      await page.waitForTimeout(250);
      expect(await olaylar(page, '__rsTabakla')).toContain('yuz');
      await dokun(page, await orta(page, '[data-sise="bal"]'));
      await dokun(page, await orta(page, '[data-sus="limon"]'));
      await page.screenshot({ path: `tests/screens/restoran-mini-tabakla-${boy.ad}.png` });
      expect(await buyutulen(page)).toEqual([]);
      await page.locator('.rs-tepsi-dugme').click();
      await expect(page.locator('.rs-mini-sonuc')).toBeVisible({ timeout: 5000 });
      urun = await page.evaluate(() => (window as unknown as { __rsMiniSonuc: { tur: string; servis: boolean; ozellik: { malzemeler: object; yuz?: boolean; eksi?: number; tatli?: number; sus?: number } }[] }).__rsMiniSonuc);
      const oz = urun[0].ozellik as { yuz?: boolean; eksi?: number; tatli?: number; sus?: number };
      expect(oz.yuz).toBe(true);
      expect(oz.eksi).toBeGreaterThan(0);
      expect(oz.tatli).toBeGreaterThan(0);
      expect(oz.sus).toBeGreaterThanOrEqual(4);
      expect(await olaylar(page, '__rsTabakla')).toContain('ding');
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}

for (const boy of DIGER) {
  test.describe(`Restoran mini oyunları ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));
    test('üç oyun açılır, raf ve iş alanı ekrana sığar, zoom yok', async ({ page }) => {
      for (const oyun of ['dogra', 'tava', 'tabakla']) {
        await ac(page, `oyun=${oyun}&yas=buyuk&tarif=${oyun === 'tava' ? 'menemen' : 'salata'}`);
        // raf öğeleri ≥ 64 css px ve ekranın içinde
        const raf = await page.locator('[class*="-raf-oge"]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
        for (const r of raf) {
          expect(r.width).toBeGreaterThanOrEqual(63.5);
          expect(r.right).toBeLessThanOrEqual(boy.viewport.width + 1);
          expect(r.bottom).toBeLessThanOrEqual(boy.viewport.height + 1);
        }
        await page.screenshot({ path: `tests/screens/restoran-mini-${oyun}-${boy.ad}.png` });
        expect(await buyutulen(page)).toEqual([]);
      }
    });
  });
}
