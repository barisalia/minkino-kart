import { test, expect, type Page } from '@playwright/test';

// Ders yolu · Minkino Bahçe Şenliği (matematik/src/ders-yolu.ts): tezgâhtaki şenlik tabelasından açılır; altı ders şenliğin
// altı parçası. Astra'nın M8 çizimleri gelene dek yalnız test kipinde (?test=1&dersyolu=1); derslerin kendi test bayraklarıyla.
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const BAYRAK = 'test=1&dersyolu=1&ceren=1&sekiller=1&olcudersi=1&oruntu=1&toplama=1&onluk=1&hizli=1';
const BITTI = {
  'minkino-matematik-ceren-sayilar-v1': { biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true },
  'minkino-matematik-ceren-sekiller-v1': { biten: ['daire', 'kare', 'ucgen', 'dikdortgen'], simdi: 'dikdortgen', tanitildi: true, bitti: true },
};
async function ac(p: Page, kartlar: object, kayitlar: Record<string, unknown> = {}, bayrak = BAYRAK) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, k]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
    for (const [a, v] of Object.entries(k)) localStorage.setItem(a, JSON.stringify(v));
  }, [kartlar, kayitlar] as const);
  await p.goto('/matematik/?' + bayrak);
}
const okunan = (p: Page) => p.evaluate(() => window.__dersYoluSesleri ?? []);
const parca = (p: Page, d: string) => p.locator(`.dy-parca[data-ders="${d}"]`);

test('5 yaş: tezgâhta şenlik tabelası; altı parça, ilk iş parlar; sıradaki olmayana dokununca Ceren uyarır', async ({ page: p }) => {
  await ac(p, { yas: 5 });
  await p.getByRole('button', { name: 'Şenlik hazırlığı', exact: true }).click();
  await expect(p.locator('.dy-dunya')).toBeVisible();
  await expect(p.locator('.dy-parca')).toHaveCount(6);
  await expect(parca(p, 'sayilar')).toHaveAttribute('data-durum', 'sirada');
  await expect(parca(p, 'onluk')).toHaveAttribute('data-durum', 'bekliyor');
  await expect.poll(() => okunan(p).then((o) => o[0])).toBe('giris');
  await parca(p, 'olcu').click();
  await expect.poll(() => okunan(p).then((o) => o.at(-1))).toBe('sirada_degil');
  await expect(p.locator('.dy-dunya')).toBeVisible();
  // Parlayan işe dokunmak dersi açar.
  await parca(p, 'sayilar').click();
  await expect(p.locator('.cd-dunya[data-adim]').first()).toBeVisible();
  await expect(p.locator('.dy-dunya')).toHaveCount(0);
});

test('biten dersler bir kez kutlanır: parça canlanır, hatıra panoya asılır; sonra sıradaki iş parlar', async ({ page: p }) => {
  await ac(p, { yas: 4 }, BITTI);
  await p.getByRole('button', { name: 'Şenlik hazırlığı', exact: true }).click();
  await expect(p.locator('.dy-parca')).toHaveCount(4);
  await expect(p.locator('.dy-dunya[data-adim="yol"]')).toBeVisible({ timeout: 20000 });
  await expect(parca(p, 'sayilar')).toHaveAttribute('data-durum', 'bitti');
  await expect(parca(p, 'sekiller')).toHaveAttribute('data-durum', 'bitti');
  await expect(parca(p, 'olcu')).toHaveAttribute('data-durum', 'sirada');
  await expect(p.locator('.dy-hatira')).toHaveCount(2);
  expect(await okunan(p)).toEqual(expect.arrayContaining(['hazir_sayilar', 'hazir_sekiller', 'pano']));
  // Yeniden açınca kutlama yinelenmez.
  await p.getByRole('button', { name: 'Oyuncaklara dön' }).click();
  await p.getByRole('button', { name: 'Şenlik hazırlığı', exact: true }).click();
  await expect(p.locator('.dy-dunya[data-adim="yol"]')).toBeVisible({ timeout: 20000 });
  const o = await okunan(p);
  expect(o.filter((x) => x === 'hazir_sayilar')).toHaveLength(1);
  expect(o.at(-1)).toBe('devam');
});

test('yoldan açılan ders bitince yola dönülür: Karşılaştır ve ölç canlanır, Örüntü parlar (2–3 yaş)', async ({ page: p }) => {
  await ac(p, { yas: 3, ikiYas: true }, { ...BITTI, 'minkino-matematik-ders-yolu-v1': { tanitildi: true, kutlanan: ['sayilar', 'sekiller'] } });
  await p.getByRole('button', { name: 'Şenlik hazırlığı', exact: true }).click();
  await expect(parca(p, 'olcu')).toHaveAttribute('data-durum', 'sirada', { timeout: 20000 });
  await parca(p, 'olcu').click();
  for (const [k, i, d] of [['buyuk-kucuk', 0, 'sapka-kucuk'], ['buyuk-kucuk', 1, 'kupa-buyuk'], ['uzun-kisa', 0, 'atki-uzun'], ['uzun-kisa', 1, 'tren-kisa'], ['cok-az', 0, 'kavanoz-az']] as const) {
    await expect(p.locator(`.cd-dunya[data-kavram="${k}"][data-adim="soru-${i}"]`)).toBeVisible({ timeout: 20000 });
    await p.locator(`.do-nesne[data-nesne="${d}"]`).click();
  }
  await expect(p.locator('.dy-dunya')).toBeVisible({ timeout: 30000 });
  await expect(p.locator('.dy-dunya[data-adim="yol"]')).toBeVisible({ timeout: 20000 });
  await expect(parca(p, 'olcu')).toHaveAttribute('data-durum', 'bitti');
  await expect(parca(p, 'oruntu')).toHaveAttribute('data-durum', 'sirada');
  await expect(p.locator('.dy-hatira')).toHaveCount(3);
  expect(await okunan(p)).toContain('hazir_olcu');
});

test('oyuncak kapıları da yolun sırasına uyar: Şekiller bitmeden Fener tiyatrosu Örüntü dersini açmaz', async ({ page: p }) => {
  await ac(p, { yas: 5 }, {}, 'test=1&sekiller=1&oruntu=1&hizli=1');
  await expect(p.locator('.senlik-giris')).toHaveCount(0);
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  await expect(p.locator('.dr-dunya')).toHaveCount(0);
  await p.goto('/matematik/?test=1&sekiller=1&oruntu=1&hizli=1');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(p.locator('.ds-dunya')).toBeVisible();
});
