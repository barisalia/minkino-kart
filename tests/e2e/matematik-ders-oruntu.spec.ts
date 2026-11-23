import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen dersi 4 · Örüntü (matematik/src/ders-oruntu.ts): Fener tiyatrosuna girerken açılır. Astra'nın M5 çizimleri
// gelene dek yalnız test kipinde (?test=1&oruntu=1), çizim yerinde adı yazılı kutularla.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const KAYIT = 'minkino-matematik-ceren-oruntu-v1';
async function ac(p: Page, yas: Record<string, unknown>, kayit?: object, adres = '/matematik/?test=1&oruntu=1&hizli=1') {
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
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
}
const kayit = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
const okunan = (p: Page) => p.evaluate(() => window.__oruntuSesleri ?? []);

/** Sıradaki boşlukları doldur (önce isteğe bağlı bir yanlış). */
async function doldur(p: Page, e: string, cevaplar: string[], yanlis?: string) {
  await expect(p.locator(`.cd-dunya[data-etkinlik="${e}"][data-adim="sor"]`)).toBeVisible({ timeout: 20000 });
  await expect(p.locator('.dr-yuva')).toHaveCount(6);
  await expect(p.locator('.dr-yuva.bos')).toHaveCount(cevaplar.length);
  if (yanlis) {
    await p.locator(`.dr-secenek[data-nesne="${yanlis}"]`).click();
    await expect.poll(() => okunan(p).then((o) => o.at(-1))).toBe('ipucu');
    await expect(p.locator('.dr-yuva.bos')).toHaveCount(cevaplar.length);
    // İpucundan sonra Ceren diziyi baştan okur; sonra yeniden sorar.
    await expect(p.locator('.cd-ceren')).toHaveAttribute('data-istenen', 'sen-dene', { timeout: 15000 });
  }
  for (const [i, c] of cevaplar.entries()) {
    await p.locator(`.dr-secenek[data-nesne="${c}"]`).click();
    await expect(p.locator('.dr-yuva.bos')).toHaveCount(cevaplar.length - i - 1);
  }
}

test('4 yaş: renk AB, şekil AAB, ses AB (iki boşluk), kendi örüntüsü; hatıra, kayıt ve Fener tiyatrosu', async ({ page: p }) => {
  await ac(p, { yas: 4 });
  await expect(p.locator('.dr-sira .ds-sira-sekil')).toHaveCount(4);
  // İpte: kırmızı, mavi, kırmızı, mavi, _, _
  await expect(p.locator('.cd-dunya[data-etkinlik="renk"][data-adim="sor"]')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('.dr-dizi')).toHaveAttribute('data-sira', 'ip');
  await doldur(p, 'renk', ['bayrak-kirmizi', 'bayrak-mavi'], 'bayrak-sari');
  await doldur(p, 'sekil', ['tas-kirmizi-daire', 'tas-mavi-kare']);
  await expect(p.locator('.dr-dizi')).toHaveAttribute('data-sira', 'orta');
  await doldur(p, 'ses', ['davul', 'cingirak'], 'alkis');
  // Kendi örüntüsü: iki bayrak seçilir, ip altıya kadar onun örüntüsüyle dolar.
  await expect(p.locator('.cd-dunya[data-etkinlik="kendi"][data-adim="kendi"]')).toBeVisible({ timeout: 20000 });
  await p.locator('.dr-secenek[data-nesne="bayrak-sari"]').click();
  await p.locator('.dr-secenek[data-nesne="bayrak-mavi"]').click();
  await expect.poll(() => p.evaluate(() => window.__oruntuKendi ?? []))
    .toEqual(['bayrak-sari', 'bayrak-mavi', 'bayrak-sari', 'bayrak-mavi', 'bayrak-sari', 'bayrak-mavi']);
  await expect(p.locator('.cd-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('#sahne[data-ekran="menu"]')).toBeVisible({ timeout: 20000 });
  expect(await kayit(p)).toMatchObject({ bitti: true, tanitildi: true });
  const o = await okunan(p);
  expect(o[0]).toBe('giris');
  expect(o).toEqual(expect.arrayContaining(['renk_ab', 'renk_sor', 'sekil_aab', 'ses_dinle', 'ses_sor', 'kendi_basla', 'kendi_bitti', 'bitis', 'hatira']));
  // Ders bitti: Fener tiyatrosu kendi oyununu açar.
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.dr-dunya')).toHaveCount(0);
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
});

test('2–3 yaş: AB ve tek boşluk; kendi örüntüsü yok, üç etkinlikte biter', async ({ page: p }) => {
  await ac(p, { yas: 3, ikiYas: true });
  await expect(p.locator('.dr-sira .ds-sira-sekil')).toHaveCount(3);
  await doldur(p, 'renk', ['bayrak-mavi']);
  await doldur(p, 'sekil', ['tas-mavi-kare'], 'tas-sari-ucgen');
  await doldur(p, 'ses', ['cingirak']);
  await expect(p.locator('.cd-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
  await expect(p.locator('#sahne[data-ekran="menu"]')).toBeVisible({ timeout: 20000 });
  expect(await kayit(p)).toMatchObject({ bitti: true });
  expect((await okunan(p)).includes('kendi_basla')).toBe(false);
});

test('5+ yaş: renk ABC ve ses AAB', async ({ page: p }) => {
  await ac(p, { yas: 5 }, { biten: [], simdi: 'renk', tanitildi: true });
  await expect.poll(() => okunan(p).then((o) => o[0])).toBe('devam');
  await doldur(p, 'renk', ['bayrak-mavi', 'bayrak-sari']);
  await doldur(p, 'sekil', ['tas-kirmizi-daire', 'tas-mavi-kare']);
  await doldur(p, 'ses', ['davul', 'alkis']);
  await expect(p.locator('.cd-dunya[data-etkinlik="kendi"]')).toBeVisible({ timeout: 20000 });
  expect(await okunan(p)).toEqual(expect.arrayContaining(['renk_abc', 'sekil_aab']));
});

test('çizimler gelmeden uygulamada ve oruntu parametresi olmadan Fener tiyatrosu doğrudan açılır', async ({ page: p }) => {
  for (const adres of ['/matematik/', '/matematik/?test=1']) {
    await p.goto('about:blank');
    await ac(p, { yas: 4 }, undefined, adres);
    await expect(p.locator('.dr-dunya')).toHaveCount(0);
    await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  }
});
