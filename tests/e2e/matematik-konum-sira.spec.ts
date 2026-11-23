import { test, expect, type Page } from '@playwright/test';

// Lokum'la Saklambaç (konum) ve Kaydırak Sırası (sıra sayıları): matematik/src/konum-sira.ts, main.ts → lokumlaSaklambac,
// kaydirakSirasi. Test kipinde ?test=1&yenitur=saklambac|kaydirak ile, çizim yerinde adı yazılı kutularla (Astra M33–M34 gelince
// uygulamada kendiliğinden açılır).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 150000 });

async function ac(p: Page, yas: number, kose: string, adres: string, tekrar = 0) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, kk, t]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    const onek = y < 4 ? 'minik-' : y === 4 ? 'dort-' : '';
    localStorage.setItem('minkino-matematik-1-' + onek + kk, JSON.stringify({ adim: 1, yer: 0, secimler: [], kuleTamam: true, misketiGecti: true, surum: 3, tekrar: t }));
  }, [yas, kose, tekrar] as const);
  await p.goto(adres);
}
const kayit = (p: Page, anahtar: string) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), anahtar);
const dugme = (p: Page, ad: string) => p.getByRole('button', { name: ad, exact: true });

// ----- Saklambaç -----
const sk = (p: Page) => p.locator('.sk-sahne');
/** Fonun pikselinden ekran noktası (fon 1672 genişlikli, sahnenin sol üstünden). */
async function nokta(p: Page, x: number, y: number) {
  const r = (await sk(p).boundingBox())!;
  return { x: r.x + (x * r.width) / 1672, y: r.y + (y * r.width) / 1672 };
}
/** Eşyayı parmakla sürükleyip fonun o pikseline bırakır. */
async function surukle(p: Page, oyuncak: 'Top' | 'Ayıcık', x: number, y: number) {
  const b = (await dugme(p, oyuncak).boundingBox())!;
  const h = await nokta(p, x, y);
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  await p.mouse.move(b.x + b.width / 2 + 20, b.y + b.height / 2 - 20, { steps: 4 });
  await p.mouse.move(h.x, h.y, { steps: 12 });
  await p.mouse.up();
}
const bekle = (p: Page, durum: string, sure = 40000) => expect(sk(p)).toHaveAttribute('data-durum', durum, { timeout: sure });

test("4 yaş · Saklambaç: Lokum'u Ceren'in sözüyle bulur (yanlış yer konu defterine yazılır), sonra odayı toplar", async ({ page: p }) => {
  await ac(p, 4, 'sekil', '/matematik/?test=1&yenitur=saklambac');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(sk(p)).toHaveAttribute('data-bul', 'arkasinda,altinda');
  await expect(sk(p)).toHaveAttribute('data-koy', 'icinde,yaninda');
  // Göz kapalıyken Ceren'le sayılır; açılınca "Lokum koltuğun arkasında!"
  await expect(p.locator('.sk-gozler.kapali')).toBeVisible({ timeout: 20000 });
  await bekle(p, 'bul');
  await expect(sk(p)).toHaveAttribute('data-rel', 'arkasinda');
  await expect(p.locator('.sk-gozler.kapali')).toHaveCount(0);
  // Yanlış yer: "Orada yok!", söz yinelenir; ilk yanlış konu defterine.
  await dugme(p, 'Sandık').click();
  await bekle(p, 'dinle', 5000);
  await bekle(p, 'bul');
  await expect.poll(async () => Object.keys((await kayit(p, 'minkino-matematik-konu-tekrar-dort-v1')) ?? {})).toContain('konum:arkasinda');
  await dugme(p, 'Koltuk').click();
  await expect(p.locator('.sk-lokum')).toHaveAttribute('data-poz', 'bak');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sekil')).secimler).toEqual([0]);
  // İkinci saklanış: masanın altı.
  await expect(sk(p)).toHaveAttribute('data-rel', 'altinda', { timeout: 40000 });
  await bekle(p, 'bul');
  await dugme(p, 'Masa').click();
  await expect(p.locator('.sk-lokum')).toHaveAttribute('data-poz', 'emekle');
  // Toplama: büyüklerde iki eşya yerde; "Topu sandığın içine koy."
  await bekle(p, 'koy');
  await expect(p.locator('.sk-oyuncak')).toHaveCount(2);
  await expect(sk(p)).toHaveAttribute('data-rel', 'icinde');
  // Dokunma alanı telefonda da en az 64 px (küçük top ::before ile büyür; KALITE-KURALLARI 8).
  expect(await dugme(p, 'Top').evaluate((e) => parseFloat(getComputedStyle(e, '::before').width))).toBeGreaterThanOrEqual(64);
  const ayi = (await dugme(p, 'Ayıcık').boundingBox())!;
  expect(Math.min(ayi.width, ayi.height)).toBeGreaterThanOrEqual(64);
  // Yanlış eşya geri döner.
  await surukle(p, 'Ayıcık', 280, 600);
  await bekle(p, 'dinle', 5000);
  await bekle(p, 'koy');
  await expect(dugme(p, 'Ayıcık')).not.toHaveClass(/yerinde/);
  // Top parmakla sandığa: sandığın içine (sandığın kırpılan katında).
  await surukle(p, 'Top', 280, 600);
  await bekle(p, 'kondu', 5000);
  await expect(p.locator('.sk-kirp .sk-oyuncak.yerinde')).toHaveCount(1);
  // "Ayıcığı sandığın yanına koy." Dokun-seç, sonra yere dokun: önce yanlış yer (masanın üstü), sonra sandığın yanı.
  await expect(sk(p)).toHaveAttribute('data-rel', 'yaninda', { timeout: 20000 });
  await bekle(p, 'koy');
  await dugme(p, 'Ayıcık').click();
  await expect(sk(p)).toHaveAttribute('data-secili', 'ayicik');
  let n = await nokta(p, 850, 380);
  await p.mouse.click(n.x, n.y);
  await bekle(p, 'dinle', 5000);
  await bekle(p, 'koy');
  await dugme(p, 'Ayıcık').click();
  n = await nokta(p, 540, 600);
  await p.mouse.click(n.x, n.y);
  await bekle(p, 'kondu', 5000);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sekil')).adim, { timeout: 15000 }).toBe(2);
});

test('2–3 yaş · Saklambaç: içinde ve altında; toplamada yalnız ayıcık, masanın altı değil üstü', async ({ page: p }) => {
  await ac(p, 3, 'sekil', '/matematik/?test=1&yenitur=saklambac');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(sk(p)).toHaveAttribute('data-bul', 'icinde,altinda');
  await bekle(p, 'bul');
  await dugme(p, 'Sandık').click();
  await expect(p.locator('.sk-lokum')).toHaveAttribute('data-poz', 'cik');
  await expect(sk(p)).toHaveAttribute('data-rel', 'altinda', { timeout: 40000 });
  await bekle(p, 'bul');
  await dugme(p, 'Masa').click();
  await bekle(p, 'koy', 40000);
  await expect(p.locator('.sk-oyuncak')).toHaveCount(1);
  await expect(sk(p)).toHaveAttribute('data-oyuncak', 'ayicik');
  await surukle(p, 'Ayıcık', 850, 600);
  await bekle(p, 'dinle', 5000);
  await bekle(p, 'koy');
  await surukle(p, 'Ayıcık', 850, 380);
  await bekle(p, 'kondu', 5000);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

// ----- Kaydırak Sırası -----
const kd = (p: Page) => p.locator('.kd-sahne');
const kdBekle = (p: Page, durum: string, sure = 40000) => expect(kd(p)).toHaveAttribute('data-durum', durum, { timeout: sure });

test('5+ yaş · Kaydırak Sırası: üçüncüye dokun (yanlışta birlikte sayılır), "Bulut kaçıncı?" kartla, sıra ilerler, herkes kayar', async ({ page: p }) => {
  await ac(p, 5, 'fener', '/matematik/?test=1&yenitur=kaydirak');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await kdBekle(p, 'kim');
  await expect(kd(p)).toHaveAttribute('data-dizi', 'kino,lokum,mino,zipzip,bulut');
  await expect(kd(p)).toHaveAttribute('data-cevap', '3');
  // Yanlış: Kino zıplar, Ceren kaydıraktan başlayıp üçe kadar sayar, Mino parlar.
  await dugme(p, 'Kino').click();
  await kdBekle(p, 'say', 5000);
  await kdBekle(p, 'kim');
  await expect(dugme(p, 'Mino')).toHaveClass(/ipucu/);
  await dugme(p, 'Mino').click();
  // Birinci (Kino) kayar, sıranın sonuna geçer: "Bulut kaçıncı sırada?" (dördüncü).
  await kdBekle(p, 'kac');
  await expect(kd(p)).toHaveAttribute('data-dizi', 'lokum,mino,zipzip,bulut,kino');
  await expect(kd(p)).toHaveAttribute('data-cevap', '4');
  await expect(dugme(p, 'Bulut')).toHaveClass(/soruda/);
  await expect(p.locator('.kd-kart')).toHaveCount(5);
  // Sıra kartları telefonda da en az 64 px (KALITE-KURALLARI 8).
  for (const kart of await p.locator('.kd-kart').all()) { const b = (await kart.boundingBox())!; expect(Math.min(b.width, b.height)).toBeGreaterThanOrEqual(64); }
  await dugme(p, '2').click();
  await kdBekle(p, 'say', 5000);
  await kdBekle(p, 'kac');
  await dugme(p, '4').click();
  // Beşinci kim? Sıra yine ilerledi: Lokum en sonda.
  await kdBekle(p, 'kim');
  await expect(kd(p)).toHaveAttribute('data-dizi', 'mino,zipzip,bulut,kino,lokum');
  await expect(p.locator('.kd-kart')).toHaveCount(0);
  await dugme(p, 'Lokum').click();
  await kdBekle(p, 'hepsi', 20000);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 60000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-fener')).adim, { timeout: 15000 }).toBe(2);
});

test('2–3 yaş · Kaydırak Sırası: üç arkadaş; birinci, sonra (sıra ilerleyince) sonuncu; kart yok', async ({ page: p }) => {
  await ac(p, 3, 'fener', '/matematik/?test=1&yenitur=kaydirak');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await kdBekle(p, 'kim');
  await expect(kd(p)).toHaveAttribute('data-dizi', 'kino,lokum,mino');
  await expect(p.locator('.kd-dost')).toHaveCount(3);
  await dugme(p, 'Kino').click();
  await kdBekle(p, 'kim');
  await expect(kd(p)).toHaveAttribute('data-dizi', 'lokum,mino,kino');
  await expect(kd(p)).toHaveAttribute('data-tur', 'son');
  await dugme(p, 'Kino').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 60000 });
});
