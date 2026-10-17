/**
 * İstasyon çizimlerinin (Gemini R-Gün 1: istasyon-tezgah, -ocak, -servis; 2752×1536, üstten) içindeki yerler ve
 * ekrana dönüşümü. Mini oyun tahtasını / tavayı / tabağı çizimdeki tahtaya / ocak gözüne / tabağa oturtur.
 *
 * Arka plan istasyon kabını KAPLAR (cover); yatayda dikey odak `ODAK_Y` (çizimin üstü raf şeridinin altında kalsın
 * diye biraz yukarı kaydırılır), dikeyde çizim 90° saat yönünde döner (istasyon.ts `.rs-ist-donuk`). Yerler çizimin
 * 0-1 kesridir (u: soldan, v: üstten; r: çizim ENİNİN kesri). Yeni çizim gelirse yalnız bu tablo ölçülüp düzeltilir.
 */
import type { Istasyon } from '../mini/arayuz';
import { varlik } from '../varliklar';

/** Gemini istasyon çizimlerinin oranı (2752×1536) */
export const CIZIM_ORAN = 2752 / 1536;

export interface CizimKutu {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
}
export interface CizimDaire {
  u: number;
  v: number;
  /** yarıçap: çizim eninin kesri */
  r: number;
}

/** Çizimlerde ölçülen yerler (piksel tarama: koyu kahve kontur) */
export const CIZIM_YER = {
  /** istasyon-tezgah: kesme tahtasının üst yüzü (x 713-2038, y 328-1274; alt kalınlık 1315'e iner) */
  tahta: { u0: 713 / 2752, v0: 328 / 1536, u1: 2038 / 2752, v1: 1274 / 1536 } satisfies CizimKutu,
  /** istasyon-ocak (R-Gün 2 yenilenmiş çizim): sol ve sağ ocak gözünün döküm ızgarası (merkez, dış yarıçap) */
  ocakSol: { u: 939 / 2752, v: 722 / 1536, r: 350 / 2752 } satisfies CizimDaire,
  ocakSag: { u: 1813 / 2752, v: 722 / 1536, r: 348 / 2752 } satisfies CizimDaire,
  /** istasyon-servis (R-Gün 2 yenilenmiş çizim): ortadaki boş tabağın dış konturu (iç halka r≈385 px) ve soldaki tahta tepsi */
  tabak: { u: 1391 / 2752, v: 816 / 1536, r: 556 / 2752 } satisfies CizimDaire,
  servisTepsi: { u0: 100 / 2752, v0: 450 / 1536, u1: 560 / 2752, v1: 1144 / 1536 } satisfies CizimKutu,
};

/** Arka planın dikey odağı (background-position-y; yalnız çizim kabı aşınca etkili): raf şeridi üstte kalır */
export const ODAK_Y: Partial<Record<Istasyon, number>> = { tezgah: 0.21, ocak: 0.21, servis: 0.33 };

export interface CizimEkrani {
  /** çizim kesri (u, v) → kap pikseli */
  nokta(u: number, v: number): { x: number; y: number };
  /** çizim eninin kesri → kap pikseli (uzunluk) */
  boy(r: number): number;
  /** çizim kutusu → kap kutusu (dikeyde döner: en ↔ boy) */
  kutu(k: CizimKutu): { x: number; y: number; w: number; h: number };
  /** dikeyde çizim döndü mü */
  donuk: boolean;
}

/** Saf: W×H kabında istasyonun çizimi nereye düşer. dikey: kap dik (çizim 90° döner) */
export function cizimEkrani(ist: Istasyon, W: number, H: number): CizimEkrani {
  const donuk = H > W * 1.05;
  // dönmeden önceki kutu (dikeyde en ↔ boy)
  const bw = donuk ? H : W;
  const bh = donuk ? W : H;
  const cw = Math.max(bw, bh * CIZIM_ORAN); // cover: çizimin ekrandaki eni
  const ch = cw / CIZIM_ORAN;
  const ox = (bw - cw) * 0.5;
  const oy = (bh - ch) * (ODAK_Y[ist] ?? 0.5);
  const yerel = (u: number, v: number) => ({ x: ox + u * cw, y: oy + v * ch });
  const nokta = (u: number, v: number) => {
    const p = yerel(u, v);
    if (!donuk) return p;
    // rotate(90deg) kutunun ortasında: (dx, dy) → (-dy, dx)
    return { x: W / 2 - (p.y - bh / 2), y: H / 2 + (p.x - bw / 2) };
  };
  const kutu = (k: CizimKutu) => {
    const a = nokta(k.u0, k.v0);
    const b = nokta(k.u1, k.v1);
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
  };
  return { nokta, boy: (r) => r * cw, kutu, donuk };
}

/** İstasyonun Gemini çizimi geldiyse ekran dönüşümü, gelmediyse null (mini oyun kendi yerleşimini kullanır) */
export function cizimVarsa(ist: Istasyon, W: number, H: number): CizimEkrani | null {
  return varlik(`istasyon/${ist}`) ? cizimEkrani(ist, W, H) : null;
}
