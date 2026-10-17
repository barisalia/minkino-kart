import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/**
 * Kitaplar (/kitap/): ilk kitap "Kino Okula Başlıyor", ikinci kitap "Kuzu'nun Kulağı" (metin hazır, çizimler gelene kadar
 * yer tutucu). Menüde değil (KITAP_MENUDE = false).
 * Telefon önce: 844×390 ve 667×375 (yatay, açık iki sayfa), 390×844 (dikey, tek sayfa), DPR 3.
 *  (1) raf → kapağa dokun → kitap öne gelir (3D) → "Kendim bakayım" → kapak açılır → sürükleyerek ve köşeden çevirme
 *  (2) canlanan an (dokununca poz değişir), uğur böceği bulunur, kayıt cihazda; yeniden açınca kaldığı yerden
 *  (3) "Bana oku": kapak ve sayfa satır satır, kelime vurgusu; sayfa bitince otomatik çevrilmez; ebeveyn sayfası okunmaz
 *  (4) yazı her sayfada sığar ve büyük; 20 sn boşta kalınca bulunmamış bir şey kıpırdar (ipucu)
 *  hepsinde: konsol hatası yok; hiçbir raster görsel kaynak pikselinin üstüne büyümüyor (DPR 3)
 */
test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'yalnız telefon projesinde (boyutları test kendisi verir)'));

type K = { durum: () => string; sayfa: () => number; okunan: () => string[]; okuyor: () => boolean; cevir: (y: 1 | -1) => Promise<void> };
const durum = (page: Page) => page.evaluate(() => (window as unknown as { __kitap: K }).__kitap.durum());
const sayfa = (page: Page) => page.evaluate(() => (window as unknown as { __kitap: K }).__kitap.sayfa());
const okunan = (page: Page) => page.evaluate(() => (window as unknown as { __kitap: K }).__kitap.okunan());
const okuyor = (page: Page) => page.evaluate(() => (window as unknown as { __kitap: K }).__kitap.okuyor());
const ileri = (page: Page) => page.evaluate(() => (window as unknown as { __kitap: K }).__kitap.cevir(1));

async function boyut(page: Page, w: number, h: number) {
  await page.setViewportSize({ width: w, height: h });
}

/** Ekrandaki her raster görselin etkin ölçeği (görünen px × 3 / doğal px); 1'in üstü = büyütülmüş */
const enBuyukOlcek = (page: Page) =>
  page.evaluate(() => {
    let en = 0;
    for (const i of document.querySelectorAll<HTMLImageElement>('.kt-kok img')) {
      const r = i.getBoundingClientRect();
      if (!i.naturalWidth || r.width < 2 || i.hidden) continue;
      en = Math.max(en, (r.width * 3) / i.naturalWidth, (r.height * 3) / i.naturalHeight);
    }
    return en;
  });

async function kitabiAc(page: Page, mod: 'oku' | 'bak', kitap = 'okul') {
  await page.locator(`.kt-raf-kapak[data-kitap="${kitap}"]`).click();
  await expect(page.locator('.kt-tutulan')).toBeVisible();
  await expect(page.locator('.kt-mod-sec[data-mod="oku"]')).toBeVisible();
  await expect(page.locator('.kt-tutulan .kt-t-sirt')).toHaveCount(1);
  await page.locator(`.kt-mod-sec[data-mod="${mod}"]`).click();
  await expect.poll(() => durum(page)).toBe('acik');
}

async function surukle(page: Page, yon: 1 | -1) {
  const b = (await page.locator('.kt-kitap').boundingBox())!;
  const x0 = yon === 1 ? b.x + b.width * 0.88 : b.x + b.width * 0.12;
  const y0 = b.y + b.height * 0.55;
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (let i = 1; i <= 14; i++) {
    await page.mouse.move(x0 - yon * i * b.width * 0.045, y0 - i);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
}

test('yatay 844×390: raf, 3D kitap, kapak açılır, sürükleyerek ve köşeden çevirme, canlanan an, uğur böceği, kayıt', async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 844, 390);
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await page.reload();
  // raf: iki kitap + 8 "yakında" sırtı
  await expect(page.locator('.kt-raf-kapak')).toHaveCount(2);
  await expect(page.locator('.kt-sirt-kitap')).toHaveCount(8);
  await kitabiAc(page, 'bak');
  await expect.poll(() => sayfa(page)).toBe(1);
  // açık iki sayfa: solda resim, sağda yazı
  await expect(page.locator('.kt-kitap.kt-yatay .kt-sayfa-sol .kt-resim')).toBeVisible();
  await expect(page.locator('.kt-kitap.kt-yatay .kt-sayfa-sag .kt-metin')).toContainText('Pazartesi sabahıydı.');
  // ses etiketi basılmaz
  await expect(page.locator('.kt-sayfa-sag')).not.toContainText('[excited]');
  // Antigravity'nin tam sayfa çizimi bağlı (yer tutucu yok); zemin/poz katmanları gelene kadar karakter kesilmez
  await expect(page.locator('.kt-sayfa-sol img.kt-zemin')).toHaveAttribute('src', /s01-tam/);
  await expect(page.locator('.kt-sayfa-sol .kt-yertutucu')).toHaveCount(0);
  await expect(page.locator('.kt-sayfa-sol .kt-katman')).toHaveCount(0);
  // canlanan an (tam sayfa): Lokum'a dokununca hafif efekt (parıltı, ses, resmin sekmesi) ve an bulunur
  await page.locator('.kt-sayfa-sol .kt-tam-bolge[data-hedef="lokum"]').click();
  await expect(page.locator('.kt-sayfa-sol .kt-resim')).toHaveAttribute('data-oynayan', 'esne');
  // uğur böceği çizimin içinde: ayrı katman yok, dokunma alanı çizimdeki yerinde
  await expect(page.locator('.kt-sayfa-sol .kt-ugur.kt-ugur-cizili')).toHaveCount(1);
  await expect(page.locator('.kt-sayfa-sol .kt-ugur img, .kt-sayfa-sol .kt-ugur-yt')).toHaveCount(0);
  await page.locator('.kt-sayfa-sol .kt-ugur').click();
  // sürükleyerek ileri
  await surukle(page, 1);
  await expect.poll(() => sayfa(page)).toBe(2);
  await expect(page.locator('.kt-sayfa-sag .kt-metin')).toContainText('Mutfakta Baba yine uyuyakalmıştı.');
  // konuşma satırı karakter renginde
  const babaRenk = await page.locator('.kt-sayfa-sag .kt-satir.kt-baba').first().evaluate((e) => getComputedStyle(e).color);
  expect(babaRenk).toBe('rgb(156, 31, 54)');
  // az ve yavaş sürükleyip bırakınca yaprak geri döner (hızlı fiske ise çevirir)
  const b = (await page.locator('.kt-kitap').boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.85, b.y + 200);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) {
    await page.mouse.move(b.x + b.width * (0.85 - i * 0.006), b.y + 200);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(400);
  expect(await sayfa(page)).toBe(2);
  // köşeye dokununca geri
  await page.locator('.kt-kose-geri').click();
  await expect.poll(() => sayfa(page)).toBe(1);
  await page.locator('.kt-kose-ileri').click();
  await expect.poll(() => sayfa(page)).toBe(2);
  await page.locator('.kt-kose-ileri').click();
  await expect.poll(() => sayfa(page)).toBe(3);
  expect(await enBuyukOlcek(page)).toBeLessThanOrEqual(1.02);
  // kayıt: kaldığı yer + bulunanlar
  const kayit = await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kitap-v1')!));
  expect(kayit.mod).toBe('bak');
  expect(kayit.kitaplar.okul.sayfa).toBe(3);
  expect(kayit.kitaplar.okul.bulunan.s01).toEqual(expect.arrayContaining(['esne', 'ugur']));
  // yeniden açınca kaldığı yerden
  await page.reload();
  await kitabiAc(page, 'bak');
  await expect.poll(() => sayfa(page)).toBe(3);
  // geri: rafa
  await page.locator('.kt-geri').click();
  await expect.poll(() => durum(page)).toBe('raf');
  expect(hatalar).toEqual([]);
});

test('dikey 390×844: tek sayfa (üstte resim, altta yazı), sürükleyerek çevirme, büyük yazı', async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 390, 844);
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await page.reload();
  await kitabiAc(page, 'bak');
  await expect.poll(() => sayfa(page)).toBe(1);
  await expect(page.locator('.kt-kitap.kt-dikey .kt-sayfa-tek .kt-resim')).toBeVisible();
  await expect(page.locator('.kt-sayfa-tek .kt-metin')).toContainText('Ben büyüdüm artık! Okula gidiyorum!');
  const r = (await page.locator('.kt-sayfa-tek .kt-resim').boundingBox())!;
  const m = (await page.locator('.kt-sayfa-tek .kt-metin').boundingBox())!;
  expect(m.y).toBeGreaterThanOrEqual(r.y + r.height - 1);
  const px = await page.locator('.kt-sayfa-tek .kt-metin').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
  expect(px).toBeGreaterThanOrEqual(18);
  await surukle(page, 1);
  await expect.poll(() => sayfa(page)).toBe(2);
  await surukle(page, -1);
  await expect.poll(() => sayfa(page)).toBe(1);
  expect(await enBuyukOlcek(page)).toBeLessThanOrEqual(1.02);
  expect(hatalar).toEqual([]);
});

test('yatay 667×375: her sayfanın yazısı sığar ve okunaklı; sonda ebeveyn sayfası', async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 667, 375);
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await page.reload();
  await kitabiAc(page, 'bak');
  for (let s = 1; s <= 14; s++) {
    await expect.poll(() => sayfa(page)).toBe(s);
    const olc = await page.locator('.kt-kitap > .kt-sayfa-sag .kt-metin').evaluate((e) => {
      const cs = getComputedStyle(e);
      const bos = e.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      return { sigar: e.firstElementChild!.scrollHeight <= bos + 1, px: parseFloat(cs.fontSize) };
    });
    expect(olc.sigar, `sayfa ${s}`).toBe(true);
    expect(olc.px, `sayfa ${s}`).toBeGreaterThanOrEqual(16);
    await ileri(page);
  }
  await expect.poll(() => sayfa(page)).toBe(15);
  await expect(page.locator('.kt-ebeveyn')).toContainText('Çocuğunuzla konuşmak için:');
  await expect(page.locator('.kt-son-yazi')).toHaveText('Son');
  expect(hatalar).toEqual([]);
});

test('Bana oku: kapak ve sayfa satır satır okunur, kelime vurgulanır, otomatik çevirme yok', async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 844, 390);
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await page.reload();
  // vurgulanan kelimeleri say
  await page.evaluate(() => {
    const w = window as unknown as { __vurgu: Set<string> };
    w.__vurgu = new Set();
    new MutationObserver((ms) => {
      for (const m of ms) {
        const e = m.target as HTMLElement;
        if (e.classList?.contains('kt-simdi')) w.__vurgu.add(e.textContent ?? '');
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  await kitabiAc(page, 'oku');
  await expect.poll(() => okunan(page)).toEqual(expect.arrayContaining(['kapak:0', 's01:0', 's01:1', 's01:2']));
  await expect.poll(() => okuyor(page)).toBe(false);
  const vurgu = await page.evaluate(() => [...(window as unknown as { __vurgu: Set<string> }).__vurgu]);
  expect(vurgu).toEqual(expect.arrayContaining(['Pazartesi', 'sabahıydı.', 'büyüdüm']));
  // okuma bitti: sayfa kendiliğinden çevrilmedi
  await page.waitForTimeout(800);
  expect(await sayfa(page)).toBe(1);
  // satıra dokununca o satır yeniden okunur
  await page.locator('.kt-sayfa-sag .kt-satir').nth(2).click();
  await expect.poll(async () => (await okunan(page)).filter((o) => o === 's01:2').length).toBe(2);
  // son sayfaya kadar git: ebeveyn sayfası okunmaz
  for (let s = 1; s < 15; s++) {
    await ileri(page);
    await expect.poll(() => sayfa(page)).toBe(s + 1);
  }
  await page.waitForTimeout(600);
  const son = await okunan(page);
  expect(son.some((o) => o.startsWith('s15'))).toBe(false);
  // mod düğmesi: "Kendim bakayım"a geçince okuma durur
  await page.locator('.kt-mod').click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('minkino-kitap-v1')!).mod)).toBe('bak');
  expect(hatalar).toEqual([]);
});

test('ipucu: 20 sn hiçbir şey yapılmazsa bulunmamış bir şey çok hafif kıpırdar ("şuna dokun" yok)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 844, 390);
  await page.clock.install();
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await kitabiAc(page, 'bak');
  await expect.poll(() => sayfa(page)).toBe(1);
  expect(await page.locator('[data-ipucu]').count()).toBe(0);
  await page.clock.fastForward(10_000);
  expect(await page.locator('[data-ipucu]').count()).toBe(0);
  await page.clock.fastForward(12_000);
  await expect.poll(() => page.locator('.kt-sayfa-sol [data-ipucu]').count()).toBeGreaterThan(0);
  // ekranda yazılı ya da sesli yönlendirme yok
  await expect(page.locator('.kt-kok')).not.toContainText('dokun');
  expect(hatalar).toEqual([]);
});

test("ikinci kitap \"Kuzu'nun Kulağı\": metniyle açılır, resimsiz sayfalar yer tutucu, 13 sayfa + son", async ({ page }) => {
  const hatalar = hataTopla(page);
  await boyut(page, 667, 375);
  await page.goto('kitap/?test=1');
  await page.evaluate(() => localStorage.removeItem('minkino-kitap-v1'));
  await page.reload();
  await expect(page.locator('.kt-raf-kapak[data-kitap="kuzu-kulak"] .kt-kapak-baslik')).toHaveText("Kuzu'nun Kulağı");
  await kitabiAc(page, 'bak', 'kuzu-kulak');
  await expect.poll(() => sayfa(page)).toBe(1);
  await expect(page.locator('.kt-sayfa-sag .kt-metin')).toContainText('Cumartesiydi.');
  await expect(page.locator('.kt-sayfa-sag')).not.toContainText('[happy]');
  await expect(page.locator('.kt-sayfa-sol .kt-yertutucu')).toHaveCount(1);
  // en küçük yatay telefonda (667×375) her sayfanın yazısı sığar ve okunaklı
  for (let s = 1; s < 13; s++) {
    await expect.poll(() => sayfa(page)).toBe(s);
    const olc = await page.locator('.kt-kitap > .kt-sayfa-sag .kt-metin').evaluate((e) => {
      const cs = getComputedStyle(e);
      const bos = e.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      return { sigar: e.firstElementChild!.scrollHeight <= bos + 1, px: parseFloat(cs.fontSize) };
    });
    expect(olc.sigar, `sayfa ${s}`).toBe(true);
    expect(olc.px, `sayfa ${s}`).toBeGreaterThanOrEqual(16);
    await ileri(page);
    await expect.poll(() => sayfa(page)).toBe(s + 1);
  }
  await expect(page.locator('.kt-sayfa-sag .kt-metin')).toContainText('Babaanne');
  await ileri(page);
  await expect.poll(() => sayfa(page)).toBe(14);
  await expect(page.locator('.kt-ebeveyn')).toContainText('Evde birlikte onarabileceğimiz bir şey var mı?');
  await expect(page.locator('.kt-son-yazi')).toHaveText('Son');
  // son sayfadan ileri yok
  await ileri(page);
  await page.waitForTimeout(300);
  expect(await sayfa(page)).toBe(14);
  // dikeyde de açılır (tek sayfa)
  await boyut(page, 390, 844);
  await expect.poll(() => sayfa(page)).toBe(14);
  expect(hatalar).toEqual([]);
});

test('menüde Kitaplar kartı yok (KITAP_MENUDE = false)', async ({ page }) => {
  await page.goto('./?test=1');
  await expect(page.locator('a[href*="kitap/"]')).toHaveCount(0);
});
