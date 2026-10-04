import { expect, test } from '@playwright/test';
import { hataTopla } from './yardimci';

test('Çizgi Filmler ekranı: kapaklı büyük kartlar, öğüt rozeti, süre; Mino ve Kino tepki verir; filmden geri dönülür', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  await expect(page).toHaveTitle('Minkino Çizgi Filmler');
  await expect(page.locator('.fl-k-baslik')).toHaveText('Çizgi Filmler');
  const kartlar = page.locator('.fl-film-kart');
  await expect(kartlar).toHaveCount(6);
  expect(await kartlar.evaluateAll((l) => l.map((k) => (k as HTMLElement).dataset.film))).toEqual(['kino-oyuncak', 'kino-lutfen', 'mino-sepet', 'kino-kaydirak', 'kino-elma-kulesi', 'mino-karpuz']);
  await expect(page.locator('.fl-k-yeni')).toHaveCount(1);
  await expect(page.locator('.fl-film-kart[data-film="mino-karpuz"] .fl-k-ogut')).toHaveText('Paylaşmak');
  await expect(page.locator('.fl-film-kart[data-film="kino-elma-kulesi"] .fl-k-ogut')).toHaveText('Özür dilemek');
  await expect(page.locator('.fl-film-kart[data-film="kino-kaydirak"] .fl-k-ogut')).toHaveText('Sıra beklemek');
  await expect(page.locator('.fl-film-kart[data-film="mino-sepet"] .fl-k-ogut')).toHaveText('Yardım etmek');
  await expect(page.locator('.fl-film-kart[data-film="kino-lutfen"] .fl-k-ogut')).toHaveText('Lütfen demek');
  await expect(page.locator('.fl-film-kart[data-film="kino-oyuncak"] .fl-k-ogut')).toHaveText('Toplamak');
  // v2: en yeni film (Oyuncak Sepeti) ~1,5 dk → 2 dk; eski filmler 1 dk
  await expect(page.locator('.fl-k-sure').first()).toHaveText('2 dk');
  await expect(page.locator('.fl-film-kart[data-film="kino-kaydirak"] .fl-k-sure')).toHaveText('1 dk');
  // kapaklar yüklendi; kartlar ekrandan taşmıyor, dokunma alanı büyük
  const boyut = page.viewportSize()!;
  for (const k of await kartlar.all()) {
    await k.scrollIntoViewIfNeeded();
    await expect(k.locator('img')).toHaveJSProperty('complete', true);
    expect(await k.locator('img').evaluate((i) => (i as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(960);
    const b = (await k.boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(boyut.width + 1);
    expect(b.width).toBeGreaterThan(250);
    expect(b.height).toBeGreaterThan(170);
  }
  // telefon dikeyde tek sütun, tablette iki sütun
  const [a, b] = [(await kartlar.nth(0).boundingBox())!, (await kartlar.nth(1).boundingBox())!];
  expect(Math.abs(a.y - b.y) < 2).toBe(boyut.width >= 700);
  // Mino ve Kino köşede, dokununca tepki verir
  await expect(page.locator('.fl-k-mino .mino svg')).toBeVisible();
  await expect(page.locator('.fl-k-kino .kr-iskeletli svg')).toBeVisible();
  await page.locator('.fl-k-kino').click();
  await expect(page.locator('.fl-k-kino')).toHaveAttribute('data-tepki', 'sevin');
  await page.locator('.fl-k-mino').click();
  await expect(page.locator('.fl-k-mino')).toHaveAttribute('data-tepki', '1');
  await page.evaluate(() => document.querySelector('.fl-k-liste')!.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `tests/screens/${info.project.name}-f9-cizgi-filmler.png` });
  // karta dokun: film başlar; geri düğmesi Çizgi Filmler ekranına döner
  await kartlar.nth(3).click();
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Kaydırak');
  await page.getByRole('button', { name: 'Çizgi Filmler', exact: true }).click();
  await expect(page.locator('.fl-k-baslik')).toBeVisible();
  await expect(page.locator('.fl-film-kart.son-izlenen')).toHaveAttribute('data-film', 'kino-kaydirak');
  await expect(page).not.toHaveURL(/film=/);
  expect(hatalar).toEqual([]);
});

test('Film: Mino’nun Karpuzu animatiği baştan sona oynar, sonda öğüt kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  // ?film=<ad>: doğrudan o filmin kapağı (filmin karesi arkada, başlık + Oynat; MP4 kaydı da bunu kullanır)
  await page.goto('./film/?test=1&film=mino-karpuz');
  await expect(page.locator('.fl-baslik')).toHaveText("Mino'nun Karpuzu");
  await page.screenshot({ path: `tests/screens/${info.project.name}-f0-film-kapak.png` });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // ortak açılış: Mino ve Kino, asıl MINKINO logosu, başlık kartı ve Çizgi Film
  await expect(page.locator('.fl-acilis-alt')).toHaveText('Çizgi Film');
  await expect(page.locator('.fl-in .fl-in-mino .mino')).toHaveCount(1);
  await expect(page.locator('.fl-in-logo img.mk-logo')).toHaveAttribute('alt', 'Minkino');
  // sahne 1: Mino ve karpuz sahnede
  await expect(page.locator('.fl-sahne[data-sahne="1-pazar-kapaniyor"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-esya="karpuz"]')).toBeVisible();
  // sahne 2: köpek (iskeletli karakter) gelir, karpuz ikiye bölünür
  await expect(page.locator('.fl-sahne[data-sahne="2-ac-kopek"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.fl-nesne[data-oyuncu="kopek"] .kr-karakter')).toBeVisible();
  await expect(page.locator('.fl-sahne[data-son-soz="Hav! Teşekkürler!"]')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f1-film-sahne2.png` });
  // son: öğüt kartı
  await expect(page.locator('.fl-ogut')).toContainText('Paylaşmak güzeldir.', { timeout: 15000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f2-film-ogut.png` });
  expect(hatalar).toEqual([]);
});

test('Film: Kino ve Elma Kulesi baştan sona oynar (Çizgi Filmler ekranından), sonda öğüt kartı', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  // Çizgi Filmler ekranı: altı kart; Elma Kulesi kartına dokununca film açılış kartıyla hemen başlar
  await page.goto('./film/?test=1');
  await expect(page.locator('.fl-film-kart')).toHaveCount(6);
  // test modunda film hızlı akar: sahneler ve sözler sırayla kaydedilir (kısa anlar kaçmasın)
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.locator('.fl-film-kart[data-film="kino-elma-kulesi"]').click();
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Elma Kulesi');
  await expect(page).toHaveURL(/film=kino-elma-kulesi/);
  // sahne 1: Mino, 9 elmalık kule, elinde en parlak elma
  await expect(page.locator('.fl-sahne[data-sahne="1-neredeyse-bitti"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg image[data-tasinan="e10"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="elma"]')).toHaveCount(10);
  // son: Mino öğüdü söyler, öğüt kartı
  await expect(page.locator('.fl-ogut')).toContainText('Hata yapınca özür dileriz.', { timeout: 20000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f4-elma-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { __sahneler: w.__sahneler, __sozler: w.__sozler };
  });
  expect(kayit.__sahneler).toEqual(['1-neredeyse-bitti', '2-top', '3-kasanin-arkasinda', '4-ozur', '5-son-elma']);
  expect(kayit.__sozler).toEqual([
    'Günaydın! Kulemin son elması bu.',
    'Bu kule için çok uğraştım.',
    'Top! Top! Top!',
    'Kulem!',
    'Eyvah, kule yıkıldı!',
    'Çok üzüldüm, Kino.',
    'Mino kızacak…',
    'Kino birden kayboldu.',
    'Özür dilemeliyim.',
    'Özür dilerim, Mino.',
    'Özür dilediğin için sağ ol.',
    'Dikkat edeceğim!',
    'Olur böyle. Birlikte dizelim!',
    'Hemen başlayalım!',
    'Yaşasın!',
    'Birlikte daha güzel!',
    'Artık hiç üzgün değilim.',
    'Hata yapınca özür dileriz.',
  ]);
  expect(hatalar).toEqual([]);
});

test('Film: Kino ve Kaydırak: açılış kartı, 5 sahne, öğüt kartı ve kapanış jeneriği', async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1&film=kino-kaydirak');
  await expect(page.locator('.fl-baslik')).toHaveText('Kino ve Kaydırak');
  await page.screenshot({ path: `tests/screens/${info.project.name}-f5-kaydirak-kapak.png` });
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.getByRole('button', { name: 'Oynat' }).click();
  // önce başlık kartı (film-acilis jeneriği), sonra film
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Kaydırak');
  await expect(page.locator('.fl-sahne[data-sahne="1-siranin-basi"]')).toBeVisible();
  // yan görünüşlü oyuncular ve önden Kino
  await expect(page.locator('.fl-nesne[data-oyuncu="ada"] .yk-yandan')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  // son: Mino öğüdü söyler, öğüt kartı; kapanış jeneriği bitince ekran "tamam"
  await expect(page.locator('.fl-ogut')).toContainText('Sırayı beklemek güzeldir.', { timeout: 25000 });
  await expect(page.locator('.fl-ekran[data-tamam]')).toHaveCount(1, { timeout: 5000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f6-kaydirak-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { sahneler: w.__sahneler, sozler: w.__sozler };
  });
  expect(kayit.sahneler).toEqual(['1-siranin-basi', '2-sira-arkada', '3-sona-git', '4-bekleme', '5-sira-bende']);
  expect(kayit.sozler).toEqual([
    'Parkta kaydırak sırası vardı.',
    'Ada, Can ve Elif bekliyordu.',
    'Kaydırak! Kaydırak!',
    'Kino sıranın önüne geçti!',
    'Ben önce!',
    'Kino, sıra arkada.',
    'Ama beklemek zor.',
    'Can da çok bekledi.',
    'Araya girince arkadaşlar üzülür.',
    'Sıra herkese gelir.',
    'En arkadayım.',
    'Aferin Kino!',
    'Of, çok uzun!',
    'Beklerken şarkı söyleyelim!',
    'La la la!',
    'Sabrediyorum!',
    'Sıra yaklaşıyor!',
    'Sıra bende!',
    'Yaşasın!',
    'Beklemeye değdi!',
    'Herkes sırayla kaydı.',
    'Sırayı beklemek güzeldir.',
  ]);
  expect(hatalar).toEqual([]);
});

test("Film: Mino'nun Sepeti: Çizgi Filmler'de ikinci kart, 5 sahne, öğüt kartı ve kapanış jeneriği", async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  // en yeni film (Kino ve Oyuncak Sepeti) üstte; Sepet üçüncü, Yeni rozeti artık onda değil
  await expect(page.locator('.fl-film-kart')).toHaveCount(6);
  await expect(page.locator('.fl-film-kart').nth(2)).toHaveAttribute('data-film', 'mino-sepet');
  await expect(page.locator('.fl-film-kart[data-film="mino-sepet"] .fl-k-yeni')).toHaveCount(0);
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.locator('.fl-film-kart[data-film="mino-sepet"]').click();
  await expect(page.locator('.fl-acilis-baslik')).toHaveText("Mino'nun Sepeti");
  await expect(page).toHaveURL(/film=mino-sepet/);
  // sahne 1: Mino, sepet ve beş elma (test modunda film hızlı: sepet elden çabuk düşer, yalnız varlığına bakılır)
  await expect(page.locator('.fl-sahne[data-sahne="1-neseli-yol"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-oyuncu="mino"] .mino-svg')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-esya="sepet"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="elma"]')).toHaveCount(5);
  // son: Mino öğüdü söyler, öğüt kartı; kapanış jeneriği bitince ekran tamam
  await expect(page.locator('.fl-ogut')).toContainText('Yardım etmek güzeldir.', { timeout: 25000 });
  await expect(page.locator('.fl-ekran[data-tamam]')).toHaveCount(1, { timeout: 5000 });
  await page.screenshot({ path: `tests/screens/${info.project.name}-f8-sepet-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { sahneler: w.__sahneler, sozler: w.__sozler };
  });
  expect(kayit.sahneler).toEqual(['1-neseli-yol', '2-hepsi-dagildi', '3-topla', '4-bir-elma-eksik', '5-tesekkur']);
  expect(kayit.sozler).toEqual([
    'Anneme elma götürüyorum.',
    'Sepetim elma dolu!',
    'Eyvah! Elmalarım!',
    'Ay! Ayağım takıldı.',
    'Hepsi dağıldı.',
    'Tek başıma toplayamam.',
    'Çok üzüldüm.',
    'Ben yardım ederim!',
    'Sağ ol, Kino!',
    'Birlikte çok kolay!',
    'Hep birlikte!',
    'Bir elma eksik.',
    'En güzel elmam kayboldu.',
    'Orada, bankın altında!',
    'Buldum!',
    'Sepet yine dolu!',
    'Teşekkür ederim!',
    'Rica ederim!',
    'Yalnızken çok üzgündüm.',
    'Sizinle her şey kolaylaştı.',
    'Arkadaşlar yardımlaşır!',
    'Yardım etmek güzeldir.',
  ]);
  expect(hatalar).toEqual([]);
});

test("Film: Kino ve Sihirli Söz: Çizgi Filmler'de ikinci kart, pazar, satıcı ayı, 5 sahne, öğüt kartı ve jenerik", async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  // en yeni film (Kino ve Oyuncak Sepeti) en üstte; Sihirli Söz ikinci, Yeni rozeti artık onda değil
  await expect(page.locator('.fl-film-kart')).toHaveCount(6);
  await expect(page.locator('.fl-film-kart').nth(1)).toHaveAttribute('data-film', 'kino-lutfen');
  await expect(page.locator('.fl-film-kart[data-film="kino-lutfen"] .fl-k-yeni')).toHaveCount(0);
  await expect(page.locator('.fl-film-kart[data-film="kino-lutfen"] .fl-k-ad')).toHaveText('Kino ve Sihirli Söz');
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.locator('.fl-film-kart[data-film="kino-lutfen"]').click();
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Sihirli Söz');
  await expect(page).toHaveURL(/film=kino-lutfen/);
  // sahne 1: pazar tezgâhı, satıcı ayı (iskelet), elma ve çilek kasaları
  await expect(page.locator('.fl-sahne[data-sahne="1-pazar"]')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-esya="tezgah"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-oyuncu="ayi"] .kr-iskeletli svg')).toBeVisible();
  await expect(page.locator('.fl-nesne[data-tip="elma"]')).toHaveCount(10);
  await expect(page.locator('.fl-nesne[data-tip="cilek"]')).toHaveCount(10);
  // son: Mino öğüdü söyler, öğüt kartı; kapanış jeneriği bitince ekran tamam
  await expect(page.locator('.fl-ogut')).toContainText('Lütfen demek sihirli bir sözdür.', { timeout: 25000 });
  await expect(page.locator('.fl-ekran[data-tamam]')).toHaveCount(1, { timeout: 5000 });
  // son sahnede Kino'nun başında çilek, göğsünde elma; ayının kaşı iki yarıya bölünmüş (kaş çatma / kaldırma)
  await expect(page.locator('.fl-nesne[data-oyuncu="kino"] image[data-tasinan="cilek"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-oyuncu="kino"] image[data-tasinan="elma"]')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-oyuncu="ayi"] [data-parca="kas"] > g')).toHaveCount(2);
  // finaldeki şarkı: karaoke dört satır, 29 hece; şarkı bitince kutu kapanmış (bütün heceler yanmış)
  await expect(page.locator('.fl-sahne[data-sarki="lutfen"]')).toHaveCount(1);
  await expect(page.locator('.fl-karaoke .fl-k-satir')).toHaveCount(4);
  await expect(page.locator('.fl-karaoke .fl-hece')).toHaveCount(29);
  await expect(page.locator('.fl-karaoke[data-bitti]')).toHaveCount(1);
  await expect(page.locator('.fl-karaoke .fl-hece.gecti')).toHaveCount(29);
  expect(await page.locator('.fl-karaoke .fl-k-satir').first().textContent()).toBe('Lütfendemekçokgüzel');
  await page.screenshot({ path: `tests/screens/${info.project.name}-f10-lutfen-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { sahneler: w.__sahneler, sozler: w.__sozler };
  });
  expect(kayit.sahneler).toEqual(['1-pazar', '2-ver', '3-fisilti', '4-lutfen', '5-tesekkur']);
  expect(kayit.sozler).toEqual([
    "Bugün Kino'yla pazardayız!",
    'Elma! Kocaman elma!',
    'Ayı amca elma satıyor.',
    'Ver!',
    'Ver! Ver!',
    'Ayı bana kızdı.',
    'Ben elma istiyordum.',
    'Ver deyince ayı üzüldü.',
    'Sihirli sözü söyle: Lütfen!',
    'Sihirli bir söz…',
    'Lütfen deyince herkes sevinir.',
    'Biraz utanıyorum.',
    'Lütfen…',
    'Buyur! Bir de çilek!',
    'Kibar sözler beni çok sevindirir.',
    'Lütfen işe yaradı!',
    'Teşekkürler!',
    'Rica ederim, tatlı Kino!',
    'Lütfen demek sihirli bir sözdür.',
  ]);
  expect(hatalar).toEqual([]);
});

test("Film: Kino ve Oyuncak Sepeti: Çizgi Filmler'de ilk kart (Yeni), ev, sepet ve küpler, 5 sahne, öğüt kartı ve jenerik", async ({ page }, info) => {
  const hatalar = hataTopla(page);
  await page.goto('./film/?test=1');
  // en yeni film en üstte, Yeni rozetiyle (tek Yeni)
  await expect(page.locator('.fl-film-kart')).toHaveCount(6);
  await expect(page.locator('.fl-film-kart').first()).toHaveAttribute('data-film', 'kino-oyuncak');
  await expect(page.locator('.fl-film-kart[data-film="kino-oyuncak"] .fl-k-yeni')).toHaveText('Yeni');
  await expect(page.locator('.fl-k-yeni')).toHaveCount(1);
  await expect(page.locator('.fl-film-kart[data-film="kino-oyuncak"] .fl-k-ad')).toHaveText('Kino ve Oyuncak Sepeti');
  await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    w.__sahneler = [];
    w.__sozler = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target as HTMLElement;
        if (m.attributeName === 'data-sahne' && el.dataset.sahne && w.__sahneler.at(-1) !== el.dataset.sahne) w.__sahneler.push(el.dataset.sahne);
        if (m.attributeName === 'data-son-soz' && el.dataset.sonSoz && w.__sozler.at(-1) !== el.dataset.sonSoz) w.__sozler.push(el.dataset.sonSoz);
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-sahne', 'data-son-soz'] });
  });
  await page.locator('.fl-film-kart[data-film="kino-oyuncak"]').click();
  await expect(page.locator('.fl-acilis-baslik')).toHaveText('Kino ve Oyuncak Sepeti');
  await expect(page).toHaveURL(/film=kino-oyuncak/);
  // sahne 1: ev seti (duvar, kanepe + kitaplık, zemin), üç küp (kodla), top, oyuncak ayı, kitap, sepet kümesi
  await expect(page.locator('.fl-sahne[data-sahne="1-oyun"]')).toBeVisible();
  await expect(page.locator('.fl-uzak.fl-ev .fl-ev-duvar')).toHaveCount(1);
  await expect(page.locator('.fl-tezgahlar .fl-arka')).toHaveCount(2);
  await expect(page.locator('.fl-nesne[data-tip^="kup-"]')).toHaveCount(3);
  await expect(page.locator('.fl-nesne[data-tip="top"] img')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="oyuncak-ayi"] img')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="kitap"] img')).toHaveCount(1);
  await expect(page.locator('.fl-nesne[data-tip="on-kume"] img')).toHaveCount(1);
  // son: Mino öğüdü söyler, öğüt kartı; kapanış jeneriği bitince ekran tamam
  await expect(page.locator('.fl-ogut')).toContainText('Oyundan sonra toplarız.', { timeout: 25000 });
  await expect(page.locator('.fl-ekran[data-tamam]')).toHaveCount(1, { timeout: 5000 });
  // finalde sepet kümesi kanepedekilerin önünde
  expect(Number(await page.locator('.fl-nesne[data-esya="kume"]').evaluate((e) => (e as HTMLElement).style.zIndex))).toBeGreaterThan(20);
  await page.screenshot({ path: `tests/screens/${info.project.name}-f11-oyuncak-ogut.png` });
  const kayit = await page.evaluate(() => {
    const w = window as unknown as { __sahneler: string[]; __sozler: string[] };
    return { sahneler: w.__sahneler, sozler: w.__sozler };
  });
  expect(kayit.sahneler).toEqual(['1-oyun', '2-kayma', '3-gol', '4-topla', '5-kanepe']);
  expect(kayit.sozler).toEqual(['Yaşasın!', 'Kino bugün çok oynadı!', 'Her yer oyuncak dolu!', 'Ah! Küpe bastım.', 'Canım biraz acıdı.', 'Üzgünüm, Mino.', 'Yerdeki oyuncak ayağa takılır.', 'Ama toplamak sıkıcı.', 'Hadi, toplayalım!', 'Gol!', 'Süper fikir, Kino!', 'Bir gol daha!', 'Her şey yerli yerinde!', 'Tertemiz!', 'Toplamak da eğlenceliymiş!', 'Hem de gol!', 'Ne öğrendik?', 'Oyundan sonra toplarız.']);
  expect(hatalar).toEqual([]);
});

test('Film: duraklat / devam', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  await page.goto('./film/?onizleme=1&sessiz=1&film=mino-karpuz');
  await page.getByRole('button', { name: 'Oynat' }).click();
  // önce açılış kartı (jenerik 7,9 sn), sonra film başlar ve Duraklat düğmesi görünür
  await expect(page.locator('.fl-acilis-baslik')).toBeVisible();
  await expect(page.locator('.fl-sahne[data-sahne]')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Duraklat' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toBeVisible();
  const kamera = await page.locator('.fl-orta').evaluate((e) => e.style.transform);
  await page.waitForTimeout(700);
  expect(await page.locator('.fl-orta').evaluate((e) => e.style.transform)).toBe(kamera);
  await page.getByRole('button', { name: 'Devam' }).click();
  await expect(page.locator('.fl-sahne.duraklatildi')).toHaveCount(0);
});

test('Film: ortak açılış dokununca geçilir; uzun açılış günde bir kez, sonra kısa açılış', async ({ page }, info) => {
  test.skip(info.project.name !== 'iphone', 'bir kez yeter');
  const hatalar = hataTopla(page);
  await page.goto('./film/?onizleme=1&sessiz=1&film=kino-oyuncak');
  await page.evaluate(() => localStorage.removeItem('minkino-film-acilis-v1'));
  await page.getByRole('button', { name: 'Oynat' }).click();
  // uzun açılış: perde açılır, Mino ve Kino zıplar, logo düşer, kurdelede başlık
  await expect(page.locator('.fl-in[data-tur="uzun"]')).toBeVisible();
  await expect(page.locator('.fl-in[data-adim="6"] .fl-in-kurdele .fl-acilis-baslik')).toHaveText('Kino ve Oyuncak Sepeti', { timeout: 9000 });
  // dokununca geçilir: film hemen başlar
  await page.locator('.fl-in').click();
  await expect(page.locator('.fl-in')).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator('.fl-sahne[data-sahne="1-oyun"]')).toBeVisible();
  // aynı gün yeniden: kısa açılış, o da dokununca geçilir
  await page.goto('./film/?onizleme=1&sessiz=1&film=kino-oyuncak');
  await page.getByRole('button', { name: 'Oynat' }).click();
  await expect(page.locator('.fl-in[data-tur="kisa"]')).toBeVisible();
  await expect(page.locator('.fl-in .fl-acilis-baslik')).toHaveText('Kino ve Oyuncak Sepeti');
  await page.waitForTimeout(700);
  await page.locator('.fl-in').click();
  await expect(page.locator('.fl-in')).toHaveCount(0, { timeout: 2000 });
  expect(hatalar).toEqual([]);
});
