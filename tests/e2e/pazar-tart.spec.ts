import { expect, test, type Locator, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

interface TartVerisi {
  mod: 'say' | 'tart';
  meyve: string;
  adet?: number;
  bolge?: [number, number];
  kasa: { meyve: string; agirlik: number; curuk: boolean }[];
}

/** Parmakla (fareyle) sürükler: kasadan leğene, leğenden komposta */
async function surukle(page: Page, kaynak: Locator, hedef: Locator, oy = 0.35) {
  const a = (await kaynak.boundingBox())!;
  const b = (await hedef.boundingBox())!;
  const [x0, y0] = [a.x + a.width / 2, a.y + a.height / 2];
  const [x1, y1] = [b.x + b.width / 2, b.y + b.height * oy];
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + ((x1 - x0) * i) / 10, y0 + ((y1 - y0) * i) / 10);
  await page.mouse.up();
}

async function istek(page: Page): Promise<TartVerisi> {
  await expect(page.locator('.tb-ekran.pz-aktif')).toBeVisible({ timeout: 10000 });
  return JSON.parse((await page.locator('.tb-ekran').getAttribute('data-istek'))!) as TartVerisi;
}
const kg = async (page: Page) => Number((await page.locator('.tb-kantar').getAttribute('data-kg')) ?? 0);
const legen = (page: Page) => page.locator('.tb-hedef');
const saglam = (page: Page) => page.locator('.tb-yuva:not(.tb-bos) .tb-urun[data-curuk="0"]').first();
/** "Ver" istenene ulaşınca nabız gibi atar (hiç durmaz): tıklama beklemeden */
const ver = (page: Page) => page.locator('.tb-ver').click({ force: true });

test('Tart Bakalım: açılıştan girilir, bir kilo tartılır (yeşil bölge), müşteri sevinir, yıldız (6 yaş)', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=6&meyve=patates&curuk=0');
  await page.getByRole('button', { name: 'Tart Bakalım' }).click();
  const ist = await istek(page);
  expect(ist.mod).toBe('tart');
  await expect(page.locator('.pz-istek-balon .tb-kilo')).toBeVisible();
  await expect(page.locator('.tb-kantar .tb-yesil')).toBeAttached();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t1-tart-istek.png` });
  const [lo, hi] = ist.bolge!;
  // meyveler leğene düşer, ibre yükselir; yeşile girince Ver parlar
  let onceki = await kg(page);
  while ((await kg(page)) < lo) {
    await surukle(page, saglam(page), legen(page));
    await expect.poll(() => kg(page), { timeout: 4000 }).toBeGreaterThan(onceki);
    onceki = await kg(page);
  }
  expect(onceki).toBeLessThanOrEqual(hi);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  // ibre yeşilde (tepe ±20°)
  expect(Math.abs(Number(await page.locator('.tb-kantar').getAttribute('data-aci')))).toBeLessThanOrEqual(21);
  await page.waitForTimeout(600);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t2-tart-yesil.png` });
  await ver(page);
  await expect(page.locator('.pz-musteri.sevindi')).toBeVisible();
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  // sıradaki müşteri gelir, leğen boş
  await istek(page);
  await expect(page.locator('.tb-govde')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: 4 yaş sayar — fazlası "Ver"de olmaz, bir tane çıkarınca olur', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=tart&meyve=elma&curuk=0');
  const ist = await istek(page);
  expect(ist.mod).toBe('say');
  await expect(page.locator('.pz-istek-balon .pz-istek-grup b')).toHaveText(String(ist.adet));
  for (let i = 0; i <= ist.adet!; i++) {
    await surukle(page, saglam(page), legen(page));
    await expect(page.locator('.tb-govde')).toHaveCount(i + 1);
  }
  await expect.poll(async () => JSON.parse((await page.locator('.tb-ekran').getAttribute('data-legen'))!).length).toBe(ist.adet! + 1);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t3-tart-sayma.png` });
  // bir fazla: Ver olmaz, yıldız yok
  await expect(page.locator('.tb-ver.tb-hazir')).toHaveCount(0);
  await ver(page);
  await page.waitForTimeout(200);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  // birini leğenden yığına geri sürükle
  await surukle(page, page.locator('.tb-govde').first(), page.locator('.tb-kasa'), 0.5);
  await expect(page.locator('.tb-govde')).toHaveCount(ist.adet!);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  await ver(page);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

/** Saymada Mino'nun söylediği sayılar (sırayla, virgüllü) */
const sayilar = async (page: Page) => (await page.locator('.tb-ekran').getAttribute('data-sayilar')) ?? '';
const legendeki = async (page: Page) => (JSON.parse((await page.locator('.tb-ekran').getAttribute('data-legen')) ?? '[]') as unknown[]).length;

test('Tart Bakalım: leğenin içinde tutulup geri bırakılan meyve yeniden sayılmaz; çıkıp gelen yeniden sayılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=tart&meyve=elma&curuk=0');
  await istek(page);
  await surukle(page, saglam(page), legen(page));
  await expect.poll(() => sayilar(page)).toBe('1');
  await page.waitForTimeout(500);
  // leğenin içinde tut, biraz taşı, leğene bırak: "Bir!" tekrarlanmaz
  for (let i = 0; i < 2; i++) {
    await surukle(page, page.locator('.tb-govde').first(), legen(page), 0.2);
    await page.waitForTimeout(900);
  }
  expect(await sayilar(page)).toBe('1');
  expect(await legendeki(page)).toBe(1);
  // leğenden yığına çıkarılıp yeniden konunca yeniden sayılır (leğende yine bir tane)
  await surukle(page, page.locator('.tb-govde').first(), page.locator('.tb-kasa'), 0.5);
  await expect(page.locator('.tb-govde')).toHaveCount(0);
  await expect.poll(() => legendeki(page)).toBe(0);
  await surukle(page, saglam(page), legen(page));
  await expect.poll(() => sayilar(page)).toBe('1,1');
  await surukle(page, saglam(page), legen(page));
  await expect.poll(() => sayilar(page)).toBe('1,1,2');
  expect(hatalar).toEqual([]);
});

interface FizikSaati {
  kuyruk: Map<number, FrameRequestCallback>;
  asil: typeof requestAnimationFrame;
  asilIptal: typeof cancelAnimationFrame;
}

/**
 * Leğenin fiziği her karede (requestAnimationFrame) bir adım ilerler. Bu saat durunca leğene bırakılan meyve havada
 * kalır: "meyve havadayken Ver" anı makinenin hızına bağlı olmaz. (Eskiden test meyvenin Ver anında kendiliğinden
 * havada olmasını umuyordu; makine yükteyken sürükleme yavaşlayınca meyve erken iniyor, test kalıyordu.)
 */
async function fizikSaatiniDurdur(page: Page) {
  await page.evaluate(() => {
    const asil = window.requestAnimationFrame.bind(window);
    const asilIptal = window.cancelAnimationFrame.bind(window);
    const kuyruk = new Map<number, FrameRequestCallback>();
    // eksi numaralar: tarayıcının kendi kare numaralarıyla karışmaz
    let no = 0;
    window.requestAnimationFrame = (cb) => (kuyruk.set(--no, cb), no);
    window.cancelAnimationFrame = (id) => void (kuyruk.delete(id) || asilIptal(id));
    (window as unknown as { fizikSaati: FizikSaati }).fizikSaati = { kuyruk, asil, asilIptal };
  });
  // saat durmadan önce istenmiş kareler (asıl saatte) bir kez çalışıp duran saate geçsin
  await page.evaluate(() => new Promise<void>((r) => {
    const s = (window as unknown as { fizikSaati: FizikSaati }).fizikSaati;
    s.asil(() => s.asil(() => r()));
  }));
}

/**
 * Ver'e basar ve aynı anda (araya zaman girmeden) duran saati kare kare ilerletir: havadaki meyveler düşüp leğene
 * değer, sonra asıl saate dönülür. Dönen: basarken leğene inmiş meyve sayısı, Ver'in beklemeye geçip geçmediği.
 */
async function havadayakenVer(page: Page, adet: number) {
  return page.evaluate((adet) => {
    const s = (window as unknown as { fizikSaati: FizikSaati }).fizikSaati;
    const ekran = document.querySelector<HTMLElement>('.tb-ekran')!;
    const legende = () => (JSON.parse(ekran.dataset.legen ?? '[]') as unknown[]).length;
    const basarken = legende();
    document.querySelector<HTMLButtonElement>('.tb-ver')!.click();
    // Ver havadaki meyveyi bekliyor: o sırada leğene dokunulamaz (kantar.etkin(false) → .tb-kapali)
    const bekliyor = document.querySelector('.tb-kantar')!.classList.contains('tb-kapali');
    let t = performance.now();
    for (let kare = 0; kare < 600 && legende() < adet; kare++) {
      t += 1000 / 60;
      const cagrilar = [...s.kuyruk.values()];
      s.kuyruk.clear();
      for (const cb of cagrilar) cb(t);
    }
    window.requestAnimationFrame = s.asil;
    window.cancelAnimationFrame = s.asilIptal;
    for (const cb of s.kuyruk.values()) s.asil(cb);
    s.kuyruk.clear();
    // sayım da bu anda okunur: müşteri sevinip gidince sıradaki müşteride sıfırlanır (test modunda hemen gelir)
    return { basarken, bekliyor, sonra: legende(), sayilar: ekran.dataset.sayilar ?? '' };
  }, adet);
}

test('Tart Bakalım: arka arkaya hızlı bırakılan meyveler doğru sayılır; Ver havadakinin inmesini bekler', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3&ekran=tart&meyve=elma&curuk=0');
  const ist = await istek(page);
  expect(ist.mod).toBe('say');
  // biri leğene inince "Ver" görünür
  await surukle(page, saglam(page), legen(page), 0.05);
  await expect(page.locator('.tb-ver')).toBeVisible();
  await expect.poll(() => sayilar(page)).toBe('1');
  // kalanlar beklemeden bırakılır; fizik saati durduğu için hepsi havada kalır
  await fizikSaatiniDurdur(page);
  for (let i = 1; i < ist.adet!; i++) await surukle(page, saglam(page), legen(page), 0.05);
  await expect(page.locator('.tb-govde')).toHaveCount(ist.adet!);
  // sonuncular daha havadayken Ver: Ver bekler, meyveler inince sayılır, müşteri alır ("az" denmez)
  const v = await havadayakenVer(page, ist.adet!);
  expect(v.basarken).toBe(1);
  expect(v.bekliyor).toBe(true);
  expect(v.sonra).toBe(ist.adet!);
  // sayım sırayla: "Bir! İki! …" (havadakiler inerken)
  expect(v.sayilar).toBe(Array.from({ length: ist.adet! }, (_, i) => i + 1).join(','));
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1, { timeout: 6000 });
  // "az" yolu hiç açılmadı (leğen sallanmadı)
  await expect(page.locator('.tb-legen.tb-hayir')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: hızlı iki bırakış "Bir, İki" sayılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=tart&meyve=elma&curuk=0');
  await istek(page);
  await surukle(page, saglam(page), legen(page), 0.05);
  await surukle(page, saglam(page), legen(page), 0.05);
  await expect.poll(() => sayilar(page)).toBe('1,2');
  await expect.poll(() => legendeki(page)).toBe(2);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: çürük domates — verilirse müşteri geri verir, komposta atılınca kompost sevinir', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=3&ekran=tart&meyve=domates&curuk=1');
  const ist = await istek(page);
  expect(ist.kasa.filter((k) => k.curuk)).toHaveLength(1);
  const curuk = page.locator('.tb-urun[data-curuk="1"]');
  // çürüğün kendi çizimi (assets/pazar/domates-curuk, Gemini)
  await expect(curuk.locator('img[src*="domates-curuk"]')).toBeAttached();
  await expect(curuk.locator('.tb-sinek')).toBeAttached();
  // çürük ve istenen kadar sağlam leğene
  await surukle(page, curuk, legen(page));
  await expect(page.locator('.tb-kompost.pz-parla')).toBeVisible();
  for (let i = 0; i < ist.adet!; i++) await surukle(page, saglam(page), legen(page));
  await expect(page.locator('.tb-govde')).toHaveCount(ist.adet! + 1);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `tests/screens/${info.project.name}-t4-tart-curuk.png` });
  // Ver: müşteri "ııh" yapar, çürüğü geri verir (leğene düşer); ceza yok, yıldız yok
  await ver(page);
  await expect(page.locator('.pz-musteri.pz-burus')).toBeAttached();
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(0);
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(0);
  // çürüğü leğenden komposta: kompost yutar
  await page.waitForTimeout(400);
  await surukle(page, page.locator('.tb-govde[data-curuk="1"]'), page.locator('.tb-kompost'), 0.4);
  await expect(page.locator('.tb-kompost.tb-yedi')).toBeAttached();
  await expect(page.locator('.tb-govde[data-curuk="1"]')).toHaveCount(0);
  await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
  await ver(page);
  await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(1);
  expect(hatalar).toEqual([]);
});

test('Tart Bakalım: sağlam meyve komposta atılmaz, yığına döner; şenlik açılır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=5&ekran=tart&meyve=portakal&curuk=0');
  const ist = await istek(page);
  const n = ist.kasa.length;
  await surukle(page, saglam(page), page.locator('.tb-kompost'), 0.4);
  await expect(page.locator('.tb-kompost.tb-hayir')).toBeAttached();
  await expect(page.locator('.tb-yuva:not(.tb-bos)')).toHaveCount(n);
  // şenlik ekranı: "Bir daha" tart'a, yanındaki düğme pazara
  await page.goto('./pazar/?test=1&yas=5&ekran=senlik');
  await expect(page.locator('.pz-senlik-hayvan')).toHaveCount(4);
  expect(hatalar).toEqual([]);
});

/** Oyunun o ana kadar söylediği cümleler, sırayla (test modunda window.__pazar.soz) */
const sozler = (page: Page) => page.evaluate(() => [...((window as unknown as { __pazar: { soz: string[] } }).__pazar.soz ?? [])]);

// Barış'ın ölçüsü (19 Kasım 2026): aynı yönerge en çok iki kez; aynı iş (çürük) bir turda bir kez
test('Tart Bakalım: "Oldu! Ver\'e bas!" bir turda bir kez; sonraki müşteride Ver yalnız parlar; çürük yalnız ikinci müşteride', async ({ page }) => {
  test.setTimeout(60_000);
  const hatalar = hataTopla(page);
  await page.goto('./pazar/?test=1&yas=4&ekran=tart');
  const meyveler: string[] = [];
  const curuklu: boolean[] = [];
  for (let m = 0; m < 4; m++) {
    const ist = await istek(page);
    meyveler.push(ist.meyve);
    curuklu.push(ist.kasa.some((k) => k.curuk));
    for (let i = 0; i < ist.adet!; i++) {
      await surukle(page, saglam(page), legen(page));
      await expect(page.locator('.tb-govde')).toHaveCount(i + 1);
    }
    await expect(page.locator('.tb-ver.tb-hazir')).toBeVisible();
    await ver(page);
    await expect(page.locator('.pz-yildiz.dolu')).toHaveCount(m + 1);
  }
  expect(new Set(meyveler).size, meyveler.join()).toBe(4);
  expect(curuklu).toEqual([false, true, false, false]);
  expect((await sozler(page)).filter((s) => s === "Oldu! Ver'e bas!")).toHaveLength(1);
  await expect(page.locator('.pz-senlik .pz-yildiz.dolu')).toHaveCount(4, { timeout: 15000 });
  expect(hatalar).toEqual([]);
});
