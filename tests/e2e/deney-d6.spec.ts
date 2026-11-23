import { test, expect, type Page } from '@playwright/test';

// Deneyler · Paket D6+ (deney/src/deneyler.ts): mıknatıs, gölge, buz, tohum, rampa, bardaklarla müzik. Çizimler gelmeden
// test kipinde (?test=1&hizli) adlı kutularla; uygulamada her deney kendi çizimleri ve Ceren'in kayıtları gelince görünür.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

async function ac(p: Page, yas: number) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y === 2 ? 3 : y, ...(y === 2 ? { ikiYas: true } : {}), ayarlar: { muzik: false } }));
  }, [yas] as const);
  await p.goto('/deney/eski.html?test=1&hizli');
}
const dunya = (p: Page) => p.locator('.dn-dunya');
const adim = (p: Page, a: string) => expect(dunya(p)).toHaveAttribute('data-adim', a, { timeout: 15000 });
const sesler = (p: Page) => p.evaluate(() => window.__cerenSesleri ?? []);
const kayit = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('minkino-deney-v1') || 'null'));
async function ekranda(p: Page, secici: string) {
  const v = p.viewportSize()!;
  for (const r of await p.locator(secici).evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; }))) {
    expect(r[0], secici).toBeGreaterThanOrEqual(-1);
    expect(r[1], secici).toBeGreaterThanOrEqual(-1);
    expect(r[2], secici).toBeLessThanOrEqual(v.width + 1);
    expect(r[3], secici).toBeLessThanOrEqual(v.height + 1);
  }
}
async function sec(p: Page, id: string) {
  await adim(p, 'secim');
  await p.locator('.dn-deney[data-deney="' + id + '"]').click();
}
async function defterVeEvde(p: Page, id: string) {
  await adim(p, 'defter');
  await expect(p.locator('.dn-yer.bekliyor')).toHaveAttribute('data-deney', id);
  await p.locator('.dn-yeni-cikartma').click();
  await adim(p, 'evde');
  await expect(p.locator('.dn-evde h2')).toContainText('Evde dene');
  await p.locator('.dn-evde .dn-tamam').click();
  await adim(p, 'secim');
  expect((await kayit(p)).cikartma).toContain(id);
}
const kartKapali = (p: Page) => expect(p.locator('.dn-kart')).toBeHidden({ timeout: 15000 });

test('seçim ekranı: test kipinde sekiz deney iki satırda, hepsi ekranda', async ({ page: p }) => {
  await ac(p, 4);
  await adim(p, 'secim');
  await expect(p.locator('.dn-deney')).toHaveCount(8);
  await expect(p.locator('.dn-kart')).toHaveAttribute('data-sayi', '8');
  await ekranda(p, '.dn-deney, .dn-defter-dugmesi, .nav');
});

test('5+ yaş · Mıknatıs: tahmin, mıknatısı götür (sürükleyerek de); çekenler asılı kalır; pirinç anahtar sürprizi', async ({ page: p }) => {
  await ac(p, 5);
  await sec(p, 'miknatis');
  const sonuclar: Record<string, string> = { 'teneke-kutu': 'cekti', 'tahta-blok': 'cekmedi', 'kavanoz-kapagi': 'cekti', silgi: 'cekmedi', 'metal-kova': 'cekti', anahtar: 'cekmedi' };
  for (const [i, n] of Object.keys(sonuclar).entries()) {
    await adim(p, 'mk-tahmin');
    await p.locator('.dn-secenek[data-secenek="ceker"]').click();
    await kartKapali(p);
    const el = p.locator('.dn-m-nesne.sirada');
    await expect(el).toHaveAttribute('data-nesne', n);
    if (i === 1) {
      // Mıknatısı parmakla nesnenin üstüne sürükle.
      const m = (await p.locator('.dn-miknatis').boundingBox())!, h = (await el.boundingBox())!;
      await p.mouse.move(m.x + m.width / 2, m.y + m.height / 2);
      await p.mouse.down();
      await p.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 10 });
      await p.mouse.up();
    } else await p.locator('.dn-miknatis').click();
    await expect(p.locator('.dn-m-nesne[data-nesne="' + n + '"]')).toHaveAttribute('data-sonuc', sonuclar[n], { timeout: 15000 });
  }
  await expect(p.locator('.dn-m-nesne.yapisti')).toHaveCount(3);
  await defterVeEvde(p, 'miknatis');
  const s = await sesler(p);
  expect(s.indexOf('mk-cekmedi-anahtar')).toBeLessThan(s.indexOf('mk-neden'));
  expect(s.indexOf('mk-neden')).toBeLessThan(s.indexOf('mk-sonuc'));
});

test('2–3 yaş · Mıknatıs: dört nesne, tahmin yok', async ({ page: p }) => {
  await ac(p, 2);
  await sec(p, 'miknatis');
  await expect(p.locator('.dn-m-nesne')).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(p.locator('.dn-m-nesne.sirada')).toHaveCount(1, { timeout: 15000 });
    await p.locator('.dn-miknatis').click();
    await expect(p.locator('.dn-m-nesne[data-sonuc]')).toHaveCount(i + 1, { timeout: 15000 });
  }
  expect(await sesler(p)).not.toContain('mk-sor-kavanoz-kapagi');
  await defterVeEvde(p, 'miknatis');
});

test('4 yaş · Gölge: feneri yak, tahmin; yaklaştırınca gölge büyür (sürükleyerek), uzaklaştırınca küçülür', async ({ page: p }) => {
  await ac(p, 4);
  await sec(p, 'golge');
  await adim(p, 'gl-yak');
  await expect(p.locator('.dn-golge')).toBeHidden();
  await p.locator('.dn-fener').click();
  await expect(dunya(p)).toHaveAttribute('data-fener', 'acik');
  await adim(p, 'gl-tahmin');
  await p.locator('.dn-secenek[data-secenek="buyur"]').click();
  await adim(p, 'gl-yaklastir');
  const oran = async () => Number(await p.locator('.dn-golge').getAttribute('data-oran'));
  const once = await oran();
  // Feneri parmakla tavşana doğru sürükle.
  const f = (await p.locator('.dn-fener').boundingBox())!, t = (await p.locator('.dn-tavsan').boundingBox())!;
  await p.mouse.move(f.x + f.width / 2, f.y + f.height / 2);
  await p.mouse.down();
  await p.mouse.move(t.x, t.y + t.height, { steps: 12 });
  await p.mouse.up();
  await adim(p, 'gl-uzaklastir');
  const yakin = await oran();
  expect(yakin).toBeGreaterThan(once);
  for (let i = 0; i < 6 && (await dunya(p).getAttribute('data-adim')) === 'gl-uzaklastir'; i++) await p.locator('.dn-fener').click();
  await defterVeEvde(p, 'golge');
  expect(await sesler(p)).toEqual(expect.arrayContaining(['gl-buyudu', 'gl-kuculdu']));
  expect(await sesler(p)).not.toContain('gl-sondur');
});

test('4 yaş · Buz: üç yere koy, tahmin; dokundukça zaman geçer; önce ılık sudaki, sonra güneşteki erir', async ({ page: p }) => {
  await ac(p, 4);
  await sec(p, 'buz');
  await adim(p, 'bz-koy');
  for (const y of ['gunes', 'golge']) {
    await p.locator('.dn-buz:not([data-yer])').first().click();
    await p.locator('.dn-buz-yer[data-yer="' + y + '"]').click();
    await expect(p.locator('.dn-buz[data-yer="' + y + '"]')).toHaveCount(1);
  }
  await p.locator('.dn-buz:not([data-yer])').click();
  await expect(p.locator('.dn-buz[data-yer="su"]')).toHaveCount(1);
  await adim(p, 'bz-tahmin');
  // Buz yerinin üstünde: buza dokunmak o yeri seçer.
  await p.locator('.dn-buz[data-yer="golge"]').click();
  await expect(dunya(p)).toHaveAttribute('data-tahmin', 'golge');
  await adim(p, 'bz-zaman');
  for (let i = 1; i <= 4; i++) {
    await p.locator('.dn-buz[data-yer="gunes"]').click();
    await expect(dunya(p)).toHaveAttribute('data-zaman', String(i), { timeout: 15000 });
  }
  await expect(p.locator('.dn-buz[data-yer="su"]')).toHaveAttribute('data-hal', 'yok');
  await expect(p.locator('.dn-buz[data-yer="gunes"]')).toHaveAttribute('data-hal', 'su');
  await expect(p.locator('.dn-buz[data-yer="golge"]')).toHaveAttribute('data-hal', 'az');
  await defterVeEvde(p, 'buz');
  const s = await sesler(p);
  expect(s.indexOf('bz-su-eridi')).toBeLessThan(s.indexOf('bz-gunes-eridi'));
});

test('5+ yaş · Tohum: iki saksı, yalnız biri her gün sulanır; sulanan çiçek açar, susuz boş kalır', async ({ page: p }) => {
  await ac(p, 5);
  await sec(p, 'tohum');
  await adim(p, 'th-ek');
  await p.locator('.dn-tohum').first().click();
  await p.locator('.dn-saksi[data-i="0"]').click();
  await expect(p.locator('.dn-saksi[data-i="0"]')).toHaveAttribute('data-ekildi', '1');
  await p.locator('.dn-tohum:not([data-ekildi])').click();
  await expect(p.locator('.dn-saksi[data-i="1"]')).toHaveAttribute('data-ekildi', '1');
  await adim(p, 'th-sula');
  await p.locator('.dn-sulama').click();
  await adim(p, 'th-tahmin');
  await p.locator('.dn-saksi[data-i="1"]').click();
  for (let g = 1; g < 3; g++) {
    await expect(dunya(p)).toHaveAttribute('data-gun', String(g), { timeout: 15000 });
    await adim(p, 'th-sula');
    await p.locator('.dn-sulama').click();
  }
  await expect(dunya(p)).toHaveAttribute('data-gun', '3', { timeout: 15000 });
  await expect(p.locator('.dn-saksi[data-i="0"]')).toHaveAttribute('data-bitki', 'filiz-3');
  await expect(p.locator('.dn-saksi[data-i="1"]')).toHaveAttribute('data-bitki', 'yok');
  await defterVeEvde(p, 'tohum');
  expect(await sesler(p)).toEqual(expect.arrayContaining(['th-susuz', 'th-sonuc-iki', 'th-neden']));
});

test('4 yaş · Rampa: top ve araba iner, kutu az eğimde kalır (tahminli); rampa dikleşince kutu kayar', async ({ page: p }) => {
  await ac(p, 4);
  await sec(p, 'rampa');
  const kez = async (id: string) => (await sesler(p)).filter((x) => x === id).length;
  const dene = async (n: string, hareket: string, tahmin = false) => {
    await adim(p, 'rp-koy');
    await expect(p.locator('.dn-r-nesne.sirada')).toHaveAttribute('data-nesne', n);
    await p.locator('.dn-r-nesne.sirada').click();
    if (tahmin) { await adim(p, 'rp-tahmin'); await p.locator('.dn-secenek[data-secenek="iner"]').click(); }
    await adim(p, 'rp-birak');
    const once = await kez(hareket);
    await p.locator('.dn-r-nesne[data-nesne="' + n + '"]').click();
    await expect.poll(() => kez(hareket), { timeout: 15000 }).toBe(once + 1);
  };
  await dene('top', 'rp-top');
  await dene('kup-kutu', 'rp-kutu-kaldi', true);
  await dene('oyuncak-araba', 'rp-araba');
  await adim(p, 'rp-dik');
  await p.locator('.dn-rampa').click();
  await expect(p.locator('.dn-rampa')).toHaveAttribute('data-egim', 'dik');
  await dene('kup-kutu', 'rp-kutu-kaydi');
  await defterVeEvde(p, 'rampa');
});

test('5+ yaş · Müzik: dört bardağa vur, tahmin; Ceren inceden kalına çalar; sırayla çal; kulak oyunu', async ({ page: p }) => {
  await ac(p, 5);
  await sec(p, 'muzik');
  const bardak = (s: number) => p.locator('.dn-muzik-bardagi[data-seviye="' + s + '"]');
  const calinan = () => p.evaluate(() => window.__bardakSesleri ?? []);
  await adim(p, 'mz-giris');
  for (const s of [3, 1, 4, 2]) await bardak(s).click();
  await adim(p, 'mz-tahmin');
  await bardak(4).click();
  await adim(p, 'mz-sirala');
  expect((await calinan()).slice(-4)).toEqual([1, 2, 3, 4]);
  await bardak(2).click();
  await expect(dunya(p)).not.toHaveAttribute('data-sira', /./);
  for (const s of [1, 2, 3, 4]) await bardak(s).click();
  await expect(dunya(p)).toHaveAttribute('data-sira', '4');
  // Kulak oyunu: önce kalın ses (4), yanlışta "Bir daha dinle"; sonra ince ses (1).
  await adim(p, 'mz-kulak');
  await expect(dunya(p)).toHaveAttribute('data-kulak', '4');
  await expect.poll(async () => (await calinan()).at(-1), { timeout: 15000 }).toBe(4);
  await bardak(1).click();
  await expect.poll(async () => (await sesler(p)).includes('mz-kulak-tekrar'), { timeout: 15000 }).toBe(true);
  await bardak(4).click();
  await expect(dunya(p)).toHaveAttribute('data-kulak', '1', { timeout: 15000 });
  await expect.poll(async () => (await calinan()).at(-1), { timeout: 15000 }).toBe(1);
  await bardak(1).click();
  await defterVeEvde(p, 'muzik');
  expect(await sesler(p)).toEqual(expect.arrayContaining(['mz-indi', 'mz-sonuc', 'mz-neden']));
});
