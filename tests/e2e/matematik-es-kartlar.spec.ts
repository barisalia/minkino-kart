import { test, expect, type Page } from '@playwright/test';

// Mila ile Pamuk'un Eş Kartları (matematik/src/es-kartlar.ts, main.ts → esKartlar): görsel bellek ve eşleme. Test kipinde
// ?test=1&yenitur=eskart ile adı yazılı kutularla (Astra M36 gelince uygulamada kendiliğinden açılır).
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
    localStorage.setItem('minkino-matematik-1-' + onek + 'fener', JSON.stringify({ adim: 1, yer: 0, secimler: [], kuleTamam: true, misketiGecti: true, surum: 3, tekrar: 0 }));
  }, [yas] as const);
  await p.goto('/matematik/?test=1&yenitur=eskart');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
}
const sahne = (p: Page) => p.locator('.pk-sahne');
const kart = (p: Page, i: number) => p.locator('.pk-kart[data-i="' + i + '"]');
const oyna = (p: Page) => expect(sahne(p)).toHaveAttribute('data-durum', 'oyna', { timeout: 20000 });
const kayit = (p: Page, a: string) => p.evaluate((x) => JSON.parse(localStorage.getItem(x) || 'null'), a);
/** Kartların resimleri (test için DOM'dan): resim → iki kartın sırası. */
async function esler(p: Page) {
  const d = await p.locator('.pk-kart').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.resim!));
  const m = new Map<string, number[]>();
  d.forEach((r, i) => m.set(r, [...(m.get(r) ?? []), i]));
  return { d, m };
}

test('2–3 yaş · Eş Kartları: dört kart önce bir an açık; eş olmayan iki kart kapanır; iki eş bulunur', async ({ page: p }) => {
  await ac(p, 3);
  await expect(sahne(p)).toHaveAttribute('data-durum', 'onizleme', { timeout: 20000 });
  await expect(p.locator('.pk-kart')).toHaveCount(4);
  await expect(p.locator('.pk-kart[data-acik]')).toHaveCount(4);
  await oyna(p);
  await expect(p.locator('.pk-kart[data-acik]')).toHaveCount(0);
  const { d, m } = await esler(p);
  // Eş olmayan iki kart: açılır, sonra ikisi kapanır.
  const farkli = d.findIndex((r) => r !== d[0]);
  await kart(p, 0).click();
  await kart(p, farkli).click();
  await expect(sahne(p)).toHaveAttribute('data-durum', 'bak');
  await oyna(p);
  await expect(p.locator('.pk-kart[data-acik]')).toHaveCount(0);
  for (const [, [a, b]] of m) { await oyna(p); await kart(p, a).click(); await kart(p, b).click(); await expect(kart(p, b)).toHaveClass(/es/); }
  await expect(p.locator('.pk-kart.es')).toHaveCount(4);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-fener')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Eş Kartları: sekiz kart, bakış yok; dört eş; sonda eşler ikişer sayılır', async ({ page: p }) => {
  await ac(p, 5);
  await oyna(p);
  await expect(p.locator('.pk-kart')).toHaveCount(8);
  await expect(p.locator('.pk-kart[data-acik]')).toHaveCount(0);
  const { m } = await esler(p);
  for (const [, [a, b]] of m) { await oyna(p); await kart(p, a).click(); await kart(p, b).click(); await expect(kart(p, b)).toHaveClass(/es/); }
  await expect(sahne(p)).toHaveAttribute('data-bulunan', '4');
  await expect(sahne(p)).toHaveAttribute('data-durum', 'say', { timeout: 20000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 40000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-fener')).adim, { timeout: 15000 }).toBe(2);
});
