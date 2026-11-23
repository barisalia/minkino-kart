// Tam boy önizleme sayfasının verisi ve HTML'i. Sayfa tek dosyadır (stil ve betik gömülü), çizimleri bağıl yolla gösterir;
// tarayıcıda doğrudan açılır. Saf: stil ve istemci betiği dışarıdan verilir (bagla.ts dosyadan okur).
import type { Bulgu, Kutu } from './gorsel-mantik';
import type { Kilavuz } from './k1-paket';

export interface OnizlemeCizimi {
  ad: string; sayfa: string; tuval: string; g: number; y: number;
  /** önizleme sayfasından çizime bağıl yol; çizim gelmediyse null */
  yol: string | null;
  /** nereden geldi: "kaynaktan · macenta temizlendi", "hedefte hazır" … */
  koken: string;
  bulgular: Bulgu[];
  kutu: Kutu | null;
  /** yalnız bu çizimde görünen kılavuzlar (koddaki tahmini hedef noktaları) */
  kilavuzlar?: readonly Kilavuz[];
}
export interface OnizlemeVerisi {
  uretildi: string;
  hedef: string;
  kaynak: string;
  cizimler: OnizlemeCizimi[];
  sayfalar: { anahtar: string; baslik: string; tuval: string; adlar: readonly string[] }[];
  tuvaller: Record<string, { g: number; y: number; kilavuzlar: readonly Kilavuz[] }>;
  diziler: readonly { ad: string; kareler: readonly string[]; sureler: readonly number[]; donus?: number }[];
  agizlar: readonly { ad: string; kareler: readonly string[] }[];
  /** oran: değişen piksel / temelin görünen pikseli; yayilma: değişen alanın kutusu / temelin kutusu */
  ayniPoz: { temel: string; es: string; ne: string; enCok: number; oran: number | null; yayilma: number | null; kutu: Kutu | null }[];
  kaynaklar: { dosya: string; sonuc: string; seviye: 'tamam' | 'hata' | 'atlandi' }[];
  /** Zıpzıp tuvalinin arkasına konabilen muayene masası: masa tuvalinin Zıpzıp tuvalindeki sol üst köşesi */
  masa: { ad: string; sol: number; ust: number; g: number; y: number };
  /** Sahne provası: katmanların oyundaki kutuları (sahne birimi), kamera planları ve cihazlarda görünen alan */
  prova?: Prova;
}
export interface ProvaKutusu { sol: number; ust: number; g: number; y: number; }
export interface Prova {
  sahne: { g: number; y: number };
  kutular: Record<'fon' | 'perde' | 'masa' | 'kino' | 'zipzip' | 'yakin', ProvaKutusu>;
  kamera: Record<string, { tx: number; ty: number; s: number }>;
  cerceveler: { ad: string; kutu: ProvaKutusu }[];
  adlar: { fon: string; masa: string; perde: readonly string[]; zipzip: readonly string[]; kino: readonly string[]; yakin: readonly string[] };
}

export interface Ozet { beklenen: number; gelen: number; eksik: string[]; hata: number; uyari: number; temiz: number; }
export function ozetle(v: Pick<OnizlemeVerisi, 'cizimler'>): Ozet {
  const gelen = v.cizimler.filter(c => c.yol);
  const say = (s: Bulgu['seviye']) => gelen.filter(c => c.bulgular.some(b => b.seviye === s)).length;
  return {
    beklenen: v.cizimler.length, gelen: gelen.length, eksik: v.cizimler.filter(c => !c.yol).map(c => c.ad),
    hata: say('hata'), uyari: gelen.filter(c => !c.bulgular.some(b => b.seviye === 'hata') && c.bulgular.some(b => b.seviye === 'uyari')).length,
    temiz: gelen.filter(c => !c.bulgular.some(b => b.seviye !== 'bilgi')).length,
  };
}

/** JSON'u <script> içine güvenle gömer. */
export const jsonGom = (o: unknown): string => JSON.stringify(o).replace(/</g, '\\u003c').split(String.fromCharCode(8232)).join('').split(String.fromCharCode(8233)).join('');

export function onizlemeHtml(v: OnizlemeVerisi, stil: string, istemci: string): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Doktor-K1 · tam boy önizleme</title>
<style>${stil}</style>
</head>
<body>
<div id="kok"></div>
<script id="veri" type="application/json">${jsonGom(v)}</script>
<script>${istemci.replace(/<\/script/gi, '<\\/script')}</script>
</body>
</html>
`;
}
