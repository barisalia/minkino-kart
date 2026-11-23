import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen dersi 2 · Şekiller (matematik/src/ders-sekiller.ts): Şekil evine girerken açılır. Her şekilde tanıt,
// tek etkinlik (daire ve üçgen parmakla çizilir, kare ve dikdörtgen sınıfta bulunur), övgü; sonunda hatıra ve tezgâh.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const KAYIT = 'minkino-matematik-ceren-sekiller-v1';
async function ac(p: Page, yas: Record<string, unknown>, kayit?: object, adres = '/matematik/?test=1&sekiller=1&hizli=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, k, a]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    if (k) localStorage.setItem(a, JSON.stringify(k));
  }, [yas, kayit ?? null, KAYIT] as const);
  await p.goto(adres);
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
}
const adim = (p: Page, a: string, s: string) => expect(p.locator(`.cd-dunya[data-adim="${a}"][data-sekil="${s}"]`)).toBeVisible({ timeout: 20000 });
/** Şekle geçildi (tanıtma hızlı kipte çok kısa; çocuğu bekleyen "çiz" ya da "bul" adımı ayrıca beklenir). */
const sekleGel = (p: Page, s: string) => expect(p.locator(`.cd-dunya[data-sekil="${s}"]:is([data-adim="tanit"], [data-adim="ciz"], [data-adim="bul"])`)).toBeVisible({ timeout: 20000 });
const kayit = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);

async function ciz(p: Page, s: string, yarim = false) {
  await adim(p, 'ciz', s);
  const svg = p.locator('.ds-cizim');
  const yol: number[][] = JSON.parse((await svg.getAttribute('data-yol'))!)[0];
  const k = (await svg.boundingBox())!;
  const q = (v: number[]) => [k.x + (v[0] / 1000) * k.width, k.y + (v[1] / 1000) * k.height] as const;
  // Yeşil noktanın uzağından başlamak bir şey yazmaz.
  await p.mouse.move(...q([500, 500]));
  await p.mouse.down();
  await p.mouse.move(...q([520, 520]), { steps: 3 });
  await p.mouse.up();
  await expect(p.locator('.ds-sekil.cizildi')).toHaveCount(0);
  await p.mouse.move(...q(yol[0]));
  await p.mouse.down();
  const son = yarim ? Math.floor(yol.length / 2) : yol.length;
  for (let i = 1; i < son; i++) await p.mouse.move(...q(yol[i]), { steps: 2 });
  await p.mouse.up();
}
async function bul(p: Page, s: string, yanlis: string, dogru: string) {
  await adim(p, 'bul', s);
  await expect(p.locator('.ds-nesne')).toHaveCount(3);
  await p.locator(`.ds-nesne[data-nesne="${yanlis}"]`).click();
  // Yanlışta ders ilerlemez; Ceren ipucu verir.
  await expect.poll(() => p.evaluate(() => window.__sekilSesleri?.at(-1))).toBe('ipucu_' + s);
  await expect(p.locator('.cd-dunya')).toHaveAttribute('data-adim', 'bul');
  await p.locator(`.ds-nesne[data-nesne="${dogru}"]`).click();
}

for (const [ad, yas, sekiller] of [['4 yaş', { yas: 4 }, 4], ['2–3 yaş', { yas: 3, ikiYas: true }, 3]] as const) {
  test(ad + ': ' + sekiller + ' şekil, her biri tanıt + tek etkinlik; hatıra, kayıt ve tezgâh', async ({ page: p }) => {
    await ac(p, yas);
    await expect(p.locator('.ds-sira-sekil')).toHaveCount(sekiller);
    await sekleGel(p, 'daire');
    await ciz(p, 'daire');
    await sekleGel(p, 'kare');
    await bul(p, 'kare', 'top', 'pencere');
    await sekleGel(p, 'ucgen');
    await ciz(p, 'ucgen');
    if (sekiller === 4) {
      await sekleGel(p, 'dikdortgen');
      await bul(p, 'dikdortgen', 'saat', 'kitap');
    }
    await expect(p.locator('.cd-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
    await expect(p.locator('.ds-hatira img')).toBeVisible();
    await expect(p.locator('#sahne[data-ekran="menu"]')).toBeVisible({ timeout: 20000 });
    expect(await kayit(p)).toMatchObject({ bitti: true, tanitildi: true });
    // İlk denemede yanlış bulunan şekiller konu defterine yazıldı (veli sayfası "Biraz daha tekrar").
    const konu = await p.evaluate((a) => Object.keys(JSON.parse(localStorage.getItem(a) || '{}')).sort(), 'minkino-matematik-konu-tekrar-' + (sekiller === 4 ? 'dort' : 'minik') + '-v1');
    expect(konu).toEqual(sekiller === 4 ? ['sekil:dikdortgen', 'sekil:kare'] : ['sekil:kare']);
    // Her yönerge Ceren'in sesiyle; bitişte kaç şekil öğrendiğini söyler.
    const okunan: string[] = await p.evaluate(() => window.__sekilSesleri ?? []);
    expect(okunan[0]).toBe('giris');
    expect(okunan).toEqual(expect.arrayContaining(['tanit_daire', 'cizdin_daire', 'bul_kare', 'buldun_kare', 'cizdin_ucgen', 'bitis_' + sekiller, 'hatira']));
    // Ders bitti: Şekil evi artık kendi oyunlarını açar.
    await p.locator('.tezgah-oyuncak.k1').click({ force: true });
    await expect(p.locator('.ds-dunya')).toHaveCount(0);
    await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  });
}

test('yarıda kalan ders sıradaki şekilden sürer; yarım çizim saymaz; öğrenilen şekle sıradan dönülür', async ({ page: p }) => {
  await ac(p, { yas: 5 }, { biten: ['daire', 'kare'], simdi: 'ucgen', tanitildi: true, bitti: false });
  await expect.poll(() => p.evaluate(() => window.__sekilSesleri?.[0])).toBe('devam');
  await sekleGel(p, 'ucgen');
  await ciz(p, 'ucgen', true);
  await expect(p.locator('.ds-sekil.cizildi')).toHaveCount(0);
  await expect(p.locator('.cd-dunya')).toHaveAttribute('data-adim', 'ciz');
  await expect(p.locator('.ds-sira-sekil.bitti')).toHaveCount(2);
  await p.locator('.ds-sira-sekil[data-sekil="daire"]').click();
  await sekleGel(p, 'daire');
});

test('test kipinde sekiller parametresi olmadan Şekil evi doğrudan açılır', async ({ page: p }) => {
  await ac(p, { yas: 4 }, undefined, '/matematik/?test=1');
  await expect(p.locator('.ds-dunya')).toHaveCount(0);
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
});
