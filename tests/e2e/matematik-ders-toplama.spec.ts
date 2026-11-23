import { test, expect, type Page } from '@playwright/test';

// Ceren Öğretmen dersi 6 · Toplama ve çıkarma (matematik/src/ders-toplama.ts), 5+ yaş. Astra'nın M7 çizimleri gelene dek yalnız
// test kipinde (?test=1&toplama=1), çizim yerinde adı yazılı kutularla. Tezgâha bağlama satırını Matematik oturumu ekler;
// o güne dek test dersi #sahne'ye kendisi kurar (main.ts'teki öbür derslerin açılışıyla aynı: temiz('ceren') + ders).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

const KAYIT = 'minkino-matematik-ceren-topla-v1';
declare global { interface Window { __toplamaBitti?: boolean; __toplamaSesleri?: string[] } }

async function ac(p: Page, kayit?: object, adres = '/matematik/?test=1&toplama=1&hizli=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([k, a]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
    if (k) localStorage.setItem(a, JSON.stringify(k));
  }, [kayit ?? null, KAYIT] as const);
  await p.goto(adres);
  await p.waitForLoadState('load');
  await p.addScriptTag({
    type: 'module',
    content: `import { toplamaDersi, toplamaDersiGorunur } from '/matematik/src/ders-toplama.ts';
      window.__toplamaGorunur = toplamaDersiGorunur;
      if (toplamaDersiGorunur) {
        const kok = document.querySelector('#sahne');
        kok.replaceChildren(); kok.dataset.ekran = 'ceren'; kok.style.backgroundImage = 'none';
        toplamaDersi({ kok, sesiAc() {}, tekrarDinle() {}, bitir() { window.__toplamaBitti = true; } });
      }`,
  });
  // İlk açılışta geliştirme sunucusu dersi derlerken birkaç saniye sürebilir.
  await p.waitForFunction(() => '__toplamaGorunur' in window, undefined, { timeout: 30000 });
}
const kayit = (p: Page) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
const okunan = (p: Page) => p.evaluate(() => window.__toplamaSesleri ?? []);
const yolcu = (p: Page) => p.locator('.dt-pencere[data-yolcu]');
/** Dokunulan her şey Ceren'in dışında: dünyada x ≥ %36 (Ceren x %0–%34). */
async function cerenDisinda(p: Page) {
  const sol = await p.locator('.dt-dunya').evaluate((d) => { const r = d.getBoundingClientRect(); return r.left + r.width * 0.36; });
  const hedefler = await p.locator('.dt-bekleyen, .dt-pencere[role="button"], .dt-sayi').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().left));
  expect(hedefler.length).toBeGreaterThan(0);
  for (const x of hedefler) expect(x).toBeGreaterThanOrEqual(sol - 0.5);
}
const adimda = (p: Page, e: string, adim: string) => expect(p.locator(`.dt-dunya[data-etkinlik="${e}"][data-adim="${adim}"]`)).toBeVisible({ timeout: 20000 });

test('5+ yaş: bir fazla, beşe tamamla, eksilme, ona tamamla; yanlışta sayarak ipucu; hatıra ve kayıt', async ({ page: p }) => {
  await ac(p);
  await expect(p.locator('.dt-sira .ds-sira-sekil')).toHaveCount(4);
  // 1 · Bir fazla: otobüste 2, durakta 1 bekleyen; dokununca biner (sonuç hemen görünür).
  await adimda(p, 'fazla', 'eylem');
  await expect(yolcu(p)).toHaveCount(2);
  await cerenDisinda(p);
  await p.locator('.dt-bekleyen').first().click();
  await expect(yolcu(p)).toHaveCount(3);
  await adimda(p, 'fazla', 'sor');
  await expect(p.locator('.dt-sayi')).toHaveCount(3);
  await cerenDisinda(p);
  // Yanlış: Ceren saydırır, sonra yeniden sorar; ikinci yanlışta doğru blok kıpırdar.
  await p.locator('.dt-sayi[data-n="4"]').click();
  await expect.poll(() => okunan(p).then((o) => o.at(-1))).toBe('ipucu');
  await expect(p.locator('.cd-ceren')).toHaveAttribute('data-istenen', 'sen-dene', { timeout: 15000 });
  await p.locator('.dt-sayi[data-n="2"]').click();
  await expect(p.locator('.dt-sayi[data-n="3"].ipucu')).toHaveCount(1, { timeout: 15000 });
  await p.locator('.dt-sayi[data-n="3"]').click();
  // 2 · Beşe tamamla: 3 yolcu, iki bekleyen biner, otobüs dolar; kaç kişi bindi → 2.
  await adimda(p, 'doldur', 'eylem');
  await expect(yolcu(p)).toHaveCount(3);
  await cerenDisinda(p);
  await p.locator('.dt-bekleyen').first().click();
  await p.locator('.dt-bekleyen').first().click();
  await expect(yolcu(p)).toHaveCount(5);
  await adimda(p, 'doldur', 'sor');
  await p.locator('.dt-sayi[data-n="2"]').click();
  // 3 · Eksilme: dolu otobüsten iki yolcu iner; kaç kaldı → 3.
  await adimda(p, 'eksik', 'eylem');
  await expect(yolcu(p)).toHaveCount(5);
  await cerenDisinda(p);
  await yolcu(p).nth(1).click();
  await expect(yolcu(p)).toHaveCount(4);
  await yolcu(p).nth(2).click();
  await expect(yolcu(p)).toHaveCount(3);
  await adimda(p, 'eksik', 'sor');
  await p.locator('.dt-sayi[data-n="3"]').click();
  // 4 · Ona tamamla: iki otobüs (5 + 3); önce tahmin (2), sonra iki yolcu biner, on pencere dolar.
  await adimda(p, 'on', 'sor');
  await expect(p.locator('.dt-otobus')).toHaveCount(2);
  await expect(yolcu(p)).toHaveCount(8);
  await p.locator('.dt-sayi[data-n="2"]').click();
  await expect(yolcu(p)).toHaveCount(10);
  await expect(p.locator('.dt-dunya[data-adim="hatira"]')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => p.evaluate(() => window.__toplamaBitti === true), { timeout: 20000 }).toBe(true);
  expect(await kayit(p)).toMatchObject({ bitti: true, tanitildi: true, biten: ['fazla', 'doldur', 'eksik', 'on'] });
  const o = await okunan(p);
  expect(o[0]).toBe('giris');
  expect(o).toEqual(expect.arrayContaining(['fazla_bin', 'fazla_sor', 'fazla_dogru', 'doldur_bin', 'doldur_dogru', 'eksik_in', 'gule', 'eksik_sor', 'eksik_dogru', 'on_gel', 'on_sor', 'on_dogru', 'bitis', 'hatira']));
  // "Güle güle" bir kez; aynı yönerge en çok iki kez (ipucundan sonraki yeniden soru).
  expect(o.filter((x) => x === 'gule')).toHaveLength(1);
  for (const id of new Set(o)) expect(o.filter((x) => x === id).length, id).toBeLessThanOrEqual(2);
});

test('yarıda kalan ders sıradaki işten sürer; dokunulan her şey ekranda ve telefonda ≥44 px', async ({ page: p }) => {
  await ac(p, { biten: ['fazla', 'doldur'], simdi: 'eksik', tanitildi: true });
  await expect.poll(() => okunan(p).then((o) => o[0])).toBe('devam');
  await adimda(p, 'eksik', 'eylem');
  const ekran = p.viewportSize()!;
  // Ceren'in gövdesi alttan kırpılabilir (bilerek); dokunulacak yolcular ve sıra tam görünür.
  for (const r of await p.locator('.dt-pencere[data-yolcu], .ds-sira-sekil').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(r.left).toBeGreaterThanOrEqual(-1);
    expect(r.right).toBeLessThanOrEqual(ekran.width + 1);
    expect(r.top).toBeGreaterThanOrEqual(-1);
    expect(r.bottom).toBeLessThanOrEqual(ekran.height + 1);
    expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(ekran.height < 500 ? 44 : 30);
  }
  await yolcu(p).first().click();
  await yolcu(p).first().click();
  await adimda(p, 'eksik', 'sor');
  for (const r of await p.locator('.dt-sayi').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(r.top).toBeGreaterThanOrEqual(0);
    expect(r.bottom).toBeLessThanOrEqual(ekran.height);
    expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(44);
  }
});

test('çizimler gelmeden uygulamada ve toplama parametresi olmadan ders kapalı', async ({ page: p }) => {
  for (const adres of ['/matematik/', '/matematik/?test=1']) {
    await p.goto('about:blank');
    await ac(p, undefined, adres);
    await expect.poll(() => p.evaluate(() => (window as unknown as { __toplamaGorunur?: boolean }).__toplamaGorunur)).toBe(false);
    await expect(p.locator('.dt-dunya')).toHaveCount(0);
  }
});
