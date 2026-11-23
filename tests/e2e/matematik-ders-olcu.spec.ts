import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen dersi 3 · Karşılaştır ve ölç (matematik/src/ders-olcu.ts): Ölçü tezgâhına girerken açılır. Astra'nın M4
// çizimleri gelene dek yalnız test kipinde (?test=1&olcudersi=1), çizim yerinde adı yazılı kutularla.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const KAYIT = 'minkino-matematik-ceren-olcu-v1';
async function ac(p: Page, yas: Record<string, unknown>, kayit?: object, adres = '/matematik/?test=1&olcudersi=1&hizli=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, k, a]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    localStorage.setItem('minkino-matematik-1-dort-olcu', JSON.stringify({ adim: 0, yer: 0, secimler: [], misketiGecti: true, surum: 2 }));
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 0, yer: 0, secimler: [], misketiGecti: true, surum: 2 }));
    localStorage.setItem('minkino-matematik-1-minik-olcu', JSON.stringify({ adim: 0, yer: 0, secimler: [], misketiGecti: true, surum: 2 }));
    if (k) localStorage.setItem(a, JSON.stringify(k));
  }, [yas, kayit ?? null, KAYIT] as const);
  await p.goto(adres);
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
}
const kayit = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
const okunan = (p: Page) => p.evaluate(() => window.__olcuDersSesleri ?? []);

/** Soruya gel (çocuğu bekleyen adım), önce yanlışa sonra doğruya dokun. */
async function sor(p: Page, k: string, i: number, dogru: string, yanlis?: string) {
  await expect(p.locator(`.cd-dunya[data-kavram="${k}"][data-adim="soru-${i}"]`)).toBeVisible({ timeout: 20000 });
  await expect(p.locator('.do-nesne')).toHaveCount(2);
  if (yanlis) {
    await p.locator(`.do-nesne[data-nesne="${yanlis}"]`).click();
    await expect.poll(() => okunan(p).then((o) => o.at(-1))).toBe('ipucu');
    await expect(p.locator('.cd-dunya')).toHaveAttribute('data-adim', 'soru-' + i);
  }
  await p.locator(`.do-nesne[data-nesne="${dogru}"]`).click();
}

for (const [ad, yas, n] of [['4 yaş', { yas: 4 }, 4], ['2–3 yaş', { yas: 3, ikiYas: true }, 3]] as const) {
  test(ad + ': ' + n + ' kavram, tanıt + sorular; hatıra mezura, kayıt ve Ölçü tezgâhı', async ({ page: p }) => {
    await ac(p, yas);
    await expect(p.locator('.do-sira .ds-sira-sekil')).toHaveCount(n);
    await sor(p, 'buyuk-kucuk', 0, 'sapka-kucuk', 'sapka-buyuk');
    await sor(p, 'buyuk-kucuk', 1, 'kupa-buyuk');
    // Uzun ve kısa üst üste, sol uçları aynı çizgide.
    await expect(p.locator('.cd-dunya[data-kavram="uzun-kisa"][data-adim="soru-0"]')).toBeVisible({ timeout: 20000 });
    const sol = await p.locator('.do-nesne').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
    expect(Math.abs(sol[0] - sol[1])).toBeLessThanOrEqual(1);
    await sor(p, 'uzun-kisa', 0, 'atki-uzun');
    await sor(p, 'uzun-kisa', 1, 'tren-kisa', 'tren-uzun');
    await sor(p, 'cok-az', 0, 'kavanoz-az');
    if (n === 4) await sor(p, 'agir-hafif', 0, 'tuy', 'karpuz');
    await expect(p.locator('.cd-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
    await expect(p.locator('#sahne[data-ekran="menu"]')).toBeVisible({ timeout: 20000 });
    expect(await kayit(p)).toMatchObject({ bitti: true, tanitildi: true });
    const o = await okunan(p);
    expect(o[0]).toBe('giris');
    expect(o).toEqual(expect.arrayContaining(['tanit_buyuk', 'tanit_kucuk', 'tanit_uzunkisa', 'tanit_cokaz', 'bitis_' + n, 'hatira']));
    expect(o.includes('tanit_agirhafif')).toBe(n === 4);
    // Ders bitti: Ölçü tezgâhı kendi oyununu açar.
    await p.locator('.tezgah-oyuncak.k2').click({ force: true });
    await expect(p.locator('.do-dunya')).toHaveCount(0);
    await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  });
}

test('yarıda kalan ders sıradaki kavramdan sürer; öğrenilen kavrama sıradan dönülür', async ({ page: p }) => {
  await ac(p, { yas: 5 }, { biten: ['buyuk-kucuk'], simdi: 'uzun-kisa', tanitildi: true, bitti: false });
  await expect.poll(() => okunan(p).then((o) => o[0])).toBe('devam');
  await expect(p.locator('.cd-dunya[data-kavram="uzun-kisa"][data-adim="soru-0"]')).toBeVisible({ timeout: 20000 });
  await p.locator('.do-sira .ds-sira-sekil[data-kavram="buyuk-kucuk"]').click();
  await expect(p.locator('.cd-dunya[data-kavram="buyuk-kucuk"]')).toBeVisible();
});

test('çizimler gelmeden uygulamada ve olcudersi parametresi olmadan Ölçü tezgâhı doğrudan açılır', async ({ page: p }) => {
  for (const adres of ['/matematik/', '/matematik/?test=1']) {
    await p.goto('about:blank');
    await ac(p, { yas: 4 }, undefined, adres);
    await expect(p.locator('.do-dunya')).toHaveCount(0);
    await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  }
});
