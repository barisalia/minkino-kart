import { test, expect, type Page } from '@playwright/test';

// Minik Doktor · bekleme odası ve klinik akışı (doktor/src/klinik/). Asıl çizimler (Paket Doktor-K1) gelene kadar geliştirme
// sunucusunda geçici çizimlerle (?taslak) koşar: altı hasta boşta döner, sıradaki iki hasta seçilir, seçilen hasta kapıdan içeri
// yürür ve vakası açılır. Vakada geri düğmesi bekleme odasına döner. İyileşen hasta yerine oturur, çıkartması panoya asılır,
// kayıt tutulur. Pano dolunca kutlama olur; biten vaka yeniden oynanır.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
  if (bilgi.project.name === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
});

type Nokta = { x: number; y: number };
const K = <T>(page: Page, ad: string, ...arg: unknown[]) =>
  page.evaluate(([a, g]) => (window as unknown as { __klinik: Record<string, (...x: unknown[]) => unknown> }).__klinik[a](...g), [ad, arg] as [string, unknown[]]) as Promise<T>;
const ANAHTAR = 'minkino-doktor-vaka-v1';
const HASTALAR = ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum'];
const VAKALAR = ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum', 'lokum-kuzu', 'bulut-bocek', 'mino-cingirak'];

async function ac(page: Page, iyilesen: string[] = []) {
  // kayıt yalnız ilk açılışta yazılır (yeniden yüklemede oyunun kendi kaydı okunur)
  await page.addInitScript(([a, v]) => { try { if (!sessionStorage.getItem('klinik-tohum')) { sessionStorage.setItem('klinik-tohum', '1'); localStorage.setItem(a, v); } } catch { /* yok */ } }, [ANAHTAR, JSON.stringify({ s: 1, iyilesen })] as [string, string]);
  const kok = page.locator('#doktor');
  await page.goto('./doktor/index.html?oyun=klinik&test&taslak&yas=4');
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'eksik', 'çizim yok');
  await expect(kok).toHaveAttribute('data-asama', /bekleme|doldu/, { timeout: 15_000 });
  return kok;
}
const dokun = async (page: Page, h: string) => { const p = (await K<Nokta | null>(page, 'hasta', h))!; expect(p, h).not.toBeNull(); await page.mouse.click(p.x, p.y); };
const kayit = (page: Page) => page.evaluate(a => JSON.parse(localStorage.getItem(a) ?? '{}') as { iyilesen?: string[] }, ANAHTAR);

test('bekleme odası: çizimler eksikken açılmaz, ekranda hiçbir görüntü yok', async ({ page }) => {
  await page.goto('./doktor/index.html?oyun=klinik&test');
  const kok = page.locator('#doktor');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 30_000 });
  await expect(kok).toHaveAttribute('data-durum', /eksik|hazir/, { timeout: 30_000 });
  test.skip((await kok.getAttribute('data-durum')) === 'hazir', 'çizimler gelmiş');
  await expect(kok.locator('img')).toHaveCount(0);
  await expect(kok.locator('.vk-sahne')).toHaveCount(0);
});

test('bekleme odası: yedi hasta boşta döner, sırada iki hasta; sırası gelmeyen derdiyle tepki verir, hedefler iri', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  const kok = await ac(page);
  expect(await K<string[]>(page, 'acik')).toEqual(VAKALAR);
  expect(await K<string[]>(page, 'odadakiler')).toEqual(HASTALAR);
  expect(await K<string[]>(page, 'sira')).toEqual(['zipzip', 'mino']);
  await expect(kok.locator('.kl-hasta')).toHaveCount(7);
  await expect(kok.locator('.kl-hasta.kl-sirada')).toHaveCount(2);
  await expect(kok.locator('.kl-hasta-dugme[data-durum="bekliyor"]')).toHaveCount(5);
  await expect(kok.locator('.kl-cikartma.kl-asili')).toHaveCount(0);
  // dokunma kutuları ekranda en az 64 pt
  for (const h of HASTALAR) { const b = (await K<{ g: number; y: number }>(page, 'hastaKutusu', h))!; expect(Math.min(b.g, b.y), h).toBeGreaterThanOrEqual(64); }
  // boşta döngü: kareler kendiliğinden değişir (her hasta beş kareyi dolaşır)
  const goruldu = new Map(HASTALAR.map(h => [h, new Set<string>()]));
  for (let i = 0; i < 40; i++) { for (const h of HASTALAR) goruldu.get(h)!.add((await K<string>(page, 'kare', h))!); await page.waitForTimeout(60); }
  for (const h of HASTALAR) expect(goruldu.get(h)!.size, h).toBeGreaterThanOrEqual(3);
  // sırası gelmeyen Pamuk: hapşırır (vurgu karesi), içeri girmez
  await dokun(page, 'pamuk');
  await expect.poll(() => K<string>(page, 'kare', 'pamuk'), { timeout: 2_000 }).toBe('pamuk-bekle-4');
  await page.waitForTimeout(200);
  expect(await K<string>(page, 'asama')).toBe('bekleme');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik');
  // Kino'ya ve boş yere dokunuş da karşılık verir, akışı bozmaz
  const kino = await K<Nokta>(page, 'kino');
  await page.mouse.click(kino.x, kino.y);
  const s = await page.locator('#doktor .kl-sahne').boundingBox();
  await page.mouse.click(s!.x + s!.width * 0.5, s!.y + s!.height * 0.45);
  expect(await K<string>(page, 'asama')).toBe('bekleme');
  expect(hatalar).toEqual([]);
});

test('sıradaki hasta içeri yürür, vakası açılır; vakada geri düğmesi bekleme odasına döner (ana menüye değil)', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  const kok = await ac(page);
  const adres = page.url();
  await dokun(page, 'mino');
  await expect(kok).toHaveAttribute('data-oyun', 'disler', { timeout: 15_000 });
  await expect(kok).toHaveAttribute('data-klinik', 'vaka');
  expect(await K<string | null>(page, 'aktif')).toBe('mino');
  await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 30_000 });
  await kok.locator('.vk-geri').click();
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 10_000 });
  await expect(kok).toHaveAttribute('data-asama', 'bekleme', { timeout: 10_000 });
  expect(page.url()).toBe(adres);
  expect(await kok.getAttribute('data-klinik')).toBeNull();
  expect(await K<string[]>(page, 'iyilesen')).toEqual([]);
  expect(await K<string[]>(page, 'sira')).toEqual(['zipzip', 'mino']);
  await expect(kok.locator('.kl-hasta')).toHaveCount(7);
  // oda yeniden canlı: boşta döngü sürüyor
  const once = await K<string>(page, 'kare', 'bulut');
  await expect.poll(() => K<string>(page, 'kare', 'bulut'), { timeout: 3_000 }).not.toBe(once);
  // bekleme odasında geri: ana menü (kök boşalır)
  expect(hatalar).toEqual([]);
});

test('iyileşen hasta mutlu döner, yerine oturur; çıkartması panoya asılır, kayıt tutulur', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  const kok = await ac(page, ['zipzip', 'mino', 'bulut', 'mila']);
  expect(await K<string[]>(page, 'sira')).toEqual(['pamuk', 'polly']);
  await expect(kok.locator('.kl-cikartma.kl-asili')).toHaveCount(4);
  // Bulut'un uğur böceği ve Mino'nun çıngırak vakası hâlâ açık: ikisi iyileşmiş sayılmaz, yeniden sıralarını beklerler
  await expect(kok.locator('.kl-hasta-dugme[data-durum="iyi"]')).toHaveCount(2);
  await expect.poll(() => K<string>(page, 'kare', 'zipzip'), { timeout: 3000 }).toMatch(/^zipzip-mutlu-/);
  await dokun(page, 'pamuk');
  await expect(kok).toHaveAttribute('data-oyun', 'hapsu', { timeout: 15_000 });
  await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 30_000 });
  await K(page, 'vakaBitti');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 10_000 });
  await expect(kok).toHaveAttribute('data-asama', 'bekleme', { timeout: 10_000 });
  expect(await K<string[]>(page, 'iyilesen')).toEqual(['zipzip', 'mino', 'bulut', 'mila', 'pamuk']);
  expect((await kayit(page)).iyilesen).toContain('pamuk');
  expect(await K<string[]>(page, 'asili')).toContain('pamuk');
  await expect(kok.locator('.kl-cikartma.kl-asili')).toHaveCount(5);
  await expect(kok.locator('.kl-ucan')).toHaveCount(0);
  expect(await K<string>(page, 'kare', 'pamuk')).toMatch(/^pamuk-mutlu-/);
  expect(await K<string[]>(page, 'sira')).toEqual(['polly', 'lokum']);
  await expect(kok.locator('.kl-hasta.kl-sirada')).toHaveCount(2);
  // yeniden açılınca kayıt yerinde
  await page.reload();
  await expect(kok).toHaveAttribute('data-asama', 'bekleme', { timeout: 30_000 });
  expect(await K<string[]>(page, 'iyilesen')).toHaveLength(5);
  expect(hatalar).toEqual([]);
});

test('Bulut ateşi geçince uğur böceğiyle yeniden sıraya girer; son vaka iyileşince pano dolar, kutlama olur; biten vaka yeniden oynanır', async ({ page }) => {
  const hatalar: string[] = [];
  page.on('pageerror', e => hatalar.push(e.message));
  const kok = await ac(page, ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum', 'lokum-kuzu', 'mino-cingirak']);
  expect(await K<string[]>(page, 'sira')).toEqual(['bulut-bocek']);
  expect(await K<string>(page, 'simdiki', 'bulut')).toBe('bulut-bocek');
  await expect.poll(() => K<string>(page, 'kare', 'bulut'), { timeout: 3000 }).toMatch(/^bulut-bocek-bekle-/);
  await expect(kok.locator('.kl-cikartma.kl-asili')).toHaveCount(9);
  await dokun(page, 'bulut');
  await expect(kok).toHaveAttribute('data-oyun', 'bocek', { timeout: 15_000 });
  await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 30_000 });
  const asamalar: string[] = [];
  await page.exposeFunction('__asamaYaz', (a: string) => { asamalar.push(a); });
  await page.evaluate(() => {
    const k = document.getElementById('doktor')!;
    new MutationObserver(() => (window as unknown as { __asamaYaz: (a: string) => void }).__asamaYaz(k.dataset.asama ?? '')).observe(k, { attributes: true, attributeFilter: ['data-asama'] });
  });
  await K(page, 'vakaBitti');
  await expect(kok).toHaveAttribute('data-asama', 'doldu', { timeout: 15_000 });
  expect(asamalar).toContain('kutlama');
  expect(asamalar.indexOf('donus')).toBeLessThan(asamalar.lastIndexOf('kutlama'));
  await expect(kok.locator('.kl-cikartma.kl-asili')).toHaveCount(10);
  expect((await kayit(page)).iyilesen).toHaveLength(10);
  await expect.poll(() => K<string>(page, 'kare', 'bulut'), { timeout: 3000 }).toMatch(/^bulut-mutlu-/);
  await expect(kok.locator('.kl-hasta.kl-sirada')).toHaveCount(0);
  // pano dolu: iyileşmiş hasta yine seçilir, vakası yeniden açılır; dönünce kutlama tekrarlanmaz
  await dokun(page, 'mila');
  await expect(kok).toHaveAttribute('data-oyun', 'boya', { timeout: 15_000 });
  await expect(kok).toHaveAttribute('data-durum', 'hazir', { timeout: 30_000 });
  asamalar.length = 0;
  await K(page, 'vakaBitti');
  await expect(kok).toHaveAttribute('data-oyun', 'klinik', { timeout: 10_000 });
  await expect(kok).toHaveAttribute('data-asama', 'doldu', { timeout: 10_000 });
  expect(asamalar).not.toContain('kutlama');
  expect((await kayit(page)).iyilesen).toHaveLength(10);
  expect(hatalar).toEqual([]);
});
