/**
 * Okula Hazırım! görselleri. Eşyalar kodla çizilmez (Barış: "siyah siyah duruyor"): önce depodaki hazır görseller
 * (assets/meyveler, pazar, hayvanlar, tasitlar, canlan, orman-esya), yoksa her eşyanın tek bir görsel yuvası:
 * assets/okul/<ad>.webp. Yuvalardaki şimdiki dosyalar sade yer tutuculardır; Gemini çizince yalnız dosya değişir
 * (aynı ad, aynı en-boy oranı, şeffaf zemin). Liste: GORSEL_YUVALARI.
 */
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
  tabak: [512, 220, 'boş pembe kenarlı tabak, hafif yandan (elips), tuvali doldurur'],
  vagon: [300, 230, 'oyuncak tren vagonu, üstü açık (içine hayvan oturur), kırmızı, iki tekerlek, iki yanda bağlantı çubuğu; yandan'],
  'piknik-ortusu': [800, 340, 'kırmızı-beyaz kareli piknik örtüsü, yerde, perspektifte yamuk (üst kenar dar)'],
  dal: [1000, 140, 'yatay uzun ince ağaç dalı (kalın kesik ucu solda), birkaç yaprak; kuşlar üstüne konar'],
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
  // 2026-10-03 yeni çizimler: tabak yandan (elips), dal uzun ve ince (kalın kesik ucu solda)
  'okul/tabak': [512, 220, 17, 55, 478, 156],
  'okul/dal': [1000, 140, 30, 10, 939, 121],
  'okul/vagon': [300, 230, 12, 46, 275, 173],
  'okul/piknik-ortusu': [800, 340, 92, 16, 618, 309],
  'okul/istasyon': [360, 300, 16, 61, 328, 225],
  'okul/rozet-sayi': [300, 360, 21, 17, 260, 326],
};
/** Kırpılmış çizimin en/boy oranı (kutu bu oranda tutulur: görsel hiç esnemez) */
export const cizimOrani = (yol: string) => {
  const k = CIZIM_KUTUSU[yol];
  return k ? k[4] / k[5] : 1;
};

/**
 * Yandan bakılan tabakta (okul/tabak, kırpılmış kutunun oranı) yerler: tabağın iç (beyaz) elipsi ve dış kenarın üst
 * yüzü. x: enin, y: boyun oranı (0 üst). Kurabiyeler iç elipsin üstüne dizilir (hangisinde-cok.ts → kurabiyeYerleri).
 */
export const TABAK_YUZU = {
  ic: { x: 0.5, y: 0.465, rx: 0.34, ry: 0.279 },
  dis: { x: 0.5, y: 0.43, rx: 0.5, ry: 0.43 },
};

/**
 * Dalın ana gövdesinin üst çizgisi (kırpılmış kutunun oranı; u: kalın uçtan sağa, v: üstten). Kuşların ayakları bu
 * çizgiye basar (dal.ts → Dallar.otur). Kalın uç (u < 0.29) dik yükselir, tünek değil; uçtaki yapraklar u > 0.92.
 */
export const DAL_UST: [number, number][] = [
  [0.25, 0.2],
  [0.29, 0.19],
  [0.4, 0.215],
  [0.45, 0.256],
  [0.5, 0.281],
  [0.55, 0.347],
  [0.61, 0.397],
  [0.66, 0.435],
  [0.72, 0.43],
  [0.82, 0.425],
  [0.87, 0.446],
  [0.92, 0.47],
];
/** Dalın tünek olan kısmı (u aralığı) */
export const DAL_TUNEK: [number, number] = [0.29, 0.9];
/** Üst çizginin u noktasındaki yüksekliği (v) */
export function dalUstu(u: number): number {
  const t = DAL_UST;
  if (u <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++)
    if (u <= t[i][0]) {
      const [u0, v0] = t[i - 1];
      const [u1, v1] = t[i];
      return v0 + ((u - u0) / (u1 - u0)) * (v1 - v0);
    }
  return t[t.length - 1][1];
}

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
/** Yandan bakılan tabak (kırpılmış: kutu = tabak, oranı korunur) */
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
export const rozet = () => kirpik('okul/rozet-sayi', 'ok-rozet-resim');

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
      return '';
  }
}
