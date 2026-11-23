import { test, expect, type Page } from '@playwright/test';
import { etkinSira } from '../../matematik/src/tur-sirasi';
import { existsSync } from 'node:fs';
import { YENI_CIZIMLER, YENI_KLASOR, YENI_SOZ, tahterevalliYeri, yeniTur, type YeniTur } from '../../matematik/src/yeni-turlar';
import { ekAdi } from '../../matematik/src/tur-sirasi';
import { enAz, enCok, kacFazla, type Meyve } from '../../matematik/src/roket-kelebek-grafik';
import { BIRAKMA, DOST_ADI, SAKLANMA_YERI } from '../../matematik/src/konum-sira';
/** Uygulamadaki kapı (ek-turlar.ts) gibi: ek tur ancak çizimleri ve sesleri yerindeyse sırada (Node'da dosyalara bakar). */
function ekAcikNode(n: number) {
  const ad = ekAdi(n);
  if (!ad || ad === 'tahterevalli') return true;
  const yt = ad as YeniTur;
  return YENI_CIZIMLER[yt].every((c) => existsSync('assets/matematik/' + YENI_KLASOR[yt] + '/' + c + '.webp'))
    && (Object.values(YENI_SOZ[yt]) as number[]).every((i) => existsSync('assets/matematik/ses/ses-' + i + '.mp3'))
    && (!['ritim', 'roket'].includes(yt) || existsSync('assets/matematik/ders/onluk/rakam-0.webp'));
}
test.describe.configure({ timeout: 90000 });
// Tezgâhtaki oyuncaklar sürekli "nefes alır" (yalnız hareket azaltılmamışken); Playwright kımıldayan öğeye tıklamaz.
// Oyun, hareket azaltılınca nefesi durdurur (stil.css · prefers-reduced-motion): testler bu ayarla koşar
// (ipucu testi oyuncağa tıkladıktan sonra hareketi kendisi açar).
test.use({ reducedMotion: 'reduce' });
test.beforeEach(async ({ page }) => {
  const ekran = page.viewportSize();
  if (ekran && ekran.width < 600 && ekran.height > ekran.width) await page.setViewportSize({ width: ekran.height, height: ekran.width });
  await page.addInitScript(() => {
    if (!localStorage.getItem('minkino-matematik-1-sayi')) localStorage.setItem('minkino-matematik-1-sayi',JSON.stringify({adim:0,yer:0,secimler:[],kuleTamam:true}));
    // Ceren Öğretmen'in Sayılar dersi bitmiş say: bu testler Sayı masasının sonraki oyunlarını dener (ders: matematik-ceren.spec.ts).
    if (!localStorage.getItem('minkino-matematik-ceren-sayilar-v1')) localStorage.setItem('minkino-matematik-ceren-sayilar-v1', JSON.stringify({ biten: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], simdi: 10, tanitildi: true, bitti: true })); if (!localStorage.getItem('minkino-matematik-ceren-sekiller-v1')) localStorage.setItem('minkino-matematik-ceren-sekiller-v1', JSON.stringify({ biten: ['daire', 'kare', 'ucgen', 'dikdortgen'], simdi: 'dikdortgen', tanitildi: true, bitti: true })); if (!localStorage.getItem('minkino-matematik-ceren-olcu-v1')) localStorage.setItem('minkino-matematik-ceren-olcu-v1', JSON.stringify({ biten: ['buyuk-kucuk', 'uzun-kisa', 'cok-az', 'agir-hafif'], simdi: 'agir-hafif', tanitildi: true, bitti: true })); if (!localStorage.getItem('minkino-matematik-ceren-oruntu-v1')) localStorage.setItem('minkino-matematik-ceren-oruntu-v1', JSON.stringify({ biten: ['renk', 'sekil', 'ses', 'kendi'], simdi: 'kendi', tanitildi: true, bitti: true })); if (!localStorage.getItem('minkino-matematik-ceren-onluk-v1')) localStorage.setItem('minkino-matematik-ceren-onluk-v1', JSON.stringify({ biten: ['onluk', 'on-uc', 'abakus', 'yirmi'], simdi: 'yirmi', tanitildi: true, bitti: true })); if (!localStorage.getItem('minkino-matematik-ceren-topla-v1')) localStorage.setItem('minkino-matematik-ceren-topla-v1', JSON.stringify({ biten: ['fazla', 'doldur', 'eksik', 'on'], simdi: 'on', tanitildi: true, bitti: true }));
    if (!localStorage.getItem('minkino-kartlar-v1'))
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5 }));
  });
});
const alanlar = ['sayi', 'sekil', 'olcu', 'fener'] as const;
async function tik(p: Page, s: string, i = 0) {
  await p.locator(s).nth(i).click();
}
/** Hızlı Gözler turunun bütün soruları: görünen nesneleri say, saklanınca rakamına bas. */
async function hizliGozleriOyna(p: Page) {
  const pano = p.locator('.pano.hizli-gozler');
  await expect(pano).toBeVisible();
  const soru = await p.locator('.hg-yildizlar i').count();
  for (let q = 0; q < soru; q++) {
    // Yeni soru çizildi (panoda soru numarası); nesneler saklanınca rakamına bas.
    const yeni = p.locator('.pano.hizli-gozler[data-soru="' + q + '"]');
    await expect(yeni).toHaveAttribute('data-durum', 'sor', { timeout: 15000 });
    const adet = await yeni.locator('.hg-nesne').count();
    await p.getByRole('button', { name: String(adet), exact: true }).click();
  }
}
/** Başarı perdesi ya da sahnenin istenen durumu gelene dek bekler; başarı geldiyse true. */
async function basariYaDa(p: Page, secici: string, sure = 40000) {
  await expect.poll(() => p.locator('.basari, ' + secici).count(), { timeout: sure }).toBeGreaterThan(0);
  return (await p.locator('.basari').count()) > 0;
}
const oz = (p: Page, secici: string, ad: string) => p.locator(secici).first().getAttribute(ad);
/**
 * Yeni turlar (yeni-turlar.ts, tur-sirasi.ts → EK_TURLAR; uygulamada çizimleri ve sesleri tamam olduğu için açık). Her sahne
 * doğru cevabı kendi data alanlarından okur: Lokum iki farklı bölüşüm, Zıpzıp saklı fındıklar, Baba kutular, M14–M27.
 */
async function yeniTuruOyna(p: Page, yt: YeniTur) {
  if (yt === 'lokum') {
    const n = Number(await p.locator('.ik-sahne').getAttribute('data-toplam'));
    for (const [sol, sag] of [[n - 1, 1], [1, n - 1]]) {
      await expect(p.locator('.ik-orta .ik-mandalina')).toHaveCount(n, { timeout: 20000 });
      for (let i = 0; i < sol; i++) await tik(p, '.ik-kase-0');
      for (let i = 0; i < sag; i++) await tik(p, '.ik-kase-1');
    }
  } else if (yt === 'zipzip') {
    const n = Number(await p.locator('.sf-sahne').getAttribute('data-toplam'));
    for (let i = 0; i < n; i++) await tik(p, '.sf-findik', i);
    for (const no of [0, 1]) {
      await expect(p.locator('.sf-sahne[data-adim="sor"][data-soru="' + no + '"]')).toHaveCount(1, { timeout: 20000 });
      await tik(p, '.sf-rakam[aria-label="' + (await p.locator('.sf-sahne').getAttribute('data-gizli')) + '"]');
    }
  } else if (yt === 'baba') {
    const sahne = p.locator('.tc-sahne');
    while (!(await p.locator('.basari').count())) {
      await expect(p.locator('.tc-parca.secili')).toHaveCount(1, { timeout: 10000 });
      const kutu = await p.evaluate(() => {
        const s = document.querySelector<HTMLElement>('.tc-sahne');
        const secili = s?.querySelector<HTMLElement>('.tc-parca.secili');
        if (!s || !secili) return -1;
        const [renk, bicim, boy] = secili.dataset.parca!.split('-');
        const o = s.dataset.olcut;
        return o === 'renk' ? (renk === 'kirmizi' ? 0 : 1) : o === 'bicim' ? (bicim === 'daire' ? 0 : 1) : (boy === 'buyuk' ? 0 : 1);
      });
      if (kutu < 0) break;
      const once = Number(await sahne.getAttribute('data-yerlesen'));
      await tik(p, '.tc-kutu-' + kutu);
      if (once < 5) await expect(sahne).toHaveAttribute('data-yerlesen', String(once + 1));
      else await expect(p.locator('.basari, .tc-sahne[data-yerlesen="0"]')).toHaveCount(1, { timeout: 10000 });
    }
  } else if (yt === 'sandik') {
    const n = Number(await oz(p, '.es-sahne', 'data-toplam'));
    for (let i = 0; i < n; i++) {
      await expect(p.locator('.es-sahne')).toHaveAttribute('data-durum', 'topla', { timeout: 20000 });
      await p.locator('.es-elma:not([hidden])').first().click();
      await expect(p.locator('.es-sahne')).toHaveAttribute('data-sayilan', String(i + 1));
    }
  } else if (yt === 'kurabiye') {
    while (!(await basariYaDa(p, '.kt-sahne[data-durum="sec"]'))) {
      const n = await oz(p, '.kt-sahne', 'data-sayi'), tepsi = await oz(p, '.kt-sahne', 'data-tepsi');
      await tik(p, '.kt-bayrak[aria-label="' + n + '"]');
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.kt-sahne', 'data-tepsi')) !== tepsi, { timeout: 30000 }).toBe(true);
    }
  } else if (yt === 'tren') {
    const sayilar = (await p.locator('.st-bekleyen:not([hidden])').evaluateAll((bs) => bs.map((b) => Number(b.getAttribute('aria-label'))))).sort((a, b) => a - b);
    for (const n of sayilar) await tik(p, '.st-bekleyen[aria-label="' + n + '"]');
  } else if (yt === 'balon' || yt === 'kek') {
    const [sahne, rakam, cevap] = yt === 'balon' ? ['.bb-sahne', '.bb-rakam', 'data-balon'] : ['.kf-sahne', '.kf-rakam', 'data-sonuc'];
    for (const no of [0, 1]) {
      await expect(p.locator(sahne + '[data-soru="' + no + '"][data-durum="sor"]')).toHaveCount(1, { timeout: 40000 });
      await tik(p, rakam + '[aria-label="' + (await oz(p, sahne, cevap)) + '"]');
    }
  } else if (yt === 'asansor') {
    for (let i = 0; ; i++) {
      if (await basariYaDa(p, '.la-sahne[data-adim="' + i + '"]')) break;
      const kat = Number(await oz(p, '.la-sahne', 'data-kat')), yon = await oz(p, '.la-sahne', 'data-yon');
      await tik(p, '.la-levha[aria-label="' + (kat + (yon === 'fazla' ? 1 : -1)) + '"]');
      await expect(p.locator('.la-sahne')).toHaveAttribute('data-kat', String(kat + (yon === 'fazla' ? 1 : -1)));
    }
  } else if (yt === 'sekilbahce') {
    for (let i = 0; ; i++) {
      if (await basariYaDa(p, '.sb-sahne[data-durum="bul"]')) break;
      const sekil = await oz(p, '.sb-sahne', 'data-sekil');
      for (const b of await p.locator('.sb-nesne[data-dogru="1"]').all()) await b.click();
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.sb-sahne', 'data-sekil')) !== sekil, { timeout: 30000 }).toBe(true);
    }
  } else if (yt === 'resim') {
    while (!(await basariYaDa(p, '.ry-sahne[data-durum="yap"]'))) {
      const resim = await oz(p, '.ry-sahne', 'data-resim');
      for (const ad of await p.locator('.ry-parca').evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-label')!))) {
        await p.locator('.ry-parca[aria-label="' + ad + '"]').first().click();
        await p.locator('.ry-yer[aria-label="Yer: ' + ad + '"]:not([disabled])').first().click();
      }
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.ry-sahne', 'data-resim')) !== resim, { timeout: 40000 }).toBe(true);
    }
  } else if (yt === 'buyuyen') {
    while (!(await basariYaDa(p, '.bf-sahne[data-durum="kur"]'))) {
      const desen = await oz(p, '.bf-sahne', 'data-desen'), hedef = Number(await oz(p, '.bf-sahne', 'data-hedef'));
      for (let i = 0; i < hedef; i++) await p.locator('.bf-yer').click({ position: { x: 20, y: 8 } });
      await tik(p, '.bf-onay');
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.bf-sahne', 'data-desen')) !== desen, { timeout: 40000 }).toBe(true);
    }
  } else if (yt === 'bayrak') {
    while (!(await basariYaDa(p, '.sy-sahne[data-durum="sec"]'))) {
      const dizi = await oz(p, '.sy-sahne', 'data-dizi');
      for (const tur of await p.locator('.sy-yer.bos').evaluateAll((es) => es.map((e) => (e as HTMLElement).dataset.tur!))) await tik(p, '.sy-secim[aria-label="' + tur.replace('-', ' ') + '"]');
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.sy-sahne', 'data-dizi')) !== dizi, { timeout: 30000 }).toBe(true);
    }
  } else if (yt === 'calgi') {
    await expect(p.locator('.ks-sahne')).toHaveAttribute('data-durum', 'kur', { timeout: 20000 });
    const birim = (await p.locator('.ks-yuva').count()) === 10 ? ['çıngırak', 'davul', 'davul'] : ['davul', 'alkış'];
    for (const ad of birim) await tik(p, '.ks-kart[aria-label="' + ad + '"]');
    await expect(p.locator('.ks-sahne')).toHaveAttribute('data-durum', 'sor', { timeout: 40000 });
    await tik(p, '.ks-kart[aria-label="' + birim[0] + '"]');
  } else if (yt === 'surahi') {
    const ADI: Record<string, string> = { dolu: 'Dolu bardak', bos: 'Boş bardak', yarim: 'Yarım bardak' };
    for (const seviye of ['yarim', 'dolu']) {
      await expect(p.locator('.as-sahne')).toHaveAttribute('data-durum', 'doldur', { timeout: 20000 });
      await tik(p, '.as-surahi');
      await expect(p.locator('.as-sahne')).toHaveAttribute('data-seviye', seviye, { timeout: 10000 });
    }
    while (!(await basariYaDa(p, '.as-sahne[data-durum="sor"]'))) {
      if (await p.locator('.as-rakam').count()) { await tik(p, '.as-rakam[aria-label="' + (await oz(p, '.as-sahne', 'data-kac-bardak')) + '"]'); continue; }
      const soru = await oz(p, '.as-sahne', 'data-soru');
      await tik(p, '.as-secim[aria-label="' + ADI[(await oz(p, '.as-sahne', 'data-hedef'))!] + '"]');
      await expect.poll(async () => (await p.locator('.basari, .as-rakam').count()) > 0 || (await oz(p, '.as-sahne', 'data-soru')) !== soru, { timeout: 30000 }).toBe(true);
    }
  } else if (yt === 'yarim') {
    while (!(await basariYaDa(p, '.by-sahne:is([data-durum="kes"], [data-durum="birlestir"], [data-durum="sor"])'))) {
      const d = await oz(p, '.by-sahne', 'data-durum');
      if (d === 'kes') await tik(p, '.by-butun');
      else if (d === 'birlestir') await tik(p, '.by-yarim');
      else await tik(p, '.by-rakam[aria-label="' + Number(await oz(p, '.by-sahne', 'data-yarim')) / 2 + '"]');
      await expect(p.locator('.by-sahne')).not.toHaveAttribute('data-durum', d!, { timeout: 10000 });
    }
  } else if (yt === 'ritim') {
    while (!(await basariYaDa(p, '.rz-sahne[data-durum="sec"]', 60000))) {
      const adim = Number(await oz(p, '.rz-sahne', 'data-adim')), sira = Number(await oz(p, '.rz-sahne', 'data-sira')), bas = Number(await oz(p, '.rz-sahne', 'data-bas'));
      await tik(p, '.rz-secim[aria-label="' + (bas + adim * sira) + '"]');
      await expect(p.locator('.rz-sahne')).not.toHaveAttribute('data-durum', 'sec', { timeout: 10000 });
    }
  } else if (yt === 'pay') {
    while (!(await basariYaDa(p, '.ep-sahne[data-durum="koy"]', 60000))) {
      const soru = await oz(p, '.ep-sahne', 'data-soru');
      const tabaklar = (await oz(p, '.ep-sahne', 'data-tabaklar'))!.split(',').length, kalan = Number(await oz(p, '.ep-sahne', 'data-kalan'));
      for (let i = 0; i < kalan; i++) await tik(p, '.ep-tabak', i % tabaklar);
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.ep-sahne', 'data-soru')) !== soru, { timeout: 40000 }).toBe(true);
    }
  } else if (yt === 'roket') {
    while (!(await basariYaDa(p, '.rg-sahne[data-durum="sec"]', 60000))) {
      const kalan = await p.locator('.rg-blok').evaluateAll((b) => b.map((x) => Number(x.getAttribute('aria-label'))));
      await tik(p, '.rg-blok[aria-label="' + Math.max(...kalan) + '"]');
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await p.locator('.rg-blok').count()) < kalan.length, { timeout: 20000 }).toBe(true);
    }
  } else if (yt === 'kelebek') {
    while (!(await basariYaDa(p, '.kk-sahne[data-durum="koy"]', 60000))) {
      const ki = await oz(p, '.kk-sahne', 'data-kelebek');
      const desen = (await oz(p, '.kk-sahne', 'data-desen'))!.split(',').map((x) => x.split(':'));
      for (const [yer, renk] of desen) {
        if (await p.locator('.kk-renk').count()) await p.getByRole('button', { name: renk === 'mavi' ? 'Mavi benek' : 'Turuncu benek', exact: true }).click();
        await p.getByRole('button', { name: 'Benek yeri ' + (Number(yer) + 1), exact: true }).click();
      }
      await expect.poll(async () => (await p.locator('.basari').count()) > 0 || (await oz(p, '.kk-sahne', 'data-kelebek')) !== ki, { timeout: 40000 }).toBe(true);
    }
  } else if (yt === 'grafik') {
    const ad = { elma: 'Elma sütunu', armut: 'Armut sütunu', muz: 'Muz sütunu' } as const;
    await expect(p.locator('.mg-sahne')).toHaveAttribute('data-durum', /diz|cok|az|fazla/, { timeout: 40000 });
    while ((await p.locator('.mg-sepetteki').count()) > 0) await tik(p, '.mg-sepetteki');
    await expect(p.locator('.mg-sahne')).toHaveAttribute('data-durum', /cok|az|fazla/, { timeout: 40000 });
    const [e, a, m] = (await oz(p, '.mg-sahne', 'data-sayilar'))!.split(',').map(Number);
    const v = { sayilar: { elma: e, armut: a, muz: m }, fazla: (await oz(p, '.mg-sahne', 'data-fazla'))!.split(',') as [Meyve, Meyve] };
    if ((await oz(p, '.mg-sahne', 'data-durum')) === 'cok') await p.getByRole('button', { name: ad[enCok(v.sayilar)], exact: true }).click();
    await expect(p.locator('.mg-sahne')).toHaveAttribute('data-durum', /az|fazla/, { timeout: 40000 });
    if ((await oz(p, '.mg-sahne', 'data-durum')) === 'az') await p.getByRole('button', { name: ad[enAz(v.sayilar)], exact: true }).click();
    await expect(p.locator('.mg-sahne')).toHaveAttribute('data-durum', 'fazla', { timeout: 40000 });
    await tik(p, '.mg-kart[aria-label="' + kacFazla(v) + '"]');
  } else if (yt === 'saklambac') {
    // Lokum'la Saklambaç (konum-sira.ts): "bul"da Ceren'in söylediği yere (data-rel) dokun; "koy"da istenen eşyayı istenen
    // yerin bırakma alanının ortasına sürükle (fon pikseli, sahnenin kutusundan).
    const sahne = p.locator('.sk-sahne');
    while (!(await basariYaDa(p, '.sk-sahne:is([data-durum="bul"], [data-durum="koy"])', 60000))) {
      const rel = (await sahne.getAttribute('data-rel')) as keyof typeof BIRAKMA;
      if ((await sahne.getAttribute('data-durum')) === 'bul') {
        const yer = SAKLANMA_YERI[rel as keyof typeof SAKLANMA_YERI];
        await p.getByRole('button', { name: { sandik: 'Sandık', masa: 'Masa', koltuk: 'Koltuk', minder: 'Minderler' }[yer], exact: true }).click();
      } else {
        const oyuncak = (await sahne.getAttribute('data-oyuncak')) === 'top' ? 'Top' : 'Ayıcık';
        const b = (await p.getByRole('button', { name: oyuncak, exact: true }).boundingBox())!;
        const r = (await sahne.boundingBox())!, k = BIRAKMA[rel];
        const hx = r.x + ((k.x + k.w / 2) * r.width) / 1672, hy = r.y + ((k.y + k.h / 2) * r.width) / 1672;
        await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
        await p.mouse.down();
        await p.mouse.move(b.x + b.width / 2 + 20, b.y + b.height / 2 - 20, { steps: 4 });
        await p.mouse.move(hx, hy, { steps: 12 });
        await p.mouse.up();
      }
      await expect(sahne).not.toHaveAttribute('data-durum', /^(bul|koy)$/, { timeout: 10000 });
    }
  } else if (yt === 'kaydirak') {
    // Kaydırak Sırası: "kim"de sıradaki o arkadaşa (data-cevap. sıradaki), "kac"ta kartına dokun.
    const sahne = p.locator('.kd-sahne');
    while (!(await basariYaDa(p, '.kd-sahne:is([data-durum="kim"], [data-durum="kac"])', 60000))) {
      const cevap = Number(await sahne.getAttribute('data-cevap'));
      if ((await sahne.getAttribute('data-durum')) === 'kim') {
        const dizi = (await sahne.getAttribute('data-dizi'))!.split(',') as (keyof typeof DOST_ADI)[];
        await p.getByRole('button', { name: DOST_ADI[dizi[cevap - 1]], exact: true }).click();
      } else await p.getByRole('button', { name: String(cevap), exact: true }).click();
      await expect(sahne).not.toHaveAttribute('data-durum', /^(kim|kac)$/, { timeout: 10000 });
    }
  } else if (yt === 'gun') {
    while (!(await basariYaDa(p, '.kg-sahne[data-durum="sec"]'))) {
      await tik(p, '.kg-kart[data-yer="' + (await oz(p, '.kg-sahne', 'data-sira')) + '"]');
      await expect(p.locator('.kg-sahne')).not.toHaveAttribute('data-durum', 'sec', { timeout: 10000 });
    }
  }
}
/** Bulut'un Tahterevalli Dengesi: her turda hedef kadar küp tahtaya (5+ yaşta iki tur: 4, sonra 6). */
async function tahterevalliOyna(p: Page) {
  const dunya = p.locator('.tv-dunya');
  for (let tur = 0; ; tur++) {
    await expect(dunya).toHaveAttribute('data-hedef', /\d/, { timeout: 20000 });
    const hedef = Number(await dunya.getAttribute('data-hedef'));
    for (let i = 1; i <= hedef; i++) {
      await p.locator('.tv-yigin-kup').first().click();
      await expect(dunya).toHaveAttribute('data-kup', String(i));
    }
    await expect(p.locator('.basari, .tv-dunya[data-kup="0"]')).toHaveCount(1, { timeout: 30000 });
    if (await p.locator('.basari').count()) return;
  }
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
const yollar = [['minik', 3, 'minik-'], ['dort', 4, 'dort-'], ['bes', 5, '']] as const;
const fenerAdi = ['Güneş', 'Ay', 'Yıldız', 'Zil'];
for (const [yol, yas, onek] of yollar)
for (const [k, id] of alanlar.entries())
  test('Matematik · ' + yas + ' yaş · ' + id + ' yolunun tamamı', async ({ page: p }) => {
    // Uzayan sıralar (ek turlar, gerçek sesle): en uzun yol 5+ Sayı masası, 17 tur.
    test.setTimeout(900000);
    const hatalar: string[] = [];
    p.on('pageerror', (e) => hatalar.push(e.message));
    p.on('response', (r) => {
      if (r.status() >= 400) hatalar.push(r.url());
    });
    await p.addInitScript(([y, o]) => {
      localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: y }));
      if (!localStorage.getItem('minkino-matematik-1-' + o + 'sayi'))
        localStorage.setItem('minkino-matematik-1-' + o + 'sayi', JSON.stringify({ adim: 0, yer: 0, secimler: [], kuleTamam: true, surum: 2 }));
    }, [yas, onek] as const);
    await p.goto('/matematik/');
    await tik(p, '.kose', k);
    // Yaşın yolu (tur-sirasi.ts): her adımın tur numarası işi ve zorluğu seçer.
    // 3 ve 4 yaşta çeşit adımla kayar (main.ts → cesit; Fener örüntüsünün ilk sembolü).
    // Uygulamada bütün ek turların çizimleri ve sesleri tamam: sıra uzundur (tur-sirasi.ts → etkinSira).
    const sira = etkinSira(yol, id, ekAcikNode);
    for (let s = 0; s < sira.length; s++) {
      const n = sira[s],
        asama = Math.floor(n / 4),
        tur = n % 4,
        cesit = yol === 'bes' ? 0 : s;
      const yt = yeniTur(yol, id, n);
      if (yt) await yeniTuruOyna(p, yt);
      else if (tahterevalliYeri(yol, id, n)) await tahterevalliOyna(p);
      else if (k === 0) {
        if (n === 16 || n === 17) {
          // Hızlı Gözler: nesneler bir an görünür ve saklanır; çocuk gördüğü adedin rakamına basar.
          await hizliGozleriOyna(p);
        } else if (n === 4) {
          // Sipariş fişindeki meyveleri sırayla sepete koy.
          const fis = await p.locator('.pazar-fis img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
          const tuslar = await p.locator('.tezgah .parca img').evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
          for (const src of fis) await tik(p, '.tezgah .parca', tuslar.indexOf(src));
          await tik(p, '.onay');
        } else if ([2, 5, 13].includes(n)) {
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
          await expect(p.locator('.say-kumesi img')).toHaveCount(target);
          if (s === 0) {
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
        if (s === sira.length - 1) {
          // Ay gezgini: kareler, daireler; 5 yaş ve üstü üçgenleri de arar.
          const parca = (i: number) => p.locator('.tg-arac [data-indis="' + i + '"]');
          await parca(3).click();
          await expect(p.locator('.tg-dolu')).toHaveCount(0);
          for (const i of yol === 'bes' ? [1, 0, 4, 2, 3, 6, 5] : [1, 0, 4, 2, 3]) await parca(i).click();
          await expect(p.locator('.tg-yola-cik')).toBeVisible();
          await expect(p.locator('.tg-stok')).toHaveCount(0);
        } else if (n === 0) {
          for (const ad of ['Gövde', 'Direk', 'Üçgen yelken', 'Deniz fenerine yanaş']) await p.getByRole('button', { name: ad, exact: true }).click();
        } else if (n === 1 || n === 9) {
          // 2–3 yaşta arabanın gövdesi hazır gelir.
          for (const ad of [...(yol === 'minik' ? [] : ['Gövde']), 'Tekerlek', 'Tekerlek', 'Kare kabin'])
            await p.getByRole('button', { name: ad, exact: true }).click();
        } else if ([4, 5].includes(n)) {
          for (const i of n === 4 ? [0, 1] : [3, 0, 1]) await tik(p, '.parca', i);
        } else if ([2, 6, 10, 14].includes(n))
          for (const i of [[0], [2], [1, 0], [2, 1, 0]][asama]) await tik(p, '.yer-' + i);
        else if ([3, 7, 11, 15].includes(n)) {
          for (const v of asama < 2 ? [0, 1, 2] : [0, 3, 1, 2])
            await p.getByLabel('Bitkinin gelişim resmi ' + v, { exact: true }).click();
        } else {
          const adet = asama >= 2 ? 4 : 3,
            a = (tur + cesit + (asama >= 2 ? 3 : 0)) % adet,
            b = (a + 1) % adet;
          for (const i of [[a], [a, b], [a, b], [a, a, b]][asama]) await tik(p, '.parca', i);
        }
      } else if (k === 2) {
        // Misket parkuru yalnız 5 yaş ve üstünde, ilk turdan önce açılır.
        if (s === 0 && yas >= 5) await p.getByLabel('Diğer ölçü oyunlarına geç').click();
        if ([2, 7, 11, 14].includes(n)) {
          for (let j = 0; j < [2, 3, 5, 6][asama]; j++) await tik(p, '.parca');
          await tik(p, '.onay');
        } else if ([3, 6, 9, 15].includes(n)) {
          if (n >= 9) for (const i of [1, 2, 0]) await tik(p, '.sutun', i);
          await tik(p, '.sutun', ((asama % 2 ? 0 : 2) - tur - asama + 12) % 3);
        } else {
          const count = await p.locator('.taslar i').count();
          expect(count).toBe(yol === 'minik' ? 3 : [2, 3, 2, 4, 3, 4, 5, 4, 4, 5, 4, 6, 5, 6, 7, 8][n]);
          for (let j = 0; j < count; j++) await tik(p, '.parca');
        }
      } else {
        if (n === 10 || n === 14) {
          const seq = n === 10 ? [1, 0] : [2, 0, 1];
          for (const i of [...seq, ...seq]) await tik(p, '.parca', i);
        } else if (tur === 3) {
          // Örüntünün boşlukları dizinin son öğeleridir (ilk oyunda da aynı kural).
          const motif = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]][asama],
            ilk = yol === 'bes' ? asama : s,
            uzun = motif.length * (yol === 'minik' || !asama ? 2 : 3),
            bos = [1, 2, 2, 3][asama];
          for (let j = 0; j < bos; j++)
            await p.getByRole('button', { name: fenerAdi[(ilk + motif[(uzun - bos + j) % motif.length]) % 4], exact: true }).click();
        } else {
          const adet = yol === 'minik' ? (s * 4 < sira.length ? 1 : 2) : yol === 'dort' ? Math.min(3, 2 + asama) : 2 + asama;
          await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 14000 });
          for (let j = 0; j < adet; j++)
            await tik(p, '.parca', (tur + j + cesit + (asama >= 2 ? Math.floor(j / 2) : 0)) % Math.min(4, asama + 2));
        }
      }
      await expect
        .poll(() => p.evaluate((a) => JSON.parse(localStorage['minkino-matematik-1-' + a]).adim, onek + id), {
          timeout: 10000,
        })
        .toBe(s + 1);
      if (s < sira.length - 1) await expect(p.locator('.basari')).toHaveCount(0, { timeout: 8500 });
      // Mola anı (her 3–4 turda): çocuk "Devam" der, kaldığı turdan sürer.
      if (s < sira.length - 1 && (await p.locator('.mola').count())) await p.getByRole('button', { name: 'Devam', exact: true }).click();
      if (n === 4) {
        await p.reload();
        await tik(p, '.kose', k);
      }
    }
    // Son turun kapanış sözü (ör. "Kino'nun günü tamam!") bitince hatıra gelir; söz çalmazsa 6 sn sonra.
    await expect(p.locator('.hatira')).toBeVisible({ timeout: 15000 });
    expect(hatalar).toEqual([]);
  });

// Aynı turda ekran yönü değişse veya sayfa yenilense de tamamlanan hareket korunur.
test('Paylaşma turunda dokunma, gerçek sürükleme, yön değişimi ve yeniden açma', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam:true, adim: 1, yer: 0, secimler: [], surum: 2 })),
  );
  await p.reload();
  // 5 yaş Sayı masasının 2. adımı (tur 5): iki tabağa ikişer meyve.
  await tik(p, '.kose');
  const sol = p.locator('.sofra .tabak').first();
  await p.locator('.pay-meyvesi').first().dragTo(sol);
  await expect(sol.locator('img')).toHaveCount(1);
  await p.setViewportSize({ width: 390, height: 844 });
  await expect(p.locator('.telefonu-cevir')).toBeVisible();
  await expect(p.locator('#sahne')).toBeHidden();
  await p.setViewportSize({ width: 844, height: 390 });
  await p.reload();
  await tik(p, '.kose');
  await expect(sol.locator('img')).toHaveCount(1);
  await tik(p, '.sofra .tabak');
  await expect(sol.locator('img')).toHaveCount(2);
  const tabak = await sol.boundingBox();
  for (const meyve of await sol.locator('img').all()) {
    const boyut = await meyve.boundingBox();
    expect(Math.min(boyut!.width, boyut!.height)).toBeGreaterThan(tabak!.height * 0.5);
  }
  // Dolan tabağa fazla meyve konmaz.
  await tik(p, '.sofra .tabak');
  await expect(sol.locator('img')).toHaveCount(2);
  await tik(p, '.sofra .tabak', 1);
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.sofra .tabak', 1);
  await expect(p.locator('.basari')).toHaveCount(1);
});
test('Fenerin ses düğmesi sırayı çalar, erken dokunma veya yanlış sıra puan vermez', async ({ page: p }) => {
  await p.goto('/matematik/');
  // 5 yaş Fener sırasının 2. adımı (tur 5): üç fenerli gösteri, sıra 1 · 2 · 0.
  await p.evaluate(() => localStorage.setItem('minkino-matematik-1-fener', JSON.stringify({adim: 1, yer: 0, secimler: [], surum: 2})));
  await p.reload();
  await tik(p, '.kose', 3);
  await expect(p.locator('.tezgah')).toHaveAttribute('inert', '');
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 0);
  await expect(p.locator('.tezgah')).toHaveAttribute('inert', '');
  await tik(p, '.nav.ses');
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 1);
  await p.reload();
  await tik(p, '.kose', 3);
  await expect(p.locator('.fener-sira img')).toHaveCount(1);
  await expect(p.locator('.tezgah')).not.toHaveAttribute('inert', '', { timeout: 10000 });
  await tik(p, '.parca', 2);
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.parca', 0);
  await expect(p.locator('.basari')).toBeVisible();
});
test('Boncuklar birlikte kayar, geriye itilebilir ve yerinde kalır', async ({ page: p }) => {
  await p.goto('/matematik/');
  // 5 yaşta ilk boncuk turu beş meyve ister.
  await tik(p, '.k0');
  await tik(p, '.boncuk', 3);
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(4);
  await p.reload();
  await tik(p, '.k0');
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(4);
  // Kaymış üçüncü boncuğa dokunmak onu ve arkasındakileri geri iter; ilk ikisi kalır.
  await tik(p, '.boncuk', 2);
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(2);
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.boncuk', 4);
  await expect(p.getByRole('button', { name: 'Bir boncuk geri al', exact: true })).toHaveCount(5);
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toBeVisible();
});

test('Rakamın yarım kalan kalem izi geri gelir, hatalı başlangıç iz bırakmaz', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    // 5 yaş Sayı sırasının 4. adımı (tur 7): rakamı yaz.
    localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam:true, adim: 3, yer: 0, secimler: [1], surum: 2 })),
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
  // Bütün sırayı (açık ek turlarla) bitirmiş kayıt. Eski 16 turluk düzenin bitmiş kaydı ise hatırasıyla ilk yeni tura geçer
  // (sürüm 2 gibi; kayit.ts → tasi).
  const son = etkinSira('bes', 'fener', ekAcikNode).length;
  await p.evaluate((n) =>
    localStorage.setItem('minkino-matematik-1-fener', JSON.stringify({ adim: n, yer: 0, secimler: [], hatira: true, surum: 3 })), son);
  await p.reload();
  // Kazanılan fener hatırası tezgâhta görünür: oyuncağın yıldızı.
  await expect(p.locator('.k3 .kart-yildiz')).toBeVisible();
  await tik(p, '.k3');
  // İlk oyunda örüntünün boşluğu Ay'dı; ikinci kez oynayışta dizi kayar, boşluk Yıldız olur.
  await p.getByRole('button', {name: 'Ay', exact: true}).click();
  await expect(p.locator('.basari')).toHaveCount(0);
  await p.getByRole('button', {name: 'Yıldız', exact: true}).click();
  await expect(p.locator('.basari')).toBeVisible();
  expect(await p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-fener']))).toMatchObject({ adim: 1, hatira: true, surum: 3 });
});
test('Terazideki birimler kefeye basar ve denge ancak iki taraf eşitken onaylanır', async ({ page: p }) => {
  // 5+ yaşta son ölçü turu uygulamada Bulut'un Tahterevalli Dengesi; altı taşlı terazi test kipinde (tahterevalli kapalı) sınanır.
  await p.goto('/matematik/?test=1');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 5, yer: 0, secimler: [], surum: 2 })),
  );
  await p.reload();
  // 5 yaş Ölçü sırasının son turu (tur 14): sol kefede altı taş.
  await tik(p, '.k2');
  await p.setViewportSize({ width: 844, height: 390 });
  const resimler = p.locator('.kefe.sol span img');
  const aralik = await resimler.evaluateAll((els) => {
    const r = els.map((el) => el.getBoundingClientRect());
    return Math.abs(r[4].bottom - r[0].top);
  });
  expect(aralik).toBeLessThan(2);
  for (let i = 0; i < 7; i++) await tik(p, '.tezgah .parca');
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.kefe.sag');
  await expect(p.locator('.kefe.sag span img')).toHaveCount(6);
  await tik(p, '.onay');
  await expect(p.locator('.basari')).toBeVisible();
});

test('Manavda çocuk meyveleri doğru raflara dağıttıktan sonra en az olanı bulur', async ({ page: p }) => {
  test.setTimeout(60000);
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 4, yer: 0, secimler: [], surum: 2 })),
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
  await expect(p.locator('.basari')).toHaveCount(0);
  await tik(p, '.sutun', 0);
  await expect(p.locator('.basari')).toBeVisible();
});

test('Telefonun geri düğmesi tezgâha döner ve park edilen turu korur', async ({ page: p }) => {
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
  test.setTimeout(180000);
  // 5+ yolun Şekil evi sırası (ek turlarla, tur-sirasi.ts): sıranın son turuna gelinir ve o tur oynanır (bugün Ay gezgini;
  // sıra değişip son tur yeni bir tur olursa onun oyuncusu çalışır).
  const sira = etkinSira('bes', 'sekil', ekAcikNode), son = sira.length - 1;
  await page.goto('/matematik/');
  await page.evaluate((adim) => {
    localStorage.setItem('minkino-kartlar-v1', JSON.stringify({ yas: 5, ayarlar: { muzik: false } }));
    localStorage.setItem('minkino-abonelik-v1', JSON.stringify({ premium: true, zaman: Date.now() }));
    localStorage.setItem('minkino-matematik-1-sekil', JSON.stringify({ adim, yer: 0, secimler: [], gezginBulunan: [0, 1, 2, 3, 4, 5], kuleTamam: true, misketiGecti: true, surum: 3 }));
  }, son);
  await page.reload();
  await page.getByRole('button', { name: 'Şekil evi', exact: true }).click();
  const yt = yeniTur('bes', 'sekil', sira[son]);
  if (yt) await yeniTuruOyna(page, yt);
  else await page.getByRole('button', { name: 'Burun', exact: true }).click();
  await expect(page.getByRole('status', {name: 'Tamamlandı'})).toBeVisible({timeout: 20000});
  await page.evaluate(() => {
    for (const arkada of [true, false])
      window.dispatchEvent(new CustomEvent('minkino:arkaplan', {detail: {arkada}}));
  });
  await expect(page.locator('.hatira')).toBeVisible();
  // Kayıt sıranın sonuna varır.
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-sekil']).adim)).toBe(sira.length);
});
test('İpucu doğru şekilden hedef gölgeye başlar', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() =>
    localStorage.setItem('minkino-matematik-1-sekil', JSON.stringify({ adim: 2, yer: 0, secimler: [], surum: 2 })),
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

// Eski 16 turluk düzende yarıda kalan kayıt yeni sıraya oranıyla geçer: yarım tur baştan açılır, kule ve hatıra korunur.
test('Eski kayıtta yarım kalan oyun yeni kısa sıranın aynı yerinden sürer', async ({ page: p }) => {
  await p.goto('/matematik/');
  await p.evaluate(() => {
    localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam: true, adim: 8, yer: 3, secimler: [0, 1], tarif: 1, siparis: true }));
    localStorage.setItem('minkino-matematik-1-sekil', JSON.stringify({ adim: 15, yer: 0, secimler: [], gezginBulunan: [0, 1] }));
    localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 12, yer: 0, secimler: [], hatira: true }));
  });
  await p.reload();
  const oku = (k: string) => p.evaluate((a) => JSON.parse(localStorage['minkino-matematik-1-' + a]), k);
  // Sayı masası 16'nın 8'inde kalmıştı: oran eski turların kısa sırasından (10 turun 5'i, "4 + 3"; 5+ yaşta Lokum'un İki
  // Kâsesi). Ek turlar orana girmez, çizim geldikçe kayıt kaymaz. Yarım hareketler silinir.
  await tik(p, '.k0');
  await expect(p.locator('.ik-sahne')).toBeVisible();
  expect(await oku('sayi')).toMatchObject({ adim: 5, yer: 0, secimler: [], kuleTamam: true, surum: 3 });
  expect(await oku('sayi')).not.toHaveProperty('tarif');
  expect(await oku('sayi')).not.toHaveProperty('siparis');
  // Şekil evi son turdaydı: Ay gezgini bulunan parçalarla açılır.
  await tik(p, '.ev');
  await tik(p, '.k1');
  await expect(p.locator('.tg-arac')).toBeVisible();
  await expect(p.locator('.tg-bulundu')).toHaveCount(2);
  // Ay gezgini sıranın en sonunda (açık ek turlardan sonra).
  expect(await oku('sekil')).toMatchObject({ adim: etkinSira('bes', 'sekil', ekAcikNode).length - 1, surum: 3 });
  // Hatırası olan ve yeniden oynayan çocuğun yıldızı kalır.
  await tik(p, '.ev');
  await expect(p.locator('.k2 .kart-yildiz')).toBeVisible();
  // 16'nın 12'si → eski altı turun 4'ü; hatıra kalır.
  expect(await oku('olcu')).toMatchObject({ adim: 4, hatira: true, surum: 3 });
});

// Uzun açıklayan övgü türün ilk turunda bir kez; sonra kısa sonuç. Misket parkuru 5+ yaşta ilk kurdele turunun yerine geçer,
// o yüzden açıklama sıraya göre değil, söylendiği kayda işlenerek verilir.
test('Misket ilk ölçü turunun yerine geçse de kurdele açıklaması bir kez duyulur; ikincisinde taş sayısı söylenir', async ({ page: p }) => {
  await p.addInitScript(() => {
    const w = window as unknown as { __calan: string[] };
    w.__calan = [];
    const asil = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { w.__calan.push(decodeURIComponent(this.src.split('/').pop() ?? '')); return asil.call(this); };
  });
  const calan = () => p.evaluate(() => (window as unknown as { __calan: string[] }).__calan);
  const kurdele = async (anlatilan?: string[]) => {
    await p.evaluate((a) => localStorage.setItem('minkino-matematik-1-olcu', JSON.stringify({ adim: 3, yer: 0, secimler: [], misketiGecti: true, surum: 2, ...(a ? { anlatilan: a } : {}) })), anlatilan);
    await p.reload();
    await tik(p, '.k2');
    // 5 yaş Ölçü sırasının 4. adımı (tur 12): iki kurdele uç uca, beş taş.
    const adet = await p.locator('.taslar i').count();
    expect(adet).toBe(5);
    for (let i = 0; i < adet; i++) await tik(p, '.tezgah .parca');
    await expect(p.locator('.basari')).toBeVisible();
    return adet;
  };
  await p.goto('/matematik/');
  await kurdele();
  await expect.poll(calan).toContainEqual(expect.stringMatching(/^ses-45\.mp3/));
  expect(await p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-olcu']).anlatilan)).toEqual(['olc']);
  const adet = await kurdele(['olc']);
  await expect.poll(calan).toContainEqual(expect.stringMatching(new RegExp('^ses-' + (31 + adet) + '\\.mp3')));
  expect((await calan()).some((ad) => /^ses-45\.mp3/.test(ad))).toBe(false);
});

// Hızlı Gözler: nesneler saklanmadan rakamlar dokunmaz; yanlışta bir kez daha (daha uzun) görünür, ikinci yanlışta açık kalır;
// doğruda nesneler geri gelip kendini sayar, yıldız dolar. Turun bütün soruları ilk bakışta bilinmezse "Şimşek gibi" denmez.
test('Hızlı Gözler: göster-sakla-seç, yanlışta yeniden gösterir, doğruda kendini sayar ve yıldız verir', async ({ page: p }) => {
  test.setTimeout(90000);
  await p.addInitScript(() => {
    const w = window as unknown as { __calan: string[] };
    w.__calan = [];
    const asil = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { w.__calan.push(decodeURIComponent(this.src.split('/').pop() ?? '')); return asil.call(this); };
  });
  await p.goto('/matematik/');
  // 5 yaş Sayı sırasının 3. adımı (tur 16).
  await p.evaluate(() => localStorage.setItem('minkino-matematik-1-sayi', JSON.stringify({ kuleTamam: true, adim: 2, yer: 0, secimler: [], surum: 2 })));
  await p.reload();
  await tik(p, '.k0');
  const pano = p.locator('.pano.hizli-gozler');
  await expect(pano).toHaveAttribute('data-durum', 'goster', { timeout: 15000 });
  // Görünürken rakamlar kapalı (çocuk tek tek saymaz, bakışta görür).
  await expect(p.locator('.tezgah.hg-rakamlar')).toHaveAttribute('inert', '');
  const adet = await p.locator('.hg-nesne').count();
  await expect(pano).toHaveAttribute('data-durum', 'sor', { timeout: 15000 });
  await expect(p.locator('.hg-alan')).toHaveClass(/gizli/);
  const secenek = await p.locator('.hg-rakam').evaluateAll((els) => els.map((e) => Number(e.getAttribute('aria-label'))));
  const yanlis = secenek.find((r) => r !== adet)!;
  expect(secenek).toContain(adet);
  await p.getByRole('button', { name: String(yanlis), exact: true }).click();
  // Yanlış: bir kez daha, daha uzun gösterilir; sonra yine saklanır.
  await expect(pano).toHaveAttribute('data-durum', 'goster');
  await expect(p.locator('.hg-alan')).not.toHaveClass(/gizli/);
  await expect(pano).toHaveAttribute('data-durum', 'sor', { timeout: 15000 });
  // İkinci yanlış: nesneler açık kalır, çocuk sayabilir.
  await p.getByRole('button', { name: String(yanlis), exact: true }).click();
  await expect(pano).toHaveAttribute('data-durum', 'sor');
  await expect(p.locator('.hg-alan')).not.toHaveClass(/gizli/);
  // Doğru: nesneler kendini sayar, yıldız dolar, sıradaki soru gelir.
  await p.getByRole('button', { name: String(adet), exact: true }).click();
  await expect(p.locator('.hg-rakam.dogru')).toHaveCount(1);
  await expect(p.locator('.hg-nesne.sayildi')).toHaveCount(adet, { timeout: 10000 });
  await expect(p.locator('.hg-yildizlar i.dolu')).toHaveCount(1, { timeout: 10000 });
  expect(await p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-sayi']))).toMatchObject({ adim: 2, yer: 2, secimler: [adet] });
  // Kalan sorular ilk bakışta: tur biter, ama ilk soruda yanlış olduğu için "Şimşek gibi" sözü yok.
  for (let q = 1; q < 4; q++) {
    const yeni = p.locator('.pano.hizli-gozler[data-soru="' + q + '"]');
    await expect(yeni).toHaveAttribute('data-durum', 'sor', { timeout: 15000 });
    await expect(p.locator('.hg-yildizlar i.dolu')).toHaveCount(q);
    const a = await yeni.locator('.hg-nesne').count();
    await p.getByRole('button', { name: String(a), exact: true }).click();
  }
  await expect(p.locator('.basari')).toBeVisible({ timeout: 15000 });
  await expect.poll(() => p.evaluate(() => JSON.parse(localStorage['minkino-matematik-1-sayi']).adim)).toBe(3);
  const calan = await p.evaluate(() => (window as unknown as { __calan: string[] }).__calan);
  expect(calan).toContainEqual(expect.stringMatching(/^ses-96\.mp3/));
  expect(calan.some((a) => /^ses-97\.mp3/.test(a))).toBe(false);
});
