import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · ilk örnek "Zıpzıp'ın Dizi" (doktor/, ekip/senaryo/MINIK-DOKTOR-ORNEK.md). Menüde yok, 1.1'e girmez.
// 5+ akışı gerçek parmak sürüklemeleriyle; 4 ve 2–3 basamakları klavyeyle (her alet Enter'la kendi işini yapar).
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

type Nokta = { x: number; y: number };
const adim = (page: Page, a: string) => expect(page.locator('#doktor')).toHaveAttribute('data-adim', a, { timeout: 20_000 });
const nokta = (page: Page, ad: string) => page.evaluate(a => (window as unknown as { __doktor: { nokta(a: string): Nokta } }).__doktor.nokta(a), ad);
async function ac(page: Page, yas: string, test = true) {
  await page.goto('./doktor/index.html?oyun=ornek&' + (test ? 'test&' : 'kayit&') + 'yas=' + encodeURIComponent(yas));
  // ilk açılışta 24 çizim ve 33 ses çözülür; soğuk sunucuda 5 saniyeyi aşabiliyor
  await expect(page.locator('#doktor')).toHaveAttribute('data-durum', 'hazir', { timeout: 30_000 });
}
/** Aleti parmakla kaldırır; dönen işlev aletin ucunu verilen noktaya götürür. */
async function tut(page: Page, sec: string) {
  const r = (await page.locator(sec).first().boundingBox())!;
  const m = { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  await page.mouse.move(m.x, m.y);
  await page.mouse.down();
  await page.mouse.move(m.x + 1, m.y + 1);
  const uc = await page.evaluate(() => (window as unknown as { __doktor: { uc(): Nokta | null } }).__doktor.uc());
  expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
  const fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
  return (p: Nokta, steps = 10) => page.mouse.move(p.x - fark.x, p.y - fark.y, { steps });
}

test('5+: muayene parmakla baştan sona (kalp, diz, büyüteç, cımbız, pamuk, bant, yıldız, damga)', async ({ page }) => {
  await ac(page, '5+');
  await adim(page, 'kalp');
  // yanlış alet: tepside kalır, Kino ipucu verir, adım değişmez
  await page.getByRole('button', { name: 'Islak pamuk' }).click();
  await expect(page.locator('.dk-tutulan')).toHaveCount(0);
  await adim(page, 'kalp');

  let git = await tut(page, '[data-alet=stetoskop]');
  await git(await nokta(page, 'kalp'));
  await adim(page, 'diz');
  await page.mouse.up();
  await expect(page.locator('[data-alet=stetoskop]')).toBeHidden();

  const d = await nokta(page, 'diz');
  await page.mouse.click(d.x, d.y);
  await adim(page, 'buyutec');
  await expect(page.locator('#doktor')).toHaveAttribute('data-plan', 'yakin');
  await expect(page.locator('.dk-yaprak')).not.toHaveClass(/dk-gorundu/);

  git = await tut(page, '[data-alet=buyutec]');
  await expect(page.locator('.dk-mercek')).toBeVisible();
  await git(await nokta(page, 'yaprak'));
  await adim(page, 'cimbiz');
  await page.mouse.up();
  await expect(page.locator('.dk-yaprak')).toHaveClass(/dk-gorundu/);

  git = await tut(page, '[data-alet=cimbiz]');
  const sap = await nokta(page, 'sap');
  await git(sap);
  await git({ x: sap.x + 260, y: sap.y - 80 }, 12);
  await adim(page, 'pamuk');
  await page.mouse.up();

  git = await tut(page, '[data-alet=pamuk]');
  const a1 = await nokta(page, 'camur-sol-ust'), a2 = await nokta(page, 'camur-sag-alt');
  for (let i = 0; i <= 8; i++) {
    const y = a1.y + (a2.y - a1.y) * i / 8;
    await git({ x: i % 2 ? a2.x : a1.x, y }, 8);
    await git({ x: i % 2 ? a1.x : a2.x, y }, 8);
    if ((await page.locator('#doktor').getAttribute('data-adim')) !== 'pamuk') break;
  }
  await page.mouse.up();
  await adim(page, 'bant');
  expect(Number(await page.locator('#doktor').getAttribute('data-camur'))).toBeLessThanOrEqual(10);

  await expect(page.locator('.dk-secenek')).toHaveCount(4);
  git = await tut(page, '[data-bant=bant-kalp]');
  await git(await nokta(page, 'cizik'));
  await page.mouse.up();
  await adim(page, 'bant-sur');
  const bant = page.locator('.dk-bant');
  expect(Number(await bant.evaluate(b => getComputedStyle(b).getPropertyValue('--kabar')))).toBe(1);
  const r = (await bant.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await page.mouse.down();
  for (let i = 0; i < 40; i++) {
    await page.mouse.move(r.x + r.width * (i % 2 ? 0.85 : 0.15), r.y + r.height / 2, { steps: 4 });
    if ((await page.locator('#doktor').getAttribute('data-adim')) !== 'bant-sur') break;
  }
  await page.mouse.up();
  await adim(page, 'yildiz');
  await expect(page.locator('#doktor')).toHaveAttribute('data-plan', 'oda');
  await expect(page.locator('.dk-kucuk-bant')).toBeVisible();

  git = await tut(page, '.dk-secenek-yildiz');
  await git(await nokta(page, 'gogus'));
  await page.mouse.up();
  await adim(page, 'damga');
  await expect(page.locator('.dk-kucuk-yildiz')).toBeVisible();

  git = await tut(page, '[data-alet=damga]');
  await git(await nokta(page, 'damga'));
  await page.mouse.up();
  await adim(page, 'son');
  await expect(page.locator('#doktor')).toHaveAttribute('data-durum', 'bitti');
  // bant son sahneye dek dizde, yıldız göğüste
  await expect(page.locator('.dk-kucuk-bant')).toBeVisible();
  await expect(page.locator('.dk-kucuk-yildiz')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yeniden oyna' })).toBeVisible();
});

async function klavyeyle(page: Page, beklenenAletler: string[]) {
  await adim(page, 'kalp');
  await page.getByRole('button', { name: 'Stetoskop' }).press('Enter');
  await adim(page, 'diz');
  await page.getByRole('button', { name: "Zıpzıp'ın dizi" }).press('Enter');
  for (const a of beklenenAletler) {
    if (a === 'pamuk') { await adim(page, 'pamuk'); await page.getByRole('button', { name: 'Islak pamuk' }).press('Enter'); }
  }
  await adim(page, 'bant');
  await page.getByRole('button', { name: 'Yıldızlı bant' }).press('Enter');
  await adim(page, 'bant-sur');
  await page.getByRole('button', { name: 'Bandı düzelt' }).press('Enter');
  await adim(page, 'yildiz');
  await page.locator('.dk-secenek-yildiz').first().press('Enter');
  await adim(page, 'son');
}

test('4 yaş: büyüteç, cımbız ve damga yok; yaprak da yok', async ({ page }) => {
  await ac(page, '4');
  await adim(page, 'kalp');
  await expect(page.locator('.dk-alet:visible')).toHaveCount(4);
  for (const ad of ['buyutec', 'cimbiz', 'damga']) await expect(page.locator('[data-alet=' + ad + ']')).toHaveCount(0);
  await klavyeyle(page, ['pamuk']);
  await expect(page.locator('.dk-yaprak')).toHaveCount(0);
  await expect(page.locator('.dk-karne')).toBeHidden();
});

test('2–3 yaş: tepside yalnız sıradaki alet; pamuk ve damga yok', async ({ page }) => {
  await ac(page, '2-3');
  await adim(page, 'kalp');
  await expect(page.locator('.dk-alet:visible')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Stetoskop' })).toBeVisible();
  await page.getByRole('button', { name: 'Stetoskop' }).press('Enter');
  await adim(page, 'diz');
  await expect(page.locator('.dk-tepsi')).toBeHidden();
  await page.getByRole('button', { name: "Zıpzıp'ın dizi" }).press('Enter');
  await adim(page, 'bant');
  await expect(page.locator('.dk-camur')).toHaveCount(0);
  await page.getByRole('button', { name: 'Patili bant' }).press('Enter');
  await adim(page, 'bant-sur');
  await page.getByRole('button', { name: 'Bandı düzelt' }).press('Enter');
  await adim(page, 'yildiz');
  await expect(page.locator('.dk-alet:visible')).toHaveCount(0);
  await page.locator('.dk-secenek-yildiz').first().press('Enter');
  await adim(page, 'son');
});

test('gerçek sayfa: çizimlerin hepsi diskte, yer tutucu yok', async ({ page }) => {
  await ac(page, '5+', false);
  const yerTutucu = await page.locator('#doktor img').evaluateAll(r => r.filter(i => (i as HTMLImageElement).src.startsWith('data:')).length);
  expect(yerTutucu).toBe(0);
  await expect(page.locator('.dk-fon')).toBeVisible();
});

// Baştan kurulan oyunun kanıt sahnesi "Önce Kuzu" (doktor/src/once-kuzu/): Astra'nın Paket Doktor-K1 çizimleri
// klasöre düşünce kendiliğinden açılır. O güne dek ekranda ne çizim ne yer tutucu olur.
// 'zipzip-diz': sekiz sahnenin tek akışı (?oyun=zipzip-diz); öbürleri tek tek sahneler (?sahne=<ad>).
for (const sahne of ['bahce', 'kapi', 'bekleme', 'once-kuzu', 'diz', 'odul', 'kapanis', 'zipzip-diz']) test('yeni sahne ' + sahne + ': çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto('./doktor/index.html?' + (sahne === 'zipzip-diz' ? 'oyun=zipzip-diz' : 'sahne=' + sahne) + '&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-sahne', sahne, { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş: sahne açık');
  expect(Number(await kok.getAttribute('data-eksik'))).toBeGreaterThan(0);
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('canvas')).toHaveCount(0);
  await expect(kok.locator('.dk-sahne')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Geri' })).toBeVisible();
  await expect(page.locator('.dk-gecis')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

// "Zıpzıp'ın Dikenli Patisi" (Barış'ın 22 Kasım'da seçtiği yön; doktor/src/vaka/): çizimler Paket Doktor-Y1 ile gelir.
test('vaka: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto('./doktor/index.html?oyun=vaka&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'vaka', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş: oyun açık');
  expect(Number(await kok.getAttribute('data-eksik'))).toBeGreaterThan(0);
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('canvas')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('vaka: çizimler tam; masa açılır, çanta açılınca aletler çıkar, patiye dokununca yakın plan gelir', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  // &a1= (boş): Paket Doktor-A1 aşamaları kapalı; bu test Y1'in kısa akışını sınar (uzun akışın kendi testi var)
  await page.goto('./doktor/index.html?oyun=vaka&test&yas=4&a1=');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizimler henüz gelmedi');
  await expect(kok).toHaveAttribute('data-asama', 'giris');
  // hiçbir çizim kırık değil; sahne ekrana sığıyor
  const kirik = await page.evaluate(async () => {
    const hepsi = [...document.querySelectorAll<HTMLImageElement>('#doktor img')];
    await Promise.all(hepsi.map(i => i.decode().catch(() => undefined)));
    return hepsi.filter(i => i.src && !i.naturalWidth).map(i => i.src);
  });
  expect(kirik).toEqual([]);
  const sahne = await kok.locator('.vk-sahne').boundingBox();
  const ekran = page.viewportSize()!;
  expect(sahne!.x).toBeGreaterThanOrEqual(-0.5); expect(sahne!.x + sahne!.width).toBeLessThanOrEqual(ekran.width + 0.5);
  expect(sahne!.y).toBeGreaterThanOrEqual(-0.5); expect(sahne!.y + sahne!.height).toBeLessThanOrEqual(ekran.height + 0.5);
  // çanta: dokununca açılır, dört alet yuvalarında görünür
  // çanta ve pati düğmesi sürekli kıpırdar (çağırma animasyonu): durmasını beklemeden dokunulur
  await kok.locator('.vk-canta').click({ force: true });
  await expect(kok.locator('.vk-canta')).toHaveClass(/vk-acik/);
  await expect(kok.locator('.vk-canta .vk-yuva-aleti:visible')).toHaveCount(4);
  // pati: dokununca yakın plan, şeritte dört alet; sıradaki alet büyüteç
  await expect(kok.locator('.vk-pati-dugmesi')).toBeVisible();
  await kok.locator('.vk-pati-dugmesi').click({ force: true });
  await expect(kok).toHaveAttribute('data-asama', 'buyutec', { timeout: 10_000 });
  await expect(kok.locator('.vk-dok-aleti:not(.vk-dok-bant):visible')).toHaveCount(4);
  await expect(kok.locator('.vk-dok-aleti.vk-sirada')).toHaveAttribute('data-alet', 'buyutec');
  await expect(page.getByRole('button', { name: 'Geri' })).toBeVisible();
  expect(hatalar).toEqual([]);
});

// İkinci vaka "Mino'nun Kurabiyeli Dişleri" (doktor/src/dis/): çizimler Paket Doktor-Y2 ile gelir.
test('diş vakası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  await page.goto('./doktor/index.html?oyun=dis&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'dis', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş: oyun açık');
  expect(Number(await kok.getAttribute('data-eksik'))).toBeGreaterThan(0);
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('canvas')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Geri' })).toBeVisible();
  expect(hatalar).toEqual([]);
});

// "Zıpzıp'ın Dikenli Patisi" baştan sona, üç yaş basamağında, gerçek parmak hareketleriyle (test kipi: beklemeler kısa,
// mekanikler gerçek zamanlı). Yatay telefonda ve yatay iPad'de: dokunma hedefleri en az 64 px, sahnenin dışında boş bant
// yok, kapanıştan sonra "yeniden oyna" her şeyi baştan kurar.
type VakaSayim = { mikrop: number; diken: number; bulunan: number; giden: number; cikan: number; sargi: number; bant: string | null };
const vaka = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __vaka: Record<string, (...x: unknown[]) => unknown> }).__vaka[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const enKucukKenar = async (page: Page, sec: string) => {
  // yerleşim boyu × sahne ölçeği: beliriş ve nabız animasyonlarının anlık ölçeği ölçüme karışmaz
  const kutular = await page.locator(sec).evaluateAll(hepsi => {
    const s = document.querySelector('#doktor .vk-sahne')!.getBoundingClientRect().width / 2048;
    return hepsi.filter(e => !(e as HTMLElement).hidden).map(e => Math.min((e as HTMLElement).offsetWidth, (e as HTMLElement).offsetHeight) * s);
  });
  expect(kutular.length, sec).toBeGreaterThan(0);
  return Math.min(...kutular);
};

/** ek.masadan: çanta zaten açık (uzun akışta lavabo ve göğüsten sonra); ek.pamuk, ek.odul: Paket Doktor-A1 adımları */
async function vakayiOyna(page: Page, ek: { masadan?: boolean; pamuk?: () => Promise<void>; odul?: () => Promise<void> } = {}) {
  const kok = page.locator('#doktor');
  const asama = (a: string) => expect(kok).toHaveAttribute('data-asama', a, { timeout: 15_000 });
  const nokta = async (ad: string, i = 0) => (await vaka<Nokta | null>(page, 'nokta', ad, i))!;
  const sayim = () => vaka<VakaSayim>(page, 'sayim');
  let fark = { x: 0, y: 0 };
  const tut = async (m: Nokta) => {
    await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
    const uc = await vaka<Nokta | null>(page, 'uc');
    expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
    fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
  };
  const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
  const S = await sayim();

  // masa: çanta, pati
  if (!ek.masadan) await kok.locator('.vk-canta').click({ force: true });
  await expect(kok.locator('.vk-pati-dugmesi')).toBeVisible();
  expect(await enKucukKenar(page, '#doktor .vk-pati-dugmesi')).toBeGreaterThanOrEqual(64);
  await kok.locator('.vk-pati-dugmesi').click({ force: true });
  await asama('buyutec');
  expect(await enKucukKenar(page, '#doktor .vk-dok-aleti:not(.vk-dok-bant)')).toBeGreaterThanOrEqual(64);

  // büyüteç: her mikrop bulunur
  await tut(await nokta('alet', 0));
  for (let i = 0; i < S.mikrop; i++) { await git(await nokta('mikrop', i)); await expect.poll(async () => (await sayim()).bulunan, { timeout: 5000 }).toBeGreaterThan(i); }
  await asama('sprey'); await page.mouse.up();

  // köpükle ovma: sprey mikrobun çevresinde gezdirilir; köpük parmağın yolunda birikir, mikrop "pof" olur
  const olcek = await vaka<number>(page, 'olcek');
  const kopukPikseli = () => page.evaluate(() => { const c = document.querySelector<HTMLCanvasElement>('#doktor .vk-kopuk-tuvali')!; const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 40) n++; return n; });
  expect(await kopukPikseli()).toBe(0);
  await tut(await nokta('alet', 1));
  let kopukGoruldu = 0;
  for (let i = 0; i < S.mikrop; i++) {
    const mk = await nokta('mikrop', i);
    // köpük ağzın biraz önüne düşer: uç, mikrobun sağ üstünde küçük daireler çizer
    for (let k = 0; k < 240 && (await sayim()).giden <= i; k++) {
      const a = (k / 6) * Math.PI * 2;
      await git({ x: mk.x + (30 + Math.cos(a) * 45) * olcek, y: mk.y + (-30 + Math.sin(a) * 35) * olcek }, 2);
      // köpük görülene dek her adımda bakılır (küçük yaşta mikrop birkaç adımda gider; tek bir ana bağlı ölçüm kaçabiliyordu)
      if (k >= 2 && kopukGoruldu <= 200) kopukGoruldu = Math.max(kopukGoruldu, await kopukPikseli());
    }
    expect((await sayim()).giden, 'mikrop ovularak gider').toBeGreaterThan(i);
  }
  expect(kopukGoruldu, 'köpük parmağın yolunda birikir').toBeGreaterThan(200);
  await asama('cimbiz'); await page.mouse.up();

  // cımbız: diken tutulur, çekilir, tepsiye bırakılır (elin yolu başka bir dikene değerse o çıkar; kalanlar bitene dek sürer)
  await tut(await nokta('alet', 2));
  for (let tur = 0; tur < 5 && (await sayim()).cikan < S.diken; tur++) for (const i of S.diken === 3 ? [0, 2, 1] : [0, 1]) {
    const uc = await vaka<Nokta | null>(page, 'nokta', 'diken', i);
    if (!uc) continue;
    const once = (await sayim()).cikan;
    await git(uc); await page.waitForTimeout(80);
    const yon = await nokta('diken-yon', i);
    await git({ x: uc.x + (yon.x - uc.x) * 0.6, y: uc.y + (yon.y - uc.y) * 0.6 }, 10);
    const cikti = await expect.poll(async () => (await sayim()).cikan, { timeout: 1500 }).toBeGreaterThan(once).then(() => true, () => false);
    if (!cikti) continue;
    await git(await nokta('tepsi'), 10);
    await page.waitForTimeout(120);
  }
  await page.mouse.up();
  if (ek.pamuk) await ek.pamuk();
  await asama('sargi');

  // sargı: rulo kolun çevresinde döner
  // köpük bitti: tuval temiz
  await expect.poll(kopukPikseli, { timeout: 5000 }).toBe(0);
  await tut(await nokta('alet', 3));
  const m = await nokta('sargi');
  let bezGoruldu = false;
  for (let k = 0; k < 400 && (await sayim()).sargi < 1; k++) {
    const a = -Math.PI / 2 + (k / 16) * Math.PI * 2;
    await page.mouse.move(m.x + Math.cos(a) * 250 * olcek - fark.x, m.y + Math.sin(a) * 210 * olcek - fark.y);
    if (k === 6) bezGoruldu = await kok.locator('.vk-sargi-bez').isVisible();
  }
  expect(bezGoruldu, 'sargı bezi rulodan kola uzanır').toBe(true);
  await asama('bant'); await page.mouse.up();
  await expect(kok.locator('.vk-sargi-bez')).toBeHidden();

  // desenli bant
  await expect(kok.locator('.vk-dok-bant').last()).toBeVisible();
  expect(await enKucukKenar(page, '#doktor .vk-dok-bant')).toBeGreaterThanOrEqual(64);
  await tut(await nokta('bant', 1));
  await git(await nokta('sargi'));
  await page.mouse.up();
  // A1: bant kırışık yapışır; üstünden parmakla geçildikçe düzelir (yaşa göre bir, iki ya da üç geçiş), sonra ödül
  const kirisik = async () => (await vaka<{ bant: number }>(page, 'durum')).bant;
  if ((await kirisik()) > 0) {
    await expect(kok).toHaveAttribute('data-asama', 'bant');
    const b = await nokta('sargi');
    await page.mouse.move(b.x - 120 * olcek, b.y); await page.mouse.down();
    for (let k = 0; k < 14 && (await kirisik()) > 0; k++) await page.mouse.move(b.x + (k % 2 ? -120 : 120) * olcek, b.y, { steps: 4 });
    await page.mouse.up();
    expect(await kirisik(), 'bant parmakla düzelir').toBe(0);
  }
  if (ek.odul) await ek.odul();
  await asama('son');
  return S;
}

for (const yas of ['2-3', '4', '5+']) {
  test(`vaka: ${yas} yaş baştan sona; hedefler iri, boş bant yok, yeniden oyna baştan kurar`, async ({ page }, bilgi) => {
    test.setTimeout(120_000);
    if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });   // yatay iPad (4:3)
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message + ' @ ' + (e.stack ?? '').split(String.fromCharCode(10)).slice(1, 3).join(' | ')));
    await page.goto('./doktor/index.html?oyun=vaka&test&a1=&yas=' + encodeURIComponent(yas));
    const kok = page.locator('#doktor');
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizimler henüz gelmedi');

    // boş bant yok: sahnenin dışında kalan pay görünümün kenar uzantısıyla dolu; Kino'nun beli ekranın alt kenarında
    const ekran = page.viewportSize()!;
    const sahne = (await kok.locator('.vk-sahne').boundingBox())!;
    const kutu = async (sec: string) => (await kok.locator(sec).boundingBox())!;
    expect(Math.max(sahne.x, sahne.y), 'bu ekranlarda sahnenin dışında pay kalır').toBeGreaterThan(20);
    if (sahne.y > 1) {
      const ust = await kutu('.vk-hub .vk-t-ust'), alt = await kutu('.vk-hub .vk-t-alt');
      expect(ust.y).toBeLessThanOrEqual(0.5); expect(ust.y + ust.height).toBeGreaterThanOrEqual(sahne.y - 0.5);
      expect(alt.y).toBeLessThanOrEqual(sahne.y + sahne.height + 0.5); expect(alt.y + alt.height).toBeGreaterThanOrEqual(ekran.height - 0.5);
      const kino = await kutu('.vk-hub .vk-kino');
      expect(kino.y + kino.height).toBeGreaterThanOrEqual(ekran.height - 8);
    }
    if (sahne.x > 1) {
      const sol = await kutu('.vk-hub .vk-t-sol'), sag = await kutu('.vk-hub .vk-t-sag');
      expect(sol.x).toBeLessThanOrEqual(0.5); expect(sol.x + sol.width).toBeGreaterThanOrEqual(sahne.x - 0.5);
      expect(sag.x).toBeLessThanOrEqual(sahne.x + sahne.width + 0.5); expect(sag.x + sag.width).toBeGreaterThanOrEqual(ekran.width - 0.5);
    }
    // uzantılar boş değil: çizimin kenar pikselleri çizilmiş
    expect(await page.evaluate(() => [...document.querySelectorAll<HTMLCanvasElement>('#doktor .vk-tasma canvas')].map(c => c.getContext('2d')!.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data[3]))).toEqual([255, 255, 255, 255, 255, 255, 255, 255]);

    const S = await vakayiOyna(page);
    expect(S).toMatchObject(yas === '2-3' ? { mikrop: 2, diken: 2 } : { mikrop: 3, diken: 3 });
    const son = await vaka<VakaSayim>(page, 'sayim');
    expect(son).toMatchObject({ bulunan: S.mikrop, giden: S.mikrop, cikan: S.diken, sargi: 1 });
    expect(son.bant).not.toBeNull();
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);

    // yeniden oyna: her şey baştan; ikinci tur da açılır (eski dinleyiciler kalmadı)
    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    await expect(kok.locator('.vk-sahne')).toHaveCount(1);
    expect(await vaka<VakaSayim>(page, 'sayim')).toMatchObject({ bulunan: 0, giden: 0, cikan: 0, sargi: 0, bant: null });
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-pati-dugmesi')).toBeVisible();
    await kok.locator('.vk-pati-dugmesi').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'buyutec', { timeout: 10_000 });
    expect(hatalar).toEqual([]);
  });
}

test('vaka: dikey telefonda "yan çevir" işareti çıkar, oyun görünmez', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./doktor/index.html?oyun=vaka&test');
  await expect(page.locator('#doktor')).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  await expect(page.locator('.vk-cevir')).toBeVisible();
  await expect(page.locator('#doktor')).toHaveCSS('visibility', 'hidden');
  await expect(page.getByRole('button', { name: 'Geri' })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.vk-cevir')).toBeHidden();
  await expect(page.locator('#doktor')).toHaveCSS('visibility', 'visible');
});

// "Mino'nun Kurabiyeli Dişleri" baştan sona, üç yaş basamağında. Asıl çizimler (Paket Doktor-Y2) gelene kadar yalnız
// geliştirme sunucusunda, geçici çizimlerle (?taslak; output/doktor/dis-taslak/) koşar: akışı, dokunma hedeflerini,
// kısa kapanışı ve yeniden oynamayı sınar. Çizimler gelince aynı test gerçek çizimlerle koşar.
type DisSayim = { bolme: number; temiz: number; macun: number; fener: number; agizAcik: boolean; dokum: number; calkala: number; hedefCalkala: number; tat: number };
const dis = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __dis: Record<string, (...x: unknown[]) => unknown> }).__dis[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;

for (const yas of ['2-3', '4', '5+']) {
  test(`diş vakası: ${yas} yaş baştan sona; hedefler iri, boş bant yok, yeniden oyna baştan kurar`, async ({ page }, bilgi) => {
    test.setTimeout(120_000);
    if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });   // yatay iPad (4:3)
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message));
    const kok = page.locator('#doktor');
    // önce asıl çizimlerle; yoksa geliştirme sunucusundaki geçici çizimlerle
    await page.goto('./doktor/index.html?oyun=dis&test&yas=' + encodeURIComponent(yas));
    await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    if ((await kok.getAttribute('data-durum')) === 'eksik') {
      await page.goto('./doktor/index.html?oyun=dis&test&taslak&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
    }
    test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizimler gelmedi ve geçici çizim yok (derlenmiş sayfa)');
    const kirik = await page.evaluate(async () => {
      const hepsi = [...document.querySelectorAll<HTMLImageElement>('#doktor img')];
      await Promise.all(hepsi.map(i => i.decode().catch(() => undefined)));
      return hepsi.filter(i => i.src && !i.naturalWidth).map(i => i.src);
    });
    test.skip(kirik.length > 0, 'geçici çizimler bu makinede yok');

    const asama = (a: string) => expect(kok).toHaveAttribute('data-asama', a, { timeout: 15_000 });
    const nokta = async (ad: string, i = 0) => (await dis<Nokta | null>(page, 'nokta', ad, i))!;
    const sayim = () => dis<DisSayim>(page, 'sayim');
    let fark = { x: 0, y: 0 };
    const tut = async (m: Nokta) => {
      await page.mouse.move(m.x, m.y); await page.mouse.down(); await page.mouse.move(m.x + 1, m.y + 1);
      const uc = await dis<Nokta | null>(page, 'uc');
      expect(uc, 'alet parmağa basılınca hemen kalkar').not.toBeNull();
      fark = { x: uc!.x - (m.x + 1), y: uc!.y - (m.y + 1) };
    };
    const git = (q: Nokta, steps = 8) => page.mouse.move(q.x - fark.x, q.y - fark.y, { steps });
    const S = await sayim();
    expect(S.bolme).toBe(yas === '2-3' ? 6 : yas === '4' ? 8 : 10);

    // boş bant yok: sahnenin dışında kalan pay kenar uzantısıyla dolu
    const ekran = page.viewportSize()!;
    const sahne = (await kok.locator('.vk-sahne').boundingBox())!;
    const kutu = async (sec: string) => (await kok.locator(sec).boundingBox())!;
    if (sahne.y > 1) { const ust = await kutu('.vk-hub .vk-t-ust'), alt = await kutu('.vk-hub .vk-t-alt'); expect(ust.y).toBeLessThanOrEqual(0.5); expect(alt.y + alt.height).toBeGreaterThanOrEqual(ekran.height - 0.5); }
    if (sahne.x > 1) { const sol = await kutu('.vk-hub .vk-t-sol'), sag = await kutu('.vk-hub .vk-t-sag'); expect(sol.x).toBeLessThanOrEqual(0.5); expect(sag.x + sag.width).toBeGreaterThanOrEqual(ekran.width - 0.5); }

    // masa: çanta, ağız
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-hub .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await asama('fener');
    expect(await enKucukKenar(page, '#doktor .vk-dok-aleti')).toBeGreaterThanOrEqual(64);

    // fener: ağza tutulur, Mino ağzını açar
    await tut(await nokta('fener'));
    const agiz = await nokta('agiz');
    await git(agiz);
    await expect.poll(async () => (await sayim()).agizAcik, { timeout: 4000 }).toBe(true);
    await asama('macun'); await page.mouse.up();

    // macun: tat seçilir, kılların üstünde boydan boya sürülür
    await tut(await nokta('tup', 1));
    await git(await nokta('kil', 0)); await git(await nokta('kil', 1), 12);
    await asama('firca'); await page.mouse.up();
    expect((await sayim()).tat).toBe(1);

    // fırça: her bölmede ileri geri
    await tut(await nokta('firca'));
    const olcek = await dis<number>(page, 'olcek');
    for (let tur = 0; tur < 4 && (await kok.getAttribute('data-asama')) === 'firca'; tur++) for (let i = 0; i < S.bolme; i++) {
      const b = await nokta('bolme', i);
      for (let k = 0; k < 6; k++) await git({ x: b.x + (k % 2 ? -38 : 38) * olcek, y: b.y + (k % 2 ? 6 : -6) * olcek }, 4);
      if ((await kok.getAttribute('data-asama')) !== 'firca') break;
    }
    await asama('bardak'); await page.mouse.up();
    expect((await sayim()).temiz).toBeGreaterThanOrEqual(S.bolme - 1);

    // bardak: su verilir; yanaklara dokunarak çalkalanır
    await tut(await nokta('bardak'));
    await git({ x: agiz.x, y: agiz.y - 20 * olcek });
    await asama('calkala'); await page.mouse.up();
    expect(await enKucukKenar(page, '#doktor .vk-yakin .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
    for (let k = 0; k < S.hedefCalkala; k++) { const y = await nokta('yanak', k % 2); await page.mouse.move(y.x, y.y); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(60); }
    await asama('son');
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await enKucukKenar(page, '#doktor .vk-tekrar')).toBeGreaterThanOrEqual(64);

    // yeniden oyna: her şey baştan
    await kok.locator('.vk-tekrar').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'giris', { timeout: 15_000 });
    await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 15_000 });
    await expect(kok.locator('.vk-sahne')).toHaveCount(1);
    expect(await sayim()).toMatchObject({ temiz: 0, macun: 0, calkala: 0, agizAcik: false, tat: -1 });
    await kok.locator('.vk-canta').click({ force: true });
    await expect(kok.locator('.vk-hub .vk-kol-dugmesi')).toBeVisible();
    await kok.locator('.vk-hub .vk-kol-dugmesi').click({ force: true });
    await expect(kok).toHaveAttribute('data-asama', 'fener', { timeout: 10_000 });
    expect(hatalar).toEqual([]);
  });
}

/** Lavabo sahnesini parmakla baştan sona oynar (masada lavabo düğmesi görünürken çağrılır; sahne bitince döner). */
async function lavaboyuOyna(page: Page, acildi = false) {
  const kok = page.locator('#doktor');
  const asama = (a: string | RegExp) => expect(kok).toHaveAttribute('data-asama', a, { timeout: 20_000 });
  const alt = async (s: string, ad: string, i = 0) => (await vaka<Nokta | null>(page, 'alt', s, ad, i))!;
  const altSayim = <T>(s: string) => vaka<T>(page, 'altSayim', s);
  const nokta = async (ad: string, i = 0) => (await vaka<Nokta | null>(page, 'nokta', ad, i))!;
  const bas = async (q: Nokta) => { await page.mouse.move(q.x, q.y); await page.mouse.down(); };
  const dokun = async (q: Nokta) => { await bas(q); await page.mouse.up(); };
  const olcek = await vaka<number>(page, 'olcek');
  if (!acildi) await dokun(await nokta('lavabo-dugmesi'));
  await asama('lavabo-ac');
  // musluk
  await dokun(await alt('lavabo', 'kol'));
  await asama('lavabo-islat');
  await expect(kok.locator('.lv-su')).not.toHaveClass(/lv-gizli/);
  // patiler dinlenirken su aralarından akar: ıslanmaz
  await page.waitForTimeout(500);
  expect((await altSayim<{ islak: number }>('lavabo')).islak).toBe(0);
  // patiler suyun altına götürülür
  await bas(await alt('lavabo', 'pati'));
  await page.mouse.move((await alt('lavabo', 'sol-pati-suda')).x, (await alt('lavabo', 'pati')).y, { steps: 6 });
  await asama('lavabo-sabun');
  // su patiye çarpınca damlalar sıçrar (parçacıklar gerçekten uçar)
  await expect.poll(async () => (await altSayim<{ damla: number }>('lavabo')).damla, { timeout: 4000 }).toBeGreaterThan(0);
  await page.mouse.up();
  // sabun patilerde gezdirilir: köpük kabarır
  await bas(await alt('lavabo', 'sabun'));
  for (let k = 0; k < 200 && (await kok.getAttribute('data-asama')) === 'lavabo-sabun'; k++) {
    const hedef = await alt('lavabo', k % 2 ? 'sol-pati' : 'sag-pati');
    await page.mouse.move(hedef.x, hedef.y + 30 * olcek, { steps: 5 });
  }
  await asama('lavabo-ov');
  await page.mouse.up();
  expect((await altSayim<{ kopuk: number }>('lavabo')).kopuk).toBeGreaterThan(0);
  // ovuşturma: patilerin üstünde ileri geri
  const orta = await alt('lavabo', 'pati');
  await bas(orta);
  for (let k = 0; k < 60 && (await kok.getAttribute('data-asama')) === 'lavabo-ov'; k++) await page.mouse.move(orta.x + (k % 2 ? -110 : 110) * olcek, orta.y, { steps: 3 });
  await asama('lavabo-durula');
  await page.mouse.up();
  const kopuklu = (await altSayim<{ kopuk: number; vurus: number; hedef: { ov: number } }>('lavabo'));
  expect(kopuklu.vurus).toBeGreaterThanOrEqual(kopuklu.hedef.ov);
  // durulama: önce bir pati, sonra öbürü suyun altına
  await bas(await alt('lavabo', 'pati'));
  for (let k = 0; k < 40 && (await kok.getAttribute('data-asama')) === 'lavabo-durula'; k++) {
    const hedef = await alt('lavabo', k % 2 ? 'sag-pati-suda' : 'sol-pati-suda');
    await page.mouse.move(hedef.x, hedef.y, { steps: 6 });
    await page.waitForTimeout(700);
  }
  await asama('lavabo-kapat');
  await page.mouse.up();
  expect((await altSayim<{ kopuk: number }>('lavabo')).kopuk).toBe(0);
  expect((await altSayim<{ akan: number }>('lavabo')).akan, 'köpük suyla akıp gider').toBeGreaterThan(0);
  await dokun(await alt('lavabo', 'kol'));
  await asama('lavabo-kurula');
  await expect(kok.locator('.lv-su')).toHaveClass(/lv-gizli/);
  // havlu
  await bas(await alt('lavabo', 'havlu'));
  const kb = await alt('lavabo', 'kuru-bas');
  for (let sira = 0; sira < 4 && (await kok.getAttribute('data-asama')) === 'lavabo-kurula'; sira++) for (let x = 0; x <= 620; x += 70) {
    await page.mouse.move(kb.x + x * olcek, kb.y + (40 + sira * 78) * olcek, { steps: 2 });
    if ((await kok.getAttribute('data-asama')) !== 'lavabo-kurula') break;
  }
  await asama('lavabo-bitti');
  await page.mouse.up();
}

// "Dikenli Pati" uzun akış (Paket Doktor-A1): geliş → lavabo (doktorun el yıkaması) → göğüs (stetoskop) → kol (ıslak pamuk
// dahil) → çıkartma defteri → sevinç dansı. İki kip:
//  · taslak: bütün aşamalar açık; gerçek çizimi daha gelmeyenler geçici çizimle (?taslak, yalnız geliştirme sunucusu;
//    npx vite-node doktor/araclar/a1-taslak.ts). 2–3 ve 5+ yaş.
//  · gerçek: geçici çizim yok; yalnız gerçek çizimle açılmış aşamalar oynanır. Oyuncunun göreceği akış budur. 4 yaş.
// Bir aşamanın çizimleri bağlanınca gerçek kip onu kendiliğinden oynar.
type A1Acik = { giris: boolean; lavabo: boolean; gogus: boolean; pamuk: boolean; defter: boolean; dans: boolean };
type A1Durum = { gelis: { yuruyor: boolean; zip: number } | null; pamuk: { islak: boolean; kir: number; oran: number; hedef: number } | null; dans: boolean; odul: { adim: string; yapisan: number; secilen: string[] } | null };
for (const [yas, kip] of [['2-3', 'taslak'], ['5+', 'taslak'], ['4', 'gercek']] as const) {
  const ad = kip === 'gercek' ? `vaka · gerçek akış ${yas} yaş (taslaksız): açılan A1 aşamalarıyla baştan sona` : `vaka · uzun akış ${yas} yaş: geliş, lavabo, göğüs, pamuk, defter, dans`;
  test(ad, async ({ page }, bilgi) => {
    test.setTimeout(240_000);
    if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
    const hatalar: string[] = [];
    page.on('pageerror', e => hatalar.push(e.message + ' @ ' + (e.stack ?? '').split(String.fromCharCode(10)).slice(1, 3).join(' | ')));
    const kok = page.locator('#doktor');
    const ac = async (taslak: boolean) => {
      await page.goto('./doktor/index.html?oyun=vaka&test' + (taslak ? '&taslak' : '') + '&yas=' + encodeURIComponent(yas));
      await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 40_000 });
      return (await kok.getAttribute('data-durum')) === 'hazir' ? vaka<A1Acik>(page, 'acik') : null;
    };
    const hepsi = (a: A1Acik | null) => !!a && a.giris && a.lavabo && a.gogus && a.pamuk && a.defter;
    let acik = await ac(false);
    if (kip === 'taslak' && !hepsi(acik)) acik = await ac(true);      // eksik aşama varsa geçici çizimlerle
    test.skip(!acik, 'sayfa açılmadı');
    test.skip(kip === 'taslak' && !hepsi(acik), 'A1 çizimleri yok ve geçici çizim açılmadı (derlenmiş sayfa)');
    const A = acik!;
    test.skip(kip === 'gercek' && !(A.giris || A.lavabo || A.gogus || A.pamuk || A.defter), 'gerçek çizimle açılmış A1 aşaması yok');
    const resimSayimi = () => page.evaluate(async () => {
      const butun = [...document.querySelectorAll<HTMLImageElement>('#doktor img')];
      await Promise.all(butun.map(i => i.decode().catch(() => undefined)));
      return { taslak: butun.filter(i => i.src.includes('taslak')).length, kirik: butun.filter(i => i.src && !i.naturalWidth).length };
    });
    const resimler = await resimSayimi();
    test.skip(kip === 'taslak' && resimler.kirik > 0, 'geçici çizimler bu makinede yok (npx vite-node doktor/araclar/a1-taslak.ts)');
    if (kip === 'gercek') expect(resimler, 'gerçek akışta geçici ya da kırık çizim yok').toEqual({ taslak: 0, kirik: 0 });

    const asama = (a: string | RegExp) => expect(kok).toHaveAttribute('data-asama', a, { timeout: 20_000 });
    const durum = () => vaka<A1Durum>(page, 'durum');
    const alt = async (s: string, ad2: string, i = 0) => (await vaka<Nokta | null>(page, 'alt', s, ad2, i))!;
    const altSayim = <T>(s: string) => vaka<T>(page, 'altSayim', s);
    const nokta = async (ad2: string, i = 0) => (await vaka<Nokta | null>(page, 'nokta', ad2, i))!;
    const bas = async (q: Nokta) => { await page.mouse.move(q.x, q.y); await page.mouse.down(); };
    const dokun = async (q: Nokta) => { await bas(q); await page.mouse.up(); };
    const olcek = await vaka<number>(page, 'olcek');

    // 1) geliş: Zıpzıp topallayarak gelir; üç dokunuşta sedyeye zıplar
    if (A.giris) {
      await asama('gelis');
      await expect(kok.locator('.vk-zipzip')).toHaveClass(/vk-gizli/);
      await expect.poll(async () => (await durum()).gelis?.yuruyor, { timeout: 15_000 }).toBe(false);
      for (let i = 1; i <= 3; i++) { await dokun(await nokta('gelis')); await expect.poll(async () => (await durum()).gelis?.zip, { timeout: 5000 }).toBe(i); await page.waitForTimeout(120); }
    }
    await asama('giris');
    await expect(kok.locator('.vk-zipzip')).not.toHaveClass(/vk-gizli/);

    // 2) çanta açılır; sıradaki iş lavabo
    await kok.locator('.vk-canta').click({ force: true });
    if (A.lavabo) {
      await expect(kok.getByRole('button', { name: 'Lavabo' })).toBeVisible();
      await expect(kok.locator('.vk-pati-dugmesi')).toBeHidden();
      expect(await enKucukKenar(page, '#doktor .vk-kol-dugmesi')).toBeGreaterThanOrEqual(64);
      await dokun(await nokta('lavabo-dugmesi'));
      await asama('lavabo-ac');
      if (kip === 'gercek') {
        // aynada Kino var, camın içine kırpılı
        expect((await altSayim<{ ayna: string | null }>('lavabo')).ayna).not.toBeNull();
        expect(await kok.locator('.lv-ayna').evaluate(e => getComputedStyle(e).clipPath)).toContain('ellipse');
      }
      await lavaboyuOyna(page, true);
      // masaya dönüş; bellek: lavabo bırakıldı (aynı anda en çok bir sahne kurulu)
      await asama('canta');
      expect(await vaka<string[]>(page, 'kurulu')).not.toContain('lavabo');
      await expect(kok.locator('.vk-lavabo')).toHaveCount(0);
    }

    // 3) göğüs: stetoskop kalbin üstünde tutulur
    if (A.gogus) {
      await expect(kok.getByRole('button', { name: 'Zıpzıp\'ın göğsü' })).toBeVisible();
      await dokun(await nokta('gogus-dugmesi'));
      await asama('gogus');
      await expect.poll(() => vaka<string[]>(page, 'kurulu')).toEqual(['gogus']);
      const st = await alt('gogus', 'stetoskop');
      await bas(st); await page.mouse.move(st.x + 1, st.y + 1);
      const baslik = await alt('gogus', 'baslik'), kalp = await alt('gogus', 'kalp');
      // önce göğsün kenarı (uzak: kalp duyulmaz), sonra kalbin üstü
      const kenar = await alt('gogus', 'gogus-kenari');
      await page.mouse.move(st.x + 1 + kenar.x - baslik.x, st.y + 1 + kenar.y - baslik.y, { steps: 8 });
      await page.waitForTimeout(300);
      expect((await altSayim<{ dinlenen: number }>('gogus')).dinlenen).toBe(0);
      await page.mouse.move(st.x + 1 + kalp.x - baslik.x, st.y + 1 + kalp.y - baslik.y, { steps: 8 });
      // atışlar sayılır; dinleme dolunca sahne biter (bittikten sonra sahne bırakılır: sayım yoksa bitmiştir)
      await expect.poll(async () => (await altSayim<{ atis: number } | null>('gogus'))?.atis ?? 99, { timeout: 8000 }).toBeGreaterThanOrEqual(1);
      await expect.poll(async () => { const g = await altSayim<{ tamam: boolean } | null>('gogus'); return !g || g.tamam; }, { timeout: 15_000 }).toBe(true);
      await page.mouse.up();
      await asama('canta');
      await expect(kok.locator('.vk-gogus')).toHaveCount(0);
    }
    await expect(kok.locator('.vk-pati-dugmesi')).toBeVisible();
    await expect(kok.locator('.vk-gelis')).toHaveCount(0);

    // 4) kol: Y1 adımları + ıslak pamuk; 5) çıkartma defteri
    const pamuk = async () => {
      await asama('pamuk');
      await bas(await nokta('pamuk'));
      // kuru pamuk silmez
      const h0 = await nokta('pamuk-hucre', 14); await page.mouse.move(h0.x, h0.y, { steps: 6 }); await page.mouse.move(h0.x + 30, h0.y, { steps: 3 });
      expect((await durum()).pamuk!.oran).toBe(0);
      const kase = await nokta('kase');
      await page.mouse.move(kase.x, kase.y, { steps: 6 });
      await expect.poll(async () => (await durum()).pamuk!.islak).toBe(true);
      // kâseden su sıçrar; ıslak pamuk taşınırken damlar
      await expect.poll(async () => (await vaka<{ damla: number }>(page, 'durum')).damla, { timeout: 4000 }).toBeGreaterThan(0);
      let daldirma = 1;
      for (let i = 0; i < 36 && (await kok.getAttribute('data-asama')) === 'pamuk'; i++) {
        const h = await nokta('pamuk-hucre', i);
        await page.mouse.move(h.x, h.y, { steps: 3 });
        if ((await durum()).pamuk?.kir === 3) { await page.mouse.move(kase.x, kase.y, { steps: 6 }); daldirma++; await expect.poll(async () => (await durum()).pamuk!.kir).toBe(0); }
      }
      await page.mouse.up();
      if (yas === '5+') expect(daldirma, '5+ yaşta pamuk en az bir kez çalkalanır').toBeGreaterThanOrEqual(2);
    };
    const odul = async () => {
      await asama('defter');
      await expect.poll(() => vaka<string[]>(page, 'kurulu')).toEqual(['defter']);
      const hedef = (await altSayim<{ hedef: number }>('defter')).hedef;
      expect(hedef).toBe(yas === '2-3' ? 1 : yas === '4' ? 2 : 3);
      // boş yere bırakılan çıkartma tabakaya döner
      const c0 = await alt('defter', 'cikartma', 7);
      await bas(c0); await page.mouse.move(c0.x - 200 * olcek, c0.y + 260 * olcek, { steps: 6 }); await page.mouse.up();
      expect((await altSayim<{ yapisan: number }>('defter')).yapisan).toBe(0);
      for (let i = 0; i < hedef; i++) {
        const c = await alt('defter', 'cikartma', i), y = await alt('defter', 'yuva', i);
        await bas(c); await page.mouse.move(c.x + 1, c.y + 1);
        await page.mouse.move(y.x, y.y + 20 * olcek, { steps: 10 });
        await page.mouse.up();
        await expect.poll(async () => (await altSayim<{ yapisan: number }>('defter')).yapisan).toBe(i + 1);
      }
      await asama('defter-damga');
      const d = await alt('defter', 'damga');
      await bas(d); await page.mouse.move(d.x + 1, d.y + 1);
      const uc = await alt('defter', 'damga-ucu'), dh = await alt('defter', 'damga-hedefi');
      await page.mouse.move(d.x + 1 + dh.x - uc.x, d.y + 1 + dh.y - uc.y, { steps: 10 });
      await page.mouse.up();
      await asama(/defter-bitti|kutlama|son/);
      // son çıkartma yapışınca Zıpzıp'ın resmi güler (onay notundaki ek kare; gerçek akışta çizimi geldiyse)
      await expect.poll(async () => (await durum()).odul, { timeout: 10_000 }).toMatchObject(kip === 'taslak' ? { adim: 'bitti', yapisan: hedef, portre: true } : { adim: 'bitti', yapisan: hedef });
    };
    const S = await vakayiOyna(page, { masadan: true, pamuk: A.pamuk ? pamuk : undefined, odul: A.defter ? odul : undefined });
    if (kip === 'taslak') {
      // ikinci geçişin kareleri bağlı: mikrop döngüleri, dört karelik pof, dikenin gerilmesi ve izi, tepki pozları, parıltı,
      // konfeti, bandın kâğıdı; bant düzeldi; kutlamada Kino dans ediyor
      expect(await vaka(page, 'kareler')).toEqual({ mikrop: S.mikrop, pof: 4, diken: true, iz: S.diken, yuz: 6, kinoMasa: 8, kinoYakin: 5, bekle: 2, parilti: true, konfeti: true, bantKagit: true, bantDuz: true, kuyruk: true, kinoDans: true });
      await expect(kok.locator('.vk-kino img.vk-gorunur')).toHaveAttribute('src', /kino-dans-/);
    }
    // 6) masada kutlama (dans kareleri açıksa sevinç dansı); "yeniden oyna" hazır
    if (A.dans) {
      expect((await durum()).dans).toBe(true);
      await expect(kok.locator('.vk-dans')).not.toHaveClass(/vk-gizli/);
    }
    await expect(kok.locator('.vk-tekrar')).toBeVisible();
    expect(await vaka<string[]>(page, 'kurulu')).toEqual([]);
    if (kip === 'gercek') expect((await resimSayimi()).taslak, 'oyun boyunca geçici çizim yüklenmedi').toBe(0);
    // yeniden oyna: akış baştan başlar
    await kok.locator('.vk-tekrar').click({ force: true });
    await asama(A.giris ? 'gelis' : 'giris');
    expect(hatalar).toEqual([]);
  });
}
