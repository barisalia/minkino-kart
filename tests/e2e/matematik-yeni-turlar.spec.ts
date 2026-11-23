import { test, expect, type Page } from '@playwright/test';

// Yeni oyuncak turları (matematik/src/yeni-turlar.ts, main.ts): sırada aynı türün ikinci kez geldiği turun yerine geçer.
// Test kipinde ?test=1&yeniturlar=1 ile açılır (uygulamada Astra M10–M12 çizimleri ve Ceren sözleri tamamsa).
test.use({ reducedMotion: 'reduce' });
test.describe.configure({ timeout: 120000 });

/**
 * Kayıt fikstürü. `tekrar`: oyuncağa kaçıncı geliş (derinlik.ts: 0 kolay, 1 orta, 2+ zor). `zor`: yaşın akıllı tekrar
 * defterinde zorlanılan sayılar (yeni turlar bunları öne alır).
 */
async function ac(p: Page, yas: number, kose: string, adim: number, adres = '/matematik/?test=1&yeniturlar=1', ek: { tekrar?: number; zor?: number[] } = {}) {
  const ekran = p.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await p.setViewportSize({ width: ekran.height, height: ekran.width });
  await p.addInitScript(([y, kk, a, tekrar, zor]) => {
    if (sessionStorage.getItem('kuruldu')) return;
    sessionStorage.setItem('kuruldu', '1');
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true }));
    const onek = y < 4 ? 'minik-' : y === 4 ? 'dort-' : '';
    localStorage.setItem('minkino-matematik-1-' + onek + kk, JSON.stringify({ adim: a, yer: 0, secimler: [], kuleTamam: true, misketiGecti: true, surum: 3, tekrar }));
    if (zor.length) localStorage.setItem('minkino-matematik-tekrar-' + (y < 4 ? 'minik' : y === 4 ? 'dort' : 'bes') + '-v1', JSON.stringify(Object.fromEntries(zor.map((n, i) => [n, { y: 1, d: 0, s: zor.length - i }]))));
  }, [yas, kose, adim, ek.tekrar ?? 0, ek.zor ?? []] as const);
  await p.goto(adres);
}
const kayit = (p: Page, anahtar: string) => p.evaluate((a) => JSON.parse(localStorage.getItem(a) || 'null'), anahtar);
const kase = (p: Page, i: number) => p.locator('.ik-kase-' + i);
async function paylas(p: Page, kino: number, lokum: number) {
  await expect(p.locator('.ik-orta .ik-mandalina')).toHaveCount(kino + lokum, { timeout: 15000 });
  for (let i = 0; i < kino; i++) await kase(p, 0).click();
  for (let i = 0; i < lokum; i++) await kase(p, 1).click();
}

test('4 yaş · Lokum\'un İki Kâsesi: dört mandalina iki farklı biçimde paylaşılır; tek tarafa ya da aynı bölüşüm sayılmaz', async ({ page: p }) => {
  // 4 yaş Sayı masası sırasının 7. adımı (tur 6, ikinci "say") Lokum'a döner.
  await ac(p, 4, 'sayi', 6, undefined, { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  const sahne = p.locator('.ik-sahne');
  await expect(sahne).toHaveAttribute('data-toplam', '4');
  // Hepsi Kino'ya: "İkisine de ver!", mandalinalar ortaya döner.
  await paylas(p, 4, 0);
  await expect(p.locator('.ik-orta .ik-mandalina')).toHaveCount(4, { timeout: 10000 });
  await expect(sahne).toHaveAttribute('data-bolusum', '0');
  // İki ve iki: ilk bölüşüm; toplam ortada rakam bloğuyla, iki sayı kâselerin altında.
  await paylas(p, 2, 2);
  await expect(sahne).toHaveAttribute('data-bolusum', '1');
  await expect(p.locator('.ik-kase-0 .ik-sayi img')).toHaveCount(1);
  // Aynı bölüşüm ikinci kez sayılmaz.
  await paylas(p, 2, 2);
  await expect(p.locator('.ik-orta .ik-mandalina')).toHaveCount(4, { timeout: 15000 });
  await expect(sahne).toHaveAttribute('data-bolusum', '1');
  // Üç ve bir: ikinci farklı bölüşüm; ikisi yer, tur biter.
  await paylas(p, 3, 1);
  // Ceren iki sayıyı okuyup bitirince ikisi yer (ses süresine bağlı).
  await expect(p.locator('.ik-dost[data-poz="1"]')).toHaveCount(2, { timeout: 20000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sayi')).adim, { timeout: 15000 }).toBe(7);
});

test('5+ yaş · Lokum yedi mandalinayla ("4 + 3" turunun yerine; 5. geliş); yarıda yenilense de biten bölüşüm sayılır', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 5, undefined, { tekrar: 4 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.ik-sahne')).toHaveAttribute('data-toplam', '7');
  await paylas(p, 4, 3);
  await expect(p.locator('.ik-sahne')).toHaveAttribute('data-bolusum', '1');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([4, 3]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.ik-sahne')).toHaveAttribute('data-bolusum', '1');
  await paylas(p, 5, 2);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('çizimler gelmeden uygulamada ve yeniturlar parametresi olmadan eski tur oynar', async ({ page: p }) => {
  await ac(p, 4, 'sayi', 6, '/matematik/?test=1');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('#sahne')).not.toHaveAttribute('data-ekran', 'menu');
  await expect(p.locator('.ik-sahne')).toHaveCount(0);
});

// ----- Zıpzıp'ın Saklı Fındıkları -----
const sf = (p: Page) => p.locator('.sf-sahne');
const rakam = (p: Page, n: number | string) => p.locator('.sf-rakam[aria-label="' + n + '"]');
async function hepsiniSay(p: Page, n: number) {
  await expect(sf(p)).toHaveAttribute('data-adim', 'say');
  await expect(p.locator('.sf-findik')).toHaveCount(n);
  for (let i = 0; i < n; i++) await p.locator('.sf-findik').nth(i).click();
  await expect(p.locator('.sf-findik.sayildi')).toHaveCount(n);
}
const soruBekle = (p: Page, no: number) => expect(p.locator('.sf-sahne[data-adim="sor"][data-soru="' + no + '"]')).toHaveCount(1, { timeout: 20000 });

test('4 yaş · Zıpzıp: beş fındık sayılır, ikisi sepete saklanır; yanlışta ipucu, doğruda sepet kalkar; sonra öbür üçü saklanır', async ({ page: p }) => {
  // 4 yaş Sayı masasında Zıpzıp ek tur: eski on turdan ve Elma Sandıkları'ndan sonra (adım 11).
  await ac(p, 4, 'sayi', 11, undefined, { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(sf(p)).toHaveAttribute('data-toplam', '5');
  // Sayarken sepet yok, seçenek yok; aynı fındığa ikinci dokunuş sayılmaz.
  await expect(p.locator('.sf-rakam')).toHaveCount(0);
  await p.locator('.sf-findik').first().click();
  await p.locator('.sf-findik').first().click();
  await expect(p.locator('.sf-findik.sayildi')).toHaveCount(1);
  for (let i = 1; i < 5; i++) await p.locator('.sf-findik').nth(i).click();
  await expect(p.locator('.sf-toplam.acik')).toBeVisible({ timeout: 15000 });
  await soruBekle(p, 0);
  await expect(sf(p)).toHaveAttribute('data-gizli', '2');
  await expect(p.locator('.sf-findik.altinda')).toHaveCount(2);
  await expect(p.locator('.sf-sepet')).toHaveAttribute('data-durum', 'asagi');
  await expect(p.locator('.sf-rakam')).toHaveCount(3);
  // Yanlış: buton solar, soru sürer.
  await rakam(p, 3).click();
  await expect(rakam(p, 3)).toHaveClass(/soluk/);
  await expect(sf(p)).toHaveAttribute('data-adim', 'sor');
  // Doğru: sepet kalkar, gizliler görünür, kayıt.
  await rakam(p, 2).click();
  await expect(p.locator('.sf-findik.altinda')).toHaveCount(0);
  await expect(p.locator('.sf-zipzip')).toHaveAttribute('data-poz', '2');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sayi')).secimler).toEqual([2]);
  // İkinci soru: aynı beş fındık, bu kez üçü saklanır.
  await soruBekle(p, 1);
  await expect(sf(p)).toHaveAttribute('data-gizli', '3');
  await expect(p.locator('.sf-findik.altinda')).toHaveCount(3);
  await rakam(p, 3).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sayi')).adim, { timeout: 15000 }).toBe(12);
});

test('5+ yaş · Zıpzıp yedi fındıkla; yenilenince sayma atlanır, ikinci sorudan sürer; iki yanlışta cevap gösterilir', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 11, undefined, { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(sf(p)).toHaveAttribute('data-toplam', '7');
  await hepsiniSay(p, 7);
  await soruBekle(p, 0);
  await expect(sf(p)).toHaveAttribute('data-gizli', '3');
  await rakam(p, 3).click();
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([3]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.sf-toplam.acik')).toBeVisible();
  await expect(p.locator('.sf-findik.sayildi')).toHaveCount(0);
  await soruBekle(p, 1);
  await expect(sf(p)).toHaveAttribute('data-gizli', '4');
  await rakam(p, 3).click();
  await expect(sf(p)).toHaveAttribute('data-adim', 'sor');
  await rakam(p, 5).click();
  // İki yanlış: sepet kendiliğinden kalkar, doğru rakam yeşil, tur biter.
  await expect(rakam(p, 4)).toHaveClass(/dogru/, { timeout: 10000 });
  await expect(p.locator('.sf-findik.altinda')).toHaveCount(0);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(12);
});

// ----- Baba'nın Takım Çantası -----
const tc = (p: Page) => p.locator('.tc-sahne');
/** Seçili parçanın doğru kutusu (ölçüt renkte kırmızı, şekilde daire, boyda büyük: sol kutu). */
const dogruKutu = (p: Page) => p.evaluate(() => {
  const s = document.querySelector<HTMLElement>('.tc-sahne')!;
  const [renk, bicim, boy] = s.querySelector<HTMLElement>('.tc-parca.secili')!.dataset.parca!.split('-');
  const o = s.dataset.olcut;
  return o === 'renk' ? (renk === 'kirmizi' ? 0 : 1) : o === 'bicim' ? (bicim === 'daire' ? 0 : 1) : (boy === 'buyuk' ? 0 : 1);
});
async function yerlestir(p: Page, kac: number) {
  for (let i = 0; i < kac; i++) {
    const once = Number(await tc(p).getAttribute('data-yerlesen'));
    await p.locator('.tc-kutu-' + (await dogruKutu(p))).click();
    if (once + 1 < 6) await expect(tc(p)).toHaveAttribute('data-yerlesen', String(once + 1));
  }
}

test('2–3 yaş · Baba: parçalar renge göre ayrılır; yanlış kutu saymaz; başka parça seçilir; sürükleyerek de konur', async ({ page: p }) => {
  await ac(p, 3, 'sekil', 5);
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(tc(p)).toHaveAttribute('data-olcut', 'renk');
  await expect(p.locator('.tc-parca')).toHaveCount(6);
  await expect(p.locator('.tc-parca.secili')).toHaveCount(1);
  // Levhalarda yalnız rengi farklı iki örnek.
  await expect(p.locator('.tc-kutu-0 .tc-levha img')).toHaveAttribute('src', /kirmizi-kare-buyuk/);
  await expect(p.locator('.tc-kutu-1 .tc-levha img')).toHaveAttribute('src', /mavi-kare-buyuk/);
  // İlk parça kırmızı: sağ kutuya konmaz.
  await p.locator('.tc-kutu-1').click();
  await expect(tc(p)).toHaveAttribute('data-yerlesen', '0');
  // Başka bir parçaya dokunmak onu seçer.
  await p.locator('.tc-parca[data-parca="mavi-daire-buyuk"]').click();
  await expect(p.locator('.tc-parca[data-parca="mavi-daire-buyuk"]')).toHaveClass(/secili/);
  await p.locator('.tc-kutu-1').click();
  await expect(tc(p)).toHaveAttribute('data-yerlesen', '1');
  await expect(p.locator('.tc-kutu-1 .tc-ic img')).toHaveCount(1);
  // Sürükle bırak: seçili parça doğru kutuya.
  const parca = await p.locator('.tc-parca.secili').boundingBox();
  const kutu = await p.locator('.tc-kutu-' + (await dogruKutu(p))).boundingBox();
  await p.mouse.move(parca!.x + parca!.width / 2, parca!.y + parca!.height / 2);
  await p.mouse.down();
  await p.mouse.move(kutu!.x + kutu!.width / 2, kutu!.y + kutu!.height / 2, { steps: 10 });
  await p.mouse.up();
  await expect(tc(p)).toHaveAttribute('data-yerlesen', '2');
  await yerlestir(p, 4);
  await expect(p.locator('.tc-baba')).toHaveAttribute('data-poz', '1');
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-sekil')).adim, { timeout: 15000 }).toBe(6);
});

test('Baba\'da yanlış kutu konu defterine yazılır; tezgâhtaki "Büyükler için" sayfası zorlandığı konuları gösterir', async ({ page: p }) => {
  await ac(p, 5, 'sekil', 5);
  await p.evaluate(() => localStorage.setItem('minkino-matematik-konu-tekrar-bes-v1', JSON.stringify({ 'olcu:uzun-kisa': { y: 1, d: 0, s: 1 } })));
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(tc(p)).toHaveAttribute('data-olcut', 'bicim');
  // Aynı parçada iki yanlış bir kez yazılır.
  const yanlis = 1 - (await dogruKutu(p));
  await p.locator('.tc-kutu-' + yanlis).click();
  await p.locator('.tc-kutu-' + yanlis).click();
  await expect.poll(() => p.evaluate(() => JSON.parse(localStorage.getItem('minkino-matematik-konu-tekrar-bes-v1') || '{}')['siniflama:bicim']))
    .toMatchObject({ y: 1, d: 0 });
  await p.locator('.nav.ev').click();
  await p.getByRole('button', { name: 'Büyükler için', exact: true }).click();
  const soru = p.locator('.kapi-soru[data-toplam]');
  await expect(soru).toBeVisible();
  for (const r of (await soru.getAttribute('data-toplam'))!) await p.locator(`.kapi-perde .tus[aria-label="${r}"]`).click();
  await p.locator('.kapi-perde .tus.tamam').click();
  const v = p.locator('.mv-veli');
  const konular = v.locator('.mv-zor-konular li');
  await expect(konular).toHaveCount(2);
  expect(await konular.evaluateAll((l) => l.map((e) => e.getAttribute('data-alan')))).toEqual(['siniflama', 'olcu']);
  await expect(konular.first()).toContainText('şekle göre ayırma');
  await expect(konular.nth(1)).toContainText('uzun ve kısa');
  await expect(v.locator('.mv-zor-sayilar')).toHaveCount(0);
});

test('5+ yaş · Baba: önce şekle, sonra aynı parçalar boya göre; yarıda yenilenince ikinci ölçütten sürer', async ({ page: p }) => {
  await ac(p, 5, 'sekil', 5);
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(tc(p)).toHaveAttribute('data-olcut', 'bicim');
  await yerlestir(p, 6);
  await expect(tc(p)).toHaveAttribute('data-olcut', 'boy', { timeout: 10000 });
  await expect(tc(p)).toHaveAttribute('data-yerlesen', '0');
  await expect(p.locator('.tc-parca:not(.yerinde)')).toHaveCount(6);
  await expect(p.locator('.tc-kutu-0 .tc-levha img')).toHaveAttribute('src', /kirmizi-daire-buyuk/);
  await expect(p.locator('.tc-kutu-1 .tc-levha img')).toHaveAttribute('src', /kirmizi-daire-kucuk/);
  await yerlestir(p, 2);
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sekil')).secimler.length).toBe(8);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(tc(p)).toHaveAttribute('data-olcut', 'boy');
  await expect(tc(p)).toHaveAttribute('data-yerlesen', '2');
  await yerlestir(p, 4);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sekil')).adim, { timeout: 15000 }).toBe(6);
});

// ----- Bulut'un Tahterevalli Dengesi (tahterevalli.ts) Ölçü tezgâhında: ikinci denge turunun yerinde -----
test('4 yaş · Ölçü tezgâhında tahterevalli ek tur (terazi turları yerinde): üç küp denge, tur sayılır, hatıra gelir', async ({ page: p }) => {
  await ac(p, 4, 'olcu', 6, '/matematik/?test=1&tahterevalli=1&hizli=1');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  const dunya = p.locator('.tv-dunya');
  await expect(dunya).toHaveAttribute('data-hedef', '3');
  for (let i = 1; i <= 3; i++) {
    await p.locator('.tv-yigin-kup').first().click();
    await expect(dunya).toHaveAttribute('data-kup', String(i));
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-olcu')).adim, { timeout: 15000 }).toBe(7);
  await expect(p.locator('.hatira')).toBeVisible({ timeout: 20000 });
});

test('tahterevalli parametresi olmadan (test kipi) Ölçü tezgâhının denge turu eskisi gibi oynar', async ({ page: p }) => {
  await ac(p, 4, 'olcu', 5, '/matematik/?test=1');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(p.locator('#sahne')).toHaveAttribute('data-ekran', 'oyun');
  await expect(p.locator('.tv-dunya')).toHaveCount(0);
});

// ----- İçerik paketi M14–M24: test kipinde ?yenitur=<ad> (yerleşim verilene ve çizimler gelene dek adı yazılı kutularla) -----
const es = (p: Page) => p.locator('.es-sahne');
async function elmaTopla(p: Page, kac: number) {
  for (let i = 0; i < kac; i++) {
    await expect(es(p)).toHaveAttribute('data-durum', 'topla', { timeout: 15000 });
    const once = Number(await es(p).getAttribute('data-sayilan'));
    await p.locator('.es-elma:not([hidden])').first().click();
    await expect(es(p)).toHaveAttribute('data-sayilan', String(once + 1));
  }
}

test('5+ yaş · Dede\'nin Elma Sandıkları: defterde zorlanılan 13 öne alınır; onda sandık dolar, ikinci sandık; on ve üç; yenilenince sürer', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=sandik', { zor: [13] });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(es(p)).toHaveAttribute('data-toplam', '13');
  await expect(p.locator('.es-kap.es-sandik')).toHaveCount(2);
  await expect(p.locator('.es-goz')).toHaveCount(20);
  // Ağaçta aynı anda en çok on elma; ilk sandık dolunca kalan üçü belirir.
  await expect(p.locator('.es-elma:not([hidden])')).toHaveCount(10);
  await elmaTopla(p, 10);
  await expect(p.locator('.es-kap.dolu')).toHaveCount(1);
  // Ceren "Sandık doldu: on elma!" derken ağaç boş; söz bitince kalan üç elma belirir.
  await expect(es(p)).toHaveAttribute('data-durum', 'bekle');
  await expect(p.locator('.es-elma:not([hidden])')).toHaveCount(0);
  await expect(p.locator('.es-elma:not([hidden])')).toHaveCount(3, { timeout: 15000 });
  await elmaTopla(p, 1);
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([10, 1]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(es(p)).toHaveAttribute('data-sayilan', '11');
  await expect(p.locator('.es-goz > *')).toHaveCount(11);
  await expect(p.locator('.es-elma:not([hidden])')).toHaveCount(2);
  await elmaTopla(p, 2);
  // On ve üç: her sandığın üstünde kendi rakamı, sonra toplam iki basamakla.
  await expect(p.locator('.es-toplam.acik img')).toHaveCount(2, { timeout: 20000 });
  // 10 iki blokla (1 ve 0), 3 tek blokla.
  await expect(p.locator('.es-kap .es-rakam img')).toHaveCount(3);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(1);
});

test('2–3 yaş · Elma Sandıkları beşlik sepetle: dört elma, sonda rakam', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=sandik', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(es(p)).toHaveAttribute('data-toplam', '4');
  await expect(p.locator('.es-kap.es-sepet')).toHaveCount(1);
  await expect(p.locator('.es-goz')).toHaveCount(5);
  await elmaTopla(p, 4);
  await expect(p.locator('.es-toplam.acik img')).toHaveCount(1, { timeout: 20000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const kt = (p: Page) => p.locator('.kt-sahne');
const bayrak = (p: Page, n: number) => p.locator('.kt-bayrak[aria-label="' + n + '"]');
test('5+ yaş · Babaanne\'nin Kurabiye Tepsileri: defterdeki 13 öne alınır (dolu tepsi ve tabak); yanlış bayrakta birlikte sayılır; ikinci tepsi 11', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=kurabiye', { zor: [13] });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(kt(p)).toHaveAttribute('data-sayi', '13');
  await expect(p.locator('.kt-tepsi .kt-kurabiye')).toHaveCount(10);
  await expect(p.locator('.kt-tabak .kt-kurabiye')).toHaveCount(3);
  await expect(p.locator('.kt-bayrak')).toHaveCount(3);
  await bayrak(p, 12).click();
  await expect(bayrak(p, 12)).toHaveClass(/soluk/);
  await expect(kt(p)).toHaveAttribute('data-durum', 'bekle');
  await expect(kt(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  await bayrak(p, 13).click();
  await expect(p.locator('.kt-dikili')).toHaveCount(1);
  await expect(kt(p)).toHaveAttribute('data-sayi', '11', { timeout: 15000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([0]);
  // Yanlış bayraktan sonra 13 defterde kaldı; ikinci denemede doğru: defter güncel (yanlış sayısı 1).
  await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-tekrar-bes-v1') || '{}')))).toContain('13');
  await bayrak(p, 11).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(1);
});

test('2–3 yaş · Kurabiye Tepsileri: iki tepsi (3 ve 5), tabak yok, bayraklar 1–5 içinde', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=kurabiye', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(kt(p)).toHaveAttribute('data-sayi', '3');
  await expect(p.locator('.kt-tabak')).toHaveCount(0);
  for (const b of await p.locator('.kt-bayrak').all()) { const n = Number(await b.getAttribute('aria-label')); expect(n).toBeGreaterThanOrEqual(1); expect(n).toBeLessThanOrEqual(5); }
  await bayrak(p, 3).click();
  await expect(kt(p)).toHaveAttribute('data-sayi', '5', { timeout: 15000 });
  await bayrak(p, 5).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const st = (p: Page) => p.locator('.st-sahne');
const vagon = (p: Page, n: number) => p.locator('.st-bekleyen[aria-label="' + n + '"]');
test('5+ yaş · Mino\'nun Sayı Treni: 11–15 karışık; yanlış vagon takılmaz; sırayla takılır, yenilenince sürer, tren yola çıkar', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=tren');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.st-bekleyen')).toHaveCount(5);
  await expect(p.locator('.st-bekleyen').first()).not.toHaveAttribute('aria-label', '11');
  await vagon(p, 12).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '0');
  await vagon(p, 11).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '1');
  await vagon(p, 12).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '2');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([0, 1]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(st(p)).toHaveAttribute('data-takilan', '2');
  await expect(p.locator('.st-bekleyen:not([hidden])')).toHaveCount(3);
  for (const n of [13, 14, 15]) await vagon(p, n).click();
  await expect(p.locator('.st-lokomotif')).toHaveAttribute('data-poz', '1', { timeout: 15000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(1);
});

test('2–3 yaş · Sayı Treni üç vagonla: 1, 2, 3', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=tren');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.st-bekleyen')).toHaveCount(3);
  for (const n of [1, 2, 3]) await vagon(p, n).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const bb = (p: Page) => p.locator('.bb-sahne');
const balonRakam = (p: Page, n: number) => p.locator('.bb-rakam[aria-label="' + n + '"]');
test('5+ yaş · Bulut\'un Balonları: 3 balona Lokum 2 getirir (5), sonra 2 uçar (3); yanlışta birlikte sayılır ve deftere yazılır; yenilenince sürer', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=balon');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(bb(p)).toHaveAttribute('data-balon', '3');
  await expect(bb(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await expect(bb(p)).toHaveAttribute('data-balon', '5');
  await expect(p.locator('.bb-bulut .bb-poz-0')).toBeVisible();
  await expect(p.locator('.bb-lokum')).toBeVisible();
  await balonRakam(p, 4).click();
  await expect(balonRakam(p, 4)).toHaveClass(/soluk/);
  await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-tekrar-bes-v1') || '{}')))).toContain('5');
  await expect(bb(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await balonRakam(p, 5).click();
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([5]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  // İkinci soru: beş balondan ikisi uçar.
  await expect(bb(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(bb(p)).toHaveAttribute('data-balon', '3');
  await expect(p.locator('.bb-bulut')).toHaveAttribute('data-poz', '2');
  await expect(p.locator('.bb-bulut .bb-poz-2')).toBeVisible();
  await expect(p.locator('.bb-bulut .bb-poz-0')).toBeHidden();
  await balonRakam(p, 3).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(1);
});

test('2–3 yaş · Balonlar: iki balona bir gelir (3), bir uçar (2)', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=balon', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(bb(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await balonRakam(p, 3).click();
  await expect(bb(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(bb(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await balonRakam(p, 2).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const kf = (p: Page) => p.locator('.kf-sahne');
const kekRakam = (p: Page, n: number) => p.locator('.kf-rakam[aria-label="' + n + '"]');
test('5+ yaş · Anne\'nin Kek Fırını: 4 + 3 (yanlışta kekler sayılır), sonra 7 − 5; panoda sonuç yazılır', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=kek');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(kf(p)).toHaveAttribute('data-sonuc', '7', { timeout: 20000 });
  await expect(p.locator('.kf-pano .kf-yer img')).toHaveCount(2);
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 8).click();
  await expect(kf(p)).toHaveAttribute('data-durum', 'say');
  await expect(p.locator('.kf-cam')).toHaveAttribute('data-kek', '7');
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 7).click();
  await expect(p.locator('.kf-soru img')).toHaveCount(1);
  await expect(kf(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(kf(p)).toHaveAttribute('data-sonuc', '2');
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 2).click();
  // Çıkarmada beş kek Anne'ye gider, üçü kalır.
  await expect(p.locator('.kf-kek.gitti')).toHaveCount(5, { timeout: 10000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([]);
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).adim, { timeout: 15000 }).toBe(1);
});

test('2–3 yaş · Kek Fırını: kekler baştan görünür; 1 + 1, 2 + 1', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=kek');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.kf-cam')).toHaveAttribute('data-kek', '2', { timeout: 20000 });
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 2).click();
  await expect(kf(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 3).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const la = (p: Page) => p.locator('.la-sahne');
const levha = (p: Page, n: number) => p.locator('.la-levha[aria-label="' + n + '"]');
test('5+ yaş · Lokum\'un Asansörü: 11–15 katlar; 12. kattan bir fazla, bir fazla, bir eksik, bir eksik; yanlış kat saymaz; yenilenince sürer', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=asansor');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.la-levha')).toHaveCount(5);
  await expect(la(p)).toHaveAttribute('data-kat', '12');
  await expect(la(p)).toHaveAttribute('data-yon', 'fazla', { timeout: 20000 });
  await levha(p, 11).click();
  await expect(la(p)).toHaveAttribute('data-kat', '12');
  await levha(p, 13).click();
  await expect(la(p)).toHaveAttribute('data-kat', '13');
  await expect(la(p)).toHaveAttribute('data-adim', '1', { timeout: 20000 });
  await levha(p, 14).click();
  await expect(la(p)).toHaveAttribute('data-kat', '14');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sayi')).secimler).toEqual([0, 1]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(la(p)).toHaveAttribute('data-kat', '14');
  await expect(la(p)).toHaveAttribute('data-yon', 'eksik', { timeout: 20000 });
  await levha(p, 13).click();
  await expect(la(p)).toHaveAttribute('data-adim', '3', { timeout: 20000 });
  await levha(p, 12).click();
  await expect(p.locator('.la-kabin')).toHaveAttribute('data-poz', '1', { timeout: 20000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('2–3 yaş · Asansör yalnız bir fazla: 1 → 2 → 3 → 4', async ({ page: p }) => {
  await ac(p, 3, 'sayi', 0, '/matematik/?test=1&yenitur=asansor');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  for (const n of [2, 3, 4]) {
    // Ceren sıradaki adımı söyleyince (data-adim) dokunulur.
    await expect(la(p)).toHaveAttribute('data-adim', String(n - 2), { timeout: 20000 });
    await expect(la(p)).toHaveAttribute('data-yon', 'fazla');
    await expect(la(p)).toHaveAttribute('data-kat', String(n - 1));
    await levha(p, n).click();
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const sb = (p: Page) => p.locator('.sb-sahne');
test('2–3 yaş · Şekil Bahçesi: yıldız, sonra kalp; örtüde altı nesne; yanlış konu defterine yazılır', async ({ page: p }) => {
  await ac(p, 3, 'sekil', 1, '/matematik/?test=1&yenitur=sekilbahce');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(sb(p)).toHaveAttribute('data-sekil', 'yildiz');
  await expect(p.locator('.sb-nesne')).toHaveCount(6);
  await expect(p.locator('.sb-nesne[data-dogru="1"]')).toHaveCount(2);
  await expect(sb(p)).toHaveAttribute('data-durum', 'bul', { timeout: 30000 });
  await p.locator('.sb-nesne:not([data-dogru="1"])').first().click();
  await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-konu-tekrar-minik-v1') || '{}')))).toEqual(['sekil:yildiz']);
  for (const b of await p.locator('.sb-nesne[data-dogru="1"]').all()) await b.click();
  await expect(sb(p)).toHaveAttribute('data-sekil', 'kalp', { timeout: 15000 });
  await expect(sb(p)).toHaveAttribute('data-durum', 'bul', { timeout: 30000 });
  for (const b of await p.locator('.sb-nesne[data-dogru="1"]').all()) await b.click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-sekil')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Şekil Bahçesi dört şekil: yıldız, kalp, oval, altıgen; yenilenince sürer', async ({ page: p }) => {
  await ac(p, 5, 'sekil', 1, '/matematik/?test=1&yenitur=sekilbahce');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  for (const s of ['yildiz', 'kalp']) {
    await expect(sb(p)).toHaveAttribute('data-sekil', s, { timeout: 15000 });
    await expect(sb(p)).toHaveAttribute('data-durum', 'bul', { timeout: 30000 });
    for (const b of await p.locator('.sb-nesne[data-dogru="1"]').all()) await b.click();
  }
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sekil')).secimler).toEqual([0, 1]);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  for (const s of ['oval', 'altigen']) {
    await expect(sb(p)).toHaveAttribute('data-sekil', s, { timeout: 15000 });
    await expect(sb(p)).toHaveAttribute('data-durum', 'bul', { timeout: 30000 });
    for (const b of await p.locator('.sb-nesne[data-dogru="1"]').all()) await b.click();
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const ry = (p: Page) => p.locator('.ry-sahne');
const parca = (p: Page, ad: string) => p.locator('.ry-parca[aria-label="' + ad + '"]');
const yerTik = (p: Page, ad: string, i = 0) => p.locator('.ry-yer[aria-label="Yer: ' + ad + '"]').nth(i).click();
async function yerlestirParca(p: Page, ad: string, i = 0) {
  const once = Number(await ry(p).getAttribute('data-kalan'));
  await parca(p, ad).first().click();
  await yerTik(p, ad, i);
  await expect(ry(p)).toHaveAttribute('data-kalan', String(once - 1));
}
test('2–3 yaş · Şekillerle Resim Yap: pencereler hazır, üç parça; yanlış yere girmez; ev canlanır', async ({ page: p }) => {
  await ac(p, 3, 'sekil', 1, '/matematik/?test=1&yenitur=resim');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(ry(p)).toHaveAttribute('data-resim', 'ev');
  await expect(p.locator('.ry-parca')).toHaveCount(3);
  await expect(ry(p)).toHaveAttribute('data-kalan', '3');
  // Çatı kapının yerine girmez.
  await parca(p, 'ev cati').click();
  await yerTik(p, 'ev kapi');
  await expect(ry(p)).toHaveAttribute('data-kalan', '3');
  await yerTik(p, 'ev cati');
  await expect(ry(p)).toHaveAttribute('data-kalan', '2');
  await yerlestirParca(p, 'ev govde');
  await yerlestirParca(p, 'ev kapi');
  await expect(p.locator('.ry-canli-ev')).toHaveCount(1, { timeout: 15000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-minik-sekil')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Resim Yap: ev beş parça (sürükleyerek de), sonra roket; yenilenince sürer', async ({ page: p }) => {
  await ac(p, 5, 'sekil', 1, '/matematik/?test=1&yenitur=resim', { tekrar: 3 });
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(p.locator('.ry-parca')).toHaveCount(5);
  // Gövdeyi sürükleyerek yerine.
  const b = (await parca(p, 'ev govde').boundingBox())!;
  const y = (await p.locator('.ry-yer[aria-label="Yer: ev govde"]').boundingBox())!;
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  await p.mouse.move(y.x + y.width / 2, y.y + y.height * 0.4, { steps: 10 });
  await p.mouse.up();
  await expect(ry(p)).toHaveAttribute('data-kalan', '4');
  await yerlestirParca(p, 'ev cati');
  await yerlestirParca(p, 'ev kapi');
  await yerlestirParca(p, 'ev pencere', 0);
  await yerlestirParca(p, 'ev pencere', 1);
  await expect(ry(p)).toHaveAttribute('data-resim', 'roket', { timeout: 30000 });
  await yerlestirParca(p, 'roket govde');
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sekil')).secimler.length).toBe(6);
  await p.reload();
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(ry(p)).toHaveAttribute('data-resim', 'roket');
  await expect(ry(p)).toHaveAttribute('data-kalan', '4');
  for (const ad of ['roket burun', 'roket pencere', 'roket kanat sol', 'roket kanat sag']) await yerlestirParca(p, ad);
  await expect(p.locator('.ry-canli-roket')).toHaveCount(1, { timeout: 15000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const bf = (p: Page) => p.locator('.bf-sahne');
async function fenerKur(p: Page, n: number) {
  // Sütunun boş üst kısmına dokunulur (fenerlere dokunmak geri alır).
  for (let i = 0; i < n; i++) await p.locator('.bf-yer').click({ position: { x: 20, y: 8 } });
}
test('4 yaş · Mino\'nun Büyüyen Fenerleri: 1, 2, 3 → 4 (eksikte sütunlar sayılır), sonra 2, 3, 4 → 5 (fazlası geri alınır)', async ({ page: p }) => {
  await ac(p, 4, 'fener', 1, '/matematik/?test=1&yenitur=buyuyen');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(bf(p)).toHaveAttribute('data-hedef', '4');
  await expect(p.locator('.bf-fener')).toHaveCount(6);
  await fenerKur(p, 3);
  await p.locator('.bf-onay').click();
  await expect(bf(p)).toHaveAttribute('data-durum', 'say');
  await expect(bf(p)).toHaveAttribute('data-durum', 'kur', { timeout: 30000 });
  await fenerKur(p, 1);
  await p.locator('.bf-onay').click();
  await expect(p.locator('.bf-mino')).toHaveAttribute('data-poz', '1');
  await expect(bf(p)).toHaveAttribute('data-hedef', '5', { timeout: 20000 });
  await expect(bf(p)).toHaveAttribute('data-durum', 'kur');
  await fenerKur(p, 6);
  await p.locator('.bf-fener.yeni').last().click();
  await expect(bf(p)).toHaveAttribute('data-sayi', '5');
  await p.locator('.bf-onay').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-fener')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Büyüyen Fenerler ikişer: 1, 3, 5 → 7', async ({ page: p }) => {
  await ac(p, 5, 'fener', 1, '/matematik/?test=1&yenitur=buyuyen');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(bf(p)).toHaveAttribute('data-hedef', '7');
  await fenerKur(p, 7);
  await p.locator('.bf-onay').click();
  await expect(bf(p)).toHaveAttribute('data-hedef', '8', { timeout: 20000 });
});

const sy = (p: Page) => p.locator('.sy-sahne');
const secimBayrak = (p: Page, tur: string) => p.locator('.sy-secim[aria-label="' + tur + '"]');
test('4 yaş · Şenlik Bayrakları: AAB dizisinde eksik bayrak; yanlışta dizi parlar; iki dizi', async ({ page: p }) => {
  await ac(p, 4, 'fener', 1, '/matematik/?test=1&yenitur=bayrak', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.sy-yer')).toHaveCount(9);
  await expect(p.locator('.sy-yer.bos')).toHaveCount(1);
  await secimBayrak(p, 'mavi kare').click();
  await expect(sy(p)).toHaveAttribute('data-durum', 'izle');
  await expect(sy(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  await secimBayrak(p, 'sari daire').click();
  await expect(sy(p)).toHaveAttribute('data-dizi', '1', { timeout: 15000 });
  await secimBayrak(p, 'mavi kare').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-fener')).adim, { timeout: 15000 }).toBe(2);
});

test('5+ yaş · Şenlik Bayrakları: ABC dizisinde iki boşluk sırayla', async ({ page: p }) => {
  await ac(p, 5, 'fener', 1, '/matematik/?test=1&yenitur=bayrak', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.sy-yer.bos')).toHaveCount(2);
  await secimBayrak(p, 'kirmizi ucgen').click();
  await expect(sy(p)).toHaveAttribute('data-bosluk', '1');
  await secimBayrak(p, 'mavi kare').click();
  await expect(sy(p)).toHaveAttribute('data-dizi', '1', { timeout: 15000 });
});

const ks = (p: Page) => p.locator('.ks-sahne');
const calgiKart = (p: Page, ad: string) => p.locator('.ks-kart[aria-label="' + ad + '"]');
test('4 yaş · Sen Başlat Kino Sürdürsün: iki aynı kart örüntü sayılmaz; davul ve alkış; Kino iki kez çalar; sıradaki davul', async ({ page: p }) => {
  await ac(p, 4, 'fener', 1, '/matematik/?test=1&yenitur=calgi');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.ks-yuva')).toHaveCount(7);
  await calgiKart(p, 'davul').click();
  await calgiKart(p, 'davul').click();
  await expect(ks(p)).toHaveAttribute('data-durum', 'bekle');
  await expect(ks(p)).toHaveAttribute('data-durum', 'kur', { timeout: 30000 });
  await expect(ks(p)).toHaveAttribute('data-birim', '');
  await calgiKart(p, 'davul').click();
  await calgiKart(p, 'alkış').click();
  await expect(ks(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await expect(p.locator('.ks-yuva > *')).toHaveCount(6);
  await calgiKart(p, 'alkış').click();
  await expect(ks(p)).toHaveAttribute('data-durum', 'sor');
  await calgiKart(p, 'davul').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('5+ yaş · Kino Sürdürsün üç kartla: on yuva', async ({ page: p }) => {
  await ac(p, 5, 'fener', 1, '/matematik/?test=1&yenitur=calgi');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.ks-yuva')).toHaveCount(10);
  for (const ad of ['çıngırak', 'davul', 'davul']) await calgiKart(p, ad).click();
  await expect(ks(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await calgiKart(p, 'çıngırak').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const as_ = (p: Page) => p.locator('.as-sahne');
const bardakSec = (p: Page, ad: string) => p.locator('.as-secim[aria-label="' + ad + '"]');
const ADI: Record<string, string> = { dolu: 'Dolu bardak', bos: 'Boş bardak', yarim: 'Yarım bardak' };
test("5+ yaş · Anne'nin Sürahileri: iki dokunuşla yarım ve dolu; dolu, yarım, boş bulunur; sürahi üç bardak doldurur", async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=surahi', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(as_(p)).toHaveAttribute('data-durum', 'doldur');
  await p.locator('.as-surahi').click();
  await expect(as_(p)).toHaveAttribute('data-seviye', 'yarim', { timeout: 10000 });
  await expect(as_(p)).toHaveAttribute('data-durum', 'doldur', { timeout: 15000 });
  await p.locator('.as-surahi').click();
  await expect(as_(p)).toHaveAttribute('data-seviye', 'dolu', { timeout: 10000 });
  for (let no = 0; no < 3; no++) {
    await expect(as_(p)).toHaveAttribute('data-soru', String(no), { timeout: 15000 });
    await expect(as_(p)).toHaveAttribute('data-durum', 'sor');
    const hedef = (await as_(p).getAttribute('data-hedef'))!;
    if (no === 0) {
      const yanlis = Object.keys(ADI).find((x) => x !== hedef)!;
      await bardakSec(p, ADI[yanlis]).click();
      await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-konu-tekrar-bes-v1') || '{}')))).toContain('olcu:doluluk');
    }
    await bardakSec(p, ADI[hedef]).click();
  }
  await expect(as_(p)).toHaveAttribute('data-kac-bardak', '3', { timeout: 20000 });
  await p.locator('.as-rakam[aria-label="3"]').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const by = (p: Page) => p.locator('.by-sahne');
test('4 yaş · Bütün ve Yarım: elma ikiye bölünür, birleşir; sonra armut', async ({ page: p }) => {
  await ac(p, 4, 'olcu', 1, '/matematik/?test=1&yenitur=yarim');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  for (const y of ['elma', 'armut']) {
    await expect(by(p)).toHaveAttribute('data-yiyecek', y, { timeout: 20000 });
    await expect(by(p)).toHaveAttribute('data-durum', 'kes');
    await p.locator('.by-butun').click();
    await expect(p.locator('.by-yarim.ayrik')).toHaveCount(2, { timeout: 10000 });
    await expect(by(p)).toHaveAttribute('data-durum', 'birlestir', { timeout: 15000 });
    await p.locator('.by-yarim').first().click();
    await expect(p.locator('.by-yarim.ayrik')).toHaveCount(0);
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

test('5+ yaş · Bütün ve Yarım: bir yiyecekten sonra dört yarım kaç bütün eder (2)', async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=yarim', { tekrar: 3 });
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(by(p)).toHaveAttribute('data-durum', 'kes', { timeout: 20000 });
  await p.locator('.by-butun').click();
  await expect(by(p)).toHaveAttribute('data-durum', 'birlestir', { timeout: 15000 });
  await p.locator('.by-yarim').first().click();
  await expect(by(p)).toHaveAttribute('data-yarim', '4', { timeout: 20000 });
  await expect(p.locator('.by-kucuk-yarim')).toHaveCount(4);
  await p.locator('.by-rakam[aria-label="4"]').count().then((n) => expect(n).toBe(0));
  await p.locator('.by-rakam[aria-label="1"]').click();
  await expect(by(p)).toHaveAttribute('data-durum', 'sor');
  await p.locator('.by-rakam[aria-label="2"]').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

const kg = (p: Page) => p.locator('.kg-sahne');
const gunKart = (p: Page, ad: string) => p.locator('.kg-kart[aria-label="' + ad + '"]');
test("4 yaş · Kino'nun Günü: uyanma, oyun, uyku; yanlış kart yerine gitmez ve konu defterine yazılır", async ({ page: p }) => {
  await ac(p, 4, 'olcu', 1, '/matematik/?test=1&yenitur=gun');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(p.locator('.kg-kart')).toHaveCount(3);
  await gunKart(p, 'uyku').click();
  await expect(kg(p)).toHaveAttribute('data-sira', '0');
  await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-konu-tekrar-dort-v1') || '{}')))).toContain('olcu:zaman');
  for (const [i, ad] of ['uyanma', 'oyun', 'uyku'].entries()) {
    await expect(kg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 15000 });
    await gunKart(p, ad).click();
    await expect(kg(p)).toHaveAttribute('data-sira', String(i + 1));
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

test("5+ yaş · Kino'nun Günü iki dizi: günüm, sonra kardan adam", async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=gun');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  for (const dizi of [['uyanma', 'oyun', 'uyku'], ['kar yagiyor', 'kardan adam', 'eriyor']]) {
    for (const ad of dizi) {
      await expect(kg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 20000 });
      await gunKart(p, ad).click();
    }
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const rz = (p: Page) => p.locator('.rz-sahne');
test('5+ yaş · Zıpzıp\'ın Ritmik Zıplaması: 2\'şer dizide iki taş gösterilir, dördü seçilir; yanlışta birlikte sayılır; sonra 8\'den 2\'şer', async ({ page: p }) => {
  await ac(p, 5, 'fener', 1, '/matematik/?test=1&yenitur=ritim');
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.rz-tas')).toHaveCount(7);
  await expect(rz(p)).toHaveAttribute('data-adim', '2');
  await expect(rz(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  await expect(rz(p)).toHaveAttribute('data-sira', '3');
  await p.locator('.rz-secim[aria-label="5"]').click();
  await expect(rz(p)).toHaveAttribute('data-durum', 'say');
  await expect(rz(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  for (const n of [6, 8, 10, 12]) {
    await expect(rz(p)).toHaveAttribute('data-durum', 'sec', { timeout: 20000 });
    await p.locator('.rz-secim[aria-label="' + n + '"]').click();
  }
  await expect(rz(p)).toHaveAttribute('data-bas', '8', { timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-fener')).secimler).toEqual([0]);
  for (const n of [14, 16, 18, 20]) {
    await expect(rz(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
    await p.locator('.rz-secim[aria-label="' + n + '"]').click();
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const ep = (p: Page) => p.locator('.ep-sahne');
test('5+ yaş · Babaanne\'nin Eşit Paylaşımı: 4–2 eğilir ve geri döner; 3–3 eşit; sonra altı kurabiye üç tabağa', async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=pay');
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(p.locator('.ep-tabak')).toHaveCount(2);
  await expect(ep(p)).toHaveAttribute('data-kalan', '6');
  for (let i = 0; i < 4; i++) await p.getByRole('button', { name: 'Sol tabak', exact: true }).click();
  await expect(ep(p)).toHaveAttribute('data-tabaklar', '4,0');
  for (let i = 0; i < 2; i++) await p.getByRole('button', { name: 'Sağ tabak', exact: true }).click();
  await expect(ep(p)).toHaveAttribute('data-durum', 'egik');
  await expect(ep(p)).toHaveAttribute('data-durum', 'koy', { timeout: 30000 });
  await expect(ep(p)).toHaveAttribute('data-tabaklar', '0,0');
  for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: 'Sol tabak', exact: true }).click(); await p.getByRole('button', { name: 'Sağ tabak', exact: true }).click(); }
  await expect(ep(p)).toHaveAttribute('data-durum', 'esit');
  await expect(ep(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(p.locator('.ep-tabak')).toHaveCount(3);
  for (let i = 0; i < 2; i++) for (const ad of ['Sol tabak', 'Orta tabak', 'Sağ tabak']) await p.getByRole('button', { name: ad, exact: true }).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const rg = (p: Page) => p.locator('.rg-sahne');
test("4 yaş · Roket Geri Sayımı: 5'ten bloklar büyükten küçüğe; yanlış blok yerleşmez; sıfırda kalkış; sonra 6'dan", async ({ page: p }) => {
  await ac(p, 4, 'sayi', 1, '/matematik/?test=1&yenitur=roket');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.rg-blok')).toHaveCount(5);
  await expect(p.locator('.rg-yuva')).toHaveCount(5);
  await expect(rg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  await p.locator('.rg-blok[aria-label="3"]').click();
  await expect(rg(p)).toHaveAttribute('data-yerlesen', '0');
  for (const n of [5, 4, 3, 2, 1]) await p.locator('.rg-blok[aria-label="' + n + '"]').click();
  await expect(rg(p)).toHaveAttribute('data-yerlesen', '5');
  await expect(rg(p)).toHaveAttribute('data-kalkis', '1', { timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-dort-sayi')).secimler).toEqual([0]);
  await expect(p.locator('.rg-blok')).toHaveCount(6);
  await expect(rg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  for (const n of [6, 5, 4, 3, 2, 1]) await p.locator('.rg-blok[aria-label="' + n + '"]').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 40000 });
});

test("5+ yaş · Roket Geri Sayımı: 10'dan bire, sonra 13'ten 4'e; gerisini (3, 2, 1) Ceren panoya birlikte sayar", async ({ page: p }) => {
  await ac(p, 5, 'sayi', 1, '/matematik/?test=1&yenitur=roket');
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(p.locator('.rg-blok')).toHaveCount(10);
  await expect(rg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  for (let n = 10; n >= 1; n--) await p.locator('.rg-blok[aria-label="' + n + '"]').click();
  await expect(rg(p)).toHaveAttribute('data-kalkis', '1', { timeout: 30000 });
  await expect(rg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 30000 });
  for (let n = 13; n >= 4; n--) await p.locator('.rg-blok[aria-label="' + n + '"]').click();
  await expect(p.locator('.rg-yuva.dolu')).toHaveCount(3, { timeout: 40000 });
  await expect(p.locator('.basari')).toBeVisible({ timeout: 60000 });
});

const kk = (p: Page) => p.locator('.kk-sahne');
const benekYeri = (p: Page, n: number) => p.getByRole('button', { name: 'Benek yeri ' + n, exact: true });
test('4 yaş · Kelebeğin Kanadı: aynası olmayan yere benek oturmaz; iki benek, sonra üç benek; kelebekler uçar', async ({ page: p }) => {
  await ac(p, 4, 'sekil', 1, '/matematik/?test=1&yenitur=kelebek');
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(p.locator('.kk-kanat.sol .kk-benek')).toHaveCount(2);
  await expect(p.locator('.kk-hedef')).toHaveCount(6);
  await expect(p.locator('.kk-renk')).toHaveCount(0);
  // Kalite denetimi 22: benek yerinin dokunma alanı en az 64 px; kelebek iri (kanat yüksekliği ekranın yarısından fazla).
  expect(await benekYeri(p, 1).evaluate((e) => parseFloat(getComputedStyle(e, '::before').width))).toBeGreaterThanOrEqual(64);
  expect((await p.locator('.kk-kanat.sol').boundingBox())!.height).toBeGreaterThan(p.viewportSize()!.height * 0.55);
  await benekYeri(p, 1).click();
  await expect(kk(p)).toHaveAttribute('data-konan', '0');
  await benekYeri(p, 2).click();
  await benekYeri(p, 5).click();
  await expect(kk(p)).toHaveAttribute('data-durum', 'uc');
  await expect(kk(p)).toHaveAttribute('data-kelebek', '1', { timeout: 30000 });
  await expect(p.locator('.kk-kanat.sol .kk-benek')).toHaveCount(3);
  for (const n of [1, 3, 6]) await benekYeri(p, n).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

test('5+ yaş · Kelebeğin Kanadı: önce renk seçilir; yanlış renk oturmaz; dört, sonra beş benek iki renkte', async ({ page: p }) => {
  await ac(p, 5, 'sekil', 1, '/matematik/?test=1&yenitur=kelebek', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k1').click({ force: true });
  await expect(p.locator('.kk-renk')).toHaveCount(2);
  await benekYeri(p, 1).click();
  await expect(kk(p)).toHaveAttribute('data-konan', '0');
  const renk = (r: string) => p.getByRole('button', { name: r === 'mavi' ? 'Mavi benek' : 'Turuncu benek', exact: true });
  await renk('mavi').click();
  await benekYeri(p, 3).click();
  await expect(kk(p)).toHaveAttribute('data-konan', '0');
  await benekYeri(p, 1).click();
  await benekYeri(p, 4).click();
  await renk('turuncu').click();
  await benekYeri(p, 3).click();
  await benekYeri(p, 5).click();
  await expect(kk(p)).toHaveAttribute('data-durum', 'uc');
  await expect(kk(p)).toHaveAttribute('data-kelebek', '1', { timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-sekil')).secimler).toEqual([0]);
  await renk('turuncu').click();
  for (const n of [1, 5, 6]) await benekYeri(p, n).click();
  await renk('mavi').click();
  for (const n of [2, 3]) await benekYeri(p, n).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

const mg = (p: Page) => p.locator('.mg-sahne');
test('5+ yaş · Meyve Grafiği: meyveler sütunlara; en çok elma, en az armut; elma armuttan 2 fazla; fazlalar parlar', async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=grafik', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(p.locator('.mg-sepetteki')).toHaveCount(12);
  while ((await p.locator('.mg-sepetteki').count()) > 0) await p.locator('.mg-sepetteki').first().click();
  await expect(mg(p)).toHaveAttribute('data-sayilar', '5,3,4');
  await expect(mg(p)).toHaveAttribute('data-durum', 'cok', { timeout: 30000 });
  const sutun = (ad: string) => p.getByRole('button', { name: ad + ' sütunu', exact: true });
  await sutun('Muz').click();
  await expect(mg(p)).toHaveAttribute('data-durum', 'cok');
  await sutun('Elma').click();
  await expect(mg(p)).toHaveAttribute('data-durum', 'az', { timeout: 30000 });
  await sutun('Armut').click();
  await expect(mg(p)).toHaveAttribute('data-durum', 'fazla', { timeout: 30000 });
  await expect.poll(async () => (await kayit(p, 'minkino-matematik-1-olcu')).secimler).toEqual([0, 1]);
  await p.locator('.mg-kart[aria-label="3"]').click();
  await expect(mg(p)).toHaveAttribute('data-durum', 'fazla');
  await p.locator('.mg-kart[aria-label="2"]').click();
  await expect(p.locator('.mg-meyve.fazla')).toHaveCount(2);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

// ----- Derinlik (derinlik.ts): aynı turun 2. ve 3. gelişi başka iş -----
test('5+ yaş · Sayı Treni 2. geliş: iki vagon eksik; trende olmayan vagon takılmaz; eksikler bulunur', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=tren', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(st(p)).toHaveAttribute('data-is', 'eksik');
  await expect(st(p)).toHaveAttribute('data-eksik', '14,16');
  await expect(p.locator('.st-yuva.dolu')).toHaveCount(3);
  await expect(p.locator('.st-bekleyen:not([hidden])')).toHaveCount(4);
  await vagon(p, 12).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '3');
  await expect.poll(() => p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('minkino-matematik-tekrar-bes-v1') || '{}')))).toContain('14');
  await vagon(p, 16).click();
  await vagon(p, 14).click();
  await expect(p.locator('.st-yuva.dolu')).toHaveCount(5);
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('4 yaş · Sayı Treni 3. geliş: büyükten küçüğe; en küçük önce takılmaz', async ({ page: p }) => {
  await ac(p, 4, 'sayi', 0, '/matematik/?test=1&yenitur=tren', { tekrar: 2 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(st(p)).toHaveAttribute('data-is', 'geri');
  await vagon(p, 1).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '0');
  for (const n of [5, 4, 3, 2, 1]) await vagon(p, n).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('5+ yaş · Sayı Treni 3. geliş: ikişer ikişer 12…20', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=tren', { tekrar: 2 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(st(p)).toHaveAttribute('data-is', 'ikiser');
  await expect(st(p)).toHaveAttribute('data-sira', '12,14,16,18,20');
  await vagon(p, 14).click();
  await expect(st(p)).toHaveAttribute('data-takilan', '0');
  for (const n of [12, 14, 16, 18, 20]) await vagon(p, n).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('5+ yaş · Kek Fırını 3. geliş: 6 + ? = 9 (yanlışta eklenecek üç kek parlar ve sayılır), sonra 4 + ? = 10', async ({ page: p }) => {
  await ac(p, 5, 'sayi', 0, '/matematik/?test=1&yenitur=kek', { tekrar: 2 });
  await p.locator('.tezgah-oyuncak.k0').click({ force: true });
  await expect(kf(p)).toHaveAttribute('data-bilinmeyen', 'b', { timeout: 20000 });
  await expect(kf(p)).toHaveAttribute('data-cevap', '3');
  // Panoda 6, ?, 9: iki rakam ve boş soru yeri.
  await expect(p.locator('.kf-pano .kf-yer img')).toHaveCount(2);
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 2).click();
  await expect(kf(p)).toHaveAttribute('data-durum', 'say');
  await expect(p.locator('.kf-kek')).toHaveCount(9);
  await expect(p.locator('.kf-kek.eklenen')).toHaveCount(3);
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 3).click();
  await expect(p.locator('.kf-soru img')).toHaveCount(1);
  await expect(kf(p)).toHaveAttribute('data-soru', '1', { timeout: 30000 });
  await expect(kf(p)).toHaveAttribute('data-cevap', '6');
  await expect(kf(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await kekRakam(p, 6).click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

test("4 yaş · Kino'nun Günü 3. geliş: rafta öbür diziden bir çeldirici; çeldirici yerine gitmez; iki dizi", async ({ page: p }) => {
  await ac(p, 4, 'olcu', 1, '/matematik/?test=1&yenitur=gun', { tekrar: 2 });
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(p.locator('.kg-kart')).toHaveCount(4);
  await expect(p.locator('.kg-kart[data-yer="-1"]')).toHaveCount(1);
  await p.locator('.kg-kart[data-yer="-1"]').click();
  await expect(kg(p)).toHaveAttribute('data-sira', '0');
  for (const [i, ad] of ['uyanma', 'oyun', 'uyku'].entries()) {
    await expect(kg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 15000 });
    await gunKart(p, ad).click();
    await expect(kg(p)).toHaveAttribute('data-sira', String(i + 1));
  }
  await expect(kg(p)).toHaveAttribute('data-dizi', '1', { timeout: 20000 });
  await expect(p.locator('.kg-kart')).toHaveCount(4);
  for (const ad of ['kar yagiyor', 'kardan adam', 'eriyor']) {
    await expect(kg(p)).toHaveAttribute('data-durum', 'sec', { timeout: 15000 });
    await gunKart(p, ad).click();
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 30000 });
});

test('5+ yaş · Bütün ve Yarım 3. geliş: simit bölünür, sonra altı yarım kaç bütün (3)', async ({ page: p }) => {
  await ac(p, 5, 'olcu', 1, '/matematik/?test=1&yenitur=yarim', { tekrar: 2 });
  await p.locator('.tezgah-oyuncak.k2').click({ force: true });
  await expect(by(p)).toHaveAttribute('data-yiyecek', 'simit', { timeout: 20000 });
  await expect(by(p)).toHaveAttribute('data-durum', 'kes');
  await p.locator('.by-butun').click();
  await expect(by(p)).toHaveAttribute('data-durum', 'birlestir', { timeout: 15000 });
  await p.locator('.by-yarim').first().click();
  await expect(by(p)).toHaveAttribute('data-yarim', '6', { timeout: 20000 });
  await expect(p.locator('.by-kucuk-yarim')).toHaveCount(6);
  await p.locator('.by-rakam[aria-label="2"]').click();
  await expect(by(p)).toHaveAttribute('data-durum', 'sor');
  await p.locator('.by-rakam[aria-label="3"]').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});

test('5+ yaş · Kino Sürdürsün 2. geliş: Kino çaldıktan sonra iki boşluk sırayla bulunur', async ({ page: p }) => {
  await ac(p, 5, 'fener', 1, '/matematik/?test=1&yenitur=calgi', { tekrar: 1 });
  await p.locator('.tezgah-oyuncak.k3').click({ force: true });
  await expect(p.locator('.ks-yuva')).toHaveCount(11);
  await expect(ks(p)).toHaveAttribute('data-bos', '2');
  for (const ad of ['çıngırak', 'davul', 'davul']) await calgiKart(p, ad).click();
  await expect(ks(p)).toHaveAttribute('data-durum', 'sor', { timeout: 30000 });
  await calgiKart(p, 'davul').click();
  await expect(ks(p)).toHaveAttribute('data-bulunan', /^$|0/);
  await calgiKart(p, 'çıngırak').click();
  await expect(ks(p)).toHaveAttribute('data-bulunan', '1');
  await calgiKart(p, 'davul').click();
  await expect(p.locator('.basari')).toBeVisible({ timeout: 20000 });
});
