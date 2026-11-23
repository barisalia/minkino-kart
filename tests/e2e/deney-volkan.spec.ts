import { test, expect, type Page } from '@playwright/test';

// Deneyler · Köpüren Renk Volkanı (deney/volkan.html, Paket Deney-Y3 ikinci yazım). Çizimler gelmeden test kipinde (?test=1)
// çizimsiz görünümle altı aşama: hazırlık (önlük, gözlük, örtü), malzemeler (Lokum getirir), renk, köpük, ikinci tur seçimi,
// temizlik ve ödül. Kurallar deney/src/volkan/karisim.ts ve senaryo.ts'te. ?atla=1 hazırlığı ve malzemeyi atlar.
test.describe.configure({ timeout: 180000 });
type Vk = { durum: () => string; asama: () => string; sesKaydi: { ad: string }[]; basla: () => Promise<void>; kino: () => string; lokum: () => string };
const durum = (p: Page) => p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.durum());
const asama = (p: Page) => p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.asama());
const sesler = (p: Page) => p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.sesKaydi.map((s) => s.ad));
const kinoPozu = (p: Page) => p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.kino());
const lokumPozu = (p: Page) => p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.lokum());
const sahne = (p: Page) => p.locator('#sahne');
const dugme = (p: Page, ad: string) => p.getByRole('button', { name: ad, exact: true });
const FON = { w: 1672, h: 941 };

async function ac(p: Page, yas: number, atla = false) {
  await p.goto('/deney/volkan.html?test=1&yas=' + yas + (atla ? '&atla=1' : ''));
  await p.evaluate(() => (window as unknown as { __volkan: Vk }).__volkan.basla());
  await expect.poll(() => asama(p), { timeout: 15000 }).toBe(atla ? 'deney' : 'hazirlik');
}
/** Tezgâh hazır olunca dokun (döküş, kaşık, uçuş sürerken bekler). */
async function dokun(p: Page, ad: string) {
  await expect.poll(() => durum(p), { timeout: 30000 }).toBe('hazir');
  await expect(dugme(p, ad)).toBeVisible({ timeout: 30000 });
  await dugme(p, ad).click();
}
/** Köpük taşar, söner; tezgâh yeniden hazır. */
async function kopuguBekle(p: Page, beklenen: string) {
  await expect(sahne(p)).toHaveAttribute('data-patlama', beklenen, { timeout: 20000 });
  await expect.poll(() => durum(p), { timeout: 30000 }).toBe('hazir');
}
/** Fon pikselindeki noktanın ekrandaki yeri. */
async function ekran(p: Page, x: number, y: number) {
  const s = (await sahne(p).boundingBox())!;
  return { x: s.x + (x / FON.w) * s.width, y: s.y + (y / FON.h) * s.height };
}
/** Düğmeyi tutup fon pikselindeki noktalardan geçirerek bırakır. */
async function surukle(p: Page, ad: string, yol: { x: number; y: number }[]) {
  const b = (await dugme(p, ad).boundingBox())!;
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  for (const n of yol) { const e = await ekran(p, n.x, n.y); await p.mouse.move(e.x, e.y, { steps: 8 }); }
  await p.mouse.up();
}
async function enAz64(p: Page, adlar: string[]) {
  for (const ad of adlar) {
    const b = (await dugme(p, ad).boundingBox())!;
    expect(Math.min(b.width, b.height), ad).toBeGreaterThanOrEqual(64);
  }
}
async function sozlerTekrarsiz(p: Page) {
  const s = (await sesler(p)).filter((a) => /^[ckr]-/.test(a));
  for (let i = 1; i < s.length; i++) expect(s[i], 'art arda: ' + s[i]).not.toBe(s[i - 1]);
}

test('4 yaş: hazırlık (sıra dışı gözlük komik), önlük sürüklenir; dört malzeme; mor; kocaman volkan; sıra fark etmez; dört birikinti silinir; çıkartma; bir daha', async ({ page: p }) => {
  await ac(p, 4);
  // Açılış işareti (1 sn içinde): önlük nabız atar, Kino askılığı gösterir, Ceren tanıtır.
  await expect(p.locator('.vk-onluk.davet')).toHaveCount(1);
  await expect.poll(() => sesler(p)).toContain('c-hos');
  await enAz64(p, ['Önlük', 'Gözlük', 'Örtü']);
  // Sıra dışı: gözlük önce gelirse geri seker, "Önce önlük!".
  await dokun(p, 'Gözlük');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('c-once-onluk');
  expect(await asama(p)).toBe('hazirlik');
  // Önlüğü Kino'ya sürükle: Kino önlüğü giyer.
  await expect.poll(() => durum(p)).toBe('hazir');
  await surukle(p, 'Önlük', [{ x: 900, y: 300 }, { x: 1470, y: 400 }]);
  await expect.poll(() => kinoPozu(p), { timeout: 10000 }).toBe('kino-onluklu');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('k-onluk');
  // Gözlüğe dokununca Kino'ya uçar; Lokum da gözlüğünü takar.
  await dokun(p, 'Gözlük');
  await expect.poll(() => lokumPozu(p), { timeout: 10000 }).toBe('lokum-bekle-0');
  await dokun(p, 'Örtü');
  await expect.poll(() => asama(p), { timeout: 10000 }).toBe('malzeme');
  // Malzemeler: Lokum her birini kaldırır, dokununca yerine uçar; her birinin kendi tepkisi.
  await expect(sahne(p)).toHaveAttribute('data-tasinan', 'volkan', { timeout: 10000 });
  await enAz64(p, ['Volkanı yerine koy']);
  await dokun(p, 'Volkanı yerine koy');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['efekt-gum', 'k-volkan']));
  await dokun(p, 'Kolbayı yerine koy');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('efekt-cin');
  await dokun(p, 'Kavanozu yerine koy');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['k-hapsu', 'c-cok-yasa']));
  await dokun(p, 'Şişe kasasını yerine koy');
  await expect.poll(() => asama(p), { timeout: 15000 }).toBe('deney');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('efekt-singir');
  // Tur 1: mor. Tarif kartı açık; kırmızı + mavi kolbada mor olur (girdap), karbonat, kolba: mor köpük.
  await expect(sahne(p)).toHaveAttribute('data-hedef', 'mor');
  await expect(p.locator('.vk-tarif.acik')).toHaveCount(1);
  await dokun(p, 'Kırmızı şişe');
  await expect(sahne(p)).toHaveAttribute('data-kolba', 'kirmizi', { timeout: 10000 });
  await dokun(p, 'Mavi şişe');
  await expect(sahne(p)).toHaveAttribute('data-kolba', 'kirmizi,mavi', { timeout: 10000 });
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['efekt-girdap', 'k-renk', 'c-karbonat']));
  await dokun(p, 'Karbonat kaşığı');
  await expect(p.locator('.vk-karbonat.acik')).toHaveCount(1, { timeout: 10000 });
  await dokun(p, 'Kolba');
  await expect(sahne(p)).toHaveAttribute('data-patlama', 'mor-2', { timeout: 20000 });
  await expect.poll(() => sesler(p), { timeout: 15000 }).toEqual(expect.arrayContaining(['efekt-fizz', 'efekt-patlama', 'k-vay', 'r-mor', 'c-neden']));
  // Köpük tepside sol ve sağda birikti.
  await expect(p.locator('.vk-birikinti.acik')).toHaveCount(2, { timeout: 10000 });
  // Seçim: kocaman volkan.
  await expect(dugme(p, 'Kocaman volkan')).toBeVisible({ timeout: 20000 });
  await enAz64(p, ['Başka renk', 'Kocaman volkan']);
  await dokun(p, 'Kocaman volkan');
  await expect(sahne(p)).toHaveAttribute('data-hedef', 'yesil-3', { timeout: 15000 });
  await expect(p.locator('.vk-dev.acik')).toHaveCount(1);
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('k-dev');
  // Sıra fark etmez: sirke önce volkana dökülür, karbonat sonra gelince köpürür. Üç ölçek: Kino'nun gözlüğüne köpük sıçrar.
  await dokun(p, 'Sarı şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Mavi şişe');
  await expect(sahne(p)).toHaveAttribute('data-kolba', 'sari,mavi,mavi', { timeout: 10000 });
  await dokun(p, 'Kolba');
  await expect(sahne(p)).toHaveAttribute('data-kolba', '', { timeout: 10000 });
  await dokun(p, 'Karbonat kaşığı');
  await expect(sahne(p)).toHaveAttribute('data-patlama', 'yesil-3', { timeout: 20000 });
  await expect.poll(() => sesler(p), { timeout: 15000 }).toEqual(expect.arrayContaining(['k-kopuk-gozluk', 'c-gozluk-ise']));
  // Temizlik: kocaman volkanda dört birikinti; dokununca sünger uçar, sürter.
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('temizlik');
  await expect(dugme(p, 'Köpük birikintisi 4')).toBeVisible({ timeout: 15000 });
  await enAz64(p, ['Sünger', 'Köpük birikintisi 1']);
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('c-temizlik');
  for (let i = 1; i <= 4; i++) {
    await dokun(p, 'Köpük birikintisi ' + i);
    await expect(dugme(p, 'Köpük birikintisi ' + i)).toBeHidden({ timeout: 10000 });
  }
  // Ödül: defter açılır, çıkartma yapışır; sonra "bir daha".
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('bitti');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['efekt-ting', 'k-parlak', 'efekt-sayfa', 'c-final']));
  await expect(p.locator('.vk-defter.acik')).toHaveCount(1);
  expect(await p.evaluate(() => localStorage.getItem('minkino-volkan-v1'))).toBe('["yesil"]');
  await dugme(p, 'Bir daha oyna').click({ force: true }); // düğme davet için nabız atar
  await expect.poll(() => asama(p), { timeout: 10000 }).toBe('deney');
  await expect(sahne(p)).toHaveAttribute('data-hedef', 'yesil');
  await expect(p.locator('.vk-dev.acik')).toHaveCount(0);
  await expect(dugme(p, 'Bir daha oyna')).toBeHidden();
  await sozlerTekrarsiz(p);
});

test('2–3 yaş: dokunarak hazırlık; kolba ve kavanoz kendiliğinden; bir dokunuş iki ölçek; karbonat hazır; başka renk; sünger sürüklenerek silinir', async ({ page: p }) => {
  await ac(p, 3);
  for (const ad of ['Önlük', 'Gözlük', 'Örtü']) await dokun(p, ad);
  await expect.poll(() => asama(p), { timeout: 10000 }).toBe('malzeme');
  // Kolba ve kavanoz kendiliğinden yerinde; Lokum yalnız volkanı ve kasayı getirir.
  await expect(sahne(p)).toHaveAttribute('data-tasinan', 'volkan', { timeout: 10000 });
  await expect(p.locator('.vk-kolba.sakli, .vk-kavanoz.sakli')).toHaveCount(0);
  await dokun(p, 'Volkanı yerine koy');
  await dokun(p, 'Şişe kasasını yerine koy');
  await expect.poll(() => asama(p), { timeout: 15000 }).toBe('deney');
  await expect(sahne(p)).toHaveAttribute('data-hedef', '');
  await expect(p.locator('.vk-karbonat.acik')).toHaveCount(1);
  await dokun(p, 'Mavi şişe');
  await expect(sahne(p)).toHaveAttribute('data-kolba', 'mavi,mavi', { timeout: 10000 });
  await dokun(p, 'Kolba');
  await kopuguBekle(p, 'mavi-2');
  await expect(dugme(p, 'Başka renk')).toBeVisible({ timeout: 20000 });
  await dokun(p, 'Başka renk');
  await expect.poll(() => asama(p), { timeout: 10000 }).toBe('deney');
  await expect(p.locator('.vk-karbonat.acik')).toHaveCount(1, { timeout: 10000 });
  await dokun(p, 'Kırmızı şişe');
  await dokun(p, 'Sarı şişe');
  await expect(sahne(p)).toHaveAttribute('data-kolba', 'kirmizi,kirmizi,sari', { timeout: 10000 });
  await dokun(p, 'Kolba');
  await expect(sahne(p)).toHaveAttribute('data-patlama', 'turuncu-3', { timeout: 20000 });
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('temizlik');
  // 2–3 yaşta iki birikinti; sünger sürtülerek silinir.
  await expect(dugme(p, 'Sünger')).toBeVisible({ timeout: 15000 });
  await expect(dugme(p, 'Köpük birikintisi 3')).toBeHidden();
  const ileriGeri = (x: number, y: number) => Array.from({ length: 5 }, () => [{ x: x - 90, y }, { x: x + 90, y }]).flat();
  await surukle(p, 'Sünger', [{ x: 585, y: 868 }, ...ileriGeri(585, 868), { x: 1195, y: 868 }, ...ileriGeri(1195, 868)]);
  await expect.poll(() => sesler(p), { timeout: 5000 }).toContain('dongu-bas-fis');
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('bitti');
  expect(await p.evaluate(() => localStorage.getItem('minkino-volkan-v1'))).toBe('["turuncu"]');
  await sozlerTekrarsiz(p);
});

test('5+ yaş: başka renk cezasız, çamur komik, ipucu; yeşil; ikinci tur kocaman mor (iki ölçek sayılmaz); üç birikinti', async ({ page: p }) => {
  await ac(p, 5, true);
  await expect(sahne(p)).toHaveAttribute('data-hedef', 'yesil');
  // Yalnız sarı: sarı köpük çıkar (ceza yok), aynı hedef sürer.
  await dokun(p, 'Sarı şişe');
  await dokun(p, 'Karbonat kaşığı');
  await dokun(p, 'Kolba');
  await kopuguBekle(p, 'sari-1');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['r-sari', 'c-baska']));
  expect(await asama(p)).toBe('deney');
  // Üç renk birden: kahverengi çamur; kolba dolu (komik); ikinci ıskada sarı ve mavi şişe parlar.
  await dokun(p, 'Kırmızı şişe');
  await dokun(p, 'Sarı şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Mavi şişe');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('k-dolu');
  await dokun(p, 'Karbonat kaşığı');
  await dokun(p, 'Kolba');
  await kopuguBekle(p, 'kahve-3');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toEqual(expect.arrayContaining(['k-iyy', 'r-kahve']));
  await expect(p.locator('.vk-sise.ipucu')).toHaveCount(2);
  // Boş kolba: "Kolba bomboş!".
  await dokun(p, 'Kolba');
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('k-bos');
  await dokun(p, 'Sarı şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Karbonat kaşığı');
  await dokun(p, 'Kolba');
  await expect(sahne(p)).toHaveAttribute('data-patlama', 'yesil-2', { timeout: 20000 });
  await expect(dugme(p, 'Başka renk')).toBeVisible({ timeout: 20000 });
  await dokun(p, 'Başka renk');
  await expect(sahne(p)).toHaveAttribute('data-hedef', 'mor-3', { timeout: 15000 });
  // İki ölçek mor kocaman sayılmaz.
  await dokun(p, 'Kırmızı şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Karbonat kaşığı');
  await dokun(p, 'Kolba');
  await kopuguBekle(p, 'mor-2');
  expect(await asama(p)).toBe('deney');
  await dokun(p, 'Kırmızı şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Mavi şişe');
  await dokun(p, 'Karbonat kaşığı');
  await dokun(p, 'Kolba');
  await expect(sahne(p)).toHaveAttribute('data-patlama', 'mor-3', { timeout: 20000 });
  await expect.poll(() => sesler(p), { timeout: 15000 }).toContain('c-buyuk');
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('temizlik');
  await expect(dugme(p, 'Köpük birikintisi 3')).toBeVisible({ timeout: 15000 });
  await expect(dugme(p, 'Köpük birikintisi 4')).toBeHidden();
  for (let i = 1; i <= 3; i++) {
    await dokun(p, 'Köpük birikintisi ' + i);
    await expect(dugme(p, 'Köpük birikintisi ' + i)).toBeHidden({ timeout: 10000 });
  }
  await expect.poll(() => asama(p), { timeout: 20000 }).toBe('bitti');
  await sozlerTekrarsiz(p);
});

test('deney düğmeleri en az 64 px; Kino ve Lokum dokununca güler; boşta sıradaki şey zıplar', async ({ page: p }) => {
  await ac(p, 4, true);
  await enAz64(p, ['Kırmızı şişe', 'Sarı şişe', 'Mavi şişe', 'Kolba', 'Karbonat kaşığı']);
  const kino = (await ekran(p, 1500, 300));
  await p.mouse.click(kino.x, kino.y);
  await expect(p.locator('.vk-kino')).toHaveAttribute('data-poz', 'kino-kahkaha');
  const lokum = (await ekran(p, 170, 360));
  await p.mouse.click(lokum.x, lokum.y);
  await expect(p.locator('.vk-lokum')).toHaveAttribute('data-poz', 'lokum-gul');
  // 6 sn dokunulmazsa ilk gerekli şişe (kırmızı) yeniden zıplar.
  await expect(p.locator('.vk-sise.zipla')).toHaveCount(0, { timeout: 5000 });
  await expect(p.locator('.vk-sise.zipla')).toHaveCount(1, { timeout: 9000 });
});
