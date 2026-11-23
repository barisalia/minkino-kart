import { erisimVarMi, kilitGoster } from '../../src/abonelik/kilit';
import { kilitli } from '../../src/engine/erisim';
import { sayiKulesi, boncuklariCal as boncuklariCalAsil, boncukSesiniKes } from './sayi-oyuncaklari';
import { durum as uygulamaDurumu, yukle } from '../../src/engine/ilerleme';
import { MENU_YASLARI, menuYasiOku, menuYasiniSec } from '../../src/engine/menu-yas';
import sozler from './sozler.json';
import { koseler, adlar, durum, kaydet, sifirla, sonu, minik, dortYas, seviyeyiYukle, turNumarasi, type Kose, type Tur } from './kayit';
import { turTuru } from './tur-sirasi';
import { YENIDEN_KAT, enBuyuk, hizliAdetler, hizliMi, hizliSorular, kendiniSay, nesneBoyu, yerlesim, type HgYol } from './hizli-gozler';
import { basardi, konudaBasardi, konudaZorlandi, oneAl, zorKonular, zorlandi, zorlananlar, type TekrarAlani, type TekrarYolu } from './akilli-tekrar';
import { BOY, KURBAGA_TUVAL, SERIT, SOZ, TUVAL, YAPRAK_EN, YER_TUTUCU, boyHayvanlari, olcuHazirMi, yaprakSayisi, type Hayvan, type OYol } from './olcu-yeni';
import { calgiSesi as calgiSesiAsil } from '../../src/audio/bando';
import { oyunSesi as oyunSesiAsil } from '../../alfabe/src/oyun-sesi';
import { OVGULER, YANLIS_YEDEK, dokunmaCanlan, dokunmaSesi, kaymaSesi, komikSalla, komikSes, parilti, pariltiNokta, sec, zipla, pofEfekti } from './cila';
import { a1KareleriniKur, tepkiYay } from './a1-kareler';
import { telefonKamerasiKur } from './telefon-kamera';
import { konus, sus, sesiAc } from '../../src/audio/ses';
import { geriDinle, arkaPlanDinle } from '../../src/kabuk/yon';
import { anaMenuyeDon } from '../../src/uygulama';
import { rakamAtolyesi } from './rakam';
import { misketParkuru } from './misket';
import './stil.css';
import { gezginOyna } from './tangram';
import './tangram.css';
import { cerenDersi, cerenDersiBitti, cerenDersiGorunur } from './ceren-ders';
import { veliSayfasiAc } from './veli';
import { sekillerDersi, sekillerDersiBitti, sekillerDersiGorunur } from './ders-sekiller';
import { olcuDersi, olcuDersiBitti, olcuDersiGorunur } from './ders-olcu';
import { oruntuDersi, oruntuDersiBitti, oruntuDersiGorunur } from './ders-oruntu';
import { onlukDersi, onlukDersiBitti, onlukDersiGorunur } from './ders-onluk';
import { dersAcilir as onlukAcilir } from './ders-onluk-mantik';
import { toplamaDersi, toplamaDersiBitti, toplamaDersiGorunur, toplamaYasiUygun } from './ders-toplama';
import { dersYolu, dersYoluGorunur, senlikTabelasi } from './ders-yolu';
import { KOSE as DERS_KOSESI, yasDersleri, yolDurumu, type DersId } from './ders-yolu-mantik';
import {
  BOLUSUM, YENI_KLASOR, YENI_KOSE, YENI_SOZ, babaOlcutleri, babaParcalari, bolusumTamam, elmaKaplari, elmaSayisi, elmaYerleri, etiket,
  farkliMi, findikYerleri, kapGozleri, kutusu, lokumSayisi, parcaAdi, sakliSorular, tahterevalliYeri, yeniTur, type Bolusum, type Parca, type YeniTur,
  TEPSI_X, TEPSI_Y, bayrakSecenekleri, karisikSira, kurabiyeSayilari, trenTuru, balonSecenekleri, balonTuru, balonYelpazesi, kekIslemleri, KAT_Y, asansorTuru, ORTU_YERI, sekilOrtusu, parcaYereUyar, type YeniSekil, resimSirasi, buyuyenDesenler, desenCevabi,
  BAYRAK_TURLERI, CALGILAR, bayrakDizileri, birimGecerli, calgiTuru, type BayrakTuru, type Calgi,
  bardakSirasi, gunCeldirici, gunKarisik, gunTuru, sekilBahcesiTuru, surahiSorulari, yarimTuru, type Doluluk, type GunKarti,
} from './yeni-turlar';
import {
  ONLU_SOZ, OTUZ_BES_SOZ, PAY_SOZ, RITIM_SOZ, YIRMI_BES_SOZ, esitMi, paySorulari, ritimSecenekleri, ritimSiralari, teraziDurusu,
} from './ritim-pay';
import {
  BENEK_YERI, FAZLA_SORUSU, GRAFIK_SOZ, KELEBEK_SOZ, MEYVELER, ROKET_SOZ, aynaX, benekUyar, enAz, enCok, fazlaSecenekleri, geriSayimlar, grafikVerisi,
  kacFazla, karisikBloklar, kelebekDesenleri, renkSayisi, sepetSirasi, siradakiBlok, type BenekRengi, type Meyve,
} from './roket-kelebek-grafik';
import {
  BIRAKMA, KAYDIRAK_SOZ, KAYIS, KIRPMA, KONAK, KOYMA, LOKUM_AYAKTA, LOKUM_CIKTI, LOKUM_POZU, LOKUM_SAKLI, MERDIVEN, OLUK, OYUNCAK_BASI, POZ,
  SAKLAMBAC_SOZ, SAKLANMA_YERI, SIRA_X, YER_KUTUSU, YERLER, ZEMIN_Y, DOST_ADI, birakmaIliskisi, cevapSirasi, iliskiNo, kaydirakTuru,
  saklambacTuru, siraIlerle, siraKartlari, soruDizisi, soruSozu, type Dost, type Iliski, type Oyuncak, type Yer,
} from './konum-sira';
import {
  BEKLEME_Y, DOKUNMA, ESYA_ADI, ESYA_TUVALI, KISI_ADI, KISI_X, OTURMA_Y, POZ_TUVALI, SOFRA_SOZ, YER_Y, BOY_ADI, beklemeX, birakmaAlani,
  dogruSozu, sofraTuru, sofradakiler, takimSozu, uyar, yanlisSozu, type Boy, type Esya, type Kisi,
} from './aile-sofrasi';
import { DOST, ES_SOZ, KART, RESIM_ADI, esMi, esTuru, kartYeri, type Resim } from './es-kartlar';
import {
  DEDE, DELIK, DOKUNMA as KUTU_DOKUNMA, KSEKIL_ADI, KUTU, KUTU_SEKILLERI, KUTU_SOZ, PARCA_TUVALI, PARCA_YERI, delikBul, girerMi, kutuTuru, type KSekil,
} from './sekil-kutusu';
import { tahterevalliGorunur, tahterevalliTuru } from './tahterevalli';
import { turAcik } from './ek-turlar';
import { resimHTML } from './ders-iskelet';
import { fonTasmasiKur } from './fon-tasma';
const kok = document.querySelector<HTMLElement>('#sahne')!;
// 16:9 olmayan ekranda (iPad, geniş telefon) sahnenin dışını fonun kendi kenarı doldurur.
fonTasmasiKur(kok);
// Yatay telefonda kamera: içerik ekranı doldursun (telefon-kamera.ts; Matematik denetimi 23 Kasım).
telefonKamerasiKur(kok);
const dikTelefon = matchMedia('(orientation: portrait) and (width < 600px)');
const kaynak = import.meta.glob<string>(
  [
    '../../assets/matematik/*.webp',
    '../../assets/matematik/iki-kase/mandalina.webp',
    '../../assets/hazirlik/kres/{tekne-govde,tekne-direk,tekne-yelken}.webp',
    '../../assets/sef/{piknik/sepet,arabali-servis/araba}.webp',
    '../../assets/canlan/{kelebek,balik,tavsan,ev}.webp',
    '../../assets/hazirlik/dugmeler/{ev,beste-oynat,oda-sol,oda-sag,dinle,tamam,tekrar,ileri}.webp',
    '../../assets/canlan/ev.webp',
    '../../assets/hazirlik/etkinlik/tohum-*.webp',
    '../../assets/hazirlik/kres/siir-tusu-*.webp',
    // Hızlı Gözler'in rakam düğmeleri: Ceren'in derste öğrettiği rakam blokları.
    '../../assets/matematik/ceren/rakam-{1,2,3,4,5,6,7,8,9,10}.webp',
  ],
  { eager: true, import: 'default', query: '?url' },
);
const url = (s: string) => kaynak['../../assets/' + s + '.webp'];
// Üçüncü meyve mandalina (Lokum'un İki Kâsesi'nin çizimi): çilek kural gereği çıktı (yönetici, 22 Kasım; KULLANICI-KURALLARI 15 Kasım).
const meyve = ['elma', 'armut', 'iki-kase/mandalina'].map((ad) => 'matematik/' + ad);
const sekil = ['tas', 'ucgen', 'daire'].map((ad) => 'matematik/' + ad);
const yeniBloklar = ['matematik/kare-sari', 'matematik/ucgen-yesil', sekil[2], 'matematik/dikdortgen'];
const lamba = ['gunes', 'ay', 'yildiz', 'zil'].map((s) => 'hazirlik/kres/siir-tusu-' + s);
const fenerAdlari = ['Güneş', 'Ay', 'Yıldız', 'Zil'];
const fenerSesi = (i: number, vurgu = .85) => calgiSesi([3, 4, 3, 5][i], [72, 76, 79, 84][i], vurgu);
const renkler = ['#ff8b70', '#ffcf64', '#79cba8', '#8dc6ff'];
const img = (id: string) => '<img draggable="false" alt="" src="' + url(id) + '">';
const dugmeler = {
  home: 'ev',
  play: 'beste-oynat',
  back: 'oda-sol',
  sound: 'dinle',
  ok: 'tamam',
  again: 'tekrar',
};
const glyph = (name: keyof typeof dugmeler) => img('hazirlik/dugmeler/' + dugmeler[name]);
let k: Kose = 'sayi',
  sahne = 'menu',
  metin = '',
  kilit = false,
  timer = 0,
  oturum = 0;
let ses: HTMLAudioElement | undefined;
let ipucunuTekrarla: (() => void) | undefined;
let yardimSaati = 0;
// ----- Cila katmanı (cila.ts; yönetici, 22 Kasım gecesi: Top Parkuru'nun cilası Matematik turlarına) -----
// Efekt sayacı bir dokunuşun işleyicisinin kendi sesini çalıp çalmadığını söyler; çalmadıysa cila yumuşak "pıt" ekler.
// Doğru sesi parıltıyla görünür; sözsüz doğrularda Ceren kısa övgüyle hemen tepki verir (ovgu), tur sonunda her zaman.
let efektSayaci = 0;
a1KareleriniKur();
let sonDokunulan: Element | undefined, sonDokunma = 0, sonOvgu = 0;
const sonOvguler: number[] = [], sonYedekler: number[] = [];
let sonSoylenen = '';
/** Cila yalnız tur ekranlarında (Sayı masası, Şekil evi, Ölçü tezgâhı, Fener tiyatrosu); menüde ve Ceren'in derslerinde yok. */
let cilaEkrani = false;
function oyunSesi(ad: Parameters<typeof oyunSesiAsil>[0]) {
  efektSayaci++;
  // Doğru sesi (mıknatıs oturuşu, pırıltı): çocuğun az önce dokunduğu yerde parıltı.
  if ((ad === 'miknatis' || ad === 'parilti') && cilaEkrani) {
    const el = sonDokunulan;
    if (el && performance.now() - sonDokunma < 700) requestAnimationFrame(() => parilti(kok, el));
  }
  // Paket Matematik-A1: doğru anında görünen karakterlerin sevinç karesi (a1-kareler.ts; kare yoksa hiçbir şey değişmez).
  if (ad === 'parilti' || ad === 'miknatis' || ad === 'birles') tepkiYay('dogru');
  oyunSesiAsil(ad);
}
function calgiSesi(...a: Parameters<typeof calgiSesiAsil>) { efektSayaci++; calgiSesiAsil(...a); }
function boncuklariCal(...a: Parameters<typeof boncuklariCalAsil>) { efektSayaci++; boncuklariCalAsil(...a); }
/** Yanlışın sesi: yumuşak, komik "boyoyoy". */
function yanlisSesi() { efektSayaci++; komikSes(); tepkiYay('yanlis'); }
/** Ceren şu an konuşuyor mu? */
const konusuyor = () => !!ses && !ses.paused && !ses.ended;
type Olcum = { e: number; o: number; kilit: boolean };
const olc = (): Olcum => ({ e: efektSayaci, o: oturum, kilit });
/** Dokunuşun işleyicisi bitince: kendi sesi çalmadıysa yumuşak "pıt". */
function cilaSonrasi(on: Olcum) {
  if (!cilaEkrani || on.kilit || oturum !== on.o) return;
  if (efektSayaci === on.e) dokunmaSesi();
}
/**
 * Ceren'in anında kısa övgüsü ("Aferin!", "Harika!"…): yalnız ardından hemen söz gelmeyen doğrularda çağrılır (yoksa yarıda
 * kesilirdi). O an konuşuyorsa ya da son övgüden 3 sn geçmediyse susar; art arda aynı övgü olmaz. Söylediyse true.
 */
function ovgu() {
  if (konusuyor() || performance.now() - sonOvgu < 3000) return false;
  sonOvgu = performance.now();
  soyle(sozler[sec(OVGULER, sonOvguler)]);
  return true;
}
// Parmak değdiği an: düğme hafifçe göçüp yaylanır (sahneyi kaplayan büyük düğmeler hariç).
kok.addEventListener('pointerdown', (e) => {
  if (!cilaEkrani || kilit || !e.isPrimary) return;
  const b = (e.target as Element).closest('button');
  if (!b || b.disabled || !kok.contains(b)) return;
  sonDokunulan = b;
  sonDokunma = performance.now();
  if (b.getBoundingClientRect().width < kok.getBoundingClientRect().width * 0.4) dokunmaCanlan(b);
}, { capture: true });
const recordings = import.meta.glob<string>('../../assets/matematik/ses/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
});
// Ölçü tezgâhının yeni turları (Boy Duvarı, Yaprak Yolu): Astra'nın çizimleri (assets/matematik/olcu/) ve Ceren'in sözleri
// tamamsa uygulamada kendiliğinden açılır. Test kipinde yalnız ?test=1&olcu=1 ile ve eksik çizimin yerine yer tutucuyla açılır;
// yer tutucunun adresi yalnız test dalında metin olarak durur (içe aktarılmaz, pakete girmez).
const olcuKaynak = import.meta.glob<string>('../../assets/matematik/olcu/*.webp', { eager: true, import: 'default', query: '?url' });
const TEST_KIPI = new URLSearchParams(location.search).has('test');
function olcuCizim(ad: string): { src: string; ust?: number; alt?: number } | null {
  const gercek = olcuKaynak['../../assets/matematik/olcu/' + ad + '.webp'];
  if (gercek) return { src: gercek };
  if (!TEST_KIPI) return null;
  const y = YER_TUTUCU[ad] ?? YER_TUTUCU[ad.replace(/-\d$/, '')];
  return y ? { src: '../assets/' + y.yol + '.webp', ust: y.ust, alt: y.alt } : null;
}
let olcuAcik: boolean | undefined;
function olcuYeniAcik() {
  olcuAcik ??= TEST_KIPI
    ? new URLSearchParams(location.search).has('olcu')
    : olcuHazirMi((ad) => !!olcuKaynak['../../assets/matematik/olcu/' + ad + '.webp'], (i) => !!recordings['../../assets/matematik/ses/ses-' + i + '.mp3']);
  return olcuAcik;
}
const olcuImg = (ad: string, cls = '') => {
  const c = olcuCizim(ad);
  return c ? '<img class="' + cls + '" src="' + c.src + '" alt="" draggable="false">' : '';
};
/** Yer tutucu çizimi, Astra tuvalinin ölçüsüne oturtur: görünen boyu (kutunun oranı) ve tabanı (kutunun altından oranı). */
function yerTutucuOturt(img: HTMLImageElement, c: { ust?: number; alt?: number }, gorunen: number, taban: number) {
  if (c.ust === undefined || c.alt === undefined) { img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain'; return; }
  const boy = gorunen / (c.alt - c.ust);
  img.style.cssText = 'position:absolute;left:50%;translate:-50% 0;width:auto;height:' + boy * 100 + '%;bottom:' + (taban - (1 - c.alt) * boy) * 100 + '%';
}

function susArtik() {
  sus();
  ses?.pause();
  ses = undefined;
}
function soyle(m: string) {
  susArtik();
  sonSoylenen = m;
  if (document.hidden || dikTelefon.matches || !uygulamaDurumu.i.ayarlar.konusma) return;
  const id = sozler.indexOf(m);
  const yol = recordings['../../assets/matematik/ses/ses-' + id + '.mp3'];
  if (yol) {
    ses = new Audio(yol);
    ses.volume = Math.max(0, Math.min(1, uygulamaDurumu.i.ayarlar.seviye));
    void ses.play().catch(() => {});
  } else void konus(m);
}
function adediOku(n: number) {
  const ad = ['Sıfır.', 'Bir.', 'İki.', 'Üç.', 'Dört.', 'Beş.', 'Altı.', 'Yedi.', 'Sekiz.', 'Dokuz.', 'On.'][
    n
  ];
  if (ad) soyle(ad);
}
function buton(parent: Element, ad: string, ic: string, fn: () => void, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.setAttribute('aria-label', ad);
  b.innerHTML = ic;
  b.onclick = () => {
    sesiAc();
    const on = olc();
    fn();
    cilaSonrasi(on);
  };
  parent.append(b);
  return b;
}
function alan(cls: string, ic = '') {
  const e = document.createElement('div');
  e.className = cls;
  e.innerHTML = ic;
  kok.append(e);
  return e;
}
let sahneyiKapat: (() => void) | undefined;
function temiz(s: string, bg: string | null, sesiKoru = false) {
  sahneyiKapat?.(); sahneyiKapat = undefined;
  clearTimeout(yardimSaati);
  delete kok.dataset.bitti;
  oturum++;
  ipucunuTekrarla = undefined;
  clearTimeout(timer);
  if (!sesiKoru) susArtik();
  kilit = false;
  sahne = s;
  kok.classList.remove('liman-sahnesi');
  kok.replaceChildren();
  kok.dataset.ekran = s;
  cilaEkrani = s === 'oyun' || s === 'kule' || s === 'tangram';
  kok.style.backgroundImage = bg ? 'url("' + url('matematik/' + bg) + '")' : 'none';
}
function nav() {
  if (sahne !== 'menu' || location.protocol !== 'file:')
    buton(
      kok,
      sahne === 'menu' ? 'Ana menü' : 'Oyuncaklara dön',
      glyph('home'),
      () => (sahne === 'menu' ? anaMenuyeDon() : menu()),
      'nav ev',
    );
  buton(
    kok,
    'Tekrar dinle',
    glyph('sound'),
    () => (ipucunuTekrarla ? ipucunuTekrarla() : soyle(metin)),
    'nav ses',
  );
}
let parkurBaglantisi = new URLSearchParams(location.search).get('oyun') === 'misket';
function menu() {
  boncukSesiniKes();
  // Tezgâha dönüldü: yoldan açılan ders yarıda bırakıldıysa sonraki ders yola dönmez; mola sayacı yeni girişten başlar.
  yoldan = false;
  oturumTuru = 0;
  // Astra 2026-11-16: oyuncak seçme sahnesi (boş tezgâh + dört oyuncak, assets/matematik/atolye-*)
  temiz('menu', 'atolye-tezgah');
  nav();
  metin = 'Bir oyuncak seç. Birlikte oynayalım.';
  if (location.protocol === 'file:' || menuYasiOku() === null) {
    const yasSec = () => {
      temiz('yas', 'masa');
      const kartlar = alan('atolye-yas');
      kartlar.setAttribute('aria-label', 'Kaç yaşındasın?');
      MENU_YASLARI.forEach(y => buton(kartlar, y === 6 ? '6 yaş ve üzeri' : y + ' yaş',
        y === 6 ? '6+' : String(y), () => {
          menuYasiniSec(y);
          seviyeyiYukle();
          menu();
        }));
      buton(kok, 'Yaş sorusunu dinle', glyph('sound'), () => soyle(sozler[66]), 'nav ses');
      soyle(sozler[66]);
    };
    if (menuYasiOku() === null) { yasSec(); return; }
    buton(kok, 'Yaşı değiştir', menuYasiOku() === 6 ? '6+' : String(menuYasiOku()), yasSec, 'nav ev');
  }
  if (parkurBaglantisi) {
    parkurBaglantisi = false;
    if (parkurYasiUygun() && !kilitli('matematik/olcu')) {
      k = 'olcu';
      misketiAc();
      return;
    }
  }
  // Ana ekran: tezgâhta dört oyuncak (Astra yerleşimi: merkezler %13,5 / %38 / %62,5 / %87, altlık altı %81)
  const raf = alan('atolye-tezgahi');
  koseler.forEach((id, i) => {
    const tur = durum[id];
    const dugme = buton(raf, adlar[id],
      img('matematik/atolye-' + id) + '<b class="oyuncak-adi">' + adlar[id] + '</b>',
      () => {
        // Sayı masası ücretsiz; diğer köşeler premium (src/engine/erisim.ts → matematik/<köşe>)
        if (!erisimVarMi('matematik/' + id, document.body)) return;
        acilisGecisi(dugme);
        k = id;
        // Aşama 1: Sayı masası önce Ceren Öğretmen'in Sayılar 1–10 dersini açar (çizimler tamamsa).
        if (id === 'sayi' && cerenDersiGorunur && !cerenDersiBitti()) { cerenDersiniAc(); return; }
        // 5+ yaşta Sayı masasının hatırasından sonra (Clements & Sarama: parça-bütün onluk yapıdan önce; Antigravity CEVAP-06 B2):
        // önce Toplama ve çıkarma (5'e, 10'a tamamlama; Astra M7), o bitince (ya da henüz yoksa) Sayılar 11–20 (Astra M6).
        if (id === 'sayi' && toplamaDersiGorunur && !toplamaDersiBitti() && toplamaYasiUygun() && tur.hatira && yolSirada('topla')) { toplamaDersiniAc(); return; }
        if (id === 'sayi' && onlukDersiGorunur && !onlukDersiBitti() && onlukAcilir(menuYasiOku(), tur.hatira) && yolSirada('onluk')) { onlukDersiniAc(); return; }
        // Ceren'in 2. dersi (Şekiller) Şekil evini açar (Astra M3 çizimleri ve sözler tamamsa).
        if (id === 'sekil' && sekillerDersiGorunur && !sekillerDersiBitti() && yolSirada('sekiller')) { sekillerDersiniAc(); return; }
        // Ceren'in 3. dersi (Karşılaştır ve ölç) Ölçü tezgâhını açar (Astra M4 çizimleri ve sözler tamamsa).
        if (id === 'olcu' && olcuDersiGorunur && !olcuDersiBitti() && yolSirada('olcu')) { olcuDersiniAc(); return; }
        // Ceren'in 4. dersi (Örüntü) Fener tiyatrosunu açar (Astra M5 çizimleri ve sözler tamamsa).
        if (id === 'fener' && oruntuDersiGorunur && !oruntuDersiBitti() && yolSirada('oruntu')) { oruntuDersiniAc(); return; }
        if (tur.adim === sonu(id)) sifirla(k);
        oyna(true);
      }, 'kose tezgah-oyuncak k' + i);
    kilitGoster(dugme, 'matematik/' + id);
    if (yeniHatira === id) {
      dugme.classList.add('hatira-geldi');
      dugme.addEventListener('animationend', () => dugme.classList.remove('hatira-geldi'), { once: true });
    }
    if (tur.adim > 0) {
      const iz = document.createElement('span');
      iz.className = 'iz';
      iz.style.setProperty('--d', (100 * tur.adim / sonu(id)) + '%');
      dugme.append(iz);
    }
    if (tur.hatira) dugme.insertAdjacentHTML('beforeend', '<span class="kart-yildiz" aria-hidden="true">★</span>');
    // Bitirmiş çocuğa sıraya eklenen yeni turlar: yıldızı kalır, kartta "Yeni" rozeti.
    if (tur.hatira && tur.adim > 0 && tur.adim < sonu(id)) {
      dugme.classList.add('yeni-turlar');
      dugme.insertAdjacentHTML('beforeend', '<span class="kart-yeni" aria-hidden="true">Yeni</span>');
    }
  });
  // Büyükler için (veli.ts): ebeveyn kapısının arkasında ilerleme sayfası; çocuğa göre küçük, yazılı düğme.
  buton(kok, 'Büyükler için', 'Büyükler için', () => {
    susArtik();
    sahneyiKapat = veliSayfasiAc(kok, { zorlananlar: () => zorlananlar(tekrarYolu()), zorKonular: () => zorKonular(tekrarYolu()), kapaninca: () => { sahneyiKapat = undefined; } });
  }, 'buyukler');
  // Ders yolu (Bahçe Şenliği): tezgâhın üstünde şenlik tabelası.
  if (dersYoluGorunur) buton(kok, 'Şenlik hazırlığı', senlikTabelasi(), dersYoluAc, 'senlik-giris');
  if (yeniHatira) { yeniHatira = undefined; oyunSesi('birles'); }
}
let yeniHatira: Kose | undefined;
/**
 * Oyuncak açılırken (premium geçiş, 23 Kasım): oyuncağın resmi yerinden büyüyerek ekranın ortasına yayılır ve söner; yeni tur
 * onun altında kurulur. Görünmez katman, dokunuşu tutmaz; hareket azaltılmışsa yok.
 */
function acilisGecisi(dugme: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const resim = dugme.querySelector('img');
  if (!resim) return;
  const r = resim.getBoundingClientRect();
  const kopya = resim.cloneNode() as HTMLImageElement;
  kopya.className = 'acilis-gecisi';
  Object.assign(kopya.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: '60', pointerEvents: 'none', objectFit: 'contain', margin: '0' });
  document.body.append(kopya);
  const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height / 2);
  const a = kopya.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + dx * 0.6 + 'px,' + dy * 0.6 + 'px) scale(1.7)', opacity: 0.9, offset: 0.45 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(2.8)', opacity: 0 }], { duration: 480, easing: 'cubic-bezier(.3,.7,.3,1)' });
  a.finished.then(() => kopya.remove(), () => kopya.remove());
}
/** Boncuk sayma turunda yanlış onayın yazıldığı adım (bir turda bir kez yazılır). */
let boncukYanlisAdim = -1;
// ----- Ders yolu: Minkino Bahçe Şenliği (ders-yolu.ts). Altı ders, şenliğin altı parçası; sıra yolda ve oyuncak kapılarında aynı. -----
const DERS_DURUMU: Record<DersId, { bitti: () => boolean; hazir: () => boolean }> = {
  sayilar: { bitti: cerenDersiBitti, hazir: () => cerenDersiGorunur },
  sekiller: { bitti: sekillerDersiBitti, hazir: () => sekillerDersiGorunur },
  olcu: { bitti: olcuDersiBitti, hazir: () => olcuDersiGorunur },
  oruntu: { bitti: oruntuDersiBitti, hazir: () => oruntuDersiGorunur },
  topla: { bitti: toplamaDersiBitti, hazir: () => toplamaDersiGorunur },
  onluk: { bitti: onlukDersiBitti, hazir: () => onlukDersiGorunur },
};
/** Ders, oyuncağının kapısından da ancak yolda sıradaki işse açılır (hazır olmayan dersler atlanır). */
const yolSirada = (d: DersId) =>
  yolDurumu(yasDersleri(menuYasiOku()), (x) => DERS_DURUMU[x].bitti(), (x) => DERS_DURUMU[x].hazir())[d] === 'sirada';
/** Ders yoldan açıldıysa bitince yola dönülür (parça canlanır); oyuncaktan açıldıysa tezgâha. */
let yoldan = false;
function dersBitince() {
  if (yoldan) { yoldan = false; dersYoluAc(); } else menu();
}
function dersYoluAc() {
  boncukSesiniKes();
  yoldan = false;
  temiz('ceren', null);
  nav();
  const ac: Record<DersId, () => void> = {
    sayilar: cerenDersiniAc, sekiller: sekillerDersiniAc, olcu: olcuDersiniAc, oruntu: oruntuDersiniAc, topla: toplamaDersiniAc, onluk: onlukDersiniAc,
  };
  sahneyiKapat = dersYolu({
    kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, yas: menuYasiOku(), dersler: DERS_DURUMU,
    dersAc: (d) => {
      // Kilit değişmez: ders, açtığı oyuncağın kilidinin arkasında.
      if (!erisimVarMi('matematik/' + DERS_KOSESI[d], document.body)) return false;
      ac[d]();
      yoldan = true;
      return true;
    },
  });
}
function cerenDersiniAc() {
  boncukSesiniKes();
  k = 'sayi';
  temiz('ceren', null);
  nav();
  sahneyiKapat = cerenDersi({
    kok,
    sesiAc,
    tekrarDinle: (fn) => { ipucunuTekrarla = fn; },
    bitir: () => {
      // Hatıra: Sayı masasının abaküsü tezgâhta yıldızını alır.
      durum.sayi.hatira = true;
      kaydet('sayi');
      yeniHatira = 'sayi';
      dersBitince();
    },
  });
}
/** Derslerin ilk yanlışı ve yanlışsız doğrusu konu defterine (akıllı tekrar; veli sayfasında "Biraz daha tekrar"). */
const konuIzi = (alan: TekrarAlani) => ({
  zorlandi: (konu: string) => konudaZorlandi(tekrarYolu(), alan, konu),
  basardi: (konu: string) => konudaBasardi(tekrarYolu(), alan, konu),
});
function sekillerDersiniAc() {
  boncukSesiniKes();
  k = 'sekil';
  temiz('ceren', null);
  nav();
  sahneyiKapat = sekillerDersi({
    kok,
    sesiAc,
    tekrarDinle: (fn) => { ipucunuTekrarla = fn; },
    bitir: dersBitince,
    ...konuIzi('sekil'),
  });
}
function olcuDersiniAc() {
  boncukSesiniKes();
  k = 'olcu';
  temiz('ceren', null);
  nav();
  sahneyiKapat = olcuDersi({ kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, bitir: dersBitince, ...konuIzi('olcu') });
}
function oruntuDersiniAc() {
  boncukSesiniKes();
  k = 'fener';
  temiz('ceren', null);
  nav();
  sahneyiKapat = oruntuDersi({ kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, bitir: dersBitince, ...konuIzi('oruntu') });
}
function onlukDersiniAc() {
  boncukSesiniKes();
  k = 'sayi';
  temiz('ceren', null);
  nav();
  sahneyiKapat = onlukDersi({ kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, bitir: dersBitince });
}
function toplamaDersiniAc() {
  boncukSesiniKes();
  k = 'sayi';
  temiz('ceren', null);
  nav();
  sahneyiKapat = toplamaDersi({ kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, bitir: dersBitince });
}
function hareketIpucu(kaynak: Element, hedef: Element) {
  clearTimeout(yardimSaati);
  const s = oturum;
  yardimSaati = window.setTimeout(() => {
    if (oturum !== s || kilit || document.hidden || !kaynak.isConnected || !hedef.isConnected) return;
    const a = kaynak.getBoundingClientRect(),
      b = hedef.getBoundingClientRect(),
      zemin = kok.getBoundingClientRect();
    const iz = alan('dokunma-izi', img('hazirlik/dugmeler/ileri'));
    iz.setAttribute('aria-hidden', 'true');
    iz.style.left = a.left + a.width / 2 - zemin.left + 'px';
    iz.style.top = a.top + a.height / 2 - zemin.top + 'px';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      iz.remove();
      hedef.classList.add('ipucu-hedef');
      return;
    }
    const dx = b.left + b.width / 2 - a.left - a.width / 2,
      dy = b.top + b.height / 2 - a.top - a.height / 2;
    const oku = iz.firstElementChild as HTMLElement;
    oku.style.rotate = Math.atan2(dy, dx) + 'rad';
    const anim = iz.animate(
      [
        { opacity: 0, translate: '0 0' },
        { opacity: 0.95, offset: 0.16 },
        { opacity: 0.95, offset: 0.78 },
        { opacity: 0, translate: dx + 'px ' + dy + 'px' },
      ],
      { duration: 1400, iterations: 2 },
    );
    anim.onfinish = () => iz.remove();
  }, 6500);
}
function ipucuHedefi(el: Element) {
  el.animate(
    [
      { outline: '3px solid #fdd757', outlineOffset: '3px' },
      { outline: '3px solid transparent', outlineOffset: '3px' },
    ],
    { duration: 900 },
  );
}
function kusSoyle(el: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.getAnimations().forEach(a => a.cancel());
  el.animate([
    { backgroundPositionX: '0%', easing: 'steps(5, end)' },
    { backgroundPositionX: '100%', offset: .84 },
    { backgroundPositionX: '100%' },
  ], { duration: 535 });
}
/**
 * Bu türün uzun açıklayan övgüsü bu oyunda henüz söylenmedi mi? Söylenince kayda işlenir; ikincisinde kısa sonuç gelir
 * (aynı söz iki kez olmaz). Sıraya değil kayda bakar: misket parkuru ilk ölçü turunun yerine geçse de açıklama bir kez duyulur.
 */
function ilkAciklama() {
  const t = durum[k], tur = turTuru(k, turNumarasi(k, t.adim));
  if (t.anlatilan?.includes(tur)) return false;
  (t.anlatilan ??= []).push(tur);
  return true;
}
/** Şu an okunan söz bitince (ses kapalıysa hemen) çağırır; sahne değişirse çağırmaz. */
function sozBitince(fn: () => void, enUzun = 7000) {
  const kayit = ses, token = oturum;
  let oldu = false;
  const git = () => { if (oldu || oturum !== token) return; oldu = true; fn(); };
  if (!kayit || kayit.ended || kayit.error) { git(); return; }
  kayit.addEventListener('ended', git, { once: true });
  kayit.addEventListener('error', git, { once: true });
  kayit.addEventListener('pause', git, { once: true });
  window.setTimeout(git, enUzun);
}
/** Yanlış: yumuşak, komik ses ve sallanma; art arda aynı ipucu sözü olmaz (ikincisinde Ceren'in kısa yedek sözü gelir). */
function ipucu(el: Element, yardim?: string) {
  if (yardim) soyle(yardim === sonSoylenen ? sozler[sec(YANLIS_YEDEK, sonYedekler)] : yardim);
  yanlisSesi();
  // Kendi "kıpır" hareketi olan öğe ikinci kez sallanmaz.
  if (!el.classList.contains('kipir')) komikSalla(el);
  pofEfekti(kok, el);
}
function hatirayiGoster() {
  temiz('son', 'masa');
  metin = adlar[k] + ' tamamlandı. Başka bir oyuncak seçebilirsin.';
  nav();
  const kart = alan('hatira', img('matematik/hatira-' + k) + glyph('ok'));
  buton(kok, 'Oyuncaklara dön', glyph('back'), menu, 'bitir');
  soyle(metin);
  // Hatıra kartı zıplayarak gelir; geldiği an ve ardından iki kez daha parıltı dalgası (kalite: tur sonu kutlaması).
  const token = oturum;
  [620, 2600, 5200].forEach((ms, i) => window.setTimeout(() => { if (oturum === token && kart.isConnected) { parilti(kok, kart, i ? 5 : 9); if (!i) oyunSesi('parilti'); } }, ms));
  // Karta dokunmak da sevinç: kart hoplar, parıldar.
  kart.style.pointerEvents = 'auto';
  kart.addEventListener('click', () => { zipla(kart); parilti(kok, kart, 5); oyunSesi('parilti'); });
}
// ----- Mola anı (yönetici kararı 20 Kasım; Antigravity CEVAP-06 B4/D2): tek girişte 8–10 tur uzun. Oyuncağa girişten beri
// biten tur 2–3 yaşta her 3'te, büyüklerde her 4'te bir kısa kutlama ve iki seçenek: "Devam" ya da "Tezgâha dön" (kaldığı
// turdan sürer). Tur sayısı ve kayıt değişmez. Test kipinde ?mola=1 her turdan sonra gösterir. -----
let oturumTuru = 0;
const molaAraligi = () => (TEST_KIPI && new URLSearchParams(location.search).has('mola') ? 1 : minik ? 3 : 4);
function molaGoster() {
  const t = durum[k];
  const token = oturum;
  kok.querySelector('.basari')?.remove();
  const m = alan('mola');
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-label', 'Mola');
  const yildiz = Array.from({ length: sonu(k) }, (_, i) => '<i class="' + (i < t.adim ? 'dolu' : '') + '">★</i>').join('');
  m.innerHTML = '<div class="mola-oyuncak">' + img('matematik/atolye-' + k) + '</div><div class="mola-yildizlar" aria-label="' + t.adim + ' / ' + sonu(k) + ' tur">' + yildiz + '</div>';
  const secim = document.createElement('div');
  secim.className = 'mola-secim';
  m.append(secim);
  buton(secim, 'Devam', glyph('play'), () => { if (oturum !== token) return; m.remove(); oyna(true); }, 'mola-devam');
  buton(secim, 'Tezgâha dön', glyph('home'), () => { if (oturum !== token) return; menu(); }, 'mola-tezgah');
  metin = sozler[120];
  oyunSesi('parilti');
  soyle(sozler[120]);
}
function tamam(sonSoz?: string) {
  if (kilit) return;
  kilit = true;
  clearTimeout(yardimSaati);
  kok.querySelector('.dokunma-izi')?.remove();
  oyunSesi('birles');
  // Ceren anında tepki verir: tur kendi sözünü vermediyse ve o an konuşmuyorsa kısa övgü (art arda aynısı olmaz).
  if (!sonSoz && !konusuyor()) sonSoz = sozler[sec(OVGULER, sonOvguler)];
  const t = durum[k];
  t.adim++;
  if (t.adim === sonu(k)) t.hatira = true;
  delete t.tarif;
  delete t.cizim;
  delete t.boncukHazir;
  delete t.plan;
  delete t.planZor;
  boncukYanlisAdim = -1;
  t.yer = 0;
  t.secimler = [];
  kaydet(k);
  kok.dataset.bitti = '1';
  const m = alan('basari', glyph('ok'));
  m.setAttribute('role', 'status');
  m.setAttribute('aria-label', 'Tamamlandı');
  requestAnimationFrame(() => parilti(kok, m, 10));
  if (sonSoz) soyle(sonSoz);
  const gec = () => {
    delete kok.dataset.bitti;
    if (t.adim === sonu(k)) hatirayiGoster();
    else if (++oturumTuru % molaAraligi() === 0) molaGoster();
    else oyna(true);
  };
  timer = window.setTimeout(gec, sonSoz ? 6000 : 1000);
  if (sonSoz && ses) {
    const token = oturum;
    ses.addEventListener(
      'ended',
      () => {
        if (oturum !== token || !kilit || document.hidden) return;
        clearTimeout(timer);
        timer = window.setTimeout(gec, 300);
      },
      { once: true },
    );
  } else if (sonSoz) {
    clearTimeout(timer);
    timer = window.setTimeout(gec, 1400);
  }
}
const birakilanKonum = new WeakMap<Element, DOMRect>();
function parcaninKonumu(b: Element) {
  return birakilanKonum.get(b) ?? (b.querySelector('img') ?? b).getBoundingClientRect();
}
function yerineOtur(bas: DOMRect, hedef: Element | null) {
  if (!hedef || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const son = hedef.getBoundingClientRect();
  if (!son.width || !son.height) return;
  const x = bas.left - son.left + (bas.width - son.width) / 2;
  const y = bas.top - son.top + (bas.height - son.height) / 2;
  hedef.animate([
    {translate: x + 'px ' + y + 'px', scale: String(Math.min(2, Math.max(.6, bas.width / son.width)))},
    {translate: '0 -2px', scale: '1', offset: .86},
    {translate: '0 0', scale: '1'},
  ], {duration: 360, easing: 'cubic-bezier(.23,.72,.33,1)'});
}
function surukle(
  b: HTMLButtonElement,
  hedef: (e: PointerEvent) => DOMRect | undefined,
  yap: () => void,
  eksen?: 'yatay',
  kayma?: (dx: number) => void,
) {
  let id = -1,
    x = 0,
    y = 0,
    oynadi = false,
    engelle = false;
  const klik = b.onclick;
  b.onclick = (e) => {
    if (engelle && e.detail) {
      engelle = false;
      return;
    }
    klik?.call(b, e);
  };
  b.onpointerdown = (e) => {
    if (id !== -1 || !e.isPrimary || e.button !== 0 || kilit) return;
    engelle = false;
    kayma?.(0);
    id = e.pointerId;
    x = e.clientX;
    y = e.clientY;
    oynadi = false;
    b.setPointerCapture(id);
  };
  b.onpointermove = (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x,
      dy = e.clientY - y;
    if (Math.hypot(dx, dy) > 7) oynadi = true;
    if (oynadi) {
      kayma?.(dx);
      b.style.translate = dx + 'px ' + (eksen ? 0 : dy) + 'px';
      b.style.zIndex = '8';
    }
  };
  b.onpointerup = (e) => {
    if (e.pointerId !== id) return;
    id = -1;
    const birakma = oynadi ? (b.querySelector('img') ?? b).getBoundingClientRect() : undefined;
    b.style.translate = '';
    b.style.zIndex = '';
    if (!oynadi) return;
    engelle = true;
    const r = hedef(e);
    if (
      r &&
      e.clientX >= r.left - 10 &&
      e.clientX <= r.right + 10 &&
      e.clientY >= r.top - 10 &&
      e.clientY <= r.bottom + 10
    ) {
      sesiAc();
      if (birakma) birakilanKonum.set(b, birakma);
      const on = olc();
      try { yap(); } finally { birakilanKonum.delete(b); }
      cilaSonrasi(on);
    } else ipucu(b);
  };
  b.onlostpointercapture = b.onpointercancel = (e) => {
    if (e.pointerId !== id) return;
    engelle = oynadi;
    id = -1;
    b.style.translate = '';
    b.style.zIndex = '';
  };
}
// ----- Sayı masası · Hızlı Gözler (anlık sayılama) -----
// Nesneler bir an belirir ve saklanır; çocuk kaç tane gördüğünü rakam bloğundan seçer. Doğruda nesneler geri gelip
// zıplayarak kendini sayar (beşlikte "beş", sonra "altı, yedi…"); yanlışta bir kez daha, daha uzun görünür,
// ikinci yanlışta açık kalır. Her soru kayda işlenir (yarıda kalan tur kaldığı sorudan sürer).
let hizliSeri = 0;
// Akıllı tekrar (akilli-tekrar.ts): yaşın defteri; Hızlı Gözler ve boncuk sayma yazar, veli sayfası okur.
const tekrarYolu = (): TekrarYolu => (minik ? 'minik' : dortYas ? 'dort' : 'bes');
const birDahaCizim = Object.values(import.meta.glob<string>('../../assets/matematik/ders/tekrar/ceren-bir-daha.webp', { eager: true, import: 'default', query: '?url' }))[0];
function hizliGozler(t: Tur, n: number, pano: HTMLElement, masa: HTMLElement, sesli: boolean) {
  const yol: HgYol = tekrarYolu();
  // Turun soruları ilk soruda bir kez kurulur: zorlanılan sayılar ısınma sorusunun hemen ardına alınır.
  if (!t.plan?.length) {
    const zor = zorlananlar(yol);
    t.plan = oneAl(hizliAdetler(yol, n, t.tekrar ?? 0), zor, enBuyuk(yol));
    t.planZor = t.plan.filter((a) => zor.includes(a));
    kaydet(k);
  }
  const sorular = hizliSorular(yol, n, t.tekrar ?? 0, t.plan);
  const no = Math.min(t.secimler.length, sorular.length - 1);
  const soru = sorular[no];
  if (!t.secimler.length) hizliSeri = 0;
  const token = oturum;
  metin = sozler[n === 16 ? 96 : 98];
  pano.classList.add('hizli-gozler');
  pano.dataset.durum = 'hazir';
  pano.dataset.soru = String(no);
  const yildizlar = document.createElement('div');
  yildizlar.className = 'hg-yildizlar';
  yildizlar.setAttribute('aria-hidden', 'true');
  sorular.forEach((_, i) => yildizlar.insertAdjacentHTML('beforeend', '<i class="' + (i < t.secimler.length ? 'dolu' : '') + '">★</i>'));
  pano.append(yildizlar);
  const alanEl = document.createElement('div');
  alanEl.className = 'hg-alan gizli';
  alanEl.dataset.dizilis = soru.dizilis;
  alanEl.style.setProperty('--boy', nesneBoyu(soru.adet) * 100 + '%');
  pano.append(alanEl);
  const nesneler = yerlesim(soru.dizilis, soru.adet, (t.tekrar ?? 0) + no).map((p, i) => {
    const el = document.createElement('span');
    el.className = 'hg-nesne';
    el.style.left = p.x * 100 + '%';
    el.style.top = p.y * 100 + '%';
    el.style.setProperty('--i', String(i));
    el.innerHTML = img('matematik/' + soru.nesne);
    alanEl.append(el);
    return el;
  });
  masa.classList.add('hg-rakamlar');
  masa.inert = true;
  let yanlis = 0, cevaplandi = false;
  function goster(sure: number, acikKalsin = false) {
    if (oturum !== token) return;
    clearTimeout(timer);
    pano.dataset.durum = 'goster';
    masa.inert = true;
    void alanEl.offsetWidth;
    alanEl.classList.remove('gizli');
    if (acikKalsin) { pano.dataset.durum = 'sor'; masa.inert = false; return; }
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      alanEl.classList.add('gizli');
      pano.dataset.durum = 'sor';
      masa.inert = false;
    }, sure);
  }
  function bitir() {
    if (yanlis === 0) hizliSeri++;
    else hizliSeri = 0;
    const yildiz = yildizlar.children[no];
    yildiz?.classList.add('dolu', 'yeni');
    // Art arda ilk bakışta bilinen sorular küçük bir ödül: yıldız parlar.
    if (hizliSeri >= 2) yildiz?.classList.add('parlak');
    oyunSesi('miknatis');
    t.secimler.push(soru.adet);
    kaydet(k);
    if (t.secimler.length >= sorular.length) {
      const hepsiIlkBakista = t.yer === 0;
      timer = window.setTimeout(() => tamam(hepsiIlkBakista ? sozler[97] : undefined), 650);
    } else if (ovgu()) sozBitince(() => { timer = window.setTimeout(() => oyna(), 200); }, 1600);
    else timer = window.setTimeout(() => oyna(), 800);
  }
  function cevap(s: number, b: HTMLButtonElement) {
    if (kilit || cevaplandi || pano.dataset.durum !== 'sor') return;
    if (s !== soru.adet) {
      if (!yanlis) zorlandi(yol, soru.adet);
      yanlis++;
      t.yer = Math.min(10, t.yer + 1);
      kaydet(k);
      ipucu(b);
      goster(soru.sure * YENIDEN_KAT, yanlis > 1);
      return;
    }
    cevaplandi = true;
    if (!yanlis) basardi(yol, soru.adet);
    masa.inert = true;
    b.classList.add('dogru');
    // Doğru rakam o an parlar ve çınlar (sayma 0,38 sn sonra başlar).
    oyunSesi('parilti');
    pano.dataset.durum = 'say';
    alanEl.classList.remove('gizli');
    const adimlar = kendiniSay(soru.dizilis, soru.adet);
    const ara = minik ? 680 : 580;
    let i = 0;
    const say = () => {
      if (oturum !== token) return;
      if (i === adimlar.length) { bitir(); return; }
      const a = adimlar[i++];
      for (const j of a.nesneler) {
        const el = nesneler[j];
        el.classList.remove('zipla');
        void el.offsetWidth;
        el.classList.add('zipla', 'sayildi');
      }
      adediOku(a.sayi);
      timer = window.setTimeout(say, ara);
    };
    timer = window.setTimeout(say, 380);
  }
  soru.secenek.forEach((s) => {
    const b = buton(masa, String(s), img('matematik/ceren/rakam-' + s), () => cevap(s, b), 'parca hg-rakam');
  });
  ipucunuTekrarla = () => { if (!cevaplandi) soyle(metin); };
  const basla = () => goster(soru.sure);
  // Zorlanılan sayı geri geldi: turda bir kez Ceren "Bu sayıyla bir daha oynayalım!" der (M9 çizimi gelince yanında görünür).
  const birDaha = !!t.planZor?.includes(soru.adet) && !t.secimler.some((a) => t.planZor!.includes(a));
  pano.dataset.birDaha = birDaha ? '1' : '';
  // İlk soruda kısa yönerge, sonra hemen başlar; sonraki sorular sözsüz, tempolu.
  if (sesli && !t.secimler.length) {
    soyle(metin);
    sozBitince(() => { timer = window.setTimeout(basla, 300); });
  } else if (birDaha) {
    if (birDahaCizim) pano.insertAdjacentHTML('beforeend', '<img class="hg-bir-daha" src="' + birDahaCizim + '" alt="" draggable="false">');
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      soyle(sozler[119]);
      sozBitince(() => { pano.querySelector('.hg-bir-daha')?.remove(); timer = window.setTimeout(basla, 250); }, 4000);
    }, 450);
  } else timer = window.setTimeout(basla, 600);
}
// ----- Yeni turlar (yeni-turlar.ts): Lokum'un İki Kâsesi, Zıpzıp'ın Saklı Fındıkları, Baba'nın Takım Çantası. Sırada aynı
// türün ikinci kez geldiği turun yerine geçer; Astra'nın çizimleri (M10–M12) ve Ceren'in sözleri tamamsa açılır, yoksa eski
// tur oynar. Test kipinde ?test=1&yeniturlar=1 ile çizim yerinde adı yazılı kutularla. -----
const yeniKaynak = import.meta.glob<string>([
  '../../assets/matematik/iki-kase/*.webp', '../../assets/matematik/sakli-findik/*.webp', '../../assets/matematik/takim-cantasi/*.webp',
  '../../assets/matematik/elma-sandik/*.webp', '../../assets/matematik/kurabiye/*.webp', '../../assets/matematik/sayi-treni/*.webp',
  '../../assets/matematik/balonlar/*.webp', '../../assets/matematik/kek-firini/*.webp', '../../assets/matematik/asansor/*.webp',
  '../../assets/matematik/yeni-sekiller/*.webp', '../../assets/matematik/resim-yap/*.webp', '../../assets/matematik/buyuyen-fener/*.webp',
  '../../assets/matematik/senlik-bayraklari/*.webp', '../../assets/matematik/kino-calgi/*.webp',
  '../../assets/matematik/surahi/*.webp', '../../assets/matematik/butun-yarim/*.webp', '../../assets/matematik/kino-gunu/*.webp',
  '../../assets/matematik/ritmik-ziplama/*.webp', '../../assets/matematik/esit-paylasim/*.webp',
  '../../assets/matematik/roket-geri-sayim/*.webp', '../../assets/matematik/kelebek-kanadi/*.webp', '../../assets/matematik/meyve-grafigi/*.webp',
  '../../assets/matematik/saklambac/*.webp', '../../assets/matematik/kaydirak-sirasi/*.webp', '../../assets/matematik/aile-sofrasi/*.webp', '../../assets/matematik/es-kartlar/*.webp', '../../assets/matematik/sekil-kutusu/*.webp',
], { eager: true, import: 'default', query: '?url' });
const yeniCizim = (yt: YeniTur, ad: string): string | undefined => yeniKaynak['../../assets/matematik/' + YENI_KLASOR[yt] + '/' + ad + '.webp'];
/** Test kipinde ?yenitur=<ad>: o turun oyuncağında her tur bu tur olur (yerleşimden bağımsız sınamak için). */
const zorlaYeni = TEST_KIPI ? new URLSearchParams(location.search).get('yenitur') : null;
/** Sıradaki turun yeni turu (ek tur ya da yer değiştiren Lokum, Baba); kapısı ek-turlar.ts → turAcik. */
function yeniTurAcik(k: Kose, n: number): YeniTur | undefined {
  if (zorlaYeni && zorlaYeni in YENI_KOSE && YENI_KOSE[zorlaYeni as YeniTur] === k) return zorlaYeni as YeniTur;
  const yt = yeniTur(tekrarYolu(), k, n);
  return yt && turAcik(yt) ? yt : undefined;
}
const yeniResim = (yt: YeniTur, ad: string, cls: string, yazi = ad) => resimHTML(yeniCizim(yt, ad), cls, ad, '', yazi);
/**
 * Yeni turun zor sayıları (derinlik.ts): akıllı tekrar defterinden turun başında bir kez alınır, tur bitene dek saklanır
 * (yarıda kalan tur aynı sorularla sürer; tamam → planZor silinir).
 */
function turunZorlari(t: Tur): number[] {
  if (!t.planZor) { t.planZor = t.secimler.length ? [] : zorlananlar(tekrarYolu()).slice(0, 3); kaydet(k); }
  return t.planZor;
}
/** Yeni turlarda sayılı cevap defteri (0–20): bir sorunun ilk yanlışında doğru sayı yazılır, ilk denemede doğruda düzelir. */
function sayiDefteri() {
  let yanlis = false;
  return {
    yanlis: (n: number) => { if (!yanlis && n >= 0 && n <= 20) zorlandi(tekrarYolu(), n); yanlis = true; },
    dogru: (n: number) => { if (!yanlis && n >= 0 && n <= 20) basardi(tekrarYolu(), n); yanlis = false; },
  };
}

/**
 * Lokum'un İki Kâsesi (parça-bütün): ortadaki mandalinaları Kino'nun ve Lokum'un kâselerine paylaştır. Çocuk bir kâseye
 * dokunur, ortadan bir mandalina oraya gider ve Ceren o kâsenin sayısını söyler. Hepsi paylaşılınca iki sayı kâselerin altında,
 * toplam ortada rakam bloklarıyla görünür. "Şimdi başka türlü!": aynı sayı başka biçimde. İki farklı bölüşümden sonra ikisi yer.
 * Kayıt: t.secimler tamamlanan bölüşümler (çiftler hâlinde).
 */
function ikiKase(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.lokum;
  const N = lokumSayisi(tekrarYolu(), t.tekrar ?? 0, turunZorlari(t));
  const fon = yeniCizim('lokum', 'piknik-masasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('ik-sahne');
  sahneEl.dataset.toplam = String(N);
  sahneEl.style.setProperty('--ik-m', N <= 5 ? '4cqw' : N <= 8 ? '3.4cqw' : '3cqw');
  const bolusumler: Bolusum[] = [];
  for (let i = 0; i + 1 < t.secimler.length; i += 2) bolusumler.push([t.secimler[i], t.secimler[i + 1]]);
  // İkisi masanın arkasında: alt gövdeleri masanın arka kenarında (fon y 413) kalır, patileri masaya değer.
  const arka = document.createElement('div');
  arka.className = 'ik-arka';
  sahneEl.append(arka);
  const dost = (['kino', 'lokum'] as const).map((ad) => {
    const d = document.createElement('div');
    d.className = 'ik-dost ik-' + ad;
    d.dataset.poz = '0';
    d.innerHTML = yeniResim('lokum', ad + '-kase-0', 'ik-poz ik-poz-0', ad === 'kino' ? 'Kino' : 'Lokum') + yeniResim('lokum', ad + '-kase-1', 'ik-poz ik-poz-1', '');
    arka.append(d);
    return d;
  });
  const orta = document.createElement('div');
  orta.className = 'ik-orta';
  sahneEl.append(orta);
  const dagilim: [number, number] = [0, 0];
  let mesgul = false;
  const kaseler = (['kino', 'lokum'] as const).map((ad, i) => buton(sahneEl, i ? "Lokum'un kâsesi" : "Kino'nun kâsesi",
    yeniResim('lokum', 'kase-' + ad, 'ik-kase-resim', i ? 'Lokum' : 'Kino') + '<div class="ik-ic"></div><div class="ik-sayi"></div>', () => koy(i), 'ik-kase ik-kase-' + i));
  const meyve = () => yeniResim('lokum', 'mandalina', 'ik-mandalina', '');
  function ciz() {
    const kalan = N - dagilim[0] - dagilim[1];
    orta.innerHTML = kalan ? meyve().repeat(kalan) : rakamResmi(N);
    orta.classList.toggle('toplam', !kalan);
    kaseler.forEach((kb, i) => {
      kb.dataset.sayi = String(dagilim[i]);
      kb.querySelector('.ik-ic')!.innerHTML = meyve().repeat(dagilim[i]);
      kb.querySelector('.ik-sayi')!.innerHTML = dagilim[i] && !kalan ? rakamResmi(dagilim[i]) : '';
    });
    sahneEl.dataset.bolusum = String(bolusumler.length);
  }
  const sifirla = () => { dagilim[0] = 0; dagilim[1] = 0; mesgul = false; ciz(); };
  function koy(i: number) {
    if (mesgul || kilit || dagilim[0] + dagilim[1] >= N) return;
    dagilim[i]++;
    oyunSesi('damla');
    ciz();
    const kalan = N - dagilim[0] - dagilim[1];
    if (kalan) { adediOku(dagilim[i]); return; }
    mesgul = true;
    const b: Bolusum = [dagilim[0], dagilim[1]];
    if (!bolusumTamam(N, b[0], b[1])) {
      // Biri hiç almadı: Ceren "İkisine de ver!" der, mandalinalar ortaya döner.
      ipucu(kaseler[b[0] ? 1 : 0], sozler[S.ikisineDe]);
      timer = window.setTimeout(() => { if (oturum === token) sifirla(); }, 1900);
      return;
    }
    if (!farkliMi(bolusumler, b)) {
      soyle(sozler[S.ayni]);
      timer = window.setTimeout(() => { if (oturum === token) sifirla(); }, 2300);
      return;
    }
    // Yeni bir bölüşüm: Ceren iki sayıyı söyler, toplam ortada.
    bolusumler.push(b);
    sahneEl.dataset.bolusum = String(bolusumler.length);
    t.secimler.push(b[0], b[1]);
    kaydet(k);
    oyunSesi('miknatis');
    adediOku(b[0]);
    sozBitince(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        adediOku(b[1]);
        sozBitince(() => {
          timer = window.setTimeout(() => {
            if (oturum !== token) return;
            if (bolusumler.length >= BOLUSUM) {
              // İkisi afiyetle yer.
              dost.forEach((d) => { d.dataset.poz = '1'; });
              tamam(sozler[S.afiyet]);
              return;
            }
            metin = sozler[S.baskaTurlu];
            soyle(metin);
            sozBitince(() => { timer = window.setTimeout(() => { if (oturum === token) sifirla(); }, 300); });
          }, 350);
        });
      }, 250);
    });
  }
  ciz();
  metin = bolusumler.length ? sozler[S.baskaTurlu] : sozler[S.yonerge];
  if (sesli) soyle(metin);
}
/** Fon pikseli (Astra'nın 1672 genişlikli fonları) → cqw. */
const fonCqw = (px: number) => px / 16.72 + 'cqw';
/** CSS sınıfıyla oynayan kısa hareketi baştan başlatır. */
function yenidenOynat(el: Element, cls: string) {
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}
/** Kısa hareketi bir kez oynatır, bitince sınıfı kaldırır (sonra gelen başka hareketin önünü kesmez). */
function birKezOynat(el: Element, cls: string, sure: number) {
  yenidenOynat(el, cls);
  window.setTimeout(() => el.classList.remove(cls), sure);
}

/**
 * Zıpzıp'ın Saklı Fındıkları (gizli miktar, parça-bütün): önce kütükteki fındıklar birlikte sayılır (çocuk her fındığa
 * dokunur, Ceren sayar); toplam rakamla köşede kalır. Zıpzıp bir kısmını sepetle kapatır; çocuk dışarıda kalanlara bakıp
 * sepetin altındakini üç rakamdan seçer. Sepet kalkar, gizliler zıplayarak sayılır, "Buldun!". Aynı fındıklarla ikinci soru:
 * bu kez öbür kısım saklanır (5 = 2 + 3, sonra 3 + 2). İkinci yanlışta sepet kalkar, cevap sayılarak gösterilir.
 * Kayıt: t.secimler bulunan gizli sayılar (yarıda yenilenen tur kaldığı sorudan, sayma atlanarak sürer).
 */
function sakliFindik(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.zipzip;
  const sorular = sakliSorular(tekrarYolu(), t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const N = sorular[0].toplam;
  const fon = yeniCizim('zipzip', 'agac-dibi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('sf-sahne');
  sahneEl.dataset.toplam = String(N);
  // Zıpzıp kütüğün arkasında: alt gövdesi kütüğün arka kenarında kalır (kenar .sf-arka'nın clip-path'inde).
  const arka = document.createElement('div');
  arka.className = 'sf-arka';
  sahneEl.append(arka);
  const zipzip = document.createElement('div');
  zipzip.className = 'sf-zipzip';
  zipzip.innerHTML = ['Zıpzıp sepeti kapatır', 'Zıpzıp kıkırdar', 'Zıpzıp sevinir'].map((ad, i) => yeniResim('zipzip', 'zipzip-sakla-' + i, 'sf-poz sf-poz-' + i, ad)).join('');
  arka.append(zipzip);
  const poz = (p: 0 | 1 | 2) => { zipzip.dataset.poz = String(p); sahneEl.dataset.poz = String(p); };
  poz(1);
  const yerlerEl = document.createElement('div');
  yerlerEl.className = 'sf-findiklar';
  sahneEl.append(yerlerEl);
  const findiklar = Array.from({ length: N }, (_, i) => buton(yerlerEl, 'Fındık', yeniResim('zipzip', 'findik', 'sf-findik-resim', 'Fındık'), () => say(i), 'sf-findik'));
  const sepet = document.createElement('div');
  sepet.className = 'sf-sepet';
  sepet.dataset.durum = 'yukari';
  sepet.innerHTML = yeniResim('zipzip', 'hasir-sepet', 'sf-sepet-resim', 'Sepet');
  sahneEl.append(sepet);
  // Sepeti tutan patiler sepetin önünde (Astra'nın m12-temas yerleşimi): aynı çizimin yalnız kol bölgesi.
  const kol = document.createElement('div');
  kol.className = 'sf-kol';
  kol.innerHTML = yeniResim('zipzip', 'zipzip-sakla-0', 'sf-kol-resim', '');
  sahneEl.append(kol);
  const rozet = document.createElement('div');
  rozet.className = 'sf-toplam';
  rozet.setAttribute('aria-label', N + ' fındık');
  rozet.innerHTML = yeniResim('zipzip', 'findik', 'sf-rozet-findik', '') + img('matematik/ceren/rakam-' + N);
  sahneEl.append(rozet);
  const secenekEl = document.createElement('div');
  secenekEl.className = 'sf-secenek';
  sahneEl.append(secenekEl);
  let no = Math.min(t.secimler.length, sorular.length - 1);
  let sayilan = 0, yanlis = 0;
  const adim = (a: string) => { sahneEl.dataset.adim = a; };
  function yerlestir() {
    const s = sorular[no];
    sahneEl.dataset.soru = String(no);
    sahneEl.dataset.gizli = String(s.gizli);
    findikYerleri(s.toplam, s.gizli).forEach((p, i) => {
      const b = findiklar[i];
      b.style.left = fonCqw(p.x);
      b.style.top = fonCqw(p.y);
      b.dataset.gizli = p.gizli ? '1' : '';
    });
  }
  function say(i: number) {
    if (kilit || sahneEl.dataset.adim !== 'say') return;
    const b = findiklar[i];
    if (b.classList.contains('sayildi')) { yenidenOynat(b, 'kipir'); return; }
    sayilan++;
    b.classList.add('sayildi');
    yenidenOynat(b, 'zipla');
    oyunSesi('damla');
    adediOku(sayilan);
    if (sayilan < N) return;
    adim('bekle');
    sozBitince(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        rozet.classList.add('acik');
        oyunSesi('parilti');
        timer = window.setTimeout(sakla, 1000);
      }, 250);
    }, 2500);
  }
  function sakla() {
    if (oturum !== token) return;
    adim('sakla');
    findiklar.forEach((b) => b.classList.remove('sayildi', 'zipla'));
    poz(0);
    sepet.dataset.durum = 'asagi';
    oyunSesi('kutu');
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      findiklar.forEach((b) => b.classList.toggle('altinda', !!b.dataset.gizli));
      poz(1);
      sor();
    }, 1300);
  }
  function sor() {
    const s = sorular[no];
    adim('sor');
    yanlis = 0;
    metin = sozler[S.sakladi];
    soyle(metin);
    secenekEl.inert = false;
    secenekEl.replaceChildren();
    s.secenek.forEach((x) => {
      const b = buton(secenekEl, String(x), img('matematik/ceren/rakam-' + x), () => cevap(x, b), 'parca sf-rakam');
    });
    ipucunuTekrarla = () => { if (sahneEl.dataset.adim === 'sor') soyle(metin); };
  }
  function cevap(x: number, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.adim !== 'sor') return;
    if (x !== sorular[no].gizli) {
      defter.yanlis(sorular[no].gizli);
      yanlis++;
      b.classList.add('soluk');
      ipucu(b, sozler[S.ipucu]);
      // Dışarıda kalanlar sırayla parlar: "kaç tane kaldı?"
      findiklar.filter((f) => !f.dataset.gizli).forEach((f, i) => window.setTimeout(() => { if (oturum === token) yenidenOynat(f, 'parla'); }, 250 + i * 260));
      if (yanlis >= 2) { adim('goster'); timer = window.setTimeout(() => { if (oturum === token) ac(false); }, 2200); }
      return;
    }
    defter.dogru(sorular[no].gizli);
    b.classList.add('dogru');
    ac(true);
  }
  function ac(buldu: boolean) {
    const s = sorular[no];
    adim('ac');
    secenekEl.inert = true;
    secenekEl.querySelectorAll<HTMLButtonElement>('.sf-rakam').forEach((x) => x.classList.toggle('dogru', x.getAttribute('aria-label') === String(s.gizli)));
    t.secimler.push(s.gizli);
    kaydet(k);
    // Sepet kalkar; Zıpzıp "yakaladın!" der gibi sevinir; gizliler zıplayarak sayılır.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) sepet.dataset.durum = 'yukari';
    else sepet.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -5cqw' }], { duration: 480, easing: 'ease-in' }).onfinish = () => { sepet.dataset.durum = 'yukari'; };
    poz(2);
    oyunSesi('miknatis');
    findiklar.forEach((f) => f.classList.remove('altinda'));
    const gizliler = findiklar.filter((f) => f.dataset.gizli);
    let i = 0;
    const sayGizli = () => {
      if (oturum !== token) return;
      if (i === gizliler.length) { bitir(); return; }
      const f = gizliler[i++];
      f.classList.add('sayildi');
      yenidenOynat(f, 'zipla');
      adediOku(i);
      timer = window.setTimeout(sayGizli, minik ? 680 : 600);
    };
    timer = window.setTimeout(sayGizli, 650);
    function bitir() {
      if (no + 1 >= sorular.length) { tamam(buldu ? sozler[S.buldun] : undefined); return; }
      const sonraki = () => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          no++;
          poz(1);
          secenekEl.replaceChildren();
          findiklar.forEach((f) => f.classList.remove('sayildi', 'zipla'));
          yerlestir();
          timer = window.setTimeout(sakla, 900);
        }, 500);
      };
      if (buldu) { soyle(sozler[S.buldun]); sozBitince(sonraki, 2500); } else sonraki();
    }
  }
  yerlestir();
  if (t.secimler.length) {
    // Yarıda kalan tur: fındıklar zaten sayıldı, ikinci saklama hemen gelir.
    rozet.classList.add('acik');
    adim('bekle');
    metin = sozler[S.sakladi];
    timer = window.setTimeout(sakla, 700);
  } else {
    adim('say');
    metin = sozler[S.say];
    if (sesli) soyle(metin);
  }
}

/**
 * Baba'nın Takım Çantası (sınıflama): tezgâhta altı ahşap parça, önünde iki kutu; kutuların levhasında örnek parça (yalnız
 * ölçütün özelliği değişir). Sıradaki parça zaten seçili: çocuk kutuya dokunur, başka parçaya dokunup onu seçer ya da parçayı
 * kutuya sürükler. 2–3 yaş renge, 4 yaş şekle göre; 5+ yaşta önce şekle, sonra aynı parçalar boya göre yeniden ayrılır.
 * Yanlış kutuda parça yerinde kalır, Ceren levhayı gösterir. Kayıt: t.secimler yerleşen parçalar (her ölçüt altı parça).
 */
function takimCantasi(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.baba;
  const olcutler = babaOlcutleri(tekrarYolu(), t.tekrar ?? 0);
  const parcalar = babaParcalari(tekrarYolu(), t.tekrar ?? 0);
  const P = parcalar.length;
  const fon = yeniCizim('baba', 'baba-atolyesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('tc-sahne');
  // Baba tezgâhın arkasında: alt gövdesi tezgâhın üst kenarında (fon y 447) kalır.
  const arka = document.createElement('div');
  arka.className = 'tc-arka';
  sahneEl.append(arka);
  const baba = document.createElement('div');
  baba.className = 'tc-baba';
  baba.dataset.poz = '0';
  baba.innerHTML = yeniResim('baba', 'baba-takim-0', 'tc-poz tc-poz-0', 'Baba düşünür') + yeniResim('baba', 'baba-takim-1', 'tc-poz tc-poz-1', 'Baba sevinir');
  arka.append(baba);
  const sira = document.createElement('div');
  sira.className = 'tc-parcalar';
  sahneEl.append(sira);
  let oi = Math.min(olcutler.length - 1, Math.floor(t.secimler.length / P));
  // Her ölçütün kendi sözü (gelişe göre ölçütler değişir: derinlik.ts).
  const olcutSozu = (o: (typeof olcutler)[number]) => (o === 'renk' ? S.renk : o === 'bicim' ? S.bicim : S.boy);
  let secili = -1, mesgul = false, yanlisParca = -1;
  const yerlesen = () => t.secimler.slice(oi * P, oi * P + P);
  const kutular = [0, 1].map((i) => buton(sahneEl, i ? 'Sağdaki kutu' : 'Soldaki kutu',
    yeniResim('baba', 'takim-kutusu', 'tc-kutu-resim', 'Kutu') + '<div class="tc-levha"></div><div class="tc-ic"></div>', () => koy(i), 'tc-kutu tc-kutu-' + i));
  const adi = (p: Parca) => (p.boy === 'buyuk' ? 'Büyük ' : 'Küçük ') + (p.renk === 'kirmizi' ? 'kırmızı ' : 'mavi ') + (p.bicim === 'daire' ? 'daire' : 'kare');
  const dugmeler = parcalar.map((p, i) => {
    const b = buton(sira, adi(p), yeniResim('baba', parcaAdi(p), 'tc-parca-resim', parcaAdi(p)), () => sec(i), 'tc-parca');
    b.dataset.parca = parcaAdi(p);
    let birakilan = -1;
    surukle(b, (e) => {
      birakilan = kutular.findIndex((kb) => {
        const r = kb.getBoundingClientRect();
        return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      });
      return birakilan >= 0 ? kutular[birakilan].getBoundingClientRect() : undefined;
    }, () => { if (sec(i)) koy(birakilan); });
    return b;
  });
  function ciz() {
    const o = olcutler[oi];
    sahneEl.dataset.olcut = o;
    const et = etiket(o), yer = yerlesen();
    kutular.forEach((kb, i) => {
      kb.querySelector('.tc-levha')!.innerHTML = yeniResim('baba', parcaAdi(et[i]), 'tc-levha-resim', parcaAdi(et[i]));
      kb.querySelector('.tc-ic')!.innerHTML = yer.filter((j) => kutusu(o, parcalar[j]) === i).map((j) => yeniResim('baba', parcaAdi(parcalar[j]), 'tc-mini', '')).join('');
    });
    if (secili < 0 || yer.includes(secili)) secili = parcalar.findIndex((_, i) => !yer.includes(i));
    dugmeler.forEach((b, i) => {
      b.classList.toggle('yerinde', yer.includes(i));
      b.classList.toggle('secili', i === secili);
    });
    sahneEl.dataset.yerlesen = String(yer.length);
  }
  function sec(i: number) {
    if (kilit || mesgul || yerlesen().includes(i)) return false;
    if (secili !== i) { secili = i; oyunSesi('kagit'); ciz(); }
    return true;
  }
  function uc(b: Element, hedef: Element) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bas = parcaninKonumu(b), s = sahneEl.getBoundingClientRect(), h = hedef.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'tc-ucan';
    el.innerHTML = b.innerHTML;
    el.style.cssText = 'left:' + (bas.left - s.left) + 'px;top:' + (bas.top - s.top) + 'px;width:' + bas.width + 'px;height:' + bas.height + 'px';
    sahneEl.append(el);
    const dx = h.left + h.width / 2 - (bas.left + bas.width / 2), dy = h.top + h.height * 0.18 - (bas.top + bas.height / 2);
    el.animate([{ translate: '0 0', scale: '1' }, { translate: dx + 'px ' + dy + 'px', scale: '.55' }], { duration: 380, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => el.remove();
  }
  function koy(kutu: number) {
    if (kilit || mesgul || secili < 0 || kutu < 0) return;
    const o = olcutler[oi], b = dugmeler[secili];
    if (kutusu(o, parcalar[secili]) !== kutu) {
      if (yanlisParca !== secili) { yanlisParca = secili; konudaZorlandi(tekrarYolu(), 'siniflama', o); }
      ipucu(b, sozler[S.ipucu]);
      const dogruLevha = kutular[1 - kutu].querySelector('.tc-levha')!;
      ipucuHedefi(dogruLevha);
      yenidenOynat(dogruLevha, 'parla');
      return;
    }
    if (yanlisParca !== secili) konudaBasardi(tekrarYolu(), 'siniflama', o);
    yanlisParca = -1;
    uc(b, kutular[kutu]);
    t.secimler.push(secili);
    kaydet(k);
    oyunSesi('miknatis');
    ciz();
    if (yerlesen().length < P) { ovgu(); return; }
    // Bir ölçüt bitti: Baba sevinir. Birden çok ölçütte aynı parçalar yeni ölçütle tezgâha döner.
    mesgul = true;
    baba.dataset.poz = '1';
    if (oi + 1 >= olcutler.length) { tamam(sozler[S.bitti]); return; }
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      oi++;
      secili = -1;
      baba.dataset.poz = '0';
      ciz();
      yenidenOynat(sira, 'geri-geldi');
      metin = sozler[olcutSozu(olcutler[oi])];
      soyle(metin);
      mesgul = false;
    }, 1400);
  }
  ciz();
  metin = sozler[olcutSozu(olcutler[oi])];
  if (sesli || t.secimler.length) soyle(metin);
}
// ----- İçerik paketi M14–M24 (yeni-turlar.ts): her tur kendi Astra çizimiyle; gelene dek test kipinde ?test=1&yenitur=<ad>
// ile adı yazılı kutularla oynanır. -----
/** 11–20'nin sayı sözleri: Ceren'in 11–20 dersindeki kayıtlar (assets/matematik/ders/onluk/ses). 1–10 oyuncak sözlerinden. */
const onlukSayiSesleri = import.meta.glob<string>('../../assets/matematik/ders/onluk/ses/*.mp3', { eager: true, import: 'default', query: '?url' });
const ONLUK_SAYI = ['on_bir', 'on_iki', 'on_uc', 'on_dort', 'on_bes', 'on_alti', 'on_yedi', 'on_sekiz', 'on_dokuz', 'yirmi'];
function sayiyiOku(n: number) {
  if (n <= 10) { adediOku(n); return; }
  const yol = onlukSayiSesleri['../../assets/matematik/ders/onluk/ses/' + ONLUK_SAYI[n - 11] + '.mp3'];
  susArtik();
  if (!yol || document.hidden || dikTelefon.matches || !uygulamaDurumu.i.ayarlar.konusma) return;
  ses = new Audio(yol);
  ses.volume = Math.max(0, Math.min(1, uygulamaDurumu.i.ayarlar.seviye));
  void ses.play().catch(() => {});
}
/** Rakam blokları (iki basamaklıda yan yana; 0 bloğu Astra M6'dan, gelmediyse 10 ve 20 tek blokla yazılmaz). */
const sifirBlogu = import.meta.glob<string>('../../assets/matematik/ders/onluk/rakam-0.webp', { eager: true, import: 'default', query: '?url' });
/** 0 rakam bloğu (Astra M6) gelene dek 20, 30… iki basamakla yazılamaz: sayılar 19'da kalır. */
const sifirVar = () => Object.keys(sifirBlogu).length > 0;
const yirmisiz = (n: number) => (n > 10 && n % 10 === 0 && !sifirVar() ? n - 1 : n);
function rakamBloklari(n: number) {
  const sifir0 = Object.values(sifirBlogu)[0];
  if (n === 0) return sifir0 ? '<img draggable="false" alt="" src="' + sifir0 + '">' : '';
  // 10, 0 bloğu varken 15, 20 gibi iki blokla yazılır (tek parça rakam-10 yanlarında sıkışık ve koyu kalıyordu).
  if (n < 10 || (n === 10 && !sifir0)) return img('matematik/ceren/rakam-' + n);
  const birler = n % 10, sifir = Object.values(sifirBlogu)[0];
  return img('matematik/ceren/rakam-' + Math.floor(n / 10)) + (birler ? img('matematik/ceren/rakam-' + birler) : sifir ? '<img draggable="false" alt="" src="' + sifir + '">' : '');
}
/**
 * Tek resim bekleyen kutular için rakam: 10 ve üstü (0 bloğu varken) iki blok, kutuya sığan bir sırada; altı tek rakam resmi.
 * Eski tek parça rakam-10 resmi öbür rakamların yanında koyu ve sıkışık kalıyordu.
 */
function rakamResmi(n: number) {
  return n >= 10 && sifirVar() ? '<span class="rakam-iki">' + rakamBloklari(n) + '</span>' : img('matematik/ceren/rakam-' + n);
}
/** Bir öğeyi Astra fonunun pikseliyle konumlar (fon 1672 genişlikli; 1 px = 1/16,72 cqw). */
function fonaYerlestir(el: HTMLElement, x: number, y: number, w: number, h?: number) {
  el.style.left = fonCqw(x);
  el.style.top = fonCqw(y);
  el.style.width = fonCqw(w);
  if (h !== undefined) el.style.height = fonCqw(h);
}

/**
 * Dede'nin Elma Sandıkları (M14; sayma, 11–20): ağaçtaki elmaya dokunulur, elma sandığın sıradaki gözüne düşer, Ceren sayar.
 * 4 yaşta tek onluk sandık (6–10); 5+ yaşta sandık dolunca "on elma!", ikinci sandık açılır; sonunda on ve birlikler ayrı
 * gösterilip sayılır (on, üç: on üç). 2–3 yaşta beşlik sepet (3–5). Kayıt: t.secimler toplanan elma, ona kadar parça parça
 * ([10, 3] = 13; kayit.ts her sayıyı en çok 10 kabul eder), yarıda kalan tur sürer.
 */
function elmaSandigi(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.sandik;
  const yol = tekrarYolu();
  const N = yirmisiz(elmaSayisi(yol, t.tekrar ?? 0, turunZorlari(t)));
  const fon = yeniCizim('sandik', 'elma-bahcesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('es-sahne');
  sahneEl.dataset.toplam = String(N);
  const dede = document.createElement('div');
  dede.className = 'es-dede';
  dede.dataset.poz = '0';
  dede.innerHTML = yeniResim('sandik', 'dede-elma-0', 'es-poz es-poz-0', 'Dede') + yeniResim('sandik', 'dede-elma-1', 'es-poz es-poz-1', 'Dede sevinir');
  // Kenar payı (kenar-tara.cjs, 24 px her boyda): ölçek 0,9, ayak tabanı y 920.
  fonaYerlestir(dede, 1110, 308, 540, 630);
  sahneEl.append(dede);
  // Kaplar: Astra'nın tezgâhı x 640…1300, y 560…860.
  const kaplar = elmaKaplari(yol);
  const kapYeri = yol === 'minik' ? [{ x: 770, y: 600, o: 1 }] : yol === 'dort' ? [{ x: 700, y: 560, o: 0.9 }] : [{ x: 630, y: 610, o: 0.55 }, { x: 985, y: 610, o: 0.55 }];
  const gozler: HTMLElement[] = [];
  const kapEl = kaplar.map((kap, i) => {
    const el = document.createElement('div');
    el.className = 'es-kap es-' + kap;
    const [w, h] = kap === 'sandik' ? [600, 320] : [400, 180];
    fonaYerlestir(el, kapYeri[i].x, kapYeri[i].y, w * kapYeri[i].o, h * kapYeri[i].o);
    el.innerHTML = yeniResim('sandik', kap === 'sandik' ? 'onluk-sandik' : 'besli-sepet', 'es-kap-resim', kap === 'sandik' ? 'Sandık' : 'Sepet') + '<div class="es-rakam"></div>';
    kapGozleri(kap).forEach((g) => {
      const goz = document.createElement('span');
      goz.className = 'es-goz';
      goz.style.left = (g.x / w) * 100 + '%';
      goz.style.top = (g.y / h) * 100 + '%';
      goz.style.width = ((kap === 'sandik' ? 88 : 62) / w) * 100 + '%';
      el.append(goz);
      gozler.push(goz);
    });
    sahneEl.append(el);
    return el;
  });
  const toplamEl = document.createElement('div');
  toplamEl.className = 'es-toplam';
  sahneEl.append(toplamEl);
  const elma = () => yeniResim('sandik', 'elma', 'es-elma-resim', '');
  let sayilan = Math.min(N, t.secimler.reduce((a, b) => a + b, 0)), mesgulMu = false;
  // Ceren konuşurken (sandık doldu, sonuç) dokunuş beklenmez; sahnede görünür (test ve erişilebilirlik için).
  const mesgul = (m: boolean) => { mesgulMu = m; sahneEl.dataset.durum = m ? 'bekle' : 'topla'; };
  mesgul(false);
  // Ağaçta aynı anda en çok on elma; 5+ yaşta ilk sandık dolunca kalanlar ağaçta belirir.
  let agac: HTMLButtonElement[] = [];
  function agaciDoldur(yeni = false) {
    agac.forEach((b) => b.remove());
    const parti = sayilan < 10 ? Math.min(N, 10) : N - 10, toplanan = sayilan < 10 ? sayilan : sayilan - 10;
    agac = elmaYerleri(parti).map((p, i) => {
      const b = buton(sahneEl, 'Elma', elma(), () => topla(b), 'es-elma' + (yeni ? ' yeni' : ''));
      b.style.left = fonCqw(p.x);
      b.style.top = fonCqw(p.y);
      if (i < toplanan) b.hidden = true;
      return b;
    });
  }
  agaciDoldur();
  for (let i = 0; i < sayilan; i++) gozler[i].innerHTML = elma();
  sahneEl.dataset.sayilan = String(sayilan);
  function topla(b: HTMLButtonElement) {
    if (kilit || mesgulMu || b.hidden || sayilan >= N) return;
    const bas = (b.querySelector('img, span') ?? b).getBoundingClientRect();
    b.hidden = true;
    const goz = gozler[sayilan];
    goz.innerHTML = elma();
    yerineOtur(bas, goz.firstElementChild);
    sayilan++;
    t.secimler = sayilan > 10 ? [10, sayilan - 10] : [sayilan];
    kaydet(k);
    sahneEl.dataset.sayilan = String(sayilan);
    oyunSesi('damla');
    sayiyiOku(sayilan);
    if (sayilan === 10 && kaplar[0] === 'sandik') {
      // Sandık doldu: Ceren söyler (5+ yaşta ikinci sandık açılır).
      mesgul(true);
      kapEl[0].classList.add('dolu');
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          soyle(sozler[S.doldu]);
          sozBitince(() => { mesgul(false); if (sayilan >= N) bitir(); else agaciDoldur(true); }, 4000);
        }, 200);
      }, 2500);
      return;
    }
    if (sayilan >= N) { mesgul(true); sozBitince(() => { timer = window.setTimeout(bitir, 300); }, 2500); }
  }
  function bitir() {
    if (oturum !== token) return;
    mesgul(true);
    const adimlar: [HTMLElement, number][] = N > 10 ? [[kapEl[0], 10], [kapEl[1], N - 10]] : [];
    let i = 0;
    const sonraki = () => {
      if (oturum !== token) return;
      if (i < adimlar.length) {
        // On ve birlikler: her kabın üstünde kendi rakamı, Ceren söyler.
        const [el, n] = adimlar[i++];
        el.querySelector('.es-rakam')!.innerHTML = rakamBloklari(n);
        el.classList.add('vurgu');
        adediOku(n);
        sozBitince(() => { el.classList.remove('vurgu'); timer = window.setTimeout(sonraki, 250); }, 2500);
        return;
      }
      toplamEl.innerHTML = rakamBloklari(N);
      toplamEl.classList.add('acik');
      oyunSesi('parilti');
      if (N > 10) sayiyiOku(N);
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          dede.dataset.poz = '1';
          tamam(sozler[S.hazir]);
        }, 300);
      }, 2500);
    };
    sonraki();
  }
  metin = sozler[S.yonerge];
  if (sayilan >= N) bitir();
  else if (sesli) soyle(metin);
}
/**
 * Babaanne'nin Kurabiye Tepsileri (M15; miktar ve rakam eşleme): fırından tepsiler tek tek gelir; çocuk kurabiyeleri sayar,
 * üç rakam bayrağından doğrusunu tepsiye diker. 2–3 yaş iki tepsi (1–5), 4 yaş üç tepsi (1–10), 5+ iki tepsi 11–20: dolu
 * tepsi (on) ve yanında tabakta kalanlar. Yanlışta Ceren "Kurabiyeleri birlikte sayalım" der, kurabiyeler zıplayarak sayılır
 * (5+ yaşta önce "on", sonra tabaktakiler on bir, on iki…). Kayıt: t.secimler biten tepsilerin sırası.
 */
function kurabiyeTepsisi(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.kurabiye;
  const yol = tekrarYolu();
  const sayilar = kurabiyeSayilari(yol, t.tekrar ?? 0, turunZorlari(t)).map(yirmisiz);
  const defter = sayiDefteri();
  const [en, ust] = yol === 'minik' ? [1, 5] : yol === 'dort' ? [1, 10] : [11, yirmisiz(20)];
  const fon = yeniCizim('kurabiye', 'babaanne-mutfagi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('kt-sahne');
  const babaanne = document.createElement('div');
  babaanne.className = 'kt-babaanne';
  babaanne.dataset.poz = '0';
  babaanne.innerHTML = yeniResim('kurabiye', 'babaanne-kurabiye-0', 'kt-poz kt-poz-0', 'Babaanne') + yeniResim('kurabiye', 'babaanne-kurabiye-1', 'kt-poz kt-poz-1', 'Babaanne sevinir');
  fonaYerlestir(babaanne, 1080, 313, 540, 630);
  sahneEl.append(babaanne);
  const masa = document.createElement('div');
  masa.className = 'kt-masa';
  sahneEl.append(masa);
  const bayraklar = document.createElement('div');
  bayraklar.className = 'kt-bayraklar';
  sahneEl.append(bayraklar);
  let no = Math.min(t.secimler.length, sayilar.length - 1);
  let kurabiyeler: HTMLElement[] = [], tepsiEl: HTMLElement | undefined, tabakEl: HTMLElement | undefined, mesgul = false; sahneEl.dataset.durum = 'sec';
  const kurabiye = () => yeniResim('kurabiye', 'kurabiye', 'kt-kurabiye-resim', '');
  function tepsiKur() {
    const n = sayilar[no];
    masa.replaceChildren();
    sahneEl.dataset.tepsi = String(no);
    sahneEl.dataset.sayi = String(n);
    kurabiyeler = [];
    // Tepsi (520 × 300) tezgâhın önünde; 5+ yaşta yanında tabak (300 × 140).
    tepsiEl = document.createElement('div');
    tepsiEl.className = 'kt-tepsi';
    fonaYerlestir(tepsiEl, n > 10 ? 300 : 420, 540, 520, 300);
    tepsiEl.innerHTML = yeniResim('kurabiye', 'tepsi', 'kt-tepsi-resim', 'Tepsi');
    for (let i = 0; i < Math.min(n, 10); i++) {
      const k = document.createElement('span');
      k.className = 'kt-kurabiye';
      k.style.left = (TEPSI_X[i % 5] / 520) * 100 + '%';
      k.style.top = (TEPSI_Y[Math.floor(i / 5)] / 300) * 100 + '%';
      k.innerHTML = kurabiye();
      tepsiEl.append(k);
      kurabiyeler.push(k);
    }
    masa.append(tepsiEl);
    tabakEl = undefined;
    if (n > 10) {
      tabakEl = document.createElement('div');
      tabakEl.className = 'kt-tabak';
      fonaYerlestir(tabakEl, 840, 640, 300, 140);
      tabakEl.innerHTML = yeniResim('kurabiye', 'kucuk-tabak', 'kt-tabak-resim', 'Tabak');
      for (let i = 0; i < n - 10; i++) {
        const k = document.createElement('span');
        k.className = 'kt-kurabiye kt-tabaktaki';
        k.style.left = (58 + 46 * (i % 5)) / 3 + '%';
        k.style.top = (i < 5 ? 48 : 86) / 1.4 + '%';
        k.innerHTML = kurabiye();
        tabakEl.append(k);
        kurabiyeler.push(k);
      }
      masa.append(tabakEl);
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) masa.animate([{ translate: '-30cqw 0', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.3,.8,.4,1)' });
    bayraklar.replaceChildren();
    bayrakSecenekleri(n, en, ust).forEach((x, i) => {
      // Seçenekler duvarın önünde kart düğmeler (havada asılı bayrak değil); doğru bayrak tepsiye dikilir.
      const b = buton(bayraklar, String(x), '<span class="kt-secim-rakam">' + rakamBloklari(x) + '</span>', () => sec(x, b), 'parca kt-bayrak');
      fonaYerlestir(b, 490 + 175 * i, 300, 155, 135);
    });
    mesgul = false; sahneEl.dataset.durum = 'sec';
  }
  function birlikteSay(sonra: () => void) {
    // Kurabiyeler zıplayarak sayılır; 5+ yaşta önce dolu tepsi "on", sonra tabaktakiler.
    const n = sayilar[no];
    let i = n > 10 ? 10 : 0;
    const adim = () => {
      if (oturum !== token) return;
      if (i === n) { sonra(); return; }
      const el = kurabiyeler[i++];
      yenidenOynat(el, 'zipla');
      sayiyiOku(i);
      timer = window.setTimeout(adim, minik ? 680 : 600);
    };
    if (n > 10 && tepsiEl) {
      yenidenOynat(tepsiEl, 'vurgu');
      adediOku(10);
      sozBitince(() => { timer = window.setTimeout(adim, 250); }, 2500);
    } else adim();
  }
  function sec(x: number, b: HTMLButtonElement) {
    if (kilit || mesgul) return;
    const n = sayilar[no];
    if (x !== n) {
      defter.yanlis(n);
      mesgul = true; sahneEl.dataset.durum = 'bekle';
      b.classList.add('soluk');
      ipucu(b, sozler[S.sayalim]);
      sozBitince(() => { timer = window.setTimeout(() => birlikteSay(() => { mesgul = false; sahneEl.dataset.durum = 'sec'; }), 250); }, 3500);
      return;
    }
    defter.dogru(n);
    mesgul = true; sahneEl.dataset.durum = 'bekle';
    b.classList.add('dogru');
    // Bayrak tepsiye dikilir.
    const dik = document.createElement('div');
    dik.className = 'kt-dikili';
    dik.innerHTML = '<span class="kt-bayrak-ic">' + yeniResim('kurabiye', 'rakam-bayragi', 'kt-bayrak-resim', '') + '<span class="kt-bayrak-rakam">' + rakamBloklari(n) + '</span></span>';
    fonaYerlestir(dik, n > 10 ? 690 : 810, 430, 130, 188);
    masa.append(dik);
    yerineOtur(b.getBoundingClientRect(), dik);
    b.style.visibility = 'hidden';
    oyunSesi('miknatis');
    sayiyiOku(n);
    t.secimler.push(no);
    kaydet(k);
    sozBitince(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        if (no + 1 >= sayilar.length) { babaanne.dataset.poz = '1'; tamam(sozler[S.afiyet]); return; }
        no++;
        tepsiKur();
      }, 700);
    }, 2500);
  }
  tepsiKur();
  metin = sozler[S.yonerge];
  if (sesli && !t.secimler.length) soyle(metin);
}

/**
 * Mino'nun Sayı Treni (M16; sıralama): peronda rakamlı vagonlar bekler, lokomotifin arkasına sırayla takılır, Ceren sayıyı
 * söyler. Gelişe göre iş değişir (yeni-turlar.ts → trenTuru): 1. geliş ardışık sayıları küçükten büyüğe tak; 2. geliş trende
 * eksik vagon(lar) var, peronda eksikler ve trende olmayan yakın sayılar, çocuk eksik sayıyı bulur; 3. geliş 4 yaş büyükten
 * küçüğe, 5+ ikişer ikişer (ya da büyükten küçüğe). Yanlış vagon sallanır, Ceren işe göre ipucu verir; ilk yanlışta doğru
 * sayı akıllı tekrar defterine yazılır. Tren dolunca Mino düdük çeker, tren yola çıkar. Kayıt: t.secimler dolan yuvalar.
 */
function sayiTreni(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.tren;
  const yol = tekrarYolu();
  const tt = trenTuru(yol, t.tekrar ?? 0, turunZorlari(t));
  // 0 bloğu yoksa 20 yazılamaz: bütün sayılar bir azaltılır (sıra ve fark aynı kalır).
  const kay = [...tt.sayilar, ...tt.secenek].some((n) => yirmisiz(n) !== n) ? -1 : 0;
  const sayilar = tt.sayilar.map((n) => n + kay), secenek = tt.secenek.map((n) => n + kay);
  const eksikIsi = tt.is === 'eksik';
  const IPUCU = { sirala: S.ipucu, eksik: S.eksikIpucu, geri: ROKET_SOZ.ipucu, ikiser: S.ikiserIpucu } as const;
  const YONERGE = { sirala: S.yonerge, eksik: S.eksik, geri: S.geri, ikiser: S.ikiser } as const;
  const fon = yeniCizim('tren', 'istasyon');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('st-sahne');
  sahneEl.dataset.is = tt.is;
  // Test ve video için: takılış sırası ve eksik sayılar.
  sahneEl.dataset.sira = sayilar.join(',');
  sahneEl.dataset.eksik = tt.eksik.map((i) => sayilar[i]).join(',');
  // Tren: lokomotif sağda (600 × 500, ölçek 0,68; tekerlek tabanı rayın üstünde y 720), vagonlar soluna takılır.
  const tren = document.createElement('div');
  tren.className = 'st-tren';
  sahneEl.append(tren);
  const lokomotif = document.createElement('div');
  lokomotif.className = 'st-lokomotif';
  lokomotif.dataset.poz = '0';
  lokomotif.innerHTML = yeniResim('tren', 'lokomotif-mino-0', 'st-poz st-poz-0', 'Mino lokomotifte') + yeniResim('tren', 'lokomotif-mino-1', 'st-poz st-poz-1', 'Mino düdük çalar');
  fonaYerlestir(lokomotif, 1240, 394, 408, 340);
  tren.append(lokomotif);
  // Rayın üstündeki tren boyu (boş vagon yuvaları dahil) oyun yeri: telefon kamerası treni bütün gösterir.
  const trenYeri = document.createElement('i');
  trenYeri.className = 'tk-alan';
  fonaYerlestir(trenYeri, 40, 394, 1610, 346);
  tren.append(trenYeri);
  const RENK = ['kirmizi', 'mavi', 'sari'];
  /** Vagon: rengi trendeki yerinden (trende olmayan sayıda peron sırasından), levhasında sayı. */
  const vagonHTML = (n: number, renk: number) => yeniResim('tren', 'vagon-' + RENK[renk % 3], 'st-vagon-resim', 'Vagon') + '<span class="st-levha">' + rakamBloklari(n) + '</span>';
  const yuvalar = sayilar.map((_, i) => {
    const y = document.createElement('div');
    y.className = 'st-yuva';
    // Beş vagonlu tren dolunca en soldaki vagon ekran kenarına 24 px'ten yaklaşmasın (telefonda da): 248 px aralık.
    fonaYerlestir(y, 1062 - 248 * i, 550, 258, 177);
    tren.append(y);
    return y;
  });
  // Dolu yuvalar: eksik işinde eksikler dışındaki bütün vagonlar baştan takılı; kayıttakiler (yarıda kalan tur) de dolu.
  const dolu = new Set<number>([...(eksikIsi ? sayilar.map((_, i) => i).filter((i) => !tt.eksik.includes(i)) : []), ...t.secimler.filter((i) => i < sayilar.length)]);
  dolu.forEach((i) => { yuvalar[i].innerHTML = vagonHTML(sayilar[i], i); yuvalar[i].classList.add('dolu'); });
  let mesgul = false;
  const defter = sayiDefteri();
  /** Sıradaki yuva: sırayla işlerde ilk boş yuva; eksik işinde boş eksiklerin ilki (çocuk istediği sırayla bulabilir). */
  const siradaki = () => sayilar.findIndex((_, i) => !dolu.has(i));
  const isaretle = () => {
    const s = eksikIsi ? -1 : siradaki();
    yuvalar.forEach((y, i) => y.classList.toggle('bekliyor', eksikIsi ? !dolu.has(i) : i === s));
    sahneEl.dataset.takilan = String(dolu.size);
  };
  // Perondaki vagonlar (ölçek 0,55; tekerlek tabanı peronda y 335): sırayla işlerde trenin sayıları karışık; eksik işinde
  // eksikler ve yakın sayılar.
  const peronSayilari = eksikIsi ? karisikSira(secenek.length, t.tekrar ?? 0).map((i) => secenek[i]) : karisikSira(sayilar.length, t.tekrar ?? 0).map((i) => sayilar[i]);
  peronSayilari.forEach((n, j) => {
    const yer = sayilar.indexOf(n);
    const b = buton(sahneEl, String(n), vagonHTML(n, yer >= 0 ? yer : j), () => tak(n, b), 'st-bekleyen');
    const genislik = 209, bosluk = 12, bas = 1050 - ((peronSayilari.length * genislik + (peronSayilari.length - 1) * bosluk) / 2);
    fonaYerlestir(b, bas + j * (genislik + bosluk), 197, genislik, 143);
    if (yer >= 0 && dolu.has(yer)) b.hidden = true;
  });
  isaretle();
  function tak(n: number, b: HTMLButtonElement) {
    if (kilit || mesgul) return;
    const i = sayilar.indexOf(n);
    const dogruYer = eksikIsi ? i >= 0 && tt.eksik.includes(i) && !dolu.has(i) : i === siradaki();
    if (!dogruYer) {
      yenidenOynat(b, 'kipir');
      ipucu(b, sozler[IPUCU[tt.is]]);
      const beklenen = eksikIsi ? sayilar[tt.eksik.find((e) => !dolu.has(e)) ?? 0] : sayilar[siradaki()];
      defter.yanlis(beklenen - kay);
      return;
    }
    defter.dogru(n - kay);
    const bas = (b.querySelector('img, span') ?? b).getBoundingClientRect();
    b.hidden = true;
    yuvalar[i].innerHTML = vagonHTML(n, i);
    yuvalar[i].classList.add('dolu');
    yerineOtur(bas, yuvalar[i].firstElementChild);
    dolu.add(i);
    t.secimler.push(i);
    kaydet(k);
    oyunSesi('kutu');
    sayiyiOku(n);
    isaretle();
    if (dolu.size < sayilar.length) return;
    mesgul = true;
    sozBitince(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        lokomotif.dataset.poz = '1';
        oyunSesi('korna');
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) tren.animate([{ translate: '0 0' }, { translate: '-6cqw 0', offset: 0.15 }, { translate: '110cqw 0' }], { duration: 4200, delay: 900, easing: 'ease-in', fill: 'forwards' });
        tamam(sozler[S.hazir]);
      }, 300);
    }, 2500);
  }
  metin = sozler[YONERGE[tt.is]];
  if (sesli && !t.secimler.length) soyle(metin);
}
/**
 * Bulut'un Balonları (M17; nesneyle toplama ve çıkarma): Bulut'un elinde balonlar; Ceren birlikte sayar. Lokum balon getirir,
 * balonlar Bulut'a geçer; "Şimdi kaç balon var?" Çocuk rakamı seçer, balonlar sayılarak doğrulanır. Sonra birkaç balon uçar
 * (Bulut şaşırır), yine "kaç kaldı?". Yanlışta Ceren "Balonlara bir daha bak" der, balonlar birlikte sayılır.
 * Kayıt: t.secimler bulunan sonuçlar (yarıda kalan tur kaldığı sorudan sürer).
 */
function bulutunBalonlari(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.balon;
  const bt = balonTuru(tekrarYolu(), t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const sorular = [{ olay: 'gelen' as const, sonuc: bt.basta + bt.gelen }, { olay: 'ucan' as const, sonuc: bt.basta + bt.gelen - bt.ucan }];
  const fon = yeniCizim('balon', 'cayir');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('bb-sahne');
  const bulut = document.createElement('div');
  bulut.className = 'bb-dost bb-bulut';
  bulut.dataset.poz = '0';
  // Şaşırma pozu (bulut-balon-1) iki eli açık: balon tutarken kullanılmaz. Balonları tutarken şaşıran poz (bulut-balon-2) gelince o.
  const sasirma = yeniCizim('balon', 'bulut-balon-2');
  bulut.innerHTML = yeniResim('balon', 'bulut-balon-0', 'bb-poz bb-poz-0', 'Bulut') + (sasirma ? yeniResim('balon', 'bulut-balon-2', 'bb-poz bb-poz-2', 'Bulut şaşırır') : '');
  fonaYerlestir(bulut, 530, 280, 500, 600);
  const lokum = document.createElement('div');
  lokum.className = 'bb-dost bb-lokum';
  lokum.dataset.poz = '0';
  lokum.hidden = true;
  lokum.innerHTML = yeniResim('balon', 'lokum-balon-0', 'bb-poz bb-poz-0', 'Lokum') + yeniResim('balon', 'lokum-balon-1', 'bb-poz bb-poz-1', 'Lokum alkışlar');
  fonaYerlestir(lokum, 1120, 280, 500, 600);
  sahneEl.append(bulut, lokum);
  // Balonların ipi yumrukta toplanır: Bulut (330, 110), Lokum (300, 300) tuvallerinde.
  const BULUT_EL = { x: 530 + 330, y: 280 + 110 }, LOKUM_EL = { x: 1120 + 300, y: 280 + 300 };
  const RENK = ['kirmizi', 'mavi', 'sari'];
  let balonlar: HTMLElement[] = [], sayac = 0;
  const yeniBalon = () => {
    const b = document.createElement('div');
    b.className = 'bb-balon';
    b.innerHTML = yeniResim('balon', 'balon-' + RENK[sayac++ % 3], 'bb-balon-resim', '');
    // Tuval oranı çizimden (kısa ipli 160 × 300 ya da uzun ipli 160 × 520); ip ucu her ikisinde de altta ortada.
    const r = b.querySelector('img');
    if (r) r.onload = () => { if (r.naturalWidth) b.style.aspectRatio = r.naturalWidth + ' / ' + r.naturalHeight; };
    sahneEl.append(b);
    return b;
  };
  function diz(liste: HTMLElement[], el: { x: number; y: number }) {
    balonYelpazesi(liste.length).forEach((y, i) => {
      const b = liste[i];
      b.style.left = fonCqw(el.x);
      b.style.top = fonCqw(el.y);
      b.style.width = fonCqw(160 * y.boy);
      b.style.rotate = y.aci + 'deg';
    });
  }
  const secenekEl = document.createElement('div');
  secenekEl.className = 'bb-secenek';
  sahneEl.append(secenekEl);
  let no = Math.min(t.secimler.length, sorular.length - 1);
  // Başlangıç: birinci soru yarıdaysa baştaki balonlar; ikinci sorudaysa birincinin sonucu.
  const basla = no === 0 ? bt.basta : sorular[0].sonuc;
  for (let i = 0; i < basla; i++) balonlar.push(yeniBalon());
  diz(balonlar, BULUT_EL);
  if (no > 0) { lokum.hidden = false; lokum.dataset.poz = '1'; }
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  sahneEl.dataset.balon = String(balonlar.length);
  function birlikteSay(sonra: () => void) {
    let i = 0;
    const adim = () => {
      if (oturum !== token) return;
      if (i === balonlar.length) { sonra(); return; }
      yenidenOynat(balonlar[i++], 'sek');
      adediOku(i);
      timer = window.setTimeout(adim, minik ? 680 : 600);
    };
    adim();
  }
  function olay() {
    const s = sorular[no];
    durum('olay');
    if (s.olay === 'gelen') {
      // Lokum yürüyerek gelir, balonları Bulut'a verir.
      lokum.hidden = false;
      lokum.dataset.poz = '0';
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) lokum.animate([{ translate: '25cqw 0' }, { translate: '0 0' }], { duration: 700, easing: 'ease-out' });
      const gelenler = Array.from({ length: bt.gelen }, yeniBalon);
      diz(gelenler, LOKUM_EL);
      soyle(sozler[S.getirdi]);
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          balonlar = [...balonlar, ...gelenler];
          diz(balonlar, BULUT_EL);
          oyunSesi('kagit');
          lokum.dataset.poz = '1';
          sahneEl.dataset.balon = String(balonlar.length);
          timer = window.setTimeout(sor, 900);
        }, 300);
      }, 3000);
    } else {
      // Birkaç balon uçar; Bulut şaşırır.
      const ucanlar = balonlar.slice(balonlar.length - bt.ucan);
      balonlar = balonlar.slice(0, balonlar.length - bt.ucan);
      if (sasirma) bulut.dataset.poz = '2';
      oyunSesi('korna');
      ucanlar.forEach((b, i) => {
        b.classList.add('ucuyor');
        b.style.left = fonCqw(BULUT_EL.x + (i - ucanlar.length / 2) * 140);
        b.style.top = fonCqw(-200);
        window.setTimeout(() => b.remove(), 1800);
      });
      diz(balonlar, BULUT_EL);
      sahneEl.dataset.balon = String(balonlar.length);
      soyle(sozler[S.uctu]);
      sozBitince(() => { timer = window.setTimeout(sor, 400); }, 3000);
    }
  }
  function sor() {
    if (oturum !== token) return;
    durum('sor');
    sahneEl.dataset.soru = String(no);
    metin = sozler[S.kac];
    soyle(metin);
    secenekEl.inert = false;
    secenekEl.replaceChildren();
    balonSecenekleri(sorular[no].sonuc).forEach((x) => {
      const b = buton(secenekEl, String(x), rakamResmi(x), () => cevap(x, b), 'parca bb-rakam');
    });
    ipucunuTekrarla = () => { if (sahneEl.dataset.durum === 'sor') soyle(metin); };
  }
  function cevap(x: number, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.durum !== 'sor') return;
    if (x !== sorular[no].sonuc) {
      defter.yanlis(sorular[no].sonuc);
      durum('say');
      b.classList.add('soluk');
      ipucu(b, sozler[S.ipucu]);
      sozBitince(() => { timer = window.setTimeout(() => birlikteSay(() => durum('sor')), 250); }, 3500);
      return;
    }
    defter.dogru(x);
    durum('dogru');
    b.classList.add('dogru');
    secenekEl.inert = true;
    t.secimler.push(x);
    kaydet(k);
    oyunSesi('miknatis');
    birlikteSay(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        if (no + 1 >= sorular.length) { lokum.dataset.poz = '1'; bulut.dataset.poz = '0'; tamam(); return; }
        no++;
        secenekEl.replaceChildren();
        bulut.dataset.poz = '0';
        olay();
      }, 500);
    });
  }
  metin = sozler[S.say];
  if (sesli && !t.secimler.length) {
    // Önce Bulut'un balonları birlikte sayılır.
    durum('say');
    soyle(metin);
    sozBitince(() => { timer = window.setTimeout(() => birlikteSay(() => { timer = window.setTimeout(olay, 400); }), 250); }, 3500);
  } else timer = window.setTimeout(olay, 500);
}
/** Sözleri sırayla okutur (her parça bir söz başlatır; bitince sıradaki), sonra devam eder. */
function sirayla(parcalar: (() => void)[], sonra: () => void, ara = 120) {
  const token = oturum;
  let i = 0;
  const adim = () => {
    if (oturum !== token) return;
    if (i === parcalar.length) { sonra(); return; }
    parcalar[i++]();
    sozBitince(() => { timer = window.setTimeout(adim, ara); }, 3000);
  };
  adim();
}

/**
 * Anne'nin Kek Fırını (M18; rakamla toplama ve çıkarma): fırının üstündeki panoda işlem rakam bloklarıyla yazılır
 * ("3 + 2 = ?"), Ceren okur; çocuk sonucu üç rakamdan seçer. 3. gelişte eksik toplanan ("6 + ? = 9"; derinlik.ts): yanlışta
 * camda altı kek ve eklenmesi gereken kekler parlayarak görünür, eklenenler sayılır. Doğruda sonuç panoya yazılır, fırının camında kekler görünüp
 * sayılır. Yanlışta Ceren "Fırına bakalım, kekleri sayalım" der: toplamada iki grup kek, çıkarmada Anne birkaçını alır, kalan
 * sayılır. 2–3 yaşta kekler baştan görünür. Kayıt: t.secimler bulunan sonuçlar.
 */
function kekFirini(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.kek;
  const yol = tekrarYolu();
  const islemler = kekIslemleri(yol, t.tekrar ?? 0, turunZorlari(t));
  const fon = yeniCizim('kek', 'mutfak-firin');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('kf-sahne');
  const anne = document.createElement('div');
  anne.className = 'kf-anne';
  anne.dataset.poz = '0';
  anne.innerHTML = yeniResim('kek', 'anne-firin-0', 'kf-poz kf-poz-0', 'Anne') + yeniResim('kek', 'anne-firin-1', 'kf-poz kf-poz-1', 'Anne sevinir');
  fonaYerlestir(anne, 1150, 245, 600, 700);
  // Pano (x 380…1290, y 80…330) ve fırın camı (x 560…1110, y 420…700) Astra'nın fonunda.
  const pano = document.createElement('div');
  pano.className = 'kf-pano';
  fonaYerlestir(pano, 380, 80, 910, 250);
  const cam = document.createElement('div');
  cam.className = 'kf-cam';
  fonaYerlestir(cam, 560, 420, 550, 280);
  const secenekEl = document.createElement('div');
  secenekEl.className = 'kf-secenek';
  sahneEl.append(pano, cam, anne, secenekEl);
  const blok = (ad: string) => yeniResim('kek', ad, 'kf-blok', ad === 'arti' ? '+' : ad === 'eksi' ? '−' : '=');
  let no = Math.min(t.secimler.length, islemler.length - 1);
  let defter = sayiDefteri();
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  function kekleriGoster(n: number, soluk = 0, eklenen = 0) {
    cam.replaceChildren();
    for (let i = 0; i < n; i++) {
      const k = document.createElement('span');
      k.className = 'kf-kek' + (i >= n - soluk ? ' alinacak' : '') + (i >= n - eklenen ? ' eklenen' : '');
      k.innerHTML = yeniResim('kek', 'kek', 'kf-kek-resim', '');
      cam.append(k);
    }
    cam.dataset.kek = String(n - soluk);
  }
  function kur() {
    const is = islemler[no];
    sahneEl.dataset.soru = String(no);
    sahneEl.dataset.sonuc = String(is.sonuc);
    sahneEl.dataset.bilinmeyen = is.bilinmeyen;
    sahneEl.dataset.cevap = String(is.cevap);
    const rakam = (n: number) => '<span class="kf-yer">' + rakamResmi(n) + '</span>';
    pano.innerHTML = rakam(is.a) + blok(is.isaret === '+' ? 'arti' : 'eksi') + (is.bilinmeyen === 'b' ? '<span class="kf-yer kf-soru"></span>' : rakam(is.b)) +
      blok('esittir') + (is.bilinmeyen === 'b' ? rakam(is.sonuc) : '<span class="kf-yer kf-soru"></span>');
    defter = sayiDefteri();
    cam.replaceChildren();
    cam.dataset.kek = '0';
    if (yol === 'minik') kekleriGoster(is.a + is.b);
    secenekEl.replaceChildren();
    secenekEl.inert = true;
    durum('oku');
    // Ceren işlemi okur: "Üç. Artı. İki. Eşittir." Eksik toplananda: "Altı. Artı. Kaç? Eşittir. Dokuz."
    sirayla(is.bilinmeyen === 'b'
      ? [() => adediOku(is.a), () => soyle(sozler[S.arti]), () => soyle(sozler[S.kac]), () => soyle(sozler[S.esittir]), () => adediOku(is.sonuc)]
      : [() => adediOku(is.a), () => soyle(sozler[is.isaret === '+' ? S.arti : S.eksi]), () => adediOku(is.b), () => soyle(sozler[S.esittir])], sor);
  }
  function sor() {
    if (oturum !== token) return;
    const is = islemler[no];
    durum('sor');
    secenekEl.inert = false;
    balonSecenekleri(is.cevap).forEach((x) => {
      const b = buton(secenekEl, String(x), rakamResmi(x), () => cevap(x, b), 'parca kf-rakam');
    });
    ipucunuTekrarla = () => { if (sahneEl.dataset.durum === 'sor') soyle(metin); };
  }
  function kekleriSay(sonra: () => void) {
    // Toplamada a + b kek, çıkarmada önce a kek, sonra b'si Anne'nin tepsisine gider; kalanlar sayılır. Eksik toplananda
    // sonuç kadar kek, eklenenler parlar ve yalnız onlar sayılır.
    const is = islemler[no];
    if (is.bilinmeyen === 'b') kekleriGoster(is.sonuc, 0, is.b);
    else if (is.isaret === '+') kekleriGoster(is.sonuc);
    else kekleriGoster(is.a, is.b);
    const say = () => {
      const kalan = [...cam.querySelectorAll<HTMLElement>(is.bilinmeyen === 'b' ? '.kf-kek.eklenen' : '.kf-kek:not(.alinacak)')];
      // Eksik toplananda eklenecek kekler önce görünmez; sayıldıkça tek tek fırına girer.
      if (is.bilinmeyen === 'b') kalan.forEach((el) => el.classList.add('gizli'));
      let i = 0;
      const adim = () => {
        if (oturum !== token) return;
        if (i === kalan.length) { sonra(); return; }
        kalan[i].classList.remove('gizli');
        yenidenOynat(kalan[i++], 'zipla');
        adediOku(i);
        timer = window.setTimeout(adim, minik ? 680 : 600);
      };
      adim();
    };
    if (is.isaret === '-') {
      anne.dataset.poz = '0';
      timer = window.setTimeout(() => { if (oturum !== token) return; cam.querySelectorAll('.alinacak').forEach((k) => k.classList.add('gitti')); timer = window.setTimeout(say, 700); }, 700);
    } else say();
  }
  function cevap(x: number, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.durum !== 'sor') return;
    const is = islemler[no];
    if (x !== is.cevap) {
      durum('say');
      b.classList.add('soluk');
      defter.yanlis(is.cevap);
      ipucu(b, sozler[S.ipucu]);
      sozBitince(() => { timer = window.setTimeout(() => kekleriSay(() => durum('sor')), 250); }, 3500);
      return;
    }
    durum('dogru');
    b.classList.add('dogru');
    defter.dogru(is.cevap);
    secenekEl.inert = true;
    pano.querySelector('.kf-soru')!.innerHTML = rakamResmi(x);
    t.secimler.push(x);
    kaydet(k);
    oyunSesi('miknatis');
    kekleriSay(() => {
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        if (no + 1 >= islemler.length) { anne.dataset.poz = '1'; tamam(sozler[S.hazir]); return; }
        no++;
        kur();
      }, 600);
    });
  }
  metin = sozler[islemler[0].bilinmeyen === 'b' ? S.eksik : S.yonerge];
  if (sesli && !t.secimler.length) { soyle(metin); sozBitince(() => { timer = window.setTimeout(kur, 250); }, 5000); }
  else kur();
}
/**
 * Lokum'un Asansörü (M19; bir fazla, bir eksik): apartmanın beş kat levhasında ardışık sayılar; Lokum kabinde bir katta.
 * Ceren "Bir fazla: bir kat yukarı!" ya da "Bir eksik: bir kat aşağı!" der; çocuk gidilecek katın levhasına dokunur, kabin
 * kayar, Ceren katın sayısını söyler. Yanlışta levha sallanır, Ceren "Lokum'un katına bak; bir sonraki (önceki) sayı?" der.
 * 2–3 yaş yalnız bir fazla (1–5), 4 yaş 1–10, 5+ 11–20. Kayıt: t.secimler tamamlanan adımlar.
 */
function lokumunAsansoru(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.asansor;
  const ham = asansorTuru(tekrarYolu(), t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const at = yirmisiz(ham.pencere + 4) !== ham.pencere + 4 ? { ...ham, pencere: ham.pencere - 1, bas: ham.bas - 1 } : ham;
  const fon = yeniCizim('asansor', 'apartman');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('la-sahne');
  let no = Math.min(t.secimler.length, at.adimlar.length);
  let kat = at.bas + at.adimlar.slice(0, no).reduce<number>((a, b) => a + b, 0);
  const kabin = document.createElement('div');
  kabin.className = 'la-kabin';
  kabin.dataset.poz = '0';
  kabin.innerHTML = yeniResim('asansor', 'asansor-lokum-0', 'la-poz la-poz-0', 'Lokum asansörde') + yeniResim('asansor', 'asansor-lokum-1', 'la-poz la-poz-1', 'Lokum sevinir');
  const kataGit = (n: number) => { fonaYerlestir(kabin, 720, KAT_Y[n - at.pencere] - 85, 240, 170); sahneEl.dataset.kat = String(n); };
  kataGit(kat);
  sahneEl.append(kabin);
  // Apartmanın kendisi (fonda çizili beş kat) oyun yeri: telefon kamerası onu bütün olarak gösterir.
  const bina = document.createElement('i');
  bina.className = 'tk-alan';
  fonaYerlestir(bina, 100, 20, 1480, 880);
  sahneEl.append(bina);
  const levhalar = Array.from({ length: 5 }, (_, i) => {
    const n = at.pencere + i;
    const b = buton(sahneEl, String(n), '<span class="la-rakam">' + rakamBloklari(n) + '</span>', () => sec(n, b), 'la-levha');
    fonaYerlestir(b, 985, KAT_Y[i] - 50, 120, 100);
    return b;
  });
  void levhalar;
  let bekle = true;
  function sor() {
    if (oturum !== token) return;
    if (no >= at.adimlar.length) { kabin.dataset.poz = '1'; tamam(sozler[S.vardi]); return; }
    const yon = at.adimlar[no];
    sahneEl.dataset.yon = yon > 0 ? 'fazla' : 'eksik';
    sahneEl.dataset.adim = String(no);
    metin = sozler[yon > 0 ? S.fazla : S.eksik];
    soyle(metin);
    bekle = false;
    ipucunuTekrarla = () => soyle(metin);
  }
  function sec(n: number, b: HTMLButtonElement) {
    if (kilit || bekle) return;
    const hedef = kat + at.adimlar[no];
    if (n !== hedef) {
      defter.yanlis(hedef);
      yenidenOynat(b, 'kipir');
      ipucu(b, sozler[at.adimlar[no] > 0 ? S.ipucuFazla : S.ipucuEksik]);
      return;
    }
    defter.dogru(hedef);
    bekle = true;
    kat = hedef;
    kataGit(kat);
    oyunSesi('kutu');
    t.secimler.push(no);
    kaydet(k);
    no++;
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      sayiyiOku(kat);
      sozBitince(() => { timer = window.setTimeout(sor, 400); }, 2500);
    }, 900);
  }
  if (sesli && !t.secimler.length) { soyle(sozler[S.yonerge]); sozBitince(() => { timer = window.setTimeout(sor, 300); }, 5000); }
  else timer = window.setTimeout(sor, 400);
  metin = sozler[S.yonerge];
}
/**
 * Şekil Bahçesi (M20; oval, yıldız, kalp, altıgen): Ceren şekli tanıtır, büyük ahşap şekil gökte durur; örtüde karışık altı
 * nesneden o şekildeki ikisini çocuk bulur (yumurta ve ayna oval, deniz yıldızı ve kurabiye yıldız…). Yanlışta nesne sallanır,
 * Ceren "Şekline iyi bak" der; bir şekilde ilk yanlış konu defterine yazılır. 2–3 yaş yıldız ve kalp, 4 yaş + oval, 5+ +
 * altıgen. Kayıt: t.secimler biten şekillerin sırası.
 */
function sekilBahcesi(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.sekilbahce;
  // Gelişe göre şekiller ve tanıtılacaklar (derinlik.ts); konu defterinde zorlanılan şekil başa alınır. Sıra turun başında
  // bir kez kurulur (planZor: şekil sırası numaraları), yarıda kalan tur aynı sırayla sürer.
  const SEKIL_NO: YeniSekil[] = ['yildiz', 'kalp', 'oval', 'altigen'];
  if (!t.planZor) {
    t.planZor = t.secimler.length ? [] : zorKonular(tekrarYolu()).filter((z) => z.alan === 'sekil').map((z) => SEKIL_NO.indexOf(z.konu as YeniSekil)).filter((i) => i >= 0);
    kaydet(k);
  }
  const sb = sekilBahcesiTuru(tekrarYolu(), t.tekrar ?? 0, t.planZor.map((i) => SEKIL_NO[i]));
  const sekiller = sb.sekiller;
  const TANIT = { oval: S.tanitOval, yildiz: S.tanitYildiz, kalp: S.tanitKalp, altigen: S.tanitAltigen } as const;
  const BUL = { oval: S.bulOval, yildiz: S.bulYildiz, kalp: S.bulKalp, altigen: S.bulAltigen } as const;
  const fon = yeniCizim('sekilbahce', 'sekil-bahcesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('sb-sahne');
  const kino = document.createElement('div');
  kino.className = 'sb-kino';
  kino.dataset.poz = '0';
  kino.innerHTML = yeniResim('sekilbahce', 'kino-sekil-0', 'sb-poz sb-poz-0', 'Kino büyüteçle') + yeniResim('sekilbahce', 'kino-sekil-1', 'sb-poz sb-poz-1', 'Kino buldu');
  fonaYerlestir(kino, 0, 300, 500, 600);
  const tabela = document.createElement('div');
  tabela.className = 'sb-tabela';
  fonaYerlestir(tabela, 736, 40, 200, 200);
  const ortu = document.createElement('div');
  ortu.className = 'sb-ortu';
  sahneEl.append(tabela, ortu, kino);
  let no = Math.min(t.secimler.length, sekiller.length - 1);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  function kur() {
    const s = sekiller[no];
    sahneEl.dataset.sekil = s;
    tabela.innerHTML = yeniResim('sekilbahce', s, 'sb-tabela-resim', s);
    yenidenOynat(tabela, 'gel');
    kino.dataset.poz = '0';
    ortu.replaceChildren();
    let bulunan = 0, yanlis = false;
    sekilOrtusu(s, t.tekrar ?? 0).forEach((n, i) => {
      const b = buton(ortu, n.ad.replace(/-/g, ' '), yeniResim('sekilbahce', n.ad, 'sb-nesne-resim', n.ad), () => sec(b, n.dogru), 'sb-nesne');
      fonaYerlestir(b, ORTU_YERI[i].x - 100, ORTU_YERI[i].y - 100, 200, 200);
      b.dataset.dogru = n.dogru ? '1' : '';
    });
    durum('tanit');
    sirayla([...(sb.tanit.includes(s) ? [() => soyle(sozler[TANIT[s]])] : []), () => soyle(sozler[BUL[s]])], () => { durum('bul'); metin = sozler[BUL[s]]; });
    function sec(b: HTMLButtonElement, dogru: boolean) {
      if (kilit || sahneEl.dataset.durum !== 'bul' || b.classList.contains('bulundu')) return;
      if (!dogru) {
        if (!yanlis) { yanlis = true; konudaZorlandi(tekrarYolu(), 'sekil', s); }
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[S.ipucu]);
        return;
      }
      b.classList.add('bulundu');
      oyunSesi('miknatis');
      yenidenOynat(tabela, 'parla');
      if (++bulunan < 2) { ovgu(); return; }
      if (!yanlis) konudaBasardi(tekrarYolu(), 'sekil', s);
      durum('bitti');
      kino.dataset.poz = '1';
      t.secimler.push(no);
      kaydet(k);
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        if (no + 1 >= sekiller.length) { tamam(sozler[S.bitti]); return; }
        no++;
        kur();
      }, 1400);
    }
  }
  metin = sozler[S.bitti];
  void sesli;
  kur();
}
/**
 * Şekillerle Resim Yap (M21): büyük kâğıtta kesik çizgili taslak (ev, 5+ yaşta sonra roket); parçalar masanın iki yanında.
 * Çocuk parçaya dokunup taslaktaki yerine dokunur ya da parçayı yerine sürükler; doğru yerde parça tam oturur, Ceren şeklin
 * adını söyler ("Bu bir üçgen!"). Yanlış yerde parça sallanır, "Bu parça nereye uyar? Şekline bak." Resim tamamlanınca
 * canlanır (bacadan duman, pencerede Kino; roket kalkar). 2–3 yaşta evin pencereleri hazır gelir. Kayıt: t.secimler
 * yerleşen parçalar (resim × 5 + yer).
 */
function resimYap(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.resim;
  const SEKIL_SOZU = { ucgen: S.ucgen, kare: S.kare, dikdortgen: S.dikdortgen, daire: S.daire } as const;
  const sira = resimSirasi(tekrarYolu(), t.tekrar ?? 0);
  const fon = yeniCizim('resim', 'resim-masasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('ry-sahne');
  const kagit = document.createElement('div');
  kagit.className = 'ry-kagit';
  const tepsi = document.createElement('div');
  tepsi.className = 'ry-tepsi';
  sahneEl.append(kagit, tepsi);
  // Parçalar masada: solda üç, sağda iki yer (kalemlerin altında); her biri en çok 200 px'lik kutuya sığar.
  const TEPSI = [{ x: 260, y: 210 }, { x: 260, y: 480 }, { x: 260, y: 750 }, { x: 1410, y: 450 }, { x: 1410, y: 720 }];
  let ri = Math.min(Math.floor(t.secimler.length / 5), sira.length - 1);
  let secili = -1;
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  function kur() {
    const { resim, hazir } = sira[ri];
    const [tw, th] = resim.tuval;
    // Taslak kâğıdın ortasında (kâğıt x 495…1175, y 55…885), ölçek 1.
    const ox = 835 - tw / 2, oy = resim.ad === 'ev' ? 150 : 110;
    sahneEl.dataset.resim = resim.ad;
    kagit.replaceChildren();
    tepsi.replaceChildren();
    const taslak = document.createElement('div');
    taslak.className = 'ry-taslak';
    fonaYerlestir(taslak, ox, oy, tw, th);
    taslak.innerHTML = yeniResim('resim', resim.ad + '-taslak', 'ry-taslak-resim', resim.ad + ' taslağı');
    kagit.append(taslak);
    const yerlesen = new Set<number>([...hazir, ...t.secimler.filter((x) => Math.floor(x / 5) === ri).map((x) => x % 5)]);
    const dolu = new Set<number>();
    const yerler = resim.parcalar.map((p, i) => {
      const y = buton(kagit, 'Yer: ' + p.ad.replace(/-/g, ' '), '', () => koy(i), 'ry-yer');
      fonaYerlestir(y, ox + p.yer[0], oy + p.yer[1], p.yer[2], p.yer[3]);
      // Küçük yerler büyüklerin üstünde (pencere gövdenin üstünde dokunulur).
      y.style.zIndex = String(10 + Math.round(1e6 / (p.yer[2] * p.yer[3])));
      y.dataset.yer = String(i);
      return y;
    });
    const otur = (parca: number, yer: number) => {
      const p = resim.parcalar[parca], el = document.createElement('div');
      el.className = 'ry-oturan';
      fonaYerlestir(el, ox + resim.parcalar[yer].yer[0], oy + resim.parcalar[yer].yer[1], p.yer[2], p.yer[3]);
      el.style.zIndex = String(Math.round(1e6 / (p.yer[2] * p.yer[3])));
      el.innerHTML = yeniResim('resim', p.ad, 'ry-parca-resim', p.ad);
      kagit.append(el);
      dolu.add(yer);
      yerler[yer].disabled = true;
      return el;
    };
    yerlesen.forEach((i) => otur(i, i));
    const parcalar = resim.parcalar.map((p, i) => {
      if (yerlesen.has(i)) return undefined;
      const b = buton(tepsi, p.ad.replace(/-/g, ' '), yeniResim('resim', p.ad, 'ry-parca-resim', p.ad), () => sec(i), 'ry-parca');
      const olcek = Math.min(1, 200 / Math.max(p.yer[2], p.yer[3]));
      const yer = TEPSI[[...resim.parcalar.keys()].filter((j) => !yerlesen.has(j)).indexOf(i)];
      fonaYerlestir(b, yer.x - (p.yer[2] * olcek) / 2, yer.y - (p.yer[3] * olcek) / 2, p.yer[2] * olcek, p.yer[3] * olcek);
      b.dataset.parca = String(i);
      surukle(b, (e) => {
        const hedef = yerler.filter((y) => !y.disabled).map((y) => ({ y, r: y.getBoundingClientRect() }))
          // Bırakma alanı da dokunma alanı gibi en az 48 px (telefonda pencere yuvası 32 px).
          .filter(({ r }) => {
            const px = Math.max(0, (48 - r.width) / 2), py = Math.max(0, (48 - r.height) / 2);
            return e.clientX >= r.left - px && e.clientX <= r.right + px && e.clientY >= r.top - py && e.clientY <= r.bottom + py;
          })
          .sort((a, c) => a.r.width * a.r.height - c.r.width * c.r.height)[0];
        birakilan = hedef ? Number(hedef.y.dataset.yer) : -1;
        return hedef?.r;
      }, () => { secili = i; koy(birakilan); });
      return b;
    });
    let birakilan = -1;
    secili = -1;
    sahneEl.dataset.kalan = String(resim.parcalar.length - dolu.size);
    function sec(i: number) {
      if (kilit || sahneEl.dataset.durum !== 'yap') return;
      secili = i;
      parcalar.forEach((b, j) => b?.classList.toggle('secili', j === i));
      oyunSesi('kagit');
    }
    function koy(yer: number) {
      if (kilit || sahneEl.dataset.durum !== 'yap' || secili < 0 || yer < 0 || dolu.has(yer)) return;
      const b = parcalar[secili]!;
      if (!parcaYereUyar(resim, secili, yer)) {
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[S.ipucu]);
        return;
      }
      const el = otur(secili, yer);
      yerineOtur(parcaninKonumu(b), el);
      b.remove();
      parcalar[secili] = undefined;
      t.secimler.push(ri * 5 + secili);
      kaydet(k);
      oyunSesi('miknatis');
      soyle(sozler[SEKIL_SOZU[resim.parcalar[secili].sekil]]);
      secili = -1;
      sahneEl.dataset.kalan = String(resim.parcalar.length - dolu.size);
      if (dolu.size < resim.parcalar.length) return;
      // Resim tamam: canlanır.
      durum('canli');
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          const canli = document.createElement('div');
          canli.className = 'ry-canli ry-canli-' + resim.ad;
          fonaYerlestir(canli, ox, oy, tw, resim.ad === 'roket' ? 900 : th);
          canli.innerHTML = yeniResim('resim', resim.ad + '-canli', 'ry-canli-resim', resim.ad + ' canlandı');
          kagit.append(canli);
          oyunSesi('parilti');
          soyle(sozler[resim.ad === 'ev' ? S.evBitti : S.roketBitti]);
          if (resim.ad === 'roket' && !matchMedia('(prefers-reduced-motion: reduce)').matches) canli.animate([{ translate: '0 0' }, { translate: '0 2cqw', offset: 0.25 }, { translate: '0 -70cqw' }], { duration: 2600, delay: 1600, easing: 'ease-in', fill: 'forwards' });
          sozBitince(() => {
            timer = window.setTimeout(() => {
              if (oturum !== token) return;
              if (ri + 1 >= sira.length) { tamam(); return; }
              ri++;
              soyle(sozler[S.roket]);
              kur();
            }, 900);
          }, 5000);
        }, 300);
      }, 2500);
    }
    durum('yap');
  }
  metin = sozler[S.ev];
  if (sesli && !t.secimler.length) soyle(metin);
  kur();
}
/**
 * Mino'nun Büyüyen Fenerleri (M22; büyüyen örüntü): sahnede fener sütunları her adımda büyür (1, 2, 3…; 5+ yaşta ikişer).
 * Çocuk sıradaki sütunun yerine dokundukça bir fener eklenir, fazlasını üstteki fenere dokunup geri alır, "Tamam"la
 * onaylar. Doğruda bütün fenerler parlar, Mino alkışlar; yanlışta Ceren "Her sütunda bir (iki) fener daha var" der,
 * sütunlar sayılır. Kayıt: t.secimler biten desenler.
 */
function buyuyenFenerler(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.buyuyen;
  const desenler = buyuyenDesenler(tekrarYolu(), t.tekrar ?? 0);
  const fon = yeniCizim('buyuyen', 'fener-sahnesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('bf-sahne');
  const mino = document.createElement('div');
  mino.className = 'bf-mino';
  mino.dataset.poz = '0';
  mino.innerHTML = yeniResim('buyuyen', 'mino-fener-0', 'bf-poz bf-poz-0', 'Mino') + yeniResim('buyuyen', 'mino-fener-1', 'bf-poz bf-poz-1', 'Mino alkışlar');
  fonaYerlestir(mino, 1150, 285, 500, 600);
  const sutunlar = document.createElement('div');
  sutunlar.className = 'bf-sutunlar';
  sahneEl.append(sutunlar, mino);
  let no = Math.min(t.secimler.length, desenler.length - 1);
  const RENK = ['sari', 'mavi'];
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  function kur() {
    const d = desenler[no];
    const hedef = desenCevabi(d);
    const olcek = hedef > 6 ? 0.55 : 0.8, ADIM = 136 * olcek, ZEMIN = 862;
    const xler = Array.from({ length: d.goster + 1 }, (_, i) => (d.goster === 2 ? 400 : 330) + i * (d.goster === 2 ? 250 : 230));
    sutunlar.replaceChildren();
    sahneEl.dataset.desen = String(no);
    sahneEl.dataset.hedef = String(hedef);
    const fener = (sutun: number, kat: number, cls = '') => {
      const f = document.createElement('div');
      f.className = 'bf-fener ' + cls;
      fonaYerlestir(f, xler[sutun] - 70 * olcek, ZEMIN - kat * ADIM - 148 * olcek, 140 * olcek, 160 * olcek);
      f.innerHTML = yeniResim('buyuyen', 'kagit-fener-' + RENK[sutun % 2], 'bf-fener-resim', '');
      return f;
    };
    for (let s = 0; s < d.goster; s++) for (let kat = 0; kat < d.bas + d.adim * s; kat++) sutunlar.append(fener(s, kat));
    // Sıradaki sütun: boş yerine dokununca fener eklenir; üstteki fenere dokununca geri alınır.
    const yeni: HTMLElement[] = [];
    const yer = buton(sutunlar, 'Fener ekle', '', () => ekle(), 'bf-yer');
    fonaYerlestir(yer, xler[d.goster] - 90, 120, 180, ZEMIN - 120);
    // Eklenen fenere dokununca en üstteki geri alınır.
    const gerial = () => {
      if (kilit || sahneEl.dataset.durum !== 'kur' || !yeni.length) return;
      yeni.pop()!.remove();
      oyunSesi('geri');
      sahneEl.dataset.sayi = String(yeni.length);
    };
    const ekle = () => {
      if (kilit || sahneEl.dataset.durum !== 'kur' || yeni.length >= 9) return;
      const f = fener(d.goster, yeni.length, 'yeni');
      f.setAttribute('role', 'button');
      f.setAttribute('aria-label', 'Bir feneri geri al');
      f.onclick = () => { sesiAc(); gerial(); };
      sutunlar.append(f);
      yeni.push(f);
      oyunSesi('kagit');
      sahneEl.dataset.sayi = String(yeni.length);
    };
    sahneEl.dataset.sayi = '0';
    const ok = buton(sutunlar, 'Fenerleri kontrol et', glyph('ok'), () => {
      if (kilit || sahneEl.dataset.durum !== 'kur') return;
      if (yeni.length !== hedef) {
        durum('say');
        ipucu(ok, sozler[d.adim === 2 ? S.ikiFazla : S.birFazla]);
        // Sütunlar sırayla sayılır.
        sozBitince(() => {
          let s = 0;
          const say = () => {
            if (oturum !== token) return;
            if (s === d.goster) { durum('kur'); return; }
            const n = d.bas + d.adim * s;
            sutunlar.querySelectorAll<HTMLElement>('.bf-fener:not(.yeni)').forEach((f, i, hepsi) => {
              const once = [...Array(s).keys()].reduce((a, j) => a + d.bas + d.adim * j, 0);
              if (i >= once && i < once + n) yenidenOynat(f, 'parla');
              void hepsi;
            });
            adediOku(n);
            s++;
            timer = window.setTimeout(say, 900);
          };
          say();
        }, 3500);
        return;
      }
      durum('bitti');
      sutunlar.querySelectorAll('.bf-fener').forEach((f) => f.classList.add('yandi'));
      mino.dataset.poz = '1';
      oyunSesi('parilti');
      t.secimler.push(no);
      kaydet(k);
      soyle(sozler[S.parladi]);
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          if (no + 1 >= desenler.length) { tamam(); return; }
          no++;
          mino.dataset.poz = '0';
          kur();
        }, 800);
      }, 3500);
    }, 'onay bf-onay');
    durum('kur');
  }
  metin = sozler[S.yonerge];
  if (sesli && !t.secimler.length) soyle(metin);
  kur();
}
/**
 * Zıpzıp'ın Şenlik Bayrakları (M23; eksik parçayı bul): ipte sıralı bayraklar, dizinin ortasında bir (5+ yaşta iki) boşluk.
 * Çocuk aşağıdaki dört bayraktan eksik olanı seçer, bayrak boşluğa asılır. Yanlışta bayrak sallanır, Ceren "Diziyi baştan
 * izle" der, ipteki bayraklar soldan sağa sırayla parlar. 2–3 yaş AB, 4 yaş AAB, 5+ ABC. Kayıt: t.secimler biten diziler.
 */
function senlikBayraklari(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.bayrak;
  const diziler = bayrakDizileri(tekrarYolu(), t.tekrar ?? 0);
  const fon = yeniCizim('bayrak', 'bayrak-direkleri');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('sy-sahne');
  const zipzip = document.createElement('div');
  zipzip.className = 'sy-zipzip';
  zipzip.dataset.poz = '0';
  zipzip.innerHTML = yeniResim('bayrak', 'zipzip-bayrak-0', 'sy-poz sy-poz-0', 'Zıpzıp') + yeniResim('bayrak', 'zipzip-bayrak-1', 'sy-poz sy-poz-1', 'Zıpzıp sevinir');
  fonaYerlestir(zipzip, 1140, 330, 500, 600);
  const ip = document.createElement('div');
  ip.className = 'sy-ip';
  const secenekEl = document.createElement('div');
  secenekEl.className = 'sy-secenek';
  sahneEl.append(ip, secenekEl, zipzip);
  let no = Math.min(t.secimler.length, diziler.length - 1);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const bayrak = (tur: BayrakTuru) => yeniResim('bayrak', 'bayrak-' + tur, 'sy-bayrak-resim', tur.replace('-', ' '));
  function kur() {
    const d = diziler[no];
    const n = d.dizi.length, olcek = n > 8 ? 0.82 : 0.9, adim = (1360 / n);
    ip.replaceChildren();
    sahneEl.dataset.dizi = String(no);
    zipzip.dataset.poz = '0';
    const yerler = d.dizi.map((tur, i) => {
      const el = document.createElement('div');
      el.className = 'sy-yer' + (d.bosluk.includes(i) ? ' bos' : '');
      // Asma noktası (80, 8) ipe (y 200) oturur.
      fonaYerlestir(el, 180 + adim * (i + 0.5) - 80 * olcek, 200 - 8 * olcek, 160 * olcek, 220 * olcek);
      if (!d.bosluk.includes(i)) el.innerHTML = bayrak(tur);
      el.dataset.tur = tur;
      ip.append(el);
      return el;
    });
    let sira = 0;
    sahneEl.dataset.bosluk = String(d.bosluk.length);
    secenekEl.replaceChildren();
    BAYRAK_TURLERI.forEach((tur, i) => {
      const b = buton(secenekEl, tur.replace('-', ' '), bayrak(tur), () => sec(tur, b), 'sy-secim');
      fonaYerlestir(b, 230 + i * 210, 690, 150, 206);
    });
    durum('sec');
    function diziyiIzle(sonra: () => void) {
      let i = 0;
      const adimla = () => {
        if (oturum !== token) return;
        if (i === yerler.length) { sonra(); return; }
        const y = yerler[i++];
        if (!y.classList.contains('bos')) yenidenOynat(y, 'parla');
        timer = window.setTimeout(adimla, 380);
      };
      adimla();
    }
    function sec(tur: BayrakTuru, b: HTMLButtonElement) {
      if (kilit || sahneEl.dataset.durum !== 'sec') return;
      const hedef = d.bosluk[sira];
      if (tur !== d.dizi[hedef]) {
        durum('izle');
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[S.ipucu]);
        sozBitince(() => diziyiIzle(() => durum('sec')), 3500);
        return;
      }
      const y = yerler[hedef];
      y.classList.remove('bos');
      y.innerHTML = bayrak(tur);
      yerineOtur(b.getBoundingClientRect(), y.firstElementChild);
      oyunSesi('kagit');
      sira++;
      sahneEl.dataset.bosluk = String(d.bosluk.length - sira);
      if (sira < d.bosluk.length) return;
      durum('bitti');
      zipzip.dataset.poz = '1';
      oyunSesi('parilti');
      if (no + 1 < diziler.length) ovgu();
      yerler.forEach((el, i) => window.setTimeout(() => { if (oturum === token) yenidenOynat(el, 'dalga'); }, i * 90));
      t.secimler.push(no);
      kaydet(k);
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        if (no + 1 >= diziler.length) { tamam(sozler[S.tamam]); return; }
        no++;
        kur();
      }, 1800);
    }
  }
  metin = sozler[S.yonerge];
  if (sesli && !t.secimler.length) soyle(metin);
  kur();
}

/**
 * Sen Başlat, Kino Sürdürsün (M24; kendi örüntüsü): çocuk raftaki çalgı kartlarından bir birim kurar (iki kart; 5+ yaşta üç),
 * en az iki farklı çalgıyla. Kino o birimi iki kez daha çalar (her vuruşta pozu ve sesi), sonra sıradaki boş kalır: çocuk
 * doğru kartı seçer. Kayıt tutmaz (yarıda kalan tur baştan kurulur).
 */
function kinoSurdursun(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.calgi;
  // Gelişe göre birim uzunluğu (2–4 kart) ve sondaki boşluk sayısı (1–2; derinlik.ts).
  const { birim: u, bos: bosSay } = calgiTuru(tekrarYolu(), t.tekrar ?? 0);
  const birimSozu = u === 4 ? S.dortKart : u === 3 ? S.ucKart : S.ikiKart;
  const CALGI_SES: Record<Calgi, number> = { davul: 0, cingirak: 2, alkis: 1 };
  const fon = yeniCizim('calgi', 'muzik-kosesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('ks-sahne');
  const kino = document.createElement('div');
  kino.className = 'ks-kino';
  kino.dataset.poz = 'davul';
  kino.innerHTML = CALGILAR.map((c) => yeniResim('calgi', 'kino-' + c, 'ks-poz ks-poz-' + c, 'Kino ' + c)).join('');
  fonaYerlestir(kino, 1180, 270, 400, 480);
  // Dizi duvarda: çocuğun birimi, Kino'nun iki tekrarı ve sonda boşluk(lar); kartlar Kino'nun soluna sığar (x 80…1200).
  const toplam = u * 3 + bosSay, bosluk = 10, kart = Math.min(118, Math.floor((1120 - (toplam - 1) * bosluk) / toplam)), bas = 640 - (toplam * kart + (toplam - 1) * bosluk) / 2;
  const diziEl = document.createElement('div');
  diziEl.className = 'ks-dizi';
  const yuvalar = Array.from({ length: toplam }, (_, i) => {
    const y = document.createElement('div');
    y.className = 'ks-yuva' + (i < u ? ' cocuk' : i >= u * 3 ? ' son' : '');
    fonaYerlestir(y, bas + i * (kart + bosluk), 90, kart, kart);
    diziEl.append(y);
    return y;
  });
  const raf = document.createElement('div');
  raf.className = 'ks-raf';
  sahneEl.append(diziEl, raf, kino);
  const kartHTML = (c: Calgi) => yeniResim('calgi', 'kart-' + c, 'ks-kart-resim', c);
  const birim: Calgi[] = [];
  let bulunan = 0;
  sahneEl.dataset.bos = String(bosSay);
  sahneEl.dataset.bulunan = '0';
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const cal = (c: Calgi) => { kino.dataset.poz = c; calgiSesi(CALGI_SES[c], undefined, 0.8); };
  CALGILAR.forEach((c, i) => {
    const b = buton(raf, c === 'cingirak' ? 'çıngırak' : c === 'alkis' ? 'alkış' : 'davul', kartHTML(c), () => sec(c, b), 'ks-kart');
    fonaYerlestir(b, 300 + i * 260, 712, 180, 180);
  });
  function sec(c: Calgi, b: HTMLButtonElement) {
    if (kilit) return;
    const d = sahneEl.dataset.durum;
    if (d === 'kur') {
      const y = yuvalar[birim.length];
      y.innerHTML = kartHTML(c);
      yerineOtur(b.getBoundingClientRect(), y.firstElementChild);
      birim.push(c);
      cal(c);
      sahneEl.dataset.birim = birim.join(',');
      if (birim.length < u) return;
      if (!birimGecerli(birim)) {
        // Hepsi aynı çalgı: örüntü olmaz; birim boşalır.
        durum('bekle');
        ipucu(b, sozler[birimSozu]);
        sozBitince(() => { timer = window.setTimeout(() => { if (oturum !== token) return; birim.length = 0; yuvalar.slice(0, u).forEach((y) => y.replaceChildren()); sahneEl.dataset.birim = ''; durum('kur'); }, 300); }, 3500);
        return;
      }
      durum('kino');
      timer = window.setTimeout(kinoCalsin, 500);
      return;
    }
    if (d !== 'sor') return;
    // Sondaki boşluklar sırayla: birimin bulunan + 1'inci kartı.
    const dogru = birim[bulunan % u];
    if (c !== dogru) {
      yenidenOynat(b, 'kipir');
      ipucu(b, sozler[S.siradaki]);
      return;
    }
    const son = yuvalar[u * 3 + bulunan];
    son.classList.remove('son');
    son.innerHTML = kartHTML(c);
    yerineOtur(b.getBoundingClientRect(), son.firstElementChild);
    cal(c);
    bulunan++;
    sahneEl.dataset.bulunan = String(bulunan);
    if (bulunan < bosSay) return;
    durum('bitti');
    timer = window.setTimeout(() => { if (oturum !== token) return; kino.dataset.poz = 'alkis'; tamam(sozler[S.guzel]); }, 700);
  }
  function kinoCalsin() {
    if (oturum !== token) return;
    soyle(sozler[S.kinoSurdursun]);
    sozBitince(() => {
      let i = 0;
      const vurus = () => {
        if (oturum !== token) return;
        if (i === u * 2) {
          durum('sor');
          metin = sozler[S.siradaki];
          soyle(metin);
          return;
        }
        const c = birim[i % u], y = yuvalar[u + i];
        y.innerHTML = kartHTML(c);
        yenidenOynat(y, 'parla');
        cal(c);
        i++;
        timer = window.setTimeout(vurus, 700);
      };
      timer = window.setTimeout(vurus, 300);
    }, 3500);
  }
  durum('kur');
  metin = sozler[birimSozu];
  if (sesli || t.secimler.length) soyle(metin);
}
/**
 * Anne'nin Sürahileri (M25; hacim): önce çocuk dolu sürahiye dokunur, sürahi eğilip boş bardağı yarıya, bir daha dokununca
 * tam doldurur ("Yarım oldu!", "Tam doldu!"). Sonra tezgâhta üç bardak (boş, yarım, dolu): Ceren birini sorar, çocuk gösterir;
 * bir soruda ilk yanlış konu defterine (ölçü: doluluk). 5+ yaşta sonda sürahi boşalana dek bardaklar dolar, "kaç bardak?".
 * 2–3 yaş yalnız dolu ve boş. Kayıt tutmaz (kısa tur; yarıda kalan baştan).
 */
function anneninSurahileri(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.surahi;
  const yol = tekrarYolu();
  const sorular = surahiSorulari(yol, t.tekrar ?? 0, turunZorlari(t));
  const fon = yeniCizim('surahi', 'mutfak-tezgahi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('as-sahne');
  const anne = document.createElement('div');
  anne.className = 'as-anne';
  anne.dataset.poz = '0';
  anne.innerHTML = yeniResim('surahi', 'anne-surahi-0', 'as-poz as-poz-0', 'Anne') + yeniResim('surahi', 'anne-surahi-1', 'as-poz as-poz-1', 'Anne sevinir');
  fonaYerlestir(anne, 1130, 240, 600, 700);
  const masa = document.createElement('div');
  masa.className = 'as-masa';
  sahneEl.append(masa, anne);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const bardakHTML = (d: Doluluk) => yeniResim('surahi', 'bardak-' + d, 'as-resim', 'bardak ' + d);
  // Tezgâhın üst yüzü y ~470…820; nesnelerin tabanı y 760.
  function doldurma() {
    masa.replaceChildren();
    const surahi = buton(masa, 'Sürahi', yeniResim('surahi', 'surahi-dolu', 'as-resim', 'sürahi'), () => dok(), 'as-surahi');
    fonaYerlestir(surahi, 700, 340, 320, 420);
    const bardak = document.createElement('div');
    bardak.className = 'as-bardak';
    fonaYerlestir(bardak, 420, 500, 200, 260);
    bardak.innerHTML = bardakHTML('bos');
    masa.append(bardak);
    let seviye: Doluluk = 'bos';
    durum('doldur');
    sahneEl.dataset.seviye = seviye;
    function dok() {
      if (kilit || sahneEl.dataset.durum !== 'doldur') return;
      durum('dokuyor');
      surahi.innerHTML = yeniResim('surahi', 'surahi-egik', 'as-resim', 'sürahi eğik');
      fonaYerlestir(surahi, 450, 190, 420, 420);
      oyunSesi('damla');
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        seviye = seviye === 'bos' ? 'yarim' : 'dolu';
        bardak.innerHTML = bardakHTML(seviye);
        sahneEl.dataset.seviye = seviye;
        surahi.innerHTML = yeniResim('surahi', seviye === 'yarim' ? 'surahi-yarim' : 'surahi-bos', 'as-resim', 'sürahi');
        fonaYerlestir(surahi, 700, 340, 320, 420);
        soyle(sozler[seviye === 'yarim' ? S.yarim : S.doldu]);
        sozBitince(() => {
          timer = window.setTimeout(() => {
            if (oturum !== token) return;
            if (seviye === 'yarim') durum('doldur');
            else sor(0);
          }, 300);
        }, 3000);
      }, 900);
    }
  }
  function sor(no: number) {
    if (oturum !== token) return;
    if (no >= sorular.bul.length) { if (sorular.kacBardak) kacBardak(); else bitir(); return; }
    const hedef = sorular.bul[no];
    masa.replaceChildren();
    sahneEl.dataset.soru = String(no);
    sahneEl.dataset.hedef = hedef;
    const sira = yol === 'minik' ? (['dolu', 'bos'] as Doluluk[]).sort((a, b) => (no % 2 ? a.localeCompare(b) : b.localeCompare(a))) : bardakSirasi(no, t.tekrar ?? 0);
    let yanlis = false;
    sira.forEach((d, i) => {
      const b = buton(masa, d === 'bos' ? 'Boş bardak' : d === 'yarim' ? 'Yarım bardak' : 'Dolu bardak', bardakHTML(d), () => {
        if (kilit || sahneEl.dataset.durum !== 'sor') return;
        if (d !== hedef) {
          if (!yanlis) { yanlis = true; konudaZorlandi(yol, 'olcu', 'doluluk'); }
          yenidenOynat(b, 'kipir');
          ipucu(b);
          return;
        }
        if (!yanlis) konudaBasardi(yol, 'olcu', 'doluluk');
        durum('dogru');
        b.classList.add('dogru');
        oyunSesi('miknatis');
        if (ovgu()) sozBitince(() => { timer = window.setTimeout(() => sor(no + 1), 200); }, 1600);
        else timer = window.setTimeout(() => sor(no + 1), 900);
      }, 'as-secim');
      fonaYerlestir(b, 360 + i * 260, 500, 200, 260);
    });
    durum('sor');
    metin = sozler[hedef === 'dolu' ? S.dolu : hedef === 'bos' ? S.bos : S.yarimBul];
    soyle(metin);
    ipucunuTekrarla = () => soyle(metin);
  }
  function kacBardak() {
    // Sürahi bardakları sırayla doldurur, boşalınca "kaç bardak?" sorulur.
    const n = sorular.kacBardak;
    const defter = sayiDefteri();
    masa.replaceChildren();
    durum('dolduruyor');
    const surahi = document.createElement('div');
    surahi.className = 'as-surahi-goster';
    surahi.innerHTML = yeniResim('surahi', 'surahi-dolu', 'as-resim', 'sürahi');
    fonaYerlestir(surahi, 120, 340, 320, 420);
    masa.append(surahi);
    const bardaklar = Array.from({ length: n }, (_, i) => {
      const b = document.createElement('div');
      b.className = 'as-bardak';
      fonaYerlestir(b, 470 + i * 170, 560, 150, 195);
      b.innerHTML = bardakHTML('bos');
      masa.append(b);
      return b;
    });
    let i = 0;
    const doldur = () => {
      if (oturum !== token) return;
      if (i === n) {
        surahi.innerHTML = yeniResim('surahi', 'surahi-bos', 'as-resim', 'sürahi');
        soyle(sozler[S.kacBardak]);
        durum('sor');
        sahneEl.dataset.kacBardak = String(n);
        const secenek = document.createElement('div');
        secenek.className = 'as-secenek';
        masa.append(secenek);
        balonSecenekleri(n).forEach((x) => {
          const b = buton(secenek, String(x), img('matematik/ceren/rakam-' + x), () => {
            if (kilit || sahneEl.dataset.durum !== 'sor') return;
            if (x !== n) { defter.yanlis(n); yenidenOynat(b, 'kipir'); ipucu(b); bardaklar.forEach((bb, j) => window.setTimeout(() => { if (oturum === token) { yenidenOynat(bb, 'parla'); adediOku(j + 1); } }, 300 + j * 650)); return; }
            defter.dogru(n);
            durum('dogru');
            b.classList.add('dogru');
            oyunSesi('miknatis');
            timer = window.setTimeout(bitir, 700);
          }, 'parca as-rakam');
          void b;
        });
        return;
      }
      bardaklar[i].innerHTML = bardakHTML('dolu');
      oyunSesi('damla');
      i++;
      if (i === Math.ceil(n / 2)) surahi.innerHTML = yeniResim('surahi', 'surahi-yarim', 'as-resim', 'sürahi');
      timer = window.setTimeout(doldur, 750);
    };
    timer = window.setTimeout(doldur, 500);
  }
  function bitir() {
    anne.dataset.poz = '1';
    tamam(sozler[S.bitti]);
  }
  metin = sozler[S.yonerge];
  if (sesli) soyle(metin);
  doldurma();
}

/**
 * Babaanne'nin Bütün ve Yarımı (M26; kesre giriş): kesme tahtasında bütün bir yiyecek; çocuk ortasına dokunur, tahta bıçak
 * keser, iki yarım ayrılır ("İki yarım!"). Sonra yarımlardan birine dokununca ikisi birleşir ("Bir bütün!"). 4 yaşta iki
 * yiyecek; 5+ yaşta bir yiyecekten sonra tahtada yarımlar (2–4) ve "Bu yarımlar kaç bütün eder?". Kayıt tutmaz.
 */
function butunVeYarim(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.yarim;
  const yol = tekrarYolu();
  const tur = yarimTuru(yol, t.tekrar ?? 0, turunZorlari(t));
  const fon = yeniCizim('yarim', 'kesme-tahtasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('by-sahne');
  const babaanne = document.createElement('div');
  babaanne.className = 'by-babaanne';
  babaanne.dataset.poz = '0';
  babaanne.innerHTML = yeniResim('yarim', 'babaanne-yarim-0', 'by-poz by-poz-0', 'Babaanne') + yeniResim('yarim', 'babaanne-yarim-1', 'by-poz by-poz-1', 'Babaanne alkışlar');
  // Uzattığı el ekran kenarından içeride kalsın (el tuvalde x 520): ölçek 0,85, ayak tabanı y 920 (masanın önü).
  fonaYerlestir(babaanne, 1150, 342, 510, 595);
  const tahta = document.createElement('div');
  tahta.className = 'by-tahta';
  sahneEl.append(tahta, babaanne);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  let no = 0;
  // Tahta x 420…1250, y 360…800; yiyecek (360 × 360) ortada.
  function yiyecek() {
    if (oturum !== token) return;
    if (no >= tur.bol.length) { if (tur.kacYarim) kacButun(); else bitir(); return; }
    const y = tur.bol[no];
    tahta.replaceChildren();
    sahneEl.dataset.yiyecek = y;
    const butun = buton(tahta, 'Bütün ' + y, yeniResim('yarim', y + '-butun', 'by-resim', y), () => kes(), 'by-butun');
    fonaYerlestir(butun, 655, 400, 360, 360);
    durum('kes');
    metin = sozler[S.bol];
    soyle(metin);
    function kes() {
      if (kilit || sahneEl.dataset.durum !== 'kes') return;
      durum('kesiyor');
      const bicak = document.createElement('div');
      bicak.className = 'by-bicak';
      bicak.innerHTML = yeniResim('yarim', 'tahta-bicak', 'by-resim', 'bıçak');
      fonaYerlestir(bicak, 835 - 40, 330, 300, 90);
      tahta.append(bicak);
      oyunSesi('kutu');
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        bicak.remove();
        butun.remove();
        const yarimlar = (['sol', 'sag'] as const).map((taraf) => {
          // Yarımlar bütünle aynı tuvalde; düğme yalnız kendi yarısı (resim içinde tuvalin yerinde kalır).
          const b = buton(tahta, (taraf === 'sol' ? 'Sol' : 'Sağ') + ' yarım', yeniResim('yarim', y + '-' + taraf, 'by-resim', y + ' ' + taraf), () => birlestir(), 'by-yarim by-' + taraf);
          fonaYerlestir(b, taraf === 'sol' ? 655 : 835, 400, 180, 360);
          return b;
        });
        requestAnimationFrame(() => yarimlar.forEach((b) => b.classList.add('ayrik')));
        durum('ayrik');
        soyle(sozler[S.ikiYarim]);
        sozBitince(() => { timer = window.setTimeout(() => { if (oturum !== token) return; soyle(sozler[S.birlestir]); durum('birlestir'); }, 300); }, 3000);
        function birlestir() {
          if (kilit || sahneEl.dataset.durum !== 'birlestir') return;
          durum('birlesti');
          yarimlar.forEach((b) => b.classList.remove('ayrik'));
          oyunSesi('miknatis');
          timer = window.setTimeout(() => {
            if (oturum !== token) return;
            soyle(sozler[S.birButun]);
            babaanne.dataset.poz = '1';
            sozBitince(() => { timer = window.setTimeout(() => { babaanne.dataset.poz = '0'; no++; yiyecek(); }, 500); }, 3000);
          }, 500);
        }
      }, 700);
    }
  }
  function kacButun() {
    // Tahtada yarımlar çiftler hâlinde; "kaç bütün eder?"
    const y = tur.bol[0], n = tur.kacYarim;
    tahta.replaceChildren();
    sahneEl.dataset.yarim = String(n);
    // Çiftler tahtanın (x 420…1250) ortasında; altı yarımda biraz küçük.
    const boy = n > 4 ? 200 : 250, ara = n > 4 ? 270 : 330, x0 = 835 - (ara * (n / 2 - 1) + boy + 30) / 2;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'by-kucuk-yarim';
      const cift = Math.floor(i / 2), taraf = i % 2 ? 'sag' : 'sol';
      fonaYerlestir(el, x0 + cift * ara + (taraf === 'sag' ? 30 : 0), 450 + (250 - boy) / 2, boy, boy);
      el.innerHTML = yeniResim('yarim', y + '-' + taraf, 'by-resim', y + ' yarım');
      tahta.append(el);
    }
    durum('sor');
    metin = sozler[S.kacButun];
    soyle(metin);
    const secenek = document.createElement('div');
    secenek.className = 'by-secenek';
    tahta.append(secenek);
    const defter = sayiDefteri();
    [1, 2, 3].forEach((x) => {
      const b = buton(secenek, String(x), img('matematik/ceren/rakam-' + x), () => {
        if (kilit || sahneEl.dataset.durum !== 'sor') return;
        if (x !== n / 2) { yenidenOynat(b, 'kipir'); ipucu(b); defter.yanlis(n / 2); return; }
        defter.dogru(n / 2);
        durum('dogru');
        b.classList.add('dogru');
        tahta.querySelectorAll('.by-kucuk-yarim').forEach((el) => el.classList.add('birlesik'));
        oyunSesi('miknatis');
        timer = window.setTimeout(bitir, 900);
      }, 'parca by-rakam');
    });
  }
  function bitir() {
    babaanne.dataset.poz = '1';
    tamam(sozler[S.afiyet]);
  }
  void sesli;
  yiyecek();
}

/**
 * Kino'nun Günü (M27; zaman sırası): duvarda üç çerçeve (doğan güneş, tepede güneş, ay); rafta karışık kartlar. Çocuk sıradaki
 * çerçeveye uyan kartı seçer, kart çerçeveye uçar, Ceren anlatır ("Önce sabah: Kino uyanıyor."). Yanlış kart sallanır, "Bir
 * daha düşün: hangisi önce olur?". 2–3 yaş gündüz ve gece (iki çerçeve), 4 yaş sabah-öğlen-akşam, 5+ sonra kardan adam
 * sırası. Bir dizide ilk yanlış konu defterine (ölçü: zaman sırası). Kayıt tutmaz.
 */
function kinonunGunu(t: Tur, sesli: boolean) {
  const S = YENI_SOZ.gun;
  const yol = tekrarYolu();
  // Gelişe göre diziler ve rafta öbür diziden bir çeldirici kart (derinlik.ts).
  const gt = gunTuru(yol, t.tekrar ?? 0), diziler = gt.diziler;
  const ANLAT: Record<GunKarti, number> = { uyanma: S.sabah, oyun: S.oglen, uyku: S.aksam, 'kar-yagiyor': S.kar, 'kardan-adam': S.kardanAdam, eriyor: S.eridi };
  // İki kartlık dizi gündüz ve gece anlatılır.
  const anlat = (c: GunKarti, uzunluk: number) => (uzunluk === 2 && c === 'oyun' ? S.gunduz : uzunluk === 2 && c === 'uyku' ? S.gece : ANLAT[c]);
  const fon = yeniCizim('gun', 'zaman-duvari');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('kg-sahne');
  const kino = document.createElement('div');
  kino.className = 'kg-kino';
  kino.dataset.poz = '0';
  kino.innerHTML = yeniResim('gun', 'kino-gun-0', 'kg-poz kg-poz-0', 'Kino') + yeniResim('gun', 'kino-gun-1', 'kg-poz kg-poz-1', 'Kino sevinir');
  fonaYerlestir(kino, 1250, 470, 300, 360);
  const duvar = document.createElement('div');
  duvar.className = 'kg-duvar';
  const raf = document.createElement('div');
  raf.className = 'kg-raf';
  sahneEl.append(duvar, raf, kino);
  // Çerçeve içleri (fon): x 180…560, 646…1026, 1112…1492; y 150…450. 2–3 yaşta ilk ve son çerçeve (gündüz, gece).
  const CERCEVE = [180, 646, 1112];
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  let di = 0;
  function kur() {
    const dizi = diziler[di];
    const yerler = dizi.length === 2 ? [CERCEVE[1], CERCEVE[2]] : CERCEVE;
    duvar.replaceChildren();
    raf.replaceChildren();
    sahneEl.dataset.dizi = String(di);
    kino.dataset.poz = '0';
    let sira = 0, yanlis = false;
    sahneEl.dataset.sira = '0';
    const kartHTML = (c: GunKarti) => yeniResim('gun', 'kart-' + c, 'kg-resim', c);
    const raftakiler = gunKarisik(dizi, t.tekrar ?? 0);
    if (gt.celdirici) raftakiler.splice(((t.tekrar ?? 0) + di) % (raftakiler.length + 1), 0, gunCeldirici(dizi, (t.tekrar ?? 0) + di));
    raftakiler.forEach((c, i, hepsi) => {
      const b = buton(raf, c.replace('-', ' '), kartHTML(c), () => sec(c, b), 'kg-kart');
      b.dataset.yer = String(dizi.indexOf(c));
      // Dört kartta biraz küçük ve sola kayık (Kino'nun önüne binmez).
      const w = hepsi.length > 3 ? 250 : 300, ara = hepsi.length > 3 ? 30 : 40, merkez = hepsi.length > 3 ? 690 : 760;
      const bas = merkez - (hepsi.length * w + (hepsi.length - 1) * ara) / 2;
      fonaYerlestir(b, bas + i * (w + ara), 620, w, w * 280 / 360);
    });
    durum('sec');
    metin = sozler[dizi.length === 2 ? S.gunduzGece : S.sirala];
    soyle(metin);
    function sec(c: GunKarti, b: HTMLButtonElement) {
      if (kilit || sahneEl.dataset.durum !== 'sec') return;
      if (c !== dizi[sira]) {
        if (!yanlis) { yanlis = true; konudaZorlandi(yol, 'olcu', 'zaman'); }
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[S.ipucu]);
        return;
      }
      durum('anlat');
      const yer = document.createElement('div');
      yer.className = 'kg-yer';
      fonaYerlestir(yer, yerler[sira], 150, 380, 300);
      yer.innerHTML = kartHTML(c);
      duvar.append(yer);
      yerineOtur(b.getBoundingClientRect(), yer.firstElementChild);
      b.remove();
      oyunSesi('kagit');
      sira++;
      sahneEl.dataset.sira = String(sira);
      soyle(sozler[anlat(c, dizi.length)]);
      sozBitince(() => {
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          if (sira < dizi.length) { durum('sec'); return; }
          if (!yanlis) konudaBasardi(yol, 'olcu', 'zaman');
          // Dizi tamam: kartlar sırayla parlar, Kino sevinir.
          kino.dataset.poz = '1';
          oyunSesi('parilti');
          duvar.querySelectorAll('.kg-yer').forEach((el, i) => window.setTimeout(() => { if (oturum === token) yenidenOynat(el, 'parla'); }, i * 350));
          timer = window.setTimeout(() => {
            if (oturum !== token) return;
            if (di + 1 >= diziler.length) { tamam(sozler[S.bitti]); return; }
            di++;
            kur();
          }, 1600);
        }, 300);
      }, 3500);
    }
  }
  void sesli;
  kur();
}
/** Sayıyı Ceren'in sesiyle okur: 1–20 (oyuncak ve 11–20 dersi kayıtları), 25 ve onlar (30…100; ritim-pay.ts). */
function sayiyiSoyle(n: number) {
  if (n <= 20) { sayiyiOku(n); return; }
  const i = n === 25 ? YIRMI_BES_SOZ : n === 35 ? OTUZ_BES_SOZ : ONLU_SOZ[n];
  if (i !== undefined) soyle(sozler[i]);
}

/**
 * Roket Geri Sayımı (M30; 4 yaş ve 5+; geriye sayma): rampada roket, sağda karışık rakam blokları. Çocuk en büyüğünden
 * başlayarak blokları sırayla üstteki geri sayım panosuna dizer; Ceren her sayıyı söyler, roket her adımda biraz daha
 * titrer. 20'den sayarken 11'den sonrasını Ceren'le birlikte sayarlar (bloklar panoya kendiliğinden gelir). Sıfırda roket
 * alevle kalkar, Mino sevinir. Yanlış blok sallanır: "her seferinde bir eksik". Kayıt: t.secimler biten kalkışlar.
 */
function roketGeriSayimi(t: Tur, sesli: boolean) {
  const S = ROKET_SOZ;
  const sayimlar = geriSayimlar(tekrarYolu(), t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const fon = yeniCizim('roket', 'roket-alani');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('rg-sahne');
  const pano = document.createElement('div');
  pano.className = 'rg-pano';
  const bloklar = document.createElement('div');
  bloklar.className = 'rg-bloklar';
  const roket = document.createElement('div');
  roket.className = 'rg-roket';
  roket.innerHTML = yeniResim('roket', 'alev', 'rg-alev', '') + yeniResim('roket', 'roket', 'rg-roket-resim', 'Roket');
  const duman = document.createElement('div');
  duman.className = 'rg-duman';
  duman.innerHTML = yeniResim('roket', 'duman', 'rg-resim', '');
  const mino = document.createElement('div');
  mino.className = 'rg-mino';
  mino.dataset.poz = '0';
  mino.innerHTML = yeniResim('roket', 'mino-kask-0', 'rg-poz rg-poz-0', 'Mino') + yeniResim('roket', 'mino-kask-1', 'rg-poz rg-poz-1', 'Mino sevinir');
  sahneEl.append(pano, duman, roket, bloklar, mino);
  // Fon (Astra M30): pano içi x 197…1490, y 165…318 (ölçüldü); platformun üst yüzü y 800 (x 380…760); bloklar roketin
  // sağında x 780…1460, iki sıra; Mino solda. Roket 300 × 600 (taban y 590) 0,75 ölçekte; duman 700 × 240 platformun dibinde.
  // Rakam blokları öbür turlardaki gibi krem blok (124 px: iPad'de 87, telefonda 51 px); panodaki yuvalar aynı boyda.
  const BLOK = 124, YUVA = 122, ARA = 129;
  fonaYerlestir(pano, 197, 165, 1293, 153);
  fonaYerlestir(roket, 560 - 112.5, 800 - 442.5, 225, 450);
  fonaYerlestir(duman, 560 - 270, 820 - 180, 540, 185);
  fonaYerlestir(mino, 0, 900 - 435, 375, 450);
  let si = Math.min(t.secimler.length, sayimlar.length - 1);
  let yuvalar: HTMLElement[] = [];
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const titre = (oran: number) => roket.style.setProperty('--g', String(Math.min(4, Math.ceil(oran * 4))));
  function yuvalariKur(n: number) {
    pano.replaceChildren();
    const bas = (1293 - (n * ARA - (ARA - YUVA))) / 2;
    yuvalar = Array.from({ length: n }, (_, i) => {
      const y = document.createElement('div');
      y.className = 'rg-yuva';
      y.style.left = ((bas + i * ARA) / 12.93) + '%';
      y.style.width = (YUVA / 12.93) + '%';
      y.style.top = (((153 - YUVA) / 2) / 1.53) + '%';
      y.style.height = (YUVA / 1.53) + '%';
      pano.append(y);
      return y;
    });
  }
  function kur() {
    const g = sayimlar[si];
    sahneEl.dataset.kalkis = String(si);
    roket.classList.remove('kalk');
    duman.classList.remove('tut');
    mino.dataset.poz = '0';
    titre(0);
    yuvalariKur(g.dizilen.length);
    let yerlesen = 0;
    sahneEl.dataset.yerlesen = '0';
    bloklar.replaceChildren();
    const sira = karisikBloklar(g.dizilen, t.tekrar ?? 0);
    // İki sıra: on blok 5 + 5, beş ya da altı blok 3 + 3; roketin sağındaki boşluğun ortasında.
    const sutun = sira.length > 6 ? 5 : 3, w = Math.min(170, 680 / sutun);
    sira.forEach((x, i) => {
      const b = buton(bloklar, String(x), '<span class="rg-blok-ic">' + rakamBloklari(x) + '</span>', () => sec(x, b), 'rg-blok');
      const sira0 = Math.floor(i / sutun), adet = Math.min(sutun, sira.length - sira0 * sutun), x0 = 780 + (680 - w * adet) / 2;
      fonaYerlestir(b, x0 + (i % sutun) * w + (w - BLOK) / 2, 420 + sira0 * 185, BLOK, BLOK);
    });
    durum('goster');
    metin = sozler[si === 0 ? S.yonerge : S.ikinci];
    soyle(metin);
    sozBitince(() => { if (oturum === token) durum('sec'); }, 6000);
    function sec(x: number, b: HTMLButtonElement) {
      if (kilit || sahneEl.dataset.durum !== 'sec') return;
      if (x !== siradakiBlok(g.dizilen, yerlesen)) {
        defter.yanlis(siradakiBlok(g.dizilen, yerlesen));
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[S.ipucu]);
        return;
      }
      defter.dogru(x);
      const yuva = yuvalar[yerlesen];
      yuva.innerHTML = rakamBloklari(x);
      yuva.classList.add('dolu');
      yerineOtur(b.getBoundingClientRect(), yuva);
      b.remove();
      yerlesen++;
      sahneEl.dataset.yerlesen = String(yerlesen);
      titre(yerlesen / (g.dizilen.length + g.ceren.length));
      oyunSesi('miknatis');
      sayiyiOku(x);
      if (yerlesen < g.dizilen.length) return;
      durum('say');
      sozBitince(() => { if (oturum !== token) return; if (g.ceren.length) cerenleSay(); else kalkis(); }, 2500);
    }
    function cerenleSay() {
      soyle(sozler[S.birlikte]);
      sozBitince(() => {
        if (oturum !== token) return;
        yuvalariKur(g.ceren.length);
        sirayla(g.ceren.map((x, i) => () => {
          yuvalar[i].innerHTML = rakamBloklari(x);
          yuvalar[i].classList.add('dolu');
          yenidenOynat(yuvalar[i], 'parla');
          titre((g.dizilen.length + i + 1) / (g.dizilen.length + g.ceren.length));
          sayiyiOku(x);
        }), kalkis, 60);
      }, 4000);
    }
    function kalkis() {
      if (oturum !== token) return;
      durum('kalkis');
      adediOku(0);
      sozBitince(() => {
        if (oturum !== token) return;
        soyle(sozler[S.kalkis]);
        roket.classList.add('kalk');
        duman.classList.add('tut');
        mino.dataset.poz = '1';
        oyunSesi('parilti');
        t.secimler.push(si);
        kaydet(k);
        timer = window.setTimeout(() => {
          if (oturum !== token) return;
          if (si + 1 >= sayimlar.length) { durum('bitti'); tamam(sozler[S.bitti]); return; }
          si++;
          kur();
        }, 3200);
      }, 2000);
    }
  }
  void sesli;
  kur();
}

/**
 * Kelebeğin Kanadı (M31; 4 yaş ve 5+; simetri): kocaman kelebeğin sol kanadında benekler, sağ kanat boş. Sağ kanadın
 * benek yerleri soluk halka; çocuk aynasını kurar (4 yaş tek renk, 5+ önce rengi seçer). Yanlış yere konan benek oturmaz,
 * düşüp kaybolur. Kanatlar aynı olunca kelebek kanat çırpıp uçar, Lokum sevinir; sonra ikinci kelebek gelir.
 * Kayıt: t.secimler biten kelebekler.
 */
function kelebeginKanadi(t: Tur, sesli: boolean) {
  const S = KELEBEK_SOZ;
  const desenler = kelebekDesenleri(tekrarYolu(), t.tekrar ?? 0);
  const fon = yeniCizim('kelebek', 'cicek-cayiri');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('kk-sahne');
  const kelebek = document.createElement('div');
  kelebek.className = 'kk-kelebek';
  const sol = document.createElement('div');
  sol.className = 'kk-kanat sol';
  const sag = document.createElement('div');
  sag.className = 'kk-kanat sag';
  const govde = document.createElement('div');
  govde.className = 'kk-govde';
  govde.innerHTML = yeniResim('kelebek', 'kelebek-govde', 'kk-resim', 'Kelebek');
  kelebek.append(sol, sag, govde);
  // Benek yerleri bitişik ve küçük (telefonda 21–46 px): kanada dokunuş parmağa en yakın boş yere gider (70 px içinde),
  // halkaların üst üste bindiği yerde de en yakını kazanır.
  sag.addEventListener('click', (e) => {
    if (sahneEl.dataset.durum !== 'koy') return;
    let en: HTMLButtonElement | null = null, d = 70;
    for (const h of sag.querySelectorAll<HTMLButtonElement>('.kk-hedef:not(:disabled)')) {
      const q = h.getBoundingClientRect();
      const u = Math.hypot(e.clientX - (q.left + q.width / 2), e.clientY - (q.top + q.height / 2));
      if (u < d) { d = u; en = h; }
    }
    if (!en || en === (e.target as Element).closest('.kk-hedef')) return;
    e.stopPropagation();
    // Doğru parıltısı parmağın gittiği benek yerinde çıksın.
    sonDokunulan = en;
    sonDokunma = performance.now();
    en.click();
  }, true);
  const renkler = document.createElement('div');
  renkler.className = 'kk-renkler';
  const lokum = document.createElement('div');
  lokum.className = 'kk-lokum';
  lokum.dataset.poz = '0';
  lokum.innerHTML = yeniResim('kelebek', 'lokum-kelebek-0', 'kk-poz kk-poz-0', 'Lokum') + yeniResim('kelebek', 'lokum-kelebek-1', 'kk-poz kk-poz-1', 'Lokum sevinir');
  sahneEl.append(kelebek, renkler, lokum);
  // Kelebek 1,3 ölçekte (kalite denetimi 22: telefonda iri; ekran yüksekliğinin ~%77'si), gövde ekseni x 770: kanatlar
  // (400 × 560) gövdenin (210 × 560; antenler kıvrık) iki yanına, x 223…1317, y 60…788. Kanadın düz bağlantı kenarı
  // eksenden 26 px: gövdenin en dar yeri (boyun) 30 px, kenar hep gövdenin altında kalır. Lokum sağda, büyük (420 × 504),
  // ayak tabanı y 900 (çimende); kanadın ucu onun arkasında kalır, benek yerleri değil.
  const O = 1.3, UST = 60, BAG = 26, EKSEN = 770;
  fonaYerlestir(sol, EKSEN - BAG * O - 395 * O, UST, 400 * O, 560 * O);
  fonaYerlestir(sag, EKSEN + BAG * O - 5 * O, UST, 400 * O, 560 * O);
  fonaYerlestir(govde, EKSEN - 105 * O, UST, 210 * O, 560 * O);
  fonaYerlestir(lokum, 1250, 900 - 490, 420, 504);
  // Boş yere dokunuş: dokunulan yerde küçük pırıltı, "pıt", Lokum hoplar (KALITE-KURALLARI 5).
  sahneEl.addEventListener('pointerdown', (e) => {
    if (kilit || (e.target as Element).closest('button')) return;
    pariltiNokta(kok, e.clientX, e.clientY);
    dokunmaSesi();
    zipla(lokum);
  });
  const benekKonumu = (el: HTMLElement, x: number, y: number) => {
    el.style.left = ((x - 45) / 4) + '%';
    el.style.top = ((y - 45) / 5.6) + '%';
  };
  let ki = Math.min(t.secimler.length, desenler.length - 1);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  function kur() {
    const desen = desenler[ki];
    sahneEl.dataset.kelebek = String(ki);
    sahneEl.dataset.desen = desen.map((b) => b.yer + ':' + b.renk).join(',');
    kelebek.classList.remove('cirp', 'uc', 'gel');
    void kelebek.offsetWidth;
    if (ki > 0) kelebek.classList.add('gel');
    kelebek.classList.add('bos');
    lokum.dataset.poz = '0';
    sol.innerHTML = yeniResim('kelebek', 'kanat-sol', 'kk-resim', 'Sol kanat');
    sag.innerHTML = yeniResim('kelebek', 'kanat-sol', 'kk-resim kk-ayna', 'Sağ kanat');
    for (const b of desen) {
      const el = document.createElement('div');
      el.className = 'kk-benek';
      el.innerHTML = yeniResim('kelebek', 'benek-' + b.renk, 'kk-resim', '');
      benekKonumu(el, BENEK_YERI[b.yer].x, BENEK_YERI[b.yer].y);
      sol.append(el);
    }
    const konan = new Set<number>();
    const ikiRenk = renkSayisi(desen) > 1;
    let secili: BenekRengi | null = ikiRenk ? null : desen[0].renk;
    sahneEl.dataset.renk = secili ?? '';
    sahneEl.dataset.konan = '0';
    renkler.replaceChildren();
    if (ikiRenk) {
      (['mavi', 'turuncu'] as const).forEach((r, i) => {
        const b = buton(renkler, r === 'mavi' ? 'Mavi benek' : 'Turuncu benek', yeniResim('kelebek', 'benek-' + r, 'kk-resim', ''), () => {
          if (sahneEl.dataset.durum !== 'koy') return;
          secili = r;
          sahneEl.dataset.renk = r;
          renkler.querySelectorAll('.kk-renk').forEach((x) => x.classList.toggle('secili', x === b));
          oyunSesi('kagit');
        }, 'kk-renk');
        fonaYerlestir(b, 30, 230 + i * 210, 170, 170);
      });
    }
    BENEK_YERI.forEach((p, yer) => {
      const h = buton(sag, 'Benek yeri ' + (yer + 1), '', () => koy(yer, h), 'kk-hedef');
      benekKonumu(h, aynaX(p.x), p.y);
      h.dataset.yer = String(yer);
    });
    durum('koy');
    metin = sozler[ki === 0 ? S.yonerge : S.yeni];
    sirayla([() => soyle(metin), ...(ikiRenk ? [() => soyle(sozler[S.ikiRenk])] : [])], () => {}, 150);
    function koy(yer: number, h: HTMLButtonElement) {
      if (kilit || sahneEl.dataset.durum !== 'koy') return;
      if (!secili) { yenidenOynat(renkler, 'kipir'); ipucu(renkler, sozler[S.ikiRenk]); return; }
      const el = document.createElement('div');
      el.className = 'kk-benek';
      el.innerHTML = yeniResim('kelebek', 'benek-' + secili, 'kk-resim', '');
      benekKonumu(el, aynaX(BENEK_YERI[yer].x), BENEK_YERI[yer].y);
      if (!benekUyar(desen, yer, secili, konan)) {
        // Oturmaz: konar, sallanır, düşüp kaybolur.
        el.classList.add('duser');
        sag.append(el);
        window.setTimeout(() => el.remove(), 900);
        ipucu(h, sozler[S.ipucu]);
        return;
      }
      el.classList.add('oturdu');
      sag.append(el);
      h.disabled = true;
      konan.add(yer);
      sahneEl.dataset.konan = String(konan.size);
      oyunSesi('miknatis');
      if (konan.size < desen.length) {
        // Lokum her oturan benekte bir an sevinir, Ceren över.
        lokum.dataset.poz = '1';
        ovgu();
        window.setTimeout(() => { if (oturum === token && sahneEl.dataset.durum === 'koy') lokum.dataset.poz = '0'; }, 650);
        return;
      }
      bitti();
    }
    function bitti() {
      durum('uc');
      renkler.replaceChildren();
      kelebek.classList.remove('bos');
      kelebek.classList.add('cirp');
      lokum.dataset.poz = '1';
      oyunSesi('parilti');
      t.secimler.push(ki);
      kaydet(k);
      // Uçarken kanat sesi (pır pır pır): uçuş sessiz geçmez.
      const cirpSesi = () => [0, 220, 440].forEach((ms) => window.setTimeout(() => { if (oturum === token) oyunSesi('kagit'); }, ms));
      if (ki + 1 >= desenler.length) { timer = window.setTimeout(() => { kelebek.classList.add('uc'); cirpSesi(); }, 1400); tamam(sozler[S.uctu]); return; }
      soyle(sozler[S.uctu]);
      sozBitince(() => {
        kelebek.classList.add('uc');
        cirpSesi();
        timer = window.setTimeout(() => { if (oturum !== token) return; ki++; kur(); }, 1200);
      }, 4000);
    }
  }
  void sesli;
  kur();
}

/**
 * Meyve Grafiği (M32; 5+; veri): Dede'nin sepetinde karışık elma, armut, muz. Çocuk her meyveye dokunur, meyve kendi
 * sütununa gider ve Ceren o sütunu sayar; sütunlar boy boy yükselir. Sonra üç soru: en çok hangisi, en az hangisi (sütuna
 * dokunur), biri öbüründen kaç fazla (üç sayı kartı; doğruda fazla olan meyveler parlar). Kayıt: t.secimler cevaplanan sorular
 * (ilk cevaptan sonra meyveler yerinde açılır).
 */
function meyveGrafigi(t: Tur, sesli: boolean) {
  const S = GRAFIK_SOZ;
  const veri = grafikVerisi(t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const fon = yeniCizim('grafik', 'meyve-bahcesi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('mg-sahne');
  sahneEl.dataset.fazla = veri.fazla.join(',');
  const pano = document.createElement('div');
  pano.className = 'mg-pano';
  pano.innerHTML = yeniResim('grafik', 'grafik-panosu', 'mg-resim', 'Grafik panosu');
  const sepet = document.createElement('div');
  sepet.className = 'mg-sepet';
  sepet.innerHTML = yeniResim('grafik', 'meyve-sepeti', 'mg-resim', 'Sepet');
  const yigin = document.createElement('div');
  yigin.className = 'mg-yigin';
  const kartlar = document.createElement('div');
  kartlar.className = 'mg-kartlar';
  const dede = document.createElement('div');
  dede.className = 'mg-dede';
  dede.dataset.poz = '0';
  dede.innerHTML = yeniResim('grafik', 'dede-sepet-0', 'mg-poz mg-poz-0', 'Dede') + yeniResim('grafik', 'dede-sepet-1', 'mg-poz mg-poz-1', 'Dede alkışlar');
  sahneEl.append(pano, dede, sepet, yigin, kartlar);
  // Pano (760 × 760) 0,95 ölçekte sağda; şeritler x 70…250, 290…470, 510…690, dibi y 610, meyve yeri 90 px; etiketler
  // y 625…705. Sepet (380 × 260, taban y 255) çimende, Dede solunda (ayak tabanı y 880).
  fonaYerlestir(pano, 760, 66, 722, 722);
  fonaYerlestir(sepet, 350, 820 - 255, 380, 260);
  fonaYerlestir(dede, 0, 880 - 406, 350, 420);
  const SUTUN_X = [70, 290, 510];
  const sutunlar = MEYVELER.map((m, i) => {
    const etiket = document.createElement('div');
    etiket.className = 'mg-etiket';
    etiket.innerHTML = yeniResim('grafik', m + '-grafik', 'mg-resim', '');
    etiket.style.left = ((SUTUN_X[i] + 50) / 7.6) + '%';
    pano.append(etiket);
    const b = buton(pano, m === 'elma' ? 'Elma sütunu' : m === 'armut' ? 'Armut sütunu' : 'Muz sütunu', '', () => sutunaDokun(m, b), 'mg-sutun');
    b.style.left = (SUTUN_X[i] / 7.6) + '%';
    b.dataset.meyve = m;
    return b;
  });
  const dizilen: Record<Meyve, HTMLElement[]> = { elma: [], armut: [], muz: [] };
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const sutunaKoy = (m: Meyve) => {
    const i = MEYVELER.indexOf(m), n = dizilen[m].length;
    const el = document.createElement('div');
    el.className = 'mg-meyve';
    el.innerHTML = yeniResim('grafik', m + '-grafik', 'mg-resim', '');
    el.style.left = ((SUTUN_X[i] + 45) / 7.6) + '%';
    el.style.top = ((610 - 90 * (n + 1) + 2) / 7.6) + '%';
    pano.append(el);
    dizilen[m].push(el);
    sahneEl.dataset.sayilar = MEYVELER.map((x) => dizilen[x].length).join(',');
    return el;
  };
  const sorular = ['cok', 'az', 'fazla'] as const;
  let soru = Math.min(t.secimler.length, sorular.length);
  if (soru > 0) {
    MEYVELER.forEach((m) => { for (let i = 0; i < veri.sayilar[m]; i++) sutunaKoy(m); });
    sor();
  } else {
    const sira = sepetSirasi(veri.sayilar);
    sira.forEach((m, i) => {
      const b = buton(yigin, m === 'elma' ? 'Elma' : m === 'armut' ? 'Armut' : 'Muz', yeniResim('grafik', m + '-grafik', 'mg-resim', ''), () => diz(m, b), 'mg-sepetteki');
      // Sepetin ağzında üç sıra, sıra başına beş meyve (alttaki sıra sepetin ağzına oturur).
      const sirada = Math.floor(i / 5), x = 380 + (i % 5) * 66 + (sirada % 2) * 33;
      fonaYerlestir(b, x, 600 - sirada * 72, 96, 96);
    });
    durum('diz');
    metin = sozler[S.yonerge];
    soyle(metin);
  }
  function diz(m: Meyve, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.durum !== 'diz') return;
    const bas = b.getBoundingClientRect();
    b.remove();
    const el = sutunaKoy(m);
    yerineOtur(bas, el);
    oyunSesi('damla');
    sayiyiOku(dizilen[m].length);
    if (yigin.childElementCount > 0) return;
    durum('bekle');
    sozBitince(() => { if (oturum === token) timer = window.setTimeout(sor, 400); }, 2500);
  }
  function sor() {
    if (oturum !== token) return;
    kartlar.replaceChildren();
    sutunlar.forEach((s) => s.classList.remove('parla'));
    if (soru >= sorular.length) return;
    const q = sorular[soru];
    sahneEl.dataset.soru = q;
    if (q === 'fazla') {
      const dogru = kacFazla(veri);
      fazlaSecenekleri(dogru).forEach((x, i) => {
        const b = buton(kartlar, String(x), '<span class="mg-kart-ic">' + rakamBloklari(x) + '</span>', () => fazlaSec(x, b), 'mg-kart');
        fonaYerlestir(b, 380 + i * 125, 690, 110, 110);
      });
    }
    durum(q);
    metin = sozler[q === 'cok' ? S.enCok : q === 'az' ? S.enAz : FAZLA_SORUSU[veri.fazla.join('-')]];
    soyle(metin);
  }
  function dogruCevap(sonra?: () => void) {
    t.secimler.push(soru);
    kaydet(k);
    soru++;
    oyunSesi('parilti');
    durum('dogru');
    if (soru >= sorular.length) { dede.dataset.poz = '1'; tamam(sozler[S.bitti]); return; }
    sonra?.();
    soyle(sozler[S.dogru]);
    sozBitince(() => { timer = window.setTimeout(sor, 300); }, 4000);
  }
  function sutunaDokun(m: Meyve, b: HTMLButtonElement) {
    const q = sahneEl.dataset.durum;
    if (kilit || (q !== 'cok' && q !== 'az')) return;
    const dogru = q === 'cok' ? enCok(veri.sayilar) : enAz(veri.sayilar);
    if (m !== dogru) { yenidenOynat(b, 'kipir'); ipucu(b, sozler[q === 'cok' ? S.ipucuCok : S.ipucuAz]); return; }
    b.classList.add('parla');
    dizilen[m].forEach((el) => yenidenOynat(el, 'parla'));
    dogruCevap();
  }
  function fazlaSec(x: number, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.durum !== 'fazla') return;
    const dogru = kacFazla(veri);
    if (x !== dogru) { defter.yanlis(dogru); yenidenOynat(b, 'kipir'); ipucu(b, sozler[S.ipucuFazla]); return; }
    defter.dogru(dogru);
    // Büyük sütunun küçük sütunun boyunu aşan meyveleri parlar.
    const [buyuk, kucuk] = veri.fazla;
    dizilen[buyuk].slice(veri.sayilar[kucuk]).forEach((el) => el.classList.add('fazla'));
    dogruCevap();
  }
  void sesli;
}

/** Sahnedeki bir ekran noktasının Astra fonundaki pikseli (fon 1672 genişlikli, sahnenin sol üstünden). */
function fonNoktasi(sahneEl: Element, x: number, y: number) {
  const r = sahneEl.getBoundingClientRect();
  return { x: ((x - r.left) * 1672) / r.width, y: ((y - r.top) * 1672) / r.width };
}

/**
 * Lokum'la Saklambaç (M33; konum sözcükleri; Şekil evi, her yaş). Çocuk ebedir: ekran kararır (gözler kapalı), Ceren'le
 * üçe kadar sayılır, Lokum bir yere saklanır. Ceren nerede olduğunu söyler ("Lokum masanın altında!"); çocuk o yere dokunur,
 * Lokum oradan çıkar ("Sobe!"). Yanlış yerde "Orada yok!" ve söz yinelenir; ikinci yanlışta doğru yer parlar. Sonra oda
 * toplanır: "Topu sandığın içine koy." Çocuk eşyayı sürükler ya da önce eşyaya, sonra yere dokunur; yanlış yer ya da yanlış
 * eşya geri döner. Her işin ilk yanlışı konu defterine (konum:<ilişki>) yazılır, sonraki gelişte o konum öne alınır.
 * Kayıt: t.secimler biten işler (önce iki bulma, sonra koymalar); yarıda kalan tur kaldığı işten sürer.
 */
function lokumlaSaklambac(t: Tur, sesli: boolean) {
  const S = SAKLAMBAC_SOZ;
  const yol = tekrarYolu();
  if (!t.planZor) {
    t.planZor = t.secimler.length ? [] : zorKonular(yol).filter((z) => z.alan === 'konum').map((z) => iliskiNo(z.konu as Iliski)).filter((i) => i >= 0).slice(0, 2);
    kaydet(k);
  }
  const tur = saklambacTuru(yol, t.tekrar ?? 0, t.planZor);
  const fon = yeniCizim('saklambac', 'lokum-odasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sonra = (ms: number, fn: () => void) => { timer = window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  const sahneEl = alan('sk-sahne');
  sahneEl.dataset.bul = tur.bul.join(',');
  sahneEl.dataset.koy = tur.koy.join(',');
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const kat = (cls: string, z: number, kutu?: { x: number; y: number; w: number; h: number }, ic = '') => {
    const el = document.createElement('div');
    el.className = cls;
    el.style.zIndex = String(z);
    el.innerHTML = ic;
    if (kutu) fonaYerlestir(el, kutu.x, kutu.y, kutu.w, kutu.h);
    sahneEl.append(el);
    return el;
  };
  // Katlar (arkadan öne): sandığın arka yüzü, sandığın içi (kırpılır), sandığın ön yüzü; berjerin arkası, berjer; masanın
  // altı, masa; minderlerin arası (kırpılır), minderler; yerdeki eşyalar; ayaktaki Lokum; dokunma alanları; göz karartısı.
  const Y = YER_KUTUSU;
  const ciz = (ad: string) => yeniResim('saklambac', ad, 'sk-resim', ad);
  kat('sk-cizim', 1, Y.sandik, ciz('sandik-arka'));
  const sandikIci = kat('sk-kirp', 2, KIRPMA.sandik);
  const sandikOn = kat('sk-cizim', 3, Y.sandik, ciz('sandik-on'));
  const koltukArkasi = kat('sk-kat', 4);
  const koltuk = kat('sk-cizim', 5, Y.koltuk, ciz('koltuk'));
  const masaAlti = kat('sk-kat', 6);
  const masa = kat('sk-cizim', 7, Y.masa, ciz('masa'));
  const minderArasi = kat('sk-kirp', 8, KIRPMA.minder);
  const minderler = kat('sk-cizim', 9, Y.minder, ciz('minderler'));
  const on = kat('sk-kat', 10);
  const cizimler: Record<Yer, HTMLElement> = { sandik: sandikOn, masa, koltuk, minder: minderler };
  for (const el of Object.values(cizimler)) el.style.transformOrigin = '50% 100%';
  const lokum = document.createElement('div');
  lokum.className = 'sk-lokum';
  lokum.innerHTML = (['cik', 'emekle', 'bak', 'sevinc'] as const).map((p) => yeniResim('saklambac', 'lokum-' + p, 'sk-poz sk-poz-' + p, 'Lokum')).join('');
  const gozler = kat('sk-gozler', 20);
  // Lokum'un bir yerdeki katı ve o katın içinde nereye konacağı (kırpılan katta konum kırpmanın köşesinden).
  const yerKati: Record<Yer, HTMLElement> = { sandik: sandikIci, masa: masaAlti, koltuk: koltukArkasi, minder: minderArasi };
  const katKosesi = (el: HTMLElement) => (el === sandikIci ? KIRPMA.sandik! : el === minderArasi ? KIRPMA.minder! : { x: 0, y: 0 });
  const katta = (el: HTMLElement, hedef: HTMLElement, b: { x: number; y: number; w: number; h: number }) => {
    if (el.parentElement !== hedef) hedef.append(el);
    const o = katKosesi(hedef);
    fonaYerlestir(el, b.x - o.x, b.y - o.y, b.w, b.h);
  };
  const lokumKoy = (poz: string, hedef: HTMLElement, b: { x: number; y: number; w: number; h: number }, kaysin = false) => {
    lokum.classList.toggle('kayar', kaysin);
    lokum.dataset.poz = poz;
    katta(lokum, hedef, b);
  };

  const isSayisi = tur.bul.length + tur.koy.length;
  let is = Math.min(t.secimler.length, isSayisi);
  let yanlis = 0;
  // Dokunma: arama sırasında dört yer (çizimin kutusu), toplamada sahnenin her yeri (eşya bırakma noktası).
  const yerler = YERLER.map((y) => {
    const b = buton(sahneEl, { sandik: 'Sandık', masa: 'Masa', koltuk: 'Koltuk', minder: 'Minderler' }[y], '', () => yerSec(y), 'sk-yer');
    b.dataset.yer = y;
    b.style.zIndex = '15';
    fonaYerlestir(b, Y[y].x, Y[y].y, Y[y].w, Y[y].h);
    b.addEventListener('pointerdown', () => {
      if (kilit || sahneEl.dataset.durum !== 'bul' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      cizimler[y].animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(1.02, .96)', offset: .4 }, { transform: 'scale(1, 1)' }], { duration: 220, easing: 'ease-out', composite: 'add' });
    });
    return b;
  });
  void yerler;

  // ----- 1 · Lokum'u bul -----
  function saklan() {
    if (is >= tur.bul.length) { toplamaya(); return; }
    const rel = tur.bul[is], yer = SAKLANMA_YERI[rel];
    yanlis = 0;
    sahneEl.dataset.is = String(is);
    sahneEl.dataset.rel = rel;
    durum('gozler');
    metin = sozler[S.gozler];
    // İlk turda Lokum önce odada görünür ve sevinir ("Lokum'la saklambaç oynayalım!"); sonra gözler kapanır, sayarken saklanır.
    const ilk = is === 0 && !t.secimler.length;
    if (ilk) { lokumKoy('sevinc', on, LOKUM_AYAKTA); yenidenOynat(lokum, 'sevin'); }
    const parcalar = [...(ilk ? [() => soyle(sozler[S.giris])] : []), () => { gozler.classList.add('kapali'); soyle(sozler[S.gozler]); },
      () => { lokumKoy(LOKUM_POZU[yer], yerKati[yer], LOKUM_SAKLI[yer]); adediOku(1); }, () => adediOku(2), () => adediOku(3)];
    sirayla(parcalar, () => {
      gozler.classList.remove('kapali');
      soyle(sozler[S.ac]);
      sozBitince(() => sonra(200, () => { durum('bul'); metin = sozler[S.bul[rel]]; soyle(metin); }), 3000);
    }, 150);
  }
  function yerSec(y: Yer) {
    if (kilit || sahneEl.dataset.durum !== 'bul') return;
    const rel = tur.bul[is], dogru = SAKLANMA_YERI[rel];
    if (y !== dogru) {
      if (!yanlis) konudaZorlandi(yol, 'konum', rel);
      yanlis++;
      yenidenOynat(cizimler[y], 'kipir');
      yanlisSesi();
      durum('dinle');
      sirayla([() => soyle(sozler[S.yok]), () => soyle(sozler[S.bul[rel]])], () => {
        durum('bul');
        if (yanlis >= 2) yenidenOynat(cizimler[dogru], 'parla');
      }, 150);
      return;
    }
    if (!yanlis) konudaBasardi(yol, 'konum', rel);
    durum('buldu');
    // Lokum saklandığı yerden çıkar: sandıktan ve minderlerin arasından yükselir, masanın altından emekler, berjerin
    // arkasından eğilip bakar.
    lokumKoy(LOKUM_POZU[y], yerKati[y], LOKUM_CIKTI[y], true);
    oyunSesi('parilti');
    soyle(sozler[S.buldun[rel]]);
    t.secimler.push(is);
    kaydet(k);
    is++;
    sozBitince(() => sonra(700, saklan), 4000);
  }

  // ----- 2 · Odayı topla -----
  const oyuncaklar: Partial<Record<Oyuncak, HTMLButtonElement>> = {};
  let secili: Oyuncak | null = null;
  function oyuncakKur(o: Oyuncak) {
    const b = buton(on, o === 'top' ? 'Top' : 'Ayıcık', yeniResim('saklambac', o, 'sk-resim', o === 'top' ? 'top' : 'ayıcık'), () => {}, 'sk-oyuncak');
    b.dataset.oyuncak = o;
    b.style.zIndex = '12';
    fonaYerlestir(b, OYUNCAK_BASI[o].x, OYUNCAK_BASI[o].y, OYUNCAK_BASI[o].w, OYUNCAK_BASI[o].h);
    oyuncaklar[o] = b;
    // Sürükle-bırak ya da dokun-seç: kısa dokunuş eşyayı seçer, sonra sahnede bir yere dokunulur.
    let id = -1, x0 = 0, y0 = 0, oynadi = false;
    b.onpointerdown = (e) => {
      if (id !== -1 || !e.isPrimary || kilit || sahneEl.dataset.durum !== 'koy' || b.classList.contains('yerinde')) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; oynadi = false;
      b.setPointerCapture(id);
    };
    b.onpointermove = (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.hypot(dx, dy) > 8) oynadi = true;
      if (oynadi) { b.style.translate = dx + 'px ' + dy + 'px'; b.classList.add('tasiniyor'); }
    };
    b.onpointerup = (e) => {
      if (e.pointerId !== id) return;
      id = -1;
      b.style.translate = '';
      b.classList.remove('tasiniyor');
      sesiAc();
      if (!oynadi) { sec(o); return; }
      const p = fonNoktasi(sahneEl, e.clientX, e.clientY);
      birak(o, p.x, p.y);
    };
    b.onpointercancel = b.onlostpointercapture = (e) => {
      if (e.pointerId !== id) return;
      id = -1;
      b.style.translate = '';
      b.classList.remove('tasiniyor');
    };
  }
  function sec(o: Oyuncak) {
    if (kilit || sahneEl.dataset.durum !== 'koy') return;
    secili = secili === o ? null : o;
    (Object.keys(oyuncaklar) as Oyuncak[]).forEach((x) => oyuncaklar[x]!.classList.toggle('secili', x === secili));
    sahneEl.dataset.secili = secili ?? '';
    oyunSesi('kagit');
  }
  // Seçili eşya varken sahneye dokunmak: eşya o noktaya bırakılır.
  sahneEl.addEventListener('click', (e) => {
    if (!secili || kilit || sahneEl.dataset.durum !== 'koy' || (e.target as Element).closest('.sk-oyuncak')) return;
    const p = fonNoktasi(sahneEl, e.clientX, e.clientY);
    birak(secili, p.x, p.y);
  });
  const ipucuAlani = kat('sk-alan', 11);
  ipucuAlani.hidden = true;
  function yerine(rel: Iliski, b: HTMLButtonElement) {
    const kn = KONAK[rel];
    b.classList.add('yerinde');
    b.classList.remove('secili');
    katta(b, kn.arkada ? yerKati[KOYMA[rel].yer] : on, kn);
  }
  function toplamaya() {
    lokumKoy('sevinc', on, LOKUM_AYAKTA);
    lokum.style.zIndex = '11';
    lokum.classList.remove('sevin');
    const canli = window.setInterval(() => {
      if (oturum !== token) { clearInterval(canli); return; }
      if (sahneEl.dataset.durum === 'koy' && !lokum.classList.contains('sevin')) birKezOynat(lokum, 'hopla', 520);
    }, 2300);
    const ilk = is === tur.bul.length;
    // 2–3 yaşta yalnız istenen eşya; büyüklerde ikisi de yerde (hangisi istendiğini dinlemek de iş).
    const gerekli = new Set(tur.koy.map((r) => KOYMA[r].oyuncak));
    (['top', 'ayicik'] as const).forEach((o) => { if (yol !== 'minik' || gerekli.has(o)) oyuncakKur(o); });
    // Yarıda kalan turda konmuş eşyalar yerinde.
    tur.koy.slice(0, is - tur.bul.length).forEach((r) => { const b = oyuncaklar[KOYMA[r].oyuncak]; if (b) yerine(r, b); });
    durum('topla');
    if (ilk) { metin = sozler[S.topla]; soyle(metin); sozBitince(() => sonra(250, koyDe), 5000); } else koyDe();
  }
  function koyDe() {
    const j = is - tur.bul.length;
    if (j >= tur.koy.length) { bitir(); return; }
    const rel = tur.koy[j];
    yanlis = 0;
    ipucuAlani.hidden = true;
    sahneEl.dataset.is = String(is);
    sahneEl.dataset.rel = rel;
    sahneEl.dataset.oyuncak = KOYMA[rel].oyuncak;
    metin = sozler[S.koy[rel]];
    soyle(metin);
    durum('koy');
  }
  function birak(o: Oyuncak, x: number, y: number) {
    if (kilit || sahneEl.dataset.durum !== 'koy') return;
    const j = is - tur.bul.length, rel = tur.koy[j], b = oyuncaklar[o]!;
    secili = null;
    sahneEl.dataset.secili = '';
    Object.values(oyuncaklar).forEach((x0) => x0!.classList.remove('secili'));
    const yer = birakmaIliskisi(x, y);
    if (o !== KOYMA[rel].oyuncak || yer !== rel) {
      if (!yanlis) konudaZorlandi(yol, 'konum', rel);
      yanlis++;
      yanlisSesi();
      yenidenOynat(b, 'kipir');
      birKezOynat(lokum, 'kipir', 320);
      durum('dinle');
      sirayla([() => soyle(sozler[o !== KOYMA[rel].oyuncak ? S.oyuncak : S.baska]), () => soyle(sozler[S.koy[rel]])], () => {
        durum('koy');
        if (yanlis >= 2) {
          const a = BIRAKMA[rel];
          fonaYerlestir(ipucuAlani, a.x, a.y, a.w, a.h);
          ipucuAlani.hidden = false;
          yenidenOynat(oyuncaklar[KOYMA[rel].oyuncak]!, 'parla');
        }
      }, 150);
      return;
    }
    if (!yanlis) konudaBasardi(yol, 'konum', rel);
    ipucuAlani.hidden = true;
    const bas = b.getBoundingClientRect();
    yerine(rel, b);
    yerineOtur(bas, b);
    oyunSesi('kutu');
    birKezOynat(lokum, 'sevin', 1650);
    durum('kondu');
    soyle(sozler[S.kondu[rel]]);
    t.secimler.push(is);
    kaydet(k);
    is++;
    sozBitince(() => sonra(400, koyDe), 4000);
  }
  function bitir() {
    durum('bitti');
    lokum.dataset.poz = 'sevinc';
    yenidenOynat(lokum, 'sevin');
    oyunSesi('parilti');
    tamam(sozler[S.bitti]);
  }
  void sesli;
  if (is >= tur.bul.length) toplamaya();
  else saklan();
}

/**
 * Kaydırak Sırası (M34; sıra sayıları; Fener tiyatrosu, her yaş). Arkadaşlar kaydırak sırasında; kaydırağa en yakın olan
 * birinci. Ceren sorar: "Üçüncü kim? Ona dokun." (5+ yaşta "Bulut kaçıncı sırada?" sorusuna rakam kartı). Doğruda Ceren
 * "Evet! Üçüncü." der; birinci merdivenden çıkıp kayar, sıranın sonuna geçer, herkes bir öne ilerler: sonraki soru yeni
 * sıraya göre. Yanlışta Ceren kaydıraktan başlayıp birlikte sayar, sayılan arkadaş zıplar, doğru olan parlar. Son soruda
 * herkes sırayla kayar, Ceren sırayı söyler. Kayıt: t.secimler cevaplanan sorular (yarıda kalan tur o sıradan sürer).
 */
function kaydirakSirasi(t: Tur, sesli: boolean) {
  const S = KAYDIRAK_SOZ;
  const tur = kaydirakTuru(tekrarYolu(), t.tekrar ?? 0);
  const fon = yeniCizim('kaydirak', 'park-kaydirak');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sonra = (ms: number, fn: () => void) => { timer = window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  const sahneEl = alan('kd-sahne');
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sonraBagimsiz = (ms: number, fn: () => void) => { window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  // Sırada bekleyenler canlı: soru sürerken arada biri heyecanla parmak ucunda hoplar (aynı kişi art arda değil).
  let sonHoplayan = '';
  const canli = window.setInterval(() => {
    if (oturum !== token) { clearInterval(canli); return; }
    const d0 = sahneEl.dataset.durum;
    if (azHareket || (d0 !== 'kim' && d0 !== 'kac')) return;
    const adaylar = dizi.filter((x) => x !== sonHoplayan && !['hop', 'kipir', 'ipucu'].some((c) => dostlar[x].classList.contains(c)));
    const x = adaylar[Math.floor(Math.random() * adaylar.length)];
    if (!x) return;
    sonHoplayan = x;
    birKezOynat(dostlar[x], 'bekle-hop', 520);
  }, 1700);
  let soru = Math.min(t.secimler.length, tur.sorular.length);
  let dizi = soruDizisi(tur, soru);
  const dostlar = {} as Record<Dost, HTMLButtonElement>;
  const kartlar = document.createElement('div');
  kartlar.className = 'kd-kartlar';
  // Ayakta: sıra yerinde, ayak tabanı zeminde; dokunma kutusu gövde eninde (POZ.dokun), çizim kutudan iki yana taşar
  // (komşu arkadaşların tuvalleri üst üste biner, dokunuş yanlış arkadaşa gitmesin). Kayarken: oturma noktası olukta.
  const ayakta = (d: Dost, x: number, y = ZEMIN_Y, sure = 0) => {
    const b = dostlar[d];
    b.style.transitionDuration = azHareket ? '0s' : sure + 'ms';
    b.dataset.poz = 'bekle';
    fonaYerlestir(b, x - POZ.dokun / 2, y - POZ.taban, POZ.dokun, POZ.h);
  };
  const olukta = (d: Dost, p: { x: number; y: number }, sure = 0) => {
    const b = dostlar[d];
    b.style.transitionDuration = azHareket ? '0s' : sure + 'ms';
    b.dataset.poz = 'kay';
    fonaYerlestir(b, p.x - KAYIS.oturma.x, p.y - KAYIS.oturma.y, KAYIS.w, KAYIS.h);
  };
  for (const d of tur.dizi) {
    const b = buton(sahneEl, DOST_ADI[d], yeniResim('kaydirak', d + '-bekle', 'kd-poz kd-poz-bekle', DOST_ADI[d]) + yeniResim('kaydirak', d + '-kay', 'kd-poz kd-poz-kay', DOST_ADI[d] + ' kayıyor'), () => dokun(d), 'kd-dost');
    b.dataset.dost = d;
    dostlar[d] = b;
  }
  // Kaydırak fonda çizili: telefon kamerası onu da göstersin (merdiven tabanı, platform, oluğun ucu).
  const kaydirakYeri = document.createElement('i');
  kaydirakYeri.className = 'tk-alan';
  fonaYerlestir(kaydirakYeri, OLUK.uc.x, MERDIVEN.ust.y - 40, MERDIVEN.alt.x + 60 - OLUK.uc.x, ZEMIN_Y + 30 - (MERDIVEN.ust.y - 40));
  sahneEl.append(kartlar, kaydirakYeri);
  const diziyiYaz = () => {
    sahneEl.dataset.dizi = dizi.join(',');
    dizi.forEach((d, i) => { ayakta(d, SIRA_X[i]); dostlar[d].style.zIndex = String(10 - i); });
  };
  diziyiYaz();
  /** Birinci merdivenden çıkar, kayar, soldan çıkıp sağdan sıranın sonuna gelir; ötekiler bir öne yürür. */
  function birinciKaysin(sonunda: () => void, geriGel = true) {
    const d = dizi[0], b = dostlar[d];
    b.classList.add('yuru');
    b.style.zIndex = '12';
    ayakta(d, MERDIVEN.alt.x, ZEMIN_Y, 500);
    dizi = siraIlerle(dizi);
    if (geriGel) sonra(250, () => dizi.slice(0, -1).forEach((x, i) => { dostlar[x].classList.add('yuru'); ayakta(x, SIRA_X[i], ZEMIN_Y, 650); }));
    const A = azHareket ? 60 : 1;
    sonra(520 / A, () => {
      b.classList.add('tirman');
      ayakta(d, MERDIVEN.ust.x, MERDIVEN.ust.y, 900);
      if (!azHareket) [0, 300, 600].forEach((ms) => sonraBagimsiz(ms, () => oyunSesi('kagit')));
      sonra(920 / A, () => {
        b.classList.remove('yuru', 'tirman');
        oyunSesi('damla');
        kaymaSesi();
        olukta(d, OLUK.bas);
        void b.offsetWidth;
        sonra(60 / A, () => {
          b.style.transitionTimingFunction = 'cubic-bezier(.45, 0, .85, .6)';
          olukta(d, OLUK.son, 850);
          sonra(860 / A, () => {
            b.style.transitionTimingFunction = '';
            olukta(d, OLUK.uc, 260);
            sonra(300 / A, () => {
              oyunSesi('birles');
              dizi.slice(0, -1).forEach((x) => dostlar[x].classList.remove('yuru'));
              if (!geriGel) { b.classList.add('yuru'); ayakta(d, -260, ZEMIN_Y, 700); sonra(720 / A, () => { b.classList.remove('yuru'); b.hidden = true; sonunda(); }); return; }
              b.classList.add('yuru');
              ayakta(d, -260, ZEMIN_Y, 600);
              sonra(620 / A, () => {
                ayakta(d, 1900);
                void b.offsetWidth;
                sonra(40 / A, () => {
                  ayakta(d, SIRA_X[dizi.length - 1], ZEMIN_Y, 800);
                  if (!azHareket) [0, 320].forEach((ms) => sonraBagimsiz(ms, () => oyunSesi('kagit')));
                  sonra(820 / A, () => { b.classList.remove('yuru'); diziyiYaz(); sonunda(); });
                });
              });
            });
          });
        });
      });
    });
  }
  function sor() {
    if (soru >= tur.sorular.length) { herkesKaysin(); return; }
    const q = tur.sorular[soru];
    sahneEl.dataset.soru = String(soru);
    sahneEl.dataset.tur = q.tur;
    sahneEl.dataset.cevap = String(cevapSirasi(dizi, q));
    Object.values(dostlar).forEach((b) => b.classList.remove('ipucu'));
    kartlar.replaceChildren();
    metin = sozler[soruSozu(dizi, q)];
    if (q.tur === 'kacinci') {
      dostlar[dizi[q.sira - 1]].classList.add('soruda');
      siraKartlari(dizi.length).forEach((n, i) => {
        const b = buton(kartlar, String(n), '<span class="kd-kart-ic">' + rakamBloklari(n) + '</span>', () => kartSec(n, b), 'kd-kart');
        b.dataset.sira = String(n);
        fonaYerlestir(b, 836 - (dizi.length * 175) / 2 + i * 175 + 7.5, 60, 160, 160);
      });
    }
    soyle(metin);
    durum(q.tur === 'kacinci' ? 'kac' : 'kim');
  }
  function dokun(d: Dost) {
    if (kilit || sahneEl.dataset.durum !== 'kim') return;
    const q = tur.sorular[soru], cevap = cevapSirasi(dizi, q);
    if (dizi.indexOf(d) + 1 !== cevap) { yenidenOynat(dostlar[d], 'kipir'); birlikteSay(cevap, q.tur === 'son'); return; }
    dogru(cevap, q.tur === 'son');
  }
  function kartSec(n: number, b: HTMLButtonElement) {
    if (kilit || sahneEl.dataset.durum !== 'kac') return;
    const q = tur.sorular[soru], cevap = cevapSirasi(dizi, q);
    if (n !== cevap) { yenidenOynat(b, 'kipir'); birlikteSay(cevap, false); return; }
    b.classList.add('dogru');
    dogru(cevap, false);
  }
  /** Kaydıraktan başlayıp sorulan sıraya kadar birlikte say: her arkadaş zıplar, Ceren sırasını söyler. */
  function birlikteSay(cevap: number, sonuncu: boolean) {
    const geri = sahneEl.dataset.durum!;
    yanlisSesi();
    durum('say');
    sirayla([
      () => soyle(sozler[S.ipucu]),
      ...dizi.slice(0, cevap).map((d, i) => () => { yenidenOynat(dostlar[d], 'hop'); soyle(sozler[S.sira[i + 1]]); }),
      ...(sonuncu ? [() => soyle(sozler[S.sonuncu])] : []),
    ], () => { dostlar[dizi[cevap - 1]].classList.add('ipucu'); durum(geri); }, 120);
  }
  function dogru(cevap: number, sonuncu: boolean) {
    durum('dogru');
    const d = dizi[cevap - 1];
    Object.values(dostlar).forEach((b) => b.classList.remove('ipucu', 'soruda'));
    yenidenOynat(dostlar[d], 'hop');
    oyunSesi('parilti');
    t.secimler.push(soru);
    kaydet(k);
    soru++;
    const ilkKayis = soru === 1;
    sirayla([() => soyle(sozler[S.evet]), () => soyle(sozler[sonuncu ? S.sonuncu : S.sira[cevap]])], () => {
      kartlar.replaceChildren();
      durum('kayiyor');
      if (soru >= tur.sorular.length) { sonra(300, herkesKaysin); return; }
      birinciKaysin(() => {
        if (ilkKayis) { soyle(sozler[S.kaydi]); sozBitince(() => sonra(250, sor), 5000); } else sonra(250, sor);
      });
    }, 150);
  }
  /** Son: herkes sırayla kayar, Ceren sırasını söyler (birinci, ikinci, …). */
  function herkesKaysin() {
    durum('hepsi');
    metin = sozler[S.hepsi];
    soyle(metin);
    const sira = [...dizi];
    sozBitince(() => {
      // Her arkadaş merdivene yürürken Ceren sırasını söyler; söz bitince sıradaki yola çıkar (merdivende ikisi çakışmaz).
      const kay = (i: number) => {
        if (i >= sira.length) { sonra(azHareket ? 100 : 1800, () => tamam(sozler[S.bitti])); return; }
        soyle(sozler[S.sira[i + 1]]);
        dizi = [...sira.slice(i)];
        birinciKaysin(() => {}, false);
        sozBitince(() => sonra(azHareket ? 150 : 900, () => kay(i + 1)), 2500);
      };
      kay(0);
    }, 4000);
  }
  void sesli;
  if (soru === 0 && !t.secimler.length) {
    durum('giris');
    metin = sozler[S.giris];
    soyle(metin);
    sozBitince(() => sonra(300, sor), 6000);
  } else sor();
}

/**
 * Kino Ailesinin Sofrası (M35; büyüklüğe göre eşleme ve sıralama; Ölçü tezgâhı, her yaş, öncelik 2–3 yaş). Baba, Anne ve Kino
 * masanın arkasında oturur; masanın önünde bir takım eşya (kâse, bardak ya da kaşık) karışık sırayla bekler. Çocuk her eşyayı
 * kendi boyundakine götürür (sürükle ya da önce eşyaya, sonra kişiye dokun): büyük Baba'ya, orta Anne'ye, küçük Kino'ya. Doğruda
 * eşya kişinin önüne konur, kişi sevinir, Ceren söyler ("Kino'ya en küçüğü!"); yanlışta eşya yerinde kalır, Ceren nedenini
 * söyler ("Bu, Kino'ya çok büyük!"). Takım bitince "Afiyet olsun!". 2–3 yaşta yalnız Baba ve Kino (büyük, küçük). İlk yanlış
 * konu defterine (olcu:buyuk-kucuk). Kayıt: t.secimler biten takımlar.
 */
function kinoAileSofrasi(t: Tur, sesli: boolean) {
  const S = SOFRA_SOZ, yol = tekrarYolu();
  const tur = sofraTuru(yol, t.tekrar ?? 0);
  const fon = yeniCizim('sofra', 'aile-yemek-odasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sonra = (ms: number, fn: () => void) => { timer = window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  const sahneEl = alan('ai-sahne');
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const kisiler = sofradakiler(yol);
  // Kişiler masanın arkasında (alt gövdeleri masanın altında kalır); masa önde; eşyalar masanın üstünde.
  const kisiEl = {} as Record<Kisi, HTMLElement>;
  for (const ki of kisiler) {
    const el = document.createElement('div');
    el.className = 'ai-kisi';
    el.dataset.kisi = ki;
    el.dataset.poz = '0';
    el.innerHTML = yeniResim('sofra', ki + '-sofra-0', 'ai-poz ai-poz-0', KISI_ADI[ki]) + yeniResim('sofra', ki + '-sofra-1', 'ai-poz ai-poz-1', KISI_ADI[ki] + ' sevinir');
    const T = POZ_TUVALI[ki];
    fonaYerlestir(el, KISI_X[yol][ki]! - T.w / 2, OTURMA_Y - T.h, T.w, T.h);
    sahneEl.append(el);
    kisiEl[ki] = el;
  }
  const masa = document.createElement('div');
  masa.className = 'ai-masa';
  masa.innerHTML = yeniResim('sofra', 'sofra-masasi', 'ai-resim', 'Sofra masası');
  fonaYerlestir(masa, 0, 381, 1672, 560);
  const masadaki = document.createElement('div');
  masadaki.className = 'ai-kat';
  sahneEl.append(masa, masadaki);
  // Kişiye dokunmak (seçili eşya varken) eşyayı ona verir: görünmez hedefler kişinin ve önündeki yerin çevresinde.
  for (const ki of kisiler) {
    const a = birakmaAlani(KISI_X[yol][ki]!);
    const b = buton(sahneEl, KISI_ADI[ki], '', () => { if (secili) ver(secili, ki); }, 'ai-hedef');
    b.dataset.kisi = ki;
    fonaYerlestir(b, a.x, a.y, a.w, a.h);
  }
  let ti = Math.min(t.secimler.length, tur.takimlar.length);
  let secili: HTMLButtonElement | null = null;
  let yanlisVar = false;
  let yerlesen = 0;
  const kutuBoyu = (e: Esya, boy: Boy) => { const T = ESYA_TUVALI[e][boy]; return { w: Math.max(T.w, DOKUNMA), h: Math.max(T.h, DOKUNMA) }; };
  const sec = (b: HTMLButtonElement | null) => {
    secili = b;
    masadaki.querySelectorAll('.ai-esya').forEach((x) => x.classList.toggle('secili', x === b));
    sahneEl.dataset.secili = b?.dataset.boy ?? '';
    if (b) oyunSesi('kagit');
  };
  const kisiyeDegdi = (x: number, y: number) => kisiler.find((ki) => { const a = birakmaAlani(KISI_X[yol][ki]!); return x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h; });
  function takimKur() {
    if (ti >= tur.takimlar.length) { bitir(); return; }
    const esya = tur.takimlar[ti], diz = tur.dizilisler[ti], xs = beklemeX(diz.length);
    masadaki.replaceChildren();
    sec(null);
    yanlisVar = false;
    yerlesen = 0;
    kisiler.forEach((ki) => { kisiEl[ki].dataset.poz = '0'; });
    sahneEl.dataset.takim = esya;
    sahneEl.dataset.yerlesen = '0';
    diz.forEach((boy, i) => {
      const T = ESYA_TUVALI[esya][boy], K = kutuBoyu(esya, boy);
      const ic = '<span class="ai-esya-resim" style="width:' + (100 * T.w / K.w).toFixed(2) + '%;height:' + (100 * T.h / K.h).toFixed(2) + '%">' +
        yeniResim('sofra', esya + '-' + boy, 'ai-resim', esya + '-' + boy) + '</span>';
      const b = buton(masadaki, BOY_ADI[boy] + ' ' + ESYA_ADI[esya].toLocaleLowerCase('tr'), ic, () => {}, 'ai-esya');
      b.dataset.boy = boy;
      fonaYerlestir(b, xs[i] - K.w / 2, BEKLEME_Y - K.h, K.w, K.h);
      // Sürükle-bırak ya da dokun-seç: kısa dokunuş eşyayı seçer, sonra kişiye dokunulur.
      let id = -1, x0 = 0, y0 = 0, oynadi = false;
      b.onpointerdown = (e) => {
        if (id !== -1 || !e.isPrimary || kilit || sahneEl.dataset.durum !== 'dagit' || b.classList.contains('yerinde')) return;
        id = e.pointerId; x0 = e.clientX; y0 = e.clientY; oynadi = false;
        b.setPointerCapture(id);
      };
      b.onpointermove = (e) => {
        if (e.pointerId !== id) return;
        const dx = e.clientX - x0, dy = e.clientY - y0;
        if (Math.hypot(dx, dy) > 8) oynadi = true;
        if (oynadi) { b.style.translate = dx + 'px ' + dy + 'px'; b.classList.add('tasiniyor'); }
      };
      b.onpointerup = (e) => {
        if (e.pointerId !== id) return;
        id = -1;
        b.style.translate = '';
        b.classList.remove('tasiniyor');
        sesiAc();
        if (!oynadi) { sec(secili === b ? null : b); return; }
        const p = fonNoktasi(sahneEl, e.clientX, e.clientY), ki = kisiyeDegdi(p.x, p.y);
        if (ki) ver(b, ki); else ipucu(b);
      };
      b.onpointercancel = b.onlostpointercapture = (e) => {
        if (e.pointerId !== id) return;
        id = -1;
        b.style.translate = '';
        b.classList.remove('tasiniyor');
      };
    });
    metin = sozler[takimSozu(esya, yol)];
    durum('dagit');
    if (ti === 0 && !t.secimler.length) sirayla([() => soyle(sozler[S.giris]), () => soyle(metin)], () => {}, 200);
    else soyle(metin);
  }
  function ver(b: HTMLButtonElement, ki: Kisi) {
    if (kilit || sahneEl.dataset.durum !== 'dagit' || b.classList.contains('yerinde')) return;
    const boy = b.dataset.boy as Boy, esya = tur.takimlar[ti];
    sec(null);
    if (!uyar(boy, ki)) {
      // Yanlış kişi: eşya yerinde kalır; kişi başını sallar, Ceren nedenini söyler.
      if (!yanlisVar) { yanlisVar = true; konudaZorlandi(yol, 'olcu', 'buyuk-kucuk'); }
      yenidenOynat(kisiEl[ki], 'kipir');
      ipucu(b, sozler[S.yanlis[yanlisSozu(boy, ki)]]);
      return;
    }
    const bas = b.getBoundingClientRect(), K = kutuBoyu(esya, boy), x = KISI_X[yol][ki]!;
    b.classList.add('yerinde');
    b.dataset.kisi = ki;
    fonaYerlestir(b, x - K.w / 2, YER_Y - K.h, K.w, K.h);
    yerineOtur(bas, b);
    oyunSesi('kutu');
    kisiEl[ki].dataset.poz = '1';
    yenidenOynat(kisiEl[ki], 'sevin');
    soyle(sozler[dogruSozu(ki, yol)]);
    yerlesen++;
    sahneEl.dataset.yerlesen = String(yerlesen);
    if (yerlesen < kisiler.length) { sonra(1600, () => { if (sahneEl.dataset.durum === 'dagit') kisiEl[ki].dataset.poz = '0'; }); return; }
    // Takım tamam: herkes kendi boyundakini aldı.
    durum('afiyet');
    if (!yanlisVar) konudaBasardi(yol, 'olcu', 'buyuk-kucuk');
    t.secimler.push(ti);
    kaydet(k);
    sozBitince(() => {
      kisiler.forEach((x0) => { kisiEl[x0].dataset.poz = '1'; });
      oyunSesi('parilti');
      if (ti + 1 >= tur.takimlar.length) { bitir(); return; }
      soyle(sozler[S.afiyet]);
      sozBitince(() => sonra(500, () => { ti++; takimKur(); }), 4000);
    }, 3000);
  }
  function bitir() {
    durum('bitti');
    kisiler.forEach((x0) => { kisiEl[x0].dataset.poz = '1'; yenidenOynat(kisiEl[x0], 'sevin'); });
    tamam(sozler[S.bitti]);
  }
  void sesli;
  takimKur();
}

/**
 * Mila ile Pamuk'un Eş Kartları (M36; görsel bellek ve eşleme; Fener tiyatrosu, her yaş, öncelik 2–3 yaş). Kar yağan pencerenin
 * önünde halıda kartlar kapalı; Mila ve Pamuk yanlarında oturur. Çocuk bir karta dokunur (açılır), sonra eşini arar. Eşse iki
 * kart açık kalır, Mila ya da Pamuk sevinir, Ceren söyler ("Eş! İki tren."); değilse iki kart bir an sonra kapanır (ilk
 * seferinde Ceren "Yerlerini aklında tut!"). 2–3 yaşta dört kart ve önce kısa bir bakış; 4 yaşta altı, 5+ yaşta sekiz kart.
 * Sonda (4+) eşler ikişer sayılır. Kayıt: t.secimler bulunan eşlerin resim sırası (yarıda kalan tur açık eşlerle sürer).
 */
function esKartlar(t: Tur, sesli: boolean) {
  const S = ES_SOZ, yol = tekrarYolu();
  const tur = esTuru(yol, t.tekrar ?? 0), n = tur.dizilis.length;
  const fon = yeniCizim('eskart', 'kis-penceresi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sonra = (ms: number, fn: () => void) => { timer = window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  const sahneEl = alan('pk-sahne');
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  sahneEl.dataset.kart = String(n);
  // Mila solda, Pamuk sağda halıda oturur.
  const dost = (['mila', 'pamuk'] as const).map((ad) => {
    const el = document.createElement('div');
    el.className = 'pk-dost';
    el.dataset.dost = ad;
    el.dataset.poz = '0';
    el.innerHTML = yeniResim('eskart', ad + '-kart-0', 'pk-poz pk-poz-0', ad === 'mila' ? 'Mila' : 'Pamuk') + yeniResim('eskart', ad + '-kart-1', 'pk-poz pk-poz-1', (ad === 'mila' ? 'Mila' : 'Pamuk') + ' sevinir');
    const D = DOST[ad];
    fonaYerlestir(el, D.x, DOST.taban - D.h, D.w, D.h);
    sahneEl.append(el);
    return el;
  });
  const bulunan = new Set<Resim>(t.secimler.map((i) => tur.resimler[i]).filter(Boolean));
  const kartlar = tur.dizilis.map((r, i) => {
    const b = buton(sahneEl, 'Kart ' + (i + 1), '<span class="pk-ic"><span class="pk-yuz pk-arka">' + yeniResim('eskart', 'kart-arka', 'pk-resim', 'kart') + '</span>' +
      '<span class="pk-yuz pk-on">' + yeniResim('eskart', 'kart-on', 'pk-resim', '') + '<span class="pk-simge">' + yeniResim('eskart', 'resim-' + r, 'pk-resim', RESIM_ADI[r]) + '</span></span></span>', () => ac(i), 'pk-kart');
    b.dataset.i = String(i);
    b.dataset.resim = r;
    const y = kartYeri(i, n);
    fonaYerlestir(b, y.x, y.y, KART.w, KART.h);
    if (bulunan.has(r)) { b.dataset.acik = '1'; b.classList.add('es'); }
    return b;
  });
  let acik: number[] = [], degilDendi = false, sevinen = 0;
  const kapat = (i: number) => { delete kartlar[i].dataset.acik; };
  function ac(i: number) {
    if (kilit || sahneEl.dataset.durum !== 'oyna') return;
    const b = kartlar[i];
    if (b.dataset.acik || acik.length >= 2) return;
    b.dataset.acik = '1';
    oyunSesi('kagit');
    acik.push(i);
    if (acik.length < 2) return;
    const [a1, a2] = acik;
    if (esMi(tur.dizilis, a1, a2)) {
      const r = tur.dizilis[a1];
      acik = [];
      bulunan.add(r);
      kartlar[a1].classList.add('es');
      kartlar[a2].classList.add('es');
      t.secimler.push(tur.resimler.indexOf(r));
      kaydet(k);
      sahneEl.dataset.bulunan = String(bulunan.size);
      oyunSesi('parilti');
      const d = dost[sevinen++ % 2];
      d.dataset.poz = '1';
      yenidenOynat(d, 'sevin');
      sonra(1600, () => { d.dataset.poz = '0'; });
      soyle(sozler[S.es[r]]);
      if (bulunan.size === tur.resimler.length) { durum('bitti'); sozBitince(() => sonra(400, bitir), 3000); }
      return;
    }
    // Eş değil: bir an açık kalır, sonra ikisi kapanır.
    durum('bak');
    if (!degilDendi) { degilDendi = true; soyle(sozler[S.degil]); }
    sonra(1100, () => { kapat(a1); kapat(a2); acik = []; durum('oyna'); });
  }
  function bitir() {
    dost.forEach((d) => { d.dataset.poz = '1'; yenidenOynat(d, 'sevin'); });
    if (yol === 'minik') { tamam(sozler[S.bitti]); return; }
    // 4+: eşler ikişer sayılır (her eş sırayla parlar).
    durum('say');
    sirayla([() => soyle(sozler[S.say]), ...tur.resimler.map((r, j) => () => {
      kartlar.filter((b) => b.dataset.resim === r).forEach((b) => yenidenOynat(b, 'parla'));
      adediOku((j + 1) * 2);
    })], () => tamam(sozler[S.bitti]), 150);
  }
  void sesli;
  metin = sozler[S.cevir];
  // İlk gelişte giriş; 2–3 yaşta kartlar önce bir an açık gösterilir, sonra kapanır.
  const basla = () => { durum('oyna'); soyle(metin); };
  if (bulunan.size === 0 && tur.onizleme) {
    durum('onizleme');
    kartlar.forEach((b) => { b.dataset.acik = '1'; });
    sirayla([...(t.secimler.length ? [] : [() => soyle(sozler[S.giris])]), () => soyle(sozler[S.bak])], () => {
      sonra(TEST_KIPI ? 300 : 1800, () => { kartlar.forEach((b) => { if (!b.classList.contains('es')) delete b.dataset.acik; }); sonra(500, basla); });
    }, 150);
  } else if (bulunan.size === 0) {
    durum('giris');
    soyle(sozler[S.giris]);
    sozBitince(() => sonra(250, basla), 5000);
  } else basla();
}

/**
 * Dede'nin Şekil Kutusu (M37; şekil tanıma ve eşleme; Şekil evi, her yaş, öncelik 2–3 yaş). Bahçe çardağında Dede'nin
 * yaptığı tahta kutunun önünde beş delik; tahta şekiller sağda battaniyede. Çocuk şekli kendi deliğine sürükler (ya da önce
 * şekle, sonra deliğe dokunur): girerse "Tık!" diye kutuya düşer, Dede sevinir, Ceren söyler ("Tık! Üçgen girdi."). Başka
 * delikse geri seker ("Olmadı! Bu şekil başka delikten girer."). 5+ yaşta bazı şekiller ters ya da yan gelir: dokununca 90°
 * döner; ters şekil deliğe girmez ("Bu şekil ters duruyor. Dokun, çevir!"). İlk yanlış konu defterine (sekil:<şekil>).
 * Kayıt: t.secimler kutuya giren parçaların sırası.
 */
function sekilKutusu(t: Tur, sesli: boolean) {
  const S = KUTU_SOZ, yol = tekrarYolu();
  const tur = kutuTuru(yol, t.tekrar ?? 0);
  const fon = yeniCizim('kutu', 'dede-cardagi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sonra = (ms: number, fn: () => void) => { timer = window.setTimeout(() => { if (oturum === token) fn(); }, ms); };
  const sahneEl = alan('dk-sahne');
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const dede = document.createElement('div');
  dede.className = 'dk-dede';
  dede.dataset.poz = '0';
  dede.innerHTML = yeniResim('kutu', 'dede-kutu-0', 'dk-poz dk-poz-0', 'Dede') + yeniResim('kutu', 'dede-kutu-1', 'dk-poz dk-poz-1', 'Dede sevinir');
  fonaYerlestir(dede, DEDE.x, DEDE.taban - DEDE.h, DEDE.w, DEDE.h);
  const kutu = document.createElement('div');
  kutu.className = 'dk-kutu';
  kutu.innerHTML = yeniResim('kutu', 'sekil-kutusu', 'dk-resim', 'Şekil kutusu');
  fonaYerlestir(kutu, KUTU.x, KUTU.y, KUTU.w, KUTU.h);
  sahneEl.append(dede, kutu);
  // Delikler: dokunulan (seçili parça varken) ve bırakılan hedef; kutunun çiziminin üstünde görünmez.
  for (const s of KUTU_SEKILLERI) {
    const d = DELIK[s];
    const b = buton(sahneEl, KSEKIL_ADI[s] + ' deliği', '', () => { if (secili !== null) dene(secili, s); }, 'dk-delik');
    b.dataset.sekil = s;
    fonaYerlestir(b, KUTU.x + d.x - d.w / 2, KUTU.y + d.y - d.h / 2, d.w, d.h);
  }
  const giren = new Set<number>(t.secimler);
  let secili: number | null = null;
  const yanlisKonu = new Set<KSekil>();
  const acilar = tur.parcalar.map((p) => p.aci);
  const parcalar = tur.parcalar.map((p, i) => {
    const T = PARCA_TUVALI[p.sekil], K = { w: Math.max(T.w, KUTU_DOKUNMA), h: Math.max(T.h, KUTU_DOKUNMA) };
    const b = buton(sahneEl, KSEKIL_ADI[p.sekil], '<span class="dk-parca-resim" style="width:' + (100 * T.w / K.w).toFixed(2) + '%;height:' + (100 * T.h / K.h).toFixed(2) + '%">' +
      yeniResim('kutu', 'parca-' + p.sekil, 'dk-resim', p.sekil) + '</span>', () => {}, 'dk-parca');
    b.dataset.i = String(i);
    b.dataset.sekil = p.sekil;
    const [x, y] = PARCA_YERI[i];
    fonaYerlestir(b, x - K.w / 2, y - K.h / 2, K.w, K.h);
    const ciz = () => { b.style.setProperty('--aci', acilar[i] + 'deg'); b.dataset.aci = String(((acilar[i] % 360) + 360) % 360); };
    ciz();
    if (giren.has(i)) b.classList.add('girdi');
    // Sürükle-bırak ya da dokun: kısa dokunuş seçer (5+ yaşta ayrıca 90° çevirir), sonra deliğe dokunulur.
    let id = -1, x0 = 0, y0 = 0, oynadi = false;
    b.onpointerdown = (e) => {
      if (id !== -1 || !e.isPrimary || kilit || sahneEl.dataset.durum !== 'koy' || b.classList.contains('girdi')) return;
      id = e.pointerId; x0 = e.clientX; y0 = e.clientY; oynadi = false;
      b.setPointerCapture(id);
    };
    b.onpointermove = (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.hypot(dx, dy) > 8) oynadi = true;
      if (oynadi) { b.style.translate = dx + 'px ' + dy + 'px'; b.classList.add('tasiniyor'); }
    };
    b.onpointerup = (e) => {
      if (e.pointerId !== id) return;
      id = -1;
      b.style.translate = '';
      b.classList.remove('tasiniyor');
      sesiAc();
      if (!oynadi) {
        if (tur.cevir) { acilar[i] += 90; ciz(); oyunSesi('kagit'); }
        sec(i);
        return;
      }
      const p0 = fonNoktasi(sahneEl, e.clientX, e.clientY), s = delikBul(p0.x, p0.y);
      if (s) dene(i, s); else ipucu(b);
    };
    b.onpointercancel = b.onlostpointercapture = (e) => {
      if (e.pointerId !== id) return;
      id = -1;
      b.style.translate = '';
      b.classList.remove('tasiniyor');
    };
    return b;
  });
  function sec(i: number | null) {
    secili = i;
    parcalar.forEach((b, j) => b.classList.toggle('secili', j === i));
    sahneEl.dataset.secili = i === null ? '' : String(i);
  }
  function dene(i: number, delik: KSekil) {
    if (kilit || sahneEl.dataset.durum !== 'koy') return;
    const p = tur.parcalar[i], b = parcalar[i];
    sec(null);
    if (p.sekil !== delik || !girerMi(p.sekil, acilar[i])) {
      // Başka delik ya da ters duruyor: parça geri seker.
      if (!yanlisKonu.has(p.sekil)) { yanlisKonu.add(p.sekil); konudaZorlandi(yol, 'sekil', p.sekil); }
      yenidenOynat(b, 'kipir');
      ipucu(b, sozler[p.sekil === delik ? S.cevir : S.yanlis]);
      return;
    }
    if (!yanlisKonu.has(p.sekil)) konudaBasardi(yol, 'sekil', p.sekil);
    // Girer: deliğin üstüne gelir, küçülerek kutuya düşer.
    const d = DELIK[delik], T = PARCA_TUVALI[p.sekil], K = { w: Math.max(T.w, KUTU_DOKUNMA), h: Math.max(T.h, KUTU_DOKUNMA) };
    const bas = b.getBoundingClientRect();
    fonaYerlestir(b, KUTU.x + d.x - K.w / 2, KUTU.y + d.y - K.h / 2, K.w, K.h);
    yerineOtur(bas, b);
    b.classList.add('girdi');
    giren.add(i);
    t.secimler.push(i);
    kaydet(k);
    sahneEl.dataset.giren = String(giren.size);
    oyunSesi('kutu');
    dede.dataset.poz = '1';
    yenidenOynat(dede, 'sevin');
    soyle(sozler[S.girdi[p.sekil]]);
    if (giren.size < tur.parcalar.length) { sonra(1500, () => { if (sahneEl.dataset.durum === 'koy') dede.dataset.poz = '0'; }); return; }
    durum('bitti');
    sozBitince(() => { dede.dataset.poz = '1'; oyunSesi('parilti'); tamam(sozler[S.bitti]); }, 3000);
  }
  void sesli;
  sahneEl.dataset.giren = String(giren.size);
  metin = sozler[S.giris];
  const ilk = !t.secimler.length;
  durum(ilk ? 'giris' : 'koy');
  if (ilk) sirayla([() => soyle(sozler[S.giris]), ...(tur.cevir ? [() => soyle(sozler[S.cevirYonerge])] : [])], () => durum('koy'), 150);
  // Giriş sözü sürerken de oynanabilsin: kısa bir an sonra parçalar açılır.
  if (ilk) sonra(TEST_KIPI ? 200 : 1500, () => { if (sahneEl.dataset.durum === 'giris') durum('koy'); });
}

/**
 * Zıpzıp'ın Ritmik Zıplaması (M28; 5+; ritmik sayma): derede altı taş, levhalarında 2'şer (sonra 5'er ya da 10'ar) sayılar.
 * Zıpzıp kıyıdan ilk iki taşa zıplar, Ceren sayar ("iki, dört"); sonraki taşların levhası boş: çocuk kıyıdaki üç taştan
 * doğru sayılısını seçer, sayı levhaya yazılır, Zıpzıp zıplar, Ceren söyler. Yanlışta taş sallanır, Ceren "birlikte sayalım"
 * der ve dolu taşları baştan sayar. Kayıt: t.secimler biten diziler.
 */
function ritmikZiplama(t: Tur, sesli: boolean) {
  const diziler = ritimSiralari(t.tekrar ?? 0, turunZorlari(t));
  const defter = sayiDefteri();
  const fon = yeniCizim('ritim', 'dere-kenari');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('rz-sahne');
  const dere = document.createElement('div');
  dere.className = 'rz-dere';
  const kiyi = document.createElement('div');
  kiyi.className = 'rz-kiyi';
  const zipzip = document.createElement('div');
  zipzip.className = 'rz-zipzip';
  zipzip.dataset.poz = '0';
  zipzip.innerHTML = ['Zıpzıp', 'Zıpzıp zıplıyor', 'Zıpzıp sevinir'].map((ad, i) => yeniResim('ritim', 'zipzip-zipla-' + i, 'rz-poz rz-poz-' + i, ad)).join('');
  sahneEl.append(dere, kiyi, zipzip);
  // Taşlar büyük (180 × 120, ölçek 1,42 → 256 × 171): başlangıç taşı (0) ve altı taş derede iki sıra zikzak; çiftler önde
  // (taş tepesi y 600), tekler arkada (y 470); merkezler 190 px arayla, dizi fon eninin %83'ü. Zıpzıp tam boy (500 × 600,
  // taban y 580) taşın üst yüzünde (taş tuvalinde y 30). Seçenek taşları aynı boyda, alt kıyıda.
  const OLCEK = 1.424, TAS_W = 180 * OLCEK, TAS_H = 120 * OLCEK;
  const TAS_X = Array.from({ length: 7 }, (_, i) => 266 + 190 * i), tasUst = (i: number) => (i % 2 ? 470 : 600);
  const zipzipiKoy = (i: number) => fonaYerlestir(zipzip, TAS_X[i] - 250, tasUst(i) + 30 * OLCEK - 580, 500, 600);
  let di = Math.min(t.secimler.length, diziler.length - 1);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const levha = (n: number | null) => '<span class="rz-levha">' + (n === null ? '' : rakamBloklari(n)) + '</span>';
  function kur() {
    const d = diziler[di];
    dere.replaceChildren();
    kiyi.replaceChildren();
    sahneEl.dataset.dizi = String(di);
    sahneEl.dataset.adim = String(d.adim);
    sahneEl.dataset.bas = String(d.bas);
    const taslar = [d.bas, ...d.taslar].map((n, i) => {
      const el = document.createElement('div');
      el.className = 'rz-tas' + (i === 0 ? ' baslangic' : '');
      fonaYerlestir(el, TAS_X[i] - TAS_W / 2, tasUst(i), TAS_W, TAS_H);
      el.style.zIndex = i % 2 ? '1' : '2';
      el.innerHTML = yeniResim('ritim', 'tas', 'rz-tas-resim', 'taş') + yeniResim('ritim', 'su-halkasi', 'rz-halka', '') + levha(n);
      if (i > d.gosterilen) el.querySelector('.rz-levha')!.innerHTML = '';
      dere.append(el);
      return el;
    });
    let yer = 0;
    zipzip.dataset.poz = '0';
    zipzipiKoy(0);
    const zipla = (i: number) => {
      zipzip.dataset.poz = '1';
      yenidenOynat(zipzip, 'hop');
      zipzipiKoy(i);
      oyunSesi('damla');
      timer = window.setTimeout(() => { if (oturum === token) zipzip.dataset.poz = '0'; }, 520);
    };
    // Gösterim: Zıpzıp ilk iki taşa zıplar, Ceren sayar.
    durum('goster');
    sirayla([
      () => soyle(sozler[d.adim === 2 ? RITIM_SOZ.iki : d.adim === 5 ? RITIM_SOZ.bes : RITIM_SOZ.on]),
      ...d.taslar.slice(0, d.gosterilen).map((n, i) => () => { zipla(i + 1); yer = i + 1; sayiyiSoyle(n); }),
    ], sor, 250);
    function sor() {
      if (oturum !== token) return;
      if (yer >= d.taslar.length) { bitir(); return; }
      const sonraki = taslar[yer + 1];
      sonraki.classList.add('sirada');
      sahneEl.dataset.sira = String(yer + 1);
      kiyi.replaceChildren();
      ritimSecenekleri(d.taslar[yer - 1] ?? d.bas, d.adim).forEach((x, i) => {
        const b = buton(kiyi, String(x), yeniResim('ritim', 'tas-parlak', 'rz-tas-resim', 'taş') + levha(x), () => sec(x, b), 'rz-secim');
        fonaYerlestir(b, 836 + (i - 1) * 270 - TAS_W / 2, 768, TAS_W, TAS_H);
      });
      durum('sec');
      metin = sozler[RITIM_SOZ.ipucu];
    }
    function sec(x: number, b: HTMLButtonElement) {
      if (kilit || sahneEl.dataset.durum !== 'sec') return;
      const dogru = d.taslar[yer];
      if (x !== dogru) {
        defter.yanlis(dogru);
        durum('say');
        yenidenOynat(b, 'kipir');
        ipucu(b, sozler[RITIM_SOZ.ipucu]);
        // Dolu taşlar baştan sayılır, taşlar sırayla parlar.
        sozBitince(() => sirayla(d.taslar.slice(0, yer).map((n, i) => () => { yenidenOynat(taslar[i + 1], 'parla'); sayiyiSoyle(n); }), () => durum('sec'), 150), 3500);
        return;
      }
      defter.dogru(x);
      durum('zipla');
      const tas = taslar[yer + 1];
      tas.classList.remove('sirada');
      tas.querySelector('.rz-levha')!.innerHTML = rakamBloklari(x);
      yerineOtur(b.getBoundingClientRect(), tas.querySelector('.rz-levha'));
      kiyi.replaceChildren();
      yer++;
      zipla(yer);
      sayiyiSoyle(x);
      sozBitince(() => { timer = window.setTimeout(sor, 250); }, 2500);
    }
    function bitir() {
      durum('vardi');
      zipzip.dataset.poz = '2';
      oyunSesi('parilti');
      t.secimler.push(di);
      kaydet(k);
      if (di + 1 >= diziler.length) { tamam(sozler[RITIM_SOZ.vardi]); return; }
      soyle(sozler[RITIM_SOZ.vardi]);
      sozBitince(() => { timer = window.setTimeout(() => { if (oturum !== token) return; di++; kur(); }, 400); }, 3500);
    }
  }
  void sesli;
  kur();
}

/**
 * Babaanne'nin Eşit Paylaşımı (M29; 5+): kavanozdaki kurabiyeler askılı tabak terazisinin tabaklarına paylaştırılır. Çocuk
 * bir tabağa dokundukça kavanozdan bir kurabiye o tabağa gider; ağır taraf aşağı iner, çubuk eğilir (üç tabakta orta tabak da
 * iner ya da kalkar). Hepsi dağılınca: eşitse terazi dümdüz, Ceren bir tabağı sayar; değilse "Bu tabak ağır geldi" der,
 * kurabiyeler kavanoza döner. 6'yı iki tabağa, sonra 9'u üç tabağa (yeniden oynayışta 8 ve 6). Kayıt: t.secimler biten sorular.
 */
function esitPaylasim(t: Tur, sesli: boolean) {
  const sorular = paySorulari(t.tekrar ?? 0, turunZorlari(t));
  const fon = yeniCizim('pay', 'cay-masasi');
  kok.style.backgroundImage = fon ? 'url("' + fon + '")' : 'none';
  const token = oturum;
  const sahneEl = alan('ep-sahne');
  const babaanne = document.createElement('div');
  babaanne.className = 'ep-babaanne';
  babaanne.dataset.poz = '0';
  babaanne.innerHTML = yeniResim('pay', 'babaanne-pay-0', 'ep-poz ep-poz-0', 'Babaanne') + yeniResim('pay', 'babaanne-pay-1', 'ep-poz ep-poz-1', 'Babaanne alkışlar');
  // Babaanne masanın önünde (ayak tabanı y 930, örtünün altında çimende), 0,8 ölçekte; kenar payı ve sağ tabakla arası açık.
  // Terazi 0,8 ölçekte, direğin tabanı masada (y 700); mil, çubuğun mil deliği (450, 40) ve tabak kancası (130, 6) ölçekle birlikte.
  fonaYerlestir(babaanne, 1200, 386, 480, 560);
  const B = 0.8, MIL = { x: 836, y: 700 - (515 - 40) * B };
  const direk = document.createElement('div');
  direk.className = 'ep-direk';
  direk.innerHTML = yeniResim('pay', 'terazi-direk', 'ep-resim', 'direk');
  fonaYerlestir(direk, MIL.x - 150 * B, MIL.y - 40 * B, 300 * B, 520 * B);
  const cubuk = document.createElement('div');
  cubuk.className = 'ep-cubuk';
  fonaYerlestir(cubuk, MIL.x - 450 * B, MIL.y - 40 * B, 900 * B, 80 * B);
  const kavanoz = document.createElement('div');
  kavanoz.className = 'ep-kavanoz';
  fonaYerlestir(kavanoz, 200, 545, 210, 238);
  const tabakKatmani = document.createElement('div');
  tabakKatmani.className = 'ep-tabaklar';
  sahneEl.append(direk, cubuk, tabakKatmani, kavanoz, babaanne);
  let no = Math.min(t.secimler.length, sorular.length - 1);
  const durum = (d: string) => { sahneEl.dataset.durum = d; };
  const kurabiye = () => yeniResim('pay', 'kurabiye-yuvarlak', 'ep-kurabiye', '');
  function kur() {
    const q = sorular[no];
    babaanne.dataset.poz = '0';
    const halkalar = q.tabak === 2 ? [40, 860] : [40, 450, 860];
    cubuk.innerHTML = yeniResim('pay', q.tabak === 2 ? 'terazi-cubuk-2' : 'terazi-cubuk-3', 'ep-resim', 'çubuk');
    tabakKatmani.replaceChildren();
    sahneEl.dataset.soru = String(no);
    const sayilar = halkalar.map(() => 0);
    let kalan = q.kurabiye;
    const tabaklar = halkalar.map((_, i) => {
      const b = buton(tabakKatmani, (['Sol', 'Orta', 'Sağ'][q.tabak === 2 ? i * 2 : i]) + ' tabak', yeniResim('pay', 'askili-tabak', 'ep-resim', 'tabak') + '<span class="ep-icerik"></span>', () => koy(i), 'ep-tabak');
      return b;
    });
    function ciz() {
      const { aci, ortaInis } = teraziDurusu(sayilar);
      const r = (aci * Math.PI) / 180;
      cubuk.style.rotate = aci + 'deg';
      halkalar.forEach((hx, i) => {
        const dx = (hx - 450) * B;
        // Üçüncü askı, milin 30 piksel altındaki halkaya bağlıdır.
        const orta = q.tabak === 3 && i === 1;
        const dy = orta ? 30 * B : 0;
        const x = MIL.x + dx * Math.cos(r) - dy * Math.sin(r);
        const y = MIL.y + dx * Math.sin(r) + dy * Math.cos(r);
        const boy = (orta ? 240 + ortaInis : 240) * B;
        fonaYerlestir(tabaklar[i], x - 130 * B, y - (6 * boy) / 240, 260 * B, boy);
        tabaklar[i].querySelector('.ep-icerik')!.innerHTML = kurabiye().repeat(sayilar[i]);
      });
      kavanoz.innerHTML = yeniResim('pay', 'kurabiye-kavanozu', 'ep-resim', 'kavanoz') + '<span class="ep-kavanoz-ic">' + kurabiye().repeat(kalan) + '</span>';
      sahneEl.dataset.tabaklar = sayilar.join(',');
      sahneEl.dataset.kalan = String(kalan);
    }
    function koy(i: number) {
      if (kilit || sahneEl.dataset.durum !== 'koy' || kalan <= 0) return;
      kalan--;
      sayilar[i]++;
      oyunSesi('damla');
      ciz();
      if (kalan > 0) return;
      if (!esitMi(q, sayilar)) {
        durum('egik');
        soyle(sozler[PAY_SOZ.egildi]);
        sozBitince(() => {
          timer = window.setTimeout(() => {
            if (oturum !== token) return;
            sayilar.fill(0);
            kalan = q.kurabiye;
            ciz();
            durum('koy');
          }, 600);
        }, 3500);
        return;
      }
      durum('esit');
      // Her eşitlikte Babaanne alkışlar; sonraki soruda düşünme pozuna döner.
      babaanne.dataset.poz = '1';
      oyunSesi('parilti');
      tabaklar.forEach((b) => yenidenOynat(b, 'parla'));
      t.secimler.push(no);
      kaydet(k);
      sirayla([() => soyle(sozler[PAY_SOZ.esit]), () => adediOku(sayilar[0]), () => soyle(sozler[PAY_SOZ.ayni])], () => {
        if (oturum !== token) return;
        if (no + 1 >= sorular.length) { tamam(sozler[PAY_SOZ.afiyet]); return; }
        no++;
        kur();
      }, 200);
    }
    ciz();
    durum('koy');
    metin = sozler[q.tabak === 2 ? PAY_SOZ.ikiTabak : PAY_SOZ.ucTabak];
    soyle(metin);
  }
  void sesli;
  kur();
}
// ----- Ölçü tezgâhı · Boy Duvarı: hayvanın boyu, yanına üst üste dizilen tahtalarla ölçülür -----
// Astra'nın tuvali 700 × 900, ayak tabanı y = 860, bir tahta 160 px. Sahnede bir tahta TAHTA_BOY (cqw) yüksekliğinde;
// hayvan kutusu bu ölçekle büyür, ayak tabanı masanın çizgisine (TABAN) oturur. 5+ yaşta iki dost ölçülür, sonra
// "Hangisi daha uzun?" diye sorulur. Kayıt: t.yer bu hayvana konan tahta, t.secimler ölçülen hayvanların boyu.
const TAHTA_BOY = 6.2, TAHTA_EN = (TAHTA_BOY * 480) / 208, TABAN = 6.75;
const olcuYolu = (): OYol => (minik ? 'minik' : dortYas ? 'dort' : 'bes');
function hayvanPozla(el: HTMLElement, h: Hayvan, poz: number) {
  const c = olcuCizim(h + '-' + poz);
  if (!c) return;
  const img = el.querySelector('img') ?? el.appendChild(document.createElement('img'));
  img.src = c.src;
  img.alt = '';
  img.draggable = false;
  yerTutucuOturt(img, c, (BOY[h] * TUVAL.tahta) / TUVAL.boy, 1 - TUVAL.taban / TUVAL.boy);
  el.dataset.poz = String(poz);
}
function tahtaEl(sayi: number) {
  const e = document.createElement('span');
  e.className = 'bd-tahta';
  e.style.width = TAHTA_EN + 'cqw';
  e.style.height = TAHTA_BOY + 'cqw';
  e.innerHTML = olcuImg('tahta') + '<b>' + sayi + '</b>';
  return e;
}
function boyDuvari(t: Tur, sesli: boolean) {
  const hayvanlar = boyHayvanlari(olcuYolu(), t.tekrar ?? 0);
  const fon = olcuCizim('boy-kosesi');
  if (fon) kok.style.backgroundImage = 'url("' + fon.src + '")';
  const token = oturum;
  const sahneEl = alan('bd-sahne');
  const iki = hayvanlar.length === 2;
  // [hayvan kutusunun solu, yığının solu] (cqw)
  // Yığın hayvan kutusunun hemen sağında (Astra'nın hayvanları sağa dönük, tuvali doldurur); tahta kaynağı sağ altta.
  const yerler = iki ? [[0, 25.5], [40, 65.5]] : [[14, 39]];
  const kutuBoy = (TUVAL.boy / TUVAL.tahta) * TAHTA_BOY, kutuEn = (kutuBoy * TUVAL.en) / TUVAL.boy;
  const olculen = Math.min(t.secimler.length, hayvanlar.length);
  const karsilastir = iki && olculen >= 2;
  const aktif = Math.min(olculen, hayvanlar.length - 1);
  const yiginlar: HTMLElement[] = [];
  const kutular = hayvanlar.map((h, i) => {
    const he = document.createElement('button');
    he.type = 'button';
    he.className = 'bd-hayvan';
    he.dataset.hayvan = h;
    he.setAttribute('aria-label', h);
    he.disabled = true;
    he.style.cssText = 'left:' + yerler[i][0] + 'cqw;width:' + kutuEn + 'cqw;height:' + kutuBoy + 'cqw;bottom:' + (TABAN - (1 - TUVAL.taban / TUVAL.boy) * kutuBoy) + 'cqw';
    hayvanPozla(he, h, i < olculen ? 2 : 0);
    if (!karsilastir && i > aktif) he.classList.add('bekliyor');
    sahneEl.append(he);
    const y = document.createElement('div');
    y.className = 'bd-yigin';
    y.style.left = yerler[i][1] + 'cqw';
    y.style.bottom = TABAN + 'cqw';
    const dolu = i < olculen ? BOY[h] : i === aktif && !karsilastir ? Math.min(t.yer, BOY[h]) : 0;
    for (let n = 1; n <= dolu; n++) y.append(tahtaEl(n));
    sahneEl.append(y);
    yiginlar.push(y);
    return he;
  });
  if (karsilastir) {
    // 5+ yaş: iki dost da ölçüldü; daha uzun olana dokun.
    metin = SOZ.hangisi;
    const uzun = hayvanlar.reduce((a, b) => (BOY[b] > BOY[a] ? b : a));
    kutular.forEach((he, i) => {
      he.disabled = false;
      he.classList.add('secilebilir');
      he.onclick = () => {
        if (kilit) return;
        sesiAc();
        if (hayvanlar[i] !== uzun) { ipucu(he, SOZ.hangisi); return; }
        hayvanPozla(he, uzun, 2);
        he.classList.add('sevinc');
        yiginlar[i].lastElementChild?.classList.add('parla');
        (t.anlatilan ??= []).includes('boy-duvari') || t.anlatilan.push('boy-duvari');
        tamam();
      };
    });
    ipucunuTekrarla = () => soyle(metin);
    if (sesli) soyle(metin);
    return;
  }
  const h = hayvanlar[aktif], he = kutular[aktif], y = yiginlar[aktif];
  hayvanPozla(he, h, 1);
  metin = olculen === 0 ? SOZ.boyYonerge(h) : SOZ.boyIkinci(h);
  const ic = olcuCizim('tahta-yigini')
    ? olcuImg('tahta-yigini')
    : [0, 1, 2].map((k) => '<span class="yt-tahta yt-' + k + '">' + olcuImg('tahta') + '</span>').join('');
  const kaynakBtn = buton(sahneEl, 'Bir tahta koy', ic, koy, 'bd-kaynak');
  surukle(kaynakBtn, () => y.getBoundingClientRect(), koy);
  let bitti = false;
  function koy() {
    if (kilit || bitti || t.yer >= BOY[h]) return;
    const bas = parcaninKonumu(kaynakBtn);
    t.yer++;
    kaydet(k);
    const te = tahtaEl(t.yer);
    y.append(te);
    yerineOtur(bas, te.querySelector('img'));
    oyunSesi('kutu');
    adediOku(t.yer);
    if (t.yer >= BOY[h]) olctu();
  }
  function olctu() {
    bitti = true;
    kaynakBtn.disabled = true;
    hayvanPozla(he, h, 2);
    he.classList.add('sevinc');
    y.lastElementChild?.classList.add('parla');
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      if (!iki) {
        (t.anlatilan ??= []).includes('boy-duvari') || t.anlatilan.push('boy-duvari');
        tamam(SOZ.boySonuc(h));
        return;
      }
      // İki dost: sonucu söyle, sıradaki dosta geç.
      t.secimler.push(BOY[h]);
      t.yer = 0;
      kaydet(k);
      soyle(SOZ.boySonuc(h));
      sozBitince(() => { timer = window.setTimeout(() => oyna(true), 350); });
    }, 750);
  }
  ipucunuTekrarla = () => soyle(metin);
  if (t.yer >= BOY[h]) olctu();
  else if (sesli) soyle(metin);
}

// ----- Ölçü tezgâhı · Kurbağanın Yaprak Yolu: kıyıdan çiçeğe su yolu eşit yapraklarla uç uca kapanır -----
// Yapraklar göletin boş su şeridine (SERIT) soldan dizilir; çiçek yolun bittiği yerde durur. Yol tamamlanınca kurbağa
// yaprak yaprak zıplar, her zıplayış sayılır. Kayıt: t.yer konan yaprak.
function yaprakYolu(t: Tur, sesli: boolean) {
  const N = yaprakSayisi(olcuYolu(), t.tekrar ?? 0);
  const fon = olcuCizim('golet');
  if (fon) kok.style.backgroundImage = 'url("' + fon.src + '")';
  const token = oturum;
  const sahneEl = alan('yy-sahne');
  const SAHNE_BOY = 56.25;
  const yc = ((SERIT.ust + SERIT.alt) / 2) * SAHNE_BOY;
  const yEn = YAPRAK_EN * 100, yBoy = (yEn * 260) / 400;
  const yerX = (i: number) => (SERIT.sol + YAPRAK_EN * (i + 0.5)) * 100;
  const yapraklar = Array.from({ length: N }, (_, i) => {
    const e = document.createElement('div');
    e.className = 'yy-yaprak' + (i < t.yer ? '' : ' bos');
    e.style.cssText = 'left:' + yerX(i) + 'cqw;top:' + yc + 'cqw;width:' + yEn + 'cqw;height:' + yBoy + 'cqw';
    e.innerHTML = olcuImg('yaprak') + '<b>' + (i + 1) + '</b>';
    sahneEl.append(e);
    return e;
  });
  const cicek = document.createElement('div');
  cicek.className = 'yy-cicek';
  cicek.style.cssText = 'left:' + (yerX(N - 1) + yEn * 1.02) + 'cqw;top:' + (yc + yBoy * 0.35) + 'cqw';
  cicek.innerHTML = olcuImg('nilufer-cicegi');
  sahneEl.append(cicek);
  const KEN = 12;
  const kurbaga = document.createElement('div');
  kurbaga.className = 'yy-kurbaga';
  const kurbagaYer = (x: number) => { kurbaga.style.left = x + 'cqw'; kurbaga.style.top = yc - (KURBAGA_TUVAL.temas / KURBAGA_TUVAL.boy) * KEN + 'cqw'; };
  const kPoz = (p: number) => {
    const c = olcuCizim('kurbaga-' + p);
    if (!c) return;
    const img = kurbaga.querySelector('img') ?? kurbaga.appendChild(document.createElement('img'));
    img.src = c.src;
    img.alt = '';
    img.draggable = false;
    yerTutucuOturt(img, c, 0.78, 1 - KURBAGA_TUVAL.temas / KURBAGA_TUVAL.boy);
    kurbaga.dataset.poz = String(p);
  };
  kurbaga.style.width = KEN + 'cqw';
  kurbagaYer(SERIT.sol * 100 - KEN * 0.55);
  kPoz(0);
  sahneEl.append(kurbaga);
  const sepetBtn = buton(sahneEl, 'Bir yaprak koy', olcuImg(t.yer >= N ? 'sepet-bos' : 'sepet-dolu'), koy, 'yy-sepet');
  surukle(sepetBtn, () => yapraklar[Math.min(t.yer, N - 1)].getBoundingClientRect(), koy);
  metin = SOZ.yolYonerge;
  let tamamlandi = false;
  function koy() {
    if (kilit || tamamlandi || t.yer >= N) return;
    const bas = parcaninKonumu(sepetBtn);
    const e = yapraklar[t.yer];
    t.yer++;
    kaydet(k);
    e.classList.remove('bos');
    yerineOtur(bas, e.querySelector('img'));
    const h = olcuCizim('su-halkasi');
    if (h) {
      const r = document.createElement('img');
      r.className = 'yy-halka';
      r.src = h.src;
      r.alt = '';
      e.append(r);
      r.addEventListener('animationend', () => r.remove());
    }
    oyunSesi('kutu');
    adediOku(t.yer);
    if (t.yer >= N) yolHazir();
  }
  function yolHazir() {
    tamamlandi = true;
    sepetBtn.disabled = true;
    const bos = olcuCizim('sepet-bos');
    const si = sepetBtn.querySelector('img');
    if (bos && si) si.src = bos.src;
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      soyle(SOZ.yolHazir);
      sozBitince(() => { timer = window.setTimeout(() => zipla(0), 250); });
    }, 450);
  }
  function zipla(i: number) {
    if (oturum !== token) return;
    if (i === N) {
      kPoz(5);
      kurbaga.classList.add('sevinc');
      cicek.classList.add('sevinc');
      (t.anlatilan ??= []).includes('yaprak-yolu') || t.anlatilan.push('yaprak-yolu');
      timer = window.setTimeout(() => tamam(SOZ.yolSonuc(N)), 450);
      return;
    }
    kPoz(1);
    timer = window.setTimeout(() => {
      if (oturum !== token) return;
      const bas = kurbaga.getBoundingClientRect();
      kurbagaYer(yerX(i));
      const son = kurbaga.getBoundingClientRect();
      const dx = bas.left - son.left, dy = bas.top - son.top;
      kPoz(3);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        kurbaga.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px)' },
          { transform: 'translate(' + dx / 2 + 'px,' + (dy / 2 - son.height * 0.6) + 'px)', offset: 0.5 },
          { transform: 'none' },
        ], { duration: 460, easing: 'ease-in-out' });
      }
      timer = window.setTimeout(() => {
        if (oturum !== token) return;
        kPoz(4);
        yapraklar[i].classList.add('basildi');
        adediOku(i + 1);
        timer = window.setTimeout(() => zipla(i + 1), minik ? 620 : 520);
      }, 460);
    }, 140);
  }
  ipucunuTekrarla = () => soyle(metin);
  if (t.yer >= N) yolHazir();
  else if (sesli) soyle(metin);
}
function kuleTuru() {
  boncukSesiniKes();
  temiz('kule', 'kule-masasi');
  nav();
  const s = { kok, img, anlat: soyle, say: adediOku,
    sonra: (ms: number, fn: () => void) => { clearTimeout(timer); timer = window.setTimeout(fn, ms); },
    dinle: (fn: () => void) => { ipucunuTekrarla = fn; },
    sozBitince,
  };
  sahneyiKapat = sayiKulesi(s, () => {
    durum.sayi.kuleTamam = true;
    kaydet('sayi');
    oyna(true);
  }, durum.sayi.tekrar ?? 0);
}
function gezginiAc() {
  temiz('tangram', 'ay-yuzeyi');
  nav();
  const t = durum.sekil;
  sahneyiKapat = gezginOyna(t.gezginBulunan ??= [], {
    kok, resim: img, ucgenleriAra: !minik && !dortYas, sesiAc,
    kaydet: () => kaydet('sekil'),
    anlat: i => soyle(sozler[i]),
    ses: dogru => { if (dogru) oyunSesi('miknatis'); else yanlisSesi(); },
    tekrar: fn => { ipucunuTekrarla = fn; },
    bitir: () => { delete t.gezginBulunan; tamam(); },
  });
}
function parkurYasiUygun() {
  return (menuYasiOku() ?? 0) >= 5;
}
function misketiAc() {
  if (!parkurYasiUygun()) { menu(); return; }
  temiz('misket', null);
  nav();
  const oyun = misketParkuru({
    kok,
    ileri: img('hazirlik/dugmeler/oda-sag'),
    anlat: i => soyle(sozler[i]), sustur: susArtik,
    devam: basardi => {
      const t = durum.olcu;
      sahneyiKapat?.();
      sahneyiKapat = undefined;
      if (t.adim === sonu('olcu')) { hatirayiGoster(); return; }
      t.misketiGecti = true;
      kaydet('olcu');
      if (basardi && t.adim === 0 && !t.secimler.length) tamam();
      else oyna(true);
    },
  });
  sahneyiKapat = oyun.kapat;
  ipucunuTekrarla = oyun.tekrarAnlat;
}
function oyna(sesli = false) {
  if (k === 'olcu' && parkurYasiUygun() && durum.olcu.adim === 0 && !durum.olcu.misketiGecti && !durum.olcu.secimler.length) {
    misketiAc();
    return;
  }
  if (k === 'sekil' && durum.sekil.adim === sonu('sekil') - 1) {
    gezginiAc();
    return;
  }
  if (k === 'sayi' && !durum.sayi.kuleTamam) {
    kuleTuru();
    return;
  }
  // Ölçü tezgâhı: ikinci denge turu Bulut'un Tahterevalli Dengesi (Astra M13 ve sözleri tamamsa).
  if (k === 'olcu' && tahterevalliGorunur && tahterevalliYeri(tekrarYolu(), 'olcu', turNumarasi('olcu', durum.olcu.adim))) {
    temiz('ceren', null, !sesli);
    cilaEkrani = true;
    nav();
    sahneyiKapat = tahterevalliTuru({ kok, sesiAc, tekrarDinle: (fn) => { ipucunuTekrarla = fn; }, bitir: () => tamam(), tekrar: durum.olcu.tekrar ?? 0 });
    return;
  }
  temiz('oyun', k === 'fener' ? 'tiyatro' : 'masa', !sesli);
  const t = durum[k],
    n = turNumarasi(k, t.adim),
    asama = Math.floor(n / 4),
    tur = n % 4;
  nav();
  const pano = alan('pano'),
    masa = alan('tezgah');
  const bar = alan('ilerleme');
  if (k === 'olcu' && parkurYasiUygun()) buton(kok, 'Top Şelalesi parkurunu aç', img('matematik/misket-zili'), misketiAc, 'mk-giris');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', adlar[k]);
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(sonu(k)));
  bar.setAttribute('aria-valuenow', String(t.adim));
  for (let i = 0; i < 4; i++) {
    const pul = document.createElement('i');
    const bolum = Math.floor((t.adim * 4) / sonu(k));
    pul.className = i < bolum ? 'dolu' : i === bolum ? 'simdi' : '';
    bar.append(pul);
  }
  const cesit = (t.tekrar ?? 0) + (minik || dortYas ? t.adim : 0);
  const meyveTuru = meyve[t.tarif ?? ((tur + cesit) % meyve.length)];
  const sec = (i: number) => {
    oyunSesi('miknatis');
    ovgu();
    t.secimler.push(i);
    kaydet(k);
  };
  const yenile = () => oyna();
  const resimler = (id: string, sayi: number) => img(id).repeat(sayi);
  const hedef = () => (pano.querySelector('.sirada') ?? pano).getBoundingClientRect();
  function secenekler(ids: string[], beklenen: number, bitis: number) {
    ids.forEach((id, i) => {
      const yap = () => {
        if (kilit) return;
        if (i !== beklenen) {
          ipucu(b, sozler[50]);
          return;
        }
        sec(i);
        if (t.secimler.length >= bitis) {
          const eslesme = pano.querySelector('.sirada');
          if (eslesme) {
            eslesme.className = 'yuva yerinde';
            eslesme.innerHTML = img(id);
          }
          tamam();
        } else yenile();
      };
      const b = buton(masa, ['Kare', 'Üçgen', 'Daire', 'Dikdörtgen'][i], img(id), yap, 'parca');
      surukle(b, hedef, yap);
    });
  }
  const onceSaySonraPaylas = n === 9 || n === 13;
  const paylasmayaHazir = t.boncukHazir ?? t.secimler.length > 0;
  const yt = yeniTurAcik(k, n);
  if (yt === 'lokum') {
    ikiKase(t, sesli);
  } else if (yt === 'zipzip') {
    sakliFindik(t, sesli);
  } else if (yt === 'baba') {
    takimCantasi(t, sesli);
  } else if (yt === 'sandik') {
    elmaSandigi(t, sesli);
  } else if (yt === 'kurabiye') {
    kurabiyeTepsisi(t, sesli);
  } else if (yt === 'tren') {
    sayiTreni(t, sesli);
  } else if (yt === 'balon') {
    bulutunBalonlari(t, sesli);
  } else if (yt === 'kek') {
    kekFirini(t, sesli);
  } else if (yt === 'asansor') {
    lokumunAsansoru(t, sesli);
  } else if (yt === 'sekilbahce') {
    sekilBahcesi(t, sesli);
  } else if (yt === 'resim') {
    resimYap(t, sesli);
  } else if (yt === 'buyuyen') {
    buyuyenFenerler(t, sesli);
  } else if (yt === 'bayrak') {
    senlikBayraklari(t, sesli);
  } else if (yt === 'calgi') {
    kinoSurdursun(t, sesli);
  } else if (yt === 'surahi') {
    anneninSurahileri(t, sesli);
  } else if (yt === 'yarim') {
    butunVeYarim(t, sesli);
  } else if (yt === 'gun') {
    kinonunGunu(t, sesli);
  } else if (yt === 'ritim') {
    ritmikZiplama(t, sesli);
  } else if (yt === 'pay') {
    esitPaylasim(t, sesli);
  } else if (yt === 'roket') {
    roketGeriSayimi(t, sesli);
  } else if (yt === 'kelebek') {
    kelebeginKanadi(t, sesli);
  } else if (yt === 'grafik') {
    meyveGrafigi(t, sesli);
  } else if (yt === 'saklambac') {
    lokumlaSaklambac(t, sesli);
  } else if (yt === 'kaydirak') {
    kaydirakSirasi(t, sesli);
  } else if (yt === 'sofra') {
    kinoAileSofrasi(t, sesli);
  } else if (yt === 'eskart') {
    esKartlar(t, sesli);
  } else if (yt === 'kutu') {
    sekilKutusu(t, sesli);
  } else if (k === 'sayi' && hizliMi(n)) {
    hizliGozler(t, n, pano, masa, sesli);
  } else if (k === 'sayi' && n === 4) {
    metin = sozler[72];
    const ilk = cesit % 3, ikinci = (ilk + 1) % 3;
    const liste = [ilk, ikinci];
    if (!minik) liste.push(ilk);
    if (!minik && !dortYas) liste.push(ikinci, (ilk + 2) % 3);
    pano.classList.add('piknik-pazar');
    pano.innerHTML = '<div class="pazar-fis">' + liste.map(i=>img(meyve[i])).join('') + '</div>';
    const sepet = document.createElement('div');
    sepet.className = 'siparis-sepet'; sepet.innerHTML = img('sef/piknik/sepet'); pano.append(sepet);
    t.secimler.forEach((i,j)=>buton(sepet,'Sepetten meyveyi al',img(meyve[i]),()=>{
      if(kilit)return;
      t.secimler.splice(j,1);kaydet(k);yenile();
    },'sepette-meyve'));
    meyve.forEach((id,i)=>{
      const ekle = () => {
        if(kilit)return;
        if(t.secimler.length >= liste.length + 1){soyle(sozler[73]);return;}
        const bas = parcaninKonumu(b);
        sec(i); yenile();
        yerineOtur(bas, kok.querySelector('.sepette-meyve:last-child img'));
      };
      const b=buton(masa,['Elma','Armut','Mandalina'][i],img(id),ekle,'parca');
      surukle(b,()=>sepet.getBoundingClientRect(),ekle);
    });
    buton(kok,'Piknik sepetini gönder',glyph('ok'),()=>{
      if(kilit)return;
      const ayni = liste.length === t.secimler.length && meyve.every((_,i)=>
        liste.filter(v=>v===i).length === t.secimler.filter(v=>v===i).length);
      if(!ayni){soyle(sozler[73]);ipucuHedefi(pano.firstElementChild!);return;}
      sepet.classList.add('teslim-edildi');tamam();
    },'onay');
  } else if (k === 'sekil' && n === 0) {
    const parcalar = ['tekne-govde','tekne-direk','tekne-yelken'];
    const parcaResmi = (i:number)=>img('hazirlik/kres/'+parcalar[i]);
    kok.classList.add('liman-sahnesi');
    kok.style.backgroundImage='url("'+url('matematik/liman')+'")';
    pano.classList.add('tekne-denizi');
    const tekne = document.createElement('div');tekne.className='kurulan-tekne';pano.append(tekne);
    parcalar.forEach((ad,i)=>{
      const kat=document.createElement('span');kat.className=ad+(i<t.secimler.length?' takildi':'');
      kat.innerHTML=parcaResmi(i);tekne.append(kat);
    });
    if(t.secimler.length<3){
      metin=sozler[70];
      [2,0,1].filter(i=>i>=t.secimler.length).forEach(i=>{
        const tak=()=>{
          if(kilit)return;
          if(i!==t.secimler.length){ipucu(b);ipucuHedefi(tekne.children[t.secimler.length]);return;}
          const bas = parcaninKonumu(b);
          sec(i);oyna(t.secimler.length===3);
          yerineOtur(bas, kok.querySelector('.kurulan-tekne .' + parcalar[i] + ' img'));
        };
        const b=buton(masa,['Gövde','Direk','Üçgen yelken'][i],parcaResmi(i),tak,'parca');
        surukle(b,()=>tekne.getBoundingClientRect(),tak);
      });
    } else {
      metin=sozler[71];
      const liman=buton(pano,'Deniz fenerine yanaş',glyph('ok'),yuzdur,'tekne-limani');
      const yelken=buton(tekne,'Tekneyi yüzdür','',()=>ipucuHedefi(liman),'yelken-tut');
      function yuzdur(){
        if(kilit)return;
        const bas = tekne.getBoundingClientRect();
        tekne.style.transition='none';
        tekne.style.translate='';
        tekne.classList.add('limana-git');
        const son = tekne.getBoundingClientRect();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          tekne.animate([{translate:(bas.left-son.left)+'px '+(bas.top-son.top)+'px'},{translate:'0 0'}],{duration:650,easing:'ease-out'});
        }
        tamam();
      }
      let parmak = -1, basX = 0, basY = 0;
      yelken.onpointerdown = e => {
        if (!e.isPrimary || e.button !== 0 || kilit) return;
        parmak=e.pointerId; basX=e.clientX;basY=e.clientY;
        yelken.setPointerCapture(parmak); sesiAc();
      };
      yelken.onpointermove = e => {
        if(e.pointerId!==parmak)return;
        tekne.style.translate=Math.max(-pano.clientWidth*.1,Math.min(pano.clientWidth*.63,e.clientX-basX))+'px '+Math.max(-pano.clientHeight*.18,Math.min(pano.clientHeight*.18,e.clientY-basY))+'px';
      };
      yelken.onpointerup = e => {
        if(e.pointerId!==parmak)return;
        parmak=-1;
        const ulasti=tekne.getBoundingClientRect().right>=liman.getBoundingClientRect().left;
        if(ulasti)yuzdur(); else tekne.style.translate='';
      };
      yelken.onpointercancel=()=>{parmak=-1;tekne.style.translate='';};
    }
  } else if (k === 'sayi' && (n === 2 || n === 5 || (onceSaySonraPaylas && paylasmayaHazir))) {
    const pay = n < 5 ? 1 : n < 13 ? 2 : 3,
      kisi = n < 9 ? 2 : 3;
    metin = sozler[17];
    pano.classList.add('sofra');
    if (!t.secimler.length) {
      const tepsi = alan('piknik-secimi');
      meyve.forEach((id, i) => {
        const b = buton(tepsi, ['Elmalı piknik', 'Armutlu piknik', 'Mandalinalı piknik'][i], img(id), () => {
          t.tarif = i;
          kaydet(k);
          oyunSesi('kutu');
          yenile();
        });
        b.setAttribute('aria-pressed', String(id === meyveTuru));
      });
    }
    const tabaklar = Array.from({ length: kisi }, (_, i) => {
      const say = t.secimler.filter((x) => x === i).length;
      const b = buton(pano, 'Tabak ' + (i + 1), resimler(meyveTuru, say), () => ver(i), 'tabak');
      return b;
    });
    function ver(i: number) {
      if (kilit) return;
      const tabak = tabaklar[i];
      if (t.secimler.filter((x) => x === i).length >= pay) {
        ipucu(tabak, sozler[54]);
        return;
      }
      sec(i);
      if (t.secimler.length === pay * kisi) {
        tabak.insertAdjacentHTML('beforeend', img(meyveTuru));
        masa.replaceChildren();
        tamam();
      } else yenile();
    }
    const kalan = pay * kisi - t.secimler.length;
    const paylas = () => {
      tabaklar[0].focus();
      tabaklar.forEach(ipucuHedefi);
    };
    const sepet = document.createElement('div');
    sepet.className = 'sepet';
    masa.append(sepet);
    for (let j = 0; j < kalan; j++) {
      buton(sepet, 'Meyveyi tabağa taşı', img(meyveTuru), paylas, 'pay-meyvesi');
    }
    // Dokunarak tabak seçimi ve meyveyi istenen tabağa bırakma aynı işlemi kullanır.
    let secilen = -1;
    sepet.querySelectorAll('button').forEach((meyve) =>
      surukle(
        meyve,
        (e) => {
          secilen = tabaklar.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          });
          return tabaklar[secilen]?.getBoundingClientRect();
        },
        () => ver(secilen),
      ),
    );
  } else if (k === 'sayi' && [3, 7, 10, 14].includes(n)) {
    const hedefM = [
      [2, 4, 6, 8],
      [1, 3, 5, 7],
      [0, 2, 6, 9],
    ][(t.tekrar ?? 0) % 3][asama];
    metin = sozler[20];
    pano.innerHTML = '<strong>' + hedefM + '</strong>';
    if (t.secimler.length) {
      metin = 'Yeşil noktadan başla. Parmağınla rakamın yolunu izle.';
      pano.innerHTML = hedefM
        ? resimler(meyveTuru, hedefM)
        : '<span class="tabak bos-tabak" aria-label="Boş tabak"></span>';
      masa.classList.add('yazim');
      rakamAtolyesi(
        masa,
        hedefM,
        () => tamam(sozler[31 + hedefM]),
        t.cizim,
        (satir, nokta) => {
          t.cizim = { satir, nokta };
          kaydet(k);
        },
      );
    } else {
      const farklar = [-1, 0, 1];
      for (let i = 0; i < 3; i++) {
        const adet = hedefM === 0 ? (i + tur + asama + 2) % 3 : hedefM + farklar[(i + tur + asama) % 3];
        const b = buton(
          masa,
          'Tabak ' + (i + 1),
          resimler(meyveTuru, adet),
          () => {
            if (kilit) return;
            if (adet === hedefM) {
              sec(i);
              oyna(true);
            } else ipucu(b);
          },
          'tabak',
        );
      }
    }
  } else if (k === 'sekil' && (n === 1 || n === 9)) {
    metin = sozler[5];
    const parcalar = ['matematik/dikdortgen', 'matematik/daire', 'matematik/tas'];
    const ad = ['Gövde', 'Tekerlek', 'Kare kabin'];
    const yerler = ['govde', 'arka-teker', 'on-teker', 'kabin'];
    const yerinParcasi = [0, 1, 1, 2];
    const araba = document.createElement('div');
    araba.className = 'blok-araba';
    pano.append(araba);
    // Gövdesi hazır küçük araba, iki yaştaki oyuncuyu doğrudan tekerleklere getirir.
    const hazir = minik ? [0] : [];
    const takilan = [...hazir, ...t.secimler];
    const sira = takilan.length;
    if (sira >= yerler.length) { tamam(); return; }
    const gereken = yerinParcasi[sira];
    yerler.forEach((yer, i) => {
      const el = document.createElement('span');
      el.className = yer + (i < sira ? ' takildi' : i === sira ? ' sirada' : '');
      el.innerHTML = img(parcalar[yerinParcasi[i]]);
      araba.append(el);
    });
    const adaylar = minik && gereken === 1 ? [1, 2] : [0, 1, 2];
    adaylar.forEach(i => {
      const tak = () => {
        if (kilit) return;
        if (i !== gereken) {
          ipucu(b);
          ipucuHedefi(araba.children[sira]);
          return;
        }
        const bas = parcaninKonumu(b);
        sec(i);
        if (sira < 3) yenile();
        else {
          araba.children[sira].className = 'kabin takildi';
          araba.classList.add('yola-cik');
          tamam();
        }
        yerineOtur(bas, kok.querySelector('.blok-araba .' + yerler[sira] + ' img'));
      };
      const b = buton(masa, ad[i], img(parcalar[i]), tak, 'parca');
      surukle(b, () => araba.children[sira].getBoundingClientRect(), tak);
    });
  } else if (k === 'sekil' && [4, 5].includes(n)) {
    const kule = n === 4 ? [0, 1] : [3, 0, 1];
    const bloklar = n === 4 ? sekil : yeniBloklar;
    metin = sozler[21];
    pano.classList.add('insaat');
    const bina = (ornek: boolean) => {
      const el = document.createElement('div');
      el.className = 'bina';
      kule.forEach((v, i) => {
        const kat = document.createElement('span');
        kat.className =
          'yapi-kati' +
          (ornek || i < t.secimler.length ? ' yerinde' : ' golge') +
          (!ornek && i === t.secimler.length ? ' sirada' : '');
        kat.innerHTML = img(bloklar[v]);
        el.append(kat);
      });
      pano.append(el);
      return el;
    };
    bina(true);
    const yapi = bina(false);
    bloklar.forEach((id, i) => {
      const kat = yapi.children[t.secimler.length];
      const yerlestir = () => {
        if (kilit) return;
        if (i !== kule[t.secimler.length]) {
          ipucu(b, sozler[49]);
          return;
        }
        sec(i);
        kat.className = 'yapi-kati yerinde';
        if (t.secimler.length === kule.length) tamam();
        else yenile();
      };
      const b = buton(
        masa,
        ['Kare blok', 'Üçgen çatı', 'Daire', 'Dikdörtgen taban'][i],
        img(id),
        yerlestir,
        'parca',
      );
      surukle(b, () => yapi.getBoundingClientRect(), yerlestir);
    });
  } else if (k === 'sekil' && [2, 6, 10, 14].includes(n)) {
    const rotalar = [[0], [2], [1, 0], [2, 1, 0]],
      rota = rotalar[asama],
      konum = rota[t.secimler.length];
    const komut = ['Topu evin soluna koy.', 'Topu evin üstüne koy.', 'Topu evin sağına koy.'];
    metin = komut[konum];
    pano.classList.add('konum-masa');
    pano.innerHTML = '<div class="minik-ev">' + img('canlan/ev') + '</div>';
    const hedefler = komut.map((ad, i) => buton(pano, ad, '', () => birak(i), 'yer-hedef yer-' + i));
    function birak(i: number) {
      if (kilit) return;
      if (i !== konum) {
        ipucu(hedefler[i]);
        return;
      }
      sec(i);
      if (t.secimler.length === rota.length) {
        hedefler[i].innerHTML = img(sekil[2]);
        masa.replaceChildren();
        tamam();
      } else oyna(true);
    }
    if (t.secimler.length) hedefler[t.secimler.at(-1)!].innerHTML = img(sekil[2]);
    const top = buton(
      masa,
      'Topu taşı',
      img(sekil[2]),
      () => {
        hedefler[konum].focus();
        soyle(metin);
      },
      'parca',
    );
    let j = -1;
    surukle(
      top,
      (e) => {
        j = hedefler.findIndex((h) => {
          const r = h.getBoundingClientRect();
          return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        return hedefler[j]?.getBoundingClientRect();
      },
      () => birak(j),
    );
  } else if (k === 'sekil' && [3, 7, 11, 15].includes(n)) {
    const dizi = asama < 2 ? [0, 1, 2] : [0, 3, 1, 2];
    metin = sozler[22];
    const secim = dizi[t.secimler.length];
    dizi.forEach((v, i) => {
      const el = document.createElement('span');
      el.className =
        'yuva ' + (i < t.secimler.length ? 'yerinde' : i === t.secimler.length ? 'bos sirada' : 'bos');
      if (i < t.secimler.length) el.innerHTML = img('hazirlik/etkinlik/tohum-' + v);
      pano.append(el);
    });
    [...dizi].reverse().forEach((v) => {
      if (t.secimler.includes(v)) return;
      const id = 'hazirlik/etkinlik/tohum-' + v;
      const yap = () => {
        if (kilit) return;
        if (v !== secim) {
          ipucu(b);
          return;
        }
        sec(v);
        if (t.secimler.length === dizi.length) {
          pano.lastElementChild!.innerHTML = img(id);
          tamam();
        } else yenile();
      };
      const b = buton(masa, 'Bitkinin gelişim resmi ' + v, img(id), yap, 'parca');
      surukle(b, hedef, yap);
    });
  } else if (k === 'olcu' && [2, 7, 11, 14].includes(n)) {
    const agirlik = [2, 3, 5, 6][asama];
    metin = 'İki kefeyi dengele. Sağ kefeye taş ekle ya da sağdaki taşı geri al.';
    pano.classList.add('terazi');
    pano.innerHTML =
      '<div class="ayak">' +
      img('matematik/terazi-taban') +
      '</div><div class="kol">' +
      img('matematik/terazi-kol') +
      '</div>';
    const kol = pano.querySelector<HTMLElement>('.kol')!;
    function kefeleriGoster() {
      const egim = Math.max(-8, Math.min(8, (t.yer - agirlik) * 2));
      kol.style.setProperty('--egim', egim + 'deg');
      sagTaslar.innerHTML = resimler(sekil[0], t.yer);
    }
    const kefe = (sagda: boolean) => {
      const el = document.createElement(sagda ? 'button' : 'div');
      el.className = 'kefe ' + (sagda ? 'sag' : 'sol');
      el.innerHTML = img('matematik/terazi-kefe') + '<span></span>';
      if (sagda) {
        el.setAttribute('aria-label', 'Sağ kefeden bir taş al');
        el.onclick = () => tasiDegistir(-1);
      } else el.lastElementChild!.innerHTML = resimler(sekil[0], agirlik);
      kol.append(el);
      return el;
    };
    kefe(false);
    const sagTaslar = kefe(true).lastElementChild!;
    kefeleriGoster();
    function tasiDegistir(fark: number) {
      const yeni = t.yer + fark;
      if (kilit || yeni < 0 || yeni > 8) return;
      t.yer = yeni;
      kaydet(k);
      oyunSesi('kutu');
      kefeleriGoster();
    }
    const ekle = () => {
      if (kilit || t.yer >= 8) return;
      const bas = parcaninKonumu(tas);
      tasiDegistir(1);
      yerineOtur(bas, sagTaslar.lastElementChild);
    };
    const tas = buton(masa, 'Sağ kefeye taş ekle', img(sekil[0]), ekle, 'parca');
    surukle(tas, () => pano.querySelector('.sag')?.getBoundingClientRect(), ekle);
    const ok = buton(
      kok,
      'Teraziyi kontrol et',
      glyph('ok'),
      () => {
        if (kilit) return;
        // İlk terazide neden dengede olduğunu anlatır; ikincisinde iki kefedeki taş sayısını söyler.
        if (t.yer === agirlik) tamam(ilkAciklama() ? sozler[46] : sozler[31 + agirlik]);
        else ipucu(ok, sozler[52]);
      },
      'onay',
    );
  } else if (k === 'olcu' && [3, 6, 9, 15].includes(n)) {
    const enAz = asama % 2 === 1;
    metin = sozler[enAz ? 24 : 23];
    const adetler = minik ? [1, 2, 3] : [2, 3 + asama, 5 + asama];
    kok.style.backgroundImage = 'url("' + url('matematik/manav-tezgahi') + '")';
    pano.classList.add('manav-raflari');
    masa.classList.add('manav-teslim');
    masa.innerHTML = '<span class="manav-sepeti" aria-hidden="true">' + img('sef/piknik/sepet') + '</span>';
    const ornek = enAz ? 0 : 2;
    // Son iki turda karşılaştırmadan önce üç rafın eksiğini çocuk tamamlar.
    const dagit = n >= 9 ? [1, 2, 0] : [];
    const bekleyen = dagit.slice(t.secimler.length);
    if (bekleyen.length) metin = sozler[51];
    const sutunlar: HTMLButtonElement[] = [];
    const meyveAdlari = ['Elma', 'Armut', 'Mandalina'];
    const kapasite = Math.max(...adetler);
    pano.style.setProperty('--goz', String(kapasite));
    for (let i = 0; i < 3; i++) {
      const idx = (i + tur + asama) % 3;
      const eksik = Number(bekleyen.includes(i));
      const b = buton(
        pano,
        meyveAdlari[i] + ' rafı',
        '<span class="manav-gozleri">' + Array.from({length: kapasite}, (_, goz) =>
          '<span>' + (goz < adetler[idx] - eksik ? img(meyve[i]) : '') + '</span>'
        ).join('') + '</span>',
        () => {
          if (kilit) return;
          if (bekleyen.length) {
            yerlestir(i);
            return;
          }
          if (idx === ornek) {
            b.classList.add('manav-secildi');
            adediOku(adetler[idx]);
            tamam();
          } else ipucu(b, sozler[48]);
        },
        'sutun',
      );
      b.style.backgroundImage = 'url("' + url('matematik/manav-rafi') + '")';
      sutunlar.push(b);
    }
    function yerlestir(i: number) {
      if (kilit || !bekleyen.length) return;
      if (i !== bekleyen[0]) {
        ipucu(sutunlar[i]);
        return;
      }
      const kaynak = masa.querySelector('button');
      const bas = kaynak && parcaninKonumu(kaynak);
      sec(i);
      oyna(bekleyen.length === 1);
      const raf = kok.querySelectorAll('.sutun')[i];
      const meyveler = raf.querySelectorAll('img');
      if (bas) yerineOtur(bas, meyveler[meyveler.length - 1]);
    }
    if (bekleyen.length) {
      const tasinacak = bekleyen[0];
      const meyveDugmesi = buton(
        masa,
        meyveAdlari[tasinacak] + ' meyvesini rafa taşı',
        img(meyve[tasinacak]),
        () => { soyle(metin); hareketIpucu(meyveDugmesi, sutunlar[tasinacak]); },
        'manav-meyvesi',
      );
      let j = -1;
      surukle(
        meyveDugmesi,
        (e) => {
          j = sutunlar.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          });
          return sutunlar[j]?.getBoundingClientRect();
        },
        () => yerlestir(j),
      );
    }
  } else if (k === 'fener' && (n === 10 || n === 14)) {
    const kus = alan('kukla-kusu besteci-kus');
    kus.setAttribute('aria-hidden', 'true');
    const uzunluk = n === 10 ? 2 : 3;
    const hazir = t.secimler.length >= uzunluk;
    metin = hazir ? sozler[59] : sozler[n === 10 ? 57 : 58];
    pano.classList.add('beste');
    const partisyon = document.createElement('div');
    partisyon.className = 'partisyon';
    pano.append(partisyon);
    for (let i = 0; i < uzunluk * 2; i++) {
      const yuva = document.createElement('span');
      yuva.className = 'nota-yeri' + (i === t.secimler.length ? ' sirada' : '');
      if (i < t.secimler.length) yuva.innerHTML = img(lamba[t.secimler[i]]);
      partisyon.append(yuva);
    }
    function nota(i: number, yuva: Element) {
      kusSoyle(kus);
      fenerSesi(i);
      yuva.animate([{ backgroundColor: '#ffed8a' }, { backgroundColor: '#fff3cd' }], { duration: 450 });
    }
    function dinlet() {
      if (kilit || !t.secimler.length) {
        if (!kilit) soyle(metin);
        return;
      }
      clearTimeout(timer);
      susArtik();
      masa.inert = true;
      const tok = oturum;
      let i = 0;
      function cal() {
        if (tok !== oturum || document.hidden || uygulamaArkada) return;
        if (i >= Math.min(uzunluk, t.secimler.length)) {
          masa.inert = false;
          return;
        }
        nota(t.secimler[i], partisyon.children[i]);
        i++;
        timer = window.setTimeout(cal, 650);
      }
      cal();
    }
    lamba.slice(0, minik ? 2 : dortYas ? 3 : 4).forEach((id, i) => {
      const b = buton(
        masa,
        'Fener ' + (i + 1),
        img(id),
        () => {
          if (kilit || masa.inert) return;
          if (!hazir && t.secimler.includes(i)) {
            ipucu(b, sozler[60]);
            return;
          }
          if (hazir && i !== t.secimler[t.secimler.length - uzunluk]) {
            ipucu(b);
            dinlet();
            return;
          }
          const yer = partisyon.children[t.secimler.length];
          t.secimler.push(i);
          kaydet(k);
          nota(i, yer);
          yer.innerHTML = img(id);
          if (t.secimler.length === 2 * uzunluk) {
            const dizi = [...t.secimler];
            kilit = true;
            masa.inert = true;
            let j = 0;
            const tok = oturum;
            const cal = () => {
              if (tok !== oturum || document.hidden || uygulamaArkada) return;
              if (j === dizi.length) {
                kilit = false;
                tamam(sozler[61]);
                return;
              }
              nota(dizi[j], partisyon.children[j]);
              j++;
              timer = window.setTimeout(cal, 420);
            };
            timer = window.setTimeout(cal, 550);
          } else oyna(t.secimler.length === uzunluk);
        },
        'parca',
      );
    });
    // Tamamlanan bestenin çalınışı sırasında sayfa kapanırsa ilerleme yine kaybolmaz.
    if (t.secimler.length >= 2 * uzunluk) {
      tamam(sozler[61]);
      return;
    }
    if (t.secimler.length) {
      buton(pano, 'Kendi sıranı dinle', glyph('play'), dinlet, 'beste-dinle');
    }
  } else if (k === 'fener' && [3, 7, 11, 15].includes(n)) {
    // Her yaşın Fener sırası örüntüyle başlar (tur-sirasi.ts): ilk turda tanıtan, kısa örüntü.
    const ilkOyun = t.adim === 0;
    const motifler = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]];
    const motif = motifler[asama];
    const cesitSayisi = ilkOyun || minik ? 2 : asama === 3 ? 4 : 3;
    const ilk = (t.tekrar ?? 0) + (minik || dortYas ? t.adim : asama);
    const sembol = (v: number) => (ilk + v) % lamba.length;
    const dizi = Array.from({length: motif.length * (minik || !asama ? 2 : 3)}, (_, i) => sembol(motif[i % motif.length]));
    const bosAdet = [1, 2, 2, 3][asama];
    const ilkBos = dizi.length - bosAdet;
    metin = sozler[ilkOyun ? 77 : bosAdet === 1 ? 75 : 76];
    pano.classList.add('kus-partisyonu');
    masa.classList.add('muzik-tuslari');
    const sahneKusu = alan('muzik-kuklasi', '<span class="kukla-kusu"></span><span class="asili-fener">' + img('matematik/hatira-fener') + '</span><span class="cubuklu-kukla"></span>');
    sahneKusu.setAttribute('aria-hidden', 'true');
    const kus = sahneKusu.firstElementChild as HTMLElement;
    const kukla = sahneKusu.lastElementChild as HTMLElement;
    kukla.innerHTML = img(lamba[dizi[0]]);
    const hucreler: HTMLElement[] = [];
    for (let i = 0; i < dizi.length; i += motif.length) {
      const olcu = document.createElement('div');
      olcu.className = 'nota-grubu';
      pano.append(olcu);
      for (let j = 0; j < motif.length; j++) {
        const hucre = document.createElement('span');
        hucre.className = 'ritim-yuvasi';
        const sira = i + j;
        if (sira < ilkBos + t.secimler.length) hucre.innerHTML = img(lamba[dizi[sira]]);
        else hucre.classList.add('bos-nota');
        olcu.append(hucre);
        hucreler.push(hucre);
      }
    }
    const token = oturum;
    let bekleyenSes: HTMLAudioElement | undefined;
    function vurus(i: number) {
      const nota = dizi[i];
      pano.querySelector('.vurus')?.classList.remove('vurus');
      hucreler[i].classList.add('vurus');
      kusSoyle(kus);
      sahneKusu.style.setProperty('--isik', renkler[nota]);
      kukla.innerHTML = img(lamba[nota]);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        kukla.getAnimations().forEach(a => a.cancel());
        kukla.animate([{translate:'0 65%', rotate:'-8deg'}, {translate:'0 -3%', offset:.7}, {translate:'0 0', rotate:'0deg'}], { duration:330 });
      }
      fenerSesi(nota, i % motif.length === 0 ? .95 : .75);
    }
    function akisiKes() {
      clearTimeout(timer);
      if (bekleyenSes) bekleyenSes.removeEventListener('ended', ornek);
      bekleyenSes = undefined;
      pano.querySelector('.vurus')?.classList.remove('vurus');
    }
    function dinlet(final: boolean) {
      akisiKes();
      susArtik();
      if (final) { kilit = true; masa.inert = true; sahneKusu.classList.add('konser'); }
      const adet = final ? dizi.length : ilkOyun ? ilkBos : motif.length;
      let sira = 0;
      function ilerle() {
        if (oturum !== token || document.hidden || uygulamaArkada) return;
        if (sira === adet) {
          pano.querySelector('.vurus')?.classList.remove('vurus');
          // Tamamlanan kuş şarkısının çalınışı ödüldür; "Senin ışık gösterin!" yalnız çocuğun kendi bestesinde.
          if (final) { kilit = false; tamam(); }
          return;
        }
        vurus(sira++);
        timer = window.setTimeout(ilerle, (minik ? 670 : 540) + (sira % motif.length === 0 ? 175 : 0));
      }
      ilerle();
    }
    function ornek() {
      if (oturum === token && !kilit && !document.hidden && !uygulamaArkada) dinlet(false);
    }
    function sirayiGoster() {
      pano.querySelector('.sirada')?.classList.remove('sirada');
      hucreler[ilkBos + t.secimler.length]?.classList.add('sirada');
    }
    sirayiGoster();
    const tuslar = Array.from({length: cesitSayisi}, (_, i) => sembol((i + 1) % cesitSayisi));
    tuslar.forEach(nota => {
      function yerlestir() {
        if (kilit) return;
        akisiKes();
        const i = ilkBos + t.secimler.length;
        if (nota !== dizi[i]) { ipucu(b); ornek(); return; }
        susArtik();
        const yer = hucreler[i];
        yer.innerHTML = img(lamba[nota]);
        yer.classList.remove('bos-nota');
        t.secimler.push(nota);
        kaydet(k);
        vurus(i);
        sirayiGoster();
        if (t.secimler.length === bosAdet) {
          kilit = true;
          timer = window.setTimeout(() => dinlet(true), 650);
        }
      }
      const b = buton(masa, fenerAdlari[nota], img(lamba[nota]), yerlestir, 'parca muzik-tusu');
      b.style.setProperty('--tus', renkler[nota]);
      surukle(b, () => pano.querySelector('.sirada')?.getBoundingClientRect(), yerlestir);
    });
    ipucunuTekrarla = ornek;
    if (t.secimler.length >= bosAdet) dinlet(true);
    else if (sesli) {
      soyle(metin);
      bekleyenSes = ses;
      bekleyenSes?.addEventListener('ended', ornek, {once: true});
      timer = window.setTimeout(ornek, bekleyenSes ? 12000 : 550);
    }
  } else if (k === 'sayi' && [8, 11, 12, 15].includes(n)) {
    const cikar = n >= 12,
      a = cikar ? (n === 15 ? 10 : 6) : n === 8 ? 2 : 4,
      b = n === 8 ? 2 : n === 11 ? 3 : n === 12 ? 2 : 4,
      istenen = cikar ? a - b : a + b;
    metin = sozler[cikar ? 19 : 18];
    const sag = t.secimler.length,
      sol = cikar ? a - sag : a + sag;
    const kutu = document.createElement('div');
    kutu.className = 'meyve-kasa';
    kutu.innerHTML = resimler(meyve[0], sol);
    pano.append(kutu);
    if (cikar) {
      const istek = document.createElement('span');
      istek.className = 'siparis';
      istek.textContent = String(istenen);
      kutu.prepend(istek);
    }
    const tasinacak = cikar ? sol : b - sag;
    const nesne = document.createElement('div');
    nesne.className = 'meyve-kasa ikinci';
    nesne.innerHTML = resimler(meyve[0], cikar ? sag : tasinacak);
    masa.append(nesne);
    const kaynakKasa = cikar ? kutu : nesne,
      hedefKasa = cikar ? nesne : kutu;
    const aktar = () => {
      if (kilit) return;
      sec(0);
      if (!cikar && t.secimler.length === b) {
        adediOku(istenen);
        hedefKasa.insertAdjacentHTML('beforeend', img(meyve[0]));
        kaynakKasa.replaceChildren();
        tamam();
      } else yenile();
    };
    kaynakKasa.querySelectorAll('img').forEach((el) => {
      const btn = buton(kaynakKasa, 'Bir elma taşı', el.outerHTML, aktar, 'meyve-tane');
      el.remove();
      surukle(btn, () => hedefKasa.getBoundingClientRect(), aktar);
    });
    if (cikar) {
      const geri = () => {
        if (kilit || !sag) return;
        t.secimler.pop();
        kaydet(k);
        yenile();
      };
      nesne.querySelectorAll('img').forEach((el) => {
        const dugme = buton(nesne, 'Bir elmayı geri taşı', el.outerHTML, geri, 'meyve-tane');
        surukle(dugme, () => kutu.getBoundingClientRect(), geri);
        el.remove();
      });
      const onay = buton(
        kok,
        'Kalanı kontrol et',
        glyph('ok'),
        () => {
          if (sol === istenen) {
            adediOku(sol);
            tamam();
          } else ipucu(onay, sozler[53]);
        },
        'onay',
      );
    }
  } else if (k === 'sayi') {
    const hedefSayi = [1, 2, 3, 2, 3, 4, 5, 4, 5, 6, 7, 8, 7, 9, 9, 10][n],
      hazir = asama === 2 ? hedefSayi - 2 : asama === 3 ? 10 : 0,
      adet = asama < 2 ? 5 : 10;
    const say = t.secimler.length ? t.yer : hazir;
    metin =
      asama === 2
        ? 'Boncukların bir kısmı hazır. Her meyveye bir boncuk olacak kadar ekle.'
        : asama === 3
          ? 'Fazla boncukları geri kaydır. Her meyve için bir boncuk kalsın.'
          : 'Her meyve için bir boncuğu sola kaydır. Bitince onayla.';
    pano.classList.add('say-kumesi');
    const sayilanlar = new Set<HTMLButtonElement>();
    for (let i = 0; i < hedefSayi; i++) {
      const meyveDugmesi = buton(pano, (i + 1) + '. meyveyi say', img(meyveTuru), () => {
        if (kilit) return;
        if (sayilanlar.size === hedefSayi) {
          sayilanlar.forEach(el => el.removeAttribute('data-sira'));
          sayilanlar.clear();
        }
        if (!sayilanlar.has(meyveDugmesi)) {
          sayilanlar.add(meyveDugmesi);
          meyveDugmesi.dataset.sira = String(sayilanlar.size);
        }
        adediOku(Number(meyveDugmesi.dataset.sira));
      }, 'say-meyvesi');
      if (i < say) meyveDugmesi.classList.add('sayildi');
    }
    masa.classList.add('abakus');
    // Her telde beş boncuk var. İtilen boncuk yanındakileri de birlikte taşır.
    const teller: HTMLDivElement[] = [];
    for (let tel = 0; tel < adet / 5; tel++) {
      const ray = document.createElement('div');
      ray.className = 'boncuk-teli';
      ray.innerHTML = '<div class="cubuk"></div>';
      masa.append(ray);
      teller.push(ray);
    }
    const dagilim =
      t.secimler.length === teller.length + 1 && t.secimler[0] === 0
        ? t.secimler.slice(1)
        : teller.map((_, j) => Math.max(0, Math.min(5, say - j * 5)));
    for (let i = 0; i < adet; i++) {
      const j = Math.floor(i / 5),
        sira = i % 5,
        sol = sira < dagilim[j],
        tel = teller[j];
      let duyulan = 0;
      const eski = dagilim[j], yeni = sol ? sira : sira + 1;
      const yap = () => {
        if (kilit) return;
        const konumlar = Array.from(
          masa.querySelectorAll('.boncuk'),
          (el) => el.getBoundingClientRect().left,
        );
        boncuklariCal(j, eski, yeni, duyulan);
        dagilim[j] = yeni;
        t.yer = dagilim.reduce((a, b) => a + b, 0);
        if (onceSaySonraPaylas) t.boncukHazir = false;
        t.secimler = [0, ...dagilim];
        kaydet(k);
        yenile();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          kok.querySelectorAll('.boncuk').forEach((el, idx) => {
            const dx = konumlar[idx] - el.getBoundingClientRect().left;
            if (dx)
              el.animate([{ translate: dx + 'px 0' }, { translate: '0 0' }], {
                duration: 200,
                easing: 'ease-out',
              });
          });
        }
        adediOku(t.yer);
      };
      const b = buton(
        tel,
        sol ? 'Bir boncuk geri al' : 'Bir boncuk sola kaydır',
        img('matematik/boncuk'),
        yap,
        'boncuk',
      );
      b.style.left = (sol ? 2 + sira * 12 : 38 + sira * 12) + '%';
      surukle(
        b,
        () => {
          const r = tel.getBoundingClientRect();
          return new DOMRect(sol ? r.left + r.width * 0.5 : r.left, r.top, r.width * 0.5, r.height);
        },
        yap,
        'yatay',
        dx => {
          if (!dx) { duyulan = 0; return; }
          const yol = (sol ? dx : -dx) / Math.max(1, tel.clientWidth * .36);
          const adet = Math.min(Math.abs(yeni-eski), Math.ceil(Math.max(0,yol) * Math.abs(yeni-eski)));
          if (adet > duyulan) {
            sesiAc(); boncuklariCal(j, eski, eski + Math.sign(yeni-eski)*adet, duyulan); duyulan = adet;
          }
        },
      );
    }
    const ok = buton(
      kok,
      'Boncukları kontrol et',
      glyph('ok'),
      () => {
        if (kilit) return;
        if (say === hedefSayi) {
          if (boncukYanlisAdim !== t.adim) basardi(tekrarYolu(), hedefSayi);
          adediOku(say);
          pano.insertAdjacentHTML('afterbegin', '<strong>' + say + '</strong>');
          if (onceSaySonraPaylas) {
            t.boncukHazir = true;
            t.secimler = [];
            t.yer = 0;
            kaydet(k);
            kilit = true;
            timer = window.setTimeout(() => oyna(true), 1000);
          } else tamam();
        } else {
          if (boncukYanlisAdim !== t.adim) { boncukYanlisAdim = t.adim; zorlandi(tekrarYolu(), hedefSayi); }
          const eksik = pano.querySelector('.say-meyvesi:not(.sayildi)');
          const fazla = masa.querySelectorAll('.boncuk[aria-label="Bir boncuk geri al"]');
          const hedef = say < hedefSayi ? eksik : fazla[hedefSayi];
          if (hedef) ipucuHedefi(hedef);
          ipucu(ok);
          soyle(
            say < hedefSayi
              ? 'Bir daha bak. Meyvelerin hepsine boncuk ayırdın mı?'
              : 'Boncuklar meyvelerden fazla. Bir kısmını geri kaydır.',
          );
        }
      },
      'onay',
    );
  } else if (k === 'sekil') {
    // Şekil örüntüsü (tur 8, 12, 13): dizinin başı hazır, çocuk aynı düzeni sürdürür.
    const parcalar = yeniBloklar;
    const ilk = (tur + cesit + 3) % parcalar.length;
    const ikinci = (ilk + 1) % parcalar.length;
    const seq = asama === 2 ? [ilk, ikinci, ilk, ikinci] : [ilk, ilk, ikinci, ilk, ilk, ikinci];
    const sabit = asama === 2 ? 2 : 3,
      ind = sabit + t.secimler.length;
    metin = sozler[6];
    seq.forEach((v, j) => {
      const el = document.createElement('span');
      el.className = 'yuva ' + (j < ind ? 'yerinde' : 'bos') + (j === ind ? ' sirada' : '');
      if (j < ind) el.innerHTML = img(parcalar[v]);
      pano.append(el);
    });
    secenekler(parcalar, seq[ind], seq.length - sabit);
  } else if (k === 'olcu' && olcuYeniAcik()) {
    // Kurdele turunun yerine: önce Boy Duvarı, o oynandıysa Yaprak Yolu (misket ilk ölçü turunun yerine geçse de
    // Boy Duvarı kaçırılmaz).
    if (!t.anlatilan?.includes('boy-duvari')) boyDuvari(t, sesli);
    else yaprakYolu(t, sesli);
  } else if (k === 'olcu') {
    const uzun = minik ? 3 : [2, 3, 2, 4, 3, 4, 5, 4, 4, 5, 4, 6, 5, 6, 7, 8][n];
    metin = asama === 3
      ? 'İki kurdeleyi uç uca ölç. Boşluk bırakmadan taşlarını diz.'
      : 'Kurdeleyi baştan sona eşit taşlarla ölç.';
    pano.classList.add('cetvel');
    const top = document.createElement('span');
    top.className = 'kopru-topu';
    top.innerHTML = img(sekil[2]);
    pano.style.setProperty('--n', String(uzun));
    pano.style.setProperty('--ek', (Math.floor(uzun / 2) * 100) / uzun + '%');
    pano.innerHTML =
      '<div class="serit ' +
      (asama === 3 ? 'cift' : '') +
      '"></div><div class="taslar">' +
      Array.from(
        { length: uzun },
        (_, i) =>
          '<i class="' +
          (i < t.secimler.length ? 'var' : '') +
          '">' +
          (i < t.secimler.length ? img(sekil[0]) : '') +
          '</i>',
      ).join('') +
      '</div>';
    const yap = () => {
      if (kilit) return;
      sec(0);
      if (t.secimler.length === uzun) {
        const sonTas = pano.querySelector('.taslar i:not(.var)');
        if (sonTas) {
          sonTas.classList.add('var');
          sonTas.innerHTML = img(sekil[0]);
        }
        pano.classList.add('kopru-tamam');
        // İlk ölçüde taşın birim olduğunu anlatır; ikincisinde ölçünün sonucunu (kaç taş) söyler.
        tamam(ilkAciklama() ? sozler[45] : sozler[31 + uzun]);
      } else yenile();
    };
    const b = buton(masa, 'Bir ölçü taşı yerleştir', img(sekil[0]), yap, 'parca');
    pano.querySelector('.taslar')!.append(top);
    const siradaki = pano.querySelector<HTMLElement>('.taslar i:not(.var)')!;
    siradaki.classList.add('olcu-hedefi');
    surukle(b, () => siradaki.getBoundingClientRect(), yap);
  } else {
    const adet = minik ? (t.adim * 4 < sonu(k) ? 1 : 2) : dortYas ? Math.min(3, 2 + asama) : 2 + asama,
      seq = Array.from(
        { length: adet },
        (_, i) => (tur + i + cesit + (asama >= 2 ? Math.floor(i / 2) : 0)) % Math.min(4, asama + 2),
      );
    metin = sozler[78];
    pano.classList.add('isiklar');
    const fenerler = lamba.slice(0, Math.min(4, asama + 2));
    let dinliyor = true;
    const token = oturum;
    const perde = alan('golge-perdesi');
    perde.setAttribute('aria-hidden','true');
    const anlatanKus = alan('kukla-kusu fener-anlatici');
    anlatanKus.setAttribute('aria-hidden', 'true');
    function yak(i: number) {
      perde.innerHTML = img(lamba[i]);
      kusSoyle(anlatanKus);
      perde.style.backgroundColor=['#ffe7a2','#c9e0fb','#acf0db','#ffd4b4'][i];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        perde.firstElementChild!.animate([{translate:'-16% 7%',rotate:'-5deg'},{translate:'8% -3%',rotate:'3deg'},{translate:'0 0',rotate:'0deg'}],{duration:580});
      const l = masa.children[i];
      l?.animate(
        [
          {
            background: '#ffe88b',
            scale: matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : '1.08',
          },
          { background: '#fff1ce', scale: '1' },
        ],
        { duration: 530 },
      );
      fenerSesi(i);
    }
    fenerler.forEach((id, i) => {
      const l = document.createElement('span');
      l.className = 'fener';
      l.innerHTML = img(id);
      pano.append(l);
      const yap = () => {
        if (dinliyor || kilit) return;
        if (seq[t.secimler.length] !== i) {
          ipucu(b);
          goster();
          return;
        }
        masa.querySelector('.yankila')?.classList.remove('yankila');
        yak(i);
        t.secimler.push(i);
        kaydet(k);
        gosterge();
        if (t.secimler.length === seq.length) tamam();
        else if (minik) masa.children[seq[t.secimler.length]]?.classList.add('yankila');
      };
      const b = buton(masa, fenerAdlari[i], img(id), yap, 'parca');
    });
    const sira = alan('fener-sira');
    function gosterge() {
      sira.innerHTML = seq
        .map((v, i) => (i < t.secimler.length ? '<i>' + img(lamba[v]) + '</i>' : '<i></i>'))
        .join('');
    }
    gosterge();
    let gosterim = 0;
    function goster(anlatim?: string) {
      const buGosterim = ++gosterim;
      clearTimeout(timer);
      gosterge();
      dinliyor = true;
      masa.inert = true;
      masa.classList.remove('sende');
      let i = 0;
      const kalan = seq.slice(t.secimler.length);
      const siradaki = () => {
        if (oturum !== token || buGosterim !== gosterim || document.hidden || uygulamaArkada) return;
        if (i === kalan.length) {
          dinliyor = false;
          perde.replaceChildren();
          masa.inert = false;
          masa.classList.add('sende');
          if (minik) masa.children[kalan[0]]?.classList.add('yankila');
          if (!t.secimler.length && n < 2) soyle(sozler[55]);
          return;
        }
        yak(kalan[i++]);
        timer = window.setTimeout(siradaki, minik ? 1050 : dortYas ? 900 : 800);
      };
      if (anlatim) soyle(anlatim);
      const kayit = anlatim ? ses : undefined;
      if (kayit) {
        let basladi = false;
        const baslat = () => {
          if (basladi || oturum !== token || buGosterim !== gosterim || document.hidden || uygulamaArkada)
            return;
          basladi = true;
          clearTimeout(timer);
          timer = window.setTimeout(siradaki, 350);
        };
        kayit.addEventListener('ended', baslat, { once: true });
        kayit.addEventListener('error', baslat, { once: true });
        timer = window.setTimeout(baslat, 6500);
      } else timer = window.setTimeout(siradaki, 450);
    }
    ipucunuTekrarla = () => {
      if (!kilit) {
        goster(sozler[56]);
      }
    };
    goster(sesli ? metin : undefined);
  }
  if (k !== 'fener' && n < 5 && !masa.classList.contains('yazim')) {
    const yuva = pano.querySelector('.sirada');
    const kalip = yuva?.querySelector('img')?.src;
    const eslesen =
      kalip &&
      Array.from(masa.querySelectorAll('.parca')).find((el) => el.querySelector('img')?.src === kalip);
    const tabak = Array.from(pano.querySelectorAll('.tabak')).sort(
      (a, b) => a.childElementCount - b.childElementCount,
    )[0];
    const nesne =
      eslesen ||
      masa.querySelector('.pay-meyvesi') ||
      (pano.classList.contains('terazi') && masa.querySelector('.parca'));
    const yer = yuva || tabak || pano.querySelector('.kefe.sag');
    if (nesne && yer) hareketIpucu(nesne, yer);
  }
  if (sesli && !ipucunuTekrarla) soyle(metin);
}
window.addEventListener('pagehide', () => {
  boncukSesiniKes();
  clearTimeout(timer);
  susArtik();
});
let uygulamaArkada = false;
let duraklatildi = false;
function duraklamayiGuncelle() {
  const bekle = document.hidden || uygulamaArkada || dikTelefon.matches;
  if (duraklatildi === bekle) return;
  duraklatildi = bekle;
  if (bekle) {
    oturum++;
    if (sahne === 'tangram' || sahne === 'misket' || sahne === 'ceren') { sahneyiKapat?.(); sahneyiKapat=undefined; }
    boncukSesiniKes();
    clearTimeout(timer);
    clearTimeout(yardimSaati);
    susArtik();
  } else if (sahne === 'misket') {
    if (kok.dataset.bitti) oyna(true);
    else misketiAc();
  } else if (sahne === 'tangram') {
    if (durum.sekil.adim === sonu('sekil')) hatirayiGoster();
    else gezginiAc();
  } else if (sahne === 'kule') {
    kuleTuru();
  } else if (sahne === 'ceren') {
    cerenDersiniAc();
  } else if (sahne === 'oyun') {
    if (durum[k].adim === sonu(k)) hatirayiGoster();
    else oyna(true);
  } else if (sahne === 'yas') {
    soyle(sozler[66]);
  }
}
document.addEventListener('visibilitychange', duraklamayiGuncelle);
dikTelefon.addEventListener('change', duraklamayiGuncelle);
arkaPlanDinle((arkada) => {
  uygulamaArkada = arkada;
  duraklamayiGuncelle();
});
geriDinle(() => {
  if (sahne === 'menu') return false;
  menu();
  return true;
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    uygulamaDurumu.i = yukle();
    seviyeyiYukle();
    menu();
  }
});

menu();
duraklamayiGuncelle();
