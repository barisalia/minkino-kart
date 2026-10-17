/**
 * Ölçek ve kadraj: sayılar TEK YERDE (§7b). Barış: "zoom out al, karakterler dev olmasın".
 *
 * Lokanta sahnesi, arka plan çiziminin oranında bir tuvaldir (yatay 16:9, dikey 9:16) ve ekranı KAPLAR (cover;
 * kenarlardan en çok ~%9 kırpılır, önemli her şey %10-%90 arasında). Sahnedeki yerler sahnenin yüzdesidir, böylece
 * Gemini çizimi gelince masa yuvaları, istasyonlar, kapı çizimdeki yerlerine oturur.
 *
 * Karakter boyu sahneden değil EKRANDAN: 1 boy birimi (Mino = 1) yatayda ekran yüksekliğinin %16,5'i (844×390'da
 * ~64 css px; belgede %17 yazıyor ama ayaktaki Baba (2,36) %40 sınırını aşmasın diye %16,5), dikeyde ekran
 * genişliğinin %16'sı. e2e en uzun karakterin ≤ %40, toplam karakter alanının ≤ %25 olduğunu ölçer.
 */
export const BIRIM_YATAY = 0.165;
export const BIRIM_DIKEY = 0.16;
/** sahne (arka plan çizimi) oranı */
export const SAHNE_ORAN = { yatay: 16 / 9, dikey: 9 / 16 } as const;
/** en uzun karakter / ekran yüksekliği, toplam karakter alanı / ekran alanı (e2e) */
export const SINIR = { enUzun: 0.4, toplamAlan: 0.25 } as const;

export type Yon = 'yatay' | 'dikey';

export interface Olcu {
  yon: Yon;
  /** ekran (kap) */
  w: number;
  h: number;
  /** boy birimi (css px) */
  u: number;
  /** sahnenin ekrandaki kutusu (cover) */
  sahne: { x: number; y: number; w: number; h: number };
}

/** Saf: kabın boyundan ölçü */
export function olc(w: number, h: number): Olcu {
  const yon: Yon = h > w * 1.05 ? 'dikey' : 'yatay';
  const u = yon === 'yatay' ? h * BIRIM_YATAY : w * BIRIM_DIKEY;
  const oran = SAHNE_ORAN[yon];
  let sw = w;
  let sh = w / oran;
  if (sh < h) {
    sh = h;
    sw = h * oran;
  }
  return { yon, w, h, u, sahne: { x: (w - sw) / 2, y: (h - sh) / 2, w: sw, h: sh } };
}

/** Kaba ölçüyü CSS değişkeni olarak yazar ve değişince yeniden yazar; bırakma fonksiyonu döner */
export function olcuIzle(kap: HTMLElement, sahne: HTMLElement, degisti: (o: Olcu) => void): () => void {
  let son = '';
  const yaz = () => {
    const o = olc(kap.clientWidth, kap.clientHeight);
    const anahtar = `${o.w}x${o.h}`;
    if (!o.w || anahtar === son) return;
    son = anahtar;
    kap.dataset.yon = o.yon;
    kap.style.setProperty('--rs-u', `${o.u.toFixed(2)}px`);
    Object.assign(sahne.style, { left: `${o.sahne.x}px`, top: `${o.sahne.y}px`, width: `${o.sahne.w}px`, height: `${o.sahne.h}px` });
    degisti(o);
  };
  yaz();
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(yaz) : null;
  ro?.observe(kap);
  window.addEventListener('resize', yaz);
  return () => {
    ro?.disconnect();
    window.removeEventListener('resize', yaz);
  };
}

/**
 * Lokanta yerleşimi (sahne yüzdesi). Arka plan çizimi gelince yalnız buradaki satırlar düzeltilir.
 * Yatay: arkada açık mutfak (soldan sağa lavabo, tezgâh, ocak, mermer, servis penceresi + zil + kasa), önde masalar.
 * Yatay sayılar Gemini 'arka/lokanta-yatay' çizimine ölçüldü (2026-10-17): kapı x 2-13 / y 18-67,5; pencere x 15,6-37,8;
 * tezgâh önü y 57-71 (zemin 71'den); lavabo x 39-48, kesme tahtası 47,3-57,2, ocak 57,5-68,5 (davlumbaz y 31,5-36,5),
 * mermer 69-85,5, zil 86,3-88,8, kasa 90-97,5 / y 44,5-56, servis penceresi x 86-95,5 / y 24,5-48; mandal ipi
 * x 40,5-84 / y 34-37; dört masa yeri (açık zemin lekesi) merkez x 13,4 / 37,6 / 62,8 / 86,6, y 79-93.
 * Dikey: mutfak üstte, masalar altta iki sütun (lokanta-dikey çizimi gelince ölçülür).
 */
export interface Yer {
  x: number;
  y: number;
}
export interface Yerlesim {
  kapi: Yer;
  /** müşterinin kapıda beklediği yer (ayak) */
  bekleme: Yer;
  /** masa yuvaları: masanın ön kenarının ortası */
  masalar: Yer[];
  /** istasyon düğmeleri (kutu: x, y sol üst; w, h) */
  istasyon: Record<'lavabo' | 'tezgah' | 'ocak' | 'mermer' | 'servis', { x: number; y: number; w: number; h: number }>;
  /** Kino'nun durduğu yer (servis penceresinin önü, ayak) */
  kino: Yer;
  /** adisyon ipi (sol uç, sağ uç) */
  ip: [Yer, Yer];
  kasa: { x: number; y: number; w: number; h: number };
  /** servis penceresinin tezgâhı: hazır tabaklar burada durur */
  pencere: { x: number; y: number; w: number; h: number };
}

export const YERLESIM: Record<Yon, Yerlesim> = {
  yatay: {
    kapi: { x: 7.5, y: 67.5 },
    bekleme: { x: 8, y: 76 },
    // masaların ön kenarı çizimdeki zemin lekelerinin üstünde (alt kenar 93 telefonda kırpılır: görünen alt ~%91)
    masalar: [
      { x: 37.6, y: 87.5 },
      { x: 62.8, y: 87.5 },
      { x: 86.6, y: 87.5 },
      { x: 13.4, y: 87.5 },
    ],
    // istasyon düğmeleri çizimdeki eşyayı ve tezgâh önünü kaplar (saydam; dokunma alanı). Ocak ve mermer y 48'den
    // başlar: üstlerine mandal ipindeki adisyonlar (y 35,5-51) sarkar, dokunuşu kapmasınlar
    istasyon: {
      lavabo: { x: 39, y: 42, w: 8.4, h: 29 },
      tezgah: { x: 47.4, y: 45, w: 9.9, h: 26 },
      ocak: { x: 57.4, y: 48, w: 11.2, h: 23 },
      mermer: { x: 68.8, y: 48, w: 16.6, h: 23 },
      servis: { x: 85.5, y: 24, w: 10, h: 28 },
    },
    kino: { x: 90, y: 74 },
    // adisyonlar çizimdeki mandal ipinin sağ yarısına asılır (sol yarıda salondaki Mino durur: x 56)
    ip: [
      { x: 59.5, y: 35.5 },
      { x: 84, y: 35.5 },
    ],
    kasa: { x: 90, y: 44, w: 7.5, h: 12.5 },
    // hazır tabaklar mermerin sağ ucunda ve pencere eşiğinde (kasa eşiğin sağını kapatır)
    pencere: { x: 78, y: 44, w: 12, h: 9.5 },
  },
  dikey: {
    kapi: { x: 14, y: 90 },
    bekleme: { x: 22, y: 93 },
    masalar: [
      { x: 30, y: 66 },
      { x: 70, y: 66 },
      { x: 30, y: 85 },
      { x: 70, y: 85 },
    ],
    istasyon: {
      lavabo: { x: 11, y: 22, w: 18, h: 11 },
      tezgah: { x: 30, y: 22, w: 20, h: 11 },
      ocak: { x: 51, y: 22, w: 18, h: 11 },
      mermer: { x: 11, y: 34, w: 18, h: 9 },
      servis: { x: 70, y: 18, w: 19, h: 15 },
    },
    kino: { x: 60, y: 53 },
    ip: [
      { x: 12, y: 11 },
      { x: 68, y: 11 },
    ],
    kasa: { x: 72, y: 35, w: 15, h: 8 },
    pencere: { x: 70, y: 29, w: 19, h: 5 },
  },
};
