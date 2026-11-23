import { test, expect, type Page } from '@playwright/test';

// Deneyler · Bağla ve Çalıştır (Mucit Panosu, deney/pano.html, Paket Deney-Y2). Çizimler gelmeden test kipinde çizimsiz görünüm.
test.describe.configure({ timeout: 90000 });
type Pn = {
  durum: () => string; tur: () => string; sesKaydi: { ad: string }[]; basla: () => Promise<void>;
  yerlestir: (n: number, i: number, j: number) => void; cevir: (i: number, j: number) => void; aci: (i: number, j: number) => number | undefined;
};
const pn = <T>(p: Page, f: (w: Pn) => T) => p.evaluate(f as never) as Promise<T>;
const durum = (p: Page) => p.evaluate(() => (window as unknown as { __pano: Pn }).__pano.durum());
const sesler = (p: Page) => p.evaluate(() => (window as unknown as { __pano: Pn }).__pano.sesKaydi.map((s) => s.ad));

async function ac(p: Page, yas: number) {
  await p.goto('/deney/pano.html?test=1&yas=' + yas);
  await expect(p.locator('#sahne')).toHaveAttribute('data-durum', 'kur');
  await p.evaluate(() => (window as unknown as { __pano: Pn }).__pano.basla());
}

test('4 yaş: boşluklu vana suyu fışkırtır; borular takılıp dirsek çevrilince çark döner; ışık turunda ampul yanar', async ({ page: p }) => {
  await ac(p, 4);
  await expect(p.locator('#sahne')).toHaveAttribute('data-tur', 'su');
  await expect(p.locator('.pn-tepside')).toHaveCount(2);
  // Parçasız vana: su ilk boşluktan fışkırır, Kino ıslanır; ceza yok, tekrar denenebilir.
  await p.getByRole('button', { name: 'Kırmızı vanayı aç' }).click();
  await expect.poll(() => durum(p), { timeout: 10000 }).toBe('kacti');
  // Ceren'in ipucu Kino'nun sözünden sonra sırayla gelir.
  await expect.poll(() => sesler(p), { timeout: 8000 }).toEqual(expect.arrayContaining(['efekt-vana', 'efekt-fiskir', 'k-islak', 'c-su-kacti']));
  // Düz boruyu dokunarak koy (ilk boşluğa uçar), dirseği koy ama ters bırak: su dirsekte kaçar, Ceren "çevir" der.
  await p.locator('.pn-tepside').first().click();
  await expect(p.locator('.pn-parca.takili')).toHaveCount(1);
  await p.evaluate(() => (window as unknown as { __pano: Pn }).__pano.yerlestir(1, 4, 2));
  await p.getByRole('button', { name: 'Kırmızı vanayı aç' }).click();
  await expect.poll(() => durum(p), { timeout: 10000 }).toBe('kacti');
  await expect.poll(() => sesler(p)).toContain('c-cevir');
  // Dirseği iki kez çevir (180°): su çarka ulaşır.
  await p.locator('.pn-parca.takili[data-kare="4,2"]').click();
  await p.locator('.pn-parca.takili[data-kare="4,2"]').click();
  expect(await p.evaluate(() => (window as unknown as { __pano: Pn }).__pano.aci(4, 2))).toBe(180);
  await p.getByRole('button', { name: 'Kırmızı vanayı aç' }).click();
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('k-cark');
  await expect(p.locator('#sahne')).toHaveAttribute('data-tur', 'isik', { timeout: 15000 });
  // Işık turu: kablo eksikken şalter vızıldar; tamamlanınca ampul yanar.
  await p.getByRole('button', { name: 'Yeşil şalteri indir' }).click();
  await expect.poll(() => sesler(p), { timeout: 10000 }).toContain('efekt-bzz');
  await expect.poll(() => durum(p), { timeout: 10000 }).toBe('kacti');
  await p.locator('.pn-tepside').first().click();
  await p.locator('.pn-tepside').first().click();
  await p.locator('.pn-parca.takili[data-kare="5,3"]').click();
  await p.getByRole('button', { name: 'Yeşil şalteri indir' }).click();
  await expect.poll(() => durum(p), { timeout: 20000 }).toBe('bitti');
  await expect.poll(() => sesler(p), { timeout: 8000 }).toEqual(expect.arrayContaining(['efekt-ampul', 'k-yandi', 'c-final']));
  // Bir daha: tekrar düğmesi panoyu su turundan baştan kurar.
  await p.getByRole('button', { name: 'Bir daha oyna' }).click({ force: true }); // düğme davet için nabız atar (hiç durmaz)
  await expect(p.locator('#sahne')).toHaveAttribute('data-tur', 'su');
  await expect(p.locator('#sahne')).toHaveAttribute('data-durum', 'kur');
  await expect(p.locator('.pn-tepside')).toHaveCount(2);
  await expect(p.getByRole('button', { name: 'Bir daha oyna' })).toBeHidden();
  const sozler = (await sesler(p)).filter((a) => /^[ck]-/.test(a));
  for (let i = 1; i < sozler.length; i++) expect(sozler[i]).not.toBe(sozler[i - 1]);
});

test('2–3 yaş bir boşluk, 5+ üç boşluk', async ({ page: p }) => {
  await ac(p, 3);
  await expect(p.locator('.pn-tepside')).toHaveCount(1);
  await ac(p, 5);
  await expect(p.locator('.pn-tepside')).toHaveCount(3);
});
