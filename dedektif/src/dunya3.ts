/**
 * Vaka 3'ün sahneleri (dunya.ts kalıbında: dünya birimi yükseklik ODA_H, en resmin oranında; kamera dunya.ts → Dunya):
 * Pasta Otobüsü'nün içi, otobüsün yanı (park), büyük ağaç, kovuğun içi (kiler). Sahne resimleri resimler3.ts'nin tek
 * haritasından ('v3/<ad>': Gemini çizimi ya da yer tutucu). Dikey ekranda (boy > en) dikey eşi olan sahne kendi 9:16
 * çizimiyle kurulur (mantik3.ts → sahne3Yerlesim); telefon vakanın ortasında dönünce sahne yerinde yeniden dizilir.
 *
 * Saklanan şeyler sahnenin kendi çizgisinin arkasına girer (dikdörtgen yama yok): kovukların alt dudağı ve pencerenin
 * pervazı aynı resimden, kendi biçimleriyle (dudak halkası, pervaz çokgeni) kırpılmış kopyalardır; kuyruk ucu, baykuş
 * ve Fındık onların arkasında durur. Kovuğun içindekiler kovuğun ağız elipsine kırpılır.
 */
import { h } from '../../src/ui/dom';
import { ipucuEl, katman, type Oda } from './dunya';
import { ODA_H, odaW, type IpucuTanim } from './mantik';
import {
  BOS_YERLER,
  DIKEY_SAHNELER3,
  FINAL_KURABIYELER,
  FINDIK_YERI,
  KALAN,
  KOVUK_ICI,
  KOVUKLAR,
  OTOBUS,
  SAHNE3_DIKEY,
  SEKER_IZI,
  TEPSI3,
  sahne3Yerlesim,
  type DikeySahne3,
  type IpucuTanim3,
  type Kovuk,
  type Sahne3,
} from './mantik3';
import { resim } from './resimler';
import { cizimVar, DIKEY3_HAZIR } from './resimler3';

const px = (v: number) => `${v.toFixed(1)}px`;
const img = (ad: string, sinif = '') => h(sinif ? (`img.${sinif.split(' ').join('.')}` as 'img') : 'img', { src: resim(ad) ?? '', alt: '', draggable: 'false' });
const zeminAdi: Record<Sahne3, string> = { 'otobus-ic': 'otobus-ic', 'otobus-yani': 'otobus-yani', agac: 'agac', kiler: 'kiler-ic' };
export const zeminUrl = (s: Sahne3) => (SAHNE3_DIKEY[s] && resim(`v3/${zeminAdi[s]}-dikey`)) || resim(`v3/${zeminAdi[s]}`) || '';
const dikeyMi = (s: Sahne3): s is DikeySahne3 => (DIKEY_SAHNELER3 as Sahne3[]).includes(s);

/** Sahne dikey mi kurulmalı: dikey ekranda (boy > en) ve sahnenin 9:16 çizimi varsa (DIKEY3_HAZIR açıkken) */
function dikeyOlmali(s: DikeySahne3): boolean {
  return DIKEY3_HAZIR && typeof window !== 'undefined' && window.innerHeight > window.innerWidth && cizimVar(`${zeminAdi[s]}-dikey`);
}
/** Sahnelerin yerleşimini seçer (sahneler kurulmadan önce, vaka her açılışta) */
export function sahne3Kur() {
  for (const s of DIKEY_SAHNELER3) sahne3Yerlesim(s, dikeyOlmali(s));
}

type Kutu = { x0: number; y0: number; x1: number; y1: number };
/** Öğeyi kutuya (oda oranı) yerleştirir: sol üst + en/boy */
function kutuya(el: HTMLElement | undefined, k: Kutu, W: number) {
  if (!el) return;
  Object.assign(el.style, { left: px(k.x0 * W), top: px(k.y0 * ODA_H), width: px((k.x1 - k.x0) * W), height: px((k.y1 - k.y0) * ODA_H) });
}
/** İpucunu tanımındaki yere koyar (ipucuEl'in aynısı: ortası, boyu, dönüşü) */
function ipucuYerlestir(el: HTMLElement | undefined, t: IpucuTanim, W: number) {
  if (!el) return;
  el.style.left = px(t.x * W);
  el.style.top = px(t.y * ODA_H);
  el.style.height = px(t.h * ODA_H);
  el.style.setProperty('--don', `${t.don ?? 0}deg`);
}

/**
 * Sahnenin kendi resminden kırpılmış kopya (kutu: oda oranı; biçim: kutunun yüzdesiyle çokgen ya da elips). Aynı resim,
 * aynı ölçek: alttakinin tam üstüne oturur (ön katman ya da büyütecin incelediği parça). kirpimDiz yeniden yerleştirir.
 */
export function kirpim(s: Sahne3, k: Kutu, bicim: string, sinif = ''): HTMLElement {
  const el = h(`div.dd-v3-kirpim${sinif ? '.' + sinif : ''}`);
  kirpimDiz(el, s, k, bicim);
  return el;
}
function kirpimDiz(el: HTMLElement, s: Sahne3, k: Kutu, bicim?: string) {
  const W = odaW(s);
  const x0 = k.x0 * W;
  const y0 = k.y0 * ODA_H;
  kutuya(el, k, W);
  if (bicim) el.style.clipPath = bicim;
  Object.assign(el.style, { backgroundImage: `url("${zeminUrl(s)}")`, backgroundSize: `${px(W)} ${px(ODA_H)}`, backgroundPosition: `${px(-x0)} ${px(-y0)}` });
}

/** Kovuğun kutusu (oda oranı); pay: dudakla birlikte (yanlarda dudakX, altta dudak) */
export const kovukKutusu = (k: Kovuk, pay?: number) => {
  const px_ = pay ?? 1 + (k.dudakX ?? k.dudak);
  const py = pay ?? 1 + k.dudak;
  return { x0: k.x - k.rx * px_, y0: k.y - k.ry * py, x1: k.x + k.rx * px_, y1: k.y + k.ry * py };
};
/**
 * Kovuğun alt dudağı (ön katman): dış elipsle (kutu) iç elips (ağız) arasındaki halkanın alt yarısı (biraz yukarı taşar:
 * kuyruk ve baykuş dudağın arkasına girer). Kutu: kovukKutusu; biçim kutunun yüzdesiyle. İç elips ağzın koyu kenarında
 * (biraz içeride: ağzın karanlığı öndekini örtmez, dudağın açık kenarı kuyruğun üstünde kalır).
 */
export function dudakBicimi(k: Kovuk, ust = -0.08): string {
  const dx = 1 + (k.dudakX ?? k.dudak);
  const dy = 1 + k.dudak;
  const l: [number, number][] = [];
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
    l.push([50 + (50 / dx) * Math.cos(a) * 0.98, 50 + (50 / dy) * Math.sin(a) * 0.98]);
  }
  return `polygon(${l.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`;
}
/** Çokgen (oda oranı) → kutunun yüzdesiyle clip-path */
function cokgenBicimi(k: Kutu, c: [number, number][]): string {
  const w = k.x1 - k.x0;
  const hh = k.y1 - k.y0;
  return `polygon(${c.map(([x, y]) => `${(((x - k.x0) / w) * 100).toFixed(2)}% ${(((y - k.y0) / hh) * 100).toFixed(2)}%`).join(', ')})`;
}
function ekle(e: Record<string, HTMLElement>, ad: string, el: HTMLElement) {
  e[ad] = el;
  return el;
}
/** Sahnenin dizilişi (kuruluşta ve telefon dönünce): öğeleri tablolardaki yerlerine koyar */
const dizenler = new WeakMap<Oda, () => void>();

/**
 * Telefon vakanın ortasında döndü (web sitesinde yön serbest): dikey eşi olan sahne yerinde yeni yönün yerleşimine
 * geçer (zemin resmi, oda eni, ipuçları, eşyalar, ön katmanlar). Öğeler ve durumları (bulundu, sayıldı, verildi) korunur.
 * Yerleşim zaten bu yöne uygunsa false.
 */
export function sahne3YenidenDiz(oda: Oda): boolean {
  const s = oda.id as Sahne3;
  if (!dikeyMi(s)) return false;
  const dikey = dikeyOlmali(s);
  if (dikey === SAHNE3_DIKEY[s]) return false;
  sahne3Yerlesim(s, dikey);
  dizenler.get(oda)?.();
  return true;
}
/** Zemin ve oda eni (dizenin ortak başı) */
function zeminDiz(oda: Oda) {
  const s = oda.id as Sahne3;
  const W = odaW(s);
  oda.W = W;
  oda.el.style.width = px(W);
  if (SAHNE3_DIKEY[s]) oda.el.dataset.dikey = '1';
  else delete oda.el.dataset.dikey;
  const z = oda.el.querySelector<HTMLImageElement>('img.dd-zemin');
  const url = zeminUrl(s);
  if (z && z.getAttribute('src') !== url) z.src = url;
  return W;
}

// ---------------------------------------------------------------- otobüsün içi
/**
 * Tepsi (çizimin kendi tepsisi, tezgâhta), iki kurabiye, dört boş yerin un halkaları (ipucu), sayma düğmeleri; pervaz
 * ön katmanı; final eşyaları. Çizim yoksa (yer tutucu) tepsi kodla çizilir.
 */
export function otobusIc(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'otobus-ic';
  const e: Record<string, HTMLElement> = {};
  const kurabiyeler = h(
    'div.dd-v3-tepsi-kurabiye',
    {},
    ...KALAN.map((i) => h('img.dd-v3-kurabiye', { src: resim('v3/kurabiye') ?? '', alt: '', draggable: 'false', 'data-yer': String(i), style: `--don:${i * 7 - 10}deg` })),
  );
  // ipucu: dört un halkası (bütün tepsinin kutusunda; büyüteç tepsinin ortasına bakar)
  const un = h(
    'div.dd-ipucu.dd-v3-un.bt-gizli',
    { 'data-ipucu': 'un' },
    ...BOS_YERLER.map((i) => h('img', { src: resim('v3/un-halka') ?? '', alt: '', draggable: 'false', 'data-yer': String(i) })),
  );
  e['ipucu-un'] = un;
  // sayma: boş yerlere dokunulur, rakam belirir
  e.sayac = h('div.dd-v3-sayac', {}, ...BOS_YERLER.map((i) => h('button.dd-v3-say', { type: 'button', 'aria-label': 'Boş yer', 'data-yer': String(i) }, h('b'))));
  // tepsi: çizimde var (kutusu yerleşim ve büyüteç için); yer tutucu sahnede kodla çizilir
  const tepsi = h('div.dd-v3-tepsi', {}, cizimVar('otobus-ic') ? null : img('v3/tepsi', 'dd-v3-tepsi-resim'), kurabiyeler);
  e.tepsi = tepsi;
  e.kurabiyeler = kurabiyeler;
  for (const t of ipuclari) if (t.id !== 'un') ekle(e, `ipucu-${t.id}`, ipucuEl(t, odaW(id)));
  // final: pencerede Fındık (pervazın arkasında), tabela ve yeni kurabiye
  e.findik = h('div.dd-v3-pencere-findik', {}, img('v3/findik'));
  e.pervaz = kirpim(id, OTOBUS.pervaz, cokgenBicimi(OTOBUS.pervaz, OTOBUS.pervaz.cokgen), 'dd-v3-pervaz');
  e.tabela = h('img.dd-v3-tabela', { src: resim('v3/tabela') ?? '', alt: '', draggable: 'false' });
  e.yeni = h('img.dd-v3-yeni-kurabiye', { src: resim('v3/palamut-kurabiye') ?? '', alt: '', draggable: 'false' });
  // baca kapağının buharı
  e.buhar = h('div.dd-v3-buhar.bt-yok');
  const el = h(
    'div.dd-dunya.dd-v3-sahne',
    { 'data-oda': id, style: `height:${px(ODA_H)}` },
    katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), e.findik, e.pervaz, e.yeni, e.tabela, tepsi, un, e.sayac, ...ipuclari.filter((t) => t.id !== 'un').map((t) => e[`ipucu-${t.id}`]), e.buhar).el,
  );
  const oda: Oda = { id, el, W: odaW(id), katmanlar: [], e };
  const diz = () => {
    const W = zeminDiz(oda);
    const T = TEPSI3;
    const k = T.kutu;
    const k0 = { x: k.x0 * W, y: k.y0 * ODA_H };
    const en = T.en * ODA_H;
    // tepsinin kutusundaki yer (px): i. yerin ortası
    const yer = (i: number) => [T.yerler[i][0] * W - k0.x, T.yerler[i][1] * ODA_H - k0.y] as const;
    for (const kap of [tepsi, e.sayac]) kutuya(kap, k, W);
    // un ipucu kutunun ortasından (translate -50%)
    Object.assign(un.style, { left: px(((k.x0 + k.x1) / 2) * W), top: px(((k.y0 + k.y1) / 2) * ODA_H), width: px((k.x1 - k.x0) * W), height: px((k.y1 - k.y0) * ODA_H) });
    for (const kap of [tepsi, un, e.sayac]) kap.style.setProperty('--basik', String(cizimVar('otobus-ic') ? T.basik : 1));
    kurabiyeler.querySelectorAll<HTMLElement>('.dd-v3-kurabiye').forEach((c) => {
      const [x, y] = yer(Number(c.dataset.yer));
      Object.assign(c.style, { left: px(x), top: px(y), width: px(en) });
    });
    un.querySelectorAll<HTMLElement>('img').forEach((c) => {
      const [x, y] = yer(Number(c.dataset.yer));
      Object.assign(c.style, { left: px(x), top: px(y), width: px(en * 1.1) });
    });
    const basik = cizimVar('otobus-ic') ? T.basik : 1;
    e.sayac.querySelectorAll<HTMLElement>('.dd-v3-say').forEach((d) => {
      const [x, y] = yer(Number(d.dataset.yer));
      Object.assign(d.style, { left: px(x), top: px(y), width: px(en * 1.15), height: px(en * (basik < 1 ? Math.max(0.62, basik * 1.25) : 0.95)) });
    });
    for (const t of ipuclari) if (t.id !== 'un') ipucuYerlestir(e[`ipucu-${t.id}`], t, W);
    const f = OTOBUS.findik;
    Object.assign(e.findik.style, { left: px(f.x * W), top: px(f.y * ODA_H), height: px(f.h * ODA_H) });
    kirpimDiz(e.pervaz, id, OTOBUS.pervaz, cokgenBicimi(OTOBUS.pervaz, OTOBUS.pervaz.cokgen));
    const tb = OTOBUS.tabela;
    Object.assign(e.tabela.style, { left: px(tb.x * W), top: px(tb.y * ODA_H), height: px(tb.h * ODA_H) });
    const yk = OTOBUS.yeniKurabiye;
    Object.assign(e.yeni.style, { left: px(yk.x * W), top: px(yk.y * ODA_H), height: px(yk.h * ODA_H) });
    Object.assign(e.buhar.style, { left: px(((OTOBUS.baca.x0 + OTOBUS.baca.x1) / 2) * W), top: px(OTOBUS.baca.y1 * ODA_H) });
  };
  dizenler.set(oda, diz);
  diz();
  return oda;
}

// ---------------------------------------------------------------- otobüsün yanı
/** Üç patikanın başındaki ipuçları ve ağaca giden yıldız şeker izi */
export function otobusYani(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'otobus-yani';
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) ekle(e, `ipucu-${t.id}`, ipucuEl(t, odaW(id)));
  const url = resim('v3/seker-tek') ?? '';
  e.iz = h(
    'div.dd-izler.dd-v3-seker-izi',
    {},
    ...SEKER_IZI.map((_, i) => h('button.dd-iz.dd-v3-seker', { type: 'button', 'aria-label': 'Yıldız şeker', 'data-iz': String(i), style: `--i:${i}` }, h('img', { src: url, alt: '', draggable: 'false' }))),
  );
  const el = h('div.dd-dunya.dd-v3-sahne', { 'data-oda': id, style: `height:${px(ODA_H)}` }, katman('dd-k-tek', 0, h('img.dd-zemin', { src: zeminUrl(id), alt: '', draggable: 'false' }), ...ipuclari.map((t) => e[`ipucu-${t.id}`]), e.iz).el);
  const oda: Oda = { id, el, W: odaW(id), katmanlar: [], e };
  const diz = () => {
    const W = zeminDiz(oda);
    for (const t of ipuclari) ipucuYerlestir(e[`ipucu-${t.id}`], t, W);
    e.iz.querySelectorAll<HTMLElement>('.dd-v3-seker').forEach((b, i) => {
      const p = SEKER_IZI[i];
      if (!p) return;
      Object.assign(b.style, { left: px(p.x * W), top: px(p.y * ODA_H), height: px(p.h * ODA_H) });
      b.style.setProperty('--don', `${p.don}deg`);
    });
  };
  dizenler.set(oda, diz);
  diz();
  return oda;
}

// ---------------------------------------------------------------- büyük ağaç
/**
 * Üç kovuk: üstte uyuyan baykuş (ağzın elipsine kırpık), ortada yuva (sahnenin kendi kırpımı: sallanır), altta (sağdaki)
 * dudağın arkasından sarkan kuyruk ucu. Alt ve üst kovuğun dudakları ön katman. Fındık alt kovuktan fırlar. Dipte ipuçları.
 */
export function agacSahnesi(ipuclari: IpucuTanim[]): Oda {
  const id: Sahne3 = 'agac';
  const e: Record<string, HTMLElement> = {};
  for (const t of ipuclari) ekle(e, `ipucu-${t.id}`, ipucuEl(t, odaW(id)));
  const { ust, orta, alt } = KOVUKLAR;
  // baykuş: üst kovuğun ağzının içinde (elipse kırpık), yarısı dudağın altında
  e['ipucu-baykus'] = h('div.dd-ipucu.dd-v3-kovuk-ic.bt-gizli', { 'data-ipucu': 'baykus' }, h('div.dd-v3-agiz', {}, img('v3/baykus', 'dd-v3-baykus')));
  // yuva: orta kovuğun kendi kırpımı (çizimdeki yuva; dokununca sallanır)
  const yv = kirpim(id, kovukKutusu(orta, 1), 'ellipse(50% 50% at 50% 50%)', 'dd-v3-yuva');
  e['ipucu-yuva'] = h('div.dd-ipucu.dd-v3-kovuk-ic.bt-gizli', { 'data-ipucu': 'yuva' }, h('i.dd-v3-yuva-isaret'));
  e.yuva = yv;
  // kuyruk ucu: alt kovuğun içinden dudağın üstünden sarkar (kökü dudağın arkasında)
  e['ipucu-kuyruk'] = h('div.dd-ipucu.dd-v3-kuyruk.bt-gizli', { 'data-ipucu': 'kuyruk' }, img('v3/findik-kuyruk'));
  e.kirintilar = h('div.dd-v3-kirintilar.bt-yok');
  // Fındık kovuğun içinde (alt ağzın elipsine kırpık kap), sonra dışarıda
  e.findikIc = h('div.dd-v3-findik-ic', {}, h('div.dd-v3-agiz'));
  // dudaklar (ön katman)
  e.dudakUst = kirpim(id, kovukKutusu(ust), dudakBicimi(ust), 'dd-v3-dudak');
  e.dudakAlt = kirpim(id, kovukKutusu(alt), dudakBicimi(alt), 'dd-v3-dudak');
  e.findikDis = h('div.dd-v3-findik-dis');
  e.kurabiyeler = h(
    'div.dd-v3-final-kurabiyeler',
    {},
    ...FINAL_KURABIYELER.map((_, i) => h('button.dd-v3-final-kurabiye', { type: 'button', 'aria-label': 'Kurabiye', 'data-i': String(i) }, img('v3/kurabiye'), h('b'))),
  );
  const el = h(
    'div.dd-dunya.dd-v3-sahne',
    { 'data-oda': id, style: `height:${px(ODA_H)}` },
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
  const oda: Oda = { id, el, W: odaW(id), katmanlar: [], e };
  const diz = () => {
    const W = zeminDiz(oda);
    for (const t of ipuclari) ipucuYerlestir(e[`ipucu-${t.id}`], t, W);
    const { ust: u, orta: o, alt: a } = KOVUKLAR;
    kutuya(e['ipucu-baykus'], kovukKutusu(u, 1), W);
    kirpimDiz(yv, id, kovukKutusu(o, 1));
    kutuya(e['ipucu-yuva'], kovukKutusu(o, 1), W);
    const ky = KOVUK_ICI.kuyruk;
    Object.assign(e['ipucu-kuyruk'].style, { left: px(ky.x * W), top: px(ky.y * ODA_H), height: px(ky.h * ODA_H) });
    Object.assign(e.kirintilar.style, { left: px(a.x * W), top: px((a.y + a.ry * 0.9) * ODA_H) });
    kutuya(e.findikIc, kovukKutusu(a, 1), W);
    kirpimDiz(e.dudakUst, id, kovukKutusu(u), dudakBicimi(u));
    kirpimDiz(e.dudakAlt, id, kovukKutusu(a), dudakBicimi(a));
    e.kurabiyeler.querySelectorAll<HTMLElement>('.dd-v3-final-kurabiye').forEach((b, i) => {
      const [x, y] = FINAL_KURABIYELER[i];
      Object.assign(b.style, { left: px(x * W), top: px(y * ODA_H) });
    });
    Object.assign(e.findikDis.style, { left: px(FINDIK_YERI.x * W), top: px(FINDIK_YERI.y * ODA_H) });
  };
  dizenler.set(oda, diz);
  diz();
  return oda;
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

