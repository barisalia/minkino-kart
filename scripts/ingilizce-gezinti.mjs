// İngilizceye Merhaba · otomatik gezinti: ekranları ve bir dersi tarayıcıda oynatır, ekran görüntüsü alır,
// konsol hatalarını toplar. Kullanım: node scripts/ingilizce-gezinti.mjs [tablet|telefon] [adim,adim…]
// Önizleme sunucusu açık olmalı (npm run dev → http://localhost:5173).
import { chromium } from 'playwright';
import fs from 'node:fs';

const cihaz = process.argv[2] === 'telefon' ? { ad: 'telefon', width: 874, height: 402 } : { ad: 'tablet', width: 1366, height: 1024 };
const istenen = (process.argv[3] ?? 'ana,adalar,ders1,oyunlar,album').split(',');
const KOK = 'http://localhost:5173/ingilizce/';
const cikti = `output/ingilizce/ekran/${cihaz.ad}`;
fs.mkdirSync(cikti, { recursive: true });

const tarayici = await chromium.launch({ channel: 'chrome' });
const sayfa = await tarayici.newPage({ viewport: { width: cihaz.width, height: cihaz.height } });
// test kipinde süreler kısalır: Kino'yu Giydir'in fotoğraf anı bir an sürer. Çerçeve gelince oda kopyalanıp ekranda
// sabit bırakılır, görüntü o kopyadan alınır (yalnız denetim).
await sayfa.addInitScript(() => {
  new MutationObserver(() => {
    const c = document.querySelector('.ing-giydir-oda .ing-foto-cerceve');
    if (!c || document.querySelector('#foto-kopya')) return;
    const oda = c.closest('.ing-giydir-oda'); const r = oda.getBoundingClientRect();
    const k = oda.cloneNode(true); k.id = 'foto-kopya'; k.querySelector('.ing-flas')?.remove();
    Object.assign(k.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: 9999 });
    document.querySelector('.ing').append(k);
  }).observe(document, { subtree: true, childList: true });
});
const hatalar = [];
sayfa.on('pageerror', (e) => hatalar.push(`SAYFA HATASI ${e.message}`));
sayfa.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text().slice(0, 200)); });
// sayfa değişirken yarıda kesilen istekler hata değildir
sayfa.on('requestfailed', (r) => { if (!/ERR_ABORTED/.test(r.failure()?.errorText ?? '')) hatalar.push(`YÜKLENEMEDİ ${r.url().slice(0, 140)}`); });

const cek = async (ad) => { await sayfa.waitForTimeout(450); await sayfa.screenshot({ path: `${cikti}/${ad}.png` }).catch(() => {}); };
const dokun = async (secici, o = {}) => { await sayfa.locator(secici).first().click({ force: true, timeout: 8000, ...o }); };
const bekle = (ms) => sayfa.waitForTimeout(ms);
// makine yoğunken ağın tamamen durmasını beklemek zaman aşımına düşüyordu: uygulamanın ekranı kurması beklenir
const ac = async (sorgu = '') => { await sayfa.goto(`${KOK}?test=1${sorgu}`, { waitUntil: 'domcontentloaded', timeout: 120000 }); await sayfa.waitForSelector('.ing[data-ekran]', { timeout: 120000 }); await sayfa.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}); };
// önizleme sunucusu başka bir dosya değişince sayfayı yenileyebilir: o an okunamayan adım boş sayılır, döngü sürer
const adimNe = () => sayfa.evaluate(() => document.querySelector('.ing')?.dataset.adim ?? '').catch(() => '');

/** Bir dersi baştan sona oynatır; her adım türünden bir ekran görüntüsü alır. `yanlisYap`: ilk soruda bilerek yanlışa dokunur. */
async function dersOyna(etiket) {
  const gorulen = new Set();
  for (let tur = 0; tur < 400; tur++) {
    const adim = await adimNe();
    if (adim === 'sonuc') { await bekle(500); await cek(`${etiket}-sonuc`); return true; }
    if (!gorulen.has(adim)) { gorulen.add(adim); await bekle(350); await cek(`${etiket}-${adim}`); }
    if (adim === 'selam' || adim === 'veda') {
      // üst seviye derslerinde selamdan sonra günlük söz gelir: "söyledim" yıldızı beklenir
      if (await sayfa.locator('.ing-yildiz-dugme:not([hidden])').count()) { if (!gorulen.has('selam-rutin')) { gorulen.add('selam-rutin'); await cek(`${etiket}-selam-rutin`); } await sayfa.locator('.ing-yildiz-dugme:not([hidden])').first().click({ force: true, timeout: 3000 }).catch(() => {}); }
      else if (await sayfa.locator('.ing-el-salla:not([hidden]):not(.ing-sallandi)').count()) await sayfa.locator('.ing-el-salla:not([hidden])').click({ force: true, timeout: 8000 }).catch(() => {});
    }
    else if (adim === 'tanis') {
      if (await sayfa.locator('.ing-kapak:not(.ing-acik)').count()) { await dokun('.ing-kapak'); await bekle(700); if (!gorulen.has('tanis-acik')) { gorulen.add('tanis-acik'); await cek(`${etiket}-tanis-acik`); } }
      else if (await sayfa.locator('.ing-yildiz-dugme:not([hidden])').count()) { if (!gorulen.has('tanis-soyle')) { gorulen.add('tanis-soyle'); await cek(`${etiket}-tanis-soyle`); } await sayfa.locator('.ing-yildiz-dugme:not([hidden])').first().click({ force: true, timeout: 3000 }).catch(() => {}); }
    } else if (adim === 'bul' || adim === 'tekrar' || adim === 'besle' || adim === 'say' || adim === 'yap' || adim === 'kapi') {
      const n = await sayfa.locator('.ing-secim').count();
      if (n) await sayfa.locator('.ing-secim').nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {});
    } else if (adim === 'ogret') {
      if (await sayfa.locator('.ing-oylar:not([hidden])').count()) await sayfa.locator(tur % 2 ? '.ing-evet' : '.ing-hayir').click({ force: true, timeout: 3000 }).catch(() => {});
      else if (await sayfa.locator('.ing-secim').count()) await sayfa.locator('.ing-secim').nth(tur % 3).click({ force: true, timeout: 3000 }).catch(() => {});
    } else if (adim === 'balon') { const n = await sayfa.locator('.ing-balon').count(); if (n) await sayfa.locator('.ing-balon').nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {}); }
    else if (adim === 'eksik') { const n = await sayfa.locator('.ing-secim').count(); if (n) await sayfa.locator('.ing-secim').nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {}); }
    else if (adim === 'eslestir') { const n = await sayfa.locator('.ing-hafiza-karti:not(.ing-acik)').count(); if (n) await sayfa.locator('.ing-hafiza-karti:not(.ing-acik)').nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {}); }
    else if (adim === 'resim') { const hedefler = sayfa.locator('.ing-nesne, .ing-bolge'); const n = await hedefler.count(); if (n) await hedefler.nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {}); }
    else if (adim === 'anlat' && await sayfa.locator('.ing-anlat-gizli:not(.ing-acik)').count()) {
      // gizli resim: gölgeye ya da karelere dokunur; Polly açılışında Polly'ye
      const tur = await sayfa.evaluate(() => { const k = document.querySelector('.ing-anlat-gizli'); return k?.classList.contains('ing-siluet') ? 'golge' : k?.classList.contains('ing-kareli') ? 'parca' : 'polly'; });
      if (!gorulen.has(`anlat-${tur}`)) { gorulen.add(`anlat-${tur}`); await cek(`${etiket}-anlat-${tur}`); }
      await sayfa.locator(tur === 'polly' ? '.ing-polly-cagir' : '.ing-anlat-gizli').first().click({ force: true, timeout: 3000 }).catch(() => {});
      await bekle(350);
    }
    else if (adim === 'soyle' || adim === 'anlat' || adim === 'soyle2' || adim === 'sensor') {
      if (await sayfa.locator('.ing-yildiz-dugme:not([hidden])').count()) { if (!gorulen.has(`${adim}-soyle`)) { gorulen.add(`${adim}-soyle`); await cek(`${etiket}-${adim}-soyle`); } await sayfa.locator('.ing-yildiz-dugme:not([hidden])').first().click({ force: true, timeout: 3000 }).catch(() => {}); }
    }
    else if (adim === 'dogrumu') {
      // her üç soruda bir bilerek yanlış düğmeye dokunur
      const hedef = await sayfa.locator('.ing-oylar').getAttribute('data-hedef').catch(() => null);
      if (hedef && !(await sayfa.locator('.ing-oylar.ing-bitti').count())) {
        const dogru = hedef === 'evet' ? '.ing-evet' : '.ing-hayir', yanlis = hedef === 'evet' ? '.ing-hayir' : '.ing-evet';
        await sayfa.locator(tur % 3 === 0 ? yanlis : dogru).first().click({ force: true, timeout: 3000 }).catch(() => {});
      }
    }
    else if (adim === 'yakala') {
      // söylenen resim mercekteyken dokunur; arada bir bilerek yanlış resimde dokunur
      const m = sayfa.locator('.ing-mercek');
      const [simdi, hedef] = await Promise.all([m.getAttribute('data-ifade').catch(() => null), m.getAttribute('data-hedef').catch(() => null)]);
      if (simdi && hedef && (simdi === hedef || tur % 9 === 0)) { if (!gorulen.has('yakala-an')) { gorulen.add('yakala-an'); await cek(`${etiket}-yakala-an`); } await m.click({ force: true, timeout: 3000 }).catch(() => {}); }
    }
    else if (adim === 'hafiza2') {
      // kapalı ilk kartı açar, sonra eşini açar (her üç çiftte bir önce yanlış kartı açar)
      const kapali = sayfa.locator('.ing-hafiza-karti:not(.ing-acik)');
      const n = await kapali.count();
      if (n) {
        const acik = sayfa.locator('.ing-hafiza-karti.ing-acik:not(.ing-eslesti)');
        if (await acik.count() === 1) {
          const id = await acik.first().getAttribute('data-ifade');
          const es = sayfa.locator(`.ing-hafiza-karti:not(.ing-acik)[data-ifade="${id}"]`);
          const baska = sayfa.locator(`.ing-hafiza-karti:not(.ing-acik):not([data-ifade="${id}"])`);
          if (tur % 3 === 0 && await baska.count()) await baska.first().click({ force: true, timeout: 3000 }).catch(() => {});
          else await es.first().click({ force: true, timeout: 3000 }).catch(() => {});
        } else if (await acik.count() === 0) await kapali.first().click({ force: true, timeout: 3000 }).catch(() => {});
        if (!gorulen.has('hafiza2-acik')) { gorulen.add('hafiza2-acik'); await cek(`${etiket}-hafiza2-acik`); }
      }
    }
    else if (adim === 'sasirt') {
      // Şakacı Polly: doğru düğmeye dokunur; şaka yakalanınca görüntü
      const hedef = await sayfa.locator('.ing-sasirt .ing-oylar').getAttribute('data-hedef').catch(() => null);
      if (hedef && !(await sayfa.locator('.ing-sasirt .ing-oylar.ing-bitti').count())) {
        if (!gorulen.has('sasirt')) { gorulen.add('sasirt'); await cek(`${etiket}-sasirt`); }
        await sayfa.locator(hedef === 'evet' ? '.ing-sasirt .ing-evet' : '.ing-sasirt .ing-hayir').click({ force: true, timeout: 3000 }).catch(() => {});
        if (hedef === 'hayir' && !gorulen.has('sasirt-oops')) { gorulen.add('sasirt-oops'); await bekle(450); await cek(`${etiket}-sasirt-oops`); }
        await bekle(250);
      }
    }
    else if (adim === 'masaloyun') {
      // ilk soruda bir kez yanlışa dokunur (ipucu sayfası görünsün), sonra doğruya
      const hedef = await sayfa.locator('.ing-masaloyun .ing-secenekler').getAttribute('data-hedef').catch(() => null);
      if (hedef && !(await sayfa.locator('.ing-masaloyun .ing-secenekler.ing-bitti').count())) {
        if (!gorulen.has('masaloyun')) { gorulen.add('masaloyun'); await bekle(300); await cek(`${etiket}-masaloyun`); }
        if (!gorulen.has('masaloyun-yanlis')) { gorulen.add('masaloyun-yanlis'); await sayfa.locator(`.ing-masaloyun-kart:not([data-secenek="${hedef}"])`).first().click({ force: true, timeout: 3000 }).catch(() => {}); await bekle(500); await cek(`${etiket}-masaloyun-ipucu`); }
        else await sayfa.locator(`.ing-masaloyun-kart[data-secenek="${hedef}"]`).click({ force: true, timeout: 3000 }).catch(() => {});
        await bekle(250);
      }
    }
    else if (adim === 'gecit') {
      // gölgeye dokunur; ilk gölgede, üçüncü hayvandan sonra ve sonda görüntü alır
      const golge = sayfa.locator('.ing-gecit-hayvan.ing-kahraman.ing-gecit-golge');
      const sirada = await sayfa.locator('.ing-gecit-sira .ing-gecit-hayvan').count();
      if (await golge.count()) {
        if (!gorulen.has('gecit')) { gorulen.add('gecit'); await bekle(700); await cek(`${etiket}-gecit`); }
        await golge.first().click({ force: true, timeout: 3000 }).catch(() => {});
        if (!gorulen.has('gecit-ad')) { gorulen.add('gecit-ad'); await bekle(250); await cek(`${etiket}-gecit-ad`); }
      }
      if (sirada >= 5 && !gorulen.has('gecit-sira')) { gorulen.add('gecit-sira'); await cek(`${etiket}-gecit-sira`); }
      if (await sayfa.locator('.ing-gecit-sira.ing-hepsi').count() && !gorulen.has('gecit-son')) { gorulen.add('gecit-son'); await bekle(300); await cek(`${etiket}-gecit-son`); }
    }
    else if (adim === 'bahce') {
      // bölüm tanıtılırken bir kez, soruda bir kez görüntü; sorulan hayvana dokunur (ilk soruda bir kez yanlışa)
      if (!gorulen.has('bahce') && await sayfa.locator('.ing-bahce-hayvan.ing-belirdi').count() >= 4) { gorulen.add('bahce'); await cek(`${etiket}-bahce`); }
      const hedef = await sayfa.locator('.ing-bahce-izgara').getAttribute('data-hedef').catch(() => null);
      const soruda = await sayfa.locator('.ing-bahce .ing-soru.ing-gorunur').count();
      if (hedef && soruda) {
        if (!gorulen.has('bahce-soru')) { gorulen.add('bahce-soru'); await cek(`${etiket}-bahce-soru`); }
        if (!gorulen.has('bahce-yanlis')) { gorulen.add('bahce-yanlis'); await sayfa.locator(`.ing-bahce-hayvan:not([data-kelime="${hedef}"])`).first().click({ force: true, timeout: 3000 }).catch(() => {}); }
        else await sayfa.locator(`.ing-bahce-hayvan[data-kelime="${hedef}"]`).click({ force: true, timeout: 3000 }).catch(() => {});
        await bekle(250);
      }
      if (await sayfa.locator('.ing-bahce-duvar').count() && !gorulen.has('bahce-final')) { gorulen.add('bahce-final'); await bekle(1600); await cek(`${etiket}-bahce-final`); }
    }
    else if (adim === 'sarki') { if (!gorulen.has('sarki')) { gorulen.add('sarki'); await bekle(150); await cek(`${etiket}-sarki`); } }
    else if (adim === 'giydir') {
      // istenen giysiye dokunur; ikinci giysi turunda bir kez yanlışa
      const hedef = await sayfa.locator('.ing-giydir-aski').getAttribute('data-hedef').catch(() => null);
      const giyilen = await sayfa.locator('.ing-giydir-kart.ing-giyildi').count();
      if (hedef) {
        if (!gorulen.has('giydir')) { gorulen.add('giydir'); await cek(`${etiket}-giydir`); }
        if (giyilen === 1 && !gorulen.has('giydir-yanlis')) { gorulen.add('giydir-yanlis'); await sayfa.locator(`.ing-giydir-kart:not([data-kelime="${hedef}"]):not(.ing-giyildi)`).first().click({ force: true, timeout: 3000 }).catch(() => {}); }
        else {
          await sayfa.locator(`.ing-giydir-kart[data-kelime="${hedef}"]`).click({ force: true, timeout: 3000 }).catch(() => {});
          // son giysiden sonra fotoğraf anı: çerçeve gelince görüntü alınır
          if (!gorulen.has('giydir-foto')) await sayfa.waitForSelector('#foto-kopya', { timeout: 2500 }).then(async () => { gorulen.add('giydir-foto'); await bekle(500); await cek(`${etiket}-giydir-foto`); await sayfa.evaluate(() => document.querySelector('#foto-kopya')?.remove()); }).catch(() => {});
        }
        await bekle(250);
        if (giyilen >= 2 && !gorulen.has('giydir-yarim')) { gorulen.add('giydir-yarim'); await cek(`${etiket}-giydir-yarim`); }
      }
      if (await sayfa.locator('.ing-foto-cerceve, .ing-flas').count() && !gorulen.has('giydir-foto')) { gorulen.add('giydir-foto'); await cek(`${etiket}-giydir-foto`); }
    }
    else if (adim === 'posta') {
      const hedef = await sayfa.locator('.ing-posta-evler').getAttribute('data-hedef').catch(() => null);
      const kilitsiz = await sayfa.locator('.ing-posta-ev.ing-teslim').count();
      if (hedef && !(await sayfa.locator('.ing-zarf.ing-ucuyor').count())) {
        if (!gorulen.has('posta')) { gorulen.add('posta'); await cek(`${etiket}-posta`); }
        if (kilitsiz === 1 && !gorulen.has('posta-yanlis')) {
          gorulen.add('posta-yanlis');
          await sayfa.locator(`.ing-posta-ev:not([data-ifade="${hedef}"]):not(.ing-teslim)`).first().click({ force: true, timeout: 3000 }).catch(() => {});
        } else if (!gorulen.has('posta-surukle')) {
          // ilk teslim gerçek sürüklemeyle: mektubu tut, evin üstüne götür, bırak
          const z = await sayfa.locator('.ing-zarf').boundingBox().catch(() => null);
          const e = await sayfa.locator(`.ing-posta-ev[data-ifade="${hedef}"]`).boundingBox().catch(() => null);
          if (z && e) {
            gorulen.add('posta-surukle');
            await sayfa.mouse.move(z.x + z.width / 2, z.y + z.height / 2); await sayfa.mouse.down();
            await sayfa.mouse.move(e.x + e.width / 2, e.y + e.height / 2, { steps: 8 });
            await cek(`${etiket}-posta-surukle`);
            await sayfa.mouse.up();
          }
        } else await sayfa.locator(`.ing-posta-ev[data-ifade="${hedef}"]`).click({ force: true, timeout: 3000 }).catch(() => {});
        await bekle(300);
        if (!gorulen.has('posta-teslim') && await sayfa.locator('.ing-posta-ev.ing-teslim').count() >= 2) { gorulen.add('posta-teslim'); await cek(`${etiket}-posta-teslim`); }
      }
    }
    else if (adim === 'saykoy') {
      // tepsiye istenen kadar koyar, sonra yeşile basar; ilk turda bir kez eksikken basar (yanlış yolu)
      const hedef = Number(await sayfa.locator('.ing-tepsi').getAttribute('data-hedef').catch(() => 0));
      const dolu = await sayfa.locator('.ing-tepsi-yuva.ing-dolu').count();
      if (hedef && !(await sayfa.locator('.ing-tepsi.ing-tamam').count())) {
        if (dolu === 1 && hedef > 1 && !gorulen.has('saykoy-yanlis')) { gorulen.add('saykoy-yanlis'); await sayfa.locator('.ing-saykoy-tamam').click({ force: true, timeout: 3000 }).catch(() => {}); await bekle(200); }
        else if (dolu < hedef) await sayfa.locator('.ing-saykoy-kaynak').click({ force: true, timeout: 3000 }).catch(() => {});
        else if (dolu > hedef) await sayfa.locator('.ing-tepsi-parca').first().click({ force: true, timeout: 3000 }).catch(() => {});
        else { if (!gorulen.has('saykoy-dolu')) { gorulen.add('saykoy-dolu'); await cek(`${etiket}-saykoy-dolu`); } await sayfa.locator('.ing-saykoy-tamam').click({ force: true, timeout: 3000 }).catch(() => {}); }
      }
    }
    else if (adim === 'tarif' || adim === 'sohbet') {
      // Seviye 2–3: her üç soruda bir bilerek yanlışa dokunur, ötekilerde doğruya (test kipinde hedef okunur)
      if (await sayfa.locator('.ing-yildiz-dugme:not([hidden])').count()) { await sayfa.locator('.ing-yildiz-dugme:not([hidden])').first().click({ force: true, timeout: 3000 }).catch(() => {}); await bekle(140); continue; }
      const kap = sayfa.locator(adim === 'tarif' ? '.ing-secenekler' : '.ing-cevaplar');
      const hedef = await kap.getAttribute('data-hedef').catch(() => null);
      const secim = tur % 3 === 0 ? kap.locator(`[data-ifade]:not([data-ifade="${hedef}"])`) : kap.locator(`[data-ifade="${hedef}"]`);
      if (await secim.count()) await secim.first().click({ force: true, timeout: 3000 }).catch(() => {});
    } else if (adim === 'kur') {
      if (await sayfa.locator('.ing-yildiz-dugme:not([hidden])').count()) { await sayfa.locator('.ing-yildiz-dugme:not([hidden])').first().click({ force: true, timeout: 3000 }).catch(() => {}); await bekle(140); continue; }
      const dolu = await sayfa.locator('.ing-kur-yuva.ing-dolu').count();
      const taslar = sayfa.locator('.ing-kur-taslar .ing-tas:not(.ing-kullanildi)');
      const n = await taslar.count();
      if (!gorulen.has('kur-yarim') && dolu === 1) { gorulen.add('kur-yarim'); await cek(`${etiket}-kur-yarim`); }
      const dogru = sayfa.locator(`.ing-kur-taslar .ing-tas:not(.ing-kullanildi)[data-sira="${dolu}"]`);
      if (tur % 4 === 0 && n > 1) await taslar.nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {});
      else if (await dogru.count()) await dogru.first().click({ force: true, timeout: 3000 }).catch(() => {});
    } else if (adim === 'hikaye') { if (await sayfa.locator('.ing-hikaye-ileri:not([hidden])').count()) await dokun('.ing-hikaye-ileri'); }
    else if (adim === 'sirala') {
      const dolu = await sayfa.locator('.ing-sirala-yuva.ing-dolu').count();
      if (!gorulen.has('sirala-yarim') && dolu === 2) { gorulen.add('sirala-yarim'); await cek(`${etiket}-sirala-yarim`); }
      const kalan = sayfa.locator('.ing-sirala-resim:not(.ing-kullanildi)');
      const n = await kalan.count();
      const dogru = sayfa.locator(`.ing-sirala-resim:not(.ing-kullanildi)[data-sira="${dolu}"]`);
      if (tur % 4 === 0 && n > 1) await kalan.nth(tur % n).click({ force: true, timeout: 3000 }).catch(() => {});
      else if (await dogru.count()) await dogru.first().click({ force: true, timeout: 3000 }).catch(() => {});
    }
    await bekle(140);
  }
  return false;
}

for (const adim of istenen) {
  if (adim === 'ana') { await ac(); await sayfa.evaluate(() => localStorage.removeItem('minkino-ingilizce-v1')); await ac(); await cek('01-ana'); }
  else if (adim === 'adalar') { await ac('&ekran=adalar'); await cek('02-adalar'); await dokun('.ing-ada[data-unite="ciftlik"]'); await cek('03-unite-paneli'); }
  // taslak görünümünde ada paneli: üç seviyenin sekmeleri (ilerleme kaydı dolu olsun diye dokuz ders bitmiş sayılır)
  else if (adim === 'seviyeler') {
    await ac('&taslak&ekran=adalar');
    await sayfa.evaluate(() => localStorage.setItem('minkino-ingilizce-v1', JSON.stringify({ surum: 1, dersler: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((n) => [`ciftlik-${n}`, 3])), kelimeler: {}, cikartmalar: [], tekrar: { gun: '', adet: 0 }, gunler: [], tanisildi: true })));
    await ac('&taslak&ekran=adalar'); await cek('04-adalar-seviyeli');
    await dokun('.ing-ada[data-unite="ciftlik"]'); await cek('05-panel-seviye3');
    await dokun('.ing-seviye[data-seviye="2"]'); await cek('06-panel-seviye2');
    await dokun('.ing-seviye[data-seviye="1"]'); await cek('07-panel-seviye1');
  }
  else if (/^ders\d$/.test(adim)) { const no = adim.slice(4); await ac(`&ders=ciftlik-${no}`); const tamam = await dersOyna(`ders${no}`); console.log(`ders ${no}:`, tamam ? 'bitti' : 'TAKILDI', 'son adım', await adimNe()); }
  else if (/^u:[a-z]+:\d$/.test(adim)) { const [, id, no] = adim.split(':'); await ac(`&taslak&ders=${id}-${no}`); const tamam = await dersOyna(`${id}${no}`); console.log(`${id} ${no} (taslak):`, tamam ? 'bitti' : 'TAKILDI', 'son adım', await adimNe()); }
  // g:<ünite>:<no> gerçek görünüm (taslak değil): ünitenin çizimi ve sesi tamamsa oynar
  else if (/^g:[a-z]+:\d$/.test(adim)) { const [, id, no] = adim.split(':'); await ac(`&ders=${id}-${no}`); const tamam = await dersOyna(`${id}${no}`); console.log(`${id} ${no}:`, tamam ? 'bitti' : 'TAKILDI', 'son adım', await adimNe()); }
  else if (/^yemek\d$/.test(adim)) { const no = adim.slice(5); await ac(`&ders=yiyecekler-${no}`); const tamam = await dersOyna(`yemek${no}`); console.log(`yiyecekler ${no}:`, tamam ? 'bitti' : 'TAKILDI', 'son adım', await adimNe()); }
  else if (adim === 'oyunlar') { await ac('&ekran=oyunlar'); await cek('20-oyunlar'); }
  // masallar: kitaplık (taslak) · m:<ada>: o adanın masal saati
  else if (adim === 'masallar') { await ac('&taslak&ekran=masallar'); await cek('30-masallar'); }
  else if (/^m:[a-z]+$/.test(adim)) { const id = adim.slice(2); await ac(`&masal=${id}`); const tamam = await dersOyna(`masal-${id}`); console.log(`masal ${id}:`, tamam ? 'bitti' : 'TAKILDI', 'son adım', await adimNe()); }
  else if (adim === 'album') { await ac('&ekran=album'); await cek('21-album'); if (await sayfa.locator('.ing-yuva:not(.ing-bos)').count()) { await dokun('.ing-yuva:not(.ing-bos)'); await cek('22-kelime-karti'); } }
  else if (adim.startsWith('oyun-')) { await ac('&ekran=oyunlar'); await dokun(`.ing-oyun-karti[data-oyun="${adim.slice(5)}"]`); const tamam = await dersOyna(adim); console.log(adim, tamam ? 'bitti' : 'TAKILDI'); }
  else if (adim === 'tekrar') { await ac('&ekran=oyunlar'); await dokun('.ing-gunluk'); const tamam = await dersOyna('tekrar'); console.log('tekrar', tamam ? 'bitti' : 'TAKILDI'); }
  else if (adim === 'anason') { await ac(); await cek('30-ana-son'); await ac('&ekran=adalar'); await cek('31-adalar-son'); }
}
console.log('kayıt', await sayfa.evaluate(() => localStorage.getItem('minkino-ingilizce-v1')));
console.log('HATALAR', JSON.stringify([...new Set(hatalar)], null, 1));
await tarayici.close();
