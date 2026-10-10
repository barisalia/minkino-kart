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

/** Parmakla sürükler (adım adım); ara: yolun ortasında çağrılır (ör. sallama) */
async function surukle(page: Page, a: { x: number; y: number }, z: { x: number; y: number }, ara?: () => Promise<void>) {
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(a.x + ((z.x - a.x) * i) / 10, a.y + ((z.y - a.y) * i) / 10);
    await page.waitForTimeout(16);
  }
  await ara?.();
  await page.mouse.up();
}
const orta = async (page: Page, sec: string) => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};

test('Kino’nun Otobüsü: dokunsal hazırlık (kepçe, sos dök, serpinti salla, süs sürükle) ve yan işler (silme, sinek, külah)', async ({ page }) => {
  test.setTimeout(120_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=3&yas=buyuk');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  const yuva = page.locator('.ko-yuva[data-yuva="0"]');
  // dikey telefonda Gün 3'ün rafı kap düğmelerinin üstünde kendi şeridinde: hiçbir şişe/süs bir kap düğmesine binmez
  const binen = await page.evaluate(() => {
    const kutu = (s: string) => [...document.querySelectorAll(s)].map((e) => e.getBoundingClientRect());
    const kaplar = kutu('.ko-kap-dugme');
    return kutu('.ko-raf-esya').filter((r) => kaplar.some((k) => Math.min(r.right, k.right) - Math.max(r.left, k.left) > 1 && Math.min(r.bottom, k.bottom) - Math.max(r.top, k.top) > 1)).length;
  });
  expect(binen).toBe(0);
  await page.locator('.ko-kap-dugme[data-kap="kase"]').click();
  // kepçe: tattan yuvaya sürüklenir (tatın içinde ovalanınca top oluşur)
  const tat = await orta(page, '.ko-tat[data-tat="cilek"]');
  const y0 = await orta(page, '.ko-yuva[data-yuva="0"]');
  await surukle(page, tat, y0);
  await expect(yuva.locator('.ko-k-top')).toHaveCount(1);
  // tatın üstünde azıcık kımıldatıp bırakmak vazgeçmektir: top eklenmez
  await surukle(page, tat, { x: tat.x + 14, y: tat.y });
  await expect(yuva.locator('.ko-k-top')).toHaveCount(1);
  // sos: şişe kulenin üstünde tutulur, akar
  const kule = await orta(page, '.ko-yuva[data-yuva="0"] .ko-kule');
  await surukle(page, await orta(page, '.ko-sos[data-sos="karamel"]'), kule, () => page.waitForTimeout(800));
  await expect(yuva.locator('.ko-k-sos')).toHaveCount(1);
  // serpinti: kavanoz kulenin üstünde sallanır
  await surukle(page, await orta(page, '.ko-sus[data-sus="serpinti"]'), { x: kule.x, y: kule.y - 20 }, async () => {
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(kule.x + (i % 2 ? 30 : -30), kule.y - 20, { steps: 3 });
      await page.waitForTimeout(20);
    }
  });
  await expect(yuva.locator('.ko-k-serpinti')).toHaveCount(1);
  // süs: şemsiyeyi kulenin üstüne bırak
  await surukle(page, await orta(page, '.ko-sus[data-sus="semsiye"]'), kule);
  await expect(yuva.locator('.ko-k-sus[data-sus="semsiye"]')).toHaveCount(1);
  // boşa bırakılan süs rafa döner
  await surukle(page, await orta(page, '.ko-sus[data-sus="kalp"]'), { x: 20, y: 200 });
  await expect(yuva.locator('.ko-k-sus[data-sus="kalp"]')).toHaveCount(0);

  // temizlik: 5-6 yaşta üç leke ve bir sinek; ovunca silinir, sineğe dokununca kaçar
  await page.evaluate(() => (window as unknown as { __koGun: { lekeDusur: () => void } }).__koGun.lekeDusur());
  await expect(page.locator('.ko-leke')).toHaveCount(3);
  await expect(page.locator('.ko-sinek')).toHaveCount(1, { timeout: 5000 });
  await page.locator('.ko-sinek').click({ force: true });
  await expect(page.locator('.ko-sinek')).toHaveCount(0);
  const ilk = await orta(page, '.ko-leke');
  await page.mouse.move(ilk.x, ilk.y);
  await page.mouse.down();
  for (let i = 0; i < 14; i++) await page.mouse.move(ilk.x + (i % 2 ? 22 : -22), ilk.y, { steps: 3 });
  await page.mouse.up();
  await expect(page.locator('.ko-leke')).toHaveCount(2);
  // dokunuş da siler (iki dokunuş bir leke)
  for (let i = 0; i < 4; i++) await page.locator('.ko-leke:not(.ko-silindi)').first().click({ force: true });
  await expect(page.locator('.ko-leke')).toHaveCount(0);
  await expect(page.locator('.ko-tutulan')).toHaveCount(0, { timeout: 3000 });

  // külah: gün başında az (iş köşesi parlar); 5-6: hamur → bas → yuvarla (dokunuşla), raf dolar
  const stok = () => page.evaluate(() => (window as unknown as { __koGun: { kulahStok: number } }).__koGun.kulahStok);
  expect(await stok()).toBe(2);
  await expect(page.locator('.ko-is-kosesi')).toHaveClass(/ko-is-var/);
  await page.locator('.ko-is-kosesi').click();
  const panel = page.locator('.ko-is-panel');
  await expect(panel).toHaveAttribute('data-adim', 'hamur');
  await page.locator('.ko-is-surahi').click();
  await expect(panel).toHaveAttribute('data-adim', 'bas', { timeout: 5000 });
  await page.locator('.ko-is-makine').click();
  await expect(panel).toHaveAttribute('data-adim', 'yuvarla', { timeout: 5000 });
  await page.locator('.ko-is-disk').click();
  await expect(panel).toHaveCount(0, { timeout: 5000 });
  await expect.poll(stok, { timeout: 5000 }).toBe(4);
  await expect(page.locator('.ko-kulah-yigin-k')).toHaveCount(4);
  await expect(page.locator('.ko-is-kosesi')).not.toHaveClass(/ko-is-var/);
  // iş yarıda bırakılabilir: çarpı
  await page.locator('.ko-is-kosesi').click();
  await page.locator('.ko-is-kapat').click();
  await expect(panel).toHaveCount(0);
  expect(await stok()).toBe(4);
  // müşteri hâlâ bekliyor, oyun sürüyor (hiçbir şey kilitlenmedi)
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible();
  await page.screenshot({ path: 'tests/screens/kino-otobus-dokunsal.png' });
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

test('Kino’nun Otobüsü akşam: jetonlar beşli sıralarda yan yana (tek sütun değil); sayımdan sonra tek sayı kalır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&yas=kucuk&ekran=aksam&gun=1&kazanc=15');
  await expect(page.locator('.ko-aksam-jeton')).toHaveCount(15);
  const xler = await page.locator('.ko-aksam-jeton').evaluateAll((js) => js.map((j) => Math.round(j.getBoundingClientRect().left)));
  // beş sütun, ikinci sıra yarım jeton kaymış: en az 5 farklı x, sıradaki jetonlar soldan sağa
  expect(new Set(xler).size).toBeGreaterThanOrEqual(5);
  expect(xler[1]).toBeGreaterThan(xler[0]);
  expect(xler[5]).not.toBe(xler[0]);
  await page.locator('.ko-aksam-kumbara').click();
  await expect(page.locator('.ko-dukkan')).toBeVisible({ timeout: 20000 });
  await expect(page.locator('.ko-kumbara-sayi')).toHaveText('15');
  await expect(page.locator('.ko-sayac')).toBeHidden();
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
