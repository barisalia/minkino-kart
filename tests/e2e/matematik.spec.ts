import { test, expect, type Page } from '@playwright/test';
test.describe.configure({ timeout: 90000 });
test.beforeEach(async ({ page }) => {
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({ width: ekran.height, height: ekran.width });
  await page.addInitScript(() => {
    if (!localStorage.getItem('minkino-matematik-1-sayi')) localStorage.setItem('minkino-matematik-1-sayi',JSON.stringify({adim:0,yer:0,secimler:[],kuleTamam:true}));
    if (!localStorage.getItem('minkino-kartlar-v1'))
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5 }));
  });
});
const alanlar = ['sayi', 'sekil', 'olcu', 'fener'] as const;
async function tik(p: Page, s: string, i = 0) {
  await p.locator(s).nth(i).click();
}
async function izle(p: Page) {
  const yollar = await p.locator('.yazi-iz').evaluateAll((els) =>
    els.map((el) => {
      const path = el as SVGPathElement;
      const m = path.getScreenCTM()!;
      const len = path.getTotalLength();
      return Array.from({ length: Math.ceil(len / 4) + 1 }, (_, i) => {
        const pos = path.getPointAtLength(Math.min(len, i * 4)).matrixTransform(m);
        return [pos.x, pos.y];
      });
    }),
  );
  for (const points of yollar) {
    await p.mouse.move(points[0][0], points[0][1]);
    await p.mouse.down();
    for (const [x, y] of points) await p.mouse.move(x, y);
    await p.mouse.up();
  }
}
for (const [k, id] of alanlar.entries())
  test('Matematik Atölyesi · ' + id + ' yolunun tamamı', async ({ page: p }) => {
    test.setTimeout(260000);
    const hatalar: string[] = [];
    p.on('pageerror', (e) => hatalar.push(e.message));
    p.on('response', (r) => {
      if (r.status() >= 400) hatalar.push(r.url());
    });
    await p.goto('/matematik/');
    await tik(p, '.kose', k);
    for (let n = 0; n < 16; n++) {
      const asama = Math.floor(n / 4),
        tur = n % 4;
      if (k === 0) {
        if (n===4) {
          for(const i of [0,1,0,1,2]) await tik(p,'.tezgah .parca',i);
          await tik(p,'.onay');
        } else if ([2, 5, 9, 13].includes(n)) {
          if (n === 9) {
            await tik(p, '.boncuk', 4);
            await tik(p, '.boncuk', 5);
            await tik(p, '.onay');
          }
          if (n === 13) {
            await tik(p, '.boncuk', 9);
            await tik(p, '.onay');
          }
          const adet = n < 5 ? 1 : n < 13 ? 2 : 3;
          const tabak = n < 9 ? 2 : 3;
          for (let j = 0; j < adet; j++) for (let i = 0; i < tabak; i++) await tik(p, '.sofra .tabak', i);
        } else if ([3, 7, 10, 14].includes(n)) {
          await tik(p, '.tezgah .tabak', (7 - tur - asama + 6) % 3);
          await izle(p);
        } else if ([8, 11, 12, 15].includes(n)) {
          const cikar = n >= 12;
          const b = n === 8 ? 2 : n === 11 ? 3 : n === 12 ? 2 : 4;
          for (let i = 0; i < b; i++) await tik(p, cikar ? '.pano .meyve-tane' : '.tezgah .meyve-tane');
          if (cikar) await tik(p, '.onay');
        } else {
          const target = [1, 2, 3, 2, 3, 4, 5, 4, 5, 6, 7, 8, 7, 8, 9, 10][n],
            start = asama === 2 ? target - 2 : asama === 3 ? 10 : 0;
          if (n === 0) {
            await tik(p, '.onay');
            await expect(p.locator('.basari')).toHaveCount(0);
          }
          for (let i = 0; i < Math.abs(start - target); i++)
            await p
              .getByRole('button', {
                name: start > target ? 'Bir boncuk geri al' : 'Bir boncuk sola kaydır',
                exact: true,
              })
              .first()
              .click();
          await tik(p, '.onay');
        }
      } else if (k === 1) {
        if (n === 15) {
          const parca = (i: number) => p.locator('.tg-arac [data-indis="' + i + '"]');
          await parca(3).click();
          await expect(p.locator('.tg-dolu')).toHaveCount(0);
          for (const i of [1, 0, 4, 2, 3, 6, 5]) await parca(i).click();
          await expect(p.locator('.tg-yola-cik')).toBeVisible();
          await expect(p.locator('.tg-stok')).toHaveCount(0);
        } else if(n===0){
          for(const ad of ['Gövde','Direk','Üçgen yelken','Deniz fenerine yanaş']) await p.getByRole('button',{name:ad,exact:true}).click();
        } else if (n === 1 || n === 9) {
          for (const i of [0, 1, 1, 2]) await tik(p, '.parca', i);
        } else if ([4, 5].includes(n)) {
          for (const i of n === 4 ? [0, 1] : [3, 0, 1]) await tik(p, '.parca', i);
        } else if ([2, 6, 10, 14].includes(n))
          for (const i of [[0], [2], [1, 0], [2, 1, 0]][asama]) await tik(p, '.yer-' + i);
        else if ([3, 7, 11, 15].includes(n)) {
          for (const v of asama < 2 ? [0, 1, 2] : [0, 3, 1, 2])
            await p.getByLabel('Bitkinin gelişim resmi ' + v, { exact: true }).click();
        } else {
          const adet = asama >= 2 ? 4 : 3,
            a = (tur + (asama >= 2 ? 3 : 0)) % adet,
            b = (a + 1) % adet;
          for (const i of [[a], [a, b], [a, b], [a, a, b]][asama]) await tik(p, '.parca', i);
        }
      } else if (k === 2) {
        if (n === 0) await p.getByLabel('Diğer ölçü oyunlarına geç').click();
        if ([2, 7, 11, 14].includes(n)) {
          for (let j = 0; j < [2, 3, 5, 6][asama]; j++) await tik(p, '.parca');
          await tik(p, '.onay');
        } else if ([3, 6, 9, 15].includes(n)) {
          if (n >= 9) for (const i of [1, 2, 0]) await tik(p, '.sutun', i);
          await tik(p, '.sutun', ((asama % 2 ? 0 : 2) - tur - asama + 12) % 3);
        } else {
          const count = await p.locator('.taslar i').count();
          for (let j = 0; j < count; j++) await tik(p, '.parca');
        }
      } else {
        if (n === 0) {
          await p.getByRole('button', {name: 'Ay', exact: true}).click();
        } else if (n === 10 || n === 14) {
          const seq = n === 10 ? [2, 0] : [3, 0, 1];
          for (const i of [...seq, ...seq]) await tik(p, '.parca', i);
        } else if (tur === 3) {
          for (const ad of [['Ay'], ['Ay', 'Yıldız'], ['Zil', 'Zil'], ['Zil', 'Güneş', 'Ay']][asama])
            await p.getByRole('button', {name: ad, exact: true}).click();
        } else {
          await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 14000 });
          for (let j = 0; j < 2 + asama; j++)
            await tik(p, '.parca', (tur + j + (asama >= 2 ? Math.floor(j / 2) : 0)) % Math.min(4, asama + 2));
        }
      }
      await expect
        .poll(() => p.evaluate((id) => JSON.parse(localStorage['minkino-matematik-1-' + id]).adim, id), {
          timeout: 10000,
        })
        .toBe(n + 1);
      if (n < 15) await expect(p.locator('.basari')).toHaveCount(0, { timeout: 8500 });
      if (n === 4) {
        await p.reload();
        await tik(p, '.kose', k);
      }
    }
    await expect(p.locator('.hatira')).toBeVisible();
    expect(hatalar).toEqual([]);
  });

// Aynı turda ekran yönü değişse veya sayfa yenilense de tamamlanan hareket korunur.
test('Paylaşma turunda dokunma, gerçek sürükleme, yön değişimi ve yeniden açma', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam:true, adim: 2, yer: 0, secimler: [] })),
  );
  await p.reload();
  await tik(p, '.kose');
  const sol = p.locator('.sofra .tabak').first();
  await p.locator('.pay-meyvesi').first().dragTo(sol);
  await expect(sol.locator('img')).toHaveCount(1);
  await p.setViewportSize({ width: 390, height: 844 });
  await expect(p.locator('.telefonu-cevir')).toBeVisible();
  await expect(p.locator('#sahne')).toBeHidden();
  await p.setViewportSize({ width: 844, height: 390 });
  await tik(p, '.sofra .tabak');
  await expect(sol.locator('img')).toHaveCount(1);
  await p.reload();
  await tik(p, '.kose');
  await expect(sol.locator('img')).toHaveCount(1);
  await tik(p, '.sofra .tabak', 1);
  await expect(p.locator('.basari')).toHaveCount(1);
});
test('Fenerin ses düğmesi sırayı çalar, erken dokunma veya yanlış sıra puan vermez', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() => localStorage.setItem('minkino-matematik-1-fener', JSON.stringify({adim: 2, yer: 0, secimler: []})));
  await p.reload();
  await tik(p, '.kose', 3);
  await expect(p.locator('.tezgah')).toHaveAttribute('inert', '');
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 1);
  await expect(p.locator('.tezgah')).toHaveAttribute('inert', '');
  await tik(p, '.nav.ses');
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 0);
  await p.reload();
  await tik(p, '.kose', 3);
  await expect(p.locator('.fener-sira img')).toHaveCount(1);
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 1);
  await expect(p.locator('.basari')).toBeVisible();
});
test('Boncuklar birlikte kayar, geriye itilebilir ve yerinde kalır', async ({ page: p }) => {
  await p.goto('/matematik/');
  await tik(p, '.k0');
  await tik(p, '.boncuk', 3);
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(4);
  await p.reload();
  await tik(p, '.k0');
  await tik(p, '.boncuk', 1);
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(1);
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toBeVisible();
});

test('Rakamın yarım kalan kalem izi geri gelir, hatalı başlangıç iz bırakmaz', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam:true, adim: 7, yer: 0, secimler: [1] })),
  );
  await p.reload();
  await tik(p, '.k0');
  const yol = p.locator('.yazi-iz').first();
  const noktalar = await yol.evaluate((el) => {
    const path = el as SVGPathElement,
      mat = path.getScreenCTM()!;
    return Array.from({ length: 11 }, (_, i) => {
      const v = path.getPointAtLength(i * 4).matrixTransform(mat);
      return [v.x, v.y];
    });
  });
  await p.mouse.move(noktalar[0][0], noktalar[0][1]);
  await p.mouse.down();
  for (const [x, y] of noktalar) await p.mouse.move(x, y);
  await p.mouse.up();
  const iz = await p
    .locator('.yazi-murekkep')
    .first()
    .evaluate((el) => (el as SVGElement).style.strokeDashoffset);
  expect(Number(iz)).toBeLessThan(1);
  expect(Number(iz)).toBeGreaterThan(0);
  await p.reload();
  await tik(p, '.k0');
  await expect(p.locator('.yazi-murekkep').first()).toHaveCSS('stroke-dashoffset', iz + 'px');
});

test('Bitmiş masaya dönüşte sıra değişir ve hatıra korunur', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem(
      'minkino-matematik-1-fener',
      JSON.stringify({ adim: 16, yer: 0, secimler: [], hatira: true }),
    ),
  );
  await p.reload();
  await expect(p.locator('.k3 .kazanilan')).toBeVisible();
  await tik(p, '.k3');
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 1);
  await tik(p, '.parca', 1);
  await expect(p.locator('.fener-sira img')).toHaveCount(1);
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 0);
  await expect(p.locator('.basari')).toBeVisible();
});
test('Terazideki birimler kefeye basar ve denge ancak iki taraf eşitken onaylanır', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 11, yer: 0, secimler: [] })),
  );
  await p.reload();
  await tik(p, '.k2');
  await p.setViewportSize({ width: 844, height: 390 });
  const resimler = p.locator('.kefe.sol span img');
  const aralik = await resimler.evaluateAll((els) => {
    const r = els.map((el) => el.getBoundingClientRect());
    return Math.abs(r[4].bottom - r[0].top);
  });
  expect(aralik).toBeLessThan(2);
  for (let i = 0; i < 6; i++) await tik(p, '.tezgah .parca');
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.kefe.sag');
  await expect(p.locator('.kefe.sag span img')).toHaveCount(5);
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toBeVisible();
});

test('Manavda çocuk meyveleri doğru raflara dağıttıktan sonra en çok olanı bulur', async ({ page: p }) => {
  test.setTimeout(60000);
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 9, yer: 0, secimler: [] })),
  );
  await p.reload();
  await tik(p, '.k2');
  await tik(p, '.sutun', 0);
  await expect(p.locator('.basari')).toHaveCount(0);
  const tasinacak = p.getByRole('button', {name: 'Armut meyvesini rafa taşı', exact: true});
  await tasinacak.dragTo(p.getByRole('button', {name: 'Armut rafı', exact: true}));
  await expect
    .poll(() => p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-olcu']).secimler))
    .toEqual([1]);
  await p.reload();
  await tik(p, '.k2');
  await tik(p, '.sutun', 2);
  await tik(p, '.sutun', 0);
  await expect(p.locator('.manav-meyvesi')).toHaveCount(0);
  await tik(p, '.sutun', 2);
  await expect(p.locator('.basari')).toBeVisible();
});

test('Telefonun geri düğmesi atölyeye döner ve park edilen turu korur', async ({ page: p }) => {
  await p.goto('/matematik/');
  await tik(p, '.k0');
  await tik(p, '.boncuk', 1);
  const islendi = await p.evaluate(
    () => !window.dispatchEvent(new CustomEvent('minkino:geri', { cancelable: true })),
  );
  expect(islendi).toBe(true);
  await expect(p.locator('.kose')).toHaveCount(4);
  await tik(p, '.k0');
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(2);
});

test('Son şekilden sonra uygulamaya dönüş kazanılan hatırayı açar', async ({ page }) => {
  await page.goto('/matematik/');
  await page.evaluate(() => localStorage.setItem('minkino-matematik-1-sekil', JSON.stringify({
    adim: 15, yer: 0, secimler: [], gezginBulunan: [0, 1, 2, 3, 4, 5],
  })));
  await page.reload();
  await page.getByRole('button', { name: 'Şekil atölyesi', exact: true }).click();
  await page.getByRole('button', { name: 'Burun', exact: true }).click();
  await expect(page.getByRole('status', {name: 'Tamamlandı'})).toBeVisible({timeout: 8000});
  await page.evaluate(() => {
    for (const arkada of [true, false])
      window.dispatchEvent(new CustomEvent('minkino:arkaplan', {detail: {arkada}}));
  });
  await expect(page.locator('.hatira')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-sekil']).adim)).toBe(16);
});
test('İpucu doğru şekilden hedef gölgeye başlar', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-sekil', JSON.stringify({ adim: 1, yer: 0, secimler: [] })),
  );
  await p.reload();
  await tik(p, '.k1');
  await p.emulateMedia({ reducedMotion: 'no-preference' });
  const ok = p.locator('.dokunma-izi');
  await expect(ok).toBeAttached({ timeout: 12000 });
  const sapma = await ok.evaluate((el) => {
    const src = document.querySelector<HTMLImageElement>('.sirada img')!.src;
    const btn = [...document.querySelectorAll<HTMLButtonElement>('.parca')].find(
      (b) => b.querySelector('img')?.src === src,
    )!;
    const r = btn.getBoundingClientRect(),
      parent = document.querySelector('#sahne')!.getBoundingClientRect();
    return Math.abs(parseFloat((el as HTMLElement).style.left) - (r.left + r.width / 2 - parent.left));
  });
  expect(sapma).toBeLessThan(2);
});
