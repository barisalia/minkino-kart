import { test, expect, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

// Ceren'in aynı yönergeyi bir oyunda bir kez söylediğini denetler (18 Kasım 2026, Barış: "aşırı tekrar sıkar").
// Ceren'in kayıtları Web Audio ile çalınır; çözülen her kaydın adı (derlemede sonuna özet eklenir) çalındığında listeye yazılır.
async function sesleriIzle(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { cerenSesleri: string[] };
    w.cerenSesleri = [];
    const adlar = new WeakMap<ArrayBuffer, string>();
    const oku = Response.prototype.arrayBuffer;
    Response.prototype.arrayBuffer = async function (this: Response) {
      const veri = await oku.call(this);
      adlar.set(veri, decodeURIComponent(this.url.split('/').pop()!.split('?')[0]));
      return veri;
    };
    const coz = BaseAudioContext.prototype.decodeAudioData;
    BaseAudioContext.prototype.decodeAudioData = function (this: BaseAudioContext, veri: ArrayBuffer, ...geri: [DecodeSuccessCallback?, DecodeErrorCallback?]) {
      const ad = adlar.get(veri);
      const sonuc = coz.call(this, veri, ...geri);
      if (ad) void sonuc.then(kayit => { (kayit as AudioBuffer & { ad?: string }).ad = ad; });
      return sonuc;
    } as typeof coz;
    const basla = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...a: Parameters<typeof basla>) {
      const ad = (this.buffer as (AudioBuffer & { ad?: string }) | null)?.ad;
      if (ad) w.cerenSesleri.push(ad);
      return basla.apply(this, a);
    };
    const oynat = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      w.cerenSesleri.push(decodeURIComponent((this.currentSrc || this.src).split('/').pop()!.split('?')[0]));
      return oynat.call(this);
    };
  });
}
const sesler = (page: Page) => page.evaluate(() => (window as unknown as { cerenSesleri: string[] }).cerenSesleri);
const buKayit = (s: string, ad: string) => s === ad + '.mp3' || s.startsWith(ad + '-') && /^[A-Za-z0-9_-]{8}\.mp3$/.test(s.slice(ad.length + 1));
const kacKez = async (page: Page, ad: string) => (await sesler(page)).filter(s => buKayit(s, ad)).length;
// Kaydın son çalınışının ardından başka bir kayıt başladıysa (ve arada dokunulmadıysa) o kayıt sonuna dek çalmıştır:
// Ceren'in sözleri sırayla çalınır.
const sonunaDekCaldi = async (page: Page, ad: string) => {
  const l = await sesler(page);
  const i = l.map(s => buKayit(s, ad)).lastIndexOf(true);
  return i >= 0 && l.length > i + 1;
};

// Harf Atölyesi telefonda yataya kilitlidir (src/kabuk/yon.ts → YATAY_SAYFALAR); telefon projesi yatay boyda oynar.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

test('2–3 yaşta Obur "Hangi resmi istiyorum?" yönergesini üç tabakta bir kez söyler, yanlış kartta da yinelemez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await sesleriIzle(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('obur-testi')) return;
    sessionStorage.setItem('obur-testi', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 3 }));
    localStorage.setItem('minkino-alfabe-v1-yas-2-3', JSON.stringify({ adimlar: { '02': 3 } }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-harf[data-id="02"]').click();
  const obur = page.locator('.hk');
  for (let tabak = 1; tabak <= 3; tabak++) {
    await expect(obur).toHaveAttribute('data-lokma', String(tabak), { timeout: 20_000 });
    await expect(page.locator('.hk-kart:not(:disabled)').first()).toBeVisible();
    // B ile başlayan kart doğrudur (alfabe/src/obur-tabaklari.ts → uyar); ikinci tabakta önce yanlış kart verilir.
    const kartlar = await page.locator('.hk-kart:not(:disabled)').evaluateAll(el => el.map(k => k.getAttribute('aria-label') ?? ''));
    const dogru = kartlar.find(ad => ad.toLocaleUpperCase('tr').startsWith('B'))!;
    // Çocuk gibi: ilk tabakta yönergeyi sonuna dek dinler (paket hızlı açılınca dokunuş yönergeyi kesebiliyordu).
    if (tabak === 1) await expect.poll(() => sonunaDekCaldi(page, 'obur-kucuk'), { timeout: 15_000 }).toBe(true);
    if (tabak === 2) {
      const yanlis = kartlar.find(ad => !ad.toLocaleUpperCase('tr').startsWith('B'))!;
      await page.locator('.hk-kart[aria-label="' + yanlis + '"]').click();
      await expect.poll(() => kacKez(page, 'obur-bir-daha'), { timeout: 15_000 }).toBe(1);
      // Kart tabağa dönüp Ceren susana dek Obur yeni lokma almaz; çocuk gibi yeniden dokunulur.
      await expect(async () => {
        await page.locator('.hk-kart[aria-label="' + dogru + '"]').click({ timeout: 2_000 });
        await expect(obur).toHaveAttribute('data-lokma', '3', { timeout: 4_000 });
      }).toPass({ timeout: 30_000 });
      continue;
    }
    await page.locator('.hk-kart[aria-label="' + dogru + '"]').click();
  }
  await expect(obur).toHaveAttribute('data-asama', 'son', { timeout: 20_000 });
  expect(await kacKez(page, 'obur-kucuk')).toBe(1);
  expect(hatalar).toEqual([]);
});

test('2–3 yaşta Obur: çocuk ilk yönergeyi keserse yönerge ikinci tabakta sonuna dek söylenir, üçüncüde söylenmez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await sesleriIzle(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('obur-kesme')) return;
    sessionStorage.setItem('obur-kesme', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 3 }));
    localStorage.setItem('minkino-alfabe-v1-yas-2-3', JSON.stringify({ adimlar: { '02': 3 } }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-harf[data-id="02"]').click();
  const obur = page.locator('.hk');
  const dogruKart = async () => {
    const kartlar = await page.locator('.hk-kart:not(:disabled)').evaluateAll(el => el.map(k => k.getAttribute('aria-label') ?? ''));
    return page.locator('.hk-kart[aria-label="' + kartlar.find(ad => ad.toLocaleUpperCase('tr').startsWith('B')) + '"]');
  };
  await expect(obur).toHaveAttribute('data-lokma', '1', { timeout: 20_000 });
  // Yönerge başlar başlamaz doğru karta dokunulur: yönerge yarıda kesilir.
  await expect.poll(() => kacKez(page, 'obur-kucuk'), { timeout: 15_000 }).toBe(1);
  await (await dogruKart()).click();
  await expect(obur).toHaveAttribute('data-lokma', '2', { timeout: 20_000 });
  // Tabağın kendi isteği olarak; 12 sn sonraki boşta hatırlatmayı beklemeden (alfabe/src/bos-bekle.ts).
  await expect.poll(() => kacKez(page, 'obur-kucuk'), { timeout: 6_000 }).toBe(2);
  await expect.poll(() => sonunaDekCaldi(page, 'obur-kucuk'), { timeout: 15_000 }).toBe(true);
  await (await dogruKart()).click();
  await expect(obur).toHaveAttribute('data-lokma', '3', { timeout: 20_000 });
  await (await dogruKart()).click();
  await expect(obur).toHaveAttribute('data-asama', 'son', { timeout: 20_000 });
  expect(await kacKez(page, 'obur-kucuk')).toBe(2);
  expect(hatalar).toEqual([]);
});

test('Manyetik Pano bitince Ceren bir kez "Üç sözcüğü de kurdun!" der', async ({ page }) => {
  const hatalar = hataTopla(page);
  await sesleriIzle(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('pano-testi')) return;
    sessionStorage.setItem('pano-testi', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    // Son hece dışında hepsi yerinde (alfabe/src/hece-pano-kaydi.ts → turuGetir).
    localStorage.setItem('minkino-hece-pano-tur-v1', JSON.stringify({ kartlar: ['kiraz', 'kelebek', 'ucurtma'],
      taslar: ['ke', 'raz', 'u', 'ma', 'le', 'ki', 'çurt', 'bek'], yardim: [],
      dolu: ['kiraz-0', 'kiraz-1', 'kelebek-0', 'kelebek-1', 'kelebek-2', 'ucurtma-0', 'ucurtma-1'] }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-hece-ac').click();
  await page.getByRole('button', { name: 'Manyetik Hece Bulmacası' }).click();
  await page.locator('.hp-tas:enabled', { hasText: /^ma$/ }).click();
  await page.locator('.hp-yuva[data-konum="ucurtma-2"]').click();
  await expect(page.locator('.hp-son')).toBeVisible();
  await expect.poll(() => kacKez(page, 'pano-buldu'), { timeout: 15_000 }).toBe(1);
  expect(hatalar).toEqual([]);
});

test('Resimde Bul dersin son adımıdır: iki nesne bulununca Ceren "sıradaki oyun" demez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await sesleriIzle(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('bul-testi')) return;
    sessionStorage.setItem('bul-testi', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 3 }));
    localStorage.setItem('minkino-alfabe-v1-yas-2-3', JSON.stringify({ adimlar: { '01': 8 } }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-harf[data-id="01"]').click();
  // Sahnenin ilk iki nesnesi aranan nesnelerdir (alfabe/src/resimde-bul.ts).
  for (const i of [0, 1]) {
    await page.locator('.rb-hit[data-item="' + i + '"]').dispatchEvent('click');
    await expect.poll(() => kacKez(page, 'bul-yeni-01-' + i), { timeout: 15_000 }).toBe(1);
  }
  await expect.poll(() => kacKez(page, 'bul-yeni-ikisi'), { timeout: 15_000 }).toBe(1);
  expect(await kacKez(page, 'bul-yeni-bitti')).toBe(0);
  await page.locator('.rb-next').click();
  await expect(page.locator('.ka-son')).toBeVisible({ timeout: 15_000 });
  expect(hatalar).toEqual([]);
});
