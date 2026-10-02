/** Pasta Otobüsü e2e ortak adımları: sipariş okuma, süsleme masası (desen / yüz izleme, serpinti, mum), içecek. */
import { expect, type Page } from '@playwright/test';

export interface Kalem {
  urun: 'kurabiye' | 'kapkek' | 'icecek';
  adet: number;
  sekil: string | null;
  renk: string | null;
  sus: string | null;
  susAdet: number;
  yigin: number;
  desen?: string;
  serpinti?: number;
  yuz?: string | null;
  mum?: number;
  icecek?: string;
  boy?: string;
}
export interface Siparis {
  musteri: string;
  kalemler: Kalem[];
  ozel?: string;
  degisim?: unknown;
  mantik?: { kaynak: string; kalem: Kalem; fazla: number };
}
export interface Durum {
  biten: number;
  mutlu: number;
  temiz: number;
  kirli: number;
  panel: boolean;
}

export const hazirMusteri = (page: Page) => page.locator('.ps-musteri.ps-hazir:not(.ps-bitti)');
export const durum = async (page: Page) => JSON.parse((await page.locator('.ps-gun').getAttribute('data-durum')) ?? '{}') as Durum;
export const siparisi = async (page: Page, ad: string) => JSON.parse((await page.locator(`.ps-musteri[data-musteri="${ad}"]`).getAttribute('data-siparis'))!) as Siparis;

export async function siradaki(page: Page): Promise<{ ad: string; sip: Siparis }> {
  await expect(hazirMusteri(page).first()).toBeVisible({ timeout: 20000 });
  // gelişi en eski müşteri (oyun da tabaktaki partiyi önce onun siparişine göre süsletir)
  const [ad, veri] = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.ps-musteri.ps-hazir:not(.ps-bitti)')].sort((a, b) => Number(a.getAttribute('data-sira')) - Number(b.getAttribute('data-sira')))[0];
    return [m.getAttribute('data-musteri')!, m.getAttribute('data-siparis')!];
  });
  return { ad, sip: JSON.parse(veri) as Siparis };
}

/** Panelin açılış animasyonu bitsin (kart büyürken ölçülen kutu küçük kalır) */
export const animBitsin = (page: Page) =>
  page.locator('.ps-panel').evaluate((e) => Promise.all(e.getAnimations({ subtree: true }).filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished)));

/** Şablonu parmakla izler: noktalara dokunur, çizgileri sürükler (kurabiye birimi → ekran) */
export async function sablonuIzle(page: Page) {
  const sahne = page.locator('.ps-panel-sahne');
  const hedefler = JSON.parse((await sahne.getAttribute('data-hedefler'))!) as { tur: string; yol: [number, number][] }[];
  // panelin açılış animasyonu bitsin (kart büyürken ölçülen kutu küçük kalır)
  await animBitsin(page);
  const r =(await page.locator('.ps-panel-cizim').boundingBox())!;
  const ekran = ([x, y]: [number, number]) => [r.x + (x / 100) * r.width, r.y + (y / 100) * r.height] as const;
  for (const h of hedefler) {
    if (h.tur === 'nokta') {
      const [x, y] = ekran(h.yol[0]);
      await page.mouse.click(x, y);
      continue;
    }
    const [x0, y0] = ekran(h.yol[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i < h.yol.length; i++) {
      const [a, b] = ekran(h.yol[i - 1]);
      const [c, d] = ekran(h.yol[i]);
      for (let k = 1; k <= 3; k++) await page.mouse.move(a + ((c - a) * k) / 3, b + ((d - b) * k) / 3);
    }
    await page.mouse.up();
  }
}

/** Serpinti: kavanozu sürükleyerek sallar (yön değişimleri taneler döker); seviye 0 yok, 1 az (dokunuş), 2 bol */
export async function serpintiSalla(page: Page, seviye: number) {
  const kab = page.locator('.ps-serpinti-kab');
  await expect(kab).toBeVisible();
  await animBitsin(page);
  if (seviye === 1) await kab.click();
  if (seviye === 2) {
    const b = (await kab.boundingBox())!;
    const [x, y] = [b.x + b.width / 2, b.y + b.height / 2];
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 0; i < 6; i++) {
      for (let k = 1; k <= 4; k++) await page.mouse.move(x + (i % 2 ? -1 : 1) * 10 * k, y);
    }
    await page.mouse.up();
    await expect.poll(async () => Number(await page.locator('.ps-panel-sahne').getAttribute('data-tane'))).toBeGreaterThanOrEqual(12);
  }
  await page.locator('.ps-panel-tamam').click();
}

/** Süsleme masası açıksa adım adım bitirir (desen / yüz çizimi, serpinti, mum) */
export async function susle(page: Page, k: Kalem, kare?: string) {
  const panel = page.locator('.ps-panel:not(.ps-icecek-panel)');
  for (let n = 0; n < 6; n++) {
    if (!(await panel.isVisible().catch(() => false))) {
      await page.waitForTimeout(150);
      if (!(await panel.isVisible().catch(() => false))) return;
    }
    const adim = await panel.getAttribute('data-adim');
    if (adim === 'desen' || adim === 'yuz') {
      if (kare && n === 0) await page.screenshot({ path: kare });
      await sablonuIzle(page);
      await expect(panel).toHaveAttribute('data-bitti', '1');
      await expect(panel).not.toHaveAttribute('data-adim', adim, { timeout: 5000 }).catch(() => undefined);
    } else if (adim === 'serpinti') {
      await serpintiSalla(page, k.serpinti ?? 0);
    } else if (adim === 'mum') {
      for (let i = 0; i < (k.mum ?? 0); i++) await page.locator('.ps-mum-kutusu').click();
      await expect(page.locator('.ps-panel-sahne')).toHaveAttribute('data-mum', String(k.mum ?? 0));
      await page.locator('.ps-panel-tamam').click();
    }
    await page.waitForTimeout(120);
  }
  await expect(panel).toHaveCount(0);
}

/** Bardak: makineye dokun, boy seç, musluğa basılı tut, çizgide bırak */
export async function icecekYap(page: Page, k: Kalem) {
  await page.locator('.ps-icecek-makinesi').click();
  await expect(page.locator('.ps-icecek-panel')).toBeVisible();
  await animBitsin(page);
  await page.locator(`.ps-boy[data-boy="${k.boy}"]`).click();
  const m = (await page.locator(`.ps-musluk[data-icecek="${k.icecek}"]`).boundingBox())!;
  await page.mouse.move(m.x + m.width / 2, m.y + m.height / 2);
  await page.mouse.down();
  await page.waitForFunction(() => Number(document.querySelector('.ps-bardak')?.getAttribute('data-dolum')) >= 0.96, null, { polling: 'raf', timeout: 8000 });
  await page.mouse.up();
  await expect(page.locator('.ps-icecek-panel')).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('.ps-icecek-makinesi')).toHaveAttribute('data-bardak', '1');
}

