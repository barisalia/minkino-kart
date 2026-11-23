import { test, expect, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

// Ceren Öğretmen ile Sayılar 1–10 (Matematik Aşama 1). Çizimler tamam değilken ders yalnız ?test=1&ceren=1 ile açılır.
// Ekran görüntüleri: E2E_EKRAN=<klasör> verilirse her adımda kaydedilir.
const EKRANLAR = [
  { ad: 'ipad', width: 1366, height: 1024 },
  { ad: 'telefon', width: 874, height: 402 },
] as const;
const KAYIT = 'minkino-matematik-ceren-sayilar-v1';
/** Her sayının tek etkinliği, sırayla (ceren-ders-mantik.ts → etkinlik). */
const TURLER = ['yaz', 'birlikte', 'koy'] as const;
const klasor = process.env.E2E_EKRAN;

async function ac(page: Page, ek = '') {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('cd-hazir')) {
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
      localStorage.removeItem('minkino-matematik-ceren-sayilar-v1');
      sessionStorage.setItem('cd-hazir', '1');
    }
  });
  await page.goto('matematik/?test=1&ceren=1' + ek);
  await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'ceren');
}
const dunya = (page: Page) => page.locator('.cd-dunya');
async function adim(page: Page, ad: string, sayi?: number) {
  if (sayi !== undefined) await expect(dunya(page)).toHaveAttribute('data-sayi', String(sayi), { timeout: 30_000 });
  await expect(dunya(page)).toHaveAttribute('data-adim', ad, { timeout: 30_000 });
}
async function ekran(page: Page, ad: string) {
  if (klasor) await page.screenshot({ path: klasor + '/' + ad + '.png' });
}
/** Blok tahtadan masaya uçarken değil, yerine oturunca ölç. */
async function durunca(page: Page, secici: string) {
  let once = '';
  for (let i = 0; i < 40; i++) {
    const k = (await page.locator(secici).boundingBox())!;
    const simdi = JSON.stringify(k);
    if (simdi === once) return k;
    once = simdi;
    await page.waitForTimeout(120);
  }
  return (await page.locator(secici).boundingBox())!;
}
/** Rakamın yolunu parmakla izler (her çizgi ayrı dokunuş). */
async function yaz(page: Page) {
  const svg = page.locator('.cd-yazi-svg');
  await expect(svg).toBeVisible();
  const yol = JSON.parse((await svg.getAttribute('data-yol'))!) as number[][][];
  const k = await durunca(page, '.cd-yazi-svg');
  const nokta = (p: number[]) => [k.x + (p[0] / 1000) * k.width, k.y + (p[1] / 1000) * k.height] as const;
  for (const cizgi of yol) {
    const [x0, y0] = nokta(cizgi[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (let i = 1; i < cizgi.length; i++) {
      const [x, y] = nokta(cizgi[i]);
      await page.mouse.move(x, y, { steps: 2 });
    }
    await page.mouse.up();
  }
}
/** Ceren bu kayıtları okudu mu (test modunda ders, okunan her kaydı window.__cerenSesleri'ne yazar)? */
const okunan = (page: Page) => page.evaluate(() => (window as unknown as { __cerenSesleri?: string[] }).__cerenSesleri ?? []);
async function soyledi(page: Page, ...idler: string[]) {
  await expect.poll(() => okunan(page), { timeout: 25_000 }).toEqual(expect.arrayContaining(idler));
}
const tanitim = (n: number) => (n === 10 ? 'tanit_10b' : 'tanit_' + n);
/** Bütün etkileşimli öğeler ekranın içinde mi (kesik yok)? */
async function ekranda(page: Page, secici: string) {
  const { width, height } = page.viewportSize()!;
  for (const el of await page.locator(secici).all()) {
    if (!(await el.isVisible())) continue;
    // Masadan toplanmakta olan eski nesne ölçülürken kalkabilir: onu atla.
    const k = await el.boundingBox({ timeout: 1000 }).catch(() => null);
    if (!k) continue;
    expect(k.x, secici + ' solda kesik').toBeGreaterThanOrEqual(-1);
    expect(k.y, secici + ' üstte kesik').toBeGreaterThanOrEqual(-1);
    expect(k.x + k.width, secici + ' sağda kesik').toBeLessThanOrEqual(width + 1);
    expect(k.y + k.height, secici + ' altta kesik').toBeLessThanOrEqual(height + 1);
  }
}

for (const e of EKRANLAR) {
  test.describe(e.ad + ' ' + e.width + '×' + e.height, () => {
    test.use({ viewport: { width: e.width, height: e.height } });

    test('Ceren ile Sayılar 1–10: her sayıda tek etkinlik, sırayla; sonda hatıra', async ({ page }) => {
      test.setTimeout(240_000);
      const hatalar = hataTopla(page);
      await ac(page, '&hizli=1');
      await expect(page.locator('.cd-sira-rakam')).toHaveCount(10);
      for (let n = 1; n <= 10; n++) {
        const tur = TURLER[(n - 1) % 3];
        const ses = [tanitim(n), 'say_' + n, 'hepsi_' + n, 'aferin_' + (((n - 1) % 3) + 1)];
        if (tur === 'yaz') {
          await adim(page, 'yaz', n);
          await ekranda(page, '.cd-yazi, .cd-sira-rakam, .cd-ceren, .nav');
          await yaz(page);
          ses.push('yazdin_' + n);
        } else if (tur === 'birlikte') {
          await adim(page, 'birlikte', n);
          const nesneler = page.locator('.cd-nesne');
          await expect(nesneler).toHaveCount(n);
          await ekranda(page, '.cd-nesne');
          if (n === 5) {
            // Aynı nesneyi bilerek ikinci kez saymak: Ceren yumuşakça baştan saydırır (yanlış sesi yok).
            await nesneler.nth(0).click();
            await expect(page.locator('.cd-nesne.sayildi')).toHaveCount(1);
            await page.waitForTimeout(800);
            await nesneler.nth(0).click();
            await expect(page.locator('.cd-nesne.sayildi')).toHaveCount(0);
            ses.push('tekrar');
          }
          for (let i = 0; i < n; i++) await nesneler.nth(i).click();
        } else {
          await adim(page, 'sen', n);
          await expect(page.locator('.cd-kaynak')).toBeVisible();
          await ekranda(page, '.cd-kaynak');
          for (let i = 0; i < n; i++) await page.locator('.cd-kaynak').click();
          await expect(page.locator('.cd-nesne.sayildi')).toHaveCount(n);
          await ekranda(page, '.cd-nesne');
        }
        // Bu sayıda Ceren: tanıttı, saydı, "hepsi … tane" dedi, aferin dedi (yazılan sayıda övgüyle).
        await soyledi(page, ...ses);
        if (n < 10) await expect(page.locator('.cd-sira-rakam').nth(n - 1)).toHaveClass(/bitti/, { timeout: 15_000 });
      }
      // Her sayıda yalnız kendi etkinliği oynandı: başka etkinliğin kaydı çalmadı.
      const hepsi = await okunan(page);
      for (let n = 1; n <= 10; n++) {
        if (TURLER[(n - 1) % 3] !== 'yaz') expect(hepsi, 'yazdin_' + n).not.toContain('yazdin_' + n);
        if (TURLER[(n - 1) % 3] !== 'koy') expect(hepsi, 'koy_' + n).not.toContain('koy_' + n);
      }
      expect(hepsi).not.toContain('tanit_10');
      // Aynı sayma iki kez olmaz: Ceren yalnız ilk "birlikte"de (2) önce kendisi sayar; 5 ve 8'de sayma bir kez, birlikte.
      for (const [n, kez] of [[2, 2], [5, 1], [8, 1]] as const) {
        const bolum = hepsi.slice(hepsi.indexOf('tanit_' + n), hepsi.indexOf('hepsi_' + n));
        expect(bolum.filter((id) => id === 'say_' + n), n + ' kaç kez sayıldı').toHaveLength(kez);
        expect(bolum.includes('ben_sayayim'), n + ' "önce ben sayayım"').toBe(n === 2);
      }
      // Hatıra (hızlı modda an kısa sürer) tezgâha gider: Sayı masası yıldızını alır.
      await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'menu', { timeout: 15_000 });
      await expect(page.locator('.tezgah-oyuncak.k0 .kart-yildiz')).toBeVisible();
      const kayit = await page.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
      expect(kayit.bitti).toBe(true);
      expect(kayit.biten).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      // Ders bitince Sayı masası eski sayı oyunlarıyla sürer.
      await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
      await expect(page.locator('#sahne')).not.toHaveAttribute('data-ekran', 'ceren');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(hatalar).toEqual([]);
    });

    test('Ceren ile Sayılar: gerçek hızda 1 yaz, 2 birlikte, 3 koy, 8 iki sıra, 10 ve hatıra (sesli akış, ekran görüntüleri)', async ({ page }) => {
      test.setTimeout(420_000);
      const hatalar = hataTopla(page);
      await ac(page);
      await adim(page, 'giris');
      await page.waitForTimeout(1500);
      await ekran(page, e.ad + '-01-giris');
      await adim(page, 'tanit', 1);
      await expect(page.locator('.cd-ceren')).toHaveAttribute('data-istenen', 'goster', { timeout: 15_000 });
      await page.waitForTimeout(900);
      await ekran(page, e.ad + '-02-tanit');
      // 1: yaz
      await adim(page, 'yaz', 1);
      await page.waitForTimeout(1200);
      await ekran(page, e.ad + '-03-yaz');
      await yaz(page);
      await soyledi(page, 'giris', 'tanit_1', 'yaz', 'yazdin_1', 'ben_sayayim', 'say_1', 'hepsi_1');
      await adim(page, 'aferin', 1);
      await soyledi(page, 'aferin_1');
      await page.waitForTimeout(500);
      await ekran(page, e.ad + '-04-aferin');
      // 2: birlikte say (çocuk Ceren'i dinler, sonra sayar)
      await adim(page, 'birlikte', 2);
      await soyledi(page, 'tanit_2', 'birlikte');
      await page.locator('.cd-nesne').first().click();
      await page.waitForTimeout(500);
      await ekran(page, e.ad + '-05-birlikte');
      await page.locator('.cd-nesne').nth(1).click();
      await soyledi(page, 'hepsi_2', 'aferin_2');
      // 3: kendin koy
      await adim(page, 'sen', 3);
      await soyledi(page, 'tanit_3', 'sen_dene', 'koy_3');
      await page.waitForTimeout(300);
      await ekran(page, e.ad + '-06-sen-koy');
      for (let i = 0; i < 3; i++) await page.locator('.cd-kaynak').click();
      await soyledi(page, 'hepsi_3', 'aferin_3');
      // 8'e atla (önceki sayılar bitmiş say): onluk çerçevede iki sıra; dönen çocuğu Ceren karşılar.
      await page.evaluate((a) => localStorage.setItem(a, JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7], simdi: 8, tanitildi: true, bitti: false })), KAYIT);
      await page.reload();
      await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
      await adim(page, 'birlikte', 8);
      await soyledi(page, 'devam', 'tanit_8', 'birlikte');
      for (let i = 0; i < 5; i++) await page.locator('.cd-nesne').nth(i).click();
      await page.waitForTimeout(500);
      await ekran(page, e.ad + '-07-birlikte-8');
      for (let i = 5; i < 8; i++) await page.locator('.cd-nesne').nth(i).click();
      await soyledi(page, 'hepsi_8');
      // Son sayı 10 ve hatıra (gerçek hızda).
      await page.evaluate((a) => localStorage.setItem(a, JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9], simdi: 10, tanitildi: true, bitti: false })), KAYIT);
      await page.reload();
      await page.locator('.tezgah-oyuncak.k0').click({ force: true });
      await adim(page, 'yaz', 10);
      await yaz(page);
      // 10 rakam değil sayıdır: düzeltilmiş tanıtım kaydı çalar, eskisi hiç çalmaz.
      await soyledi(page, 'devam', 'tanit_10b', 'yazdin_10', 'hepsi_10');
      expect(await okunan(page)).not.toContain('tanit_10');
      await adim(page, 'hatira');
      await soyledi(page, 'bitis');
      await page.waitForTimeout(1200);
      await ekran(page, e.ad + '-09-hatira');
      await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'menu', { timeout: 20_000 });
      await page.waitForTimeout(1300);
      await ekran(page, e.ad + '-10-tezgah-yildiz');
      expect(hatalar).toEqual([]);
    });
  });
}

test('Uygulamada (test modu yok) çizimler tamam: Sayı masası önce Ceren’in dersini açar, ders bitince eski oyunlara geçer', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 874, height: 402 });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('cd-uygulama')) {
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
      localStorage.removeItem('minkino-matematik-ceren-sayilar-v1');
      sessionStorage.setItem('cd-uygulama', '1');
    }
  });
  await page.goto('matematik/');
  await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'ceren');
  await expect(page.locator('.cd-ceren')).toBeVisible();
  // Eve dön, dersi bitmiş say: Sayı masası eski oyunlarıyla açılır.
  await page.evaluate(() => localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true })));
  await page.reload();
  await page.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(page.locator('#sahne')).not.toHaveAttribute('data-ekran', 'ceren');
  await expect(page.locator('.cd-dunya')).toHaveCount(0);
});

for (const [w, h] of [[834, 1194], [1024, 1366]] as const) {
  test('Dikey iPad ' + w + '×' + h + ': sahne büyük, Ceren, tahta, rakam sırası ve nesneler kesiksiz', async ({ page }) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width: w, height: h });
    await page.addInitScript(() => {
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
      localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6], simdi: 7, tanitildi: true, bitti: false }));
    });
    await page.goto('matematik/?test=1&ceren=1&hizli=1');
    await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
    await adim(page, 'yaz', 7);
    await ekranda(page, '.cd-yazi, .cd-ceren, .cd-sira-rakam, .nav, .cd-tahta-rakam');
    await yaz(page);
    // 8: birlikte say (iki sıra)
    await adim(page, 'birlikte', 8);
    await ekranda(page, '.cd-nesne');
    // Dikeyde sahne büyür: sayma nesneleri parmakla rahat dokunulacak boyda.
    expect((await page.locator('.cd-nesne').first().boundingBox())!.height).toBeGreaterThanOrEqual(60);
    for (let i = 0; i < 8; i++) await page.locator('.cd-nesne').nth(i).click();
    // 9: kendin koy
    await adim(page, 'sen', 9);
    await ekranda(page, '.cd-kaynak');
  });
}

// ---------- 2–3 yaş: ders 1–5'te biter, hatıra orada (Barış, 19 Kasım 2026); 4 ve 5+ yaşta 1–10 ----------
async function yasla(page: Page, yas: number, kayit?: object, ek = '&hizli=1') {
  await page.addInitScript(([y, k]) => {
    if (!sessionStorage.getItem('cd-yas')) {
      // 2 yaş kartlarda "3 yaş + ikiYas" olarak saklanır (src/engine/menu-yas.ts).
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y === 2 ? 3 : y, ...(y === 2 ? { ikiYas: true } : {}), ayarlar: { muzik: false } }));
      if (k) localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify(k));
      else localStorage.removeItem('minkino-matematik-ceren-sayilar-v1');
      sessionStorage.setItem('cd-yas', '1');
    }
  }, [yas, kayit ?? null] as const);
  await page.goto('matematik/?test=1&ceren=1' + ek);
  await page.locator('.tezgah-oyuncak.k0').click({ force: true }); // oyuncak sürekli "nefes alır"
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'ceren');
}

test('2–3 yaşta Ceren dersi 1–5: beş rakam, "beşe kadar" kapanışı ve hatıra; sonra Sayı masası kendi oyunlarına geçer', async ({ page }) => {
  test.setTimeout(180_000);
  const hatalar = hataTopla(page);
  await yasla(page, 3);
  await expect(page.locator('.cd-sira-rakam')).toHaveCount(5);
  await ekranda(page, '.cd-sira-rakam, .cd-ceren, .nav');
  for (let n = 1; n <= 5; n++) {
    const tur = TURLER[(n - 1) % 3];
    if (tur === 'yaz') {
      await adim(page, 'yaz', n);
      await yaz(page);
    } else if (tur === 'birlikte') {
      await adim(page, 'birlikte', n);
      for (let i = 0; i < n; i++) await page.locator('.cd-nesne').nth(i).click();
    } else {
      await adim(page, 'sen', n);
      for (let i = 0; i < n; i++) await page.locator('.cd-kaynak').click();
    }
    await soyledi(page, tanitim(n), 'hepsi_' + n);
  }
  await adim(page, 'hatira');
  await soyledi(page, 'bitis_5');
  const hepsi = await okunan(page);
  expect(hepsi).not.toContain('bitis');
  expect(hepsi.filter((id) => /^tanit_([6-9]|10)/.test(id))).toEqual([]);
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'menu', { timeout: 15_000 });
  await expect(page.locator('.tezgah-oyuncak.k0 .kart-yildiz')).toBeVisible();
  const kayit = await page.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), KAYIT);
  expect(kayit).toMatchObject({ biten: [1, 2, 3, 4, 5], bitti: true });
  // Ders bitti: Sayı masası 2–3 yaşın kendi oyunlarıyla (önce kule) açılır.
  await page.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'kule');
  expect(hatalar).toEqual([]);
});

test('2–3 yaşta 8’de kalmış eski ders kaydı: Ceren karşılar, hatırayı verir, çocuk takılmaz', async ({ page }) => {
  test.setTimeout(90_000);
  await yasla(page, 2, { biten: [1, 2, 3, 4, 5, 6, 7], simdi: 8, tanitildi: true, bitti: false });
  await expect(page.locator('.cd-sira-rakam')).toHaveCount(5);
  await adim(page, 'hatira');
  await soyledi(page, 'devam', 'bitis_5');
  expect((await okunan(page)).filter((id) => id.startsWith('tanit_'))).toEqual([]);
  await expect(page.locator('#sahne')).toHaveAttribute('data-ekran', 'menu', { timeout: 15_000 });
  expect(await page.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null').bitti, KAYIT)).toBe(true);
});

test('1–5’i bitirip 4 yaşa geçen çocuk dersi 6’dan sürdürür; 4 yaşta sıra on rakam', async ({ page }) => {
  test.setTimeout(90_000);
  await yasla(page, 4, { biten: [1, 2, 3, 4, 5], simdi: 5, tanitildi: true, bitti: true });
  await expect(page.locator('.cd-sira-rakam')).toHaveCount(10);
  await adim(page, 'tanit', 6);
  await soyledi(page, 'devam', 'tanit_6');
});
