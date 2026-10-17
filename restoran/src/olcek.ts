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

// ================================================================= 3/4 LOKANTA SAHNESİ (P8, §7a-1, §7b, §7d, §7e)
/**
 * SAHNE34: Check Please! esinli, yukarıdan 3/4 açılı diorama. Kamera SABİT: büyütme yok, kaydırma yok.
 *  - Sahne alanı = ekran − HUD (yatayda sağda %15, en az 112 css; dikeyde altta 96 css).
 *  - Resim sahne alanına `contain` ile yerleşir (kırpılmaz); kalan ince şerit HUD'un ahşap rengiyle dolar.
 *  - Boy birimi (Mino = 1): yatayda RESMİN yüksekliğinin %11'i, dikeyde resmin genişliğinin %13'ü. Karakterler resme
 *    göre ölçeklenir (masa, sandalye, kapı çizimde; her cihazda aynı oranda kalsınlar).
 *  - En uzun ayakta karakter (Baba 2,36) resim yüksekliğinin ≤ %26'sı, toplam karakter alanı ≤ %18 (e2e ölçer).
 *  - Küçük karakterler en az ENAZ_BOY34 boyunda (Kino 0,74 / Lokum 0,95 → 1,1): bu ölçekte Kino'nun yüzü ~16 css px kalıyordu
 *    (yüz ≥ 22 css kuralı, §7b). Yetişkinler değişmez.
 * Yerler resmin yüzdesi; çizim gelince yalnız YERLESIM34 satırları ölçülüp düzeltilir.
 */
export const SAHNE34 = {
  birim: { yatay: 0.11, dikey: 0.13 },
  hud: { yatayOran: 0.15, yatayEnAz: 112, dikeyH: 96 },
  oran: { yatay: 2752 / 1536, dikey: 1536 / 2752 },
  sinir: { enUzun: 0.26, toplamAlan: 0.18, yuz: 22 },
} as const;
export const ENAZ_BOY34 = 1.1;

export interface Kutu {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Olcu34 extends Olcu {
  /** HUD paneli (kap koordinatı) */
  hud: Kutu;
  /** sahne alanı (ekran − HUD; resim bunun içinde contain) */
  alan: Kutu;
}

/** Saf: 3/4 sahnenin ölçüsü */
export function olc34(w: number, h: number): Olcu34 {
  const yon: Yon = h > w * 1.05 ? 'dikey' : 'yatay';
  const H = SAHNE34.hud;
  const hw = Math.max(H.yatayEnAz, Math.round(w * H.yatayOran));
  const hud: Kutu = yon === 'yatay' ? { x: w - hw, y: 0, w: hw, h } : { x: 0, y: h - H.dikeyH, w, h: H.dikeyH };
  const alan: Kutu = yon === 'yatay' ? { x: 0, y: 0, w: hud.x, h } : { x: 0, y: 0, w, h: hud.y };
  const oran = SAHNE34.oran[yon];
  let sw = alan.w;
  let sh = sw / oran;
  if (sh > alan.h) {
    sh = alan.h;
    sw = sh * oran;
  }
  const sahne = { x: alan.x + (alan.w - sw) / 2, y: alan.y + (alan.h - sh) / 2, w: sw, h: sh };
  const u = yon === 'yatay' ? sh * SAHNE34.birim.yatay : sw * SAHNE34.birim.dikey;
  return { yon, w, h, u, sahne, hud, alan };
}

/** 1 boy birimi resmin yüzde kaçı (x, y): yalnız yöne bağlı (resim oranı sabit) */
export function birimYuzde(yon: Yon): { x: number; y: number } {
  const o = SAHNE34.oran[yon];
  if (yon === 'yatay') return { x: (SAHNE34.birim.yatay * 100) / o, y: SAHNE34.birim.yatay * 100 };
  return { x: SAHNE34.birim.dikey * 100, y: SAHNE34.birim.dikey * 100 * o };
}

/** 3/4 masa-sandalye ölçüsü (boy birimi; masa-sandalye-34 çizimi gelince ölçülür) */
export const MASA34 = {
  /** masanın eni ve sprite yüksekliği */
  w: 2.5,
  /** bahçe masası (beyaz demir, iki kişilik ama dar: terasın iki yeri yan yana) */
  bahceW: 1.75,
  h: 1.15,
  /** oturanın ön kolları: masa üstünün ARKA kenarının hemen üstü (gövdesi masanın üstünden görünür; kısalar yükseltilmiş
   *  sandalyede) ve üst yüzün ön kenarının altı (oturan buradan aşağı kırpılır, bacaklar asla görünmez) */
  ustOrta: 1.1,
  kesik: 0.6,
  /** sandalye: masanın ayak çizgisinden ne kadar geride (yukarıda), eni, boyu; iki kişilikte yanlara açılır */
  sandalyeGeri: 0.32,
  sandalyeW: 1.0,
  sandalyeH: 1.5,
  ikiliAra: 0.62,
  /** masa izdüşümü (engel): ayak çizgisinden yukarı derinlik */
  derinlik: 0.42,
} as const;

/** Baş boyu / figür boyu: yavrular iri kafalı, yetişkinler 3,5-3,7 kafa (e2e yüz ölçüsü, §7b) */
export const BAS_ORANI = (boy: number) => (boy < 1.6 ? 0.46 : 0.27);

export interface Yerlesim34 extends Yerlesim {
  /** sıradaki 3 bekleme noktası (0 kapıya en yakın) ve yolun başı (fazlası) */
  sira: Yer[];
  yolBasi: Yer[];
  /** sahneye giriş / çıkış noktası (resmin dışı) */
  giris: Yer;
  /** bahçe kapısı (çit) */
  bahceKapisi: Yer;
  bahce: { masalar: Yer[]; mangal: Kutu };
  /** süs yuvaları (yerlesim.ts SUS_YER anahtarları) */
  sus: Record<string, Yer>;
  /** mutfağa gelen aletlerin boş yerleri */
  alet: Kutu[];
  /** salondaki Mino ve Babaanne'nin durduğu yer */
  mino: Yer;
  babaanne: Yer;
  /** müşteri panosu, Babaanne'nin fotoğrafı */
  pano: Kutu;
  foto: Kutu;
  /** yürüme yolu düğümleri (koridorlar); kenarlar sahne34.ts'te görüş hattından */
  yol: Record<string, Yer>;
  /** sabit engeller (tezgâh, çit, çeşme): yürüyen içinden geçmez */
  engel: Kutu[];
}

/**
 * Yerleşim (resim yüzdesi). §11h #65 istemine göre: solda %55 içerisi (arka duvarda açık mutfak, ön solda cam kapı ve
 * kasa, dört masa yeri), sağda %45 bahçe (çit, kapı, ahşap teras, asma, çeşme). Kapının önünde kıvrık taş yol: sıra.
 * GEMINI ÇİZİMİ GELİNCE ÖLÇÜLÜR (şimdilik yer tutucu dioramanın yerleri; restoran/src/lokanta/sahne34.css).
 */
export const YERLESIM34: Record<Yon, Yerlesim34> = {
  // Gemini #65 lokanta-34-yatay (2026-10-17) üstünde ölçüldü: yüzer diorama (çevresi krem), arka duvarda mutfak
  // (lavabo x 13,4-22,6, kesme tezgâhı 22,6-33, ocak 33-41,5 + bakır davlumbaz, mermer 41,5-54,3; tezgâh önü y 46,5),
  // servis penceresi x 55,3-65 / y 17-35 (zil 62/31), iki mandal ipi (x 22,5-33,5 ve 41-54,5; y 8,5), ön solda cam kapı
  // (açık kanat x 10,5-17 / y 54-86; eşik 13,5/85), pirinç kasa kutunun üstünde (x 19,9-29,1 / y 68,6-88,5), taş yol
  // kapıdan sol alt köşeye (11,6/84,6 → 0/100), dört halı (masa yeri) merkez 24,7/58,2 · 54/58,2 · 35,9/78,7 · 54/78,7;
  // zeminin ön kenarı y 88,5. Bahçe x 66-99: solda çalı + çit (y 54'ten aşağı), arkada ahşap teras x 67,5-89 / y 39,6-56,3
  // (iki boş yer 74/46,5 ve 82,8/47), çardak, çeşme x 77-86,5 / y 61,5-74, sol altta çiçekler, ön çitte kapı x 77,6-85.
  yatay: {
    kapi: { x: 13.5, y: 85 },
    bekleme: { x: 11.8, y: 87.5 },
    masalar: [
      { x: 24.7, y: 59.8 },
      { x: 54, y: 59.8 },
      { x: 36.5, y: 80.5 },
      { x: 54, y: 80.5 },
    ],
    istasyon: {
      lavabo: { x: 13.3, y: 29, w: 9.3, h: 17.5 },
      tezgah: { x: 22.6, y: 29, w: 10.4, h: 17.5 },
      ocak: { x: 33, y: 27, w: 8.5, h: 19.5 },
      mermer: { x: 41.5, y: 31, w: 12.8, h: 15.5 },
      servis: { x: 55.3, y: 17, w: 10, h: 17 },
    },
    kino: { x: 64.5, y: 50 },
    ip: [
      { x: 22.5, y: 8.5 },
      { x: 54.5, y: 8.5 },
    ],
    kasa: { x: 19.9, y: 68.6, w: 9.2, h: 19.9 },
    pencere: { x: 55.5, y: 27, w: 9.5, h: 7 },
    sira: [
      { x: 11.8, y: 87.5 },
      { x: 8.4, y: 92.8 },
      { x: 4.8, y: 97.5 },
    ],
    yolBasi: [
      { x: 16.5, y: 98.5 },
      { x: 22.5, y: 99.5 },
    ],
    giris: { x: -5, y: 104 },
    bahceKapisi: { x: 67, y: 47 },
    bahce: {
      masalar: [
        { x: 73.2, y: 49.3 },
        { x: 84.3, y: 49.3 },
      ],
      mangal: { x: 68.5, y: 55.5, w: 7.5, h: 12 },
    },
    sus: {
      'tavan-1': { x: 40, y: 1.5 },
      'tavan-2': { x: 58, y: 1.5 },
      'duvar-1': { x: 48, y: 13.5 },
      'duvar-2': { x: 17, y: 3 },
      'zemin-1': { x: 63.5, y: 87 },
      'zemin-2': { x: 15.5, y: 52.5 },
      'zemin-3': { x: 45.5, y: 88 },
    },
    alet: [
      { x: 55.5, y: 33.5, w: 4.8, h: 12 },
      { x: 12.5, y: 40, w: 5.5, h: 12 },
    ],
    mino: { x: 47, y: 46 },
    babaanne: { x: 45, y: 70 },
    pano: { x: 6.5, y: 9, w: 5.5, h: 10 },
    foto: { x: 49, y: 13.5, w: 4, h: 7 },
    yol: {
      kapiIc: { x: 18, y: 84 },
      solOrta: { x: 18.5, y: 67 },
      orta: { x: 45, y: 67 },
      sagOrta: { x: 63.5, y: 67 },
      solUst: { x: 16, y: 50 },
      ortaUst: { x: 39.5, y: 50 },
      sagUst: { x: 63.5, y: 50 },
      ortaAlt: { x: 45, y: 86 },
      sagAlt: { x: 63.5, y: 86 },
      bahceGiris: { x: 67, y: 47 },
      bahceArka: { x: 67.5, y: 41.5 },
      bahceUst: { x: 72, y: 58 },
      bahceAlt: { x: 76, y: 76 },
      bahceSag: { x: 88, y: 60 },
    },
    engel: [
      // mutfak (arka duvar ve tezgâh), sol duvar (pencereler), açık kapı kanadı, kasa kutusu
      { x: 0, y: 0, w: 66, h: 46 },
      { x: 0, y: 40, w: 9.5, h: 48 },
      { x: 10.5, y: 55, w: 6, h: 28 },
      { x: 20, y: 76, w: 9, h: 12.5 },
      // bahçe: çit (arkası ve solu; terasa geçit y 41-53), çeşme, çiçekler, ağaç gövdeleri, çiçek kutusu, ön çit
      { x: 66, y: 0, w: 34, h: 39 },
      { x: 65.5, y: 53, w: 3, h: 37 },
      { x: 77.5, y: 62.5, w: 8.5, h: 11 },
      { x: 66.5, y: 69, w: 8.5, h: 11 },
      { x: 89.5, y: 45, w: 5.5, h: 10.5 },
      { x: 92.5, y: 70, w: 3, h: 12 },
      { x: 66, y: 79, w: 34, h: 3 },
    ],
  },
  dikey: {
    kapi: { x: 6, y: 47 },
    bekleme: { x: 12, y: 53.5 },
    masalar: [
      { x: 41, y: 37 },
      { x: 77, y: 37 },
      { x: 41, y: 55 },
      { x: 77, y: 55 },
    ],
    istasyon: {
      lavabo: { x: 4, y: 7, w: 15, h: 12 },
      tezgah: { x: 19.5, y: 7, w: 15, h: 12 },
      ocak: { x: 35, y: 4.5, w: 16, h: 14.5 },
      mermer: { x: 57, y: 7, w: 14, h: 12 },
      servis: { x: 72, y: 3, w: 17, h: 16 },
    },
    kino: { x: 82, y: 25 },
    ip: [
      { x: 24, y: 2 },
      { x: 70, y: 2 },
    ],
    kasa: { x: 2, y: 33, w: 12, h: 6.5 },
    pencere: { x: 72, y: 17.5, w: 17, h: 4 },
    sira: [
      { x: 12, y: 53.5 },
      { x: 9, y: 60 },
      { x: 15, y: 66 },
    ],
    yolBasi: [
      { x: 6, y: 69.5 },
      { x: 20, y: 71 },
    ],
    giris: { x: -14, y: 66 },
    bahceKapisi: { x: 50, y: 73.5 },
    bahce: {
      masalar: [
        { x: 34, y: 87 },
        { x: 74, y: 93 },
      ],
      mangal: { x: 78, y: 75, w: 17, h: 8 },
    },
    sus: {
      'tavan-1': { x: 30, y: 0.5 },
      'tavan-2': { x: 62, y: 0.5 },
      'duvar-1': { x: 54, y: 1.5 },
      'duvar-2': { x: 92, y: 1.5 },
      'zemin-1': { x: 94, y: 46 },
      'zemin-2': { x: 59, y: 69 },
      'zemin-3': { x: 26, y: 28 },
    },
    alet: [
      { x: 51, y: 7, w: 6, h: 12 },
      { x: 89, y: 7, w: 10, h: 12 },
    ],
    mino: { x: 60, y: 24 },
    babaanne: { x: 59, y: 47 },
    pano: { x: 20, y: 1, w: 12, h: 5 },
    foto: { x: 90, y: 1, w: 8, h: 4 },
    yol: {
      kapiIc: { x: 14, y: 47 },
      solUst: { x: 22, y: 26 },
      ortaUst: { x: 59, y: 26 },
      sagUst: { x: 93, y: 26 },
      solOrta: { x: 22, y: 46 },
      orta: { x: 59, y: 46 },
      sagOrta: { x: 93, y: 46 },
      solAlt: { x: 22, y: 66 },
      ortaAlt: { x: 59, y: 66 },
      sagAlt: { x: 93, y: 66 },
      bahceGiris: { x: 50, y: 77 },
      bahceSol: { x: 12, y: 80 },
      bahceSag: { x: 94, y: 84 },
      bahceAlt: { x: 54, y: 97 },
    },
    engel: [
      { x: 0, y: 0, w: 100, h: 21 },
      { x: 0, y: 72, w: 46, h: 1.2 },
      { x: 55, y: 72, w: 45, h: 1.2 },
      { x: 6, y: 86, w: 12, h: 7 },
    ],
  },
};

/** 3/4 sahne: kaba ölçüyü yazar (--rs-u, --rs-u0, data-yon, sahne kutusu); değişince yeniden. Bırakma fonksiyonu döner */
export function olcuIzle34(kap: HTMLElement, sahne: HTMLElement, degisti: (o: Olcu34) => void): () => void {
  let son = '';
  const yaz = () => {
    const o = olc34(kap.clientWidth, kap.clientHeight);
    const anahtar = `${o.w}x${o.h}`;
    if (!o.w || anahtar === son) return;
    son = anahtar;
    kap.dataset.yon = o.yon;
    kap.style.setProperty('--rs-u', `${o.u.toFixed(2)}px`);
    kap.style.setProperty('--rs-u0', `${o.u.toFixed(2)}px`);
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
