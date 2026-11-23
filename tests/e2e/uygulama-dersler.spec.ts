// Ana menüde beşinci bölüm "Dersler" (Sürüm 6, uygulama/src/menu-bolumleri.ts). Bayrak (DERSLER_MENUDE) bugün kapalı;
// test kipinde ?dersler=1 açar. İki durum da: kapalıyken bugünkü dört bölüm, açıkken Dersler ilk sırada.
import { expect, test, type Page } from '@playwright/test';
import { menuOyunlari, yasaGore } from '../../uygulama/src/oyunlar';
import { bolumKartlari } from '../../uygulama/src/menu-bolumleri';
import { hataTopla } from './yardimci';

const DORT = ['Etkinlikler', 'Kitaplar', 'Oyunlar', 'Çizgi Filmler'];
const BES = ['Dersler', ...DORT];
const kartlar = (yas: number) => yasaGore(menuOyunlari(false), yas);
// yaş: menünün eski etiketleri hâlâ okunur (src/engine/menu-yas.ts): '2–3 yaş' → 3, '4–5 yaş' → 4, '6–7 yaş' → 6
const YAS: Record<number, string> = { 3: '2–3 yaş', 4: '4–5 yaş', 6: '6–7 yaş' };
const ac = async (page: Page, sorgu: string, yas = 4, bolum?: string) => {
  await page.addInitScript(([yas, bolum]) => {
    localStorage.setItem('minkino-menu-yas', yas);
    if (bolum && !sessionStorage.getItem('dersler-test-acildi')) {
      sessionStorage.setItem('minkino-menu-bolum', bolum);
      sessionStorage.setItem('dersler-test-acildi', '1');
    }
  }, [YAS[yas], bolum] as const);
  await page.goto('./?test=1' + sorgu);
};
const anaBolumler = (page: Page) => page.locator('.ym-ana .ym-kategori').evaluateAll((l) => l.map((b) => b.getAttribute('aria-label')));
const yanBolumler = (page: Page) => page.locator('.ym-yan .ym-kategori').evaluateAll((l) => l.map((b) => b.getAttribute('aria-label')));
const paneldekiler = (page: Page) => page.locator('.ym-panel .ym-icerik').evaluateAll((l) => l.map((k) => k.getAttribute('data-oyun')));
const geriTusu = (page: Page) => page.evaluate(() => !window.dispatchEvent(new CustomEvent('minkino:geri', { cancelable: true })));

test.describe('bayrak kapalı', () => {
  test('ana ekran bugünkü dört bölüm, Türkçe ve Matematik Etkinlikler’de', async ({ page }) => {
    const hatalar = hataTopla(page);
    await ac(page, '');
    await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(4);
    expect(await anaBolumler(page)).toEqual(DORT);
    await expect(page.locator('.ym-ana')).not.toHaveClass(/ym-bes/);
    await page.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
    expect(await yanBolumler(page)).toEqual(DORT);
    await expect(page.locator('.ym-yan')).not.toHaveClass(/ym-bes/);
    expect(await paneldekiler(page)).toEqual(bolumKartlari('etkinlik', kartlar(4), false).map((k) => k.id));
    expect(await paneldekiler(page)).toEqual(expect.arrayContaining(['alfabe', 'matematik']));
    expect(hatalar).toEqual([]);
  });

  test('saklı son bölüm "ders" ise ana ekran açılır (bölüm yok)', async ({ page }) => {
    await ac(page, '', 4, 'ders');
    await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(4);
    await expect(page.locator('.ym-panel')).toHaveCount(0);
  });

  test('?dersler=0 bayrağı test kipinde kapalı tutar', async ({ page }) => {
    await ac(page, '&dersler=0');
    expect(await anaBolumler(page)).toEqual(DORT);
  });
});

test.describe('bayrak açık (?dersler=1)', () => {
  test('ana ekran: beş bölüm, Dersler ilk sırada, hepsi ekranda ve ses düğmeli', async ({ page }) => {
    const hatalar = hataTopla(page);
    await ac(page, '&dersler=1');
    await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(5);
    expect(await anaBolumler(page)).toEqual(BES);
    await expect(page.locator('.ym-ana')).toHaveClass(/ym-bes/);
    await expect(page.getByRole('button', { name: 'Dersler adını dinle' })).toBeVisible();
    // beşi de ekranın içinde, üst üste binmeden
    const kutular = await page.locator('.ym-ana .ym-kategori').evaluateAll((l) => l.map((b) => { const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
    const { width, height } = page.viewportSize()!;
    for (const k of kutular) {
      expect(k.x).toBeGreaterThanOrEqual(0);
      expect(k.y + k.h).toBeLessThanOrEqual(height);
      expect(k.x + k.w).toBeLessThanOrEqual(width);
      expect(Math.min(k.w, k.h)).toBeGreaterThan(100);
    }
    for (let i = 0; i < kutular.length; i++)
      for (let j = i + 1; j < kutular.length; j++) {
        const a = kutular[i], b = kutular[j];
        expect(a.x + a.w <= b.x + 1 || b.x + b.w <= a.x + 1 || a.y + a.h <= b.y + 1 || b.y + b.h <= a.y + 1, `${BES[i]} / ${BES[j]}`).toBe(true);
      }
    expect(hatalar).toEqual([]);
  });

  test('Dersler paneli: Türkçe, Matematik; kilit rozetleri Etkinlikler’dekiyle aynı; yan şeritte beş simge', async ({ page }) => {
    const hatalar = hataTopla(page);
    // bayrak kapalıyken Etkinlikler'deki rozetler (karşılaştırma için)
    await ac(page, '');
    await page.getByRole('button', { name: 'Etkinlikler', exact: true }).click();
    const rozet = (id: string) => page.locator(`.ym-icerik-kap:has(.ym-icerik[data-oyun="${id}"]) .ym-kilit`).innerHTML();
    const eskiRozet = { alfabe: await rozet('alfabe'), matematik: await rozet('matematik') };

    await page.goto('./?test=1&dersler=1');
    await page.getByRole('button', { name: 'Dersler', exact: true }).click();
    await expect(page.locator('.ym-ust h1')).toHaveText('Dersler');
    await expect(page.locator('.ym-panel')).toHaveAttribute('aria-label', 'Dersler');
    expect(await paneldekiler(page)).toEqual(bolumKartlari('ders', kartlar(4), true).map((k) => k.id));
    expect((await paneldekiler(page)).slice(0, 2)).toEqual(['alfabe', 'matematik']);
    expect(await rozet('alfabe')).toBe(eskiRozet.alfabe);
    expect(await rozet('matematik')).toBe(eskiRozet.matematik);
    await expect.poll(() => page.locator('.ym-ekran img').evaluateAll((l) => l.filter((i) => !(i as HTMLImageElement).complete || !(i as HTMLImageElement).naturalWidth).length)).toBe(0);

    // yan şerit: beş simge, Dersler seçili, dokunma hedefi en az 72 px (dört bölümde telefondaki satır yüksekliği)
    expect(await yanBolumler(page)).toEqual(BES);
    await expect(page.locator('.ym-yan .ym-kategori[aria-label="Dersler"]')).toHaveAttribute('aria-pressed', 'true');
    const yan = await page.locator('.ym-yan .ym-kategori').evaluateAll((l) => l.map((b) => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, alt: r.bottom }; }));
    for (const k of yan) {
      expect(Math.min(k.w, k.h)).toBeGreaterThanOrEqual(72);
      expect(k.alt).toBeLessThanOrEqual(page.viewportSize()!.height);
    }

    // Etkinlikler ve Oyunlar'da derslerin hiçbiri yok
    await page.locator('.ym-yan .ym-kategori[aria-label="Etkinlikler"]').click();
    expect(await paneldekiler(page)).toEqual(bolumKartlari('etkinlik', kartlar(4), true).map((k) => k.id));
    for (const id of ['alfabe', 'matematik']) expect(await paneldekiler(page)).not.toContain(id);
    await page.locator('.ym-yan .ym-kategori[aria-label="Oyunlar"]').click();
    expect(await paneldekiler(page)).toEqual(bolumKartlari('oyun', kartlar(4), true).map((k) => k.id));
    for (const id of ['alfabe', 'matematik', 'hazirlik', 'canlan', 'kartlar', 'macera']) expect(await paneldekiler(page)).not.toContain(id);
    expect(hatalar).toEqual([]);
  });

  test('geri düğmesi, Android geri tuşu ve saklı son bölüm', async ({ page }) => {
    await ac(page, '&dersler=1', 4, 'ders');
    // saklı son bölüm: Dersler doğrudan açılır
    await expect(page.locator('.ym-panel')).toHaveAttribute('aria-label', 'Dersler');
    // Android geri tuşu: ana ekrana
    expect(await geriTusu(page)).toBe(true);
    await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(5);
    expect(await page.evaluate(() => sessionStorage.getItem('minkino-menu-bolum'))).toBeNull();
    // ana ekranda geri tuşu menüde işlenmez (kabuk uygulamadan çıkar)
    expect(await geriTusu(page)).toBe(false);
    // yeniden Dersler, sonra üstteki geri düğmesi
    await page.getByRole('button', { name: 'Dersler', exact: true }).click();
    expect(await page.evaluate(() => sessionStorage.getItem('minkino-menu-bolum'))).toBe('ders');
    await page.reload();
    await expect(page.locator('.ym-panel')).toHaveAttribute('aria-label', 'Dersler');
    await page.getByRole('button', { name: 'Ana menü' }).click();
    await expect(page.locator('.ym-ana .ym-kategori')).toHaveCount(5);
  });

  test('yaş süzgeci Dersler’de de geçerli', async ({ page }) => {
    for (const yas of [3, 6]) {
      await page.addInitScript((y) => localStorage.setItem('minkino-menu-yas', y), YAS[yas]);
      await page.goto('./?test=1&dersler=1');
      await page.getByRole('button', { name: 'Dersler', exact: true }).click();
      expect(await paneldekiler(page)).toEqual(bolumKartlari('ders', kartlar(yas), true).map((k) => k.id));
    }
  });
});
