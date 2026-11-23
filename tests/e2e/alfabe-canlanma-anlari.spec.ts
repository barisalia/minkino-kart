import { test, expect, type Page } from '@playwright/test';

// Derslerin canlanma anları (H7, 19 Kasım 2026): Keşfet'te bulma, Mıknatıslar'da kenetlenme ve birleşme,
// 2–3 yaş boyamada bitiş (alfabe/src/canlanma.ts, harfi-kesfet.ts, miknatis.ts, harf-boyama.ts).
// Astra'nın çizimleri gelene kadar anlar ışık ve renkle yaşanır; çizimler assets/alfabe/{kesif,miknatis,boyama}/
// altına gelince kendiliğinden kullanılır. Çizimler henüz yok: test kipinde yer tutucu (1 × 1 saydam) verilerek denenir.
// Ders akışı değişmez: her adım yine kendi sonraki adımına geçer.
const YER_TUTUCU = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});

async function adimiAc(page: Page, adim: number, yas: number, cizimler?: string[]) {
  await page.addInitScript(([adim, yas, cizimler, src]) => {
    if (cizimler) (window as unknown as { __canlanma: Record<string, string> }).__canlanma = Object.fromEntries(cizimler.map(ad => [ad, src]));
    if (sessionStorage.getItem('canlanma-anlari')) return;
    sessionStorage.setItem('canlanma-anlari', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ adimlar: { '02': adim } }));
  }, [adim, yas, cizimler ?? null, YER_TUTUCU] as const);
  await page.goto(cizimler ? './alfabe/?test=1' : './alfabe/');
  await page.locator('.at-harf[data-id="02"]').click();
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', String(adim));
}

async function harfiBul(page: Page) {
  await expect(page.locator('.hf-kesif')).toHaveAttribute('data-adim', 'bul', { timeout: 30_000 });
  await page.locator('.hf-kart:nth-child(2) button[data-hedef="evet"]').click();
}

test('Keşfet: büyüteç bulunan harfin üstüne gelir, harf rozete uçar; ders sonraki adıma geçer', async ({ page }) => {
  await adimiAc(page, 5, 6);
  await harfiBul(page);
  const mercek = page.locator('.hf-mercek');
  await expect(mercek).toBeAttached();
  await expect(mercek.locator('.hf-mercek-harf')).toHaveText('b');
  await expect(page.locator('.hf-ucan-harf')).toBeAttached({ timeout: 3000 });
  await expect(page.locator('.hf-harf')).toHaveClass(/hf-rozet-parla/, { timeout: 3000 });
  await expect(mercek).toHaveCount(0);
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '0', { timeout: 20_000 });
});

test('Keşfet: Astra çizimleri varsa büyüteç ve harf yıldızı onlarla oynar', async ({ page }) => {
  await adimiAc(page, 5, 6, ['kesif/buyutec', 'kesif/harf-yildizi']);
  await harfiBul(page);
  await expect(page.locator('.hf-mercek.hf-mercek-astra .hf-mercek-cizim')).toHaveAttribute('src', YER_TUTUCU);
  await expect(page.locator('button.hf-yildizli .hf-yildiz')).toHaveAttribute('src', YER_TUTUCU);
  await expect(page.locator('.hf-yildiz')).toHaveCSS('opacity', '1', { timeout: 3000 });
});

async function miknatislariYerlestir(page: Page, ara?: (i: number) => Promise<void>) {
  await expect(page.locator('.mik-tas').first()).toBeVisible({ timeout: 20_000 });
  const parcalar = await page.locator('.mik-yuva').allTextContents();
  for (const [i, parca] of parcalar.entries()) {
    await page.locator('.mik-tas:not(:disabled)', { hasText: new RegExp('^' + parca + '$') }).first().click();
    await ara?.(i);
  }
}

test('Mıknatıslar: her parça kıvılcımla kenetlenir, sözcük tamamlanınca ışık halkası açılır', async ({ page }) => {
  await adimiAc(page, 4, 6);
  await miknatislariYerlestir(page, async i => { if (i === 1) await expect(page.locator('.mik-levha .cn-isik').first()).toBeAttached({ timeout: 1500 }); });
  await expect(page.locator('.mik-kelime')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.mik-levha i.mik-halka').first()).toBeAttached({ timeout: 2000 });
  await expect(page.locator('.mik-bitir')).toBeVisible({ timeout: 10_000 });
});

test('Mıknatıslar: Astra çizimleri varsa kıvılcım kareleri ve birleşme halkası onlarla oynar', async ({ page }) => {
  await adimiAc(page, 4, 6, ['miknatis/kivilcim-0', 'miknatis/kivilcim-1', 'miknatis/kivilcim-2', 'miknatis/birlesme-halkasi']);
  await miknatislariYerlestir(page, async i => { if (i === 1) await expect(page.locator('.mik-levha img.cn-kare').first()).toBeAttached({ timeout: 1500 }); });
  await expect(page.locator('.mik-levha img.mik-halka-astra')).toHaveAttribute('src', YER_TUTUCU, { timeout: 15_000 });
});

async function harfiBoya(page: Page) {
  const harf = page.locator('.boy-harf');
  await expect(harf).toBeVisible({ timeout: 20_000 });
  await harf.focus();
  for (let i = 0; i < 400 && !(await page.locator('.boy-tamam').count()); i++) await page.keyboard.press('Space');
  await expect(page.locator('.boy-tamam')).toBeAttached();
}

test('Boyama (2–3 yaş): bitince boya damlaları düşer, harfin üstünde yıldız gökkuşağı açılır; ders sonraki adıma geçer', async ({ page }) => {
  await adimiAc(page, 6, 3);
  await harfiBoya(page);
  await expect(page.locator('.boy-kagit .boy-damla').first()).toBeAttached({ timeout: 1500 });
  await expect(page.locator('.boy-kagit .boy-yay-yildizi').first()).toBeAttached({ timeout: 2500 });
  // Yıldız yayı harfin üstünde açılır: ilk yıldızlar harfin üst kenarından yukarıda.
  const yay = await page.evaluate(() => {
    const harf = document.querySelector('.boy-ic')!.getBoundingClientRect();
    return [...document.querySelectorAll('.boy-yay-yildizi')].map(y => y.getBoundingClientRect().top < harf.top + harf.height * .25);
  });
  expect(yay.every(Boolean)).toBe(true);
  await expect(page.locator('#atolye')).not.toHaveAttribute('data-adim', '6', { timeout: 15_000 });
});

test('Boyama: Astra çizimleri varsa fırça parmağı izler, damlalar ve gökkuşağı onlarla oynar', async ({ page }) => {
  await adimiAc(page, 6, 3, ['boyama/firca', 'boyama/boya-damlasi-0', 'boyama/boya-damlasi-1', 'boyama/boya-damlasi-2', 'boyama/gokkusagi-yayi']);
  const harf = page.locator('.boy-harf');
  await expect(harf).toBeVisible({ timeout: 20_000 });
  const kutu = (await page.locator('.boy-ic').boundingBox())!;
  await page.mouse.move(kutu.x + kutu.width * .2, kutu.y + kutu.height * .5);
  await page.mouse.down();
  await page.mouse.move(kutu.x + kutu.width * .22, kutu.y + kutu.height * .6, { steps: 4 });
  await expect(page.locator('.boy-firca')).toBeVisible();
  await page.mouse.up();
  await expect(page.locator('.boy-firca')).toHaveClass(/boy-firca-gitti/);
  await harfiBoya(page);
  await expect(page.locator('.boy-kagit img.boy-damla-astra').first()).toHaveAttribute('src', YER_TUTUCU, { timeout: 1500 });
  await expect(page.locator('.boy-kagit img.boy-gokkusagi')).toHaveAttribute('src', YER_TUTUCU, { timeout: 2500 });
});

test('Dinle ve söyle: doğru anında resmin ve harfin çevresinde ışıklar parlar; ders yazmaya geçer', async ({ page }) => {
  // Mikrofon açılmazsa "Dokunarak devam et" ile de aynı an yaşanır (konusma-dersi.ts → dogruAni).
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: async () => { throw new DOMException('İzin yok', 'NotAllowedError'); } });
  });
  // Ses Kutusu (Paket Harf-H14, çizimler 22 Kasım'da geldi): mikrofonsuz yolda yazılı düğme yerine kutuya üç dokunuş.
  await adimiAc(page, 0, 6);
  await expect(page.locator('.alf-soyle')).toHaveAttribute('data-durum', 'dokun', { timeout: 20_000 });
  for (let i = 0; i < 3; i++) await page.locator('.alf-soyle-kart').click();
  await expect(page.locator('.alf-soyle')).toHaveAttribute('data-durum', 'dogru');
  await expect(page.locator('.alf-soyle-kart > .cn-isik').first()).toBeAttached({ timeout: 1500 });
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '1', { timeout: 15_000 });
});

test('Ders sonu: kart albüme yapışınca parlar, yıldızlar saçılır, sayaç çocuğun gözü önünde bir artar', async ({ page }) => {
  // Ses grubu sırasında (harf-sirasi.ts) A'dan sonra N: N dersi bitmiş, kartı henüz albüme yapıştırılmamış (main.ts → sonucGoster; ders-sonu-ani.ts).
  await page.addInitScript(() => {
    if (sessionStorage.getItem('ders-sonu')) return;
    sessionStorage.setItem('ders-sonu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ akisSurumu: 2, biten: ['01', '17'], bekleyen: ['17'], son: '17', adimlar: {} }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-harf[data-id="17"]').click();
  const sayac = page.locator('.at-ilerleme span');
  await expect(sayac).toHaveText('1 / 29');
  await page.locator('.ka-cikartma').click();
  await expect(page.locator('.ka-kitap .ka-parlama')).toBeAttached({ timeout: 1500 });
  await expect(page.locator('.ka-kitap .cn-isik').first()).toBeAttached({ timeout: 1500 });
  await expect(sayac).toHaveText('2 / 29', { timeout: 2000 });
  await expect(page.locator('.ka-kumanda')).toBeVisible();
  // Ders sonundaki düğme öğrenme sırasındaki sonraki harfi önerir: N'den sonra E.
  await expect(page.locator('.ka-kumanda .at-basla')).toHaveText(/E harfine geç/);
  // Rafa dönünce (raf-ani.ts): N'nin onay rozeti damga gibi basılır, kutusu altın halkayla parlar; sıradaki E uyanır ve parlar.
  await page.locator('.at-geri').click();
  await expect(page.locator('.at-harf[data-id="17"]')).toHaveClass(/at-yeni-bitti/, { timeout: 2000 });
  await expect(page.locator('.at-harfler .cn-isik').first()).toBeAttached({ timeout: 2000 });
  await expect(page.locator('.at-harf[data-id="06"]')).toHaveClass(/at-siradaki/, { timeout: 3000 });
  await expect(page.locator('.at-harf.at-siradaki')).toHaveCount(1);
});

test('Albümde sayfa gerçek kitap gibi çevrilir; dokunulan kart adını söylerken zıplar', async ({ page }) => {
  // album.ts → cevir/sayfaCevir: eski sayfa omurgadan kalkar (kopyası döner), yeni sayfa öbür yandan iner.
  await page.addInitScript(() => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ akisSurumu: 2, biten: ['01', '02', '03', '04'], bekleyen: [], son: '04', adimlar: {} }));
  });
  await page.goto('./alfabe/');
  await page.locator('.at-album-ac').click();
  await expect(page.locator('.ka-kart')).toHaveCount(2);
  await expect(page.locator('.ka-kart').first()).toHaveAttribute('data-dinle', '01');
  await page.locator('.ka-sonra').click();
  await expect(page.locator('.ka-kitap .ka-cevrilen')).toHaveCount(1);
  await expect(page.locator('.ka-kart[data-dinle]').first()).toHaveAttribute('data-dinle', '03');
  await expect(page.locator('.ka-kitap .ka-cevrilen')).toHaveCount(0, { timeout: 2000 });
  await page.locator('.ka-once').click();
  await expect(page.locator('.ka-kart[data-dinle]').first()).toHaveAttribute('data-dinle', '01');
  await page.locator('.ka-kart').first().click();
  expect(await page.locator('.ka-kart').first().evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
});

test('Harf rafında sıradaki harf hep hafifçe parlar; az hareket ayarında da yerini gösterir', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Eski A–Z sırasıyla A ve B bitmiş: B bitmiş görünmeye devam eder, sıradaki ses grubu sırasında N'dir.
  await page.addInitScript(() => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ akisSurumu: 2, biten: ['01', '02'], bekleyen: [], son: '02', adimlar: {} }));
  });
  await page.goto('./alfabe/');
  await expect(page.locator('.at-harf[data-id="17"]')).toHaveClass(/at-siradaki/);
  await expect(page.locator('.at-harf[data-id="02"] .at-biten')).toBeAttached();
  await expect(page.locator('.at-basla')).toHaveText(/N ile başla/);
  await expect(page.locator('.at-harfler .cn-isik')).toHaveCount(0);
});

test('az hareket ayarında büyüteç, kıvılcım ve damlalar yok; Keşfet rozeti yine parlar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await adimiAc(page, 5, 6);
  await harfiBul(page);
  await expect(page.locator('.hf-harf')).toHaveClass(/hf-rozet-parla/);
  await expect(page.locator('.hf-mercek')).toHaveCount(0);
  await expect(page.locator('.cn-isik')).toHaveCount(0);
  await expect(page.locator('#atolye')).toHaveAttribute('data-adim', '0', { timeout: 20_000 });
});
