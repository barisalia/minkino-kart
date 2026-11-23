import { test, expect, type Page } from '@playwright/test';

// Ölçü tezgâhı · Boy Duvarı ve Kurbağanın Yaprak Yolu (kurdele turunun yerine; çizimler gelene kadar yalnız test kipinde,
// ?test=1&olcu=1, yer tutucuyla). Tezgâhtaki oyuncaklar "nefes alır": hareket azaltılmış koşu.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 90000 });

const ONEK: Record<number, string> = { 3: 'minik-', 4: 'dort-', 5: '' };
const BOY: Record<string, number> = { zurafa: 5, ordek: 3, tavsan: 2, kaplumbaga: 1 };

async function yatay(p: Page) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
}
async function ac(p: Page, yas: number, kayit: object) {
  await yatay(p);
  await p.addInitScript(([y, o, k]) => {
    if (sessionStorage.getItem('oy')) return;
    sessionStorage.setItem('oy', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    localStorage.setItem('minkino-matematik-1-' + o + 'olcu', JSON.stringify(k));
  }, [yas, ONEK[yas], kayit] as const);
  await p.goto('/matematik/?test=1&olcu=1');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
}
const kayit = (p: Page, yas: number) => p.evaluate((a) => JSON.parse(localStorage['minkino-matematik-1-' + a]), ONEK[yas] + 'olcu');

for (const yas of [3, 4, 5]) {
  test(yas + ' yaşta Boy Duvarı: tahtalar hayvanın yanına üst üste, boyu kadar; sevinç ve sonuç' + (yas >= 5 ? ', sonra hangisi daha uzun' : ''), async ({ page: p }) => {
    await ac(p, yas, { adim: 0, yer: 0, secimler: [], misketiGecti: true, surum: 2 });
    await expect(p.locator('.bd-sahne')).toBeVisible();
    // Kurdele turu yok: soyut çubuk ve kutular değil, hayvan ve tahta yığını.
    await expect(p.locator('.taslar')).toHaveCount(0);
    const hayvanlar = await p.locator('.bd-hayvan').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.hayvan!));
    expect(hayvanlar).toHaveLength(yas >= 5 ? 2 : 1);
    for (let i = 0; i < hayvanlar.length; i++) {
      const h = hayvanlar[i];
      if (i) await expect(p.locator('.bd-hayvan.bekliyor')).toHaveCount(0, { timeout: 20000 });
      for (let n = 1; n <= BOY[h]; n++) {
        await p.locator('.bd-kaynak').click();
        await expect(p.locator('.bd-yigin').nth(i).locator('.bd-tahta')).toHaveCount(n);
        if (n === 1 && BOY[h] > 1 && i === 0) {
          // Yarıda yenilense de konan tahta yerinde kalır.
          await p.reload();
          await p.locator('.tezgah-oyuncak.k2').click({ force: true });
          await expect(p.locator('.bd-yigin').nth(0).locator('.bd-tahta')).toHaveCount(1);
        }
      }
      // Boyu kadar: fazla tahta konmaz, hayvan sevinir.
      await expect(p.locator('.bd-kaynak')).toBeDisabled();
      await expect(p.locator('.bd-hayvan').nth(i)).toHaveAttribute('data-poz', '2');
    }
    if (yas >= 5) {
      await expect(p.locator('.bd-hayvan.secilebilir')).toHaveCount(2, { timeout: 20000 });
      const kisa = hayvanlar.reduce((a, b) => (BOY[b] < BOY[a] ? b : a)), uzun = hayvanlar.find((h) => h !== kisa)!;
      await p.locator('.bd-hayvan[data-hayvan="' + kisa + '"]').click();
      await expect(p.locator('.basari')).toHaveCount(0);
      await p.locator('.bd-hayvan[data-hayvan="' + uzun + '"]').click();
    }
    await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
    await expect.poll(async () => (await kayit(p, yas)).adim, { timeout: 15000 }).toBe(1);
    expect((await kayit(p, yas)).anlatilan).toContain('boy-duvari');
  });

  test(yas + ' yaşta Kurbağanın Yaprak Yolu: yapraklar uç uca, kurbağa yaprak yaprak zıplar, çiçeğe varır', async ({ page: p }) => {
    await ac(p, yas, { adim: 3, yer: 0, secimler: [], misketiGecti: true, surum: 2, anlatilan: ['boy-duvari'] });
    await expect(p.locator('.yy-sahne')).toBeVisible();
    const n = await p.locator('.yy-yaprak').count();
    expect(n).toBeGreaterThanOrEqual(yas < 4 ? 2 : 4);
    expect(n).toBeLessThanOrEqual(yas < 4 ? 3 : 6);
    // Yapraklar şeritte uç uca: aralarında boşluk yok, üst üste binmiyor.
    const kutular = await p.locator('.yy-yaprak').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.left, r.right]; }));
    for (let i = 1; i < kutular.length; i++) expect(Math.abs(kutular[i][0] - kutular[i - 1][1])).toBeLessThan(2);
    for (let i = 0; i < n; i++) await p.locator('.yy-sepet').click();
    await expect(p.locator('.yy-yaprak.bos')).toHaveCount(0);
    await expect(p.locator('.yy-sepet')).toBeDisabled();
    // Kurbağa her yaprağa basar, sonunda sevinir.
    await expect(p.locator('.yy-yaprak.basildi')).toHaveCount(n, { timeout: 30000 });
    await expect(p.locator('.yy-kurbaga')).toHaveAttribute('data-poz', '5', { timeout: 10000 });
    await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
    await expect.poll(async () => (await kayit(p, yas)).adim, { timeout: 15000 }).toBe(4);
    expect((await kayit(p, yas)).anlatilan).toEqual(expect.arrayContaining(['boy-duvari', 'yaprak-yolu']));
  });
}

test('Çizimler gelmeden uygulamada (ve olcu parametresi olmadan test kipinde) eski kurdele turu kalır', async ({ page: p }) => {
  await yatay(p);
  await p.addInitScript(() => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 4, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-1-dort-olcu', JSON.stringify({ adim: 0, yer: 0, secimler: [], surum: 2 }));
    // Ceren'in Karşılaştır ve ölç dersi (M4 gelince Ölçü tezgâhını açar) bitmiş sayılır.
    localStorage.setItem('minkino-matematik-ceren-olcu-v1', JSON.stringify({ biten: ['buyuk-kucuk', 'uzun-kisa', 'cok-az', 'agir-hafif'], simdi: 'agir-hafif', tanitildi: true, bitti: true }));
  });
  for (const adres of ['/matematik/', '/matematik/?test=1']) {
    await p.goto(adres);
    await p.locator('.tezgah-oyuncak.k2').click({ force: true });
    await expect(p.locator('.taslar')).toBeVisible();
    await expect(p.locator('.bd-sahne, .yy-sahne')).toHaveCount(0);
  }
});
