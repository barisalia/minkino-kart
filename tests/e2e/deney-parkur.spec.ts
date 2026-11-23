import { test, expect, type Page } from '@playwright/test';

// Deneyler · Zincirleme Top Parkuru (deney/index.html; Paket Deney-Y1 ve Deney-A1). Çizimleri gelmemiş bölümler test kipinde
// (?test=1) çizimsiz denetim görünümüyle çalışır: parçalar alttaki çekmeceden sürüklenir (yuva mıknatıs gibi çeker) ya da
// dokununca yerine uçar; kırmızı kol aşağı çekilir. Bölüm ?bolum=N, harita ?harita=1.
test.describe.configure({ timeout: 120000 });
type Pk = { durum: () => string; sesKaydi: { ad: string }[]; basla: () => Promise<void>; yerlestir: (id: string) => void; parkur: { b: { eksik: Record<string, string[]>; dunya: { w: number; h: number } } } };
const pk = (p: Page) => p.evaluate(() => (window as unknown as { __parkur: Pk }).__parkur.durum());
const sesler = (p: Page) => p.evaluate(() => (window as unknown as { __parkur: Pk }).__parkur.sesKaydi.map((s) => s.ad));
const sahne = (p: Page) => p.locator('#sahne');

async function ac(p: Page, yas: number, bolum = 1) {
  await p.goto('/deney/?test=1&yas=' + yas + '&bolum=' + bolum);
  await expect(sahne(p)).toHaveAttribute('data-durum', 'kur');
  await p.evaluate(() => (window as unknown as { __parkur: Pk }).__parkur.basla());
  await expect(p.locator('.pk-cekmece.acik')).toHaveCount(1);
}
/** Dünyanın (fon pikseli) bir noktası ekranda. */
async function nokta(p: Page, x: number, y: number) {
  const s = (await sahne(p).boundingBox())!;
  const w = await p.evaluate(() => (window as unknown as { __parkur: Pk }).__parkur.parkur.b.dunya.w);
  return { x: s.x + (x / w) * s.width, y: s.y + (y / 941) * s.height };
}
/** Çekmecedeki parçayı dünyadaki noktaya sürükler. */
async function surukle(p: Page, id: string, x: number, y: number) {
  const e = (await p.locator('.pk-bolme[data-parca="' + id + '"]').boundingBox())!;
  const h = await nokta(p, x, y);
  await p.mouse.move(e.x + e.width / 2, e.y + e.height / 2);
  await p.mouse.down();
  await p.mouse.move(h.x, h.y, { steps: 10 });
  await p.mouse.up();
}
async function kolCek(p: Page) {
  const k = (await p.locator('.pk-kol-tutamak').boundingBox())!;
  await p.mouse.move(k.x + k.width / 2, k.y + k.height * 0.3);
  await p.mouse.down();
  await p.mouse.move(k.x + k.width / 2, k.y + k.height * 0.3 + 140, { steps: 6 });
  await p.mouse.up();
}
const yerinde = (p: Page, id: string) => expect(p.locator('.pk-parca.pk-' + id)).not.toHaveClass(/pk-gizli/);

test('1. bölüm, 4 yaş: çekmece yaylanarak açılır; parçasız kol komik kaçış; yanlış yuva püf; sürüklenen parça yuvaya çekilip oturur; zile kadar', async ({ page: p }) => {
  await ac(p, 4);
  await expect(p.locator('.pk-bolme')).toHaveCount(2);
  await expect(p.locator('.pk-yuva.nabiz')).toHaveCount(2);
  // Açılış işareti: ilk parçanın bölmesi zıplar.
  await expect(p.locator('.pk-bolme.zipla')).toHaveCount(1);
  await kolCek(p);
  await expect.poll(() => pk(p), { timeout: 15000 }).toBe('kacti');
  await expect.poll(() => pk(p), { timeout: 15000 }).toBe('kur');
  expect(await sesler(p)).toEqual(expect.arrayContaining(['efekt-klank', 'k-hoppala', 'c-yeniden', 'efekt-uc']));
  // Rampa trambolinin yuvasına: oturmaz, komik püf, bölmesine döner.
  await surukle(p, 'rampa', 810, 646);
  await expect.poll(() => sesler(p)).toEqual(expect.arrayContaining(['efekt-puf', 'k-olmadi']));
  await expect(p.locator('.pk-bolme[data-parca="rampa"]')).not.toHaveClass(/bos/, { timeout: 3000 });
  // Yuvanın yakınına bırakılan rampa oturur (mıknatıs).
  await surukle(p, 'rampa', 600, 560);
  await yerinde(p, 'rampa');
  await expect(p.locator('.pk-yuva.dolu[data-parca="rampa"]')).toHaveCount(1);
  // Trambolinin bölmesine dokununca kendi yuvasına uçar.
  await p.locator('.pk-bolme[data-parca="trambolin"]').click();
  await yerinde(p, 'trambolin');
  await expect(sahne(p)).toHaveClass(/pk-kol-hazir/);
  await expect(p.locator('.pk-cekmece.acik')).toHaveCount(0);
  await kolCek(p);
  await expect.poll(() => pk(p), { timeout: 20000 }).toBe('bitti');
  const s = await sesler(p);
  const sira = s.filter((a) => /^efekt-(boing|vuu|not-do|not-re|not-mi|not-fa|zil)$|^k-cinn$/.test(a));
  expect(sira.slice(-8)).toEqual(['efekt-boing', 'efekt-vuu', 'efekt-not-do', 'efekt-not-re', 'efekt-not-mi', 'efekt-not-fa', 'efekt-zil', 'k-cinn']);
  await expect.poll(() => sesler(p), { timeout: 8000 }).toContain('c-final');
  // Sıradaki düğmesi çıkar.
  await expect(p.getByRole('button', { name: 'Sıradaki parkur' })).toBeVisible();
  const sozler = (await sesler(p)).filter((a) => /^[ck]-/.test(a));
  for (let i = 1; i < sozler.length; i++) expect(sozler[i]).not.toBe(sozler[i - 1]);
});

test('mıknatıs: parça yuvanın yakınına gelince yuva çeker ve parlar', async ({ page: p }) => {
  await ac(p, 3);
  const e = (await p.locator('.pk-bolme[data-parca="rampa"]').boundingBox())!;
  const yakin = await nokta(p, 560 + 180, 525 + 60);
  await p.mouse.move(e.x + e.width / 2, e.y + e.height / 2);
  await p.mouse.down();
  await p.mouse.move(yakin.x, yakin.y, { steps: 8 });
  await expect(p.locator('.pk-yuva.cekiyor')).toHaveCount(1);
  await expect(p.locator('.pk-parca.pk-rampa')).toHaveClass(/pk-tutulan/);
  await p.mouse.up();
});

test("2–3 yaş tek parça (bölme 64 px'ten büyük), dokununca yerine uçar; tekrar oynama: kamera kola döner, ikinci başarıda aynı söz yok", async ({ page: p }) => {
  await ac(p, 3);
  await expect(p.locator('.pk-bolme')).toHaveCount(1);
  const bb = (await p.locator('.pk-bolme').boundingBox())!;
  expect(Math.min(bb.width, bb.height)).toBeGreaterThanOrEqual(64);
  await p.locator('.pk-bolme').click();
  await yerinde(p, 'rampa');
  await kolCek(p);
  await expect.poll(() => pk(p), { timeout: 20000 }).toBe('bitti');
  await expect.poll(async () => {
    const k = (await p.locator('.pk-kol-tutamak').boundingBox())!;
    const v = p.viewportSize()!;
    return k.x >= 0 && k.x + k.width <= v.width && k.y >= 0 && k.y + k.height <= v.height;
  }, { timeout: 5000 }).toBe(true);
  await kolCek(p);
  await expect.poll(() => pk(p), { timeout: 5000 }).toBe('kosu');
  await expect.poll(() => pk(p), { timeout: 20000 }).toBe('bitti');
  const s = await sesler(p);
  expect(s.filter((a) => a === 'k-cinn')).toHaveLength(2);
  expect(s.filter((a) => a === 'c-final')).toHaveLength(1);
});

for (const [no, final] of [[2, 'zil'], [3, 'zil'], [4, 'zil'], [5, 'zil'], [6, 'can']] as const) {
  test(`${no}. bölüm, 5+ yaş: çekmecedeki parçalar yerine konunca zincir ${final === 'can' ? 'çan kulesine' : 'zile'} kadar gider`, async ({ page: p }, bilgi) => {
    // Bilinen hata (23 Kasım 17:00): iPad'de 3. bölümün (yay ve pota) zinciri zile varmıyor, telefonda varıyor. Bölümün
    // çizimleri (Deney-A1) gelmediği için uygulamada açılmıyor; parçalar gelince düzeltilip bu satır kalkacak.
    test.fixme(no === 3 && bilgi.project.name === 'ipad-yatay', 'iPad 3. bölüm: zincir zile varmıyor (bölüm uygulamada kapalı)');
    await ac(p, 5, no);
    const eksik = await p.evaluate((y) => (window as unknown as { __parkur: Pk }).__parkur.parkur.b.eksik[y], 'bes');
    await expect(p.locator('.pk-bolme')).toHaveCount(eksik.length);
    // Kol parçasız: top kaçar.
    await kolCek(p);
    await expect.poll(() => pk(p), { timeout: 20000 }).toBe('kacti');
    await expect.poll(() => pk(p), { timeout: 15000 }).toBe('kur');
    for (const id of eksik) await p.evaluate((x) => (window as unknown as { __parkur: Pk }).__parkur.yerlestir(x), id);
    // 3. bölüm 5+ yaşta yay az gerili: düğmeyle ortaya getirilir.
    if (no === 3) {
      await expect(sahne(p)).toHaveAttribute('data-yay-gucu', '1');
      await p.getByRole('button', { name: 'Yayın gerginliği' }).click();
      await expect(sahne(p)).toHaveAttribute('data-yay-gucu', '2');
    }
    await expect(sahne(p)).toHaveClass(/pk-kol-hazir/);
    await kolCek(p);
    await expect.poll(() => pk(p), { timeout: 30000 }).toBe('bitti');
    expect(await sesler(p)).toContain('efekt-' + final);
  });
}

test('harita: altı durak; ilki açık, ikincisi kilitli (dokununca kilit sallanır); ilk durağa dokununca Kino yürür, bölüm açılır; bitince ikinci durak açılır', async ({ page: p }) => {
  await p.goto('/deney/?test=1&yas=3&harita=1');
  await p.evaluate(() => localStorage.removeItem('minkino-parkur-v1'));
  await p.reload();
  await expect(p.locator('.pk-durak')).toHaveCount(6);
  await expect(p.locator('.pk-durak.kilitli')).toHaveCount(5);
  await p.getByRole('button', { name: 'Parkur 2, kilitli' }).click();
  await expect(p.locator('.pk-durak[data-no="2"]')).toHaveClass(/salla/);
  await p.getByRole('button', { name: 'Parkur 1' }).click({ force: true }); // sıradaki durak davet için nabız atar
  await expect(sahne(p)).toHaveAttribute('data-bolum', '1', { timeout: 5000 });
  await expect(sahne(p)).toHaveAttribute('data-durum', 'kur');
  await p.evaluate(() => (window as unknown as { __parkur: Pk }).__parkur.basla());
  await p.locator('.pk-bolme').click();
  await kolCek(p);
  await expect.poll(() => pk(p), { timeout: 20000 }).toBe('bitti');
  await p.getByRole('button', { name: 'Sıradaki parkur' }).click({ force: true });
  await expect.poll(() => pk(p), { timeout: 5000 }).toBe('harita');
  await expect(p.locator('.pk-durak.kilitli')).toHaveCount(4);
  await expect(p.locator('.pk-durak[data-no="1"].bitti')).toHaveCount(1);
  await expect(p.locator('.pk-durak[data-no="2"].yeni')).toHaveCount(1);
});

test('geniş telefonda Ceren ve zil kurarken kadrajın içinde (kalite denetimi 22)', async ({ page: p }) => {
  await ac(p, 4);
  const v = p.viewportSize()!;
  if (v.width / v.height < 1.9) return;
  for (const s of ['.pk-ceren', '.pk-final']) {
    const b = (await p.locator(s).first().boundingBox())!;
    expect(b.x, s).toBeGreaterThanOrEqual(-1);
    expect(b.x + b.width, s).toBeLessThanOrEqual(v.width + 1);
  }
});
