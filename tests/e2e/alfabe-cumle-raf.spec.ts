import { test, expect, type Page } from '@playwright/test';

// "Ceren'le oku" rafta (Barış'ın kararı, 20 Kasım; alfabe/src/cumle-karti.ts → bağlantı noktası A, cumle-okuma.ts).
// Hece Oyunu ve Hece Evleri'nin yanında üçüncü kart. Yatay tablette üç kart tek sırada ve raf kaydırmadan sığar.
// Hiç cümle açılmamışsa kart, en yakın cümle için kalan harfleri gösterir. 2–3 yaşta cümle bölümü olmadığından kart yok.
test.beforeEach(async ({ page }, bilgi) => {
  if (bilgi.project.name === 'iphone') await page.setViewportSize({ width: 844, height: 390 });
});
const HEPSI = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));

async function rafiAc(page: Page, biten: string[], yas = 6) {
  await page.addInitScript(([biten, yas]) => {
    if (sessionStorage.getItem('cumle-raf')) return;
    sessionStorage.setItem('cumle-raf', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas }));
    const ek = yas >= 5 ? '' : yas === 4 ? '-yas-4' : '-yas-2-3';
    localStorage.setItem('minkino-alfabe-v1' + ek, JSON.stringify({ akisSurumu: 2, biten, bekleyen: [], son: biten[biten.length - 1] ?? '01', adimlar: {} }));
  }, [biten, yas] as const);
  await page.goto('./alfabe/');
  await expect(page.locator('.at-harfler')).toBeVisible();
}

test('açık durum: kart cümle sayısını söyler, dokununca Ceren’le oku açılır, geri rafa döner', async ({ page }) => {
  await rafiAc(page, HEPSI);
  const kart = page.locator('.at-cumle-karti');
  await expect(kart).toHaveAttribute('data-durum', 'acik');
  await expect(kart.locator('.at-cumle-ac')).toHaveAttribute('aria-label', /Ceren’le oku, \d+ cümle/);
  await kart.locator('.at-cumle-ac').click();
  await expect(page.locator('#atolye')).toHaveAttribute('data-ekran', 'cumle');
  await expect(page.locator('.at-sahne-cumle .co-sahne')).toBeVisible();
  // Ceren'le oku önce "Oku ve bul" ısınmasıyla (oku-bul.ts) ya da doğrudan bir cümleyle açılır
  await expect(page.locator('.co-sahne')).toHaveAttribute('data-evre', /okubul|ceren|cocuk/, { timeout: 15_000 });
  await page.locator('.at-geri').click();
  await expect(page.locator('.at-cumle-ac')).toBeFocused();
});

test('boş durum: hiç cümle açılmamışsa kart kalan harfleri gösterir, bölüm Ceren’in sözüyle açılır', async ({ page }) => {
  await rafiAc(page, ['01', '02']);
  const kart = page.locator('.at-cumle-karti');
  await expect(kart).toHaveAttribute('data-durum', 'bos');
  // Ses grubu sırasında en erken açılan cümle ("Anne nane tat."): A ve B bitmiş, kalan N, E, T. B'yi bitirmek
  // "Bal al."ı yakınlaştırmaz; L ancak 6. sırada (cumle-okuma-kurallari.ts → cumleDurumu).
  await expect(kart.locator('.at-cumle-harf')).toHaveText(['N', 'E', 'T']);
  await expect(kart.locator('.at-cumle-ac')).toHaveAttribute('aria-label', 'Ceren’le oku. Önce N, E, T harflerini öğrenelim.');
  await kart.locator('.at-cumle-ac').click();
  await expect(page.locator('.co-sahne')).toHaveAttribute('data-evre', 'bos');
});

// "Önce:" harfleri ses grubu sırasıyla (cumleDurumu): 5+ yaşta en erken cümle dört harf ister, 4 yaşta üç.
for (const [yas, biten, beklenen] of [
  [6, [], ['A', 'N', 'E', 'T']], [6, ['01'], ['N', 'E', 'T']],
  [4, [], ['A', 'N', 'E']], [4, ['01'], ['N', 'E']],
] as const) {
  test(`boş durum ${yas === 6 ? '5+' : '4'} yaş, ${biten.length ? 'A bitmiş' : 'boş kayıt'}: Önce ${beklenen.join(' ')}`, async ({ page }) => {
    await rafiAc(page, [...biten], yas);
    const kart = page.locator('.at-cumle-karti');
    await expect(kart).toHaveAttribute('data-durum', 'bos');
    await expect(kart.locator('.at-cumle-harf')).toHaveText([...beklenen]);
  });
}

test('A, N, E, T bitince Ceren’le oku açılır', async ({ page }) => {
  await rafiAc(page, ['01', '17', '06', '24']);
  await expect(page.locator('.at-cumle-karti')).toHaveAttribute('data-durum', 'acik');
  await expect(page.locator('.at-cumle-harf')).toHaveCount(0);
});

test('2–3 yaşta Ceren’le oku kartı yok', async ({ page }) => {
  await rafiAc(page, HEPSI, 3);
  await expect(page.locator('.at-hece-ac')).toBeVisible();
  await expect(page.locator('.at-cumle-karti')).toHaveCount(0);
});

for (const [w, h] of [[1024, 768], [1180, 820], [1194, 834], [1280, 800], [1366, 1024]] as const) {
  test(`yatay tablet ${w}×${h}: üç kart tek sırada, raf kaydırmadan sığar, başlıklar düğmelere değmez`, async ({ page }, bilgi) => {
    test.skip(bilgi.project.name !== 'ipad-yatay', 'boy testin içinde ayarlanır; bir projede koşmak yeter');
    await page.setViewportSize({ width: w, height: h });
    for (const biten of [HEPSI, ['01', '02']]) {
      await page.evaluate(() => sessionStorage.removeItem('cumle-raf')).catch(() => {});
      await rafiAc(page, biten);
      const olcu = await page.evaluate(() => {
        const kartlar = [...document.querySelectorAll('.at-raf > .at-hece-karti')];
        const kes = (a: DOMRect, b: DOMRect) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        return {
          kayma: document.documentElement.scrollHeight - innerHeight,
          siralar: new Set(kartlar.map(k => Math.round(k.getBoundingClientRect().top))).size,
          kart: kartlar.length,
          degme: kartlar.some(k => {
            const s = k.querySelector('.at-hece-yazi strong')!.getBoundingClientRect();
            return [...k.querySelectorAll('.at-hece-oyna,.at-hece-dinle')].some(d => kes(s, d.getBoundingClientRect()));
          }),
        };
      });
      expect(olcu).toEqual({ kayma: 0, siralar: 1, kart: 3, degme: false });
    }
  });
}

// Ses grubu sırası (Barış, 20 Kasım; alfabe/src/harf-sirasi.ts): raf beş grup panosu, öğrenme sırasıyla.
test('raf beş ses grubunda dizilir: A N E T İ L · O K U R I M · Ü S Ö Y D Z · Ç B G C Ş · P H V Ğ F J; boş kayıtta A ile başlanır', async ({ page }) => {
  await rafiAc(page, []);
  const gruplar = await page.locator('.at-grup').evaluateAll(l => l.map(g => [...g.querySelectorAll('.at-harf b')].map(b => b.textContent).join(' ')));
  expect(gruplar).toEqual(['A N E T İ L', 'O K U R I M', 'Ü S Ö Y D Z', 'Ç B G C Ş', 'P H V Ğ F J']);
  await expect(page.locator('.at-basla')).toHaveText(/A ile başla/);
  await expect(page.locator('.at-harf[data-id="01"]')).toHaveClass(/at-siradaki/);
});

test('uygulama kipinde (abonelik yok) ücretsiz dört harf A, N, E, T; İ ve sonrası kilitli', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 6 }));
    localStorage.setItem('minkino-alfabe-v1', JSON.stringify({ akisSurumu: 2, biten: [], bekleyen: [], son: '01', adimlar: {} }));
  });
  await page.goto('./alfabe/?test=1&uygulama=ios');
  const ilk = await page.locator('.at-grup').first().locator('.at-harf').evaluateAll(l => l.map(b => b.querySelector('b')!.textContent + (b.hasAttribute('data-kilitli') ? '🔒' : '')));
  expect(ilk).toEqual(['A', 'N', 'E', 'T', 'İ🔒', 'L🔒']);
  await expect(page.locator('.at-harf[data-kilitli]')).toHaveCount(25);
});
