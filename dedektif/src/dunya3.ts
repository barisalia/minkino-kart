/**
 * Vaka 3'ün sahneleri (dunya.ts kalıbında: dünya birimi yükseklik ODA_H, en resmin oranında; kamera dunya.ts → Dunya):
 * Pasta Otobüsü'nün içi, otobüsün yanı (park), büyük ağaç, kovuğun içi (kiler). Sahne resimleri resimler3.ts'nin tek
 * haritasından ('v3/<ad>': Gemini çizimi ya da yer tutucu).
 *
 * Saklanan şeyler sahnenin kendi çizgisinin arkasına girer (dikdörtgen yama yok): kovukların alt dudağı ve pencerenin
 * pervazı aynı resimden, kendi biçimleriyle (elips halka, pervaz şeridi) kırpılmış kopyalardır; kuyruk ucu, baykuş ve
 * Fındık onların arkasında durur. Kovuğun içindekiler kovuğun ağız elipsine kırpılır.
 */
import { h } from '../../src/ui/dom';
import { ipucuEl, katman, type Oda } from './dunya';
import { ODA_H, odaW, type IpucuTanim } from './mantik';
import {
  BOS_YERLER,
  FINAL_KURABIYELER,
  KALAN,
  KOVUK_ICI,
  KOVUKLAR,
  KURABIYE_EN,
  OTOBUS,
  SEKER_IZI,
  TEPSI,
  TEPSI_YERLERI,
  type IpucuTanim3,
  type Kovuk,
  type Sahne3,
} from './mantik3';
import { resim } from './resimler';

const px = (v: number) => `${v.toFixed(1)}px`;
const img = (ad: string, sinif = '') => h(`img${sinif ? '.' + sinif.split(' ').join('.') : ''}`, { src: resim(ad) ?? '', alt: '', draggable: 'false' });
const zeminAdi: Record<Sahne3, string> = { 'otobus-ic': 'v3/otobus-ic', 'otobus-yani': 'v3/otobus-yani', agac: 'v3/agac', kiler: 'v3/kiler-ic' };
export const zeminUrl = (s: Sahne3) => resim(zeminAdi[s]) ?? '';

/**
 * Sahnenin kendi resminden kırpılmış kopya (kutu: oda oranı; biçim: kutunun yüzdesiyle çokgen ya da elips). Aynı resim,
 * aynı ölçek: alttakinin tam üstüne oturur (ön katman ya da büyütecin incelediği parça).
 */
export function kirpim(s: Sahne3, k: { x0: number; y0: number; x1: number; y1: number }, bicim: string, sinif = ''): HTMLElement {
  const W = odaW(s);
  const x0 = k.x0 * W;
  const y0 = k.y0 * ODA_H;
  const el = h(`div.dd-v3-kirpim${sinif ? '.' + sinif : ''}`, { style: `left:${px(x0)};top:${px(y0)};width:${px((k.x1 - k.x0) * W)};height:${px((k.y1 - k.y0) * ODA_H)};clip-path:${bicim}` });
  Object.assign(el.style, { backgroundImage: `url("${zeminUrl(s)}")`, backgroundSize: `${px(W)} ${px(ODA_H)}`, backgroundPosition: `${px(-x0)} ${px(-y0)}` });
  return el;
}

/** Kovuğun kutusu (oda oranı); pay: dudakla birlikte */
export const kovukKutusu = (k: Kovuk, pay = 1 + k.dudak) => ({ x0: k.x - k.rx * pay, y0: k.y - k.ry * pay, x1: k.x + k.rx * pay, y1: k.y + k.ry * pay });
/**
 * Kovuğun alt dudağı (ön katman): dış elipsle iç elips arasındaki halkanın alt yarısı (biraz yukarı taşar: kuyruk ve
 * baykuş dudağın arkasına girer). Kutu: kovukKutusu; biçim kutunun yüzdesiyle.
 */
export function dudakBicimi(k: Kovuk, ust = -0.08): string {
  const d = 1 + k.dudak;
  const l: string[] = [];
  const a0 = Math.asin(Math.max(-1, Math.min(1, ust)));
  const n = 28;
  // dış elips: sağdan (a0) alttan sola (π - a0)
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / n;
    l.push([50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)]);
  }
  // iç elips: soldan alttan sağa (geri)
  for (let i = n; i >= 0; i--) {
    const a = a0 + ((Math.PI - 2 * a0) * i) / n;
    l.push([50 + (50 / d) * Math.cos(a) * 0.98, 50 + (50 / d) * Math.sin(a) * 0.98]);
  }
  return `polygon(${l.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`;
}
function ekle(e: Record<string, HTMLElement>, ad: string, el: HTMLElement) {
  e[ad] = el;
  return el;
}

// ---------------------------------------------------------------- otobüsün içi
/** Tepsi (tezgâhta), iki kurabiye, dört boş yerin un halkaları (ipucu), sayma düğmeleri; pervaz ön katmanı; final eşyaları */
export function otobusIc(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'otobus-ic';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  const tw = TEPSI.w * W;
  const th = (tw * 520) / 1000;
  const tx = TEPSI.x * W;
  const ty = TEPSI.y * ODA_H;
  const k = tw * KURABIYE_EN;
  const yer = (i: number) => [TEPSI_YERLERI[i][0] * tw, TEPSI_YERLERI[i][1] * th] as const;
  const kurabiyeler = h(
    'div.dd-v3-tepsi-kurabiye',
    {},
    ...KALAN.map((i) => {
      const [x, y] = yer(i);
      return h('img.dd-v3-kurabiye', { src: resim('v3/kurabiye') ?? '', alt: '', draggable: 'false', 'data-yer': String(i), style: `left:${px(x)};top:${px(y)};width:${px(k)};--don:${i * 7 - 10}deg` });
    }),
  );
  // ipucu: dört un halkası (bütün tepsinin kutusunda; büyüteç tepsinin ortasına bakar)
  const un = h(
    'div.dd-ipucu.dd-v3-un.bt-gizli',
    { 'data-ipucu': 'un', style: `left:${px(tx)};top:${px(ty - th / 2)};width:${px(tw)};height:${px(th)}` },
    ...BOS_YERLER.map((i) => {
      const [x, y] = yer(i);
      return h('img', { src: resim('v3/un-halka') ?? '', alt: '', draggable: 'false', style: `left:${px(x)};top:${px(y)};width:${px(k * 1.1)}` });
    }),
  );
  e['ipucu-un'] = un;
  // sayma: boş yerlere dokunulur, rakam belirir
  e.sayac = h(
    'div.dd-v3-sayac',
    { style: `left:${px(tx - tw / 2)};top:${px(ty - th)};width:${px(tw)};height:${px(th)}` },
    ...BOS_YERLER.map((i) => {
      const [x, y] = yer(i);
      return h('button.dd-v3-say', { type: 'button', 'aria-label': 'Boş yer', 'data-yer': String(i), style: `left:${px(x)};top:${px(y)};width:${px(k * 1.15)};height:${px(k * 0.95)}` }, h('b'));
    }),
  );
  const tepsi = h('div.dd-v3-tepsi', { style: `left:${px(tx - tw / 2)};top:${px(ty - th)};width:${px(tw)};height:${px(th)}` }, img('v3/tepsi', 'dd-v3-tepsi-resim'), kurabiyeler);
  e.tepsi = tepsi;
  e.kurabiyeler = kurabiyeler;
  for (const t of ipuclari) if (t.id !== 'un') ekle(e, `ipucu-${t.id}`, ipucuEl(t, W));
  // final: pencerede Fındık (pervazın arkasında), tabela ve yeni kurabiye
  const f = OTOBUS.findik;
  e.findik = h('div.dd-v3-pencere-findik', { style: `left:${px(f.x * W)};top:${px(f.y * ODA_H)};height:${px(f.h * ODA_H)}` }, img('v3/findik'));
  const p = OTOBUS.pervaz;
  e.pervaz = kirpim(id, p, 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', 'dd-v3-pervaz');
  const tb = OTOBUS.tabela;
  e.tabela = h('img.dd-v3-tabela', { src: resim('v3/tabela') ?? '', alt: '', draggable: 'false', style: `left:${px(tb.x * W)};top:${px(tb.y * ODA_H)};height:${px(tb.h * ODA_H)}` });
  const yk = OTOBUS.yeniKurabiye;
  e.yeni = h('img.dd-v3-yeni-kurabiye', { src: resim('v3/palamut-kurabiye') ?? '', alt: '', draggable: 'false', style: `left:${px(yk.x * W)};top:${px(yk.y * ODA_H)};height:${px(yk.h * ODA_H)}` });
  // kapının sürgüsü (Halka 2: kapı kartı) ve baca kapağının buharı
  e.buhar = h('div.dd-v3-buhar.bt-yok', { style: `left:${px(((OTOBUS.baca.x0 + OTOBUS.baca.x1) / 2) * W)};top:${px(OTOBUS.baca.y1 * ODA_H)}` });
  const el = h(
    'div.dd-dunya.dd-v3-sahne',
    { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), e.findik, e.pervaz, e.yeni, e.tabela, tepsi, un, e.sayac, ...ipuclari.filter((t) => t.id !== 'un').map((t) => e[`ipucu-${t.id}`]), e.buhar).el,
  );
  return { id, el, W, katmanlar: [], e };
}

// ---------------------------------------------------------------- otobüsün yanı
/** Üç patikanın başındaki ipuçları ve ağaca giden yıldız şeker izi */
export function otobusYani(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'otobus-yani';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) ekle(e, `ipucu-${t.id}`, ipucuEl(t, W));
  const url = resim('v3/seker-tek') ?? '';
  e.iz = h(
    'div.dd-izler.dd-v3-seker-izi',
    {},
    ...SEKER_IZI.map((p, i) =>
      h('button.dd-iz.dd-v3-seker', { type: 'button', 'aria-label': 'Yıldız şeker', 'data-iz': String(i), style: `left:${px(p.x * W)};top:${px(p.y * ODA_H)};height:${px(p.h * ODA_H)};--don:${p.don}deg;--i:${i}` }, h('img', { src: url, alt: '', draggable: 'false' })),
    ),
  );
  const el = h('div.dd-dunya.dd-v3-sahne', { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` }, katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), ...ipuclari.map((t) => e[`ipucu-${t.id}`]), e.iz).el);
  return { id, el, W, katmanlar: [], e };
}

// ---------------------------------------------------------------- büyük ağaç
/**
 * Üç kovuk: üstte uyuyan baykuş (ağzın elipsine kırpık), ortada yuva (sahnenin kendi kırpımı: sallanır), altta dudağın
 * arkasından sarkan kuyruk ucu. Alt ve üst kovuğun dudakları ön katman. Fındık alt kovuktan fırlar. Dipte ipuçları.
 */
export function agacSahnesi(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'agac';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) ekle(e, `ipucu-${t.id}`, ipucuEl(t, W));
  const kutu = (k: Kovuk, pay = 1) => {
    const b = kovukKutusu(k, pay);
    return `left:${px(b.x0 * W)};top:${px(b.y0 * ODA_H)};width:${px((b.x1 - b.x0) * W)};height:${px((b.y1 - b.y0) * ODA_H)}`;
  };
  const { ust, orta, alt } = KOVUKLAR;
  // baykuş: üst kovuğun ağzının içinde (elipse kırpık), yarısı dudağın altında
  e['ipucu-baykus'] = h('div.dd-ipucu.dd-v3-kovuk-ic.bt-gizli', { 'data-ipucu': 'baykus', style: kutu(ust) }, h('div.dd-v3-agiz', {}, img('v3/baykus', 'dd-v3-baykus')));
  // yuva: orta kovuğun kendi kırpımı (çizimdeki yuva; dokununca sallanır)
  const yv = kirpim(id, kovukKutusu(orta, 1), 'ellipse(50% 50% at 50% 50%)', 'dd-v3-yuva');
  e['ipucu-yuva'] = h('div.dd-ipucu.dd-v3-kovuk-ic.bt-gizli', { 'data-ipucu': 'yuva', style: kutu(orta) }, h('i.dd-v3-yuva-isaret'));
  e.yuva = yv;
  // kuyruk ucu: alt kovuğun içinden dudağın üstünden sarkar (kökü dudağın arkasında)
  const ky = KOVUK_ICI.kuyruk;
  e['ipucu-kuyruk'] = h('div.dd-ipucu.dd-v3-kuyruk.bt-gizli', { 'data-ipucu': 'kuyruk', style: `left:${px(ky.x * W)};top:${px(ky.y * ODA_H)};height:${px(ky.h * ODA_H)}` }, img('v3/findik-kuyruk'));
  e.kirintilar = h('div.dd-v3-kirintilar.bt-yok', { style: `left:${px(alt.x * W)};top:${px((alt.y + alt.ry * 0.9) * ODA_H)}` });
  // Fındık kovuğun içinde (alt ağzın elipsine kırpık kap), sonra dışarıda
  e.findikIc = h('div.dd-v3-findik-ic', { style: kutu(alt) }, h('div.dd-v3-agiz'));
  // dudaklar (ön katman)
  e.dudakUst = kirpim(id, kovukKutusu(ust), dudakBicimi(ust), 'dd-v3-dudak');
  e.dudakAlt = kirpim(id, kovukKutusu(alt), dudakBicimi(alt), 'dd-v3-dudak');
  e.findikDis = h('div.dd-v3-findik-dis');
  e.kurabiyeler = h(
    'div.dd-v3-final-kurabiyeler',
    {},
    ...FINAL_KURABIYELER.map(([x, y], i) => h('button.dd-v3-final-kurabiye', { type: 'button', 'aria-label': 'Kurabiye', 'data-i': String(i), style: `left:${px(x * W)};top:${px(y * ODA_H)}` }, img('v3/kurabiye'), h('b'))),
  );
  const el = h(
    'div.dd-dunya.dd-v3-sahne',
    { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` },
    katman(
      'dd-k-tek',
      0,
      h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }),
      yv,
      e['ipucu-baykus'],
      e['ipucu-yuva'],
      e.findikIc,
      e['ipucu-kuyruk'],
      e.dudakUst,
      e.dudakAlt,
      e.kirintilar,
      ...ipuclari.map((t) => e[`ipucu-${t.id}`]),
      e.kurabiyeler,
      e.findikDis,
    ).el,
  );
  return { id, el, W, katmanlar: [], e };
}

// ---------------------------------------------------------------- kovuğun içi (kiler)
/** Kiler: ipuçları sahnenin kendi kırpımıdır (kurabiyeler, kar tanesi; çizim zaten arka planda) */
export function kilerSahnesi(ipuclari: IpucuTanim3[]): Oda {
  const id: Sahne3 = 'kiler';
  const W = odaW(id);
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) {
    const k = t.kirp ?? { w: 0.15, h: 0.15 };
    const kutu = { x0: t.x - k.w / 2, y0: t.y - k.h / 2, x1: t.x + k.w / 2, y1: t.y + k.h / 2 };
    const kopya = kirpim(id, kutu, 'inset(0 round 18%)', 'dd-v3-kiler-parca');
    kopya.style.left = '0px';
    kopya.style.top = '0px';
    e[`ipucu-${t.id}`] = h(`div.dd-ipucu.dd-v3-kiler-ipucu${t.gizli ? '.bt-gizli' : ''}`, { 'data-ipucu': t.id, style: `left:${px(t.x * W)};top:${px(t.y * ODA_H)};width:${px(k.w * W)};height:${px(k.h * ODA_H)}` }, kopya);
  }
  const el = h('div.dd-dunya.dd-v3-sahne', { 'data-oda': id, style: `width:${px(W)};height:${px(ODA_H)}` }, katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), ...ipuclari.map((t) => e[`ipucu-${t.id}`])).el);
  return { id, el, W, katmanlar: [], e };
}
