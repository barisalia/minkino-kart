/**
 * Ovala, Bul (22 Kasım 2026) · DOM'suz veri: sahneler, saklanma yerleri, plan, çizim ve ses listeleri.
 *
 * Neden: Oyuncaklar, Meyve ve Doğa adalarının ilk üç dersi yalnız ortak etkinliklerle dönüyordu (Barış: "az tekrar, çok
 * çeşit"). Üçüncü yeni etkinlik, öncekilerden ayrı bir parmak hareketidir: OVALAMA. Sahnenin üstünde bir örtü vardır
 * (köpük, toprak, sis); Polly "Where is the robot?" diye sorar, çocuk parmağıyla örtüyü siler. Altından çıkan her şey
 * adını söyler; sorulan çıkınca tur biter, örtü yeniden kapanır.
 *   - Oyuncaklar · Köpüklü Küvet: oyuncaklar küvetteki köpüğün altında.
 *   - Meyve · Lokum'un Bahçesi: meyve ve sebzeler bahçe toprağının altında.
 *   - Doğa · Sisli Vadi: ağaç, nehir, dağ, ay … sisin arkasında.
 * 1. dersin Bul'unun ve şenliğin Obur'u Besle'sinin yerine gelir.
 *
 * Çizimler (Astra, Paket 36): sahne başına iki çizim, 1600 × 1000: `fon` (her şey yerinde, açıkta) ve `ortu` (yalnız örtü,
 * şeffaf zeminli; fondaki her şeyi tamamen kapatır). Kod örtüyü bir tuvale basar, parmağın geçtiği yer silinir.
 */
import type { Kelime, SesMetni } from '../icerik';
import type { Yas } from '../plan';

type Rnd = () => number;
const karistir = <T>(l: readonly T[], rnd: Rnd): T[] => { const a = [...l]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Tuvaldeki kutu, piksel: sol, üst, genişlik, yükseklik (1600 × 1000) */
export type Kutu = readonly [number, number, number, number];
export const OV_TUVAL = { en: 1600, boy: 1000 } as const;
/** Bir şeyin sayılması için kutusunun ne kadarı açılmış olmalı */
export const ACILMA_ORANI = 0.45;

export interface OvalaSahnesi {
  ad: 'kopuk' | 'toprak' | 'sis';
  uniteId: string;
  /** taslak kipinde: fon ve örtünün yerine düz renkler */
  fonRengi: string;
  ortuRengi: string;
  yerler: Readonly<Record<string, Kutu>>;
  giris: SesMetni;
  son: SesMetni;
}

const hece = (s: string) => (s.toLowerCase().match(/[aeiouy]+/g) ?? []).length || 1;
const polly = (id: string, metin: string): SesMetni => ({ id, kim: 'polly', dil: 'en', metin, hece: hece(metin) });
const ceren = (id: string, metin: string): SesMetni => ({ id, kim: 'ceren', dil: 'tr', metin, hece: (metin.toLocaleLowerCase('tr').match(/[aeıioöuü]/g) ?? []).length });

/** iki sıra dört sütun (küvet ve bahçe yatağı) */
const izgara = (ids: readonly string[], ust: number): Record<string, Kutu> =>
  Object.fromEntries(ids.map((id, i) => [id, [170 + (i % 4) * 330, ust + Math.floor(i / 4) * 270, 280, 230] as Kutu]));

export const OVALA_SAHNELERI: readonly OvalaSahnesi[] = [
  {
    ad: 'kopuk', uniteId: 'oyuncaklar', fonRengi: '#dff0f7', ortuRengi: '#ffffff',
    // 22 Kasım 08:19 kararı: bez bebek (doll) insan biçimli, sahneden çıktı; yerine küvete uyan oyuncak tekne (boat)
    yerler: izgara(['ball', 'teddy-bear', 'boat', 'kite', 'robot', 'drum', 'balloon', 'puzzle'], 360),
    giris: ceren('tr/c-ov-kopuk-giris', 'Oyuncaklar köpüğün altında kaldı! Polly hangisini sorarsa, parmağınla köpüğü sil ve onu bul.'),
    son: polly('en/g-ov-kopuk-son', 'Splish, splash! All the toys are clean!'),
  },
  {
    ad: 'toprak', uniteId: 'meyve', fonRengi: '#f3ead9', ortuRengi: '#8a5a3c',
    yerler: izgara(['carrot', 'potato', 'tomato', 'corn', 'grapes', 'watermelon', 'cherry', 'lemon'], 380),
    giris: ceren('tr/c-ov-toprak-giris', 'Lokum\'un bahçesinde her şey toprağın altında saklanmış! Parmağınla toprağı sil, Polly\'nin sorduğunu bul.'),
    son: polly('en/g-ov-toprak-son', 'What a big harvest!'),
  },
  {
    ad: 'sis', uniteId: 'doga', fonRengi: '#e3f0e0', ortuRengi: '#eef2f5',
    yerler: {
      star: [220, 60, 130, 130],
      moon: [1380, 50, 170, 170],
      mountain: [780, 140, 520, 330],
      tree: [110, 320, 260, 420],
      river: [430, 490, 300, 170],
      flower: [470, 720, 150, 200],
      leaf: [720, 760, 150, 140],
      grass: [1000, 740, 280, 180],
    },
    giris: ceren('tr/c-ov-sis-giris', 'Vadiyi sis kapladı! Parmağınla sisi sil, Polly\'nin sorduğunu bul.'),
    son: polly('en/g-ov-sis-son', 'Goodbye, fog! Hello, sunshine!'),
  },
];

export const ovalaSahnesi = (uniteId: string | undefined) => OVALA_SAHNELERI.find((s) => s.uniteId === uniteId);
export const ovYolu = (s: Pick<OvalaSahnesi, 'ad'>, parca: 'fon' | 'ortu') => `oyun/ovala/${s.ad}-${parca}`;

export interface OvalaPlani { sahne: OvalaSahnesi['ad']; hedefler: Kelime[] }

/** Sorulacaklar: dersin kelimelerinden sahnede yeri olanlar, 2–3 yaşta üç, diğerlerinde dört tur */
export function ovalaPlani(uniteId: string, kelimeler: readonly Kelime[], yas: Yas, rnd: Rnd): OvalaPlani | null {
  const s = ovalaSahnesi(uniteId);
  if (!s) return null;
  const hedefler = karistir(kelimeler.filter((w) => !!s.yerler[w.id]), rnd).slice(0, yas === '2-3' ? 3 : 4);
  return hedefler.length >= 2 ? { sahne: s.ad, hedefler } : null;
}

/** Adımın kayıtları: giriş, son, her hedefin sorusu ve cümlesi; çıkabilecek her şeyin adı (çocuk başka bir şeyi açabilir) */
export function ovalaSesleri(p: OvalaPlani): string[] {
  const s = OVALA_SAHNELERI.find((x) => x.ad === p.sahne)!;
  return [s.giris.id, s.son.id, 'en/g-yes', ...p.hedefler.flatMap((w) => [`en/q-${w.id}`, `en/c-${w.id}`]), ...Object.keys(s.yerler).map((id) => `en/w-${id}`)];
}

export const ovalaSesMetinleri = (): SesMetni[] => OVALA_SAHNELERI.flatMap((s) => [s.giris, s.son]);
