import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Mino Ne Giysin? · Yardımcı Mino (mino-giysin/, ekip/senaryo/MINO-NE-GIYSIN.md §13). Telefon önce: 844×390 ve
 * 390×844, DPR 3. Oda (seçenekler, fırlat-yakala, ikinci şapka eskisini fırlatır, kapı), 4 dert × 4 alet (8 çözüm,
 * 8 komik başarısızlık, sahne içi sepet), yaş farkı (5-6: basamak / "Kaç güm?" / ikinci yol), 8 gizli sürpriz,
 * kostüm partisi ve geçit, zoom yok (resim kaynak boyunun üstünde çizilmez), yüzler örtüşmez, konsol hatası yok.
 */
const BOYLAR = [
  { ad: 'yatay', viewport: { width: 844, height: 390 } },
  { ad: 'dikey', viewport: { width: 390, height: 844 } },
];
const ADRES = 'mino-giysin/?test=1&sifirla=1';

const ekran = (page: Page) => page.locator('.ekran:not(.cikiyor)').getAttribute('data-ekran');
const ekranBekle = (page: Page, e: string) => expect.poll(() => ekran(page), { timeout: 15000 }).toBe(e);
const adim = (page: Page, sec = '.mg-dert') => page.locator(`${sec}:not(.cikiyor)`).getAttribute('data-adim');
const giyili = (page: Page) => page.locator('.ekran:not(.cikiyor) .mg-mino').first().getAttribute('data-giyili');

/** Öğenin ortasına dokun (üstteki şeffaf katmanlardan bağımsız, ekran noktası) */
async function dokun(page: Page, sec: string) {
  const k = (await page.locator(sec).first().boundingBox())!;
  await page.mouse.click(k.x + k.width / 2, k.y + k.height / 2);
  await page.waitForTimeout(120);
}
async function surukle(page: Page, kaynak: string, hedef: string) {
  const a = (await page.locator(kaynak).first().boundingBox())!;
  const b = (await page.locator(hedef).first().boundingBox())!;
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
  await page.waitForTimeout(200);
}
/** Basılı tut (sulama) */
async function tut(page: Page, sec: string, ms = 600) {
  const k = (await page.locator(sec).first().boundingBox())!;
  await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
  await page.waitForTimeout(150);
}

/** Zoom yok: her resim (img ve Mino'daki kostüm <image>) ekrandaki boyu × 3 ≤ doğal boyu (SVG sınırsız) */
async function zoomlar(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const DPR = 3;
    const sorun: string[] = [];
    const dogal = (src: string) =>
      new Promise<[number, number]>((r) => {
        const i = new Image();
        i.onload = () => r([i.naturalWidth, i.naturalHeight]);
        i.onerror = () => r([0, 0]);
        i.src = src;
      });
    const ekr = document.querySelector('.ekran:not(.cikiyor)')!;
    const imgs = [...ekr.querySelectorAll<HTMLImageElement>('img')].filter((i) => i.getBoundingClientRect().width > 0 && !/\.svg(\?|$)/.test(i.src) && getComputedStyle(i).opacity !== '0');
    for (const i of imgs) {
      // arka plan (oda zemini, sahne katmanları): cover; dikey odada kaynak 1080 px (bilinen sınır, ayrı denetlenir)
      if (i.classList.contains('mg-zemin')) continue;
      const r = i.getBoundingClientRect();
      const [nw, nh] = [i.naturalWidth, i.naturalHeight];
      if (!nw) continue;
      const fit = getComputedStyle(i).objectFit;
      const k = fit === 'cover' ? Math.max(r.width / nw, r.height / nh) : fit === 'contain' ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
      if (k * DPR > 1.03) sorun.push(`${i.className || i.src.split('/').pop()}: ${(k * DPR).toFixed(2)}`);
    }
    for (const im of ekr.querySelectorAll<SVGImageElement>('image.m-kostum')) {
      const src = im.getAttribute('href') ?? '';
      if (/\.svg(\?|$)/.test(src)) continue;
      const [nw, nh] = await dogal(src);
      const r = im.getBoundingClientRect();
      const k = Math.min(r.width / nw, r.height / nh);
      if (k * DPR > 1.03) sorun.push(`kostum ${im.getAttribute('class')}: ${(k * DPR).toFixed(2)}`);
    }
    return sorun;
  });
}

/** Yüzler örtüşmez: Mino'nun yüzü ile odadaki arkadaşların yüzleri (yaklaşık yüz kutuları) birbirine binmez */
async function yuzOrtusmesi(page: Page): Promise<number> {
  return page.evaluate(() => {
    const ekr = document.querySelector('.ekran:not(.cikiyor)')!;
    const kutu = (e: Element, x0: number, x1: number, y0: number, y1: number) => {
      const r = e.getBoundingClientRect();
      return { l: r.left + r.width * x0, r: r.left + r.width * x1, t: r.top + r.height * y0, b: r.top + r.height * y1 };
    };
    const yuzler = [kutu(ekr.querySelector('.mg-mino .mino-svg')!, 0.2, 0.8, 0.12, 0.55)];
    for (const a of ekr.querySelectorAll('.mg-arkadaslar .mg-ark')) yuzler.push(kutu(a, 0.36, 0.64, 0.12, 0.38));
    let t = 0;
    for (let i = 0; i < yuzler.length; i++)
      for (let j = i + 1; j < yuzler.length; j++) {
        const a = yuzler[i];
        const b = yuzler[j];
        t += Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
      }
    return Math.round(t);
  });
}

/** Dert sahnesinde aleti dene: eldeki aleti arkadaşa sürükle */
async function dene(page: Page) {
  await expect.poll(() => adim(page), { timeout: 10000 }).toMatch(/hazir|denendi|ikinci/);
  const durum = () => page.evaluate(() => { const d = document.querySelector<HTMLElement>('.mg-dert:not(.cikiyor)'); return d ? `${d.dataset.adim}|${d.dataset.son}` : 'yok'; });
  const once = await durum();
  await surukle(page, '.mg-elde', '.mg-dert .mg-sahne .mg-ark');
  // bırakış bir karede kaçtıysa (Mino o an sekiyordu) çocuk gibi bir kez daha dener
  await page.waitForTimeout(400);
  if ((await durum()) === once) await surukle(page, '.mg-elde', '.mg-dert .mg-sahne .mg-ark');
}

/** Sahne içi sepetten alet seç; Mino kapınca biter (dokunuş bir karede kaçtıysa bir kez daha) */
async function aletSec(page: Page, alet: string) {
  const id = { merdiven: 'alet-itfaiye', kasik: 'alet-asci', sulama: 'alet-bahce', stetoskop: 'alet-doktor' }[alet]!;
  const elde = () => page.locator('.mg-dert:not(.cikiyor) .mg-mino').getAttribute('data-giyili');
  await dokun(page, `.mg-dert .mg-sepet-dugme[data-alet="${alet}"]`);
  await page.waitForTimeout(300);
  if (!(await elde())?.includes(id)) await dokun(page, `.mg-dert .mg-sepet-dugme[data-alet="${alet}"]`);
  await expect.poll(elde).toContain(id);
}

/** Çözüm başladı (el hareketi gerekmeyen çözümde test modunda sahne hemen odaya dönebilir) */
async function cozumBasladi(page: Page, alet: string) {
  await expect
    .poll(() => page.evaluate(() => document.querySelector<HTMLElement>('.mg-dert:not(.cikiyor)')?.dataset.son ?? 'oda'), { timeout: 8000 })
    .toMatch(new RegExp(`^(cozum:${alet}|oda)$`));
}

/** Çözümün el hareketleri (test modunda süreler kısa) */
async function cozumHareketi(page: Page, dert: string, alet: string, yas: number) {
  const kez = yas >= 5 ? 3 : 1;
  if (dert === 'pamuk' && alet === 'merdiven') {
    if (yas >= 5) for (let i = 0; i < 3; i++) {
      await expect(page.locator('.mg-basamak.hedef')).toHaveCount(1, { timeout: 8000 });
      await dokun(page, '.mg-basamak.hedef');
    }
  } else if (dert === 'pamuk' && alet === 'kasik') {
    for (let i = 0; i < 3; i++) {
      await expect(page.locator('.mg-mama-kabi.hedef')).toHaveCount(1, { timeout: 8000 });
      await dokun(page, '.mg-mama-kabi');
    }
  } else if (dert === 'kino' && alet === 'stetoskop') {
    if (yas >= 5) {
      await expect(page.locator('.mg-sayi')).toHaveCount(3, { timeout: 8000 });
      await dokun(page, '.mg-sayi[data-sayi="2"]');
      await page.waitForTimeout(300);
      await dokun(page, '.mg-sayi[data-sayi="3"]');
    }
  } else if (dert === 'kino' && alet === 'kasik') {
    for (let i = 0; i < kez; i++) {
      await expect(page.locator('.mg-agiz.hedef')).toHaveCount(1, { timeout: 8000 });
      await dokun(page, '.mg-agiz');
    }
  } else if (dert === 'ege' && alet === 'kasik') {
    await expect(page.locator('.mg-tencere.hedef')).toHaveCount(1, { timeout: 8000 });
    for (let i = 0; i < 3; i++) await dokun(page, '.mg-tencere');
    for (let i = 0; i < kez; i++) {
      await expect(page.locator('.mg-agiz.hedef')).toHaveCount(1, { timeout: 8000 });
      await dokun(page, '.mg-agiz');
    }
  } else if (dert === 'ege' && alet === 'merdiven') {
    await expect(page.locator('.mg-kavanoz.hedef')).toHaveCount(1, { timeout: 8000 });
    await dokun(page, '.mg-kavanoz');
  } else if (dert === 'ada' && alet === 'sulama') {
    for (let i = 0; i < (yas >= 5 ? 3 : 2); i++) {
      await expect(page.locator('.mg-cicek.hedef')).toHaveCount(1, { timeout: 8000 });
      // kabı çiçeğin üstüne götürüp orada tut
      await surukle(page, '.mg-elde', '.mg-cicek.hedef');
    }
  } else if (dert === 'ada' && alet === 'kasik') {
    for (let i = 0; i < (yas >= 5 ? 3 : 2); i++) {
      await expect(page.locator('.mg-cicek.hedef')).toHaveCount(1, { timeout: 8000 });
      await surukle(page, '.mg-elde', '.mg-cicek.hedef');
    }
  }
}

const SONUC: Record<string, { cozum: string[]; komik: string[] }> = {
  pamuk: { cozum: ['merdiven', 'kasik'], komik: ['sulama', 'stetoskop'] },
  kino: { cozum: ['stetoskop', 'kasik'], komik: ['sulama', 'merdiven'] },
  ege: { cozum: ['kasik', 'merdiven'], komik: ['stetoskop', 'sulama'] },
  ada: { cozum: ['sulama', 'kasik'], komik: ['stetoskop', 'merdiven'] },
};

for (const boy of BOYLAR) {
  test.describe(`Mino Ne Giysin? ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3 });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    test('oda: en az 3 seçenek, fırlat-yakala, ikinci şapka eskisini fırlatır, kapı', async ({ page }) => {
      const hatalar = hataTopla(page);
      await page.goto(`${ADRES}&yas=4`);
      await ekranBekle(page, 'oda');
      // açılış bitsin (balonlar sırayla açılır; ilk sayfada soğuk başlangıç uzun sürebilir)
      await expect.poll(() => page.locator('.mg-oda').getAttribute('data-adim'), { timeout: 15000 }).toBe('balon');
      await expect(page.locator('.mg-yardim')).toHaveCount(4);
      await expect(page.locator('.mg-goz')).toHaveCount(8);
      await expect(page.locator('.mg-sepet-dugme')).toHaveCount(4);
      await expect(page.locator('.mg-yildiz')).toHaveCount(8);
      // alet yokken kapı: şaka (çıkmaz)
      await dokun(page, '.mg-kapi');
      await expect.poll(() => ekran(page)).toBe('oda');
      // dert seç
      await dokun(page, '.mg-yardim[data-dert="pamuk"]');
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-secili', 'pamuk');
      // şapka: dokun, sonra ikinci şapka (eskisi dolaba döner, kaybolmaz)
      await dokun(page, '.mg-goz[data-parca="bas-itfaiye"]');
      await expect.poll(() => giyili(page)).toContain('bas-itfaiye');
      await expect(page.locator('.mg-goz[data-parca="bas-itfaiye"]')).toHaveClass(/bos/);
      await dokun(page, '.mg-goz[data-parca="bas-asci"]');
      await expect.poll(() => giyili(page)).toContain('bas-asci');
      await expect.poll(() => giyili(page)).not.toContain('bas-itfaiye');
      await expect(page.locator('.mg-goz[data-parca="bas-itfaiye"]')).not.toHaveClass(/bos/, { timeout: 5000 });
      // üst: Mino'ya sürükle (neresine bırakılırsa bırakılsın yerine oturur)
      await surukle(page, '.mg-goz[data-parca="ust-doktor"]', '.mg-mino');
      await expect.poll(() => giyili(page)).toContain('ust-doktor');
      // Mino'dan uzağa bırakılan parça yerine geri seker
      await surukle(page, '.mg-goz[data-parca="ust-bahce"]', '.mg-yardim[data-dert="ada"]');
      await expect.poll(() => giyili(page)).not.toContain('ust-bahce');
      await expect(page.locator('.mg-goz[data-parca="ust-bahce"]')).not.toHaveClass(/bos/, { timeout: 5000 });
      // alet sepetten
      await dokun(page, '.mg-sepet-dugme[data-alet="merdiven"]');
      await expect.poll(() => giyili(page)).toContain('alet-itfaiye');
      expect(await zoomlar(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/mino-giysin-${boy.ad}-oda.png` });
      await dokun(page, '.mg-kapi');
      await ekranBekle(page, 'dert');
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-dert', 'pamuk');
      expect(hatalar).toEqual([]);
    });

    for (const dert of Object.keys(SONUC)) {
      test(`${dert}: 2 çözüm (3-4 ve 5-6) ve 2 komik başarısızlık + sahne içi sepet`, async ({ page }) => {
        const hatalar = hataTopla(page);
        const { cozum, komik } = SONUC[dert];
        // komik başarısızlık → sepet açılır → çözüm aletine geçilir → çözülür (3-4)
        for (const k of komik) {
          await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=${k}&yas=3`);
          await ekranBekle(page, 'dert');
          await dene(page);
          await expect(page.locator('.mg-dert')).toHaveAttribute('data-son', `komik:${k}`);
          await expect(page.locator('.mg-dert.sepet-acik')).toHaveCount(1, { timeout: 15000 });
          await expect.poll(() => adim(page), { timeout: 15000 }).toBe('denendi');
        }
        // sepetten çözüm aleti, 3-4 yaşta
        await aletSec(page, cozum[0]);
        await dene(page);
        await cozumBasladi(page, cozum[0]);
        await cozumHareketi(page, dert, cozum[0], 3);
        await ekranBekle(page, 'oda');
        // arkadaş odaya geldi, yıldız doldu
        await expect(page.locator(`.mg-arkadaslar .mg-ark[data-kim="${dert}"]`)).toHaveCount(1);
        await expect(page.locator(`.mg-yildiz.dolu[data-yildiz="${dert}:${cozum[0]}"]`)).toHaveCount(1);
        // 5-6: ilk çözüm, "başka yol?" → ikinci çözüm
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=${cozum[0]}&yas=6`);
        await ekranBekle(page, 'dert');
        await dene(page);
        await cozumHareketi(page, dert, cozum[0], 6);
        await expect.poll(() => adim(page), { timeout: 20000 }).toBe('ikinci');
        await expect(page.locator('.mg-dert.kapi-acik')).toHaveCount(1);
        if (dert === 'pamuk') await page.screenshot({ path: `tests/screens/mino-giysin-${boy.ad}-dert-ikinci.png` });
        await aletSec(page, cozum[1]);
        await dene(page);
        await cozumBasladi(page, cozum[1]);
        await cozumHareketi(page, dert, cozum[1], 6);
        await ekranBekle(page, 'oda');
        await expect(page.locator(`.mg-yildiz.dolu[data-yildiz="${dert}:${cozum[1]}"]`)).toHaveCount(1);
        expect(hatalar).toEqual([]);
      });
    }

    test('kostüm etkisi: uygun kostüm tam başarı, yanlış kostüm ek an, uygun kostüm + yanlış alet şaka', async ({ page }) => {
      const hatalar = hataTopla(page);
      const anlar = () => page.evaluate(() => (window as unknown as { __mg: { oturum: { kostumAnlari: string[] } } }).__mg.oturum.kostumAnlari);
      // uygun kostüm + doğru alet: itfaiyeci + merdiven → tam başarı, dolapta parlak yıldız; aynı derdin öbür çözümü (kaşık) normal yıldız
      await page.goto(`${ADRES}&ekran=dert&dert=pamuk&alet=merdiven&yas=3&giy=bas-itfaiye,ust-itfaiye`);
      await ekranBekle(page, 'dert');
      await dene(page);
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-kostum', 'tam');
      await cozumHareketi(page, 'pamuk', 'merdiven', 3);
      await ekranBekle(page, 'oda');
      expect(await anlar()).toContain('tam:pamuk:merdiven');
      await expect(page.locator('.mg-yildiz.dolu.tam[data-yildiz="pamuk:merdiven"]')).toHaveCount(1);
      // yanlış / karışık kostüm + doğru alet: yine çözülür, arada komik ek an (8 çözümün her biri; şapkalı ve şapkasız)
      const EK: [string, string, string, string][] = [
        ['pamuk', 'merdiven', 'bas-asci,ust-itfaiye', 'pamuk:merdiven:sapka'],
        ['pamuk', 'merdiven', '', 'pamuk:merdiven:kafa'],
        ['pamuk', 'kasik', 'bas-doktor', 'pamuk:kasik'],
        ['kino', 'stetoskop', 'bas-bahce,ust-doktor', 'kino:stetoskop:sapka'],
        ['kino', 'stetoskop', '', 'kino:stetoskop:gidik'],
        ['kino', 'kasik', 'bas-itfaiye', 'kino:kasik'],
        ['ege', 'kasik', 'ust-asci', 'ege:kasik'],
        ['ege', 'merdiven', 'bas-asci,ust-asci', 'ege:merdiven'],
        ['ada', 'sulama', '', 'ada:sulama'],
        ['ada', 'kasik', 'bas-bahce,ust-bahce', 'ada:kasik'],
      ];
      for (const [dert, alet, giy, ad] of EK) {
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=${alet}&yas=3&giy=${giy}`);
        await ekranBekle(page, 'dert');
        await dene(page);
        await expect.poll(() => page.evaluate(() => document.querySelector<HTMLElement>('.mg-dert:not(.cikiyor)')?.dataset.kostum ?? 'oda'), { message: ad }).toMatch(/^(ek|oda)$/);
        await cozumHareketi(page, dert, alet, 3);
        await ekranBekle(page, 'oda');
        expect(await anlar(), ad).toContain(ad);
        await expect(page.locator(`.mg-yildiz.dolu[data-yildiz="${dert}:${alet}"]`)).toHaveCount(1);
        await expect(page.locator(`.mg-yildiz.tam[data-yildiz="${dert}:${alet}"]`)).toHaveCount(0);
      }
      // derde uygun kostüm + yanlış alet: kostüme özel şaka, sepette kostümün kendi aleti zıplar
      const SAKA: [string, string, string, string][] = [
        ['pamuk', 'sulama', 'bas-itfaiye,ust-itfaiye', 'itfaiye'],
        ['kino', 'merdiven', 'bas-doktor,ust-doktor', 'doktor'],
        ['ege', 'stetoskop', 'bas-asci,ust-asci', 'asci'],
        ['ada', 'stetoskop', 'bas-bahce,ust-bahce', 'bahce'],
      ];
      for (const [dert, alet, giy, rol] of SAKA) {
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=${alet}&yas=3&giy=${giy}`);
        await ekranBekle(page, 'dert');
        await dene(page);
        await expect(page.locator('.mg-dert')).toHaveAttribute('data-kostum', 'saka');
        await expect.poll(() => adim(page), { timeout: 15000 }).toBe('denendi');
        await expect(page.locator('.mg-dert.sepet-acik')).toHaveCount(1);
        expect(await anlar()).toContain(`saka:${rol}`);
      }
      // uygun olmayan kostüm + yanlış alet: yalnız tablodaki komik başarısızlık
      await page.goto(`${ADRES}&ekran=dert&dert=pamuk&alet=sulama&yas=3&giy=bas-doktor,ust-doktor`);
      await ekranBekle(page, 'dert');
      await dene(page);
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-kostum', 'yok');
      await expect.poll(() => adim(page), { timeout: 15000 }).toBe('denendi');
      expect(await anlar()).toEqual([]);
      expect(hatalar).toEqual([]);
    });

    test('dikey: üst boşluk dolu (oda penceresi, sahne üstü)', async ({ page }) => {
      test.skip(boy.ad !== 'dikey');
      const hatalar = hataTopla(page);
      await page.goto(`${ADRES}&yas=4`);
      await ekranBekle(page, 'oda');
      await page.waitForTimeout(400);
      // pencere balonlarla Mino arasında, ikisine de binmez
      await expect.poll(async () => (await page.locator('.mg-oda .mg-pencere').boundingBox())?.height ?? 0).toBeGreaterThan(150);
      const p = (await page.locator('.mg-oda .mg-pencere').boundingBox())!;
      const b = (await page.locator('.mg-yardim').first().boundingBox())!;
      expect(p.height).toBeGreaterThan(150);
      expect(p.y).toBeGreaterThanOrEqual(b.y + b.height);
      expect(await zoomlar(page)).toEqual([]);
      for (const dert of Object.keys(SONUC)) {
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=kasik&yas=4`);
        await ekranBekle(page, 'dert');
        await expect.poll(() => adim(page)).toBe('hazir');
        // sahnenin üstünde düz dolgu kalmaz: ya sahne üstten başlar ya da üstte gök / duvar resmi var
        const ust = await page.evaluate(() => {
          const d = document.querySelector<HTMLElement>('.mg-dert:not(.cikiyor)')!;
          const s = d.querySelector<HTMLElement>('.mg-sahne')!.getBoundingClientRect();
          const g = d.querySelector<HTMLElement>('.mg-gok')!.getBoundingClientRect();
          return { sahneUst: s.top, gokAlt: g.height ? g.bottom : 0 };
        });
        expect(ust.sahneUst <= 8 || ust.gokAlt >= ust.sahneUst, dert).toBe(true);
        if (dert === 'ege') {
          // mutfak üstten başlar; altındaki boşlukta zemin çizimi (alt kenara kadar, sahnenin altına girer)
          const alt = await page.evaluate(() => {
            const d = document.querySelector<HTMLElement>('.mg-dert:not(.cikiyor)')!;
            const s = d.querySelector<HTMLElement>('.mg-sahne')!.getBoundingClientRect();
            const z = d.querySelector<HTMLElement>('.mg-zemin-alt')!.getBoundingClientRect();
            return { sahneAlt: s.bottom, zUst: z.top, zAlt: z.bottom, zSol: z.left, zSag: z.right, H: innerHeight, W: innerWidth };
          });
          expect(alt.zUst).toBeLessThanOrEqual(alt.sahneAlt);
          expect(alt.zAlt).toBeGreaterThanOrEqual(alt.H - 1);
          expect(alt.zSol <= 0 && alt.zSag >= alt.W).toBe(true);
        }
        expect(await zoomlar(page), dert).toEqual([]);
      }
      expect(hatalar).toEqual([]);
    });

    test('karakterler ekranda: Mino ve arkadaş sahnede kesilmez, ağaçtaki Pamuk ekranın üstünden taşmaz', async ({ page }) => {
      const hatalar = hataTopla(page);
      const kutular = () =>
        page.evaluate(() => {
          const d = document.querySelector('.mg-dert:not(.cikiyor)')!;
          const r = (e: Element) => e.getBoundingClientRect();
          return { W: innerWidth, mino: r(d.querySelector('.mg-mino .mino-svg')!).toJSON(), ark: r(d.querySelector('.mg-sahne .mg-ark')!).toJSON() };
        });
      for (const dert of Object.keys(SONUC)) {
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=kasik&yas=6`);
        await ekranBekle(page, 'dert');
        await expect.poll(() => adim(page)).toBe('hazir');
        const k = await kutular();
        // çizim kutularının kenarında boşluk var (kuyruk, kulak payı): kutunun en çok %12'si dışarıda kalabilir
        expect(k.mino.left, `${dert} Mino sol`).toBeGreaterThan(-k.mino.width * 0.12);
        expect(k.mino.right, `${dert} Mino sağ`).toBeLessThan(k.W + k.mino.width * 0.12);
        expect(k.ark.left, `${dert} arkadaş sol`).toBeGreaterThan(-k.ark.width * 0.2);
        expect(k.ark.right, `${dert} arkadaş sağ`).toBeLessThan(k.W + k.ark.width * 0.2);
        expect(k.ark.top, `${dert} arkadaş üst`).toBeGreaterThan(-k.ark.height * 0.12);
      }
      // sulama şakası: Pamuk bir dal yukarı tırmanır ama başı ekranın içinde kalır
      await page.goto(`${ADRES}&ekran=dert&dert=pamuk&alet=sulama&yas=4`);
      await ekranBekle(page, 'dert');
      await dene(page);
      await expect.poll(() => adim(page), { timeout: 15000 }).toBe('denendi');
      const k = await kutular();
      expect(k.ark.top).toBeGreaterThan(-k.ark.height * 0.12);
      expect(hatalar).toEqual([]);
    });

    test('dert sahnesi: zoom yok, ipucu ilk parlaması geç', async ({ page }) => {
      const hatalar = hataTopla(page);
      for (const dert of Object.keys(SONUC)) {
        await page.goto(`${ADRES}&ekran=dert&dert=${dert}&alet=kasik&yas=4`);
        await ekranBekle(page, 'dert');
        await expect.poll(() => adim(page)).toBe('hazir');
        expect(await zoomlar(page), dert).toEqual([]);
        await expect(page.locator('.parla')).toHaveCount(0);
        if (dert === 'ege') await page.screenshot({ path: `tests/screens/mino-giysin-${boy.ad}-dert-ege.png` });
      }
      expect(hatalar).toEqual([]);
    });

    test('gizli sürprizler ve kostüm partisi', async ({ page }) => {
      const hatalar = hataTopla(page);
      // 1 sepete hızlı üç dokunuş: banyo ördeği
      await page.goto(`${ADRES}&yas=6`);
      await ekranBekle(page, 'oda');
      const g = (await page.locator('.mg-oda .mg-sepet-govde').boundingBox())!;
      for (let i = 0; i < 3; i++) await page.mouse.click(g.x + g.width * 0.25, g.y + g.height * 0.86);
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-surpriz', 'ordek', { timeout: 3000 });
      // 2 ayna
      await dokun(page, '.mg-ayna');
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-surpriz', 'ayna');
      // 3 kuyruk mırlar, göbek gıdıklanır
      await page.waitForTimeout(700);
      const m = (await page.locator(".mg-oda .mino-svg").boundingBox())!;
      await page.mouse.click(m.x + m.width * 0.5, m.y + m.height * 0.75);
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-surpriz', 'gidik');
      await page.mouse.click(m.x + m.width * 0.78, m.y + m.height * 0.64);
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-surpriz', 'mir');
      // 4 ağaçkakan
      await page.goto(`${ADRES}&ekran=dert&dert=pamuk&alet=stetoskop&yas=6`);
      await ekranBekle(page, 'dert');
      await dene(page);
      await expect(page.locator('.mg-kus.acik')).toHaveCount(1, { timeout: 8000 });
      await expect.poll(() => adim(page), { timeout: 15000 }).toBe('denendi');
      await dokun(page, '.mg-kus');
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-surpriz', 'agackakan');
      // 5 mantar (5-6, sulama)
      await page.goto(`${ADRES}&ekran=dert&dert=ada&alet=sulama&yas=6`);
      await ekranBekle(page, 'dert');
      await dene(page);
      await expect(page.locator('.mg-cicek.hedef')).toHaveCount(1, { timeout: 8000 });
      await surukle(page, '.mg-elde', '.mg-mantar');
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-surpriz', 'mantar');
      // 6 Ege'nin ayağı
      await page.goto(`${ADRES}&ekran=dert&dert=ege&alet=stetoskop&yas=6`);
      await ekranBekle(page, 'dert');
      await expect.poll(() => adim(page)).toBe('hazir');
      await dokun(page, '.mg-ayak');
      await expect(page.locator('.mg-dert')).toHaveAttribute('data-surpriz', 'ayak');
      // parti: 7 uçan şapka bir arkadaşın kafasına, 8 üst üste 5 aynı parça tavana
      await page.goto(`${ADRES}&ekran=parti&sapkaKafaya=1&giy=bas-doktor`);
      await ekranBekle(page, 'oda');
      await expect(page.locator('.mg-oda.parti')).toHaveCount(1);
      await expect(page.locator('.mg-arkadaslar .mg-ark')).toHaveCount(4);
      await page.waitForTimeout(400);
      expect(await yuzOrtusmesi(page)).toBe(0);
      expect(await zoomlar(page)).toEqual([]);
      await page.screenshot({ path: `tests/screens/mino-giysin-${boy.ad}-parti.png` });
      await dokun(page, '.mg-goz[data-parca="bas-asci"]');
      await expect(page.locator('.mg-oda')).toHaveAttribute('data-surpriz', 'sapka', { timeout: 4000 });
      await expect.poll(() => giyili(page)).toContain('bas-asci');
      // şapka kaybolmaz: arkadaş dolaba geri atar
      await expect(page.locator('.mg-goz[data-parca="bas-doktor"]')).not.toHaveClass(/bos/, { timeout: 6000 });
      for (let i = 0; i < 5; i++) {
        await dokun(page, '.mg-goz[data-parca="ust-itfaiye"]');
        // beşincisinde Mino 'Yeter ama!' deyip parçayı tavana fırlatır
        if (i < 4) {
          await expect.poll(() => giyili(page)).toContain('ust-itfaiye');
          // boş göze dokununca parça geri gelir
          await dokun(page, '.mg-goz[data-parca="ust-itfaiye"]');
          await expect.poll(() => giyili(page)).not.toContain('ust-itfaiye');
          await expect(page.locator('.mg-goz[data-parca="ust-itfaiye"]')).not.toHaveClass(/bos/, { timeout: 4000 });
        }
      }
      await expect(page.locator('.mg-tavanda')).toHaveCount(1, { timeout: 4000 });
      await dokun(page, '.mg-tavanda');
      await expect(page.locator('.mg-tavanda')).toHaveCount(0);
      await expect(page.locator('.mg-goz[data-parca="ust-itfaiye"]')).not.toHaveClass(/bos/, { timeout: 4000 });
      // geçit: bitince yeni tur, balonlar yine dertli
      await dokun(page, '.mg-bitir');
      await expect.poll(() => page.locator('.mg-oda:not(.cikiyor)').getAttribute('data-adim'), { timeout: 20000 }).toMatch(/balon|acilis/);
      await expect(page.locator('.mg-oda:not(.cikiyor).parti')).toHaveCount(0);
      expect(hatalar).toEqual([]);
    });
  });
}

test('tablet: oda ve sahne bozulmadan', async ({ page }, info) => {
  test.skip(info.project.name !== 'ipad');
  const hatalar = hataTopla(page);
  await page.goto(`${ADRES}&cozulen=pamuk,kino`);
  await ekranBekle(page, 'oda');
  await expect(page.locator('.mg-yardim')).toHaveCount(4);
  await page.screenshot({ path: 'tests/screens/mino-giysin-tablet-oda.png' });
  await page.goto(`${ADRES}&ekran=dert&dert=ege&alet=kasik`);
  await ekranBekle(page, 'dert');
  await page.screenshot({ path: 'tests/screens/mino-giysin-tablet-dert.png' });
  expect(hatalar).toEqual([]);
});
