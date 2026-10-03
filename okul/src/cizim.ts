/**
 * Okula Hazırım! görselleri. Eşyalar kodla çizilmez (Barış: "siyah siyah duruyor"): önce depodaki hazır görseller
 * (assets/meyveler, pazar, hayvanlar, tasitlar, canlan, orman-esya), yoksa her eşyanın tek bir görsel yuvası:
 * assets/okul/<ad>.webp. Yuvalardaki şimdiki dosyalar sade yer tutuculardır; Gemini çizince yalnız dosya değişir
 * (aynı ad, aynı en-boy oranı, şeffaf zemin). Liste: GORSEL_YUVALARI.
 */
import { etkinlik } from './etkinlik';
const GORSEL = import.meta.glob<string>(
  [
    '../../assets/okul/*.webp',
    '../../assets/meyveler/{elma,havuc}.webp',
    '../../assets/pazar/sepet.webp',
    '../../assets/orman-esya/davul.webp',
    '../../assets/tasitlar/tren.webp',
    '../../assets/canlan/ev.webp',
    '../../assets/hayvanlar/{civciv,tavsan,ordek,kurbaga,fare,koyun,penguen,kedi,ayi,kopek,maymun,kus,kelebek}.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
/** assets/<yol>.webp adresi */
export const gorsel = (yol: string) => GORSEL[`../../assets/${yol}.webp`] ?? '';
const PARK = import.meta.glob<string>('../../assets/film/park/*.webp', { eager: true, query: '?url', import: 'default' });
/** Park katmanı (assets/film/park/<ad>.webp) */
export const parkAdres = (ad: string) => PARK[`../../assets/film/park/${ad}.webp`] ?? '';

/**
 * assets/okul/ yuvaları (Gemini'ye verilecek liste): ad → [en, boy, ne]. Şeffaf zemin, ince sıcak kahve kontur,
 * yumuşak gölge ve parlama (Minkino stili). Oranlar korunmalı: oyun yerleşimi bu oranlarla kurulu.
 */
export const GORSEL_YUVALARI: Record<string, [number, number, string]> = {
  agac: [768, 560, 'Kaç elma? ağacı: geniş yuvarlak taç, ELMASIZ (elmalar oyunda konur); taç resmin üst %65’i, gövde altta ortada'],
  kurabiye: [256, 256, 'çikolata parçacıklı yuvarlak kurabiye, üstten'],
  tabak: [512, 220, 'boş beyaz tabak, hafif yandan (elips), kenarında ince desen'],
  vagon: [300, 230, 'oyuncak tren vagonu, üstü açık (içine hayvan oturur), kırmızı, iki tekerlek, iki yanda bağlantı çubuğu; yandan'],
  'piknik-ortusu': [800, 340, 'kırmızı-beyaz kareli piknik örtüsü, yerde, perspektifte yamuk (üst kenar dar)'],
  dal: [1000, 140, 'yatay uzun ağaç dalı, birkaç yaprak; kuşlar üstüne konar'],
  istasyon: [360, 300, 'küçük tren istasyonu / depo: çizgili tente, iki direk, tahta platform (önü boş, vagon durur)'],
  bahce: [400, 340, 'harita: Sayı Bahçesi simgesi (elma ağacı ve çit)'],
  kule: [400, 380, 'harita: Ses Kulesi simgesi (mor kule, üstünde bayrak, ortada A)'],
  kopru: [440, 300, 'harita: Kelime Köprüsü simgesi (derenin üstünde renkli resimli taşlardan kemer köprü)'],
  okul: [420, 340, 'harita: okul binası (yolun sonu), saatli, bayraklı'],
  'rozet-sayi': [300, 360, '“Sayı Ustası” rozeti: altın madalya, iki kurdele, ortada 123'],
  'sayi-bloklari': [560, 260, 'ana menü kartı: 1-2-3 oyuncak blokları (kırmızı, sarı, mavi)'],
};

/** Görsel etiketi (HTML metni); yol: assets/ altında, uzantısız */
export function resim(yol: string, sinif = '', stil = ''): string {
  return `<img class="ok-resim${sinif ? ' ' + sinif : ''}" src="${gorsel(yol)}" alt="" draggable="false"${stil ? ` style="${stil}"` : ''}>`;
}

/**
 * Yuva tuvalinde çizimin kapladığı kutu (px): [tuval en, tuval boy, x, y, en, boy]. Gemini çizimleri oran korunarak
 * tuvale sığdırıldı; çizim tuvalden küçük (tabak yuvarlak, dal kısa). kirpik() boş kenarları atar: kutu çizimi tam
 * doldurur. Görsel değişirse bu ölçüler de güncellenir (sharp trim ile ölçüldü).
 */
export const CIZIM_KUTUSU: Record<string, [number, number, number, number, number, number]> = {
  'okul/tabak': [512, 220, 157, 11, 198, 198],
  'okul/dal': [1000, 140, 33, 7, 257, 126],
  'okul/vagon': [300, 230, 12, 46, 275, 173],
  'okul/piknik-ortusu': [800, 340, 91, 15, 620, 310],
  'okul/istasyon': [360, 300, 15, 61, 330, 225],
  'okul/rozet-sayi': [300, 360, 21, 17, 260, 326],
};

/**
 * Kırpılmış görsel: dış kutunun en-boy oranı çizimin oranıdır (CSS en ya da boy verince öteki kendiliğinden gelir;
 * ikisi de verilirse çizim esner, örn. yandan bakılan tabak). Görsel kutunun dışına taşan boş tuvaliyle konur.
 */
export function kirpik(yol: string, sinif = '', stil = ''): string {
  const k = CIZIM_KUTUSU[yol];
  if (!k) return resim(yol, sinif, stil);
  const [W, H, x, y, w, h] = k;
  const yuzde = (a: number, b: number) => `${((a / b) * 100).toFixed(3)}%`;
  const ic = `left:-${yuzde(x, w)};top:-${yuzde(y, h)};width:${yuzde(W, w)};height:${yuzde(H, h)}`;
  return `<span class="ok-kirp${sinif ? ' ' + sinif : ''}" style="aspect-ratio:${w} / ${h};${stil}"><img class="ok-resim" src="${gorsel(yol)}" alt="" draggable="false" style="${ic}"></span>`;
}

/** Vagonlarda oturan hayvanlar (assets/hayvanlar) */
export const YOLCULAR = ['civciv', 'tavsan', 'ordek', 'kurbaga', 'fare', 'koyun', 'penguen', 'kedi', 'ayi', 'kopek'];

/** Aynı görselin renk çeşitleri (renk döndürme): kırmızı vagonun, mavi kuşun tonları */
const TON = [0, 200, 45, 120, 280, 25, 320, 160];
export const ton = (i: number) => `--ton:${TON[i % TON.length]}deg`;

export const kurabiye = () => resim('okul/kurabiye');
/** Üstten bakılan yuvarlak tabak (kırpılmış: kutu = tabak) */
export const tabak = () => kirpik('okul/tabak');
/** Vagon aynalanır: çekme kolu sağa, öndeki vagona (lokomotife) uzanır */
export const vagon = (i: number) => kirpik('okul/vagon', 'ok-tonlu ok-ayna', ton(i));
export const LOKOMOTIF = () => resim('tasitlar/tren');
export const kus = (i: number) => resim('hayvanlar/kus', 'ok-tonlu', ton(i));
export const KELEBEK = () => resim('hayvanlar/kelebek');
/** Dal (kırpılmış: kalın ucu solda); ayna = kalın ucu sağda */
export const DAL = (ayna = false) => kirpik('okul/dal', ayna ? 'ok-ayna' : '');
export const AGAC = () => resim('okul/agac', 'ok-esnek');
export const ORTU = () => kirpik('okul/piknik-ortusu');
export const ISTASYON = () => kirpik('okul/istasyon');
export const BAHCE = () => resim('okul/bahce');
export const KULE = () => resim('okul/kule');
export const KOPRU = () => resim('okul/kopru');
export const OKUL = () => resim('okul/okul');
export const EV = () => resim('canlan/ev');
/**
 * Bölge rozeti. Ses Kulesi ("Ses Dedektifi"): assets/okul/rozet-ses.webp gelince o; gelene kadar Sayı Ustası madalyası,
 * ortasında 123 yerine Aa (yumuşak altın yama, harfler uygulamanın yazı tipiyle).
 */
export const rozet = (b = 'sayi') => {
  if (b !== 'ses') return kirpik('okul/rozet-sayi', 'ok-rozet-resim');
  if (gorsel('okul/rozet-ses')) return resim('okul/rozet-ses', 'ok-rozet-resim');
  return `<span class="ok-rozet-ses">${kirpik('okul/rozet-sayi', 'ok-rozet-resim')}<span class="ok-rozet-yama"><b>A</b><b>a</b></span></span>`;
};

// ---------------------------------------------------------------- duraklar ve çıkartmalar
/** Etkinliğin simgesi (durakta ve çıkartmada): hazır görsellerden küçük bir kompozisyon */
export function etkinlikSimgesi(id: string): string {
  const img = (yol: string, s = '') => resim(yol, s);
  switch (id) {
    case 'kac-elma':
      return `<span class="ok-simge-yigin">${img('pazar/sepet', 'ok-s-sepet')}${img('meyveler/elma', 'ok-s-e1')}${img('meyveler/elma', 'ok-s-e2')}${img('meyveler/elma', 'ok-s-e3')}</span>`;
    case 'sayi-karti':
      return `<span class="ok-simge-kart"><b>3</b></span>`;
    case 'sepete-koy':
      return `<span class="ok-simge-yigin">${img('meyveler/havuc', 'ok-s-havuc1')}${img('meyveler/havuc', 'ok-s-havuc2')}</span>`;
    case 'hangisinde-cok':
      return `<span class="ok-simge-yigin">${kirpik('okul/tabak', 'ok-s-tabak')}${img('okul/kurabiye', 'ok-s-k1')}${img('okul/kurabiye', 'ok-s-k2')}</span>`;
    case 'bir-fazla':
      return `<span class="ok-simge-yigin">${img('tasitlar/tren', 'ok-s-tren')}</span>`;
    case 'merdiven':
      return `<span class="ok-simge-merdiven"><b>3</b><b>2</b><b>1</b></span>`;
    case 'kac-alkis':
      return `<span class="ok-simge-yigin">${img('orman-esya/davul', 'ok-s-davul')}</span>`;
    case 'rakam-ciz':
      return `<span class="ok-simge-ciz"><b>2</b></span>`;
    case 'kuslar':
      return `<span class="ok-simge-yigin">${img('hayvanlar/kus', 'ok-s-kus')}</span>`;
    case 'piknik':
      return `<span class="ok-simge-yigin">${kirpik('okul/piknik-ortusu', 'ok-s-ortu')}${img('meyveler/elma', 'ok-s-ortu-elma')}</span>`;
    default:
      // öteki ünitelerin etkinlikleri kendi simgesini kayıtta verir (EtkinlikTanim.simge)
      return etkinlik(id)?.simge?.() ?? '';
  }
}
