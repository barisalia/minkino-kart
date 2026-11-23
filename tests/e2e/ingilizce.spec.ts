// Ceren Öğretmen ile İngilizceye Merhaba · uçtan uca: ana ekran, bir dersin baştan sona oynanması (doğru ve yanlış
// cevaplarla), ilerlemenin kaydı, albüm, Oyunlar bölümü, üst seviye dersleri (cümle, hikâye), konsol hatası olmaması.
// Oyun yatay oynanır.
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

test.use({ viewport: { width: 844, height: 390 }, isMobile: false, hasTouch: true });

const ANAHTAR = 'minkino-ingilizce-v1';
const adim = (page: Page) => page.evaluate(() => document.querySelector<HTMLElement>('.ing')?.dataset.adim ?? '').catch(() => '');
const tik = { force: true, timeout: 4000 } as const;
// Sayfadan cevap okurken kısa süre: adım tam o anda bitip öğe kalkarsa okuma süresiz beklemesin, döngü sıradaki adımı görsün
// (19 Kasım: derlenmiş pakette Fener Avı bitip sonuç ekranı açıldığı anda okuma takıldı, test zaman aşımına düştü)
const bak = { timeout: 1500 } as const;

/** Balondaki sözün son kelimesi: "Where is the cow?" → "cow" (soru hangi kelimeyi istiyor) */
const sonKelime = (page: Page, secici: string) =>
  page.evaluate((s) => (document.querySelector(s)?.textContent ?? '').replace(/[?.!]/g, '').trim().split(' ').pop()!.toLowerCase(), secici);

/**
 * Açık olan dersi baştan sona oynar. `yanlisYap`: her soruda önce bilerek yanlış seçeneğe dokunur
 * (yanlışın dersi kilitlemediği ve hatanın sayıldığı denetlenir).
 */
/** Masal 2.0 (kitap): kameranın dönüşümü iki ölçümde aynıysa kamera durmuştur (en çok ~3 sn beklenir) */
async function kameraDurunca(page: Page) {
  let once = '';
  for (let i = 0; i < 20; i++) {
    const s = await page.evaluate(() => { const k = document.querySelector('.ing-m2-kamera'); return k ? getComputedStyle(k).transform : ''; }).catch(() => '');
    if (s === once) return;
    once = s;
    await page.waitForTimeout(150);
  }
}

async function dersiOyna(page: Page, yanlisYap = false, gozle?: (adim: string) => Promise<void>): Promise<string[]> {
  const gorulen: string[] = [];
  for (let tur = 0; tur < 500; tur++) {
    const a = await adim(page);
    if (gozle) await gozle(a);
    if (a && gorulen[gorulen.length - 1] !== a) gorulen.push(a);
    if (a === 'sonuc') return gorulen;
    if (a === 'selam' || a === 'veda') {
      // üst seviye derslerinde selamdan sonra günlük söz gelir ("How are you?"): çocuk cevabını söyler
      if (await page.locator('.ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
      else await page.locator('.ing-el-salla:not([hidden]):not(.ing-sallandi)').click(tik).catch(() => {});
    }
    else if (a === 'tanis' || a === 'soyle') {
      if (await page.locator('.ing-kapak:not(.ing-acik)').count()) await page.locator('.ing-kapak').click(tik).catch(() => {});
      else if (await page.locator('.ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
    } else if (a === 'bul' || a === 'tekrar') {
      const hedef = await sonKelime(page, '.ing-soru');
      if (yanlisYap && tur % 2 === 0) await page.locator(`.ing-secim:not([data-kelime="${hedef}"])`).first().click(tik).catch(() => {});
      else await page.locator(`.ing-secim[data-kelime="${hedef}"]`).click(tik).catch(() => {});
    } else if (a === 'ogret') {
      if (await page.locator('.ing-oylar:not([hidden])').count()) {
        const karttaki = await page.evaluate(() => document.querySelector<HTMLElement>('.ing-kino-kart .ing-resim')?.dataset.kelime);
        const dogru = (await sonKelime(page, '.ing-sinif .ing-soz-balonu')) === karttaki ? '.ing-evet' : '.ing-hayir';
        await page.locator(dogru).click(tik).catch(() => {});
      } else await page.locator(`.ing-secim[data-kelime="${await sonKelime(page, '.ing-sinif .ing-soz-balonu')}"]`).click(tik).catch(() => {});
    }
    else if (a === 'fener') {
      // Fener Avı: test kipinde aranan nesne sahnenin data-hedef'inde
      const hedef = await page.locator('.ing-fener-sahne').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef) await page.locator(`.ing-fener-sahne .ing-nesne[data-kelime="${hedef}"] .ing-nesne-hit`).click(tik).catch(() => {});
    }
    // Seviye 2 ve 3 adımları: test kipinde doğru cevap sayfadan okunur (data-hedef, data-sira)
    else if (a === 'anlat' && await page.locator('.ing-anlat-gizli:not(.ing-acik)').count()) {
      // gizli resim (gölge, kareler ya da Polly'ye dokun): açılana kadar dokunur
      const polly = page.locator('.ing-polly-cagir');
      await (await polly.count() ? polly : page.locator('.ing-anlat-gizli')).first().click(tik).catch(() => {});
    }
    else if (a === 'anlat' || a === 'soyle2' || a === 'sensor') await page.locator('.ing-yildiz-dugme:not([hidden])').click(tik).catch(() => {});
    else if (a === 'dogrumu') {
      const hedef = await page.locator('.ing-oylar').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && !(await page.locator('.ing-oylar.ing-bitti').count())) await page.locator(hedef === 'evet' ? '.ing-evet' : '.ing-hayir').click(tik).catch(() => {});
    } else if (a === 'sasirt') {
      // Şakacı Polly: doğru düğme (test kipinde data-hedef)
      const hedef = await page.locator('.ing-sasirt .ing-oylar').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && !(await page.locator('.ing-sasirt .ing-oylar.ing-bitti').count())) await page.locator(hedef === 'evet' ? '.ing-sasirt .ing-evet' : '.ing-sasirt .ing-hayir').click(tik).catch(() => {});
    } else if (a === 'ovala') {
      // Ovala, Bul: sorulan şeyin üstündeki örtüyü siler
      const hedef = await page.locator('.ing-ov-sahne').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef) await ovala(page, hedef);
    } else if (a === 'masal2') {
      // Masal 2.0: söyle → yıldız; ileri düğmesi; seç → sorulan yer; yoksa parlayan ana yer
      // çerçeve hep vardır: özniteliği yoksa hemen null döner (öznitelikli seçici öğe çıkana dek bekliyordu)
      const yakalaNesne = await page.locator('.ing-m2-cerceve').getAttribute('data-yakala', bak).catch(() => null);
      const evetHayir = await page.locator('.ing-m2-cerceve').getAttribute('data-evethayir', bak).catch(() => null);
      if (yakalaNesne) { await kameraDurunca(page); await page.locator(`[data-katman="${yakalaNesne}"]`).click(tik).catch(() => {}); }
      else if (evetHayir && await page.locator('.ing-m2-evethayir:not([hidden])').count()) await page.locator(`.ing-m2-evethayir [data-cevap="${evetHayir}"]`).click(tik).catch(() => {});
      else if (await page.locator('.ing-m2-soz .ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-m2-soz .ing-yildiz-dugme').click(tik).catch(() => {});
      else if (await page.locator('.ing-m2-tasinir').count() && await page.locator('.ing-m2-hedef').count()) {
        // sürükle: taşınacak katmanı hedefin ortasına bırakır
        const k = await page.locator('.ing-m2-tasinir').boundingBox(), t = await page.locator('.ing-m2-hedef').boundingBox();
        if (k && t) { await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await page.mouse.down(); await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await page.mouse.up(); }
      }
      else if (await page.locator('.ing-m2-ileri:not([hidden])').count()) await page.locator('.ing-m2-ileri').click(tik).catch(() => {});
      else if (!(await page.evaluate(() => !!document.documentElement.dataset.konusan))) {
        const sec = await page.locator('.ing-m2-cerceve.ing-m2-secim').getAttribute('data-hedef', bak).catch(() => null);
        // kitapta kamera kayar: kamera durunca tıklanır (kayarken zorla tıklama eski noktaya düşüyordu; parlayan yerin
        // ışığı nabız gibi attığı için "kararlı öğe" beklemek de bitmiyordu)
        await kameraDurunca(page);
        if (sec) await page.locator(`.ing-m2-yer[data-yer="${sec}"]`).click(tik).catch(() => {});
        else await page.locator('.ing-m2-cerceve.ing-m2-parlak .ing-m2-ana').click(tik).catch(() => {});
      }
    } else if (a === 'masaloyun') {
      // Masal Oyunu: sorulan resme dokunur
      const hedef = await page.locator('.ing-masaloyun .ing-secenekler').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && !(await page.locator('.ing-masaloyun .ing-secenekler.ing-bitti').count())) await page.locator(`.ing-masaloyun-kart[data-secenek="${hedef}"]`).click(tik).catch(() => {});
    } else if (a === 'gecit') {
      // Hayvan Geçidi: gelen gölgeye dokunur
      await page.locator('.ing-gecit-hayvan.ing-kahraman.ing-gecit-golge').first().click(tik).catch(() => {});
    } else if (a === 'bahce') {
      // Hayvanat Bahçesi: sorulan hayvana dokunur
      const hedef = await page.locator('.ing-bahce-izgara').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && await page.locator('.ing-bahce .ing-soru.ing-gorunur').count()) await page.locator(`.ing-bahce-hayvan[data-kelime="${hedef}"]`).click(tik).catch(() => {});
    } else if (a === 'posta') {
      // mektubu Polly'nin okuduğu cümlenin evine götürür (evlere dokunarak)
      const hedef = await page.locator('.ing-posta-evler').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && !(await page.locator('.ing-zarf.ing-ucuyor').count())) await page.locator(`.ing-posta-ev[data-ifade="${hedef}"]`).click(tik).catch(() => {});
    } else if (a === 'yakala') {
      // söylenen resim mercekten geçerken dokunulur
      const m = page.locator('.ing-mercek');
      const [simdi, hedef] = await Promise.all([m.getAttribute('data-ifade', bak).catch(() => null), m.getAttribute('data-hedef', bak).catch(() => null)]);
      if (simdi && simdi === hedef) await m.click(tik).catch(() => {});
    } else if (a === 'hafiza2') {
      const acik = page.locator('.ing-hafiza-karti.ing-acik:not(.ing-eslesti)');
      const n = await acik.count();
      if (n === 0) await page.locator('.ing-hafiza-karti:not(.ing-acik)').first().click(tik).catch(() => {});
      else if (n === 1) await page.locator(`.ing-hafiza-karti:not(.ing-acik)[data-ifade="${await acik.first().getAttribute('data-ifade', bak).catch(() => '')}"]`).first().click(tik).catch(() => {});
    } else if (a === 'adaoyunu') {
      // 13–24. adaların oyunları: pencere perdesi bekliyorsa açılır; yoksa test kipinde doğru kart data-hedef'te
      const pencere = page.locator('.ing-ao-pencere-dugme[data-bekliyor="true"]');
      if (await pencere.count()) await pencere.click(tik).catch(() => {});
      else if (await page.locator('.ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
      else {
        const kutu = page.locator('[data-bekliyor="true"][data-hedef]');
        const hedef = await kutu.getAttribute('data-hedef', bak).catch(() => null);
        if (hedef) await page.locator(`.ing-ao-kart[data-kart="${hedef}"]`).click(tik).catch(() => {});
      }
    } else if (a === 'saykoy') {
      const hedef = Number(await page.locator('.ing-tepsi').getAttribute('data-hedef', bak).catch(() => 0));
      const dolu = await page.locator('.ing-tepsi-yuva.ing-dolu').count();
      if (hedef && !(await page.locator('.ing-tepsi.ing-tamam').count())) await page.locator(dolu < hedef ? '.ing-saykoy-kaynak' : '.ing-saykoy-tamam').click(tik).catch(() => {});
    }
    else if (a === 'canlandir') await page.locator('.ing-yildiz-dugme:not([hidden])').click(tik).catch(() => {});
    else if (a === 'yerlestir') {
      // Sahneye Taşı: test kipinde istenen eşya rafın data-hedef'inde; kart sahneye sürüklenir
      const hedef = await page.locator('.ing-yr-raf').getAttribute('data-hedef', bak).catch(() => null);
      const kart = page.locator(`.ing-yr-kart[data-kelime="${hedef}"]:not(.ing-yr-kondu)`);
      if (hedef && await kart.count()) await kart.dragTo(page.locator('.ing-yr-sahne'), { timeout: 3000 }).catch(() => {});
    }
    else if (a === 'tarif' || a === 'sohbet') {
      if (await page.locator('.ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
      else {
        const kap = page.locator(a === 'tarif' ? '.ing-secenekler' : '.ing-cevaplar');
        const hedef = await kap.getAttribute('data-hedef', bak).catch(() => null);
        if (hedef) await kap.locator(`[data-ifade="${hedef}"]`).click(tik).catch(() => {});
      }
    } else if (a === 'kur') {
      if (await page.locator('.ing-yildiz-dugme:not([hidden])').count()) await page.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
      else {
        const dolu = await page.locator('.ing-kur-yuva.ing-dolu').count();
        await page.locator(`.ing-kur-taslar .ing-tas:not(.ing-kullanildi)[data-sira="${dolu}"]`).first().click(tik).catch(() => {});
      }
    } else if (a === 'hikaye') await page.locator('.ing-hikaye-ileri:not([hidden])').click(tik).catch(() => {});
    else if (a === 'sirala') {
      const dolu = await page.locator('.ing-sirala-yuva.ing-dolu').count();
      await page.locator(`.ing-sirala-resim:not(.ing-kullanildi)[data-sira="${dolu}"]`).click(tik).catch(() => {});
    }
    await page.waitForTimeout(60);
  }
  return gorulen;
}

test('ana ekran: Ceren karşılar, dört bölüm (Dersler · Oyunlar · Masallar · Kelimelerim) ve derse başlama düğmesi görünür; menüye dönüş bağlantısı var', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await expect(page.locator('.ing[data-ekran="ana"]')).toBeVisible();
  // ana ekran ağaç ev sınıfıdır (sahne, 23 Kasım): Ceren, dört köşe (harita, sandık, raf, albüm) ve başla minderi
  await expect(page.locator('[data-nesne="ceren"]')).toBeVisible();
  for (const n of ['harita', 'sandik', 'raf', 'album']) await expect(page.locator(`button[data-nesne="${n}"]`)).toBeVisible();
  await expect(page.locator('[data-nesne="minder"]')).toContainText('Derse başla');
  await expect(page.locator('a.ing-ev')).toHaveAttribute('href', /\.\.\//);
  // çizimi ve sesi tamam olmayan ünite haritada açılmaz: kapalı adaya dokununca ders paneli gelmez
  await page.locator('[data-nesne="harita"]').click(tik);
  await expect(page.locator('.ing-ada').first()).toBeVisible();
  const bekleyen = page.locator('.ing-ada.ing-bekliyor');
  if (await bekleyen.count()) {
    await bekleyen.first().click(tik);
    await expect(page.locator('.ing-unite-paneli')).toHaveCount(0);
  }
  expect(hatalar).toEqual([]);
});

test('ilk ders (hayvanlar) baştan sona oynanır: geçit, bul, şarkı, söyle; yıldız ve çiftliğin yedi çıkartması kaydedilir, albümde görünür', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  await page.goto('./ingilizce/?test=1');
  await page.locator('[data-nesne="minder"]').click(tik);
  const gorulen = await dersiOyna(page);
  expect(gorulen).toEqual(['selam', 'gecit', 'bul', 'sarki', 'soyle', 'veda', 'sonuc']);

  const kayit = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), ANAHTAR);
  expect(kayit.dersler['ciftlik-1']).toBe(3); // hatasız oynandı: üç yıldız
  expect(kayit.cikartmalar).toEqual(['sheep', 'cow', 'duck', 'cat', 'dog', 'horse', 'chicken']);
  expect(kayit.tanisildi).toBe(true);
  await expect(page.locator('.ing-sonuc-yildiz .ing-dolu')).toHaveCount(3);
  await expect(page.locator('.ing-sonuc-cikartma')).toHaveCount(7);

  // sıradaki ders önerilir; ana ekranda "devam" yazar ve 2. dersi gösterir
  await expect(page.locator('.ing-ana-dugme')).toContainText('Sıradaki ders');
  await page.goto('./ingilizce/?test=1');
  await expect(page.locator('[data-nesne="minder"]')).toContainText('Derse devam et');
  await expect(page.locator('[data-nesne="minder"]')).toContainText('30 hayvan');

  // albüm: 1. dersin yedi çiftlik çıkartması dolu, biri boş (pig 2. derste);
  // çıkartmaya dokununca kelime kartı açılır
  await page.locator('[data-nesne="album"]').click(tik);
  await expect(page.locator('.ing-yuva:not(.ing-bos)')).toHaveCount(7);
  expect(await page.locator('.ing-yuva.ing-bos').count()).toBe(1); // çiftliğin sekizinci kelimesi (pig) 2. derste gelir
  await page.locator('.ing-yuva:not(.ing-bos)').first().click(tik);
  await expect(page.locator('.ing-kelime-karti .ing-bant strong')).toHaveText('sheep');
  expect(hatalar).toEqual([]);
});

test('yanlış cevap dersi kilitlemez: ders yine biter, hatalar sayılır ve daha az yıldız verilir', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  await page.goto('./ingilizce/?test=1&ders=ciftlik-1');
  const gorulen = await dersiOyna(page, true);
  expect(gorulen[gorulen.length - 1]).toBe('sonuc');
  const kayit = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), ANAHTAR);
  expect(kayit.dersler['ciftlik-1']).toBeLessThan(3);
  expect(kayit.dersler['ciftlik-1']).toBeGreaterThanOrEqual(1);
  // bilemediği kelimenin yanlış sayısı kaydedildi (aralıklı tekrar bunu kullanır)
  expect(Object.values(kayit.kelimeler as Record<string, { yanlis: number }>).some((d) => d.yanlis > 0)).toBe(true);
  expect(hatalar).toEqual([]);
});

test('Oyunlar: Fener Avı kelime öğrenilmeden kilitli, bir adanın üç kelimesinden sonra açılır ve baştan sona oynanır', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  await page.goto('./ingilizce/?test=1&ekran=oyunlar');
  const kart = page.locator('[data-oyun="fener"]');
  await expect(kart).toBeVisible();
  await expect(page.locator('.ing-oyun-karti')).toHaveCount(0); // eski dokuz oyun yok
  await expect(kart).toHaveClass(/ing-kilitli/);
  await kart.click(tik);
  await expect(page.locator('.ing[data-ekran="oyunlar"]')).toBeVisible(); // kilitli oyun açılmadı

  await page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ surum: 1, dersler: { 'ciftlik-1': 3 }, kelimeler: {}, cikartmalar: ['sheep', 'cow', 'duck', 'cat'], tekrar: { gun: '', adet: 0 }, tanisildi: true })), ANAHTAR);
  await page.goto('./ingilizce/?test=1&ekran=oyunlar');
  await expect(kart).not.toHaveClass(/ing-kilitli/);
  await kart.click(tik);
  await expect(page.locator('.ing-fener-sahne .ing-nesne')).toHaveCount(8);
  const gorulen = await dersiOyna(page);
  expect(gorulen).toEqual(['fener', 'sonuc']);
  await expect(page.locator('.ing-sonuc-cikartma')).toHaveCount(4);
  await expect(page.locator('.ing-ana-dugme')).toContainText('Tekrar oyna');
  expect(hatalar).toEqual([]);
});

test('üst seviyeler (taslak görünümü): cümle dersi ve hikâye dersi baştan sona oynanır, ilerleme kaydedilir', async ({ page }) => {
  // taslak görünümünde çizimi ve sesi gelmemiş dersler de yer tutucularla açılır; burada denenen akışın kendisidir
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  await page.goto('./ingilizce/?test=1&taslak&ders=ciftlik-4');
  expect(await dersiOyna(page)).toEqual(['selam', 'anlat', 'tarif', 'kur', 'veda', 'sonuc']);
  await expect(page.locator('.ing-sonuc-cumle')).toHaveCount(4);
  // 5. ve 6. ders yeni oyunlarla: Doğru mu?, cümle hafızası, Polly'nin Dürbünü, Sen Söyle
  await page.goto('./ingilizce/?test=1&taslak&ders=ciftlik-5');
  expect(await dersiOyna(page)).toEqual(['selam', 'anlat', 'dogrumu', 'posta', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=ciftlik-6');
  expect(await dersiOyna(page)).toEqual(['selam', 'hafiza2', 'yakala', 'soyle2', 'veda', 'sonuc']);
  // sayılı kalıpların adasında dürbünün yerinde Say ve Koy oynanır
  await page.goto('./ingilizce/?test=1&taslak&ders=sayilar-6');
  expect(await dersiOyna(page)).toEqual(['selam', 'hafiza2', 'saykoy', 'soyle2', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=ciftlik-7');
  expect(await dersiOyna(page)).toEqual(['selam', 'sohbet', 'sensor', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=ciftlik-9');
  expect(await dersiOyna(page)).toEqual(['selam', 'hikaye', 'masaloyun', 'sirala', 'veda', 'sonuc']);
  const kayit = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), ANAHTAR);
  expect(kayit.dersler['ciftlik-4']).toBe(3);
  expect(kayit.dersler['ciftlik-7']).toBe(3);
  expect(kayit.dersler['ciftlik-9']).toBe(3);
  for (const id of ['ciftlik-5', 'ciftlik-6', 'sayilar-6']) expect(kayit.dersler[id], id).toBe(3);
  // üst seviye dersleri çıkartma vermez
  expect(kayit.cikartmalar).toEqual([]);

  // ada panelinde seviye sekmeleri: üç seviye görünür, 2. seviyeye geçilince o seviyenin üç dersi listelenir
  await page.goto('./ingilizce/?test=1&taslak&ekran=adalar');
  await page.locator('.ing-ada[data-unite="ciftlik"]').click(tik);
  await expect(page.locator('.ing-seviye')).toHaveCount(3);
  await expect(page.locator('.ing-ders-dugme')).toHaveCount(3);
});

test('Masal Kitaplığı: on iki kitap rafta; Çiftlik masalı açık, öbürleri kelimeler öğrenilince; masal saati baştan sona oynanır, ilerleme yazılmaz', async ({ page }) => {
  await page.goto('./ingilizce/');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  // gerçek görünüm: yeni çocukta yalnız ilk adanın masalı açık
  await page.goto('./ingilizce/?ekran=masallar');
  await expect(page.locator('.ing-kitap')).toHaveCount(12);
  await expect(page.locator('.ing-kitap.ing-kilitli')).toHaveCount(11);
  await expect(page.locator('.ing-kitap[data-unite="ciftlik"]')).not.toHaveClass(/ing-kilitli/);
  // test kipinde masal saati: Çiftlik'in kitabı Masal 2.0 göl masalını açar (çizimleri geldi, 22 Kasım), sonra Masal Oyunu
  await page.goto('./ingilizce/?test=1&masal=ciftlik');
  expect(await dersiOyna(page)).toEqual(['masal2', 'masaloyun', 'sonuc']);
  // yeni masalı henüz olmayan adanın kitabı eski masalı açar
  await page.goto('./ingilizce/?test=1&masal=renkler');
  expect(await dersiOyna(page)).toEqual(['hikaye', 'masaloyun', 'sonuc']);
  await expect(page.locator('.ing-sonuc-baslik')).toHaveText('Masal bitti!');
  const kayit = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), ANAHTAR);
  expect(Object.keys(kayit.dersler ?? {})).toEqual([]);
});

test('Oyunlar: Hayvanat Bahçesi kartı açılır; altı bölümlü bahçe baştan sona oynanır, sonunda yüz hayvanlık duvar dolar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&ekran=oyunlar');
  const kart = page.locator('[data-oyun="bahce"]');
  await expect(kart).toBeVisible();
  await kart.click(tik);
  expect(await dersiOyna(page)).toEqual(['bahce', 'sonuc']);
  expect(hatalar).toEqual([]);
});

test('13–24. adalar (taslak görünümü): her seviyeden dersler ve adaya özel oyunlar baştan sona oynanır', async ({ page }) => {
  test.setTimeout(240000);
  const hatalar = hataTopla(page);
  // önceki derste öğrenilen kelimeler sonraki derslere kısa ısınma tekrarı getirir; akış onsuz karşılaştırılır
  const oyna = async () => (await dersiOyna(page)).filter((x) => x !== 'tekrar');
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  // Seviye 1: Meyve ve Sebze'nin ilk dersi (dört yeni kelime); 22 Kasım'dan beri Bul'un yerinde Ovala, Bul (bahçe toprağı)
  await page.goto('./ingilizce/?test=1&taslak&ders=meyve-1');
  expect(await oyna()).toEqual(['selam', 'tanis', 'ovala', 'ogret', 'soyle', 'veda', 'sonuc']);
  // Seviye 2: Evim (Kino evin neresinde), Doğa'nın cümle şenliği (sayılı kalıplar: Say ve Koy)
  await page.goto('./ingilizce/?test=1&taslak&ders=evim-4');
  expect(await oyna()).toEqual(['selam', 'anlat', 'tarif', 'kur', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=doga-6');
  expect(await oyna()).toEqual(['selam', 'hafiza2', 'adaoyunu', 'soyle2', 'veda', 'sonuc']);
  // Seviye 3: Hava (evet–hayır soruları), Sofra (çocuğun kendi cevabı), Sayılar 2'nin hikâyesi
  await page.goto('./ingilizce/?test=1&taslak&ders=hava-7');
  expect(await oyna()).toEqual(['selam', 'sohbet', 'sensor', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=sofra-7');
  expect(await oyna()).toEqual(['selam', 'sohbet', 'sensor', 'veda', 'sonuc']);
  await page.goto('./ingilizce/?test=1&taslak&ders=sayilar2-9');
  expect(await oyna()).toEqual(['selam', 'hikaye', 'masaloyun', 'sirala', 'veda', 'sonuc']);
  const kayit = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{}'), ANAHTAR);
  for (const id of ['meyve-1', 'evim-4', 'doga-6', 'hava-7', 'sofra-7', 'sayilar2-9']) expect(kayit.dersler[id], id).toBeGreaterThanOrEqual(1);
  // taslak haritada 24 ada sayfalara bölünür
  await page.goto('./ingilizce/?test=1&taslak&ekran=adalar');
  await expect(page.locator('.ing-ada').first()).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('13–24. adaların kendi oyunları (taslak): on iki adanın 6. dersi baştan sona', async ({ page }) => {
  test.setTimeout(600000);
  const hatalar = hataTopla(page);
  const oyna = async () => (await dersiOyna(page)).filter((x) => x !== 'tekrar');
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate((k) => localStorage.removeItem(k), ANAHTAR);
  const cihaz = test.info().project.name.split('-')[0];
  // dosyanın genel ekranı telefon; iPad projesinde görüntü iPad boyunda alınsın
  if (cihaz === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
  for (const ada of ['evim', 'duygular', 'hava', 'gunum', 'sofra', 'meyve', 'doga', 'okul', 'sekiller', 'park', 'vucudum', 'sayilar2']) {
    await page.goto(`./ingilizce/?test=1&taslak&ders=${ada}-6`);
    // oyunun ikinci turunda kartlar beklerken görüntü (output/ingilizce/ada-oyunlari/)
    let cekildi = false;
    const adimlar = (await dersiOyna(page, false, async (a) => {
      if (cekildi || a !== 'adaoyunu') return;
      const bekleyen = page.locator('[data-bekliyor="true"][data-hedef] .ing-ao-kart');
      await bekleyen.first().waitFor({ timeout: 3000 }).catch(() => {});
      if (!(await bekleyen.count())) return;
      // Günüm'de ve Hava'da sahnede iz kalsın (dolu kare, giyilmiş giysi); öbürlerinde ilk tur yeter
      if ((ada === 'gunum' || ada === 'hava') && !(await page.locator('.ing-ao-dolu, .ing-ao-giyili').count())) return;
      cekildi = true;
      await page.waitForTimeout(900);
      await page.screenshot({ path: `output/ingilizce/ada-oyunlari/${cihaz}-${ada}.png` });
    })).filter((x) => x !== 'tekrar');
    expect(adimlar, ada).toEqual(['selam', 'hafiza2', 'adaoyunu', 'soyle2', 'veda', 'sonuc']);
    expect(cekildi, ada).toBe(true);
  }
  expect(hatalar).toEqual([]);
});

test('Renkli Kino (taslak): Oyunlar kartı açılır, dört giysi doğru renkte giyilir, fotoğrafta şapka ve çorap söylenir', async ({ page }) => {
  test.setTimeout(180000);
  const hatalar = hataTopla(page);
  const cihaz = test.info().project.name.split('-')[0];
  if (cihaz === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('./ingilizce/?test=1&taslak&ekran=oyunlar');
  const kart = page.locator('[data-oyun="renkli"]');
  await expect(kart).toBeVisible();
  await page.screenshot({ path: `output/ingilizce/renkli-kino/${cihaz}-oyunlar.png` });
  await kart.click(tik);
  let cekildi = false;
  const adimlar = await dersiOyna(page, false, async (a) => {
    if (cekildi || a !== 'adaoyunu' || !(await page.locator('.ing-ao-giyili').count())) return;
    const bekleyen = page.locator('.ing-ao-rk-dolap[data-bekliyor="true"]');
    await bekleyen.waitFor({ timeout: 3000 }).catch(() => {});
    if (!(await bekleyen.count())) return;
    cekildi = true;
    await page.waitForTimeout(700);
    await page.screenshot({ path: `output/ingilizce/renkli-kino/${cihaz}-oyun.png` });
  });
  expect(adimlar).toEqual(['adaoyunu', 'sonuc']);
  await expect(page.locator('.ing-ao-yazi').or(page.locator('.ing-sonuc-baslik')).first()).toBeVisible();
  expect(hatalar).toEqual([]);
});

test('Polly’s Riddles ve Odd One Out (taslak): Oyunlar kartlarından açılır, dörder tur baştan sona; bilmecede yanlış kart söner', async ({ page }) => {
  test.setTimeout(240000);
  const hatalar = hataTopla(page);
  const cihaz = test.info().project.name.split('-')[0];
  if (cihaz === 'ipad') await page.setViewportSize({ width: 1024, height: 768 });
  for (const [oyun, klasor] of [['bilmece', 'bilmece'], ['farkli', 'farkli-olan']] as const) {
    await page.goto('./ingilizce/?test=1&taslak&ekran=oyunlar');
    const kart = page.locator(`.ing-kucuk-oyun[data-oyun="${oyun}"]`);
    await expect(kart).toBeVisible();
    if (oyun === 'bilmece') await page.screenshot({ path: `output/ingilizce/${klasor}/${cihaz}-oyunlar.png` });
    await kart.click(tik);
    // ilk turda bilerek bir yanlış: bilmecede kart söner
    const kutu = page.locator('[data-bekliyor="true"][data-hedef]');
    await kutu.waitFor({ timeout: 20000 });
    const hedef = await kutu.getAttribute('data-hedef');
    await page.locator(`.ing-ao-kart:not([data-kart="${hedef}"])`).first().click(tik);
    if (oyun === 'bilmece') await expect(page.locator('.ing-ao-kart.ing-ao-sondu')).toHaveCount(1);
    // ikinci turda (hedef değişince) kartlar beklerken görüntü
    let cekildi = false;
    const adimlar = await dersiOyna(page, false, async (a) => {
      if (cekildi || a !== 'adaoyunu') return;
      const simdi = await page.locator('[data-bekliyor="true"][data-hedef]').getAttribute('data-hedef', { timeout: 500 }).catch(() => null);
      if (!simdi || simdi === hedef) return;
      const bekleyen = page.locator('[data-bekliyor="true"][data-hedef] .ing-ao-kart');
      await bekleyen.first().waitFor({ timeout: 4000 }).catch(() => {});
      if (!(await bekleyen.count())) return;
      cekildi = true;
      await page.waitForTimeout(900);
      await page.screenshot({ path: `output/ingilizce/${klasor}/${cihaz}-oyun.png` });
    });
    expect(adimlar, oyun).toEqual(['adaoyunu', 'sonuc']);
    expect(cekildi, oyun).toBe(true);
  }
  expect(hatalar).toEqual([]);
});

test('mini animasyonlar (taslak): hareketli kelime tanışmada animasyonla çıkar, ders sonunda başka biri oynar, Kelimelerim kartında oynar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./ingilizce/?test=1&taslak&ders=yiyecekler-1');
  await odulIzle(page);
  const tanisildi = new Set<string>();
  let odulGoruntusu = false;
  const gorulen = await dersiOyna(page, false, async (a) => {
    if (!odulGoruntusu && (await page.locator('.e2e-kopya').count())) { odulGoruntusu = true; await page.waitForTimeout(400); await page.screenshot({ path: `output/ingilizce/mini-animasyon/odul-${test.info().project.name}.png` }); await page.evaluate(() => document.querySelector('.e2e-kopya')?.remove()); }
    if (a !== 'tanis') return;
    const id = await page.evaluate(() => document.querySelector<HTMLElement>('.ing-kapak [data-mini]')?.dataset.mini ?? null).catch(() => null);
    if (id) tanisildi.add(id);
  });
  expect(gorulen).toContain('tanis');
  expect(gorulen[gorulen.length - 1], gorulen.join(' › ')).toBe('sonuc');
  expect([...tanisildi]).toEqual(['elma']);
  const kutlama = page.locator('.ing-sonuc .ing-ma-kutlama');
  await expect(kutlama).toHaveCount(1);
  const id = await kutlama.getAttribute('data-mini');
  expect(id).not.toBe('elma');
  // doğru cevap ödülü: üç doğru üst üste köşede, derste en çok iki; tanışmadaki ve kapanıştaki yinelenmez
  const oduller = await page.evaluate(() => (window as unknown as { __odul: string[] }).__odul);
  expect(oduller.length, oduller.join(',')).toBeGreaterThanOrEqual(1);
  expect(oduller.length).toBeLessThanOrEqual(2);
  expect(new Set([...oduller, 'elma', id]).size, [...oduller, id].join(',')).toBe(oduller.length + 2);
  expect(odulGoruntusu).toBe(true);
  await expect(page.locator('.ing-ma-odul-kutu')).toHaveCount(0);
  await page.screenshot({ path: `output/ingilizce/mini-animasyon/sonuc-${test.info().project.name}.png` });
  await kutlama.click(tik);
  await expect(kutlama).toHaveAttribute('data-oynuyor', 'true');
  expect(await page.evaluate(() => localStorage.getItem('minkino-ingilizce-mini-son'))).toBe(id);

  // Kelimelerim: apple kartı açılınca elma animasyonu
  await page.goto('./ingilizce/?test=1&taslak&ekran=album');
  await page.locator('.ing-album-sekme[aria-label^="Yiyecekler"]').click(tik);
  await page.locator('.ing-yuva[aria-label^="apple"]').click(tik);
  await expect(page.locator('.ing-kelime-karti [data-mini="elma"]')).toHaveCount(1);
  await page.screenshot({ path: `output/ingilizce/mini-animasyon/album-${test.info().project.name}.png` });
  expect(hatalar).toEqual([]);
});

/** Doğru cevap ödülü köşede kısa süre durur: sayfaya eklenen her ödülün animasyonunu window.__odul'a yazar */
async function odulIzle(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __odul: string[] };
    w.__odul = [];
    new MutationObserver((ml) => { for (const m of ml) for (const n of m.addedNodes) if (n instanceof HTMLElement && n.classList.contains('ing-ma-odul-kutu') && !n.classList.contains('e2e-kopya')) {
        w.__odul.push(n.querySelector<HTMLElement>('[data-mini]')?.dataset.mini ?? '?');
        // test kipinde ödül 30 ms durur: görüntü için ilkinin bir kopyası yerinde kalır (gözle'de çekilip silinir)
        if (w.__odul.length === 1) { const k = n.cloneNode(true) as HTMLElement; k.classList.add('e2e-kopya'); n.parentElement?.append(k); }
      } })
      .observe(document.body, { childList: true, subtree: true });
  });
}

test('mini animasyonlar: çizim yokken derste hiçbir mini animasyon görünmez', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./ingilizce/?test=1&ders=yiyecekler-1');
  await page.evaluate(() => {
    const w = window as unknown as { __mini: number };
    w.__mini = 0;
    new MutationObserver((ml) => { for (const m of ml) for (const n of m.addedNodes) if (n instanceof HTMLElement && (n.matches('[data-mini],.ing-ma-odul-kutu') || n.querySelector('[data-mini]'))) w.__mini++; })
      .observe(document.body, { childList: true, subtree: true });
  });
  const gorulen = await dersiOyna(page, false);
  expect(gorulen[gorulen.length - 1], gorulen.join(' › ')).toBe('sonuc');
  expect(await page.evaluate(() => (window as unknown as { __mini: number }).__mini)).toBe(0);
  await expect(page.locator('[data-mini]')).toHaveCount(0);
  expect(hatalar).toEqual([]);
});

/** Sahneye Taşı adımını oynar (eşyaları sahneye sürükler); adım bitince sıradaki adımın adını döndürür */
async function sahneyiOyna(page: Page, goruntu: string): Promise<{ sonraki: string; konan: number }> {
  let cekildi = false, a = '', konan = 0;
  for (let tur = 0; tur < 120; tur++) {
    a = await adim(page);
    if (a && a !== 'yerlestir') return { sonraki: a, konan };
    const hedef = await page.locator('.ing-yr-raf').getAttribute('data-hedef', bak).catch(() => null);
    const kart = page.locator(`.ing-yr-kart[data-kelime="${hedef}"]:not(.ing-yr-kondu)`);
    if (hedef && await kart.count()) await kart.dragTo(page.locator('.ing-yr-sahne'), { timeout: 3000 }).catch(() => {});
    konan = Math.max(konan, await page.locator('.ing-yr-esya.ing-yr-konuldu').count().catch(() => 0));
    if (!cekildi && konan >= 2) { cekildi = true; await page.screenshot({ path: goruntu }); }
  }
  return { sonraki: a, konan };
}

test('Sahneye Taşı (taslak): eşyalar sahneye sürüklenir, yerine oturup canlanır; yanlış eşya rafa döner (Odam, Yiyecekler, Vahşi)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate(() => localStorage.clear());
  for (const [ders, sahne, sonraki] of [['odam-2', 'oda', 'soyle'], ['yiyecekler-3', 'ogle', 'eslestir|soyle'], ['vahsi-2', 'safari', 'soyle']] as const) {
    await page.goto(`./ingilizce/?test=1&taslak&ders=${ders}&adim=yerlestir`);
    await expect(page.locator('.ing-yr-sahne')).toHaveAttribute('data-sahne', sahne);
    const raftaki = await page.locator('.ing-yr-kart').count();
    if (ders === 'odam-2') {
      // yanlış eşya: sahneye bırakılınca yerine oturmaz, kart rafta kalır
      await expect(page.locator('.ing-yr-raf[data-hedef]')).toHaveCount(1, { timeout: 8000 });
      const hedef = await page.locator('.ing-yr-raf').getAttribute('data-hedef');
      const yanlis = page.locator(`.ing-yr-kart:not([data-kelime="${hedef}"])`).first();
      await yanlis.dragTo(page.locator('.ing-yr-sahne'));
      await expect(page.locator('.ing-yr-esya.ing-yr-konuldu')).toHaveCount(0);
      await expect(yanlis).not.toHaveClass(/ing-yr-kondu/);
    }
    const { sonraki: sira, konan } = await sahneyiOyna(page, `output/ingilizce/yerlestir/${sahne}-${test.info().project.name}.png`);
    expect(sira, ders).toMatch(new RegExp(`^(${sonraki})$`));
    // yaşa göre üç ya da dört eşya taşınır; rafta fazladan bir ya da iki kart durur
    expect(konan, ders).toBeGreaterThanOrEqual(3);
    expect(raftaki - konan, ders).toBeGreaterThanOrEqual(1);
    expect(raftaki - konan, ders).toBeLessThanOrEqual(2);
  }
  expect(hatalar).toEqual([]);
});

test('Sahneye Taşı: çizim yokken ders yedeğini oynar (Odam 2. ders ve şenlik)', async ({ page }) => {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => localStorage.clear());
  for (const ders of ['odam-2', 'odam-3']) {
    await page.goto(`./ingilizce/?test=1&ders=${ders}&adim=yerlestir`);
    await page.waitForTimeout(1500);
    // ?adim=yerlestir dersin içinde öyle bir adım bulamaz: ders baştan açılır, sahne hiç görünmez
    await expect(page.locator('.ing-yr-sahne')).toHaveCount(0);
    expect(await adim(page), ders).toBe('selam');
  }
});

test('Söyle, Canlansın (taslak): parlayan yer söylenince canlanır; Yüzüm, Renkler, Taşıtlar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate(() => localStorage.clear());
  for (const [ders, sahne] of [['yuzum-3', 'kardan'], ['renkler-3', 'boya'], ['tasitlar-2', 'garaj']] as const) {
    await page.goto('./ingilizce/?test=1&taslak&ders=' + ders + '&adim=canlandir');
    await expect(page.locator('.ing-sc-sahne')).toHaveAttribute('data-sahne', sahne);
    let cekildi = false, gelen = 0, a = '';
    for (let tur = 0; tur < 120; tur++) {
      a = await adim(page);
      if (a && a !== 'canlandir') break;
      gelen = Math.max(gelen, await page.locator('.ing-sc-parca.ing-sc-geldi').count().catch(() => 0));
      if (!cekildi && gelen >= 2) { cekildi = true; await page.screenshot({ path: 'output/ingilizce/canlandir/' + sahne + '-' + test.info().project.name + '.png' }); }
      // renklerde parlayan eşyanın yanında renk kartı
      if (sahne === 'boya' && await page.locator('.ing-sc-isik').count()) expect(await page.locator('.ing-sc-renk-karti').count()).toBe(1);
      await page.locator('.ing-yildiz-dugme:not([hidden])').click(tik).catch(() => {});
    }
    expect(a, ders).toMatch(/^(veda|sarki)$/);
    expect(gelen, ders).toBeGreaterThanOrEqual(3);
    expect(cekildi, ders).toBe(true);
  }
  expect(hatalar).toEqual([]);
});

test('Söyle, Canlansın: çizim yokken ders düz söyleme adımını oynar', async ({ page }) => {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => localStorage.clear());
  for (const ders of ['tasitlar-2', 'renkler-3']) {
    await page.goto('./ingilizce/?test=1&ders=' + ders + '&adim=soyle');
    await expect.poll(() => adim(page), { timeout: 8000 }).toBe('soyle');
    await expect(page.locator('.ing-sc-sahne')).toHaveCount(0);
  }
});

/** Ovala, Bul: bir saklanma yerinin üstünü fareyle zikzak çizerek siler */
async function ovala(page: Page, kelime: string) {
  const k = await page.locator('.ing-ov-yer[data-kelime="' + kelime + '"]').boundingBox();
  if (!k) return;
  await page.mouse.move(k.x + k.width * 0.1, k.y + k.height * 0.2);
  await page.mouse.down();
  for (let i = 0; i <= 6; i++) await page.mouse.move(k.x + k.width * (i % 2 ? 0.9 : 0.1), k.y + k.height * (0.2 + i * 0.1), { steps: 6 });
  await page.mouse.up();
}

test('Ovala, Bul (taslak): örtü parmakla silinir; yanlış şey açılınca tur sürer, sorulan açılınca biter (Oyuncaklar, Meyve, Doğa)', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak');
  await page.evaluate(() => localStorage.clear());
  for (const [ders, sahne, sonraki] of [['oyuncaklar-1', 'kopuk', 'ogret'], ['meyve-3', 'toprak', 'eslestir|soyle'], ['doga-1', 'sis', 'ogret']] as const) {
    await page.goto('./ingilizce/?test=1&taslak&ders=' + ders + '&adim=ovala');
    await expect(page.locator('.ing-ov-sahne')).toHaveAttribute('data-sahne', sahne);
    await expect(page.locator('.ing-ov-sahne[data-hedef]')).toHaveCount(1, { timeout: 8000 });
    if (ders === 'oyuncaklar-1') {
      // yanlış yer: açılır ama tur bitmez, soru aynı kalır
      const ilk = await page.locator('.ing-ov-sahne').getAttribute('data-hedef');
      const yanlis = await page.locator('.ing-ov-yer:not([data-kelime="' + ilk + '"])').first().getAttribute('data-kelime');
      await page.waitForTimeout(400);
      await ovala(page, yanlis!);
      await page.waitForTimeout(300);
      expect(await page.locator('.ing-ov-sahne').getAttribute('data-hedef')).toBe(ilk);
      expect(await adim(page)).toBe('ovala');
    }
    let a = '', bulunan = 0, cekildi = false, onceki = '';
    for (let tur = 0; tur < 60; tur++) {
      a = await adim(page);
      if (a && a !== 'ovala') break;
      const hedef = await page.locator('.ing-ov-sahne').getAttribute('data-hedef', bak).catch(() => null);
      if (hedef && hedef !== onceki) { bulunan++; onceki = hedef; }
      if (hedef) await ovala(page, hedef);
      if (!cekildi && bulunan >= 2) { cekildi = true; await page.screenshot({ path: 'output/ingilizce/ovala/' + sahne + '-' + test.info().project.name + '.png' }); }
      await page.waitForTimeout(200);
    }
    expect(a, ders).toMatch(new RegExp('^(' + sonraki + ')' + String.fromCharCode(36)));
    expect(bulunan, ders).toBeGreaterThanOrEqual(3);
  }
  expect(hatalar).toEqual([]);
});

test('Ovala, Bul: çizim yokken ders Bul adımını oynar', async ({ page }) => {
  await page.goto('./ingilizce/?test=1');
  await page.evaluate(() => localStorage.clear());
  await page.goto('./ingilizce/?test=1&ders=doga-1&adim=bul');
  await expect.poll(() => adim(page), { timeout: 8000 }).toBe('bul');
  await expect(page.locator('.ing-ov-sahne')).toHaveCount(0);
});

test('Masal 2.0 · Kino at the Lake: altı sayfa; ana yere dokununca ileri çıkar; göl → muzlu ördek → şapkalı ördek; sonra göl soruları', async ({ page }) => {
  await page.goto('./ingilizce/?test=1&masal=ciftlik');
  const cerceve = page.locator('.ing-m2-cerceve');
  const cizim = () => page.locator('.ing-m2-sahne').getAttribute('data-cizim');
  const parlayinca = () => expect(cerceve).toHaveClass(/ing-m2-parlak/, { timeout: 15000 });
  const goruntu = (ad: string) => page.screenshot({ path: `output/ingilizce/masal2/${test.info().project.name}-${ad}.png` });
  await parlayinca();
  expect(await cizim()).toBe('gol-1');
  // ana yere dokunmadan ileri yok
  await expect(page.locator('.ing-m2-ileri')).toBeHidden();
  await goruntu('1-sapka-parlak');
  const sayfa = async (ad: string, yer: string) => {
    expect(await cizim()).toBe(ad);
    await page.locator(`.ing-m2-yer[data-yer="${yer}"]`).click();
    await expect(page.locator('.ing-m2-ileri')).toBeVisible({ timeout: 15000 });
    await page.locator('.ing-m2-ileri').click(tik); // düğme nabız gibi atar (hiç durmaz): zorla
  };
  await sayfa('gol-1', 'sapka');
  // söyle: "cow" sözcüğü ineğin üstünde durur; çocuk söyler (testte yıldız), inek canlanır
  await expect(page.locator('.ing-m2-sozcuk.ing-m2-kalici')).toHaveText('cow', { timeout: 15000 });
  await expect(page.locator('.ing-m2-soz .ing-yildiz-dugme')).toBeVisible({ timeout: 15000 });
  await goruntu('2-inek-soyle');
  await page.locator('.ing-m2-soz .ing-yildiz-dugme').click(tik);
  await expect(page.locator('.ing-m2-sozcuk.ing-m2-kalici')).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator('.ing-m2-ileri')).toBeVisible({ timeout: 15000 });
  await page.locator('.ing-m2-ileri').click(tik);
  await parlayinca();
  await sayfa('gol-3', 'sapka');
  // göl sayfası: göle dokun → muzlu ördek (şaka) → ördek kendiliğinden dalıp şapkayla çıkar (ikinci dokunuş yok, 22 Kasım tempo)
  await parlayinca();
  expect(await cizim()).toBe('gol-4');
  await page.locator('.ing-m2-yer[data-yer="gol"]').click();
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol-saka', { timeout: 15000 });
  await goruntu('4-muzlu-ordek');
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol-4b', { timeout: 15000 });
  await expect(page.locator('.ing-m2-ileri')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.ing-m2-resim')).toHaveCount(1, { timeout: 3000 });
  await goruntu('4-sapkali-ordek');
  await page.locator('.ing-m2-ileri').click(tik); // düğme nabız gibi atar (hiç durmaz): zorla
  await parlayinca();
  await sayfa('gol-5', 'ordek');
  // son sayfa: seç ("Where is the duck?"); inek yanlıştır (adını söyler, sallanır, soru sürer), ördek doğru; sonra Kino
  // kendiliğinden el sallar, ileri çıkar (test kipinde kendiliğinden çevrilmez)
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol-6', { timeout: 15000 });
  await expect(page.locator('.ing-m2-cerceve.ing-m2-secim')).toHaveAttribute('data-hedef', 'ordek', { timeout: 15000 });
  await goruntu('6-hangisi');
  await page.locator('.ing-m2-yer[data-yer="inek"]').click();
  await expect(page.locator('.ing-m2-sozcuk')).toHaveText('cow', { timeout: 5000 });
  await page.waitForTimeout(400);
  await expect(page.locator('.ing-m2-cerceve.ing-m2-secim')).toHaveCount(1);
  // gün batımında ördek ineğin önünde: ördeğe dokunmak ineği değil ördeği canlandırır
  // (kamera kayarken koordinatla tıklamak yanlış yere düşer: konumlu tıklama öğenin durmasını ve tıklamayı ördeğin aldığını bekler)
  const ordek = (await page.locator('.ing-m2-yer[data-yer="ordek"]').boundingBox())!;
  await page.locator('.ing-m2-yer[data-yer="ordek"]').click({ position: { x: ordek.width / 2, y: ordek.height * 0.3 } });
  // ördek doğru: adı söylenir ve sahnede parlar (hemen ardından Kino kendiliğinden el sallar), seçim biter
  await expect(page.locator('.ing-m2-sozcuk', { hasText: 'duck' })).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('.ing-m2-cerceve.ing-m2-secim')).toHaveCount(0);
  await expect(page.locator('.ing-m2-ileri')).toBeVisible({ timeout: 15000 });
  await goruntu('6-arkadaslar');
  await page.locator('.ing-m2-ileri').click(tik);
  await expect(page.locator('.ing[data-adim="masaloyun"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.ing-soru-balonu, .ing-masaloyun').first()).toBeVisible();
  await expect(page.locator('.ing-masaloyun-kart[data-secenek]').first()).toBeVisible({ timeout: 15000 });
  expect(await page.locator('.ing-masaloyun .ing-secenekler').getAttribute('data-hedef')).toMatch(/^(cow|blue|duck)$/);
  expect(await dersiOyna(page)).toEqual(['masaloyun', 'sonuc']);
});

test('Masal 2.0 motoru (taslak): tam ekran sahne; kumsal masalında deniz yıldızı sürüklenir, yanlış yerde geri döner, hedefte "starfish" parlar', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak&masal=renkler');
  // sahne ekranı kaplar: çerçeve görüş alanı kadar
  await expect(page.locator('.ing-m2-cerceve')).toBeVisible({ timeout: 15000 });
  const alan = await page.locator('.ing-m2').boundingBox(), cer = await page.locator('.ing-m2-cerceve').boundingBox();
  expect(Math.round(cer!.width)).toBe(Math.round(alan!.width));
  expect(Math.round(cer!.height)).toBe(Math.round(alan!.height));
  // 5. sayfaya kadar oynanır
  for (let i = 0; i < 600 && !(await page.locator('.ing-m2-tasinir').count()); i++) {
    if (await page.locator('.ing-m2-ileri:not([hidden])').count()) await page.locator('.ing-m2-ileri').click(tik).catch(() => {});
    else if (await page.locator('.ing-m2-cerceve.ing-m2-parlak .ing-m2-ana').count()) await page.locator('.ing-m2-cerceve.ing-m2-parlak .ing-m2-ana').click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(100);
  }
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'kumsal-5');
  // kamera kayarken koordinat eskir: katman iki ölçümde aynı yerdeyse sürüklenir
  const durunca = async () => {
    let once = '';
    for (let i = 0; i < 40; i++) {
      const b = await page.locator('[data-katman="yildiz"]').boundingBox();
      const s = b ? `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.width)}` : '';
      if (s && s === once) return;
      once = s; await page.waitForTimeout(150);
    }
  };
  const tasi = async (x: number, y: number) => {
    await durunca();
    const k = (await page.locator('.ing-m2-tasinir, [data-katman="yildiz"]').first().boundingBox())!;
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await page.mouse.down();
    await page.mouse.move(x, y, { steps: 8 }); await page.mouse.up();
  };
  // yanlış yere bırakılınca geri döner, taşınır kalır
  await tasi(alan!.x + 60, alan!.y + alan!.height / 2);
  await expect(page.locator('.ing-m2-tasinir')).toHaveCount(1);
  await expect.poll(() => page.locator('[data-katman="yildiz"]').evaluate((e) => (e as HTMLElement).style.translate)).toBe('');
  // hedefe bırakılınca oturur, sözcük parlar, sonra yengeç (ana) beklenir
  await durunca();
  const t = (await page.locator('.ing-m2-hedef').boundingBox())!;
  await tasi(t.x + t.width / 2, t.y + t.height / 2);
  await expect(page.locator('.ing-m2-sozcuk')).toHaveText('starfish', { timeout: 5000 });
  await expect(page.locator('.ing-m2-tasinir')).toHaveCount(0);
  await page.screenshot({ path: `output/ingilizce/masal2/${test.info().project.name}-surukle.png` });
  await expect(page.locator('.ing-m2-cerceve.ing-m2-parlak')).toHaveCount(1, { timeout: 15000 });
  expect(await dersiOyna(page)).toEqual(['masal2', 'masaloyun', 'sonuc']);
  expect(hatalar).toEqual([]);
});

test('Masal 2.0 v2 · Kino at the Lake (taslak): kaçan şapka, Yes/No (yanlışa komik karşılık), "No!" söyle, şapkayı Kino\'ya sürükle, herkesin şapkası', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./ingilizce/?test=1&taslak&masal=ciftlik');
  const ileriyeGec = async () => { await expect(page.locator('.ing-m2-ileri')).toBeVisible({ timeout: 15000 }); await page.locator('.ing-m2-ileri').click(tik); };
  const parlayanaDokun = async (yer: string) => {
    await expect(page.locator(`.ing-m2-cerceve.ing-m2-parlak .ing-m2-ana[data-yer="${yer}"]`)).toHaveCount(1, { timeout: 15000 });
    await kameraDurunca(page);
    await page.locator(`.ing-m2-yer[data-yer="${yer}"]`).click(tik);
  };
  // 1 · sevgili şapka
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol2-1', { timeout: 15000 });
  await parlayanaDokun('sapka');
  await ileriyeGec();
  // 2 · "cow" söyle (testte yıldız)
  await expect(page.locator('.ing-m2-sozcuk.ing-m2-kalici')).toHaveText('cow', { timeout: 15000 });
  await page.locator('.ing-m2-soz .ing-yildiz-dugme').click(tik);
  await ileriyeGec();
  // 3 · kaçan şapka: iki dokunuşta kaçar, üçüncüde göle düşer, resim değişir
  await expect(page.locator('.ing-m2-cerceve')).toHaveAttribute('data-yakala', 'sapka', { timeout: 15000 });
  const sapka = page.locator('[data-katman="sapka"]');
  for (let i = 0; i < 3; i++) {
    await kameraDurunca(page);
    const once = await sapka.evaluate((e) => (e as HTMLElement).style.translate);
    await sapka.click(tik);
    if (i < 2) await expect.poll(() => sapka.evaluate((e) => (e as HTMLElement).style.translate)).not.toBe(once);
    await page.waitForTimeout(450);
  }
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol2-3b', { timeout: 15000 });
  await expect(sapka).toBeHidden();
  await ileriyeGec();
  // 4 · kabarcık → muzlu ördek; "Yes" yanlış: düğme jöle gibi esner, soru sürer; "No" doğru
  await parlayanaDokun('kabarcik');
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol2-4b', { timeout: 15000 });
  await expect(page.locator('.ing-m2-evethayir')).toBeVisible({ timeout: 15000 });
  await page.locator('.ing-m2-evet').click(tik);
  await expect(page.locator('.ing-m2-evet')).toHaveClass(/ing-salla/);
  await expect(page.locator('.ing-m2-evethayir')).toBeVisible();
  await page.waitForTimeout(300);
  await page.locator('.ing-m2-hayir').click(tik);
  await expect(page.locator('.ing-m2-evethayir')).toBeHidden({ timeout: 15000 });
  await expect(page.locator('.ing-m2-sozcuk', { hasText: 'banana' })).toHaveCount(1, { timeout: 5000 });
  await ileriyeGec();
  // 5 · kabarcık → yapraklı kurbağa; çocuk "No!" söyler (testte yıldız)
  await parlayanaDokun('kabarcik');
  await expect(page.locator('.ing-m2-sozcuk.ing-m2-kalici')).toHaveText('No!', { timeout: 15000 });
  await page.locator('.ing-m2-soz .ing-yildiz-dugme').click(tik);
  await expect(page.locator('.ing-m2-sozcuk', { hasText: 'leaf' })).toHaveCount(1, { timeout: 5000 });
  await ileriyeGec();
  // 6 · kabarcık → şapkalı ördek; "Yes"; şapka katmanı görünür, Kino'nun başına sürüklenir
  await expect(page.locator('[data-katman="sapka"]')).toBeHidden({ timeout: 15000 });
  await parlayanaDokun('kabarcik');
  await expect(page.locator('.ing-m2-sahne')).toHaveAttribute('data-cizim', 'gol2-6b', { timeout: 15000 });
  await expect(page.locator('.ing-m2-evethayir')).toBeVisible({ timeout: 15000 });
  await page.locator('.ing-m2-evet').click(tik);
  await expect(page.locator('.ing-m2-tasinir')).toHaveCount(1, { timeout: 15000 });
  // sürükleme beklenirken Kino'ya dokunmak adımı atlatmaz
  await page.locator('.ing-m2-yer[data-yer="kino"]').click(tik);
  await expect(page.locator('.ing-m2-tasinir')).toHaveCount(1);
  await kameraDurunca(page);
  const k = (await page.locator('.ing-m2-tasinir').boundingBox())!, t = (await page.locator('.ing-m2-hedef').boundingBox())!;
  await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await page.mouse.down();
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 8 }); await page.mouse.up();
  await expect(page.locator('.ing-m2-tasinir')).toHaveCount(0, { timeout: 5000 });
  await ileriyeGec();
  // 7 · herkesin şapkası: üç arkadaşa dokunulunca masal biter
  for (const yer of ['inek', 'ordek', 'kurbaga']) await parlayanaDokun(yer);
  await ileriyeGec();
  await expect(page.locator('.ing[data-adim="masaloyun"]')).toBeVisible({ timeout: 15000 });
  expect(await dersiOyna(page)).toEqual(['masaloyun', 'sonuc']);
  expect(hatalar).toEqual([]);
});
