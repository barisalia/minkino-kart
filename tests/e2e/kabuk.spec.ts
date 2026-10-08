/**
 * Uygulama kabuğu (mağaza incelemesinin ilk gördüğü yer): ana menü 6 ekran boyunda boşluksuz, abonelik ekranının
 * mağaza zorunlu öğeleri, ebeveyn kapısı (iki basamak, 3 yanlışta dinlenme), anahtarsız "Yakında", Ebeveyn Köşesi.
 * Uygulama modu web derlemesinde taklit edilir (?test=1&uygulama=…), satın alma sahte sağlayıcıyla.
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

const BOYUTLAR: [number, number, string][] = [
  [844, 390, 'kabuk-menu-844x390'],
  [932, 430, 'kabuk-menu-932x430'],
  [667, 375, 'kabuk-menu-667x375'],
  [390, 844, 'kabuk-menu-telefon'],
  [1024, 768, 'kabuk-menu-1024x768'],
  [834, 1194, 'kabuk-menu-tablet'],
];

async function rakamYaz(page: Page, sayi: string) {
  for (const r of sayi) await page.locator('.ebeveyn-kapisi .tus', { hasText: new RegExp(`^${r}$`) }).click();
}

/** Kilitli içerik: önce çocuğa kilit anı (abonelik ekranı değil); büyük "Büyükler için"e basar, kapı açılır */
async function buyuklerIcin(page: Page) {
  await expect(page.locator('.kl-perde .kl-baslik')).toHaveText('Bunu anne-babanla açabilirsin');
  await expect(page.locator('.ab-perde')).toHaveCount(0);
  await page.locator('.kl-perde').getByRole('button', { name: 'Büyükler için' }).click();
}

async function kapiyiGec(page: Page) {
  const soru = page.locator('.ebeveyn-kapisi .kapi-soru');
  await expect(soru).toBeVisible();
  await rakamYaz(page, (await soru.getAttribute('data-toplam'))!);
  await page.getByRole('button', { name: 'tamam' }).click();
  await expect(page.locator('.ebeveyn-kapisi')).toHaveCount(0);
}

test('Kabuk: menü 6 ekran boyunda 9 iri kart, ızgarada boşluk yok, adlar kesilmiyor', async ({ page }) => {
  const hatalar = hataTopla(page);
  for (const [en, boy, ad] of BOYUTLAR) {
    await page.setViewportSize({ width: en, height: boy });
    await page.goto('./?test=1&uygulama=android');
    const kartlar = page.locator('.ug-kart');
    await expect(kartlar).toHaveCount(9);
    // sıra korunur, Pasta geniş ve sonda
    expect(await kartlar.evaluateAll((l) => l.map((k) => k.getAttribute('data-oyun')))).toEqual(['kartlar', 'pazar', 'canlan', 'macera', 'film', 'okul', 'dedektif', 'giysin', 'pasta']);
    await page.waitForTimeout(1100);
    const kutular = await kartlar.evaluateAll((l) => l.map((k) => k.getBoundingClientRect().toJSON() as DOMRect));
    for (const k of kutular) {
      expect(k.left, `${ad} sol`).toBeGreaterThanOrEqual(-1);
      expect(k.top, `${ad} üst`).toBeGreaterThanOrEqual(-1);
      expect(k.right, `${ad} sağ`).toBeLessThanOrEqual(en + 1);
      expect(k.bottom, `${ad} alt`).toBeLessThanOrEqual(boy + 1);
      expect(Math.min(k.width, k.height), `${ad} kart boyu`).toBeGreaterThan(boy < 450 ? 95 : 130);
    }
    // kartlar üst üste binmez
    for (let i = 0; i < kutular.length; i++)
      for (let j = i + 1; j < kutular.length; j++) {
        const a = kutular[i];
        const b = kutular[j];
        const ust = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2;
        expect(ust, `${ad}: ${i} ile ${j} üst üste`).toBe(false);
      }
    // boşluk yok: son sıradaki geniş kart ızgaranın sağ kenarına kadar gelir
    const sag = Math.max(...kutular.map((k) => k.right));
    expect(Math.abs(kutular[8].right - sag), `${ad} son sıra dolu`).toBeLessThan(3);
    // adlar sığıyor (… ile kesilmiyor)
    const kesik = await page.locator('.ug-kart-ad').evaluateAll((l) => l.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent));
    expect(kesik, ad).toEqual([]);
    // kilit rozeti yumuşak (yalnız abonelikli oyunlarda)
    for (const id of ['pazar', 'canlan', 'pasta', 'dedektif']) await expect(page.locator(`.ug-kart[data-oyun="${id}"] .mk-kilit`)).toBeVisible();
    await expect(page.locator('.ug-kart[data-oyun="kartlar"] .mk-kilit')).toHaveCount(0);
    await page.screenshot({ path: `tests/screens/${ad}.png` });
  }
  expect(hatalar).toEqual([]);
});

test('Kabuk: ebeveyn kapısı iki basamak, yanlışta yumuşak sallanma, 3 yanlışta dinlenir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?test=1&uygulama=android');
  await page.locator('.ug-kart[data-oyun="pazar"]').click();
  await buyuklerIcin(page);
  const kapi = page.locator('.ebeveyn-kapisi');
  await expect(kapi).toBeVisible();
  await expect(kapi.locator('.kapi-kutu')).toHaveCount(2);
  await expect(kapi.locator('.kapi-en')).toHaveText('For grown-ups: answer to continue');
  // en çok iki rakam
  await rakamYaz(page, '123');
  await expect(kapi.locator('.kapi-cevap')).toHaveAttribute('data-girdi', '12');
  await page.getByRole('button', { name: 'sil' }).click();
  await page.getByRole('button', { name: 'sil' }).click();
  await rakamYaz(page, '2');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tests/screens/kabuk-kapi.png' });

  // üç yanlış: tuşlar dinlenir (geri sayım), basmak işe yaramaz
  const soru = kapi.locator('.kapi-soru');
  for (let i = 0; i < 3; i++) {
    const t = Number(await soru.getAttribute('data-toplam'));
    await page.getByRole('button', { name: 'sil' }).click();
    await rakamYaz(page, String(t === 99 ? 98 : t + 1));
    await page.getByRole('button', { name: 'tamam' }).click();
  }
  await expect(kapi).toHaveClass(/dinleniyor/);
  await expect(kapi.locator('.kapi-not')).toContainText('Biraz bekleyelim');
  await page.screenshot({ path: 'tests/screens/kabuk-kapi-dinlenme.png' });
  // dinlenme biter (test modunda kısa), doğru cevapla geçilir
  await expect(kapi).not.toHaveClass(/dinleniyor/, { timeout: 5000 });
  await kapiyiGec(page);
  await expect(page.locator('.ab-perde')).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Kabuk: abonelik ekranında mağazaların istediği her şey var', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?test=1&uygulama=ios');
  await page.locator('.ug-kart[data-oyun="pasta"]').click();
  await buyuklerIcin(page);
  await kapiyiGec(page);
  const ab = page.locator('.ab-perde');
  await expect(ab).toHaveAttribute('data-durum', 'hazir');
  // Mino, Kino, başlık, ikonlu fayda listesi
  // Mino ve Kino: Gemini kahraman görseli varsa o, yoksa canlı karakterler
  await expect(ab.locator('.ab-kahraman img, .ab-mino .mino svg').first()).toBeVisible();
  await expect(ab.locator('.ab-liste li')).toHaveCount(6);
  await expect(ab.locator('.ab-liste .ab-tik')).toHaveCount(6);
  // dönem başına fiyat (mağazadan), deneme yazısı
  await expect(ab.locator('.ab-plan-aylik')).toContainText('₺99,00');
  await expect(ab.locator('.ab-plan-aylik')).toContainText('/ ay');
  await expect(ab.locator('.ab-plan-yillik')).toContainText('₺499,00');
  await expect(ab.locator('.ab-plan-yillik')).toContainText('/ yıl');
  await expect(ab.locator('.ab-deneme')).toHaveText('7 gün ücretsiz dene');
  await expect(ab.locator('.ab-sonra')).toContainText('Deneme bitince ₺499,00 / yıl');
  // otomatik yenileme metni TR + EN (iOS), geri yükleme, gizlilik, koşullar, iletişim, kapat
  await expect(ab.locator('.ab-yasal').first()).toContainText('otomatik olarak yenilenir');
  await expect(ab.locator('.ab-yasal-en')).toContainText('automatically renews');
  await expect(ab.getByRole('button', { name: 'Satın alımları geri yükle' })).toBeEnabled();
  await expect(ab.getByRole('link', { name: /Gizlilik politikası/ })).toHaveAttribute('href', /\/gizlilik\/$/);
  await expect(ab.getByRole('link', { name: /Kullanım koşulları/ })).toHaveAttribute('href', /\/sartlar\/$/);
  await expect(ab.locator('.ab-iletisim a')).toHaveAttribute('href', 'mailto:minkinokids@gmail.com');
  await expect(ab.getByRole('button', { name: 'Kapat' })).toBeVisible();
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'tests/screens/kabuk-abonelik-ekran.png' });
  // bütün ekran tek karede (uzun telefon boyu: kaydırmadan hepsi görünsün)
  await page.setViewportSize({ width: 390, height: 1560 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'tests/screens/kabuk-abonelik.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  // geri yükleme (sahte mağazada abonelik yok)
  await ab.getByRole('button', { name: 'Satın alımları geri yükle' }).click();
  await expect(ab.locator('.ab-durum')).toHaveText('Bu hesapta etkin bir abonelik bulunamadı.');
  await ab.getByRole('button', { name: 'Kapat' }).click();
  await expect(ab).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

test('Kabuk: anahtar yokken kilit yok, abonelik ekranı "Yakında" ve yedek fiyat', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./?test=1&uygulama=android&anahtar=yok');
  await expect(page.locator('.ug-kart')).toHaveCount(9);
  await expect(page.locator('.mk-kilit')).toHaveCount(0);
  await page.locator('.ug-kapi').click();
  await kapiyiGec(page);
  await expect(page.locator('.ug-ayarlar')).toBeVisible();
  // Ebeveyn Köşesi: abonelik, geri yükleme, gizlilik, koşullar, bize yazın
  await expect(page.getByRole('button', { name: 'Satın alımları geri yükle' })).toBeVisible();
  await expect(page.locator('.ug-eposta')).toHaveAttribute('href', 'mailto:minkinokids@gmail.com');
  await page.screenshot({ path: 'tests/screens/kabuk-ebeveyn-kosesi.png' });
  await page.getByRole('button', { name: 'Minkino Premium' }).click();
  const ab = page.locator('.ab-perde');
  await expect(ab).toHaveAttribute('data-durum', 'yakinda');
  await expect(ab.locator('.ab-basla')).toHaveText('Yakında');
  await expect(ab.locator('.ab-basla')).toBeDisabled();
  await expect(ab.locator('.ab-plan-aylik .ab-fiyat')).toContainText('99 TL');
  await expect(ab.locator('.ab-plan-yillik .ab-fiyat')).toContainText('499 TL');
  await expect(ab.locator('.ab-deneme')).toHaveText('7 gün ücretsiz deneme');
  await expect(ab.locator('.ab-durum')).toContainText('bütün oyunlar açık');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/screens/kabuk-abonelik-yakinda.png' });
  expect(hatalar).toEqual([]);
});
