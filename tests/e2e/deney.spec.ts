import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen ile Deneyler (deney/): iki deney baştan sona, üç yaş kümesi. Çizimler gelmeden test kipinde
// (?test=1&hizli) adlı kutularla oynanır; uygulamada çizimler ve sesler tamam değilse sayfa ana menüye döner.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

async function ac(p: Page, yas: number, kayit?: object) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, k]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y === 2 ? 3 : y, ...(y === 2 ? { ikiYas: true } : {}), ayarlar: { muzik: false } }));
    if (k) localStorage.setItem('minkino-deney-v1', k);
  }, [yas, kayit ? JSON.stringify(kayit) : ''] as const);
  await p.goto('/deney/eski.html?test=1&hizli');
}
const dunya = (p: Page) => p.locator('.dn-dunya');
const adim = (p: Page, a: string) => expect(dunya(p)).toHaveAttribute('data-adim', a, { timeout: 15000 });
const sesler = (p: Page) => p.evaluate(() => window.__cerenSesleri ?? []);
const kayit = (p: Page) => p.evaluate(() => JSON.parse(localStorage.getItem('minkino-deney-v1') || 'null'));
/** Öğe ekranın içinde mi (kırpılmadan): telefonda ve iPad'de dokunulacak her şey görünür olmalı. */
async function ekranda(p: Page, secici: string) {
  const v = p.viewportSize()!;
  for (const r of await p.locator(secici).evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; }))) {
    expect(r[0], secici).toBeGreaterThanOrEqual(-1);
    expect(r[1], secici).toBeGreaterThanOrEqual(-1);
    expect(r[2], secici).toBeLessThanOrEqual(v.width + 1);
    expect(r[3], secici).toBeLessThanOrEqual(v.height + 1);
  }
}
/** Masadaki sıradaki nesneyi dene: (tahminli yaşta) tahmin, sonra dokun (ya da parmakla sürükle) → leğene. */
async function dene(p: Page, ad: string, sonuc: 'yuzdu' | 'batti', tahmin?: 'batar' | 'yuzer', surukle = false) {
  if (tahmin) {
    await adim(p, 'by-tahmin');
    await expect(p.locator('.dn-kart')).toHaveAttribute('data-nesne', ad);
    await p.locator('.dn-rozet[data-yuzer="' + (tahmin === 'yuzer' ? 1 : 0) + '"]').click();
  }
  await adim(p, 'by-birak');
  const el = p.locator('.dn-alan > .dn-nesne.sirada');
  await expect(el).toHaveAttribute('data-nesne', ad);
  if (surukle) {
    // Önce masanın boş yerine bırakılır: nesne yerine döner, deney beklemeye devam eder; sonra leğene.
    const n = (await el.boundingBox())!, l = (await p.locator('.dn-legen').boundingBox())!;
    await p.mouse.move(n.x + n.width / 2, n.y + n.height / 2);
    await p.mouse.down();
    await p.mouse.move(n.x + n.width / 2, n.y - n.height * 1.5, { steps: 6 });
    await p.mouse.up();
    await expect(el).toHaveClass(/sirada/);
    await p.mouse.move(n.x + n.width / 2, n.y + n.height / 2);
    await p.mouse.down();
    await p.mouse.move(l.x + l.width * 0.7, l.y + l.height * 0.4, { steps: 8 });
    await p.mouse.up();
  } else await el.click();
  await expect(p.locator('.dn-legen-ic > .dn-nesne[data-nesne="' + ad + '"]')).toHaveAttribute('data-sonuc', sonuc);
}
async function defterVeEvde(p: Page, id: string) {
  await adim(p, 'defter');
  await expect(p.locator('.dn-yer.bekliyor')).toHaveAttribute('data-deney', id);
  await p.locator('.dn-yeni-cikartma').click();
  await adim(p, 'evde');
  await expect(p.locator('.dn-evde h2')).toContainText('Evde dene');
  await p.locator('.dn-evde .dn-tamam').click();
  await adim(p, 'secim');
}

test('4 yaş · Batar mı, yüzer mi? Tahmin (ceza yok), dokununca leğene; batan dibe, yüzen yüzeyde; defter ve Evde dene', async ({ page: p }) => {
  await ac(p, 4);
  await adim(p, 'secim');
  await ekranda(p, '.dn-deney, .dn-defter-dugmesi, .nav');
  await p.locator('.dn-deney[data-deney="batar-yuzer"]').click();
  await expect(p.locator('.dn-alan > .dn-nesne')).toHaveCount(5);
  await ekranda(p, '.dn-alan > .dn-nesne, .dn-legen');
  // Tahmin yanlış da olsa (taş "yüzer") deney sürer: "Bakalım!"
  await dene(p, 'elma', 'yuzdu', 'yuzer', true);
  await dene(p, 'tas', 'batti', 'yuzer');
  await dene(p, 'oyuncak-ordek', 'yuzdu', 'batar');
  await dene(p, 'anahtar', 'batti', 'batar');
  await dene(p, 'tahta-kasik', 'yuzdu', 'yuzer');
  // Dört yaşta ayırma ve sürpriz yok.
  await defterVeEvde(p, 'batar-yuzer');
  const okunan = await sesler(p);
  expect(okunan.filter((s) => s === 'bakalim')).toHaveLength(5);
  for (const s of ['by-yuzdu-elma', 'by-batti-tas', 'by-yuzdu-oyuncak-ordek', 'by-batti-anahtar', 'by-yuzdu-tahta-kasik', 'defter', 'harika', 'evde']) expect(okunan).toContain(s);
  expect(okunan).not.toContain('by-ayir');
  expect(okunan).not.toContain('by-surpriz');
  expect(await kayit(p)).toEqual({ gelis: { 'batar-yuzer': 1 }, cikartma: ['batar-yuzer'] });
  // İkinci geliş başka takımla başlar.
  await p.locator('.dn-deney[data-deney="batar-yuzer"]').click();
  await adim(p, 'by-tahmin');
  await expect(p.locator('.dn-alan > .dn-nesne').first()).toHaveAttribute('data-nesne', 'plastik-top');
});

test('5 yaş · tahmin, iki sepete ayır (yanlış sepet geri döner), portakal sürprizi: kabuklu yüzer, soyulmuş batar', async ({ page: p }) => {
  await ac(p, 5);
  await adim(p, 'secim');
  await p.locator('.dn-deney[data-deney="batar-yuzer"]').click();
  await dene(p, 'elma', 'yuzdu', 'yuzer');
  await dene(p, 'tas', 'batti', 'batar');
  await dene(p, 'oyuncak-ordek', 'yuzdu', 'yuzer');
  await dene(p, 'anahtar', 'batti', 'batar');
  await dene(p, 'tahta-kasik', 'yuzdu', 'yuzer');
  await adim(p, 'by-ayir');
  await expect(p.locator('.dn-sepet')).toHaveCount(2);
  await expect(p.locator('.dn-legen')).toBeHidden();
  await ekranda(p, '.dn-sepet, .dn-alan > .dn-nesne');
  const nesne = (ad: string) => p.locator('.dn-alan > .dn-nesne[data-nesne="' + ad + '"]');
  const sepet = (yuzer: boolean) => p.locator('.dn-sepet[data-yuzer="' + (yuzer ? 1 : 0) + '"]');
  // Taş yüzenler sepetine: geri döner, Ceren "Hatırla, suda ne olmuştu?" (Adım işareti dokunma dinleyicisinden bir an önce
  // konur: taş seçilene dek dokunulur.)
  await expect(async () => {
    await nesne('tas').click();
    await expect(nesne('tas')).toHaveClass(/secili/, { timeout: 400 });
  }).toPass({ timeout: 10000 });
  await sepet(true).click();
  await expect(nesne('tas')).not.toHaveClass(/sepette/);
  await expect.poll(() => sesler(p)).toContain('by-ayir-ipucu');
  for (const [ad, yuzer] of [['tas', false], ['elma', true], ['oyuncak-ordek', true], ['anahtar', false], ['tahta-kasik', true]] as const) {
    await nesne(ad).click();
    await sepet(yuzer).click();
    await expect(nesne(ad)).toHaveAttribute('data-sepet', yuzer ? 'yuzer' : 'batar');
  }
  await dene(p, 'portakal-kabuklu', 'yuzdu', 'batar');
  await expect(p.locator('.dn-sepet')).toHaveCount(0);
  await adim(p, 'by-soy');
  await p.locator('.dn-legen-ic > .dn-nesne.dokunulur').click();
  await dene(p, 'portakal-soyulmus', 'batti', 'yuzer');
  await defterVeEvde(p, 'batar-yuzer');
  const okunan = await sesler(p);
  for (const s of ['by-ayir', 'by-ayir-tamam', 'by-surpriz', 'by-yuzdu-portakal', 'by-soy', 'by-batti-soyulmus', 'by-neden', 'by-agir']) expect(okunan).toContain(s);
  expect(okunan.indexOf('by-neden')).toBeLessThan(okunan.indexOf('by-agir'));
});

test('4 yaş · Renkleri karıştır: şişe, damlalığı sık, tahmin, karıştır; "yeşil yap" görevinde yanlış çift turuncu yapar, ipucuyla yeşil', async ({ page: p }) => {
  await ac(p, 4);
  await adim(p, 'secim');
  await p.locator('.dn-deney[data-deney="renkler"]').click();
  await expect(p.locator('.dn-sise')).toHaveCount(3);
  await ekranda(p, '.dn-sise, .dn-bardak, .dn-damlalik');
  const bardak = p.locator('.dn-bardak');
  async function damla(renk: string, sirada = true) {
    await adim(p, 'rk-sise');
    const sise = p.locator('.dn-sise[data-renk="' + renk + '"]');
    if (sirada) await expect(sise).toHaveClass(/sirada/);
    await sise.click();
    await adim(p, 'rk-sik');
    await ekranda(p, '.dn-damlalik');
    await p.locator('.dn-damlalik').click();
  }
  async function karistir(renk: string) {
    await adim(p, 'rk-karistir');
    for (let i = 0; i < 10 && (await bardak.getAttribute('data-renk')) !== renk; i++) await bardak.click();
    await expect(bardak).toHaveAttribute('data-renk', renk);
  }
  for (const [renk, [a, b], tahmin] of [['yesil', ['sari', 'mavi'], 'yesil'], ['turuncu', ['kirmizi', 'sari'], 'mor'], ['mor', ['kirmizi', 'mavi'], 'mor']] as const) {
    await damla(a);
    await expect(bardak).toHaveAttribute('data-renk', a);
    // Rehberli adımda başka şişe kabul edilmez.
    await adim(p, 'rk-sise');
    await p.locator('.dn-sise[data-renk="' + ['sari', 'mavi', 'kirmizi'].find((r) => r !== a && r !== b) + '"]').click();
    await expect(dunya(p)).toHaveAttribute('data-adim', 'rk-sise');
    await damla(b);
    await adim(p, 'rk-tahmin');
    await p.locator('.dn-mini[data-renk="' + tahmin + '"]').click();
    await karistir(renk);
  }
  // Görev: yeşil yap. Önce kırmızı + sarı: turuncu olur, Ceren gözlemi ve ipucunu söyler; sonra sarı + mavi.
  await expect(dunya(p)).toHaveAttribute('data-gorev', 'yesil', { timeout: 15000 });
  await damla('kirmizi', false);
  await damla('sari', false);
  await karistir('turuncu');
  await expect.poll(() => sesler(p)).toContain('rk-ipucu-yesil');
  await expect(p.locator('.dn-sise[data-renk="sari"]')).toHaveClass(/ipucu/, { timeout: 15000 });
  await damla('sari', false);
  await damla('mavi', false);
  await karistir('yesil');
  await defterVeEvde(p, 'renkler');
  const okunan = await sesler(p);
  for (const s of ['rk-giris', 'rk-sik', 'rk-su-sari', 'rk-oldu-yesil', 'rk-oldu-turuncu', 'rk-oldu-mor', 'rk-gorev-yesil', 'rk-yeniden', 'rk-iki-renk']) expect(okunan).toContain(s);
  expect(okunan.filter((s) => s === 'rk-sik')).toHaveLength(1);
  expect(await kayit(p)).toEqual({ gelis: { renkler: 1 }, cikartma: ['renkler'] });
});

test('2–3 yaş · yalnız dene ve izle: üç nesne, tahmin yok; renklerde iki karışım, görev yok', async ({ page: p }) => {
  await ac(p, 2, { gelis: { 'batar-yuzer': 1 }, cikartma: ['batar-yuzer'] });
  await adim(p, 'secim');
  await p.locator('.dn-deney[data-deney="batar-yuzer"]').click();
  await expect(p.locator('.dn-alan > .dn-nesne')).toHaveCount(3);
  // İkinci geliş: ikinci takım.
  await dene(p, 'tahta-kasik', 'yuzdu');
  await dene(p, 'anahtar', 'batti');
  await dene(p, 'plastik-top', 'yuzdu');
  await defterVeEvde(p, 'batar-yuzer');
  let okunan = await sesler(p);
  expect(okunan.some((s) => s.startsWith('by-sor-'))).toBe(false);
  expect(okunan.filter((s) => s === 'by-birak')).toHaveLength(3);
  await p.locator('.dn-deney[data-deney="renkler"]').click();
  for (const [a, b, renk] of [['sari', 'mavi', 'yesil'], ['kirmizi', 'sari', 'turuncu']] as const) {
    for (const r of [a, b]) {
      await adim(p, 'rk-sise');
      await p.locator('.dn-sise[data-renk="' + r + '"]').click();
      await adim(p, 'rk-sik');
      await p.locator('.dn-damlalik').click();
    }
    await adim(p, 'rk-karistir');
    for (let i = 0; i < 3; i++) await p.locator('.dn-bardak').click();
    await expect(p.locator('.dn-bardak')).toHaveAttribute('data-renk', renk);
  }
  await defterVeEvde(p, 'renkler');
  okunan = await sesler(p);
  expect(okunan).not.toContain('rk-tahmin');
  expect(okunan.some((s) => s.startsWith('rk-gorev-'))).toBe(false);
  expect(await kayit(p)).toEqual({ gelis: { 'batar-yuzer': 2, renkler: 1 }, cikartma: ['batar-yuzer', 'renkler'] });
});
