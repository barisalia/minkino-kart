// 6. sahne · diz yakın planı (çekim listesi 6.1–6.5). Çizim adları Paket Doktor-K3 brief'iyle birebirdir.
// Arkada Zıpzıp'ın yüzü, önde dizi: her alette yüz tepki verir. 5+: büyüteç → cımbız → ıslak pamuk → bant.
// 4 yaş: pamuk → bant. 2–3 yaş: yalnız bant. Kino kadraj dışıdır, sesi duyulur.
// Saf veri: DOM yok.
import type { Dizi } from '../once-kuzu/diziler';
import { K1 } from '../once-kuzu/diziler';
import type { Adim } from '../motor/akis';
import type { BantDeseni, Yas, Yasli } from '../motor/oyun';

const sira = (onek: string, bas: number, son: number): string[] => Array.from({ length: son - bas + 1 }, (_, i) => onek + (bas + i));

export const K3_DIZ = {
  bacak: 'diz-bacak',
  camur: 'diz-camur',
  cizik: 'diz-cizik',
  yaprak: 'diz-yaprak',
  pati: sira('diz-pati-', 0, 1),
  yuzBak: 'diz-yuz-bak',
  yuzKirp: 'diz-yuz-kirp',
  izle: sira('diz-yuz-izle-', 0, 1),
  kis: sira('diz-yuz-kis-', 0, 1),
  oh: sira('diz-yuz-oh-', 0, 1),
  urper: sira('diz-yuz-urper-', 0, 1),
  gurur: sira('diz-yuz-gurur-', 0, 1),
  yuzAgiz: sira('diz-yuz-agiz-', 0, 5),
  uzat: sira('zipzip-diz-uzat-', 0, 3),
  bantlar: ['bant-yildiz', 'bant-kalp', 'bant-gokkusagi', 'bant-pati'],
  buyutec: 'buyutec',
  cimbiz: 'cimbiz',
  pamuk: 'pamuk',
} as const;
/** Bu sahnenin K3'teki kendi çizimleri (35). */
export const DIZ_DOSYALAR: readonly string[] = Object.values(K3_DIZ).flat();
/** Başka paketlerden kullanılanlar: muayene odası ve Kino (K1), masadaki Kuzu (K3, 7. sahne), uğur böceği (K3, 1. sahne). */
export const DIZ_ODUNC: readonly string[] = [K1.fon, K1.masa, K1.kinoGoster[3], ...K1.kinoAgiz, K1.kinoKirp, 'kuzu-oturur', 'ugur-ucus-0', 'ugur-ucus-1', 'ugur-yuru'];
export const BANT_CIZIMI: Record<BantDeseni, string> = { yildiz: 'bant-yildiz', kalp: 'bant-kalp', gokkusagi: 'bant-gokkusagi', pati: 'bant-pati' };

const z = K3_DIZ;
export const DIZ_DIZI = {
  /** bacağını öne uzatır, çamurlu dizini gösterir, bize bakar */
  'diz-uzat': { kareler: z.uzat, sureler: [300, 240, 420, 0] },
  /** böcek çıkar: önce şaşkın bakar, sonra gözleriyle pencereye doğru izler */
  'yuz-izle': { kareler: z.izle, sureler: [520, 0] },
  /** cımbız çekerken gözlerini iyice kısar */
  'yuz-kis': { kareler: z.kis, sureler: [380, 0] },
  /** yaprak çıktı: bir gözünü açar, ferahlar */
  'yuz-oh': { kareler: z.oh, sureler: [360, 0] },
  /** ıslak pamuk: ürperir, sonra gıdıklanıp güler */
  'yuz-urper': { kareler: z.urper, sureler: [640, 0] },
  /** bant yapıştı: dizine gururla bakar, sonra bize */
  'yuz-gurur': { kareler: z.gurur, sureler: [620, 0] },
  /** pati bandı iki kez okşar */
  'pati-oksa': { kareler: [z.pati[0], z.pati[1], z.pati[0], z.pati[1], z.pati[0]], sureler: [220, 220, 220, 220, 0] },
} as const satisfies Record<string, Dizi>;

export type DizOlayi = 'yaprak-bulundu' | 'yaprak-tutuldu' | 'yaprak-cikti' | 'pamuk-degdi' | 'camur-silindi' | 'bant-kondu' | 'bant-duzlesti';
export const DIZ_REPLIKLER: readonly { ad: string; kim: 'kino' | 'zipzip'; metin: string }[] = [
  { ad: 'kd-diz', kim: 'kino', metin: 'Dizinde kahverengi bir şey var.' },
  { ad: 'zd-yaprak', kim: 'zipzip', metin: 'Aaa! Yaprak!' },
  { ad: 'zd-yolcu', kim: 'zipzip', metin: 'Bir de yolcu varmış!' },
  { ad: 'zd-yavas', kim: 'zipzip', metin: 'Yavaş yavaş…' },
  { ad: 'zd-acimadi', kim: 'zipzip', metin: 'Oh! Hiç acımadı!' },
  { ad: 'zd-serin', kim: 'zipzip', metin: 'Çok serin!' },
  { ad: 'zd-gidik', kim: 'zipzip', metin: 'Gıdıklıyor!' },
  { ad: 'kd-piril', kim: 'kino', metin: 'Dizi pırıl pırıl oldu.' },
  { ad: 'kd-hangisi', kim: 'kino', metin: 'Hangisi yakışır dersin?' },
  { ad: 'zd-bant-yildiz', kim: 'zipzip', metin: 'Yıldızlı! En sevdiğim!' },
  { ad: 'zd-bant-kalp', kim: 'zipzip', metin: 'Kalpli! En sevdiğim!' },
  { ad: 'zd-bant-gokkusagi', kim: 'zipzip', metin: 'Gökkuşağı! En sevdiğim!' },
  { ad: 'zd-bant-pati', kim: 'zipzip', metin: 'Patili! En sevdiğim!' },
];
export const DIZ_EFEKTLER = ['e6-pit', 'e6-surt', 'e6-bant', 'e6-buldu'] as const;
export const DIZ_KAYIT_MS: Record<string, number> = {
  'kd-diz': 2290, 'zd-yaprak': 1430, 'zd-yolcu': 1590, 'zd-yavas': 1510, 'zd-acimadi': 1800, 'zd-serin': 1770, 'zd-gidik': 1770, 'kd-piril': 1800,
  'kd-hangisi': 1510, 'zd-bant-yildiz': 2220, 'zd-bant-kalp': 2240, 'zd-bant-gokkusagi': 2270, 'zd-bant-pati': 2030,
};
/** Bant düzleşince Zıpzıp'ın söyleyeceği sözün adımı. */
export const BANT_SOZ_ADIMI: Record<BantDeseni, string> = { yildiz: 's6-soz-yildiz', kalp: 's6-soz-kalp', gokkusagi: 's6-soz-gokkusagi', pati: 's6-soz-pati' };

type DizAdimi = Adim<DizOlayi> & Yasli;
const BES: readonly Yas[] = ['5+'];
const DORT_BES: readonly Yas[] = ['4', '5+'];
const BAK = { poz: z.yuzBak, kirp: z.yuzKirp, kirpAnlari: [1400, 4600, 8300] };
const soz = (desen: BantDeseni): DizAdimi => ({ ad: BANT_SOZ_ADIMI[desen], plan: 'yakin', katman: { pati: { dizi: 'pati-oksa' }, yuz: { poz: z.yuzAgiz[5] } },
  ses: { kim: 'zipzip', ad: 'zd-bant-' + desen, agiz: 'diz-yuz', dinlenme: 5 }, bitis: { tur: 'ses', ek: 300 }, sonra: 's6-gurur' });

export const DIZ_ADIMLAR: readonly DizAdimi[] = [
  // 6.1 · orta: Zıpzıp dizini uzatıp gösterir
  { ad: 's6-uzat', plan: 'orta', katman: { masa: { poz: K1.masa }, kuzu: { poz: 'kuzu-oturur' }, kino: { poz: K1.kinoGoster[3], kirp: K1.kinoKirp, kirpAnlari: [700] }, zipzip: { dizi: 'diz-uzat' } }, bitis: { tur: 'sure', ms: 1500 } },
  { ad: 's6-kino', plan: 'orta', ses: { kim: 'kino', ad: 'kd-diz', agiz: 'kino-steto', dinlenme: 5 }, bitis: { tur: 'ses', ek: 300 } },
  { ad: 's6-yaklas', plan: 'yakin', katman: { yuz: BAK, bacak: { poz: z.bacak }, cizik: { poz: z.cizik }, pati: { yok: true } }, bitis: { tur: 'sure', ms: 1100 } },
  // 6.2 · büyüteç: yaprak bulunur, altından uğur böceği çıkar
  { ad: 's6-buyutec', plan: 'yakin', yas: BES, katman: { yuz: BAK }, bitis: { tur: 'cocuk', olay: 'yaprak-bulundu' } },
  { ad: 's6-yaprak', plan: 'yakin', yas: BES, katman: { yuz: { poz: z.yuzAgiz[5] } }, efekt: [{ ad: 'e6-buldu' }], ses: { kim: 'zipzip', ad: 'zd-yaprak', gecikme: 250, agiz: 'diz-yuz', dinlenme: 5 }, bitis: { tur: 'ses', ek: 200 } },
  { ad: 's6-bocek', plan: 'yakin', yas: BES, katman: { yuz: { dizi: 'yuz-izle' } }, bitis: { tur: 'sure', ms: 1900 } },
  { ad: 's6-yolcu', plan: 'yakin', yas: BES, katman: { yuz: { poz: z.yuzAgiz[5] } }, ses: { kim: 'zipzip', ad: 'zd-yolcu', agiz: 'diz-yuz', dinlenme: 5 }, bitis: { tur: 'ses', ek: 300 } },
  // 6.3 · cımbız: sap tutulur, çekilir, yaprak çıkar
  { ad: 's6-cimbiz', plan: 'yakin', yas: BES, katman: { yuz: BAK }, bitis: { tur: 'cocuk', olay: 'yaprak-tutuldu' } },
  { ad: 's6-cek', plan: 'yakin', yas: BES, katman: { yuz: { dizi: 'yuz-kis' } }, ses: { kim: 'zipzip', ad: 'zd-yavas', agiz: null }, bitis: { tur: 'cocuk', olay: 'yaprak-cikti' } },
  { ad: 's6-oh', plan: 'yakin', yas: BES, katman: { yuz: { dizi: 'yuz-oh' } }, efekt: [{ ad: 'e6-pit' }], ses: { kim: 'zipzip', ad: 'zd-acimadi', gecikme: 450, agiz: 'diz-yuz', dinlenme: 5 }, bitis: { tur: 'ses', ek: 400 } },
  // 6.4 · ıslak pamuk: ürperir, çamur silinir
  { ad: 's6-pamuk', plan: 'yakin', yas: DORT_BES, katman: { yuz: BAK }, bitis: { tur: 'cocuk', olay: 'pamuk-degdi' } },
  { ad: 's6-serin', plan: 'yakin', yas: DORT_BES, katman: { yuz: { poz: z.urper[0] } }, ses: { kim: 'zipzip', ad: 'zd-serin', agiz: null }, bitis: { tur: 'ses', ek: 100 } },
  { ad: 's6-sil', plan: 'yakin', yas: DORT_BES, katman: { yuz: { poz: z.urper[1] } }, bitis: { tur: 'cocuk', olay: 'camur-silindi' } },
  { ad: 's6-gidik', plan: 'yakin', yas: DORT_BES, ses: { kim: 'zipzip', ad: 'zd-gidik', agiz: null }, bitis: { tur: 'ses', ek: 200 } },
  { ad: 's6-piril', plan: 'yakin', yas: DORT_BES, katman: { yuz: { poz: z.gurur[0] } }, ses: { kim: 'kino', ad: 'kd-piril', agiz: null }, bitis: { tur: 'ses', ek: 200 } },
  // 6.5 · bant: seç, çiziğe koy, sürterek düzleştir
  { ad: 's6-hangisi', plan: 'yakin', katman: { yuz: BAK }, ses: { kim: 'kino', ad: 'kd-hangisi', agiz: null }, bitis: { tur: 'ses' } },
  { ad: 's6-bant-sec', plan: 'yakin', bitis: { tur: 'cocuk', olay: 'bant-kondu' } },
  { ad: 's6-bant-sur', plan: 'yakin', katman: { yuz: { poz: z.gurur[0] } }, bitis: { tur: 'cocuk', olay: 'bant-duzlesti' } },
  soz('yildiz'), soz('kalp'), soz('gokkusagi'), soz('pati'),
  { ad: 's6-gurur', plan: 'yakin', katman: { yuz: { dizi: 'yuz-gurur' }, pati: { yok: true } }, efekt: [{ ad: 'e6-bant' }], bitis: { tur: 'sure', ms: 1500 }, sonra: 'son' },
];

/** Yakın tuvaldeki noktalar (2048 × 1536; brief ölçüleri). Yaprağın ve çamurun yeri çizimden ölçülür (sahne.ts). */
export const DIZ_NOKTA = {
  /** diz kapağının ve çiziğin merkezi */
  diz: { x: 1024, y: 1080 },
  /** uğur böceğinin uçup gittiği yer (pencere): kadrajın sağ üstü */
  pencere: { x: 1900, y: 120 },
  /** aletin beklediği yer (tutma noktası) */
  alet: { x: 1700, y: 1180 },
  /** bant seçenekleri: sağda dikey sıra (ilk bandın merkezi ve aralık) */
  bantSecim: { x: 1700, y: 760, aralik: 190 },
  /** dizdeki bandın eni */
  bantEni: 560,
} as const;
/** Aletler (çizim 1600 × 1600): elde tutulan boy (yakın tuval pikseli), parmağın tuttuğu yer ve iş yapan uç (oran). */
export const DIZ_ALET = {
  buyutec: { cizim: z.buyutec, etiket: 'Büyüteç', boy: 780, tut: [0.5, 0.82] as [number, number], uc: [0.5, 0.3] as [number, number], cam: 0.2 },
  cimbiz: { cizim: z.cimbiz, etiket: 'Cımbız', boy: 700, tut: [0.5, 0.72] as [number, number], uc: [0.5, 0.06] as [number, number], cam: 0 },
  pamuk: { cizim: z.pamuk, etiket: 'Islak pamuk', boy: 360, tut: [0.45, 0.55] as [number, number], uc: [0.45, 0.5] as [number, number], cam: 0 },
} as const;
export const DIZ_AYAR = { buyutme: 2.2, bulmaMs: 260, cekmeEsigi: 300, silmeYaricapi: 120, silmeOrani: 0.1, surtmeYolu: { '5+': 1700, '4': 1300, '2-3': 850 } as Record<Yas, number> } as const;
