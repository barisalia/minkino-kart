// Minik Doktor · bekleme odası ve klinik akışı (Doktor-K1; ekip/senaryo/DOKTOR-VAKALAR.md "Bekleme sırası").
// Oyun bekleme odasıyla açılır. Yedi hasta kendi derdiyle oturur ve boşta döner: Zıpzıp topallar, Mino yanağını tutar, Bulut terler,
// Mila boyalı kıkırdar, Pamuk hapşırır, Polly kabarık kanadıyla uğraşır, Lokum'un karnı guruldar. Bulut'un iki vakası var: ateşi
// geçince kulağında uğur böceğiyle yeniden sıraya girer. Sırada iki hasta ışıkla bekler; çocuk birini seçer, hasta
// kalkıp kapıdan içeri yürür ve vakası oynanır. İyileşen hasta mutlu çıkıp yerine oturur; çıkartması klinik panosuna uçar. Pano
// dolunca küçük bir kutlama olur. Biten vaka yeniden seçilebilir; çizimi gelmemiş vaka sırada görünmez.
// Çizimler Astra'dan (Paket Doktor-K1, assets/doktor/klinik/). Önce üç ekran seçeneği istendi (CLAUDE-ASTRA-MESAJLAR.md, 23 Kasım
// 02:59); yerleşim, seçilen ekrana göre burada ayarlanır. Saf veri ve hesap: DOM yok, birim testleri buradan sınar.
import { SAHNE, type Kutu, type Nokta } from '../vaka/veri';

const dizi = (ad: string, n: number, ilk = 0): string[] => Array.from({ length: n }, (_, i) => `${ad}-${i + ilk}`);

/** Bekleme odasındaki hastalar (her biri bir oturakta). */
export const HASTALAR = ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum'] as const;
export type HastaAdi = (typeof HASTALAR)[number];
/** Vakalar sırasıyla (sıra, açılış sırasıdır; aynı hasta art arda gelmez). Panoda her vakanın bir çıkartması var. */
export const VAKALAR = ['zipzip', 'mino', 'bulut', 'mila', 'pamuk', 'polly', 'lokum', 'lokum-kuzu', 'bulut-bocek', 'mino-cingirak'] as const;
export type VakaAdi = (typeof VAKALAR)[number];
export const VAKA_HASTASI: Readonly<Record<VakaAdi, HastaAdi>> = { zipzip: 'zipzip', mino: 'mino', bulut: 'bulut', mila: 'mila', pamuk: 'pamuk', polly: 'polly', lokum: 'lokum', 'lokum-kuzu': 'lokum', 'bulut-bocek': 'bulut', 'mino-cingirak': 'mino' };
/** Her vakanın oyunu: doktor/index.html?oyun=<oyun> */
export type VakaOyunu = 'vaka' | 'disler' | 'ates' | 'boya' | 'hapsu' | 'kanat' | 'karin' | 'kuzu' | 'bocek' | 'cingirak';
export const VAKASI: Readonly<Record<VakaAdi, VakaOyunu>> = { zipzip: 'vaka', mino: 'disler', bulut: 'ates', mila: 'boya', pamuk: 'hapsu', polly: 'kanat', lokum: 'karin', 'lokum-kuzu': 'kuzu', 'bulut-bocek': 'bocek', 'mino-cingirak': 'cingirak' };
export const AD: Readonly<Record<HastaAdi, string>> = { zipzip: 'Zıpzıp', mino: 'Mino', bulut: 'Bulut', mila: 'Mila', pamuk: 'Pamuk', polly: 'Polly', lokum: 'Lokum' };

export interface HastaCizimleri {
  /** boşta döngü: derdiyle oturuş (beş kare) */ bekle: readonly string[];
  /** dokunulunca ("ben mi?") */ sec: string;
  /** oturaktan kalkış (ters oynatınca oturuş) */ kalk: readonly string[];
  /** kapıya yürüyüş (sağa) */ yuru: readonly string[];
  /** iyileşmiş, mutlu dönüş (sola) */ cik: readonly string[];
  /** iyileşmiş, yerinde mutlu oturuş */ mutlu: readonly string[];
}
const hastaCizimleri = (h: HastaAdi): HastaCizimleri => ({
  bekle: dizi(`${h}-bekle`, 5), sec: `${h}-sec`, kalk: dizi(`${h}-kalk`, 2), yuru: dizi(`${h}-yuru`, 4), cik: dizi(`${h}-cik`, 4), mutlu: dizi(`${h}-mutlu`, 2),
});
/** İkinci dertler (Lokum Kuzu'yla, Bulut uğur böceğiyle, Mino çıngırağıyla döner): kendi boşta döngüsü, "ben mi?" yüzü ve
 *  yürüyüşü; kalkış, mutlu dönüş ve mutlu oturuş hastanın ilk kareleriyle aynı */
export const IKINCI_VAKALAR = ['lokum-kuzu', 'bulut-bocek', 'mino-cingirak'] as const;
type IkinciVaka = (typeof IKINCI_VAKALAR)[number];
const ikinciCizimler = Object.fromEntries(IKINCI_VAKALAR.map(v => [v, { bekle: dizi(`${v}-bekle`, 5), sec: `${v}-sec`, yuru: dizi(`${v}-yuru`, 4) }])) as unknown as Readonly<Record<IkinciVaka, { bekle: readonly string[]; sec: string; yuru: readonly string[] }>>;
const ikinciMi = (v: string): v is IkinciVaka => (IKINCI_VAKALAR as readonly string[]).includes(v);

/** Paketin 172 çizimi (assets/doktor/klinik/<ad>.webp). */
export const KLINIK = {
  /** bekleme odası: banklar, kapalı klinik kapısı, panonun altı boş yuvası */ fon: 'klinik-fon',
  kapiAcik: 'kapi-acik',
  kino: { goster: 'kino-kapi-goster', bekle: dizi('kino-kapi-bekle', 2), sevin: 'kino-kapi-sevin' },
  hasta: Object.fromEntries(HASTALAR.map(h => [h, hastaCizimleri(h)])) as Readonly<Record<HastaAdi, HastaCizimleri>>,
  ikinci: ikinciCizimler,
  /** panodaki yuvarlak çıkartmalar: her vakanın bir tane */
  cikartma: Object.fromEntries(VAKALAR.map(v => [v, `cikartma-${v}`])) as Readonly<Record<VakaAdi, string>>,
} as const;
/** vakanın bekleme odasındaki kareleri (Bulut'un ikinci vakasında böcekli kareler) */
export function vakaKareleri(v: VakaAdi): HastaCizimleri {
  const c = KLINIK.hasta[VAKA_HASTASI[v]];
  return ikinciMi(v) ? { ...c, ...KLINIK.ikinci[v] } : c;
}
export const KLINIK_DOSYALAR: readonly string[] = [
  KLINIK.fon, KLINIK.kapiAcik, KLINIK.kino.goster, ...KLINIK.kino.bekle, KLINIK.kino.sevin,
  ...HASTALAR.flatMap(h => { const c = KLINIK.hasta[h]; return [...c.bekle, c.sec, ...c.kalk, ...c.yuru, ...c.cik, ...c.mutlu]; }),
  ...IKINCI_VAKALAR.flatMap(v => { const c = KLINIK.ikinci[v]; return [...c.bekle, c.sec, ...c.yuru]; }),
  ...VAKALAR.map(v => KLINIK.cikartma[v]),
];

// ——————————————————————————— yerleşim (sahne pikseli, 2048 × 1152): seçilen B "oyun halısı" (23 Kasım 05:12); sayılar Astra'nın
// B fonundan ölçtükleri (kanal, 05:24 sonrası): kapı arkada ortada, pano kapının üstünde 2 × 5, yedi minder halının çevresinde
/** hasta kareleri aynı tuvalde; ayaklar alt ortada */
export const HASTA_TUVAL = [420, 460] as const;
export const CIKARTMA_BOYU = 84;
export const KINO_TUVAL = [360, 500] as const;
export interface Koltuk { /** ayakların yeri (tuvalin alt ortası) */ ayak: Nokta; olcek: number; }
/** halının çevresindeki yedi minder (minderle temas noktası); arkadakiler biraz küçük (derinlik) */
export const KOLTUKLAR: Readonly<Record<HastaAdi, Koltuk>> = {
  mino: { ayak: { x: 560, y: 699 }, olcek: 0.82 }, pamuk: { ayak: { x: 1490, y: 700 }, olcek: 0.82 },
  zipzip: { ayak: { x: 380, y: 859 }, olcek: 0.9 }, polly: { ayak: { x: 1660, y: 859 }, olcek: 0.9 },
  bulut: { ayak: { x: 560, y: 1060 }, olcek: 1 }, mila: { ayak: { x: 1490, y: 1060 }, olcek: 1 }, lokum: { ayak: { x: 1030, y: 1090 }, olcek: 1 },
};
/** klinik kapısı (açık kapı katmanı) ve eşiği: hasta burada kapıdan geçer */
export const KAPI: Kutu = { sol: 760, ust: 150, g: 530, y: 510 };
export const ESIK: Koltuk = { ayak: { x: 1140, y: 660 }, olcek: 0.72 };
/** B'nin kadrajı (yönetici, 23 Kasım 07:30): karakterler ekranın %35–40'ı. Minder ölçeklerinin üstüne bu büyütme uygulanır. */
export const BUYUME = 1.14;
/** Kino B'deki gibi kapının sol yarısının önünde, iri (ayakları eşik hizasında); hasta onun önünden kapıya geçer */
export const KINO_OLCEK = 0.86;
export const KINO_KUTU: Kutu = { sol: 745, ust: 660 - Math.round(KINO_TUVAL[1] * KINO_OLCEK), g: Math.round(KINO_TUVAL[0] * KINO_OLCEK), y: Math.round(KINO_TUVAL[1] * KINO_OLCEK) };
/** kamera: ekran yükseklikten dolar; yalnız bu genişlik (ortada) mutlaka görünür, kenarlar kırpılabilir (iPad 4:3'te oda iri) */
/** kapıdan geçişte kameranın kapıya dalışı */
export const KAPIDAN_DALIS = 1.9;
export const GORUNUR_GENISLIK = 1720;
export function odaOlcegi(en: number, boy: number): { s: number; sol: number; ust: number } {
  const s = Math.max(Math.min(en / SAHNE.g, boy / SAHNE.y), Math.min(boy / SAHNE.y, en / GORUNUR_GENISLIK));
  return { s, sol: (en - SAHNE.g * s) / 2, ust: (boy - SAHNE.y * s) / 2 };
}
/** kapının üstündeki panonun on yuvası (çıkartmaların ortası), vaka sırasıyla: iki sıra, beşer */
export const PANO: Kutu = { sol: 745, ust: 0, g: 560, y: 192 };
const YUVA_X = [805, 910, 1025, 1140, 1245] as const;
export const PANO_YUVALARI: Readonly<Record<VakaAdi, Nokta>> = Object.fromEntries(VAKALAR.map((v, i) => [v, { x: YUVA_X[i % 5], y: i < 5 ? 50 : 140 }])) as Record<VakaAdi, Nokta>;
/** hastanın ekrandaki kutusu (dokunma ve çizim) */
export function hastaKutusu(k: Koltuk): Kutu {
  const g = HASTA_TUVAL[0] * k.olcek * BUYUME, y = HASTA_TUVAL[1] * k.olcek * BUYUME;
  return { sol: k.ayak.x - g / 2, ust: k.ayak.y - y, g, y };
}
/** hastanın dokunulacak gövdesi: tuvalin boş kenarları düşülür; küçük ekranda da en az 64 pt kalır */
export function dokunmaKutusu(k: Koltuk): Kutu {
  const t = hastaKutusu(k);
  // alt kısım (minder) dışarıda: önde oturanın başı arkadakinin minderine biner
  return { sol: t.sol + t.g * 0.14, ust: t.ust + t.y * 0.06, g: t.g * 0.72, y: t.y * 0.66 };
}

// ——————————————————————————— kayıt
export const KAYIT_ANAHTARI = 'minkino-doktor-vaka-v1';
export interface Kayit { s: 1; /** iyileşen vakalar (iyileşme sırasıyla) */ iyilesen: VakaAdi[]; }
const vakaMi = (x: unknown): x is VakaAdi => typeof x === 'string' && (VAKALAR as readonly string[]).includes(x);
/** bozuk ya da eski kayıt sessizce boş sayılır; tekrar eden ad bir kez */
export function kayitOku(metin: string | null): Kayit {
  try {
    const v = JSON.parse(metin ?? '') as { iyilesen?: unknown };
    const liste = Array.isArray(v?.iyilesen) ? v.iyilesen.filter(vakaMi) : [];
    return { s: 1, iyilesen: [...new Set(liste)] };
  } catch { return { s: 1, iyilesen: [] }; }
}
export const kayitYaz = (k: Kayit): string => JSON.stringify({ s: 1, iyilesen: k.iyilesen });
export const iyilestir = (k: Kayit, v: VakaAdi): Kayit => (k.iyilesen.includes(v) ? k : { s: 1, iyilesen: [...k.iyilesen, v] });

// ——————————————————————————— sıra
export const SIRA_BOYU = 2;
/** hastanın şimdiki vakası: çizimi gelmiş, iyileşmemiş ilk vakası; hepsi iyileştiyse yeniden oynanacak son vakası; hiç yoksa null */
export function hastaninVakasi(h: HastaAdi, acik: readonly VakaAdi[], iyilesen: readonly VakaAdi[]): VakaAdi | null {
  const onun = VAKALAR.filter(v => VAKA_HASTASI[v] === h && acik.includes(v));
  return onun.find(v => !iyilesen.includes(v)) ?? onun[onun.length - 1] ?? null;
}
/** odada gösterilen vaka: oynanabilir şimdiki vakası; yoksa (çizimi gelmemiş) ilk vakası, derdiyle oturur */
export const odadakiVaka = (h: HastaAdi, acik: readonly VakaAdi[], iyilesen: readonly VakaAdi[]): VakaAdi =>
  hastaninVakasi(h, acik, iyilesen) ?? VAKALAR.find(v => VAKA_HASTASI[v] === h)!;
/** sırada bekleyenler: iyileşmemiş vakalardan ilk ikisi; bir hasta sırada bir kez (önce ilk vakası) */
export function sira(acik: readonly VakaAdi[], iyilesen: readonly VakaAdi[]): VakaAdi[] {
  const s: VakaAdi[] = [];
  for (const v of VAKALAR) {
    if (s.length >= SIRA_BOYU) break;
    if (!acik.includes(v) || iyilesen.includes(v)) continue;
    if (hastaninVakasi(VAKA_HASTASI[v], acik, iyilesen) !== v) continue;
    s.push(v);
  }
  return s;
}
export type HastaDurumu = 'sirada' | 'bekliyor' | 'iyi';
/** vakası henüz oynanamayan hasta da odada derdiyle oturur ('bekliyor': dokununca derdiyle tepki verir, Kino "biraz sabır" der) */
export function hastaDurumu(h: HastaAdi, acik: readonly VakaAdi[], iyilesen: readonly VakaAdi[]): HastaDurumu {
  const v = hastaninVakasi(h, acik, iyilesen);
  if (!v) return 'bekliyor';
  if (iyilesen.includes(v)) return 'iyi';
  return sira(acik, iyilesen).includes(v) ? 'sirada' : 'bekliyor';
}
/** dokununca içeri girer mi: sıradakiler ve iyileşmiş olanlar (biten vaka yeniden oynanır) */
export const secilebilir = (d: HastaDurumu): boolean => d === 'sirada' || d === 'iyi';
/** pano doldu: on yuvanın hepsi (bütün vakalar iyileşti). Çizimi gelmemiş vaka varken pano dolmaz: tek çıkartmayla kutlama olmasın. */
export const panoDolu = (acik: readonly VakaAdi[], iyilesen: readonly VakaAdi[]): boolean => acik.length === VAKALAR.length && VAKALAR.every(v => iyilesen.includes(v));

// ——————————————————————————— hareket
/** her hastanın boşta döngüsü (beş karenin sırası) ve kare süresi; derdin "vurgu" karesi (Pamuk'un hapşırığı, Bulut'un damlası…) */
export const DONGU: Readonly<Record<HastaAdi, { kareler: readonly number[]; ms: number; vurgu: number }>> = {
  zipzip: { kareler: [0, 1, 2, 1, 0, 3, 4, 3], ms: 210, vurgu: 4 },
  mino: { kareler: [0, 1, 2, 3, 2, 1, 0, 4], ms: 230, vurgu: 4 },
  bulut: { kareler: [0, 1, 2, 3, 4, 3, 2, 1], ms: 190, vurgu: 4 },
  mila: { kareler: [0, 1, 0, 2, 3, 4, 3, 2], ms: 180, vurgu: 4 },
  pamuk: { kareler: [0, 0, 1, 1, 2, 3, 4, 0], ms: 220, vurgu: 4 },
  polly: { kareler: [0, 1, 2, 1, 3, 4, 3, 0], ms: 200, vurgu: 4 },
  lokum: { kareler: [0, 1, 2, 3, 2, 1, 4, 0], ms: 210, vurgu: 4 },
};
/** boşta döngünün o anki karesi; hastalar aynı anda kıpırdamasın diye her birinin döngüsü kaydırılır */
export function bekleKaresi(h: HastaAdi, an: number): number {
  const d = DONGU[h], kayma = HASTALAR.indexOf(h) * 370;
  return d.kareler[Math.floor((an + kayma) / d.ms) % d.kareler.length];
}
export const MUTLU_MS = 340;
export const mutluKaresi = (h: HastaAdi, an: number): number => Math.floor((an + HASTALAR.indexOf(h) * 170) / MUTLU_MS) % 2;
export const YURU_MS = 130;
export const yuruKaresi = (t: number): number => Math.floor(Math.max(0, t) / YURU_MS) % 4;
/** yürüyüş hızı (sahne pikseli / sn) ve süresi */
export const YURU_HIZI = 560;
export const yuruSuresi = (a: Nokta, b: Nokta): number => Math.max(700, Math.round((Math.hypot(a.x - b.x, a.y - b.y) / YURU_HIZI) * 1000));
/** yürürken ayakların yeri ve boy (0…1 arası ilerleme; yumuşak başlar, yumuşak durur) */
export function yuruNoktasi(a: Koltuk, b: Koltuk, t: number): Koltuk {
  const u = Math.min(1, Math.max(0, t)), e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
  return { ayak: { x: a.ayak.x + (b.ayak.x - a.ayak.x) * e, y: a.ayak.y + (b.ayak.y - a.ayak.y) * e }, olcek: a.olcek + (b.olcek - a.olcek) * e };
}
/** yürürken her iki karede bir adım sesi */
export const adimAtildi = (once: number, simdi: number): boolean => Math.floor(simdi / (YURU_MS * 2)) > Math.floor(once / (YURU_MS * 2));

// ——————————————————————————— süreler
export const SURE = {
  /** vaka bitince, kapanışın son sevinci izlensin diye bekleme odasına dönmeden önce */ donus: 2600,
  kalk: 170, kapi: 320, perde: 320, cikartma: 720, kutlama: 3200,
  /** bekleme odasında kendiliğinden bir hastanın derdi (hapşırık, damla…) */ kendiliginden: [5200, 8200] as const,
  /** Kino'nun "biraz sabır" sözü en fazla bu sıklıkla */ sabir: 4000,
} as const;

// ——————————————————————————— ses
/** Kino'nun sözleri (Kino'nun klonu; assets/doktor/klinik/ses/) */
export const SOZLER = {
  'kl-hosgeldin': 'Kliniğe hoş geldin doktor! Sıradaki hasta kim?',
  'kl-gel-zipzip': 'Gel Zıpzıp, sıra sende!',
  'kl-gel-mino': 'Gel Mino, sıra sende!',
  'kl-gel-bulut': 'Gel Bulut, sıra sende!',
  'kl-gel-mila': 'Gel Mila, sıra sende!',
  'kl-gel-pamuk': 'Gel Pamuk, sıra sende!',
  'kl-gel-polly': 'Gel Polly, sıra sende!',
  'kl-gel-lokum': 'Gel Lokum, sıra sende!',
  'kl-sabir': 'Biraz sabır, birazdan senin sıran!',
  'kl-yine': 'Yine mi geldin? Gel bakalım!',
  'kl-iyilesti': 'Yaşasın, iyileşti! Çıkartması panoya!',
  'kl-doldu': 'Pano doldu! Bütün hastalar iyileşti. Sen harika bir doktorsun!',
} as const;
export type SozAdi = keyof typeof SOZLER;
export const gelSozu = (h: HastaAdi): SozAdi => `kl-gel-${h}` as SozAdi;
/** bekleme odasının efektleri (ElevenLabs, müzik yok; assets/doktor/klinik/ses/) */
export const EFEKTLER = ['kl-zil', 'kl-kapi', 'kl-kapan', 'kl-ayak', 'kl-otur', 'kl-pano', 'kl-patlangic', 'kl-mino'] as const;
/** hastanın derdinin efekti (vakaların kendi efektlerinden; Mino'nunki yeni) */
export const DERT_SESI: Readonly<Record<VakaAdi, string>> = { zipzip: 'z-ay', mino: 'kl-mino', bulut: 'a-damla', mila: 'e-hihi', pamuk: 'h-hapsu', polly: 'k-kabar', lokum: 'g-gur', 'lokum-kuzu': 'kz-mee', 'bulut-bocek': 'u-tikir', 'mino-cingirak': 'c-tingir' };

// ——————————————————————————— geçici çizimlerin tuvali (taslak-genel.mjs)
const boyut = (adlar: readonly string[], b: readonly [number, number]) => Object.fromEntries(adlar.map(a => [a, b]));
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  [KLINIK.fon]: [SAHNE.g, SAHNE.y], [KLINIK.kapiAcik]: [KAPI.g, KAPI.y],
  ...boyut([KLINIK.kino.goster, ...KLINIK.kino.bekle, KLINIK.kino.sevin], KINO_TUVAL),
  ...Object.fromEntries(HASTALAR.flatMap(h => { const c = KLINIK.hasta[h]; return [...c.bekle, c.sec, ...c.kalk, ...c.yuru, ...c.cik, ...c.mutlu].map(a => [a, HASTA_TUVAL]); })),
  ...boyut(IKINCI_VAKALAR.flatMap(v => { const c = KLINIK.ikinci[v]; return [...c.bekle, c.sec, ...c.yuru]; }), HASTA_TUVAL),
  ...boyut(VAKALAR.map(v => KLINIK.cikartma[v]), [300, 300]),
};
export const OPAK: readonly string[] = [KLINIK.fon];
