/**
 * Kino'nun Otobüsü (/kino-otobus/): üç gün baştan sona yalnız PARLAYAN işe dokunarak oynanır (sıradaki işin yeri her
 * an belli olmalı; izleyen çocuk her isteği tam yapar). İki yuva da açık; yanlış dokunuşlar zararsız (kapsız top
 * düşmez, yanlış topu Kino yer); akşam kumbara sayılır, süs dükkânı açılır. Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface Durum {
  biten: number;
  mutlu: number;
  bugun: number;
  adim: string | null;
}
/** yerel önizleme sunucusunun bağlantı kopması (yüklü bilgisayarda vite preview) oyun hatası değildir */
const agDisi = (h: string) => !h.includes('ERR_CONNECTION_RESET');
const durum = async (page: Page) => JSON.parse((await page.locator('.ko-gun').getAttribute('data-durum')) ?? '{}') as Durum;

/** Bir günü yalnız parlayan işe dokunarak sonuna kadar oynar; görülen adımlar döner */
async function parlayaniIzle(page: Page) {
  const adimlar = new Set<string>();
  for (let n = 0; n < 500; n++) {
    if (await page.locator('.ko-aksam').isVisible().catch(() => false)) break;
    const adim = await page.locator('.ko-gun').getAttribute('data-adim').catch(() => null);
    const hedef = page.locator('.ko-gun .ko-sirada');
    if (!adim || !(await hedef.count())) {
      await page.waitForTimeout(120);
      continue;
    }
    adimlar.add(adim);
    await hedef.first().click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(adim === 'ye' ? 300 : 60);
  }
  await expect(page.locator('.ko-aksam')).toBeVisible({ timeout: 20000 });
  return adimlar;
}

test('Kino’nun Otobüsü: 3-4 yaş, üç gün yalnız parlayan işi izleyerek; her dondurma tam aynı', async ({ page }) => {
  test.setTimeout(420_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1');
  // ilk açılış: yaş sorulur
  await page.locator('.ko-yas-dugme[data-yas="kucuk"]').click();
  await expect(page.locator('.ko-logo')).toBeVisible();
  await expect(page.locator('.ko-gun-kart')).toHaveCount(3);
  await expect(page.locator('.ko-gun-kart[data-gun="2"]')).toHaveClass(/ko-kilitli/);
  for (const gun of [1, 2, 3]) {
    await page.locator(`.ko-gun-kart[data-gun="${gun}"]`).click();
    await expect(page.locator(`.ko-gun[data-gun="${gun}"]`)).toBeVisible();
    // bütün istasyonlar baştan açık: iki yuva, günün tatları, sos / süs rafı
    await expect(page.locator('.ko-yuva')).toHaveCount(2);
    await expect(page.locator('.ko-tat')).toHaveCount(gun === 1 ? 3 : 6);
    await expect(page.locator('.ko-raf-esya')).toHaveCount(gun === 1 ? 1 : gun === 2 ? 6 : 8);
    // iki müşteri aynı anda (öğretici Gün 1'de Mino'dan sonra)
    if (gun > 1) await expect(page.locator('.ko-musteri.ko-hazir')).toHaveCount(2, { timeout: 15000 });
    const adimlar = await parlayaniIzle(page);
    expect([...adimlar]).toEqual(expect.arrayContaining(['kap', 'top', 'sos', 'ver']));
    if (gun >= 2) expect(adimlar.has('sus')).toBe(true);
    // akşam: kumbara sayılır, dükkân açılır
    await page.locator('.ko-aksam-kumbara').click();
    await expect(page.locator('.ko-dukkan')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.ko-dukkan-urun')).toHaveCount(gun === 1 ? 2 : gun === 2 ? 5 : 10);
    await page.locator('.ko-tamam').click();
    await expect(page.locator('.ko-acilis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`.ko-gun-kart[data-gun="${gun}"]`)).toHaveClass(/ko-biten/);
  }
  // 3 gün × 5 müşteri × 3 jeton (hepsi tam aynı)
  const k = await page.evaluate(() => (window as unknown as { __koOtobus: { kayit: { jeton: number; mutlu: Record<string, number> } } }).__koOtobus.kayit);
  expect(k.jeton).toBe(45);
  expect(k.mutlu).toEqual({ 1: 5, 2: 5, 3: 5 });
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü: 5-6 yaş Gün 3 (kupa, paylaşma, örüntü, sıra, Mino’nun doğum günü) baştan sona', async ({ page }) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=3&yas=buyuk');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  const adimlar = await parlayaniIzle(page);
  expect([...adimlar]).toEqual(expect.arrayContaining(['kap', 'top', 'sos', 'sus', 'ver']));
  await page.locator('.ko-aksam-kumbara').click();
  await expect(page.locator('.ko-dukkan')).toBeVisible({ timeout: 20000 });
  const k = await page.evaluate(() => (window as unknown as { __koOtobus: { kayit: { jeton: number } } }).__koOtobus.kayit);
  expect(k.jeton).toBe(15);
  // süs alınır, otobüse anında takılır
  await page.locator('.ko-dukkan-urun[data-sus="flama"]').click();
  await expect(page.locator('.ko-aksam-otobus .ko-ob-flama')).toHaveCount(1);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü: yanlış dokunuşlar zararsız; yanlış topu Kino yer; farklı dondurma da sevilir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=2&yas=kucuk');
  await expect(page.locator('.ko-musteri.ko-hazir')).toHaveCount(2, { timeout: 20000 });
  const yuva = page.locator('.ko-yuva[data-yuva="0"]');
  // kap yokken top ve sos: hiçbir şey olmaz
  await page.locator('.ko-tat[data-tat="limon"]').click();
  await page.locator('.ko-sos').first().click();
  await expect(yuva.locator('.ko-kule')).toHaveCount(0);
  // kâse, yanlış top (limon): kuleye dokununca Kino yer
  await page.locator('.ko-kap-dugme[data-kap="kase"]').click();
  await page.locator('.ko-tat[data-tat="limon"]').click();
  await expect(yuva.locator('.ko-k-top')).toHaveCount(1);
  await expect(page.locator('.ko-gun')).toHaveAttribute('data-adim', 'ye');
  await yuva.locator('.ko-kule').click();
  await expect(yuva.locator('.ko-k-top')).toHaveCount(0);
  // öbür yuvaya geçilir: o yuva etkin olur (iki istasyon da kullanılabilir)
  await page.locator('.ko-yuva[data-yuva="1"]').click({ position: { x: 20, y: 30 } });
  await expect(page.locator('.ko-yuva[data-yuva="1"]')).toHaveClass(/ko-aktif/);
  await page.locator('.ko-kap-dugme[data-kap="kulah"]').click();
  await page.locator('.ko-tat[data-tat="vanilya"]').click();
  // farklı dondurma da verilir: müşteri yine sever, 2 jeton
  await page.locator('.ko-yuva[data-yuva="1"] .ko-ver').click();
  await expect(page.locator('.ko-musteri[data-sonuc="farkli"]')).toHaveCount(1, { timeout: 10000 });
  await expect.poll(async () => (await durum(page)).bugun, { timeout: 10000 }).toBe(2);
  await page.screenshot({ path: 'tests/screens/kino-otobus-gun2.png' });
  expect(hatalar.filter(agDisi)).toEqual([]);
});

const ANAHTAR = 'minkino-kino-otobus-v1';
const yerelKayit = (page: Page) => page.evaluate((a) => JSON.parse(localStorage.getItem(a) ?? '{}') as { jeton?: number; biten?: number[]; acikGun?: number }, ANAHTAR);

test('Kino’nun Otobüsü: son müşteri ödeyince gün hemen kaydedilir; "Bugünlük bu kadar"da geri basılsa da jeton kalır', async ({ page }) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=2&yas=kucuk');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  // akşama geçiş tutulur: çocuk "Bugünlük bu kadar!" sırasında geri basmış gibi (akşam hiç açılmaz)
  await page.evaluate(() => {
    const w = window as unknown as { __koOtobus: { app: { git: (ad: string, p?: unknown) => void } }; __aksamIstendi?: boolean };
    const asil = w.__koOtobus.app.git.bind(w.__koOtobus.app);
    w.__koOtobus.app.git = (ad, p) => (ad === 'aksam' ? void (w.__aksamIstendi = true) : asil(ad, p));
  });
  let kaydedildi = false;
  for (let n = 0; n < 600; n++) {
    if (await page.evaluate(() => !!(window as unknown as { __aksamIstendi?: boolean }).__aksamIstendi)) {
      kaydedildi = true;
      break;
    }
    const adim = await page.locator('.ko-gun').getAttribute('data-adim').catch(() => null);
    const hedef = page.locator('.ko-gun .ko-sirada');
    if (!adim || !(await hedef.count())) {
      await page.waitForTimeout(60);
      continue;
    }
    await hedef.first().click({ timeout: 3000 }).catch(() => undefined);
    await page.waitForTimeout(adim === 'ye' ? 300 : 60);
  }
  expect(kaydedildi).toBe(true);
  await expect(page.locator('.ko-aksam')).toHaveCount(0);
  expect((await yerelKayit(page)).biten).toContain(2);
  // "Bugünlük bu kadar!" sırasında geri
  await page.locator('.ko-gun .ko-ust button[aria-label="Geri"]').click();
  await expect(page.locator('.ko-acilis')).toBeVisible();
  const k = await yerelKayit(page);
  expect(k.jeton).toBe(15);
  expect(k.acikGun).toBe(3);
  await expect(page.locator('.ko-gun-kart[data-gun="3"]')).not.toHaveClass(/ko-kilitli/);
  await expect(page.locator('.ko-gun-kart[data-gun="2"]')).toHaveClass(/ko-biten/);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü: gün kartına çift dokunuş günü bir kez açar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&yas=kucuk&ekran=acilis');
  await expect(page.locator('.ko-gun-kart[data-gun="1"]')).toBeVisible();
  const gidilen = await page.evaluate(async () => {
    const app = (window as unknown as { __koOtobus: { app: { git: (ad: string, p?: unknown) => void } } }).__koOtobus.app;
    const asil = app.git.bind(app);
    const liste: string[] = [];
    app.git = (ad, p) => {
      liste.push(ad);
      asil(ad, p);
    };
    const kart = document.querySelector<HTMLButtonElement>('.ko-gun-kart[data-gun="1"]')!;
    kart.click();
    kart.click();
    await new Promise((r) => setTimeout(r, 400));
    return liste;
  });
  expect(gidilen).toEqual(['gun']);
  await expect(page.locator('.ko-gun[data-gun="1"]')).toBeVisible();
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü: ?onizleme=1 ile kilitli güne atlanmaz, ilerleme yazılmaz', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&yas=kucuk&ekran=acilis');
  await expect(page.locator('.ko-acilis')).toBeVisible();
  await page.goto('./kino-otobus/?onizleme=1&ekran=gun&gun=2&jeton=99');
  await expect(page.locator('.ko-acilis')).toBeVisible();
  await expect(page.locator('.ko-gun')).toHaveCount(0);
  const k = await yerelKayit(page);
  expect(k.acikGun).toBe(1);
  expect(k.jeton).toBe(0);
  await page.goto('./kino-otobus/?onizleme=1&ekran=aksam&gun=1&kazanc=50');
  await expect(page.locator('.ko-acilis')).toBeVisible();
  expect((await yerelKayit(page)).jeton).toBe(0);
  // sırası gelmiş güne gidilir
  await page.goto('./kino-otobus/?onizleme=1&ekran=gun&gun=1');
  await expect(page.locator('.ko-gun[data-gun="1"]')).toBeVisible();
  expect(hatalar.filter(agDisi)).toEqual([]);
});
