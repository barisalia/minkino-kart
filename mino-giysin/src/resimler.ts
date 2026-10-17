/**
 * Mino Ne Giysin? görselleri (Vite adresleri). Yeni çizim yalnız assets/mino-giysin (G-MG1 kostüm, G-MG2 Pamuk);
 * gerisi var olan setlerden okunur (giysin odası, film parkı ve mutfağı, pasta, pati, kino-otobus, banyo).
 *
 * Kostüm: assets/mino-giysin/<parça>.webp varsa o (Gemini, ekip/illustrator/mino-giysin-isle.cjs), yoksa sade yer tutucu
 * assets/mino-giysin/yer-tutucu/<parça>.svg. Resim gelince kod değişmeden gerçeğe geçer.
 */
import YER from '../../assets/mino-giysin/kostum-yer.json';
import type { MinoKostumParca } from '../../src/mino/mino';
import type { ParcaId } from './model';

const MG = import.meta.glob<string>('../../assets/mino-giysin/**/*.{webp,svg}', { eager: true, query: '?url', import: 'default' });
const ORTAK = import.meta.glob<string>(
  [
    '../../assets/giysin/{oda-yatay,oda-dikey,dolap-acik-goz,esya-sepet,ayna,kapi-cerceve,kapi-kanat,pencere,perde-sol,perde-sag,pencere-yaz-arka,pencere-yaz-orta,pencere-yaz-on}.webp',
    '../../assets/giysin/ikon/corap.webp',
    '../../assets/film/park/{arka-uzak,arka-orta,arka-on}.webp',
    '../../assets/film/mutfak/{arka-uzak,arka-orta}.webp',
    '../../assets/film/ev/oda-dikey.webp',
    '../../assets/film/esya/{mama-sandalyesi,cicek,mantar,kova}.webp',
    '../../assets/pasta/{kavanoz-cikolata-1,kurabiye-yuvarlak-altin}.webp',
    '../../assets/pati/esya-mama-kabi-dolu.webp',
    '../../assets/kino-otobus/kase.webp',
    '../../assets/banyo/ordek.webp',
  ],
  { eager: true, query: '?url', import: 'default' },
);
/** Arkadaşların yüzü (yardım balonu): iskeletin kendi SVG'si (gizli ekler kapalı; her ölçekte keskin) */
const ISKELET = import.meta.glob<string>('../../assets/karakter-iskelet/{pamuk,kino,ege,ada}.svg', { eager: true, query: '?url', import: 'default' });

/** Ortak görsel: 'giysin/oda-yatay', 'film/park/arka-orta' … */
export const gorsel = (ad: string): string => ORTAK[`../../assets/${ad}.webp`] ?? '';
export const iskeletResmi = (ad: string): string => ISKELET[`../../assets/karakter-iskelet/${ad}.svg`] ?? '';

/** Bu oyunun kendi görseli varsa adresi ('pamuk-bekle', 'ikon/bas-asci'); yoksa '' */
export const kendi = (ad: string): string => MG[`../../assets/mino-giysin/${ad}.webp`] ?? '';
/** Gemini kostümü geldi mi (yer tutucu değil) */
export const gercekKostum = (id: ParcaId): boolean => !!kendi(id);

/** Kostüm parçasının resmi (gerçek ya da yer tutucu) */
export function parcaResmi(id: ParcaId | 'bas-bahce-cicek'): string {
  return kendi(id) || MG[`../../assets/mino-giysin/yer-tutucu/${id}.svg`] || '';
}
/** Dolap / sepet ikonu: küçük kopya varsa o (DPR 3'te gözde net), yoksa parçanın kendisi */
export const ikonResmi = (id: ParcaId): string => kendi(`ikon/${id}`) || parcaResmi(id);

/** Mino'daki yeri (kostum-yer.json, çizimin 2048'lik koordinatları) */
export function parcaKostum(id: ParcaId | 'bas-bahce-cicek'): MinoKostumParca {
  const k = (YER as unknown as Record<string, [number, number, number, number]>)[id];
  return { src: parcaResmi(id), kutu: k ? [...k] : [700, 200, 600, 300] };
}

/** Pamuk'un ağaç pozu (G-MG2) geldi mi */
export const PAMUK_POZLARI = ['bekle', 'kirp', 'korku', 'islak', 'kokla', 'kay', 'atla', 'yala'] as const;
export type PamukPoz = (typeof PAMUK_POZLARI)[number];
export const pamukPozu = (p: PamukPoz): string => kendi(`pamuk-${p}`);
export const pamukPozlariVar = (): boolean => PAMUK_POZLARI.every((p) => !!pamukPozu(p));

/** Ekranın resimlerini önceden çöz (geçişte bir anda belirmesin) */
export function onYukle(adresler: string[]) {
  for (const a of adresler) {
    if (!a) continue;
    const i = new Image();
    i.src = a;
    void i.decode?.().catch(() => undefined);
  }
}
