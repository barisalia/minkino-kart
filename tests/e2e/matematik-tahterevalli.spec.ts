import { test, expect, type Page } from '@playwright/test';

// Ölçü tezgâhı turu "Bulut'un Tahterevalli Dengesi" (matematik/src/tahterevalli.ts). Astra'nın M13 çizimleri gelene dek yalnız
// test kipinde (?test=1&tahterevalli=1), çizim yerinde adı yazılı kutularla. Ölçü tezgâhının tur sırasına bağlama satırını
// Matematik oturumu ekler; o güne dek test turu #sahne'ye kendisi kurar (main.ts'teki dersler gibi: ekran 'ceren' + tur).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });
declare global { interface Window { __tvBitti?: boolean; __tahterevalliSesleri?: string[]; __tvGorunur?: boolean } }

async function ac(p: Page, yas: Record<string, unknown>, tekrar = 0, adres = '/matematik/?test=1&tahterevalli=1&hizli=1') {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript((y) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ ...y, ayarlar: { muzik: false } }));
  }, yas);
  await p.goto(adres);
  await p.waitForLoadState('load');
  await p.addScriptTag({
    type: 'module',
    content: `import { tahterevalliTuru, tahterevalliGorunur } from '/matematik/src/tahterevalli.ts';
      window.__tvGorunur = tahterevalliGorunur;
      if (tahterevalliGorunur) {
        const kok = document.querySelector('#sahne');
        kok.replaceChildren(); kok.dataset.ekran = 'ceren'; kok.style.backgroundImage = 'none';
        tahterevalliTuru({ kok, sesiAc() {}, tekrarDinle() {}, bitir() { window.__tvBitti = true; }, tekrar: ${tekrar} });
      }`,
  });
  await p.waitForFunction(() => '__tvGorunur' in window, undefined, { timeout: 30000 });
}
const dunya = (p: Page) => p.locator('.tv-dunya');
const okunan = (p: Page) => p.evaluate(() => window.__tahterevalliSesleri ?? []);
const koy = (p: Page) => p.locator('.tv-yigin-kup').first().click();
const aciDegeri = async (p: Page) => Number(await p.locator('.tv-kol').getAttribute('data-aci'));

test('5+ yaş: her küpte tahta düzelir; fazlada Bulut kıkırdar, küp geri alınır; dört küp denge; ikinci tur iki nesneyle altı küp', async ({ page: p }) => {
  await ac(p, { yas: 5 });
  await expect(dunya(p)).toHaveAttribute('data-hedef', '4');
  await expect(dunya(p)).toHaveAttribute('data-durum', 'agir');
  await expect(p.locator('.tv-nesne[data-ad="sulama-kabi"]')).toBeHidden();
  const acilar = [await aciDegeri(p)];
  for (let i = 1; i <= 3; i++) {
    await koy(p);
    await expect(dunya(p)).toHaveAttribute('data-kup', String(i));
    acilar.push(await aciDegeri(p));
  }
  // Sol aşağıda başlar (eksi), her küpte düzelir.
  expect(acilar[0]).toBeLessThan(-10);
  for (let i = 1; i < acilar.length; i++) expect(acilar[i]).toBeGreaterThan(acilar[i - 1]);
  // Dördüncü küpten hemen sonra bir küp daha (denge tahta oturunca onaylanır): sol uç havalanır, Bulut kıkırdar,
  // Ceren "bir küpü geri al" der (bir kez).
  await p.locator('.tv-yigin-kup').nth(0).click();
  await p.locator('.tv-yigin-kup').nth(0).click();
  await expect(dunya(p)).toHaveAttribute('data-durum', 'fazla');
  expect(await aciDegeri(p)).toBeGreaterThan(0);
  await expect(p.locator('.tv-bulut')).toHaveAttribute('data-poz', 'kikirda');
  await expect.poll(() => okunan(p).then((o) => o.filter((x) => x === 'fazla').length)).toBe(1);
  // Tahtadaki küpe dokununca yığına döner; dört küp: denge.
  await p.locator('.tv-kup').last().click();
  await expect.poll(() => okunan(p).then((o) => o.includes('denge_4'))).toBe(true);
  // (Dengede açı 0: birim testi. Hızlı test kipinde ikinci tur hemen başladığı için burada tahta yeniden yatık olabilir.)
  // İkinci tur: balkabağının yanında sulama kabı, altı küp.
  await expect(dunya(p)).toHaveAttribute('data-hedef', '6', { timeout: 15000 });
  await expect(p.locator('.tv-nesne[data-ad="sulama-kabi"]')).toBeVisible();
  for (let i = 1; i <= 6; i++) { await koy(p); await expect(dunya(p)).toHaveAttribute('data-kup', String(i)); }
  await expect.poll(() => p.evaluate(() => window.__tvBitti === true), { timeout: 20000 }).toBe(true);
  const o = await okunan(p);
  expect(o).toEqual(expect.arrayContaining(['giris', 'fazla', 'denge_4', 'ikinci', 'denge_6', 'bitis']));
  for (const id of new Set(o)) expect(o.filter((x) => x === id).length, id).toBe(1);
});

test('2–3 yaş: iki küp, tek tur; 4 yaşta yeniden oynayışta dört küp', async ({ page: p }) => {
  await ac(p, { yas: 3, ikiYas: true });
  await expect(dunya(p)).toHaveAttribute('data-hedef', '2');
  await koy(p);
  await koy(p);
  await expect.poll(() => p.evaluate(() => window.__tvBitti === true), { timeout: 20000 }).toBe(true);
  expect(await okunan(p)).toEqual(['giris', 'denge_2', 'bitis']);
  const p4 = await p.context().newPage();
  await ac(p4, { yas: 4 }, 1);
  await expect(dunya(p4)).toHaveAttribute('data-hedef', '4');
});

test('dokunulan küpler ekranda, telefonda ≥44 px; uygulamada açık, test kipinde yalnız parametreyle', async ({ page: p }) => {
  await ac(p, { yas: 5 });
  await koy(p);
  await koy(p);
  const ekran = p.viewportSize()!;
  const kutular = await p.locator('.tv-yigin-kup, .tv-kup').evaluateAll((l) => l.map((e) => e.getBoundingClientRect().toJSON()));
  expect(kutular.length).toBeGreaterThan(3);
  for (const r of kutular) {
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(ekran.width);
    expect(r.top).toBeGreaterThanOrEqual(0);
    expect(r.bottom).toBeLessThanOrEqual(ekran.height);
    expect(Math.min(r.width, r.height)).toBeGreaterThanOrEqual(44);
  }
  // M13'ün 10 çizimi ve 10 kayıt tamam: uygulamada açık; test kipinde yalnız ?tahterevalli=1 ile.
  for (const [adres, acik] of [['/matematik/', true], ['/matematik/?test=1', false]] as const) {
    const s = await p.context().newPage();
    await ac(s, { yas: 5 }, 0, adres);
    expect(await s.evaluate(() => window.__tvGorunur)).toBe(acik);
    await s.close();
  }
});
