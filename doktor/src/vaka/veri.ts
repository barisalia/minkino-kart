// Minik Doktor · "Zıpzıp'ın Dikenli Patisi" (tek hasta vakası). Barış'ın seçtiği yön (22 Kasım 2026): yukarıdan klinik
// masası (C) ve büyüteçle mikrop avı (B) temel, acil çanta (A) açılış anı. Çizimler Astra'dan: Paket Doktor-Y1
// (CLAUDE-ASTRA-MESAJLAR.md, 22 Kasım 15:01); adlar ve ölçüler o brief'le birebirdir, sahne tuvali 2048 × 1152.
// Saf veri ve hesap: DOM yok, birim testleri buradan sınar.

export const SAHNE = { g: 2048, y: 1152 } as const;
export interface Nokta { x: number; y: number; }
export interface Kutu { sol: number; ust: number; g: number; y: number; }

/** Paketin 29 çizimi (assets/doktor/vaka/<ad>.webp). */
export const VAKA = {
  hubFon: 'hub-fon', yakinFon: 'yakin-fon',
  uzgun: ['zipzip-uzgun-0', 'zipzip-uzgun-1'], uzgunKirp: 'zipzip-uzgun-kirp',
  sevinc: ['zipzip-sevinc-0', 'zipzip-sevinc-1'],
  cantaKapali: 'canta-kapali', cantaAcik: 'canta-acik',
  buyutec: 'buyutec', sprey: 'sprey', cimbizAcik: 'cimbiz-acik', cimbizKapali: 'cimbiz-kapali', sargiRulo: 'sargi-rulo',
  kolCamurlu: 'kol-camurlu', kolTemiz: 'kol-temiz', sargiSarili: 'sargi-sarili',
  mikroplar: ['mikrop-0', 'mikrop-1', 'mikrop-2'], kopuk: 'kopuk', pof: ['pof-0', 'pof-1'], diken: 'diken', yildiz: 'yildiz',
  bantlar: ['bant-yildiz', 'bant-kalp', 'bant-pati'], serit: 'serit',
} as const;
export const VAKA_DOSYALAR: readonly string[] = Object.values(VAKA).flat();
/**
 * Yöneticinin 15:28 eki (Astra dosyasında 15:29): dördüncü bant ve doktor yardımcısı Kino. Bunlar gelmeden de oyun
 * açılır; gelince kendiliğinden bağlanır (Kino'nun dört çizimi birlikte gelirse görünür).
 */
export const SECMELI = {
  bant: 'bant-gokkusagi',
  kino: { goster: 'kino-goster', sasir: 'kino-sasir', alkis: ['kino-alkis-0', 'kino-alkis-1'] },
  /** yakın planda sol üstten eğilen Zıpzıp'ın yüzü: dört ifade, aynı baş (yöneticinin 18:10 isteği) */
  yuz: { endise: 'zipzip-yakin-endise', ayy: 'zipzip-yakin-ayy', kikir: 'zipzip-yakin-kikir', rahat: 'zipzip-yakin-rahat' },
} as const;
export const SECMELI_DOSYALAR: readonly string[] = [SECMELI.bant, SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis, ...Object.values(SECMELI.yuz)];

/** Çizimlerin tuval boyutu (px); sahnede aynı ölçekte durur (1 çizim pikseli = 1 sahne pikseli), aksi yazılmadıkça. */
export const TUVAL: Readonly<Record<string, readonly [number, number]>> = {
  'hub-fon': [2048, 1152], 'yakin-fon': [2048, 1152], 'kol-camurlu': [2048, 1152], 'kol-temiz': [2048, 1152], 'sargi-sarili': [2048, 1152],
  'zipzip-uzgun-0': [1000, 940], 'zipzip-uzgun-1': [1000, 940], 'zipzip-uzgun-kirp': [1000, 940], 'zipzip-sevinc-0': [1000, 940], 'zipzip-sevinc-1': [1000, 940],
  'canta-kapali': [640, 860], 'canta-acik': [640, 860],
  buyutec: [600, 600], sprey: [600, 600], 'cimbiz-acik': [600, 600], 'cimbiz-kapali': [600, 600], 'sargi-rulo': [600, 600],
  'mikrop-0': [300, 300], 'mikrop-1': [300, 300], 'mikrop-2': [300, 300], kopuk: [300, 300], 'pof-0': [300, 300], 'pof-1': [300, 300],
  'zipzip-yakin-endise': [640, 460], 'zipzip-yakin-ayy': [640, 460], 'zipzip-yakin-kikir': [640, 460], 'zipzip-yakin-rahat': [640, 460],
  'bant-gokkusagi': [360, 150], 'kino-goster': [640, 620], 'kino-sasir': [640, 620], 'kino-alkis-0': [640, 620], 'kino-alkis-1': [640, 620],
  diken: [200, 80], yildiz: [300, 300], 'bant-yildiz': [360, 150], 'bant-kalp': [360, 150], 'bant-pati': [360, 150], serit: [1500, 190],
};
export const OPAK: readonly string[] = [VAKA.hubFon, VAKA.yakinFon];

// ——— masa (hub) yerleşimi
export const HUB = {
  zipzip: { sol: 500, ust: 1, g: 1000, y: 940 } as Kutu,
  /** Zıpzıp'ın tuvalinde uzanan kolun patisi ve sargının ortası; göğüs (yıldızın yeri) */
  pati: { x: 500 + 829, y: 1 + 454 } as Nokta,
  sargi: { x: 500 + 750, y: 1 + 455 } as Nokta,
  gogus: { x: 500 + 567, y: 1 + 480 } as Nokta,
  canta: { sol: 30, ust: 80, g: 640, y: 860 } as Kutu,
  /** açık çantadaki dört yuvanın merkezi (çanta tuvalinde) ve yuva boyu */
  yuvalar: [[202, 472], [437, 472], [202, 673], [437, 673]] as readonly (readonly [number, number])[],
  yuvaBoyu: [216, 200] as readonly [number, number],
  serit: { sol: 20, ust: 950, g: 1500, y: 190 } as Kutu,
  /** Kino sağ alt köşede, belinden yukarısı; beli ekranın alt kenarında */
  kino: { sol: 1408, ust: 566, g: 640, y: 620 } as Kutu,
  /** yakın plana geçerken kameranın yaklaştığı nokta ve büyütme */
  yaklasma: { x: 1260, y: 456, olcek: 2.3 },
} as const;
/** Şeritteki dört yuvanın merkezi (şerit tuvalinde) ve yuva boyu. */
export const SERIT_YUVALARI: readonly (readonly [number, number])[] = [[219, 95], [573, 95], [926, 95], [1281, 95]];
export const SERIT_YUVA_BOYU: readonly [number, number] = [328, 130];
/** Yakın plandaki şeritte aletin boyu (600 × 600 tuvalin ekrandaki kenarı): aletler yuvadan taşar, tutması kolay. */
export const DOK_ALET_BOYU = 200;

// ——— yakın plan yerleşimi
export const YAKIN = {
  /** alet şeridi solda durur; sağ alt köşe Kino'nun */
  serit: { sol: 20, ust: 946, g: 1500, y: 190 } as Kutu,
  /** Kino sağ alt köşeden bakar (baş ve yaka görünür): masadaki çizimler, 0,9 ölçek; tepsinin (alt kenarı y 824) altında, şeridin sağında */
  kino: { sol: 1491, ust: 816, g: 576, y: 558 } as Kutu,
  /** yakın fondaki böbrek tepsinin içi (bırakma alanı) */
  tepsi: { sol: 1580, ust: 340, g: 250, y: 450 } as Kutu,
  /** dikenlerin tepside dinleneceği yerler */
  tepsiYerleri: [{ x: 1665, y: 425, aci: 12 }, { x: 1708, y: 545, aci: 40 }, { x: 1655, y: 715, aci: -22 }] as readonly (Nokta & { /** tepside yatış açısı (derece) */ aci: number })[],
  /** ön kolun dokunulabilir alanı (mikrop ve sargı burada) */
  kol: { sol: 0, ust: 388, g: 1428, y: 304 } as Kutu,
  /** sargının kapladığı aralık ve ortası */
  /** bilek tarafında: masadaki sevinç pozunda sargı da bilekte */
  sargi: { sol: 560, sag: 1006, x: 783, y: 550 },
  /** Zıpzıp'ın yüzü sol üst köşeden eğilir (omuz solda); x 560'tan sağı dikenlerin uçlarına kalır */
  yuz: { sol: 0, ust: 0, g: 640, y: 460 } as Kutu,
} as const;

export interface Mikrop { ad: string; x: number; y: number; boy: number; }
/** Mikroplar çamur lekelerinin üstünde saklanır (leke merkezleri `kol-camurlu` çiziminde ölçüldü). */
export const MIKROPLAR: readonly Mikrop[] = [
  { ad: VAKA.mikroplar[0], x: 592, y: 514, boy: 170 },
  { ad: VAKA.mikroplar[1], x: 911, y: 583, boy: 170 },
  { ad: VAKA.mikroplar[2], x: 240, y: 584, boy: 170 },
];
export interface Diken { /** batan ucun yeri */ x: number; y: number; /** dikenin dışarı baktığı yön (derece; 0 sağ, −90 yukarı) */ aci: number; }
/** Üçü de sargının kaplayacağı aralıkta (bilek tarafı), uçları kolun üstünde; yastığın kenarının (x 640) sağında ve fondaki yıldızın (x 773…809, y 350…400) dışında. */
export const DIKENLER: readonly Diken[] = [
  { x: 950, y: 495, aci: -66 },
  { x: 700, y: 495, aci: -100 },
  { x: 850, y: 455, aci: -88 },
];
export const DIKEN_BOYU = 150;

/** Yaş basamakları: küçükte daha az iş, daha geniş hedef. */
export type Yas = '2-3' | '4' | '5+';
export interface Zorluk { mikrop: number; diken: number; sargiTuru: number; mercekYaricapi: number; cimbizKilidi: number; /** bir mikrobu köpükle ovmak için gereken parmak yolu (sahne pikseli) */ ovma: number; }
export const ZORLUK: Record<Yas, Zorluk> = {
  '2-3': { mikrop: 2, diken: 2, sargiTuru: 2, mercekYaricapi: 150, cimbizKilidi: 95, ovma: 500 },
  '4': { mikrop: 3, diken: 3, sargiTuru: 3, mercekYaricapi: 125, cimbizKilidi: 75, ovma: 750 },
  '5+': { mikrop: 3, diken: 3, sargiTuru: 3, mercekYaricapi: 110, cimbizKilidi: 60, ovma: 900 },
};

// ——— aletler: çizimde (600 × 600) tutulan yer ve iş yapan uç, 0–1 oran
export type AletAdi = 'buyutec' | 'sprey' | 'cimbiz' | 'sargi';
export interface Alet { ad: AletAdi; cizim: string; /** elde uzun kenar (sahne pikseli) */ boy: number; tut: readonly [number, number]; uc: readonly [number, number]; }
export const ALETLER: Readonly<Record<AletAdi, Alet>> = {
  buyutec: { ad: 'buyutec', cizim: VAKA.buyutec, boy: 620, tut: [0.5, 0.86], uc: [0.5, 230 / 600] },
  sprey: { ad: 'sprey', cizim: VAKA.sprey, boy: 400, tut: [0.56, 0.74], uc: [150 / 600, 110 / 600] },
  cimbiz: { ad: 'cimbiz', cizim: VAKA.cimbizAcik, boy: 440, tut: [0.5, 0.78], uc: [0.5, 40 / 600] },
  sargi: { ad: 'sargi', cizim: VAKA.sargiRulo, boy: 300, tut: [0.5, 0.5], uc: [0.5, 0.5] },
};
export const ALET_SIRASI: readonly AletAdi[] = ['buyutec', 'sprey', 'cimbiz', 'sargi'];
/** Büyütecin camı: bağlanmış çizimde (600 × 600) çerçevenin dış çapı 303, cam 261; elde tutulan boya göre sahne pikseli. */
export const mercekCapi = (boy: number) => (261 / 600) * boy;
export const MERCEK_BUYUTME = 1.7;

// ——— akış
/** `gelis`, `lavabo`, `gogus`, `pamuk`, `defter`: Paket Doktor-A1 ile gelen aşamalar; çizimleri tam gelmeyen atlanır (a1.ts). */
export type Asama = 'gelis' | 'giris' | 'canta' | 'lavabo' | 'gogus' | 'buyutec' | 'sprey' | 'cimbiz' | 'pamuk' | 'sargi' | 'bant' | 'defter' | 'kutlama' | 'son';
export const ASAMALAR: readonly Asama[] = ['gelis', 'giris', 'canta', 'lavabo', 'gogus', 'buyutec', 'sprey', 'cimbiz', 'pamuk', 'sargi', 'bant', 'defter', 'kutlama', 'son'];
export const sonrakiAsama = (a: Asama): Asama => ASAMALAR[Math.min(ASAMALAR.length - 1, ASAMALAR.indexOf(a) + 1)];
/** Aşamanın aleti (yakın plandaki dört aşama). */
export const asamaAleti = (a: Asama): AletAdi | null => (a === 'buyutec' || a === 'sprey' || a === 'cimbiz' || a === 'sargi' ? a : null);

/** Zıpzıp'ın sözleri (Zıpzıp'ın sesi; assets/doktor/vaka/ses/<ad>.mp3). Emir yok: duygu ve tepki. */
export const SOZLER = {
  'z-ay': 'Ay! Çalıya düştüm! Patime diken battı!',
  'z-canta': 'Aa! Doktor çantası!',
  'z-mikrop': 'Aa! Minik mikroplar saklanmış!',
  'z-gidik': 'Hi hi! Köpük çok gıdıklıyor!',
  'z-oh-0': 'Oh!',
  'z-oh-1': 'Hop!',
  'z-acimadi': 'Hiç acımadı!',
  'z-yumusak': 'Mmm, yumuşacık!',
  'z-tesekkur': 'Yaşasın! Patim iyileşti!',
  'z-iyilesti': 'Teşekkürler doktor!',
  'z-bak': 'Bak, patim! Çamur içinde!',
  'z-ayy-0': 'Ay!',
  'z-ayy-1': 'Uy!',
  'z-kikir': 'Hi hi hi!',
} as const;
export type SozAdi = keyof typeof SOZLER;
/** Kısa efektler (assets/doktor/vaka/ses/). */
export const EFEKTLER = ['e-cit', 'e-tik', 'e-vuu', 'e-hihi', 'e-fis', 'e-pof', 'e-kilit', 'e-pit', 'e-tingir', 'e-his', 'e-pat', 'e-cin'] as const;
export type EfektAdi = (typeof EFEKTLER)[number];

// ——— mekaniklerin saf hesabı

/** Sahne ekrana sığar (taşmaz); kalan kenarlar zeminin rengiyle dolar. Ölçek ve sahnenin ekrandaki sol üst köşesi. */
export function sahneOlcegi(en: number, boy: number): { s: number; sol: number; ust: number } {
  const s = Math.min(en / SAHNE.g, boy / SAHNE.y);
  return { s, sol: (en - SAHNE.g * s) / 2, ust: (boy - SAHNE.y * s) / 2 };
}

/** Mikrop avı: merceğin ortası mikroba yeterince yakınsa süre birikir; dolunca mikrop bulunmuş olur. */
export const BULMA_MS = 260;
export function bulmaAdimi(birikim: number, uzaklik: number, yaricap: number, dt: number): number {
  return uzaklik <= yaricap ? Math.min(BULMA_MS, birikim + dt) : Math.max(0, birikim - dt * 2);
}

/**
 * Mikrop, mercek yaklaşınca öbür yana kaçmaya çalışır: görüntüsü yerinden en çok KACIS_EN kadar kayar (kolun boyunca
 * daha çok, enine daha az). Bulma hesabı mikrobun asıl yerine göredir; kaçış yalnız görüntüdür, işi zorlaştırmaz.
 * `onceki`: o ana kadarki kayma (mercek tam üstündeyken yön ondan alınır).
 */
export const KACIS_EN = 56;
export const KACIS_MENZILI = 2.3;
export function kacisHedefi(m: Nokta, mercek: Nokta | null, yaricap: number, onceki: Nokta = { x: 0, y: 0 }): Nokta {
  if (!mercek) return { x: 0, y: 0 };
  const dx = m.x - mercek.x, dy = m.y - mercek.y, u = Math.hypot(dx, dy), menzil = yaricap * KACIS_MENZILI;
  if (u >= menzil) return { x: 0, y: 0 };
  const guc = KACIS_EN * Math.min(1, (1 - u / menzil) * 1.6);
  let yx = dx, yy = dy, b = u;
  if (u < 12) { b = Math.hypot(onceki.x, onceki.y); yx = b ? onceki.x : 1; yy = b ? onceki.y : 0; b = b || 1; }
  return { x: (yx / b) * guc, y: (yy / b) * guc * 0.45 };
}

/** Köpük: sprey mikroba tutuldukça mikrop köpüğe gömülür; dolunca "pof". */
export const KOPUK_MS = 850;
export const SPREY_MENZILI = 190;
export const kopukAdimi = (birikim: number, uzaklik: number, dt: number): number => (uzaklik <= SPREY_MENZILI ? Math.min(KOPUK_MS, birikim + dt) : birikim);

// ——— gerçek his (Barış, 22 Kasım gecesi): alet götürülüp bırakılmaz; parmağın yolu sayılır, iz bırakır

/**
 * Köpükle ovma: sprey mikrobun yakınında GEZDİRİLDİKÇE (parmağın yolu) mikrop köpüğe gömülür; yol dolunca "pof".
 * Yerinde tutmak da azar azar ilerletir (küçük çocuk takılmaz), ama ovmak dört beş kat hızlıdır. Bir karede sayılan yol
 * sınırlıdır: parmağın bir sıçrayışı işi bitirmez.
 */
export const OVMA_BEKLEME = 0.2;
export const OVMA_KARE_SINIRI = 60;
export const ovmaAdimi = (birikim: number, uzaklik: number, yol: number, dt: number, hedef: number): number =>
  (uzaklik <= SPREY_MENZILI ? Math.min(hedef, birikim + Math.min(OVMA_KARE_SINIRI, Math.max(0, yol)) + dt * OVMA_BEKLEME) : birikim);
/** Köpük, parmağın geçtiği yerde birikir: bu kadar yolda bir öbek (sahne pikseli). */
export const KOPUK_ARALIGI = 46;

/** Köpük ızgarası: sahne KOPUK_HUCRE'lik hücrelere bölünür; her hücrede oradaki köpük miktarı (öbek sayısı gibi) tutulur. */
export const KOPUK_HUCRE = 64;
export const KOPUK_SUTUN = Math.ceil(SAHNE.g / KOPUK_HUCRE), KOPUK_SATIR = Math.ceil(SAHNE.y / KOPUK_HUCRE);
/** bir hücreye en çok bu kadar öbek basılır (üst üste yığılıp tuvali boşuna doldurmasın) */
export const KOPUK_DOLU = 3;
export const kopukIzgarasi = (): Float32Array => new Float32Array(KOPUK_SUTUN * KOPUK_SATIR);
const hucre = (p: Nokta): number => { const x = Math.floor(p.x / KOPUK_HUCRE), y = Math.floor(p.y / KOPUK_HUCRE); return x < 0 || y < 0 || x >= KOPUK_SUTUN || y >= KOPUK_SATIR ? -1 : y * KOPUK_SUTUN + x; };
const hucreMerkezi = (i: number): Nokta => ({ x: ((i % KOPUK_SUTUN) + 0.5) * KOPUK_HUCRE, y: (Math.floor(i / KOPUK_SUTUN) + 0.5) * KOPUK_HUCRE });
/** p'nin hücresine köpük ekler; hücrenin yeni miktarını verir (sahne dışıysa 0). */
export function izgaraEkle(izgara: Float32Array, p: Nokta, miktar = 1): number { const i = hucre(p); if (i < 0) return 0; izgara[i] += miktar; return izgara[i]; }
/** p çevresindeki (merkezi yarıçapın içinde kalan) hücrelerin toplam miktarı; yarıçap hücreden küçükse p'nin kendi hücresi. */
export function izgaraMiktar(izgara: Float32Array, p: Nokta, yaricap: number): number {
  if (yaricap < KOPUK_HUCRE / 2) { const i = hucre(p); return i < 0 ? 0 : izgara[i]; }
  let t = 0;
  for (let i = 0; i < izgara.length; i++) if (izgara[i] > 0) { const m = hucreMerkezi(i); if (Math.hypot(m.x - p.x, m.y - p.y) <= yaricap) t += izgara[i]; }
  return t;
}
/** p çevresindeki hücrelerin köpüğünü azaltır (guc 1: tamamen siler). */
export function izgaraSil(izgara: Float32Array, p: Nokta, yaricap: number, guc = 1): void {
  const k = Math.max(0, 1 - guc);
  for (let i = 0; i < izgara.length; i++) if (izgara[i] > 0) { const m = hucreMerkezi(i); if (Math.hypot(m.x - p.x, m.y - p.y) <= Math.max(yaricap, KOPUK_HUCRE * 0.71)) { izgara[i] *= k; if (izgara[i] < 0.05) izgara[i] = 0; } }
}
/** köpüklü hücrelerin merkezleri */
export function izgaraDolular(izgara: Float32Array): Nokta[] { const l: Nokta[] = []; for (let i = 0; i < izgara.length; i++) if (izgara[i] >= 0.4) l.push(hucreMerkezi(i)); return l; }

/** Su damlası (sıçrama): hız sahne pikseli/ms, ömür ms. */
export interface SuParcasi { x: number; y: number; vx: number; vy: number; omur: number; boy: number; }
export const SU_YERCEKIMI = 0.0034;
/** Çarpma noktasından sıçrayan damlalar: yukarı ve iki yana fırlar. */
export function sicramaUret(p: Nokta, adet: number, rastgele: () => number = Math.random): SuParcasi[] {
  return Array.from({ length: adet }, () => {
    const aci = -Math.PI / 2 + (rastgele() - 0.5) * 2.2, hiz = 0.25 + rastgele() * 0.45;
    return { x: p.x + (rastgele() - 0.5) * 24, y: p.y, vx: Math.cos(aci) * hiz, vy: Math.sin(aci) * hiz, omur: 320 + rastgele() * 260, boy: 14 + rastgele() * 16 };
  });
}
/** Düşen tek damla (ıslak pamuktan damlar): olduğu yerden yerçekimiyle iner. */
export const damlaUret = (p: Nokta, rastgele: () => number = Math.random): SuParcasi => ({ x: p.x + (rastgele() - 0.5) * 16, y: p.y, vx: 0, vy: 0.05, omur: 380 + rastgele() * 140, boy: 16 + rastgele() * 8 });
/** Damlaları bir kare ilerletir: yerçekimi, ömür; ömrü biten çıkar. */
export function suAdimi(parcalar: SuParcasi[], dt: number): SuParcasi[] {
  for (const p of parcalar) { p.vy += SU_YERCEKIMI * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.omur -= dt; }
  return parcalar.filter(p => p.omur > 0);
}

/** Diken çekilirken önce gerilir (uzar); eşiği geçince çıkar ve yay gibi bir iki kez titreyip durulur. */
export const DIKEN_GERILME = 0.22;
export const dikenGerilmesi = (cekis: number): number => 1 + DIKEN_GERILME * Math.min(1, Math.max(0, cekis) / DIKEN_ESIGI);
export const dikenYayi = (ms: number): number => 1 + (ms < 0 || ms > 420 ? 0 : DIKEN_GERILME * 0.9 * Math.exp(-ms / 90) * Math.cos(ms / 22));

/** Sargı: açılan ucun kenarı, rulo kolun üstündeyken bir yana, altındayken öbür yana yatar (kol çevresinde dönüyor görünür). */
export const SARGI_EGIMI = 34;
/** kolun üst ve alt kenarı (yakın planda sargının çıktığı yerler) */
export const SARGI_KOL = { ust: 432, alt: 668 } as const;
/** eğimli kenarın, sahnenin üst (y 0) ve alt (y SAHNE.y) kenarındaki x'i: kenar kolun üstünde x + egim, altında x − egim */
export function sargiKenari(x: number, egim: number): { ust: number; alt: number } {
  const e = (2 * egim) / (SARGI_KOL.alt - SARGI_KOL.ust);
  return { ust: x + egim + e * SARGI_KOL.ust, alt: x + egim - e * (SAHNE.y - SARGI_KOL.ust) };
}

/** Diken: cımbız kilitlenince parmağın dikenin ekseni boyunca çekişi ölçülür. Önce direnir (az kayar), eşiği geçince çıkar. */
export const DIKEN_ESIGI = 90;
export const DIKEN_DIRENCI = 0.35;
export function dikenCekisi(d: Diken, kilitNoktasi: Nokta, parmakUcu: Nokta): { cekis: number; kayma: number; cikti: boolean } {
  const r = (d.aci * Math.PI) / 180;
  const cekis = Math.max(0, (parmakUcu.x - kilitNoktasi.x) * Math.cos(r) + (parmakUcu.y - kilitNoktasi.y) * Math.sin(r));
  return { cekis, kayma: Math.min(cekis, DIKEN_ESIGI) * DIKEN_DIRENCI, cikti: cekis >= DIKEN_ESIGI };
}
/** Dikenin dışarıdaki (cımbızın tuttuğu) ucu. */
export function dikenUcu(d: Diken, kayma = 0): Nokta {
  const r = (d.aci * Math.PI) / 180;
  return { x: d.x + Math.cos(r) * (DIKEN_BOYU + kayma), y: d.y + Math.sin(r) * (DIKEN_BOYU + kayma) };
}
export const tepsideMi = (p: Nokta): boolean => p.x >= YAKIN.tepsi.sol + 20 && p.x <= YAKIN.tepsi.sol + YAKIN.tepsi.g - 20 && p.y >= YAKIN.tepsi.ust + 20 && p.y <= YAKIN.tepsi.ust + YAKIN.tepsi.y - 20;

/**
 * Sargı: parmak kolun çevresinde döndükçe ya da kolun üstünden karşıya geçtikçe sargı ilerler. Dönüş açısı (radyan)
 * ve karşıya geçiş sayısı birlikte sayılır: bir tam tur = 2π ya da iki geçiş.
 */
export interface SargiDurumu { aci: number | null; ustte: boolean | null; toplam: number; }
export const sargiBaslangici = (): SargiDurumu => ({ aci: null, ustte: null, toplam: 0 });
export function sargiAdimi(d: SargiDurumu, p: Nokta): SargiDurumu {
  const m = YAKIN.sargi;
  const aci = Math.atan2(p.y - m.y, p.x - m.x);
  let toplam = d.toplam;
  if (d.aci !== null) {
    let fark = aci - d.aci;
    if (fark > Math.PI) fark -= 2 * Math.PI; else if (fark < -Math.PI) fark += 2 * Math.PI;
    // yalnız kolun yakınındaki hareket sayılır (ekranın öbür ucunda çevrilen daire sarmaz)
    if (Math.hypot(p.x - m.x, p.y - m.y) < 520) toplam += Math.abs(fark) / (2 * Math.PI);
  }
  const yanda = p.x > m.sol - 120 && p.x < m.sag + 120;
  const ustte = yanda ? p.y < m.y : d.ustte;
  if (yanda && d.ustte !== null && ustte !== d.ustte) toplam += 0.5 - Math.min(0.5, d.aci !== null ? Math.abs(aci - d.aci) / (2 * Math.PI) : 0);
  return { aci, ustte, toplam };
}
/** Sargının görünen kısmı (0–1): tur sayısına göre, basamak basamak değil akıcı. */
export const sargiOrani = (toplam: number, tur: number): number => Math.max(0, Math.min(1, toplam / tur));

/** Bekleme döngüsü: iki poz arasında gidip gelir; arada bir göz kırpar. t: aşamanın başından beri (ms). */
export function beklemeKaresi(t: number): 'a' | 'b' | 'kirp' {
  const d = t % 3600;
  if (d >= 900 && d < 1040) return 'kirp';
  // kulaklar 1,1 saniye düşer (iç çekiş), sonra yine dikilir
  return d >= 2200 && d < 3300 ? 'b' : 'a';
}
export const sevincKaresi = (t: number): 0 | 1 => (Math.floor(t / 240) % 2 === 0 ? 0 : 1);
/** Yakın plandaki yüz ifadesi: dikende "ay", köpükte kıkır, dikenler bitince rahat; kalan zamanda endişeli. */
export type Yuz = keyof typeof SECMELI.yuz;
export interface YuzDurumu { asama: Asama; /** cımbız bir dikeni tutuyor (direniyor) */ kilitli: boolean; /** diken çıktıktan sonra "ay"ın süreceği süre (ms) */ ayyKalan: number; /** köpük mikroba değerken ya da pof'tan sonra kıkırın süreceği süre (ms) */ kikirKalan: number; }
export const AYY_MS = 520, KIKIR_MS = 900;
export function yuzIfadesi(d: YuzDurumu): Yuz {
  if (d.asama === 'cimbiz' && (d.kilitli || d.ayyKalan > 0)) return 'ayy';
  if (d.asama === 'sprey' && d.kikirKalan > 0) return 'kikir';
  if (d.asama === 'pamuk' || d.asama === 'sargi' || d.asama === 'bant' || d.asama === 'defter' || d.asama === 'kutlama' || d.asama === 'son') return 'rahat';
  return 'endise';
}
/**
 * Kapanış kısa tutulur (bitiş sevinci en çok 2 sn): bant yapıştıktan sonra kısa bir duraklama, masaya dönüş (kamera) ve
 * masadaki sevinç; toplamı dolunca "yeniden oyna" düğmesi hazırdır. Zıpzıp zıplamayı sonra da sürdürür.
 */
export const KAPANIS = { bekleme: 250, kamera: 430, sevinc: 1300 } as const;
/** Dokunma hedefinin ekrandaki en küçük kenarı (px) ve bunun sınandığı en küçük ekran (yatay küçük telefon). */
export const EN_KUCUK_HEDEF = 64;
export const EN_KUCUK_EKRAN = { g: 667, y: 375 } as const;
/** Şeritteki desenli bandın dokunma kutusu: yuvanın tamamı (çizim içinde ortalanır). */
export const BANT_DUGMESI: readonly [number, number] = [328, 200];
export const KOL_DUGMESI: readonly [number, number] = [330, 224];
export const TEKRAR_BOYU = 200;
/** Elde tutulan alet yuvadakinden bir parça büyüktür ve gölgesi vardır (ucu yerinde kalır). */
export const ELDE_OLCEK = 1.05;
/** Kutlamada Zıpzıp'ın bir zıplayışı (ms): havadaki bölümünde ikinci sevinç karesi görünür; her inişte yıldız yağar. */
export const ZIPLAMA_MS = 480;
export const ziplamaKaresi = (t: number): 0 | 1 => { const d = ((t % ZIPLAMA_MS) + ZIPLAMA_MS) % ZIPLAMA_MS; return d > 100 && d < 370 ? 1 : 0; };
/** Yakın plandaki Kino: bir olaya tepki sürerken o poz; cımbız dikeni tutarken ya da mikrop mercekteyken şaşkın; yoksa izler. */
export type KinoPozu = 'izler' | 'sasir' | 'sevin';
export const kinoYakinPozu = (d: { tepki: KinoPozu | null; kilitli: boolean; mercekte: boolean }): KinoPozu => d.tepki ?? (d.kilitli || d.mercekte ? 'sasir' : 'izler');
/** Kino'nun alkışı: patiler 150 ms'de bir açılıp kapanır. */
export const alkisKaresi = (t: number): 0 | 1 => (Math.floor(t / 150) % 2 === 0 ? 0 : 1);
