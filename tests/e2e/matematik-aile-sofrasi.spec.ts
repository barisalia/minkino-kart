import { test, expect, type Page } from '@playwright/test';

// Kino Ailesinin Sofrası (matematik/src/aile-sofrasi.ts, main.ts → kinoAileSofrasi): büyüklüğe göre eşleme. Test kipinde
// ?test=1&yenitur=sofra ile çizim yerinde adı yazılı kutularla (Astra M35 gelince uygulamada kendiliğinden açılır).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 150000 });

async function ac(p: Page, yas: number, tekrar = 0) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, t]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    const onek = y < 4 ? 'minik-' : y === 4 ? 'dort-' : '';
    localStorage.setItem('minkino-matematik-1-' + onek + 'olcu', JSON.stringify({ adim: 1, yer: 0, secimler: [], kuleTamam: true, misketiGecti: true, surum: 3, tekrar: t }));
  }, [yas, tekrar] as const);
  await p.goto('/matematik/?test=1&yenitur=sofra');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
}
const sahne = (p: Page) => p.locator('.ai-sahne');
const esya = (p: Page, boy: string) => p.locator('.ai-esya[data-boy="' + boy + '"]:not(.yerinde)');
const kayit = (p: Page, a: string) => p.evaluate((x) => JSON.parse(localStorage.getItem(x) || 'null'), a);
/** Önce eşyaya, sonra kişiye dokun. */
async function ver(p: Page, boy: string, kisi: string) {
  await esya(p, boy).click();
  await expect(sahne(p)).toHaveAttribute('data-secili', boy);
  await p.locator('.ai-hedef[data-kisi="' + kisi + '"]').click();
}
/** Eşyayı parmakla kişinin üstüne sürükle. */
async function surukle(p: Page, boy: string, kisi: string) {
  const b = (await esya(p, boy).boundingBox())!, h = (await p.locator('.ai-kisi[data-kisi="' + kisi + '"]').boundingBox())!;
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2 - 30, { steps: 4 });
  await p.mouse.move(h.x + h.width / 2, h.y + h.height * 0.4, { steps: 12 });
  await p.mouse.up();
}

test('2–3 yaş · Sofra: yalnız Baba ve Kino; büyük kâse Kino\'ya verilmez (konu defterine), büyük Baba\'ya, küçük Kino\'ya; sonra bardaklar', async ({ page: p }) => {
  await ac(p, 3);
  await expect(sahne(p)).toHaveAttribute('data-durum', 'dagit', { timeout: 20000 });
  await expect(p.locator('.ai-kisi')).toHaveCount(2);
  await expect(sahne(p)).toHaveAttribute('data-takim', 'kase');
  await expect(p.locator('.ai-esya')).toHaveCount(2);
  // Yanlış: büyük kâse Kino'ya sürüklenir; yerinde kalır.
  await surukle(p, 'buyuk', 'kino');
  await expect(sahne(p)).toHaveAttribute('data-yerlesen', '0');
  await expect.poll(async () => Object.keys((await kayit(p, 'minkino-matematik-konu-tekrar-minik-v1')) ?? {})).toContain('olcu:buyuk-kucuk');
  await ver(p, 'buyuk', 'baba');
  await expect(sahne(p)).toHaveAttribute('data-yerlesen', '1');
  await expect(p.locator('.ai-kisi[data-kisi="baba"]')).toHaveAttribute('data-poz', '1');
  await surukle(p, 'kucuk', 'kino');
  await expect(sahne(p)).toHaveAttribute('data-durum', 'afiyet');
  // İkinci takım: bardaklar.
  await expect(sahne(p)).toHaveAttribute('data-takim', 'bardak', { timeout: 20000 });
  await expect(sahne(p)).toHaveAttribute('data-durum', 'dagit');
  await ver(p, 'kucuk', 'kino');
  await ver(p, 'buyuk', 'baba');
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-olcu')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Sofra: üç boy, üç takım (kâse, bardak, kaşık); orta Kino\'ya verilmez; herkes kendi boyunu alır', async ({ page: p }) => {
  await ac(p, 5);
  const kisi: Record<string, string> = { buyuk: 'baba', orta: 'anne', kucuk: 'kino' };
  await expect(p.locator('.ai-kisi')).toHaveCount(3);
  for (const [i, takim] of ['kase', 'bardak', 'kasik'].entries()) {
    await expect(sahne(p)).toHaveAttribute('data-takim', takim, { timeout: 20000 });
    await expect(sahne(p)).toHaveAttribute('data-durum', 'dagit', { timeout: 20000 });
    if (i === 0) {
      await ver(p, 'orta', 'kino');
      await expect(sahne(p)).toHaveAttribute('data-yerlesen', '0');
    }
    for (const boy of ['orta', 'kucuk', 'buyuk']) await ver(p, boy, kisi[boy]);
    if (i < 2) await expect(sahne(p)).toHaveAttribute('data-durum', 'afiyet');
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-olcu')).adim, { timeout: 15000 }).toBe(2);
});
