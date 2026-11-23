import { test, expect, type Page } from '@playwright/test';

// Dede'nin Şekil Kutusu (matematik/src/sekil-kutusu.ts, main.ts → sekilKutusu): şekil tanıma ve eşleme. Test kipinde
// ?test=1&yenitur=kutu ile adı yazılı kutularla (Astra M37 gelince uygulamada kendiliğinden açılır).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 150000 });

async function ac(p: Page, yas: number) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    const onek = y < 4 ? 'minik-' : y === 4 ? 'dort-' : '';
    localStorage.setItem('minkino-matematik-1-' + onek + 'sekil', JSON.stringify({ adim: 1, yer: 0, secimler: [], kuleTamam: true, misketiGecti: true, surum: 3, tekrar: 0 }));
  }, [yas] as const);
  await p.goto('/matematik/?test=1&yenitur=kutu');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
}
const sahne = (p: Page) => p.locator('.dk-sahne');
const parca = (p: Page, i: number) => p.locator('.dk-parca[data-i="' + i + '"]');
const delik = (p: Page, s: string) => p.locator('.dk-delik[data-sekil="' + s + '"]');
const kayit = (p: Page, a: string) => p.evaluate((x) => JSON.parse(localStorage.getItem(x) || 'null'), a);
async function surukle(p: Page, i: number, s: string) {
  const b = (await parca(p, i).boundingBox())!, h = (await delik(p, s).boundingBox())!;
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  await p.mouse.move(b.x + b.width / 2 - 30, b.y + b.height / 2, { steps: 4 });
  await p.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 12 });
  await p.mouse.up();
}

test('2–3 yaş · Şekil Kutusu: kare daire deliğine girmez (konu defterine); dört parça kendi deliğine (sürükle ve dokun)', async ({ page: p }) => {
  await ac(p, 3);
  await expect(sahne(p)).toHaveAttribute('data-durum', 'koy', { timeout: 20000 });
  await expect(p.locator('.dk-parca')).toHaveCount(4);
  const sekiller = await p.locator('.dk-parca').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.sekil!));
  // Yanlış delik: kare parça daire deliğine.
  const kare = sekiller.indexOf('kare');
  await surukle(p, kare, 'daire');
  await expect(sahne(p)).toHaveAttribute('data-giren', '0');
  await expect.poll(async () => Object.keys((await kayit(p, 'minkino-matematik-konu-tekrar-minik-v1')) ?? {})).toContain('sekil:kare');
  for (const [i, s] of sekiller.entries()) {
    if (i % 2) await surukle(p, i, s);
    else { await parca(p, i).click(); await delik(p, s).click(); }
    await expect(parca(p, i)).toHaveClass(/girdi/);
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-sekil')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Şekil Kutusu: ters üçgen girmez, dokununca döner; beş şekil kutuya', async ({ page: p }) => {
  await ac(p, 5);
  await expect(sahne(p)).toHaveAttribute('data-durum', 'koy', { timeout: 20000 });
  const bilgi = await p.locator('.dk-parca').evaluateAll((els) => els.map((e) => ({ s: (e as HTMLElement).dataset.sekil!, a: Number((e as HTMLElement).dataset.aci) })));
  const duzMu = (s: string, a: number) => s === 'daire' || s === 'kare' || (s === 'dikdortgen' ? a % 180 === 0 : a % 360 === 0);
  // Ters üçgen deliğine sürüklenir: girmez.
  const ucgen = bilgi.findIndex((x) => x.s === 'ucgen');
  expect(bilgi[ucgen].a).toBe(180);
  await surukle(p, ucgen, 'ucgen');
  await expect(parca(p, ucgen)).not.toHaveClass(/girdi/);
  for (const [i, x] of bilgi.entries()) {
    let a = x.a;
    // Düz değilse dokunup çevir (her dokunuş 90°).
    while (!duzMu(x.s, a)) { await parca(p, i).click(); a += 90; }
    if (a !== x.a) await delik(p, x.s).click(); // son dokunuş seçti: deliğe dokun
    else { await parca(p, i).click(); a += 90; while (!duzMu(x.s, a)) { await parca(p, i).click(); a += 90; } await delik(p, x.s).click(); }
    await expect(parca(p, i)).toHaveClass(/girdi/);
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});
