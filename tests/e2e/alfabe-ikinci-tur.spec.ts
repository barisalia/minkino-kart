import { test, expect, type Page } from '@playwright/test';
import sharp from 'sharp';

/** Boyama sayfasının büyük iç bölgelerinin en iç noktaları (kova.ts ile aynı kural, uzaklık dönüşümüyle); büyükten küçüğe. */
async function bolgeNoktalari(dosya: string) {
  const { data, info } = await sharp(dosya).flatten({ background: '#fff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, n = W * H, l = new Uint8Array(n);
  for (let i = 0; i < n; i++) l[i] = (data[i * 3] * 299 + data[i * 3 + 1] * 587 + data[i * 3 + 2] * 114) / 1000;
  const et = new Int32Array(n), alan = [0], kenar = [false], yig = new Int32Array(n); let no = 0;
  for (let s = 0; s < n; s++) {
    if (et[s] || l[s] < 128) continue; no++; let u = 0, say = 0, k = false; yig[u++] = s; et[s] = no;
    while (u) {
      const p = yig[--u]; say++; const x = p % W, y = (p - x) / W; if (!x || !y || x === W - 1 || y === H - 1) k = true;
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && !et[q] && l[q] >= 128) { et[q] = no; yig[u++] = q; }
    }
    alan.push(say); kenar.push(k);
  }
  const d = new Float32Array(n);
  for (let i = 0; i < n; i++) d[i] = et[i] ? 1e9 : 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!d[i]) continue; if (x) d[i] = Math.min(d[i], d[i - 1] + 1); if (y) d[i] = Math.min(d[i], d[i - W] + 1); }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; if (!d[i]) continue; if (x < W - 1) d[i] = Math.min(d[i], d[i + 1] + 1); if (y < H - 1) d[i] = Math.min(d[i], d[i + W] + 1); }
  const en = new Map<number, { d: number; x: number; y: number; alan: number }>();
  for (let i = 0; i < n; i++) { const e = et[i]; if (!e || kenar[e] || alan[e] < n * 0.004) continue; const o = en.get(e); if (!o || d[i] > o.d) en.set(e, { d: d[i], x: i % W, y: Math.floor(i / W), alan: alan[e] }); }
  return [...en.values()].sort((a, b) => b.alan - a.alan);
}

// Harf ikinci kez oynanınca yeni içerik (alfabe/src/ikinci-tur.ts):
//  - 2–3 yaş: harf boyamasının yerine o harfle başlayan resim boyanır (boyama-resmi.ts, kova; Astra Harf-H11).
//  - 4 / 5+: Resimde Bul'da ikinci sahne (resimde-bul-ikinci.ts; Astra Harf-H12).
// Çizimler gelene dek test kipinde: boyama resmi yer tutucuyla, ikinci sahne window.__bul2 ile denenir.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

async function yasVe(page: Page, yas: number, kayit: Record<string, unknown>, tur?: Record<string, Record<string, number>>) {
  await page.addInitScript(([yas, kayit, tur]) => {
    if (sessionStorage.getItem('ikinci-tur')) return;
    sessionStorage.setItem('ikinci-tur', '1');
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, bekleyen: [], ...kayit }));
    if (tur) localStorage.setItem('minkino-ikinci-tur-v1' + ek, JSON.stringify(tur));
  }, [yas, kayit, tur] as const);
}

test('2–3 yaş: ilk açılışta harf boyanır; harf bir kez boyandıktan sonra resim gelir, dokunulan bölge dolar ve resim biter', async ({ page }) => {
  await yasVe(page, 3, { biten: [], son: '01', adimlar: { '01': 6 } }, { boya: { '01': 1 }, bul: {} });
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-harf[data-id="01"]').click();
  const kok = page.locator('.br');
  await expect(kok).toHaveAttribute('data-resim', 'ari');
  await expect(kok).toHaveAttribute('data-hazir', '1', { timeout: 15_000 });
  const gerekli = Number(await kok.getAttribute('data-gerekli'));
  expect(gerekli).toBeGreaterThanOrEqual(3);
  // Astra'nın arı resminin büyük bölgeleri (kova kuralıyla bulunur). Önce bir renk seç, sonra dokun.
  const yerler = await bolgeNoktalari('assets/alfabe/boyama-resim/ari.png');
  expect(yerler.length).toBeGreaterThanOrEqual(gerekli);
  await page.getByRole('radio', { name: 'Mavi' }).click();
  const tuval = page.locator('.br-tuval');
  const kutu = (await tuval.boundingBox())!;
  const ilk = yerler[0];
  const renk = () => tuval.evaluate((c: HTMLCanvasElement, [x, y]) => [...c.getContext('2d')!.getImageData(x, y, 1, 1).data].slice(0, 3), [ilk.x, ilk.y] as [number, number]);
  expect(await renk()).toEqual([255, 255, 255]);
  for (const y of yerler) {
    if (await kok.getAttribute('data-tamam')) break;
    await page.mouse.click(kutu.x + kutu.width * y.x / 1024, kutu.y + kutu.height * y.y / 1024);
    await page.waitForTimeout(600);
  }
  expect(await renk()).toEqual([61, 143, 224]);
  await expect(kok).toHaveAttribute('data-tamam', '1');
  await expect(page.locator('.br-ileri')).toBeVisible();
});

test('2–3 yaş: hiç boyanmamış harfte harfin kendisi boyanır (ilk içerik)', async ({ page }) => {
  await yasVe(page, 3, { biten: [], son: '01', adimlar: { '01': 6 } });
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-harf[data-id="01"]').click();
  await expect(page.locator('.boy-harf')).toBeVisible();
  await expect(page.locator('.br')).toHaveCount(0);
});

test('Resimde Bul: ikinci kez oynanan harfte ikinci sahne ve kendi kayıtları; bitince sıra yeniden ilk sahneye döner', async ({ page }) => {
  await yasVe(page, 6, { biten: ['01'], son: '01', adimlar: { '01': 8 } }, { boya: {}, bul: { '01': 1 } });
  await page.addInitScript(() => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941"><rect width="1672" height="941" fill="#dff1e4"/>' +
      '<text x="836" y="470" text-anchor="middle" font-size="60" fill="#9a6a1c">resimde-bul-2/01 · Astra</text></svg>';
    (window as { __bul2?: unknown }).__bul2 = { '01': { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), items: [
      { name: 'Araba', points: '10,20 25,20 25,45 10,45' }, { name: 'Ayı', points: '60,20 75,20 75,45 60,45' },
      { name: 'Kelebek', points: '10,60 25,60 25,85 10,85' }, { name: 'Güneş', points: '60,60 75,60 75,85 60,85' },
    ] } };
  });
  const istekler: string[] = [];
  page.on('request', r => { if (/\/ses\/bul/.test(r.url())) istekler.push(r.url().split('/').pop()!); });
  await page.goto('./alfabe/?test=1');
  await page.locator('.at-harf[data-id="01"]').click();
  await expect(page.locator('.rb')).toHaveAttribute('data-set', '2', { timeout: 15_000 });
  await expect(page.locator('.rb-hit[aria-label="Araba"]')).toHaveCount(1);
  await page.locator('.rb-hit[data-item="2"]').click();
  await page.locator('.rb-hit[data-item="0"]').click();
  await page.locator('.rb-hit[data-item="1"]').click();
  await expect(page.locator('.rb-next')).toBeVisible();
  await expect.poll(() => istekler.filter(x => x.startsWith('bul2-01-')).length, { timeout: 10_000 }).toBeGreaterThan(0);
  const tur = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-ikinci-tur-v1') || 'null'));
  expect(tur.bul['01']).toBe(2);
});
