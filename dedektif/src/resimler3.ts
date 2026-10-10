/**
 * Vaka 3 görselleri: TEK HARİTA. Anahtarlar ekip/gemini/IS-LISTESI-YENI.md bölüm B'nin (ve E: roman, kapak) dosya adlarıdır:
 * 'otobus-ic' → assets/dedektif3/otobus-ic.webp. Kodda 'v3/<ad>' diye çağrılır (resimler.ts → resim).
 *
 * Bir ad şu sırayla çözülür:
 *  1. assets/dedektif3/<ad>.webp (Gemini çizimi, Adobe / ekip/illustrator/dedektif3-isle.cjs temizler): varsa HEP o.
 *     Dosyayı klasöre koymak yeter, kod değişmez (Vite derlemede klasörü tarar; -2, -3 sürüm eki: en büyüğü).
 *  2. KULLAN: depoda zaten olan bir çizim (yeniden kullanım tablosu, senaryodaki "Yeniden kullanılan"lar).
 *  3. YER_TUTUCU: çizim gelene kadar özenli bir yer tutucu (tuvalde kurulur: var olan çizimlerden kırpım / bileşim ve
 *     SVG; yer-tutucu3.ts). Yalnız dosya yoksa üretilir.
 *  4. TURETILEN: her zaman kodla kurulan bileşimler (kartlardaki 2/4/6 kurabiye, delil fotoğrafları): kaynakları
 *     yukarıdaki sırayla çözülür, Gemini çizimi gelince onlar da kendiliğinden onunla kurulur.
 *
 * Tuval işleri tarayıcıda, vaka açılırken bir kez (hazirla3). Dikey sahneler (B2, B4, B6) şimdilik kullanılmaz:
 * DIKEY3_HAZIR (çizim gelip ipuçlarının yerleri ölçülünce açılır); o zamana dek dikey ekranda yatay sahne kullanılır.
 */
import { BOS_YERLER, KALAN, KURABIYE_EN, OTOBUS, TEPSI_ORAN, TEPSI_YERLERI } from './mantik3';
import {
  agacOnSvg,
  ekmekSvg,
  elIziSvg,
  geceSvg,
  icEkSvg,
  kalpSvg,
  kapiSvg,
  karYagisi,
  kilerSvg,
  kirintiSvg,
  kirpiSvg,
  konfeti,
  palamut,
  PALAMUT_DEFS,
  palamutKurabiyeSvg,
  palamutSvg,
  partiSapkasi,
  svgSar,
  tepsiSvg,
  tohumSvg,
  tuySvg,
  unHalkaSvg,
  yaniOnSvg,
  yanakSvg,
  yildizSeker,
  yildizSekerSvg,
  YS_DEFS,
} from './yer-tutucu3';
import { surumTablosu } from './resimler';

const DEDEKTIF3 = import.meta.glob<string>('../../assets/dedektif3/*.webp', { eager: true, query: '?url', import: 'default' });
/** Yeniden kullanılan çizimler (depoda zaten var) */
const KAYNAK = import.meta.glob<string>(
  [
    '../../assets/pasta/{arka-tezgah-uzak-1,tezgah-on-1,otobus-1,kurabiye-yildiz-krema-sari,susler-havuc}.webp',
    '../../assets/film/park/{arka-uzak,arka-orta,kume-sol}.webp',
    '../../assets/orman-karakter/{sincap,sincap-uyku,baykus}.webp',
    '../../assets/hayvanlar/kus.webp',
    '../../assets/film/mino-karpuz/tabak.webp',
    '../../assets/parti/sapka.webp',
    '../../assets/parti/flama.webp',
    '../../assets/renkler/balon.webp',
    '../../assets/dedektif2/kino-sarilma.webp',
    '../../assets/dedektif/poz-mino-rahat.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
const GERCEK = surumTablosu(DEDEKTIF3);
const kaynak = (yol: string): string | null => KAYNAK[`../../assets/${yol}.webp`] ?? null;

// ---------------------------------------------------------------- bölüm B ve E (Gemini)
/** Gemini'nin çizeceği Vaka 3 dosyaları (IS-LISTESI-YENI.md: B1-B28, E1-E5) */
export const B_LISTESI = [
  'otobus-ic',
  'otobus-ic-dikey',
  'otobus-yani',
  'otobus-yani-dikey',
  'agac',
  'agac-dikey',
  'kiler-ic',
  'ipucu-kirinti',
  'ipucu-tohum',
  'ipucu-yildiz-seker',
  'ipucu-el-izi',
  'ipucu-tuy',
  'kart-kapi',
  'kart-pencere',
  'kart-baca',
  'kart-sincap',
  'kart-kirpi',
  'kart-sincap-ac',
  'kart-sincap-kiler',
  'kart-sincap-parti',
  'findik',
  'findik-yanak',
  'findik-utangac',
  'findik-sarilma',
  'findik-kuyruk',
  'baykus',
  'palamut',
  'palamut-kurabiye',
] as const;
export const E_LISTESI = ['roman-1', 'roman-2', 'roman-3', 'roman-4', 'kapak'] as const;
/** Dikey sahneler (B2, B4, B6) ipuçlarının yerleri ölçülünce açılır: o zamana dek dikeyde de yatay sahne */
export const DIKEY3_HAZIR = false;

/** Depodaki çizimlerden yeniden kullanılanlar (yeni çizim YOK) */
export const KULLAN: Record<string, string> = {
  havuc: 'pasta/susler-havuc',
  'kart-kus': 'hayvanlar/kus',
  // Halka 5: parti arayan şapka (parti oyununun şapkası)
  'parti-sapka': 'parti/sapka',
};

// ---------------------------------------------------------------- tuval
export interface Tuval {
  c: CanvasRenderingContext2D;
  w: number;
  h: number;
  /** resim çizer: kaynak 'v3/<ad>' (bu haritadan) ya da 'dosya:<assets yolu>'; kirp: kaynağın oranı [x0, y0, x1, y1] */
  resim(ad: string, x: number, y: number, w: number, h?: number, o?: { don?: number; ayna?: boolean; alfa?: number; kirp?: [number, number, number, number] }): Promise<void>;
  /** SVG metnini (kendi kutusuyla) çizer */
  svg(metin: string, x: number, y: number, w: number, h: number): Promise<void>;
  /** bir noktanın rengi (o ana kadar çizilmiş) */
  renk(x: number, y: number): string;
}
type Tarif = { w: number; h: number; ciz: (t: Tuval) => Promise<void> };

const uretilen = new Map<string, string>();
const suren = new Map<string, Promise<string | null>>();
const yuklenen = new Map<string, Promise<HTMLImageElement>>();

function yukle(url: string): Promise<HTMLImageElement> {
  let p = yuklenen.get(url);
  if (!p) {
    p = new Promise<HTMLImageElement>((coz, red) => {
      const i = new Image();
      i.decoding = 'async';
      i.onload = () => coz(i);
      i.onerror = () => red(new Error(`yüklenemedi: ${url.slice(0, 60)}`));
      i.src = url;
    });
    yuklenen.set(url, p);
  }
  return p;
}
const svgUrl = (metin: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(metin)}`;

async function tuvalKur(tarif: Tarif): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = tarif.w;
  cv.height = tarif.h;
  const c = cv.getContext('2d');
  if (!c) return null;
  c.imageSmoothingQuality = 'high';
  const t: Tuval = {
    c,
    w: tarif.w,
    h: tarif.h,
    async resim(ad, x, y, w, h, o = {}) {
      const url = ad.startsWith('dosya:') ? kaynak(ad.slice(6)) : await al(ad.replace(/^v3\//, ''));
      if (!url) return;
      const i = await yukle(url);
      const [k0, k1, k2, k3] = o.kirp ?? [0, 0, 1, 1];
      const sx = k0 * i.naturalWidth;
      const sy = k1 * i.naturalHeight;
      const sw = (k2 - k0) * i.naturalWidth;
      const sh = (k3 - k1) * i.naturalHeight;
      const hh = h ?? (w * sh) / Math.max(1, sw);
      c.save();
      c.globalAlpha = o.alfa ?? 1;
      c.translate(x + w / 2, y + hh / 2);
      if (o.don) c.rotate((o.don * Math.PI) / 180);
      if (o.ayna) c.scale(-1, 1);
      c.drawImage(i, sx, sy, sw, sh, -w / 2, -hh / 2, w, hh);
      c.restore();
    },
    async svg(metin, x, y, w, h) {
      const i = await yukle(svgUrl(metin));
      c.drawImage(i, x, y, w, h);
    },
    renk(x, y) {
      const d = c.getImageData(Math.round(x), Math.round(y), 1, 1).data;
      return `rgb(${d[0]},${d[1]},${d[2]})`;
    },
  };
  await tarif.ciz(t);
  const blob = await new Promise<Blob | null>((coz) => cv.toBlob(coz, 'image/webp', 0.92));
  if (blob) return URL.createObjectURL(blob);
  return cv.toDataURL('image/png');
}

/** Bir adın adresi (gerekirse üretip): Vaka 3'ün bütün çizimleri bundan geçer */
async function al(ad: string): Promise<string | null> {
  const hazir = resim3(ad);
  if (hazir) return hazir;
  const tarif = YER_TUTUCU[ad] ?? TURETILEN[ad];
  if (!tarif) return null;
  let p = suren.get(ad);
  if (!p) {
    p = tuvalKur(tarif)
      .then((u) => {
        if (u) uretilen.set(ad, u);
        return u;
      })
      .catch((e: unknown) => {
        console.warn('Vaka 3 yer tutucu kurulamadı', ad, e);
        return null;
      });
    suren.set(ad, p);
  }
  return p;
}

/** Adres (şimdi): Gemini çizimi, yeniden kullanılan çizim ya da üretilmiş yer tutucu; henüz yoksa null */
export function resim3(ad: string): string | null {
  return GERCEK.get(ad) ?? (KULLAN[ad] ? kaynak(KULLAN[ad]) : null) ?? uretilen.get(ad) ?? (SABIT[ad] ? svgUrl(SABIT[ad]()) : null);
}
/** Bu ad Gemini çizimiyle mi geliyor (assets/dedektif3) */
export const cizimVar = (ad: string) => GERCEK.has(ad);
/** Bu adın bir kaynağı var mı (dosya, yeniden kullanım, yer tutucu ya da bileşim) */
export const tanimli = (ad: string) => GERCEK.has(ad) || ad in KULLAN || ad in YER_TUTUCU || ad in TURETILEN || ad in SABIT;
/** Bölüm B ve E'den henüz çizimi gelmemiş (yer tutucuyla duran) dosyalar */
export const eksikler3 = (): string[] => [...B_LISTESI, ...E_LISTESI].filter((a) => !GERCEK.has(a));

/** Vaka açılırken: bütün yer tutucular ve bileşimler kurulur (bir kez; sonraki açılışlarda bekletmez) */
let hepsi: Promise<void> | null = null;
export function hazirla3(): Promise<void> {
  if (!hepsi) hepsi = Promise.all([...Object.keys(YER_TUTUCU), ...Object.keys(TURETILEN)].map((a) => al(a))).then(() => undefined);
  return hepsi;
}

// ---------------------------------------------------------------- sabit SVG'ler (küçük eşyalar; her zaman anında hazır)
/** Bölüm B dışındaki küçük eşyalar (vektör, bulanıklaşmaz): tepsi, un halkası, Kino'nun ekmeği, kalp */
const SABIT: Record<string, () => string> = {
  tepsi: tepsiSvg,
  'un-halka': unHalkaSvg,
  ekmek: ekmekSvg,
  kalp: () => kalpSvg(),
  // yıldız şeker izinin tek şekeri (iz sürme)
  'seker-tek': () => svgSar(140, 140, `${YS_DEFS}${yildizSeker(70, 72, 56, -90)}`),
  // kovuktan düşen minik yıldız kırıntı
  'kirinti-tek': () => svgSar(80, 80, `${YS_DEFS}${yildizSeker(40, 40, 30, -80)}`),
};

// ---------------------------------------------------------------- yer tutucular (bölüm B, E)
const kare = (n: number, ciz: (t: Tuval) => Promise<void>): Tarif => ({ w: n, h: n, ciz });
/** sahne yer tutucularının boyu (4096 × 2286'nın küçüğü: yalnız çizim gelene dek) */
const SW = 2560;
const SH = Math.round((SW * 2286) / 4096);

export const YER_TUTUCU: Record<string, Tarif> = {
  // B1: Pasta Otobüsü'nün içi (pasta oyununun iç dünyası) + tezgâh öne, biraz aşağı (pencerenin pervazı açıkta) + kapı sürgüsü
  'otobus-ic': {
    w: SW,
    h: SH,
    async ciz(t) {
      await t.resim('dosya:pasta/arka-tezgah-uzak-1', 0, 0, t.w, t.h);
      await t.svg(icEkSvg(), 0, 0, t.w, t.h);
      await t.resim('dosya:pasta/tezgah-on-1', 0, t.h * 0.2, t.w, t.h);
    },
  },
  // B3: otobüsün yanı: park, otobüsün pembe yanı solda (pencere yukarıda), üç patika, gölet, bank, ağaç
  'otobus-yani': {
    w: SW,
    h: SH,
    async ciz(t) {
      await t.resim('dosya:film/park/arka-uzak', 0, 0, t.w, t.h);
      await t.svg(yaniOnSvg(), 0, 0, t.w, t.h);
      // bank (park çiziminden kırpım), uzakta
      await t.resim('dosya:film/park/arka-orta', t.w * 0.715, t.h * 0.585, t.w * 0.09, undefined, { kirp: [0.02, 0.62, 0.27, 0.97] });
      await t.resim('dosya:pasta/otobus-1', -t.w * 0.1, t.h * 0.15, t.w * 0.55);
      await t.resim('dosya:film/park/kume-sol', -t.w * 0.04, t.h * 0.74, t.w * 0.2);
    },
  },
  // B5: büyük meşe, üç kovuk (dudakları ayrı biçim), dipte toprak ve palamutlar
  agac: {
    w: SW,
    h: SH,
    async ciz(t) {
      await t.resim('dosya:film/park/arka-uzak', 0, 0, t.w, t.h);
      await t.svg(agacOnSvg(), 0, 0, t.w, t.h);
    },
  },
  // B7: kovuğun içi (kiler): raflar, palamutlar, fındıklar, sonda iki bütün yıldız kurabiye, kar tanesi
  'kiler-ic': {
    w: SW,
    h: SH,
    async ciz(t) {
      await t.svg(kilerSvg(), 0, 0, t.w, t.h);
      const k = t.w * 0.105;
      await t.resim('v3/kurabiye', t.w * 0.47, t.h * 0.535, k, k, { don: -8 });
      await t.resim('v3/kurabiye', t.w * 0.565, t.h * 0.54, k, k, { don: 10 });
    },
  },
  'ipucu-kirinti': { w: 600, h: 360, ciz: (t) => t.svg(kirintiSvg(), 0, 0, t.w, t.h) },
  'ipucu-tohum': { w: 600, h: 360, ciz: (t) => t.svg(tohumSvg(), 0, 0, t.w, t.h) },
  'ipucu-yildiz-seker': { w: 600, h: 360, ciz: (t) => t.svg(yildizSekerSvg(), 0, 0, t.w, t.h) },
  'ipucu-el-izi': { w: 700, h: 460, ciz: (t) => t.svg(elIziSvg(), 0, 0, t.w, t.h) },
  'ipucu-tuy': kare(520, (t) => t.svg(tuySvg(), 0, 0, t.w, t.h)),
  // B13: kapı (çizim); B14-B15: pencere ve baca kapağı (otobüsün içinin çiziminden kırpım)
  'kart-kapi': kare(768, (t) => t.svg(kapiSvg(), 0, 0, t.w, t.h)),
  'kart-pencere': kare(768, (t) => parca(t, OTOBUS.pencere, 0.06)),
  'kart-baca': kare(768, (t) => parca(t, OTOBUS.baca, 0.12)),
  // B16, B21: orman sincabı (Fındık'ın yerine; Gemini B21'i çizince)
  'kart-sincap': kare(768, (t) => t.resim('dosya:orman-karakter/sincap', 0, 0, t.w, t.h)),
  findik: kare(768, (t) => t.resim('dosya:orman-karakter/sincap', 0, 0, t.w, t.h)),
  'kart-kirpi': kare(768, (t) => t.svg(kirpiSvg(), 0, 0, t.w, t.h)),
  // B18: aç sincap (karnını tutar, önünde boş tabak)
  'kart-sincap-ac': kare(768, async (t) => {
    await t.resim('v3/findik', t.w * 0.06, 0, t.w * 0.88, t.h * 0.88);
    await t.resim('dosya:film/mino-karpuz/tabak', t.w * 0.18, t.h * 0.7, t.w * 0.5, undefined);
  }),
  // B19: kış kileri (dizili palamutlar, dışarıda kar)
  'kart-sincap-kiler': kare(768, async (t) => {
    await t.svg(svgSar(768, 768, `${karYagisi(768, 520, 9)}<ellipse cx="560" cy="560" rx="170" ry="190" fill="#8a5734" stroke="#5a3820" stroke-width="10"/><ellipse cx="560" cy="560" rx="120" ry="140" fill="#3a2414"/>${[0, 1, 2].map((i) => palamut(505 + i * 55, 610, 62, i * 8 - 8, 3)).join('')}${[0, 1].map((i) => palamut(532 + i * 55, 540, 58, 6 - i * 10, 3)).join('')}`, PALAMUT_DEFS), 0, 0, t.w, t.h);
    await t.resim('v3/findik', -t.w * 0.06, t.h * 0.08, t.w * 0.8, t.h * 0.8);
  }),
  // B20: sincap partisi (parti şapkası, iki balon, konfeti)
  'kart-sincap-parti': kare(768, async (t) => {
    await t.svg(svgSar(768, 768, `<path d="M570 200 C560 300 590 400 560 500" stroke="#5a3820" stroke-width="5" fill="none"/><path d="M640 230 C650 330 610 420 600 500" stroke="#5a3820" stroke-width="5" fill="none"/>`), 0, 0, t.w, t.h);
    await t.resim('dosya:renkler/balon', t.w * 0.62, t.h * 0.04, t.w * 0.26);
    await t.resim('dosya:renkler/balon', t.w * 0.7, t.h * 0.1, t.w * 0.24);
    await t.resim('v3/findik', t.w * 0.0, t.h * 0.1, t.w * 0.84, t.h * 0.84);
    await t.svg(svgSar(768, 768, partiSapkasi(230, 150, 120, -14) + konfeti(768, 300, 18)), 0, 0, t.w, t.h);
  }),
  // B22: yanakları balon gibi şişmiş (kurabiyeyle dolu), ağzından kırıntı uçar
  'findik-yanak': kare(768, async (t) => {
    await t.resim('v3/findik', 0, 0, t.w, t.h);
    await t.svg(yanakSvg(768, 768, [196, 500], [372, 500], 74, '#fbd8b8'), 0, 0, t.w, t.h);
    await t.svg(svgSar(768, 768, `<g fill="#e8b866" stroke="#5a3820" stroke-width="4"><circle cx="300" cy="560" r="10"/><circle cx="330" cy="590" r="8"/><circle cx="262" cy="596" r="7"/></g>`), 0, 0, t.w, t.h);
  }),
  // B23: utangaç (gözler aşağıda, pembe yanak): uyku pozu
  'findik-utangac': kare(768, async (t) => {
    await t.resim('dosya:orman-karakter/sincap-uyku', 0, 0, t.w, t.h);
    await t.svg(svgSar(768, 768, `<ellipse cx="170" cy="440" rx="40" ry="20" fill="#ff7f9f" opacity=".45"/><ellipse cx="365" cy="440" rx="40" ry="20" fill="#ff7f9f" opacity=".45"/>`), 0, 0, t.w, t.h);
  }),
  // B24: iki yıldız kurabiyeye sarılmış, mutlu
  'findik-sarilma': kare(768, async (t) => {
    await t.resim('dosya:orman-karakter/sincap-uyku', 0, 0, t.w, t.h);
    await t.resim('v3/kurabiye', t.w * 0.08, t.h * 0.56, t.w * 0.25, t.w * 0.25, { don: -14 });
    await t.resim('v3/kurabiye', t.w * 0.27, t.h * 0.58, t.w * 0.25, t.w * 0.25, { don: 12 });
  }),
  // B25: kovuktan sarkan kabarık kuyruk ucu (sincabın kuyruğu, ters çevrilmiş)
  // Sincap çiziminde kuyruğun bir yanı gövdenin arkasında: tek kırpım dümdüz kesik, ince bir şerit gibi duruyordu.
  // Kırpım ve aynası yan yana (kesik kenarlar birbirinin içinde kalır): iki yanı da tüylü, gür bir kuyruk ucu.
  'findik-kuyruk': {
    w: 560,
    h: 1000,
    ciz: async (t) => {
      const k: [number, number, number, number] = [0.64, 0.06, 0.88, 0.72];
      await t.resim('dosya:orman-karakter/sincap', 0, 0, t.w * 0.62, t.h, { kirp: k, don: 180 });
      await t.resim('dosya:orman-karakter/sincap', t.w * 0.38, 0, t.w * 0.62, t.h, { kirp: k, don: 180, ayna: true });
    },
  },
  // B26: uyuyan baykuş (gözleri kapalı: gözlerin üstü yüz rengiyle örtülür, iki sakin kavis)
  baykus: kare(768, async (t) => {
    await t.resim('dosya:orman-karakter/baykus', 0, 0, t.w, t.h);
    const g = (x: number) => `<ellipse cx="${x}" cy="300" rx="104" ry="100" fill="#efd3ae"/><path d="M${x - 70} 300 C${x - 30} 340 ${x + 30} 340 ${x + 70} 300" stroke="#5a3820" stroke-width="16" fill="none" stroke-linecap="round"/>`;
    await t.svg(svgSar(768, 768, g(268) + g(500)), 0, 0, t.w, t.h);
  }),
  palamut: kare(600, (t) => t.svg(palamutSvg(), 0, 0, t.w, t.h)),
  'palamut-kurabiye': kare(600, (t) => t.svg(palamutKurabiyeSvg(), 0, 0, t.w, t.h)),
  // E1-E4: çizgi roman kareleri (4:3)
  'roman-1': {
    w: 1600,
    h: 1200,
    async ciz(t) {
      await sahneKirp(t, 'v3/otobus-ic', [0.3, 0.18, 0.7, 0.8]);
      await t.svg(geceSvg(1600, 1200), 0, 0, t.w, t.h);
      for (let i = 0; i < 6; i++) await t.resim('v3/kurabiye', t.w * (0.14 + i * 0.12), t.h * 0.64, t.w * 0.11, t.w * 0.11, { don: (i % 2 ? 8 : -8) });
      await t.resim('v3/findik-kuyruk', t.w * 0.86, t.h * 0.42, t.w * 0.1, undefined, { don: 160 });
    },
  },
  'roman-2': {
    w: 1600,
    h: 1200,
    async ciz(t) {
      await sahneKirp(t, 'v3/otobus-ic', [0.3, 0.18, 0.7, 0.8]);
      await t.svg(geceSvg(1600, 1200), 0, 0, t.w, t.h);
      await t.resim('v3/findik-yanak', t.w * 0.28, t.h * 0.18, t.w * 0.5, t.w * 0.5);
      await t.resim('v3/kurabiye', t.w * 0.36, t.h * 0.66, t.w * 0.14, t.w * 0.14, { don: -12 });
      await t.resim('v3/kurabiye', t.w * 0.47, t.h * 0.68, t.w * 0.14, t.w * 0.14, { don: 10 });
    },
  },
  'roman-3': {
    w: 1600,
    h: 1200,
    async ciz(t) {
      await sahneKirp(t, 'v3/otobus-yani', [0.48, 0.45, 1, 0.98]);
      await t.svg(svgSar(1600, 1200, `${YS_DEFS}${[0, 1, 2, 3, 4, 5].map((i) => yildizSeker(160 + i * 150, 1000 - i * 40 + (i % 2) * 30, 22, -90 + i * 20)).join('')}`), 0, 0, t.w, t.h);
      await t.resim('v3/findik', t.w * 0.5, t.h * 0.3, t.w * 0.4, t.w * 0.4, { ayna: true, don: 8 });
    },
  },
  'roman-4': {
    w: 1600,
    h: 1200,
    async ciz(t) {
      await sahneKirp(t, 'v3/agac', [0.3, 0.42, 0.78, 0.98]);
      await t.resim('v3/findik-sarilma', t.w * 0.36, t.h * 0.42, t.w * 0.32, t.w * 0.32);
      await t.resim('dosya:dedektif/poz-mino-rahat', t.w * 0.02, t.h * 0.3, t.w * 0.32);
      await t.resim('dosya:dedektif2/kino-sarilma', t.w * 0.66, t.h * 0.3, t.w * 0.32);
      await t.resim('v3/palamut', t.w * 0.77, t.h * 0.385, t.w * 0.06, t.w * 0.06, { don: 14 });
    },
  },
  // E5: Vaka Dosyam kapağı: ağaç, kovuktan bakan yanakları şiş Fındık
  kapak: {
    w: 1600,
    h: 1200,
    async ciz(t) {
      await sahneKirp(t, 'v3/agac', [0.32, 0.5, 0.76, 0.95]);
      await t.resim('v3/findik-yanak', t.w * 0.3, t.h * 0.2, t.w * 0.46, t.w * 0.46);
    },
  },
};

/** Otobüs içinin bir parçası (kapı, pencere, baca) kart için: kutunun çevresi biraz payla, karenin ortasına */
async function parca(t: Tuval, k: { x0: number; y0: number; x1: number; y1: number }, pay: number) {
  const W = 4096;
  const H = 2286;
  let x0 = k.x0 - pay * (k.x1 - k.x0);
  let x1 = k.x1 + pay * (k.x1 - k.x0);
  let y0 = k.y0 - pay * (k.y1 - k.y0) * 0.5;
  let y1 = k.y1 + pay * (k.y1 - k.y0) * 0.5;
  // kare kırpım (sahnenin piksel oranında)
  const gw = (x1 - x0) * W;
  const gh = (y1 - y0) * H;
  const s = Math.max(gw, gh);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  x0 = Math.max(0, cx - s / 2 / W);
  x1 = Math.min(1, cx + s / 2 / W);
  y0 = Math.max(0, cy - s / 2 / H);
  y1 = Math.min(1, cy + s / 2 / H);
  const r = t.w * 0.08;
  t.c.save();
  t.c.beginPath();
  t.c.roundRect?.(t.w * 0.04, t.h * 0.04, t.w * 0.92, t.h * 0.92, r);
  t.c.clip();
  const ow = (x1 - x0) * W;
  const oh = (y1 - y0) * H;
  const olcek = Math.min((t.w * 0.92) / ow, (t.h * 0.92) / oh);
  const w = ow * olcek;
  const h = oh * olcek;
  await t.resim('v3/otobus-ic', (t.w - w) / 2, (t.h - h) / 2, w, h, { kirp: [x0, y0, x1, y1] });
  t.c.restore();
  t.c.lineWidth = t.w * 0.018;
  t.c.strokeStyle = '#5a3820';
  t.c.beginPath();
  t.c.roundRect?.(t.w * 0.04, t.h * 0.04, t.w * 0.92, t.h * 0.92, r);
  t.c.stroke();
}
/** Sahneden kırpım tuvali doldurur (kare / roman) */
async function sahneKirp(t: Tuval, ad: string, k: [number, number, number, number]) {
  await t.resim(ad, 0, 0, t.w, t.h, { kirp: k });
}

// ---------------------------------------------------------------- bileşimler (her zaman kodla)
/** Kartta n yıldız kurabiye yan yana (2: yan yana, 4: 2 × 2, 6: 3 × 2) */
function kurabiyeKarti(n: number): Tarif {
  return kare(768, async (t) => {
    const sutun = n === 2 ? 2 : n === 4 ? 2 : 3;
    const satir = Math.ceil(n / sutun);
    const k = Math.min((t.w * 0.86) / sutun, (t.h * 0.82) / satir) * 0.98;
    const x0 = (t.w - k * sutun) / 2;
    const y0 = (t.h - k * satir) / 2;
    for (let i = 0; i < n; i++) await t.resim('v3/kurabiye', x0 + (i % sutun) * k, y0 + Math.floor(i / sutun) * k, k, k, { don: (i % 2 ? 7 : -6) });
  });
}
/** Tepsi fotoğrafı: tezgâhın üstünde tepsi, iki kurabiye, dört un halkası (TEPSI_YERLERI'nin aynısı) */
export const FOTO_TEPSI = { w: 1024, h: 768, tepsi: { x: 0.06, y: 0.14, w: 0.88 } };
/** Tepsi fotoğrafında bir yerin ortası ve kurabiyenin eni (fotoğrafın oranı): [x, y, en] */
export function tepsiFotoYeri(i: number): [number, number, number] {
  const { w, h, tepsi: tp } = FOTO_TEPSI;
  const tw = w * tp.w;
  const th = tw * TEPSI_ORAN;
  const tx = w * tp.x;
  const ty = h * tp.y + (h * 0.72 - th) / 2;
  const [x, y] = TEPSI_YERLERI[i];
  return [(tx + tw * x) / w, (ty + th * y) / h, (tw * KURABIYE_EN) / w];
}
async function tepsiCiz(t: Tuval, halkalar: boolean) {
  const tp = FOTO_TEPSI.tepsi;
  const tw = t.w * tp.w;
  const th = tw * TEPSI_ORAN;
  const tx = t.w * tp.x;
  const ty = t.h * tp.y + (t.h * 0.72 - th) / 2;
  await t.resim('v3/tepsi', tx, ty, tw, th);
  const k = tw * KURABIYE_EN;
  for (const [i, [x, y]] of TEPSI_YERLERI.entries()) {
    if (KALAN.includes(i)) await t.resim('v3/kurabiye', tx + tw * x - k / 2, ty + th * y - k / 2, k, k, { don: i * 7 - 10 });
    else if (halkalar && BOS_YERLER.includes(i)) await t.resim('v3/un-halka', tx + tw * x - k * 0.55, ty + th * y - k * 0.42, k * 1.1, k * 0.84);
  }
}
export const TURETILEN: Record<string, Tarif> = {
  // yıldız kurabiye: Pasta'nın sarı kremalı kurabiyesi, üstünde beş sarı yıldız şeker
  kurabiye: kare(640, async (t) => {
    await t.resim('dosya:pasta/kurabiye-yildiz-krema-sari', 0, 0, t.w, t.h);
    await t.svg(svgSar(640, 640, `${YS_DEFS}${yildizSeker(250, 250, 30, -80)}${yildizSeker(380, 270, 26, -100)}${yildizSeker(320, 360, 30, -90)}${yildizSeker(220, 390, 24, -70)}${yildizSeker(420, 400, 22, -110)}`), 0, 0, t.w, t.h);
  }),
  'kart-kurabiye-2': kurabiyeKarti(2),
  'kart-kurabiye-4': kurabiyeKarti(4),
  'kart-kurabiye-6': kurabiyeKarti(6),
  'foto-tepsi': {
    w: FOTO_TEPSI.w,
    h: FOTO_TEPSI.h,
    async ciz(t) {
      // tezgâhın ahşabı (otobüsün içinden kırpım)
      await sahneKirp(t, 'v3/otobus-ic', [0.36, 0.76, 0.64, 0.98]);
      await tepsiCiz(t, true);
    },
  },
  // girişte çekilen yakın plan: kurabiyenin üstü (Halka 3 sorusu buna bakılarak sorulur)
  'foto-kurabiye': {
    w: 1024,
    h: 768,
    async ciz(t) {
      await sahneKirp(t, 'v3/otobus-ic', [0.4, 0.8, 0.6, 0.97]);
      await t.resim('v3/tepsi', -t.w * 0.2, t.h * 0.05, t.w * 1.4, t.w * 0.73);
      await t.resim('v3/kurabiye', t.w * 0.2, t.h * 0.02, t.w * 0.6, t.w * 0.6, { don: -6 });
    },
  },
  // Halka 3 "demek ki": ağacın gövdesi ve kovukları
  'demek-agac': kare(768, (t) => sahneKirp(t, 'v3/agac', [0.31, 0.25, 0.69, 0.93])),
  // Halka 5: kovuğun içi (raflar ve kurabiyeler), kurabiyelere yakın, kar tanesine yakın
  'foto-kiler': { w: 1024, h: 768, ciz: (t) => sahneKirp(t, 'v3/kiler-ic', [0.3, 0.3, 0.92, 0.9]) },
  'foto-kiler-kurabiye': kare(640, (t) => sahneKirp(t, 'v3/kiler-ic', [0.45, 0.5, 0.69, 0.79])),
  'foto-kar-tanesi': kare(640, (t) => sahneKirp(t, 'v3/kiler-ic', [0.34, 0.19, 0.5, 0.48])),
  // Fındık'ın tabelası (finalde pencerede): yüzü ve soru balonu (yazı yok)
  tabela: {
    w: 768,
    h: 640,
    async ciz(t) {
      await t.svg(svgSar(768, 640, `<rect x="30" y="40" width="708" height="560" rx="40" fill="#fff4dc" stroke="#5a3820" stroke-width="18"/><rect x="62" y="72" width="644" height="496" rx="26" fill="none" stroke="#f49ab8" stroke-width="12"/><path d="M440 110 C440 70 700 70 700 160 C700 240 560 250 520 240 L470 290 L486 230 C450 214 440 190 440 160 Z" fill="#fff" stroke="#5a3820" stroke-width="12" stroke-linejoin="round"/><path d="M548 140 C548 112 600 108 604 136 C606 156 578 160 576 182" stroke="#5a3820" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="576" cy="212" r="10" fill="#5a3820"/>`), 0, 0, t.w, t.h);
      // yüz: Fındık'ın başı (kırpım)
      await t.resim('v3/findik', t.w * 0.06, t.h * 0.16, t.w * 0.56, t.w * 0.56);
    },
  },
};
